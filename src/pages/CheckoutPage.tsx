import React, { useEffect, useState } from 'react';
import { Seo } from '../components/Seo';
import { wooApi, WooCart } from '../services/woo';
import { Lock, CreditCard, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import Select from 'react-select';

export const CheckoutPage = () => {
  const [cart, setCart] = useState<WooCart | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any>(null);
  
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  
  const SAVED_BILLING_KEY = 'WOO_SAVED_BILLING_INFO';
  
  const [billing, setBilling] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_BILLING_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to parse saved billing info");
    }
    return {
      first_name: '', last_name: '', company: '', address_1: '', address_2: '',
      city: '', state: '', postcode: '', country: '', email: '', phone: ''
    };
  });

  useEffect(() => {
    localStorage.setItem(SAVED_BILLING_KEY, JSON.stringify(billing));
  }, [billing]);

  useEffect(() => {
    wooApi.getCart().then((c) => {
      setCart(c);
      if (c && c.items && c.items.length > 0) {
        sessionStorage.removeItem('woo_pending_payment_url');
      }
    });
    wooApi.getCurrentUser().then(user => {
      if (user) {
        // If logged in, we check if we should override local billing with profile billing
        setBilling(prev => {
          // If local billing is mostly empty, or if we want to sync with profile
          // A good compromise: use profile if local is empty OR if we are doing a "fresh" load
          const isLocalEmpty = !prev.address_1 && !prev.city;
          
          if (isLocalEmpty || !localStorage.getItem(SAVED_BILLING_KEY)) {
            return {
              ...prev,
              first_name: user.first_name || prev.first_name || '',
              last_name: user.last_name || prev.last_name || '',
              email: user.email || prev.email || '',
              phone: user.billing?.phone || prev.phone || '',
              ...(user.billing || {})
            };
          }
          return prev;
        });
      }
    });
    wooApi.getCountries().then(fetchedCountries => {
       setCountries(fetchedCountries);
       // Re-run state lookup once countries and initial billing are set
       const currentBilling = billing; // this might be stale in closure, but state setter will handle it
    });
  }, []);

  // Sync states when billing.country changes
  useEffect(() => {
    if (countries.length > 0 && billing.country) {
      const country = countries.find((c: any) => c.code === billing.country);
      if (country && country.states) {
        setStates(country.states);
      } else {
        setStates([]);
      }
    }
  }, [billing.country, countries]);

  // Fetch shipping options based on country/state
  useEffect(() => {
    let isMounted = true;
    const fetchShipping = async () => {
      try {
        const zones = await wooApi.getShippingZones();
        let matchedZoneId = 0; // Default to 'Rest of the World'

        if (billing.country) {
          // Attempt to find a precise zone for the selected country
          // In WooCommerce API, to see locations for a zone you have to query /locations
          // For simplicity without hitting /locations for every zone, we pick zone 0 (fallback)
          // unless your store has a specific plugin endpoint. We will just load zone 0 
          // or zone 1 as fallback for demonstration.
          // In a production app, you might fetch locations of each zone if zones amount is small.
          for (const zone of zones) {
             if (zone.id !== 0) {
                // If we want accurate zones we'd fetch locations. But here we just assume zone 0 represents available options, or fetch the first explicit zone's methods.
                // Let's just fetch the first explicit zone's methods if it exists and has methods for simplicity, otherwise zone 0.
                matchedZoneId = zone.id;
                break;
             }
          }
        }
        
        let methods = await wooApi.getShippingZoneMethods(matchedZoneId);
        if (methods.length === 0 && matchedZoneId !== 0) {
           methods = await wooApi.getShippingZoneMethods(0);
        }

        if (isMounted) {
           setShippingMethods(methods.filter((m: any) => m.enabled));
           if (methods.length > 0) {
             setSelectedShippingMethod(methods.find((m: any) => m.enabled) || null);
           }
        }
      } catch (err) {
        console.error("Failed to load shipping methods", err);
      }
    };
    fetchShipping();
    return () => { isMounted = false; };
  }, [billing.country]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const newCart = await wooApi.applyCoupon(couponCode);
      setCart(newCart);
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async (code: string) => {
    const newCart = await wooApi.removeCoupon(code);
    setCart(newCart);
  };

  const handleCountryChange = (selectedOption: any) => {
    updateBilling('country', selectedOption ? selectedOption.value : '');
    updateBilling('state', ''); // Reset state when country changes
    
    // Find states for selected country
    const country = countries.find(c => c.code === (selectedOption?.value));
    if (country && country.states) {
      setStates(country.states);
    } else {
      setStates([]);
    }
  };

  const handleStateChange = (selectedOption: any) => {
    updateBilling('state', selectedOption ? selectedOption.value : '');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // If the user already created an order and clicked back from the payment page,
    // we can securely resume the payment redirection.
    const pendingUrl = sessionStorage.getItem('woo_pending_payment_url');
    if (pendingUrl) {
      window.location.href = pendingUrl;
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const order = await wooApi.clearCartAndCreateOrder({
        billing,
        shipping: billing, // simplified, just copy billing for now
        payment_method: 'checkout',
        payment_method_title: 'Continue to Payment',
        shipping_lines: selectedShippingMethod ? [{
          method_id: selectedShippingMethod.method_id,
          method_title: selectedShippingMethod.title,
          total: selectedShippingMethod.settings?.cost?.value || '0.00'
        }] : []
      });
      
      if (order && order.id) {
         const token = localStorage.getItem('woo_token');
         const finalPaymentUrl = order.payment_url ? (token ? `${order.payment_url}&token=${token}` : order.payment_url) : '';

         if (order.needs_payment && finalPaymentUrl) {
           sessionStorage.setItem('woo_pending_payment_url', finalPaymentUrl);
           window.location.href = finalPaymentUrl;
         } else if (finalPaymentUrl) {
           sessionStorage.setItem('woo_pending_payment_url', finalPaymentUrl);
           window.location.href = finalPaymentUrl;
         } else {
           setCreatedOrder(order);
           setIsSuccess(true);
         }
      } else {
         setError('Failed to create order, please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  const updateBilling = (field: string, value: string) => {
    setBilling(prev => ({ ...prev, [field]: value }));
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Seo title="Order Complete" description="Your order has been placed." />
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-20 h-20 bg-green-50 flex items-center justify-center rounded-full mx-auto mb-6">
            <Lock className="text-green-500" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Received!</h1>
          <p className="text-slate-500 mb-8 text-lg">Thank you for your purchase.</p>

          {createdOrder && (
            <div className="bg-slate-50 p-6 rounded-xl text-left border border-slate-200 mb-8 font-medium">
              <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-4">Order Details</h2>
              <div className="grid grid-cols-2 gap-y-4 text-slate-700">
                <div className="text-slate-500">Order Number:</div>
                <div className="font-bold text-slate-900 text-right">#{createdOrder.id}</div>
                <div className="text-slate-500">Date:</div>
                <div className="text-right">{new Date(createdOrder.date_created || Date.now()).toLocaleDateString()}</div>
                
                {createdOrder.discount_total && createdOrder.discount_total !== '0.00' && parseFloat(createdOrder.discount_total) > 0 && (
                  <>
                    <div className="text-slate-500">Discount:</div>
                    <div className="text-right text-green-600">-${createdOrder.discount_total}</div>
                  </>
                )}

                <div className="text-slate-500">Total:</div>
                <div className="font-bold text-slate-900 text-right">${createdOrder.total}</div>
              </div>

              {createdOrder.line_items && createdOrder.line_items.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                   <h3 className="font-bold text-slate-900 mb-3">Items</h3>
                   <ul className="space-y-2">
                     {createdOrder.line_items.map((item: any) => (
                       <li key={item.id} className="flex justify-between text-slate-700">
                         <span>{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
                         <span>${item.total}</span>
                       </li>
                     ))}
                   </ul>
                </div>
              )}
            </div>
          )}

          <Link to="/" className="inline-block bg-brand-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-secondary transition-colors shadow-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Seo title="Checkout" description="Secure checkout." />
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Cart is empty</h1>
          <p className="text-slate-500 mb-8">You need to add some products to your cart before proceeding to checkout.</p>
          <Link to="/" className="inline-block bg-brand-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-secondary transition-colors">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-slate-50 min-h-screen">
      <Seo title="Checkout" description="Secure checkout." />
      
      <div className="flex items-center justify-center mb-8 gap-2 text-brand-primary">
        <Lock size={24} />
        <h1 className="text-2xl font-bold">Secure Checkout</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-7xl mx-auto">
        <div>
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Billing Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                  <input type="email" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Please enter a valid email address" value={billing.email} onChange={e => updateBilling('email', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                  <input type="tel" required pattern="^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$" title="Please enter a valid phone number" value={billing.phone} onChange={e => updateBilling('phone', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                  <input type="text" required value={billing.first_name} onChange={e => updateBilling('first_name', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                  <input type="text" required value={billing.last_name} onChange={e => updateBilling('last_name', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Company Name</label>
                  <input type="text" value={billing.company} onChange={e => updateBilling('company', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Country</label>
                  <Select
                    options={countries.map(c => ({ value: c.code, label: c.name }))}
                    value={countries.find(c => c.code === billing.country) ? { value: billing.country, label: countries.find(c => c.code === billing.country)?.name } : null}
                    onChange={handleCountryChange}
                    isSearchable
                    placeholder="Select a country..."
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Street address</label>
                  <input type="text" required value={billing.address_1} onChange={e => updateBilling('address_1', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary mb-2" placeholder="House number and street name" />
                  <input type="text" value={billing.address_2} onChange={e => updateBilling('address_2', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" placeholder="Apartment, suite, unit, etc. (optional)" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                  <input type="text" required value={billing.city} onChange={e => updateBilling('city', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">State / County</label>
                  {states.length > 0 ? (
                    <Select
                      options={states.map(s => ({ value: s.code, label: s.name }))}
                      value={states.find(s => s.code === billing.state) ? { value: billing.state, label: states.find(s => s.code === billing.state)?.name } : null}
                      onChange={handleStateChange}
                      isSearchable
                      placeholder="Select a state..."
                      required
                    />
                  ) : (
                    <input type="text" required value={billing.state} onChange={e => updateBilling('state', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Postcode / ZIP</label>
                  <input type="text" required value={billing.postcode} onChange={e => updateBilling('postcode', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium border border-red-200">
                {error}
              </div>
            )}
          </form>
        </div>

        <div>
          <div className="bg-white p-6 rounded-xl border border-brand-primary/20 shadow-md sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.items.map(item => (
                <div key={item.key} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded border border-slate-100 overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow text-sm">
                    <div className="font-bold text-slate-900 line-clamp-1">{item.name}</div>
                    <div className="text-slate-500 font-medium">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-black text-slate-900">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4 text-sm font-medium text-slate-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${(parseFloat(cart.totals.total_price) + parseFloat(cart.totals.total_discount || '0')).toFixed(2)}</span>
              </div>
              
              {cart.coupons && cart.coupons.length > 0 && (
                <div className="space-y-1">
                  {cart.coupons.map((c, i) => (
                    <div key={i} className="flex justify-between text-green-600">
                      <div className="flex items-center gap-1">
                        <span>Coupon: {c.code}</span>
                        <button type="button" onClick={() => handleRemoveCoupon(c.code)} className="text-red-500 hover:text-red-700 font-bold ml-1">×</button>
                      </div>
                      <span>-${c.discount}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-bold text-slate-900 mb-2">Shipping</h3>
                {shippingMethods.length > 0 ? (
                  <div className="space-y-2">
                    {shippingMethods.map(method => (
                      <label key={method.id} className="flex items-start gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg group">
                        <input 
                          type="radio" 
                          name="shipping_method" 
                          checked={selectedShippingMethod?.id === method.id}
                          onChange={() => setSelectedShippingMethod(method)}
                          className="mt-0.5 text-brand-primary focus:ring-brand-primary"
                        />
                        <div className="flex-grow">
                          <div className="font-bold text-slate-900 leading-tight">{method.title}</div>
                          {method.method_description && (
                            <div className="text-xs text-slate-500 mt-0.5" dangerouslySetInnerHTML={{ __html: method.method_description }} />
                          )}
                        </div>
                        <div className="font-bold text-slate-900">
                           {method.settings?.cost?.value ? `$${parseFloat(method.settings.cost.value).toFixed(2)}` : 'Free'}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 italic text-sm">Please enter a valid address to view shipping options.</div>
                )}
              </div>

              <div className="flex justify-between text-lg font-black text-slate-900 pt-4 border-t border-slate-100">
                <span>Total</span>
                <span>${(parseFloat(cart.totals.total_price) + (selectedShippingMethod?.settings?.cost?.value ? parseFloat(selectedShippingMethod.settings.cost.value) : 0)).toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Coupon code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm"
                />
                <button 
                  type="button" 
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors shrink-0 flex items-center justify-center gap-2"
                >
                  {applyingCoupon ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
              {couponError && <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>}
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full bg-brand-primary text-white font-bold text-lg py-4 rounded-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Processing...
                </>
              ) : `Continue to Payment ($${(parseFloat(cart.totals.total_price) + (selectedShippingMethod?.settings?.cost?.value ? parseFloat(selectedShippingMethod.settings.cost.value) : 0)).toFixed(2)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

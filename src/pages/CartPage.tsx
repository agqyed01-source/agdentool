import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { wooApi, WooCart } from '../services/woo';
import { Trash2, ShoppingBag } from 'lucide-react';

export const CartPage = () => {
  const [cart, setCart] = useState<WooCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    wooApi.getCart().then(data => {
      setCart(data);
      setLoading(false);
    });
  }, []);

  const handleRemove = async (key: string) => {
    const newCart = await wooApi.removeFromCart(key);
    setCart(newCart);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Seo title="Shopping Cart" description="Your shopping cart is empty." />
        <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-full mx-auto mb-6">
          <ShoppingBag className="text-slate-300" size={48} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Your Cart is Empty</h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">Looks like you haven't added any products to your cart yet. Browse our professional supplies.</p>
        <Link to="/" className="inline-block bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-secondary transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Seo title="Shopping Cart" description="View and edit your shopping cart." />
      
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.key} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <Link to={`/product/${item.id}`} className="font-bold text-slate-900 hover:text-brand-primary">{item.name}</Link>
                  <button 
                    onClick={() => handleRemove(item.key)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="text-sm font-bold text-slate-900 mb-auto">${item.price}</div>
                <div className="flex justify-between pt-4 mt-auto border-t border-slate-50">
                  <div className="text-xs text-slate-500 font-bold uppercase">Qty: {item.quantity}</div>
                  <div className="text-sm font-black text-brand-primary">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
          
          <div className="flex justify-between mb-4 text-slate-600 font-medium">
            <span>Subtotal ({cart.totals.total_items} items)</span>
            <span>${(parseFloat(cart.totals.total_price) + parseFloat(cart.totals.total_discount || '0')).toFixed(2)}</span>
          </div>

          {cart.coupons && cart.coupons.length > 0 && (
            <div className="mb-4 space-y-2 border-b border-slate-200 pb-4">
              {cart.coupons.map((c, i) => (
                <div key={i} className="flex justify-between items-center text-green-600 text-sm font-medium">
                   <div className="flex items-center gap-2">
                     <span>Coupon: {c.code}</span>
                     <button onClick={() => handleRemoveCoupon(c.code)} className="text-red-500 hover:text-red-700 font-bold" title="Remove Coupon">×</button>
                   </div>
                   <span>-${c.discount}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between mb-6 text-slate-600 font-medium">
            <span>Shipping</span>
            <span className="text-brand-primary">Calculated in checkout</span>
          </div>
          
          <div className="border-t border-slate-200 pt-4 mb-8 flex justify-between items-center text-lg font-black text-slate-900">
            <span>Total</span>
            <span>${cart.totals.total_price}</span>
          </div>

          <form onSubmit={handleApplyCoupon} className="mb-6">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Coupon code" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm"
              />
              <button 
                type="submit" 
                disabled={applyingCoupon || !couponCode.trim()}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors shrink-0"
              >
                {applyingCoupon ? '...' : 'Apply'}
              </button>
            </div>
            {couponError && <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>}
          </form>

          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-brand-primary text-white font-bold py-4 rounded-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all text-center"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

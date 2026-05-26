import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { wooApi } from '../services/woo';
import { Seo } from '../components/Seo';
import { Loader2, ArrowLeft, Package, Clock, MapPin, Truck } from 'lucide-react';

export const OrderPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      setLoading(true);
      wooApi.getOrder(id)
        .then(data => {
          if (data) {
            setOrder(data);
          } else {
            setError('Order not found');
          }
        })
        .catch(() => setError('Failed to load order'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (order && window.gtag) {
      const trackedKey = `ga_tracked_order_${order.id}`;
      if (!sessionStorage.getItem(trackedKey)) {
        window.gtag('event', 'purchase', {
          transaction_id: order.id.toString(),
          currency: 'USD',
          value: parseFloat(order.total || '0'),
          items: order.line_items?.map((item: any) => ({
            item_id: item.product_id?.toString(),
            item_name: item.name,
            price: parseFloat(item.price || item.total || '0'),
            quantity: item.quantity
          }))
        });
        sessionStorage.setItem(trackedKey, 'true');
      }
    }
  }, [order]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary mb-4" />
        <p className="text-slate-500 font-medium">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl font-medium mb-6">
          {error || 'Order not found'}
        </div>
        <Link to="/account" className="inline-flex items-center gap-2 text-brand-primary font-bold hover:underline">
          <ArrowLeft size={16} /> Back to My Account
        </Link>
      </div>
    );
  }

  const isPaid = order.status === 'completed' || order.status === 'processing';
  const token = localStorage.getItem('woo_token');
  const finalPaymentUrl = order.payment_url ? (token ? `${order.payment_url}&token=${token}` : order.payment_url) : '';

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
      <Seo title={`Order #${order.id}`} description={`Details for order #${order.id}`} />
      
      <div className="mb-8">
        <Link to="/account" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-primary font-bold mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            Order #{order.id}
            <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              <Clock size={14} /> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </h1>
          <div className="text-slate-500 font-medium">
            Placed on {new Date(order.date_created).toLocaleDateString()} at {new Date(order.date_created).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="text-slate-400" size={20} /> Items Ordered
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {order.line_items.map((item: any) => (
                <div key={item.id} className="p-6 flex flex-wrap sm:flex-nowrap gap-4 items-center">
                  {item.image && item.image.src && (
                     <div className="w-20 h-20 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden shrink-0">
                       <img src={item.image.src} alt={item.name} className="w-full h-full object-cover" />
                     </div>
                  )}
                  <div className="flex-grow">
                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                    {item.meta_data && item.meta_data.length > 0 && (
                      <div className="text-slate-500 text-xs mt-0.5">
                        {item.meta_data.map((m: any) => `${m.key}: ${m.value}`).join(', ')}
                      </div>
                    )}
                    <div className="text-slate-500 text-sm mt-1">Quantity: {item.quantity}</div>
                  </div>
                  <div className="font-bold text-slate-900 text-lg">
                    ${parseFloat(item.total).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Truck className="text-slate-400" size={20} /> Delivery Information
              </h2>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-8">
               <div>
                  <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Shipping Address</h3>
                  <div className="text-slate-600 text-sm leading-relaxed">
                    {order.shipping.first_name} {order.shipping.last_name}<br/>
                    {order.shipping.company && <>{order.shipping.company}<br/></>}
                    {order.shipping.address_1}<br/>
                    {order.shipping.address_2 && <>{order.shipping.address_2}<br/></>}
                    {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}<br/>
                    {order.shipping.country}
                  </div>
               </div>
               <div>
                  <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Billing Address</h3>
                  <div className="text-slate-600 text-sm leading-relaxed">
                    {order.billing.first_name} {order.billing.last_name}<br/>
                    {order.billing.company && <>{order.billing.company}<br/></>}
                    {order.billing.address_1}<br/>
                    {order.billing.address_2 && <>{order.billing.address_2}<br/></>}
                    {order.billing.city}, {order.billing.state} {order.billing.postcode}<br/>
                    {order.billing.country}
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6 font-sans">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6 pb-6 border-b border-slate-100">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal</span>
                  <span className="text-slate-900">${order.total}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Shipping</span>
                  <span className="text-slate-900">{order.shipping_total && parseFloat(order.shipping_total) > 0 ? `$${order.shipping_total}` : 'Free'}</span>
                </div>
                {order.discount_total && parseFloat(order.discount_total) > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-${order.discount_total}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Tax</span>
                  <span className="text-slate-900">${order.total_tax}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-lg font-black text-slate-900 mb-2">
                <span>Total</span>
                <span>${order.total}</span>
              </div>
              {order.payment_method_title && (
                <div className="text-slate-500 text-sm text-right">
                  via {order.payment_method_title}
                </div>
              )}
            </div>
            
            {order.needs_payment && finalPaymentUrl && (
              <div className="bg-amber-50 p-6 border-t border-amber-200">
                 <p className="text-amber-800 text-sm mb-4 font-medium">This order is awaiting payment.</p>
                 <a 
                   href={finalPaymentUrl}
                   onClick={() => sessionStorage.setItem('woo_pending_payment_url', finalPaymentUrl)}
                   className="block w-full text-center bg-brand-primary text-white py-3 px-4 rounded-xl font-bold hover:bg-brand-secondary transition-colors"
                 >
                   Pay Now
                 </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

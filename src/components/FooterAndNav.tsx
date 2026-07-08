import React, { useEffect, useState } from 'react';
import { Home, Grid, Search, ShoppingBag, User, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { wooApi } from '../services/woo';

export const WhatsAppAgents = () => {
  const agents = [
    { name: 'Sarah Chen', role: 'Support Specialist', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150', phone: '447724034681' },
    { name: 'Dr. Mike', role: 'Equipment Specialist', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150&h=150', phone: '447856364969' },
    { name: 'Emma Wilson', role: 'Bulk Orders', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150', phone: '447724023062' },
    { name: 'James Kim', role: 'Technical Service', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150', phone: '447591234176' },
  ];

  return (
    <section className="bg-white py-12 border-t border-slate-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Expert Support</h2>
          <p className="text-slate-500">Chat directly with our specialists on WhatsApp for instant assistance.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {agents.map((agent, idx) => (
            <a 
              key={idx}
              href={`https://wa.me/${agent.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 sm:gap-4 p-3 lg:p-4 rounded-xl border border-slate-200 hover:border-[#25D366] hover:shadow-sm transition-all group bg-slate-50 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-12 h-12 lg:w-16 lg:h-16 bg-[#25D366]/5 rounded-bl-[100px] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative shrink-0">
                <img src={agent.avatar} alt={agent.name} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute bottom-0 right-0 w-3 lg:w-3.5 h-3 lg:h-3.5 bg-[#25D366] border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 leading-tight group-hover:text-[#25D366] transition-colors text-sm lg:text-base truncate">{agent.name}</p>
                <p className="text-[9px] lg:text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">{agent.role}</p>
              </div>
              <div className="hidden sm:flex shrink-0 w-8 lg:w-10 h-8 lg:h-10 rounded-full bg-white shadow-sm border border-slate-100 text-[#25D366] items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                 <MessageCircle className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export const MobileBottomNav = () => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    wooApi.getCart().then(cart => setCartCount(cart.totals.total_items));
    const intervalId = setInterval(() => {
      wooApi.getCart().then(cart => setCartCount(cart.totals.total_items));
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 flex items-center justify-around py-2 px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <Link to="/" className="flex flex-col items-center gap-1 p-1 text-slate-400 hover:text-brand-primary">
        <Home size={20} />
        <span className="text-[10px] font-bold">Home</span>
      </Link>
      <Link to="/category/featured" className="flex flex-col items-center gap-1 p-1 text-slate-400 hover:text-brand-primary">
        <Grid size={20} />
        <span className="text-[10px] font-bold">Catalogue</span>
      </Link>
      <button onClick={() => window.dispatchEvent(new Event('toggleMobileSearch'))} className="flex flex-col items-center gap-1 p-1 text-slate-400 hover:text-brand-primary">
        <Search size={20} />
        <span className="text-[10px] font-bold">Search</span>
      </button>
      <Link to="/cart" className="flex flex-col items-center gap-1 p-1 text-slate-400 hover:text-brand-primary relative">
        {cartCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-brand-primary text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white leading-none">
            {cartCount}
          </div>
        )}
        <ShoppingBag size={20} />
        <span className="text-[10px] font-bold">Cart</span>
      </Link>
      <Link to="/account" className="flex flex-col items-center gap-1 p-1 text-slate-400 hover:text-brand-primary">
        <User size={20} />
        <span className="text-[10px] font-bold">Account</span>
      </Link>
    </div>
  );
};

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const cf7Id = (import.meta as any).env.VITE_WOO_CF7_ID || '123'; // Default ID if not set

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await wooApi.submitCF7(cf7Id, { 'your-email': email });
      if (res.status === 'mail_sent') {
        setStatus('success');
        setMessage(res.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(res.message || 'Something went wrong. Please try again.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Connection failed.');
    }
  };

  return (
    <section className="bg-gray-100 py-12 md:py-20 border-t border-gray-200">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay updated with Industry Insights</h2>
          <p className="text-gray-500 mb-8">Join 5,000+ professionals. Get the latest tech news and exclusive discounts directly in your inbox.</p>
          
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your professional email" 
              className="flex-grow px-6 py-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              disabled={status === 'loading'}
            />
            <button 
              type="submit"
              disabled={status === 'loading'}
              className="bg-brand-primary text-white font-bold px-8 py-4 rounded-lg hover:bg-brand-primary/90 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
            </button>
          </form>

          {status === 'success' && (
            <p className="mt-4 text-green-600 font-medium text-sm animate-pulse">{message}</p>
          )}
          {status === 'error' && (
            <p className="mt-4 text-red-600 font-medium text-sm">{message}</p>
          )}

          <p className="text-[10px] text-gray-400 mt-4 italic">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  );
};

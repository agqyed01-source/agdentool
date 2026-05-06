import React, { useEffect, useState } from 'react';
import { Home, Grid, Search, ShoppingBag, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { wooApi } from '../services/woo';

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
      <Link to="/" className="flex flex-col items-center gap-1 p-1 text-slate-400 hover:text-brand-primary">
        <Search size={20} />
        <span className="text-[10px] font-bold">Search</span>
      </Link>
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
  return (
    <section className="bg-gray-100 py-12 md:py-20 border-t border-gray-200">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay updated with Industry Insights</h2>
          <p className="text-gray-500 mb-8">Join 5,000+ dental professionals. Get the latest tech news and exclusive discounts directly in your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your professional email" 
              className="flex-grow px-6 py-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <button className="bg-brand-primary text-white font-bold px-8 py-4 rounded-lg hover:bg-brand-primary/90 transition-all flex items-center justify-center">
              Subscribe Now
            </button>
          </form>
          <p className="text-[10px] text-gray-400 mt-4 italic">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  );
};

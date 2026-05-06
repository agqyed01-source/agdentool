import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Menu, Phone, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { wooApi, WooCategory } from '../services/woo';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menus, setMenus] = useState<{id: number, title: string, url: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    wooApi.getMenus()
      .then(setMenus)
      .catch(err => console.error("Menu fetch failed:", err));
    
    // Poll cart just for demo purposes or fetch once
    wooApi.getCart().then(cart => setCartCount(cart.totals.total_items));
    
    // Create an interval to frequently check cart in this simplified setup
    const intervalId = setInterval(() => {
      wooApi.getCart().then(cart => setCartCount(cart.totals.total_items));
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      {/* Top Utility Bar - Pro Style */}
      <div className="bg-brand-secondary text-white py-2 text-[11px] font-medium uppercase tracking-wider">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <span>Dental Professional Choice</span>
            <span className="opacity-30">|</span>
            <span className="flex items-center gap-1">Free Shipping on orders over $150</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1">📞 +1 (800) DENTAL-PRO</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 md:py-5">
        <div className="flex items-center justify-between gap-6 md:gap-10">
          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-2 -ml-2 text-slate-600 hover:text-brand-primary"
          >
            <Menu size={24} />
          </button>

          {/* Logo - Dental Depot Style */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <div className="leading-none select-none">
              <span className="text-xl font-bold tracking-tight text-brand-secondary">DENTAL</span>
              <span className="text-xl font-light tracking-tight text-slate-900">DEPOT</span>
            </div>
          </Link>

          {/* Search Bar - High Density */}
          <div className="hidden md:flex flex-grow max-w-xl relative">
            <form onSubmit={handleSearch} className="w-full">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 15,000+ dental products (implants, kits, hygiene...)" 
                className="w-full pl-6 pr-12 py-3 bg-slate-100 border-none focus:ring-2 focus:ring-brand-primary rounded-full text-sm transition-all outline-none"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary">
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link to="/account" className="text-right hidden lg:block hover:text-brand-primary">
              <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-widest">Account</span>
              <span className="text-sm font-semibold text-slate-900">Sign In</span>
            </Link>
            
            <button className="p-2 text-slate-600 hover:text-brand-primary md:hidden">
               <Search size={24} />
            </button>

            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-brand-primary transition-colors">
              {cartCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
                  {cartCount}
                </div>
              )}
              <ShoppingBag size={24} />
            </Link>
          </div>
        </div>
      </div>

      {/* Sub Nav Bar */}
      <nav className="container mx-auto px-4 py-2 hidden md:flex gap-8 text-[13px] font-semibold text-slate-600 overflow-x-auto">
        <Link to="/" className="text-brand-primary flex items-center gap-1 shrink-0"><span>☰</span> All Categories</Link>
        {menus.slice(0, 6).map((menu) => (
          <Link key={menu.id} to={menu.url} className="hover:text-brand-primary transition-colors shrink-0">
            {menu.title}
          </Link>
        ))}
        <Link to="/category/sale" className="text-brand-accent hover:opacity-80 transition-opacity shrink-0">Sale %</Link>
      </nav>
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-white z-[70] shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                 <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  </div>
                  <span className="text-xl font-bold text-slate-900">Dental Depot</span>
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-6 text-lg font-medium text-slate-700">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-brand-primary">Home</Link>
                {menus.map((menu) => (
                  <Link key={menu.id} to={menu.url} onClick={() => setIsMenuOpen(false)} className="hover:text-brand-primary">
                    {menu.title}
                  </Link>
                ))}
                <hr className="border-slate-100" />
                <a href="#" className="text-base font-normal flex items-center gap-2"><Phone size={18} /> 1-800-DENTAL-PRO</a>
                <a href="#" className="text-base font-normal flex items-center gap-2"><User size={18} /> Account Login</a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

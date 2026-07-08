import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { wooApi } from '../services/woo';
import { UserPlus, Loader2, X, Check } from 'lucide-react';

export function RegistrationPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasShown, setHasShown] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('wholesale_popup_shown_v3') === 'true') {
      setHasShown(true);
      return;
    }

    let startTime = sessionStorage.getItem('site_visit_start_v3');
    if (!startTime) {
      startTime = Date.now().toString();
      sessionStorage.setItem('site_visit_start_v3', startTime);
    }

    const interval = setInterval(async () => {
      if (sessionStorage.getItem('wholesale_popup_shown_v3') === 'true') {
        clearInterval(interval);
        return;
      }

      const currentElapsed = Date.now() - parseInt(startTime!, 10);
      
      if (currentElapsed >= 20000) {
        const currentPath = window.location.pathname;
        
        // Don't show if already on account page or checkout
        if (!currentPath.includes('/account') && !currentPath.includes('/checkout')) {
          const user = await wooApi.getCurrentUser();
          
          // If no valid user session, show popup
          if (!user || !user.id || user.id > 1000000000) {
            setIsOpen(true);
            setHasShown(true);
            sessionStorage.setItem('wholesale_popup_shown_v3', 'true');
            clearInterval(interval);
          } else {
            // Already logged in
            sessionStorage.setItem('wholesale_popup_shown_v3', 'true');
            clearInterval(interval);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await wooApi.register({ email, password });
      setIsOpen(false);
      window.location.reload();
    } catch (err: any) {
      let msg = err.message || 'Registration failed. Please try again.';
      // Rewrite WordPress URLs
      const env = (import.meta as any).env;
      const siteUrl = env.VITE_WOO_API_URL?.split('/wp-json')[0] || '';
      if (siteUrl) {
        msg = msg.replace(new RegExp(siteUrl, 'g'), '');
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-slate-200 z-10 bg-black/20 hover:bg-black/40 rounded-full p-1 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="bg-brand-primary p-8 text-white text-center relative">
          <h2 className="text-2xl font-bold mb-2">🎁 Unlock Wholesale Benefits</h2>
          <div className="text-blue-100 text-sm text-left mt-4 max-w-[250px] mx-auto space-y-2 font-medium">
            <p className="font-bold text-white mb-3">Register to get:</p>
            <p className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Wholesale Price</p>
            <p className="flex items-center gap-2"><Check size={16} className="text-green-400" /> PDF Catalog</p>
            <p className="flex items-center gap-2"><Check size={16} className="text-green-400" /> CE & ISO Documents</p>
            <p className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Faster Quotation</p>
          </div>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)]"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Create Free Account'}
            </button>
            
            <button 
              type="button" 
              onClick={handleClose}
              className="w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mt-2 py-2"
            >
              Continue Browsing
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

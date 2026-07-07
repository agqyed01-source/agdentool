import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { wooApi } from '../services/woo';
import { UserPlus, Loader2 } from 'lucide-react';

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
    if (sessionStorage.getItem('registration_popup_shown') === 'true') {
      setHasShown(true);
      return;
    }

    let startTime = sessionStorage.getItem('site_visit_start');
    if (!startTime) {
      startTime = Date.now().toString();
      sessionStorage.setItem('site_visit_start', startTime);
    }

    const interval = setInterval(async () => {
      if (sessionStorage.getItem('registration_popup_shown') === 'true') {
        clearInterval(interval);
        return;
      }

      const currentElapsed = Date.now() - parseInt(startTime!, 10);
      if (currentElapsed >= 60000) {
        const currentPath = window.location.pathname;
        // Don't show if already on account page or checkout
        if (!currentPath.includes('/account') && !currentPath.includes('/checkout')) {
          const user = await wooApi.getCurrentUser();
          // If no valid user session, show popup
          if (!user || !user.id || user.id > 1000000000) {
            setIsOpen(true);
            setHasShown(true);
            sessionStorage.setItem('registration_popup_shown', 'true');
            clearInterval(interval);
          } else {
            // Already logged in
            sessionStorage.setItem('registration_popup_shown', 'true');
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

  const handleLoginRedirect = () => {
    setIsOpen(false);
    navigate('/account');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <div className="bg-brand-primary p-8 text-white text-center relative">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <UserPlus size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Create an Account</h2>
          <p className="text-blue-100 text-sm">Join us for exclusive professional dental supplies, order tracking, and special offers.</p>
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
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Register Now'}
            </button>
            
            <div className="text-center pt-4 border-t border-slate-100 mt-6">
              <span className="text-sm text-slate-500 mr-2">Already have an account?</span>
              <button 
                type="button" 
                onClick={handleLoginRedirect}
                className="text-sm text-brand-primary hover:text-brand-secondary font-bold"
              >
                Log in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

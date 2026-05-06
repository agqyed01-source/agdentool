import React, { useEffect, useState } from 'react';
import { Seo } from '../components/Seo';
import { wooApi, WooUser, WooOrder } from '../services/woo';
import { User, LogOut, Package, Clock, ShieldCheck } from 'lucide-react';

export const AccountPage = () => {
  const [user, setUser] = useState<WooUser | null>(null);
  const [orders, setOrders] = useState<WooOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [email, setEmail] = useState('demo@dental.com');
  const [password, setPassword] = useState('password');
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    wooApi.getCurrentUser().then(u => {
      setUser(u);
      if (u) {
        wooApi.getOrders().then(setOrders);
      }
      setLoading(false);
    });
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Mock login acts as both for this demo
    try {
      const u = await wooApi.login(email, password);
      setUser(u);
      wooApi.getOrders().then(setOrders);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleLogout = async () => {
    await wooApi.logout();
    setUser(null);
    setOrders([]);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Account...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Seo title="Account Login" description="Sign in to your Dental Depot account." />
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex bg-slate-100 rounded-lg p-1 mb-8">
            <button 
              onClick={() => setIsLoginView(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${isLoginView ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLoginView(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${!isLoginView ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Register
            </button>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-6">
            {isLoginView ? 'Welcome Back' : 'Create an Account'}
          </h1>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
            </div>
            <button type="submit" className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-brand-secondary transition-colors mt-4">
              {isLoginView ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Professional verified accounts get access to bulk pricing and extended warranties.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8">
      <Seo title="My Account" description="Manage your Dental Depot account and orders." />
      
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-brand-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div>
              <h2 className="font-bold text-slate-900">{user.first_name} {user.last_name}</h2>
              <div className="text-xs text-brand-primary font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                <ShieldCheck size={14} /> Professional
              </div>
            </div>
          </div>
          
          <nav className="flex flex-col gap-2">
            <button className="flex items-center gap-3 w-full text-left px-4 py-2 bg-white text-brand-primary font-bold rounded-lg shadow-sm">
              <Package size={18} /> Order History
            </button>
            <button className="flex items-center gap-3 w-full text-left px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">
              <User size={18} /> Profile Details
            </button>
            <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-2 text-slate-600 font-bold hover:bg-slate-100/50 hover:text-red-600 rounded-lg transition-colors mt-4 border-t border-slate-200">
              <LogOut size={18} /> Sign Out
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Orders</h1>
        
        {orders.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 border-dashed rounded-xl p-12 text-center text-slate-500 font-medium">
            You haven't placed any orders yet.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex gap-8">
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase mb-1">Order Placed</div>
                      <div className="text-sm font-medium text-slate-900">{new Date(order.date_created).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase mb-1">Total</div>
                      <div className="text-sm font-black text-slate-900">${order.total}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Order # {order.id}</div>
                    <div className="inline-flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
                      <Clock size={12} /> {order.status}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {order.line_items.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-2">
                       <div className="font-medium text-slate-900">{item.name} <span className="text-slate-400 text-sm">x{item.quantity}</span></div>
                       <div className="font-bold text-slate-900">${item.total}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

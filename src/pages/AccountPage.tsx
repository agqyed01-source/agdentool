import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { wooApi, WooUser, WooOrder } from '../services/woo';
import { 
  User, 
  LogOut, 
  Package, 
  Clock, 
  ShieldCheck, 
  Loader2, 
  MapPin, 
  LayoutDashboard, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Ticket,
  Copy,
  Eye,
  ChevronDown
} from 'lucide-react';

import Select from 'react-select';

type Tab = 'dashboard' | 'orders' | 'addresses' | 'details' | 'coupons';

export const AccountPage = () => {
  const [user, setUser] = useState<WooUser | null>(null);
  const [orders, setOrders] = useState<WooOrder[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Auth Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLostPasswordView, setIsLostPasswordView] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile Edit states
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [updateMessage, setUpdateMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  // Address edit state
  const [editingAddress, setEditingAddress] = useState<'billing' | 'shipping' | null>(null);
  const [addressForm, setAddressForm] = useState<any>({});
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  useEffect(() => {
    wooApi.getCurrentUser().then(u => {
      // If user has an invalid ID or a mock ID (timestamp format), force logout to refresh from real backend
      const isMockId = u && (u.id > 1000000000); 
      if (u && (!u.id || u.id === 0 || isMockId)) {
        console.warn('Invalid or mock user session detected. Clearing session...');
        wooApi.logout();
        setUser(null);
      } else {
        setUser(u);
        if (u) {
          wooApi.getOrders().then(setOrders);
          wooApi.getCoupons().then(setCoupons);
        }
      }
      setLoading(false);
    });

    wooApi.getCountries().then(setCountries);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      if (isLostPasswordView) {
        // Handle lost password (simplified for now, usually triggers an email)
        setUpdateMessage({ 
          text: 'If the email exists, a reset link will be sent shortly. Please check your inbox.', 
          type: 'success' 
        });
        setIsLostPasswordView(false);
        setIsLoginView(true);
        return;
      }

      let u;
      if (isLoginView) {
        u = await wooApi.login(email, password);
      } else {
        u = await wooApi.register({ email, password, first_name: firstName, last_name: lastName });
      }
      setUser(u);
      wooApi.getOrders().then(setOrders);
      wooApi.getCoupons().then(setCoupons);
      setActiveTab('dashboard');
    } catch (err: any) {
      let msg = err.message || (isLoginView ? 'Login failed' : 'Registration failed');
      
      // Rewrite WordPress URLs to SPA local triggers
      const env = (import.meta as any).env;
      const siteUrl = env.VITE_WOO_API_URL?.split('/wp-json')[0] || '';
      if (siteUrl) {
        msg = msg.replace(new RegExp(siteUrl, 'g'), '');
        msg = msg.replace(/\/my-account\/lost-password\/?/g, '#lost-password');
      }
      
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add click listener to handle the rewritten links in dangerouslySetInnerHTML
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.getAttribute('href') === '#lost-password') {
        e.preventDefault();
        setIsLostPasswordView(true);
        setError('');
      }
    };
    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setUpdateMessage(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string,
    };

    const newPassword = formData.get('new_password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setUpdateMessage({ text: 'New passwords do not match', type: 'error' });
        setIsSubmitting(false);
        return;
      }
      data.password = newPassword;
    }

    try {
      const updatedUser = await wooApi.updateCustomer(user.id, data);
      setUser(updatedUser);
      setUpdateMessage({ text: 'Account details updated successfully!', type: 'success' });
      // Clear password fields on success
      if (newPassword) {
        const form = e.target as HTMLFormElement;
        const newPassInput = form.querySelector('input[name="new_password"]') as HTMLInputElement;
        const confirmPassInput = form.querySelector('input[name="confirm_password"]') as HTMLInputElement;
        if (newPassInput) newPassInput.value = '';
        if (confirmPassInput) confirmPassInput.value = '';
      }
    } catch (err: any) {
      setUpdateMessage({ text: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditAddress = (type: 'billing' | 'shipping') => {
    setEditingAddress(type);
    const addr = user?.[type] || {};
    setAddressForm(addr);
    setUpdateMessage(null);

    // Load states for existing country
    if (addr.country) {
      const country = countries.find((c: any) => c.code === addr.country);
      if (country && country.states) {
        setStates(country.states);
      } else {
        setStates([]);
      }
    } else {
      setStates([]);
    }
  };

  const handleCountryChange = (selectedOption: any) => {
    const countryCode = selectedOption ? selectedOption.value : '';
    setAddressForm({ ...addressForm, country: countryCode, state: '' });
    
    // Find states for selected country
    const country = countries.find(c => c.code === countryCode);
    if (country && country.states) {
      setStates(country.states);
    } else {
      setStates([]);
    }
  };

  const handleStateChange = (selectedOption: any) => {
    setAddressForm({ ...addressForm, state: selectedOption ? selectedOption.value : '' });
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id || user.id === 0 || !editingAddress) {
      setUpdateMessage({ text: 'Session error: Invalid user ID. Please log out and log in again to refresh your session.', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Filter only valid WooCommerce keys for addresses
      const validBillingKeys = ['first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'email', 'phone'];
      const validShippingKeys = ['first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country'];
      
      const validKeys = editingAddress === 'billing' ? validBillingKeys : validShippingKeys;
      const cleanAddress: any = {};
      validKeys.forEach(key => {
        if (addressForm[key] !== undefined) {
          cleanAddress[key] = addressForm[key];
        }
      });

      const updatedUser = await wooApi.updateCustomer(user.id, { [editingAddress]: cleanAddress });
      setUser(updatedUser);
      setUpdateMessage({ text: `${editingAddress.charAt(0).toUpperCase() + editingAddress.slice(1)} address updated!`, type: 'success' });
      setEditingAddress(null);
      
      // Clear checkout saved billing info to force refresh from updated profile
      localStorage.removeItem('WOO_SAVED_BILLING_INFO');
    } catch (err: any) {
      let msg = err.message || 'Failed to update address';
      if (msg.includes('Invalid user ID')) {
        msg = 'Your user session has an invalid ID. Please log out and log in again.';
      }
      setUpdateMessage({ text: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await wooApi.logout();
    setUser(null);
    setOrders([]);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-slate-500 font-medium">Loading your account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Seo title="Account Login" description="Sign in to your AGDentool account." />
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
            {isLostPasswordView ? 'Reset Password' : (isLoginView ? 'Welcome Back' : 'Create an Account')}
          </h1>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold mb-6 flex items-start gap-2">
              <div className="shrink-0 mt-0.5"><AlertCircle size={16} /></div>
              <div 
                className="prose-sm prose-red auth-error-container"
                dangerouslySetInnerHTML={{ __html: error }} 
              />
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isLostPasswordView ? (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Enter your registered email"
                  required
                />
              </div>
            ) : (
              <>
                {!isLoginView && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                      <input 
                        type="text" 
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        required={!isLoginView}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                      <input 
                        type="text" 
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        required={!isLoginView}
                      />
                    </div>
                  </div>
                )}
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-bold text-slate-700">Password</label>
                    {isLoginView && (
                      <button 
                        type="button"
                        onClick={() => { setIsLostPasswordView(true); setError(''); }}
                        className="text-xs font-bold text-brand-primary hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    required
                  />
                </div>
              </>
            )}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-brand-secondary transition-colors mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              {isLostPasswordView ? 'Send Reset Link' : (isLoginView ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            {isLostPasswordView ? (
              <button 
                onClick={() => { setIsLostPasswordView(false); setIsLoginView(true); setError(''); }}
                className="hover:text-brand-primary underline"
              >
                Back to Login
              </button>
            ) : (
              <>
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => { setIsLoginView(!isLoginView); setError(''); }}
                  className="ml-2 text-brand-primary font-bold hover:underline"
                >
                  {isLoginView ? 'Register' : 'Sign In'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Hello, {user.first_name || user.username || 'Friend'}!</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          From your account dashboard you can view your <button onClick={() => setActiveTab('orders')} className="text-brand-primary font-bold hover:underline">recent orders</button>, 
          manage your <button onClick={() => setActiveTab('addresses')} className="text-brand-primary font-bold hover:underline">shipping and billing addresses</button>, 
          edit your <button onClick={() => setActiveTab('details')} className="text-brand-primary font-bold hover:underline">password and account details</button>,
          and view your <button onClick={() => setActiveTab('coupons')} className="text-brand-primary font-bold hover:underline">available coupons</button>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => setActiveTab('orders')} className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-all cursor-pointer group">
          <Package className="text-brand-primary mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="font-bold text-slate-900 mb-1">Recent Orders</h3>
          <p className="text-sm text-slate-500">Track and manage your purchases.</p>
        </div>
        <div onClick={() => setActiveTab('addresses')} className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-all cursor-pointer group">
          <MapPin className="text-brand-primary mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="font-bold text-slate-900 mb-1">Addresses</h3>
          <p className="text-sm text-slate-500">Update your shipping and billing.</p>
        </div>
        <div onClick={() => setActiveTab('details')} className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-all cursor-pointer group">
          <Settings className="text-brand-primary mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="font-bold text-slate-900 mb-1">Account Details</h3>
          <p className="text-sm text-slate-500">Profile names and email settings.</p>
        </div>
        <div onClick={() => setActiveTab('coupons')} className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-all cursor-pointer group">
          <Ticket className="text-brand-primary mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="font-bold text-slate-900 mb-1">Coupons</h3>
          <p className="text-sm text-slate-500">View available discount codes.</p>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Order History</h1>
      
      {orders.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 border-dashed rounded-xl p-12 text-center">
          <Package className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-medium">You haven't placed any orders yet.</p>
          <a href="/" className="inline-block mt-4 text-brand-primary font-bold hover:underline">Start Shopping</a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-8">
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Date</div>
                    <div className="text-sm font-medium text-slate-900">{new Date(order.date_created).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Total</div>
                    <div className="text-sm font-black text-slate-900">${order.total}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Order # {order.id}</div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      <Clock size={12} /> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                    <Link to={`/order/${order.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline group">
                      <Eye size={12} className="group-hover:scale-110 transition-transform" /> View Details
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {order.line_items.map(item => (
                    <div key={item.id} className="flex justify-between items-start py-1">
                       <div className="text-sm font-medium text-slate-900 flex flex-col">
                         <span>{item.name} <span className="text-slate-400 font-normal">x{item.quantity}</span></span>
                         {item.meta_data && item.meta_data.length > 0 && (
                           <span className="text-xs text-slate-500 font-normal mt-0.5">
                             {item.meta_data.map(m => `${m.key}: ${m.value}`).join(', ')}
                           </span>
                         )}
                       </div>
                       <div className="text-sm font-bold text-slate-900 mt-0.5">${item.total}</div>
                    </div>
                  ))}
                </div>
                {order.payment_method_title && (
                  <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                    Paid via {order.payment_method_title}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderAddresses = () => {
    if (editingAddress) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Edit {editingAddress.charAt(0).toUpperCase() + editingAddress.slice(1)} Address</h2>
            <button onClick={() => setEditingAddress(null)} className="text-sm text-slate-500 font-bold hover:text-slate-900 underline">Cancel</button>
          </div>
          
          <form onSubmit={handleUpdateAddress} className="bg-white border border-slate-200 rounded-xl p-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Country</label>
                <Select
                  options={countries.map(c => ({ value: c.code, label: c.name }))}
                  value={countries.find(c => c.code === addressForm.country) ? { value: addressForm.country, label: countries.find(c => c.code === addressForm.country)?.name } : null}
                  onChange={handleCountryChange}
                  isSearchable
                  placeholder="Select a country..."
                  className="text-sm"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                <input 
                  type="text" 
                  value={addressForm.first_name || ''} 
                  onChange={e => setAddressForm({...addressForm, first_name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                <input 
                  type="text" 
                  value={addressForm.last_name || ''} 
                  onChange={e => setAddressForm({...addressForm, last_name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  required
                />
              </div>
            </div>

            {editingAddress === 'billing' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input 
                    type="email" 
                    value={addressForm.email || ''} 
                    onChange={e => setAddressForm({...addressForm, email: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    required={editingAddress === 'billing'}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                  <input 
                    type="tel" 
                    value={addressForm.phone || ''} 
                    onChange={e => setAddressForm({...addressForm, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    required={editingAddress === 'billing'}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-slate-400">Company (Optional)</label>
              <input 
                type="text" 
                value={addressForm.company || ''} 
                onChange={e => setAddressForm({...addressForm, company: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Street Address</label>
              <input 
                type="text" 
                placeholder="House number and street name"
                value={addressForm.address_1 || ''} 
                onChange={e => setAddressForm({...addressForm, address_1: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm mb-2"
                required
              />
              <input 
                type="text" 
                placeholder="Apartment, suite, unit, etc. (optional)"
                value={addressForm.address_2 || ''} 
                onChange={e => setAddressForm({...addressForm, address_2: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                <input 
                  type="text" 
                  value={addressForm.city || ''} 
                  onChange={e => setAddressForm({...addressForm, city: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Postcode</label>
                <input 
                  type="text" 
                  value={addressForm.postcode || ''} 
                  onChange={e => setAddressForm({...addressForm, postcode: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  required
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">State / Province</label>
                {states.length > 0 ? (
                  <Select
                    options={states.map(s => ({ value: s.code, label: s.name }))}
                    value={states.find(s => s.code === addressForm.state) ? { value: addressForm.state, label: states.find(s => s.code === addressForm.state)?.name } : null}
                    onChange={handleStateChange}
                    isSearchable
                    placeholder="Select a state..."
                    className="text-sm"
                    required
                  />
                ) : (
                  <input 
                    type="text" 
                    value={addressForm.state || ''} 
                    onChange={e => setAddressForm({...addressForm, state: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    required
                  />
                )}
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={18} />}
              Save Address
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">My Addresses</h2>
        <p className="text-slate-500">The following addresses will be used on the checkout page by default.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Billing */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-brand-primary" size={20} /> Billing Address
              </h3>
              <button 
                onClick={() => startEditAddress('billing')}
                className="text-brand-primary text-sm font-bold hover:underline"
              >
                Edit
              </button>
            </div>
            {user.billing?.address_1 ? (
              <div className="text-sm text-slate-600 leading-relaxed space-y-1">
                <p className="font-bold text-slate-900">{user.billing.first_name} {user.billing.last_name}</p>
                {user.billing.company && <p>{user.billing.company}</p>}
                <p>{user.billing.address_1}</p>
                {user.billing.address_2 && <p>{user.billing.address_2}</p>}
                <p>{user.billing.city}, {user.billing.state} {user.billing.postcode}</p>
                <p>{user.billing.country}</p>
                <p className="mt-2 text-slate-400">{user.billing.email}</p>
                <p className="text-slate-400">{user.billing.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">You have not set up this type of address yet.</p>
            )}
          </div>

          {/* Shipping */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="text-brand-primary" size={20} /> Shipping Address
              </h3>
              <button 
                onClick={() => startEditAddress('shipping')}
                className="text-brand-primary text-sm font-bold hover:underline"
              >
                Edit
              </button>
            </div>
            {user.shipping?.address_1 ? (
              <div className="text-sm text-slate-600 leading-relaxed space-y-1">
                <p className="font-bold text-slate-900">{user.shipping.first_name} {user.shipping.last_name}</p>
                {user.shipping.company && <p>{user.shipping.company}</p>}
                <p>{user.shipping.address_1}</p>
                {user.shipping.address_2 && <p>{user.shipping.address_2}</p>}
                <p>{user.shipping.city}, {user.shipping.state} {user.shipping.postcode}</p>
                <p>{user.shipping.country}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">You have not set up this type of address yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDetails = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Account Details</h2>
      <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-200 rounded-xl p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
            <input 
              name="first_name"
              type="text" 
              defaultValue={user.first_name}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
            <input 
              name="last_name"
              type="text" 
              defaultValue={user.last_name}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Name</label>
          <input 
            name="display_name"
            type="text" 
            defaultValue={user.username || user.email.split('@')[0]}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            required
            disabled
          />
          <p className="text-[10px] text-slate-400 mt-1">Username cannot be changed. This is how your name will be displayed in the account section and in reviews.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
          <input 
            name="email"
            type="email" 
            defaultValue={user.email}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            required
          />
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Password Change</h3>
          <p className="text-xs text-slate-400 mb-4 italic">Leave blank to keep the current password.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
              <input 
                name="new_password"
                type="password" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm New Password</label>
              <input 
                name="confirm_password"
                type="password" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setUpdateMessage({ text: 'Coupon code copied to clipboard!', type: 'success' });
    setTimeout(() => setUpdateMessage(null), 3000);
  };

  const renderCoupons = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Available Coupons</h1>
      
      {updateMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 font-medium text-sm border ${updateMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
          {updateMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {updateMessage.text}
        </div>
      )}

      {coupons.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
          <Ticket className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-medium">You don't have any available coupons right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((coupon, index) => (
            <div key={coupon.id || index} className="bg-white border text-center relative border-brand-primary/20 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col items-center justify-center">
              {/* Decorative elements to look like a ticket */}
              <div className="absolute top-1/2 left-0 w-3 h-6 bg-slate-50 border-r border-brand-primary/20 -translate-y-1/2 rounded-r-full -ml-[1px]"></div>
              <div className="absolute top-1/2 right-0 w-3 h-6 bg-slate-50 border-l border-brand-primary/20 -translate-y-1/2 rounded-l-full -mr-[1px]"></div>
              
              <div className="text-brand-primary mb-2">
                <Ticket size={32} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{coupon.code}</h3>
              <p className="text-sm text-slate-500 mb-4">{coupon.description || (coupon.discount_type === 'percent' ? `${parseFloat(coupon.amount)}% off` : `$${parseFloat(coupon.amount)} off`)}</p>
              
              <button 
                onClick={() => handleCopyCoupon(coupon.code)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-sm"
              >
                <Copy size={16} /> Copy Code
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Seo title="My Account" description="Manage your AGDentool account and orders." />
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 lg:p-6 bg-slate-50 lg:border-b border-slate-100 flex items-center lg:block lg:text-center gap-4">
              <div className="w-12 h-12 lg:w-20 lg:h-20 shrink-0 bg-brand-primary text-white rounded-full flex items-center justify-center text-xl lg:text-3xl font-bold lg:mx-auto lg:mb-4 border-2 lg:border-4 border-white shadow-sm italic">
                {user.first_name ? user.first_name[0] : user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center lg:items-center">
                <h2 className="font-bold text-slate-900 truncate">
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username || 'User'}
                </h2>
                <div className="flex items-center lg:justify-center gap-1 mt-1">
                  <ShieldCheck size={14} className="text-brand-primary" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.role || 'Customer'}</span>
                </div>
              </div>
            </div>
            
            <nav className="hidden lg:block p-4 space-y-1">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-3 w-full px-4 py-3 font-bold rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-brand-primary text-white shadow-brand-primary/20 shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <LayoutDashboard size={20} /> Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 w-full px-4 py-3 font-bold rounded-xl transition-all ${activeTab === 'orders' ? 'bg-brand-primary text-white shadow-brand-primary/20 shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Package size={20} /> Orders
              </button>
              <button 
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center gap-3 w-full px-4 py-3 font-bold rounded-xl transition-all ${activeTab === 'addresses' ? 'bg-brand-primary text-white shadow-brand-primary/20 shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <MapPin size={20} /> Addresses
              </button>
              <button 
                onClick={() => setActiveTab('details')}
                className={`flex items-center gap-3 w-full px-4 py-3 font-bold rounded-xl transition-all ${activeTab === 'details' ? 'bg-brand-primary text-white shadow-brand-primary/20 shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <User size={20} /> Account Details
              </button>
              <button 
                onClick={() => setActiveTab('coupons')}
                className={`flex items-center gap-3 w-full px-4 py-3 font-bold rounded-xl transition-all ${activeTab === 'coupons' ? 'bg-brand-primary text-white shadow-brand-primary/20 shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Ticket size={20} /> Coupons
              </button>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 font-bold hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                  <LogOut size={20} /> Logout
                </button>
              </div>
            </nav>
          </div>

          {/* Mobile Tab Select */}
          <div className="lg:hidden flex gap-2 mt-4">
           <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative">
             <select 
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as Tab)}
                className="w-full appearance-none px-4 py-3 bg-transparent font-bold text-slate-700 outline-none relative z-10"
             >
                <option value="dashboard">Dashboard</option>
                <option value="orders">Orders</option>
                <option value="addresses">Addresses</option>
                <option value="details">Account Details</option>
                <option value="coupons">Coupons</option>
             </select>
             <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-0" />
           </div>
           <button onClick={handleLogout} className="flex-none p-3 text-red-500 font-bold bg-white border border-red-100 hover:bg-red-50 rounded-xl transition-all shadow-sm" title="Logout">
              <LogOut size={20} />
           </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow min-h-[400px]">
          {updateMessage && (
            <div className={`mb-6 p-4 rounded-xl font-bold flex items-start gap-2 border ${updateMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              <div className="shrink-0 mt-0.5">
                {updateMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              </div>
              <div 
                className="prose-sm"
                dangerouslySetInnerHTML={{ __html: updateMessage.text }} 
              />
            </div>
          )}

          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'addresses' && renderAddresses()}
          {activeTab === 'details' && renderDetails()}
          {activeTab === 'coupons' && renderCoupons()}
        </div>
      </div>
    </div>
  );
};

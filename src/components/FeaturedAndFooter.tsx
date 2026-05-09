import React, { useEffect, useState } from 'react';
import { Microscope, Activity, Scissors, Zap, Shield, ClipboardCheck, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { wooApi, WooCategory } from '../services/woo';

const getCategoryIcon = (idx: number) => {
  const icons = [
    <Scissors size={24} key="icon1" />,
    <Zap size={24} key="icon2" />,
    <Shield size={24} key="icon3" />,
    <Activity size={24} key="icon4" />,
    <ClipboardCheck size={24} key="icon5" />,
    <Microscope size={24} key="icon6" />,
  ];
  return icons[idx % icons.length];
};

const getCategoryColor = (idx: number) => {
  const colors = [
    'bg-blue-50 text-blue-600',
    'bg-yellow-50 text-yellow-600',
    'bg-green-50 text-green-600',
    'bg-purple-50 text-purple-600',
    'bg-red-50 text-red-600',
    'bg-indigo-50 text-indigo-600'
  ];
  return colors[idx % colors.length];
};

export const FeaturedCategories = () => {
  const [categories, setCategories] = useState<WooCategory[]>([]);

  useEffect(() => {
    wooApi.getCategories().then(setCategories);
  }, []);

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.filter(c => !c.parent || c.parent === 0 || c.parent === "0").slice(0, 6).map((cat, idx) => (
          <Link to={`/category/${cat.slug}`} key={cat.id} className="group p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-brand-primary/20 hover:bg-white hover:shadow-sm transition-all text-left">
            <div className={`w-10 h-10 ${getCategoryColor(idx)} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              {getCategoryIcon(idx)}
            </div>
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-brand-primary transition-colors uppercase tracking-tight">{cat.name}</h3>
            <p className="text-[10px] text-slate-400 mt-1">{cat.count || 0}+ Products</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
               <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <div className="leading-none select-none">
                <span className="text-xl font-bold tracking-tight text-brand-secondary">DENTAL</span>
                <span className="text-xl font-light tracking-tight text-slate-900">DEPOT</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Precision-engineered equipment and reliable clinical supplies since 1998. The industry choice for modern dentistry.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Shop Supplies</h4>
            <ul className="space-y-3 text-sm text-slate-600 font-medium">
              <li><a href="#" className="hover:text-brand-primary transition-colors">Instrument Kits</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Infection Control</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Digital Imaging</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Disposable Items</a></li>
            </ul>
          </div>

          <div>
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-3 text-sm text-slate-600 font-medium">
              <li><a href="#" className="hover:text-brand-primary transition-colors">About Depot</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Pro Membership</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Expert Help</h4>
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-900 mb-1">Clinic Concierge</p>
                <p className="text-[10px] text-slate-500 mb-3">Message a specialist for bulk pricing or support.</p>
                <a href="https://wa.me/message/" target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] text-white py-2 rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1 hover:bg-[#128C7E] transition-colors">
                  <MessageCircle size={14} /> Message on WhatsApp
                </a>
             </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <p>© 2026 DentalDepot Supply Co.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-600">Privacy</a>
            <a href="#" className="hover:text-slate-600">Compliance</a>
            <a href="#" className="hover:text-slate-600">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

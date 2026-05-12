import React from 'react';
import { Truck, ShieldCheck, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TrustBar = () => {
  const items = [
    { icon: '🚚', text: 'Fast Dispatch', sub: 'Next Day Delivery Available' },
    { icon: '🔒', text: 'Secured Payment', sub: 'SSL Encrypted Checkout' },
    { icon: '✓', text: 'Genuine Products', sub: 'Authorized Manufacturer Rep' },
    { icon: '📞', text: 'Expert Support', sub: 'Professional Assistance' },
  ];

  return (
    <div className="bg-slate-50 border-b border-slate-200 py-4">
      <div className="container mx-auto px-4 grid grid-cols-2 lg:flex lg:flex-row justify-between items-center gap-4 lg:gap-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-lg shadow-sm">
              {item.icon}
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">{item.text}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Hero = () => {
  return (
    <section className="relative bg-slate-900 rounded-2xl md:rounded-3xl mx-4 my-6 overflow-hidden min-h-[350px] md:min-h-[450px]">
      {/* Abstract Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary/95 to-transparent z-10" />
      
      <div className="container mx-auto px-10 h-full relative z-20 flex flex-col justify-center py-12 md:py-20 lg:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2 py-1 bg-brand-primary text-white text-[10px] font-black uppercase tracking-tighter mb-4 rounded">
            New Inventory Just Arrived
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5 tracking-tight">
             Premium Surgical <br /><span className="text-blue-400">Precision Implements</span>
          </h1>
          <p className="text-sm md:text-lg text-slate-300 mb-8 max-w-md leading-relaxed">
            German-engineered precision for the modern professional. In stock and ready for immediate global dispatch.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/shop" className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-8 py-3.5 rounded-full text-sm transition-all transform active:scale-95 shadow-xl text-center">
              Shop Collection
            </Link>
            <Link to="/shop" className="border border-white/30 hover:bg-white/10 text-white font-bold px-8 py-3.5 rounded-full text-sm transition-all backdrop-blur-sm text-center">
              View Digital Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Image area like in design */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-slate-800 hidden lg:flex items-center justify-center border-l border-white/5 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800"
          className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
          alt="Professional Setup"
        />
      </div>
    </section>
  );
};

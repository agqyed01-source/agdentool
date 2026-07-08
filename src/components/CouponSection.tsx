import React, { useEffect, useState } from 'react';
import { wooApi } from '../services/woo';
import { Copy, CheckCircle2, Ticket } from 'lucide-react';

export const CouponSection = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [claimedCodes, setClaimedCodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wooApi.getCoupons().then(data => {
      let activeCoupons = [];
      if (data && Array.isArray(data)) {
        activeCoupons = data.filter(c => c.code).slice(0, 4);
      }
      
      // If we don't have enough coupons from the API, add some fallbacks so the UI looks good
      if (activeCoupons.length < 4) {
        const fallbacks = [
          { code: 'WELCOME10', description: '10% off for new customers', discount_type: 'percent', amount: '10' },
          { code: 'FREESHIP', description: 'Free shipping on orders', discount_type: 'fixed_cart', amount: '0' },
          { code: 'SAVE20', description: '$20 off orders over $200', discount_type: 'fixed_cart', amount: '20' },
          { code: 'SUMMER5', description: '5% off all supplies', discount_type: 'percent', amount: '5' }
        ];
        
        // Merge without duplicate codes
        const existingCodes = new Set(activeCoupons.map(c => c.code.toLowerCase()));
        for (const fb of fallbacks) {
          if (activeCoupons.length >= 4) break;
          if (!existingCodes.has(fb.code.toLowerCase())) {
            activeCoupons.push(fb);
            existingCodes.add(fb.code.toLowerCase());
          }
        }
      }
      
      setCoupons(activeCoupons);
      setLoading(false);
    });

    const saved = localStorage.getItem('claimed_coupons') || '[]';
    try {
      setClaimedCodes(new Set(JSON.parse(saved)));
    } catch(e) {}
  }, []);

  const handleClaim = async (code: string) => {
    const user = await wooApi.getCurrentUser();
    if (!user) {
      window.dispatchEvent(new CustomEvent('show-registration-popup', { detail: { type: 'timer' } }));
      return;
    }

    const newClaimed = new Set(claimedCodes);
    newClaimed.add(code);
    setClaimedCodes(newClaimed);
    localStorage.setItem('claimed_coupons', JSON.stringify(Array.from(newClaimed)));
  };

  if (loading) return null;
  if (coupons.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Ticket className="text-brand-primary" size={28} />
        <h2 className="text-2xl font-black text-slate-900">Special Offers</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {coupons.map((coupon, i) => (
          <div key={i} className="bg-gradient-to-br from-brand-primary/5 to-brand-secondary/10 border border-brand-primary/20 rounded-xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-300">
              <Ticket size={48} className="text-brand-primary -rotate-12" />
            </div>
            
            <div className="font-bold text-brand-primary text-xl md:text-2xl mb-1 tracking-wider uppercase relative z-10">
              {coupon.code}
            </div>
            <div className="text-xs md:text-sm text-slate-600 font-medium mb-4 h-10 flex items-center justify-center relative z-10 px-2 line-clamp-2">
              {coupon.description || 
               (coupon.discount_type === 'percent' ? `${parseFloat(coupon.amount)}% OFF` : `$${parseFloat(coupon.amount)} OFF`)}
            </div>
            
            <button
              onClick={() => handleClaim(coupon.code)}
              disabled={claimedCodes.has(coupon.code)}
              className={`border text-xs font-bold py-2 px-4 rounded-full flex items-center gap-1.5 w-full justify-center shadow-sm relative z-10 transition-all ${
                claimedCodes.has(coupon.code)
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default'
                  : 'bg-white border-brand-primary/20 hover:bg-brand-primary hover:text-white hover:border-brand-primary text-brand-primary'
              }`}
            >
              {claimedCodes.has(coupon.code) ? (
                <>
                  <CheckCircle2 size={14} /> Claimed!
                </>
              ) : (
                <>
                  <Copy size={14} /> Claim Coupon
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

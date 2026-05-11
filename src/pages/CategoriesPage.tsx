import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Box, Syringe, Scissors, Shield, Activity, Sparkles, Layers, Microscope, Wrench } from "lucide-react";
import { Seo } from "../components/Seo";
import { wooApi, WooCategory } from "../services/woo";
import { decodeHtmlEntities } from "../utils/format";

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<WooCategory[]>([]);
  const [catImages, setCatImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wooApi
      .getCategories()
      .then((cats) => {
        setCategories(cats);
        const topCats = cats.filter(c => !c.parent || c.parent === 0);
        setLoading(false);
        topCats.forEach(cat => {
          if (!cat.image?.src) {
            wooApi.getProducts({ category: String(cat.id), per_page: 1 }).then(res => {
              if (res.products && res.products.length > 0 && res.products[0].images?.length > 0) {
                setCatImages(prev => ({ ...prev, [cat.id]: res.products[0].images[0].src }));
              }
            }).catch(() => {});
          }
        });
      })
      .catch((err) => {
        console.error("Category fetch failed:", err);
        setLoading(false);
      });
  }, []);

  const getCategoryFallback = (name: string, slug: string) => {
    const text = (name + " " + slug).toLowerCase();
    
    if (text.includes("equip") || text.includes("machine")) return { icon: <Activity strokeWidth={1.5} />, color: "text-blue-500", bg: "bg-blue-50" };
    if (text.includes("instrument") || text.includes("tool") || text.includes("surgical") || text.includes("surgery")) return { icon: <Scissors strokeWidth={1.5} />, color: "text-teal-500", bg: "bg-teal-50" };
    if (text.includes("implant")) return { icon: <Wrench strokeWidth={1.5} />, color: "text-slate-600", bg: "bg-slate-100" };
    if (text.includes("ortho") || text.includes("brace")) return { icon: <Layers strokeWidth={1.5} />, color: "text-indigo-500", bg: "bg-indigo-50" };
    if (text.includes("endo")) return { icon: <Microscope strokeWidth={1.5} />, color: "text-purple-500", bg: "bg-purple-50" };
    if (text.includes("dispos") || text.includes("protect") || text.includes("glove") || text.includes("infection")) return { icon: <Shield strokeWidth={1.5} />, color: "text-emerald-500", bg: "bg-emerald-50" };
    if (text.includes("material") || text.includes("cement") || text.includes("composite") || text.includes("restorative")) return { icon: <Sparkles strokeWidth={1.5} />, color: "text-amber-500", bg: "bg-amber-50" };
    if (text.includes("hygiene") || text.includes("prevent")) return { icon: <Syringe strokeWidth={1.5} />, color: "text-sky-500", bg: "bg-sky-50" };

    return { icon: <Box strokeWidth={1.5} />, color: "text-brand-primary", bg: "bg-brand-primary/10" };
  };

  const topCategories = categories.filter(c => !c.parent || c.parent === 0);
  const totalProducts = categories.reduce((acc, cat) => acc + (cat.count || 0), 0);

  return (
    <>
      <Seo title="All Categories" description="Browse all product categories" />
      
      {/* Mobile Header -> Desktop hides this */}
      <div className="bg-white py-4 border-b border-slate-200 md:hidden">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-bold text-slate-900">All Categories</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl min-h-[60vh]">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-72 shrink-0">
            <h2 className="text-[17px] font-bold text-slate-900 mb-4 px-1">Categories</h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-[14px] shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-brand-primary/[0.04] text-brand-primary font-semibold">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center text-brand-primary bg-white rounded-md shadow-sm border border-brand-primary/10">
                    <Box size={14} strokeWidth={2.5} />
                  </div>
                  <span>All Categories</span>
                </div>
                <span className="text-brand-primary/80 font-medium tracking-wide">({totalProducts})</span>
              </div>
              
              {loading ? (
                <div className="p-4 space-y-4">
                  {[...Array(8)].map((_, i) => <div key={i} className="h-5 bg-slate-100 rounded w-full animate-pulse"></div>)}
                </div>
              ) : (
                <div className="flex flex-col">
                  {topCategories.map((cat) => {
                    const fallback = getCategoryFallback(cat.name, cat.slug);
                    return (
                      <Link
                        to={`/category/${cat.slug}`}
                        key={cat.id}
                        className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors text-slate-600 hover:text-brand-primary group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 flex items-center justify-center text-slate-400 group-hover:text-brand-primary transition-colors`}>
                             {React.cloneElement(fallback.icon as React.ReactElement<{size?: number, strokeWidth?: number}>, { size: 18, strokeWidth: 2 })}
                          </div>
                          <span className="font-medium">{decodeHtmlEntities(cat.name)}</span>
                        </div>
                        <span className="text-slate-400 text-[13px] group-hover:text-brand-primary/70 transition-colors">({cat.count || 0})</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            
            {/* Desktop Header */}
            <div className="hidden md:flex justify-between items-end mb-6 px-1">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">All Categories</h1>
                <p className="text-slate-500 text-[15px]">Browse all {topCategories.length} categories to find the dental products you need</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[14px]">
                  <span className="text-slate-500 font-medium">Sort by:</span>
                  <select className="border border-slate-200 rounded-lg py-2 px-3 pr-8 bg-white outline-none focus:border-brand-primary font-medium hover:border-slate-300 transition-colors text-slate-700 cursor-pointer appearance-none relative">
                    <option>Popular</option>
                    <option>A - Z</option>
                  </select>
                </div>
                {/* Fake icons for list/grid toggle to match standard e-comm views */}
                <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                  <button className="bg-brand-primary text-white p-2 border-r border-brand-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  </button>
                  <button className="bg-white text-slate-400 p-2 hover:bg-slate-50 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-20 md:h-[280px] bg-slate-100 animate-pulse rounded-xl border border-slate-200/50"></div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                {topCategories.map((cat) => {
                  const imgSrc = cat.image?.src || catImages[cat.id];
                  const fallback = getCategoryFallback(cat.name, cat.slug);
                  
                  return (
                    <Link
                      to={`/category/${cat.slug}`}
                      key={cat.id}
                      className="bg-white border md:border-slate-200 border-slate-100 rounded-xl md:rounded-2xl p-3 md:p-6 flex flex-row md:flex-col items-center gap-4 md:gap-0 hover:border-brand-primary/40 md:hover:border-brand-primary/50 hover:shadow-md md:hover:shadow-lg md:hover:-translate-y-1 transition-all group duration-300 relative"
                    >
                      {/* Image Area - Different on mobile vs desktop */}
                      <div className={`w-14 h-14 md:w-full md:aspect-square md:mb-5 shrink-0 flex items-center justify-center rounded-lg transition-colors overflow-hidden ${imgSrc ? 'bg-slate-50 md:bg-transparent' : fallback.bg}`}>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={decodeHtmlEntities(cat.name)}
                            className="w-full h-full object-contain md:object-cover mix-blend-multiply md:mix-blend-normal p-1 md:p-0 transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className={`${fallback.color} w-7 h-7 md:w-16 md:h-16 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center`}>
                            {fallback.icon}
                          </div>
                        )}
                      </div>
                      
                      {/* Text Area */}
                      <div className="flex-1 text-left md:text-center min-w-0">
                        <h3 className="text-slate-900 md:text-slate-800 text-[15px] md:text-[17px] font-bold mb-1 md:mb-1.5 leading-tight group-hover:text-brand-primary transition-colors">
                          {decodeHtmlEntities(cat.name)}
                        </h3>
                        <p className="text-[13px] md:text-[14px] text-slate-500 font-medium flex items-center gap-1.5 md:justify-center">
                          <span className="w-1 h-1 rounded-full bg-slate-300 md:hidden"></span>
                          {cat.count || 0}+ Products
                        </p>
                      </div>
                      
                      {/* Mobile chevron */}
                      <div className="shrink-0 text-slate-300 pr-2 group-hover:text-brand-primary transition-colors md:hidden">
                         <ChevronRight size={20} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

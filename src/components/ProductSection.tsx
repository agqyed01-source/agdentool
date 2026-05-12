import React, { useEffect, useState } from "react";
import { ShoppingCart, Heart, Star, Box, ChevronRight, Syringe, Scissors, Shield, Activity, Sparkles, Layers, Microscope, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { wooApi, WooProduct, WooCategory } from "../services/woo";
import { decodeHtmlEntities } from "../utils/format";

export const ShopByCategoryBlock = () => {
  const [categories, setCategories] = useState<WooCategory[]>([]);
  const [catImages, setCatImages] = useState<Record<string, string>>({});

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

  useEffect(() => {
    wooApi
      .getCategories()
      .then((cats) => {
        setCategories(cats);
        // Fetch real product images for categories that lack a thumbnail
        const topCats = cats.filter(c => !c.parent || c.parent === 0).slice(0, 8);
        topCats.forEach(cat => {
          if (!cat.image?.src) {
            wooApi.getProducts({ category: String(cat.id), per_page: 1 }).then(res => {
              if (res.products && res.products.length > 0 && res.products[0].images?.length > 0) {
                setCatImages(prev => ({ ...prev, [cat.id]: res.products[0].images[0].src }));
              }
            }).catch(() => {
              // Ignore errors, it will fallback to icon
            });
          }
        });
      })
      .catch((err) => console.error("Category fetch failed:", err));
  }, []);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
          Shop by Category
        </h2>
        <Link
          to="/categories"
          className="text-brand-primary text-sm font-bold flex items-center hover:underline"
        >
          View All Categories <span className="ml-1">→</span>
        </Link>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {categories.filter(c => !c.parent || c.parent === 0).slice(0, 6).map((cat) => {
          const imgSrc = cat.image?.src || catImages[cat.id];
          const fallback = getCategoryFallback(cat.name, cat.slug);
          return (
            <Link
              to={`/category/${cat.slug}`}
              key={cat.id}
              className="bg-white border border-slate-100 rounded-xl p-4 flex flex-row md:flex-col items-center gap-4 md:gap-0 hover:border-brand-primary/30 hover:shadow-lg md:hover:-translate-y-1 transition-all group"
            >
              <div className={`w-16 h-16 md:w-full md:aspect-square md:mb-4 p-2 shrink-0 flex items-center justify-center rounded-lg transition-colors ${imgSrc ? 'bg-slate-50/50 group-hover:bg-slate-50' : fallback.bg}`}>
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={decodeHtmlEntities(cat.name)}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform mix-blend-multiply"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`${fallback.color} w-8 h-8 md:w-16 md:h-16 transition-transform group-hover:scale-110 flex items-center justify-center`}>
                     {React.cloneElement(fallback.icon as React.ReactElement<{className?: string}>, { className: "w-full h-full" })}
                  </div>
                )}
              </div>
              <div className="flex-1 text-left md:text-center min-w-0">
                <h3 className="text-brand-primary text-[15px] md:text-[13px] font-bold mb-1 leading-tight line-clamp-2">
                  {decodeHtmlEntities(cat.name)}
                </h3>
  
                <p className="text-[12px] md:text-[11px] text-slate-500 font-medium flex items-center gap-1 md:justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50 md:hidden"></span>
                  {cat.count || 0} Products
                </p>
              </div>
              <div className="flex md:hidden shrink-0 text-slate-300 pr-2 group-hover:text-brand-primary transition-colors">
                 <ChevronRight size={20} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export const CategoryBar = () => {
  const [categories, setCategories] = useState<WooCategory[]>([]);
  const { slug } = useParams<{ slug?: string }>();

  useEffect(() => {
    wooApi
      .getCategories()
      .then(setCategories)
      .catch((err) => console.error("Category fetch failed:", err));
  }, []);

  return (
    <div className="bg-white border-b border-slate-100 sticky top-[72px] md:top-[128px] z-40">
      <div className="container mx-auto px-4 py-3 overflow-x-auto scroller-hidden">
        <div className="flex gap-4 md:gap-8 whitespace-nowrap">
          <Link
            to="/"
            className={`text-[13px] font-bold uppercase tracking-wider transition-colors ${!slug ? "text-brand-primary" : "text-slate-400 hover:text-brand-primary"}`}
          >
            All Products
          </Link>
          {categories.filter(c => !c.parent || c.parent === 0).map((cat) => (
            <Link
              to={`/category/${cat.slug}`}
              key={cat.id}
              className={`text-[13px] font-bold uppercase tracking-wider transition-colors ${slug === cat.slug ? "text-brand-primary" : "text-slate-400 hover:text-brand-primary"}`}
            >
              {decodeHtmlEntities(cat.name)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ProductCard = ({ product }: { product: WooProduct }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col shadow-sm hover:border-blue-200 hover:shadow-md transition-all group h-full"
    >
      <Link
        to={`/product/${product.slug}`}
        className="relative h-32 md:h-40 bg-slate-50 rounded-lg mb-3 overflow-hidden block"
      >
        {product.sale_price && (
          <span className="absolute top-2 left-2 z-10 text-[9px] font-black bg-brand-primary text-white px-2 py-0.5 rounded uppercase tracking-tighter">
            Sale
          </span>
        )}
        <img
          src={product.images[0]?.src}
          alt={product.images[0]?.alt || decodeHtmlEntities(product.name)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-slate-400 hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0"
        >
          <Heart size={14} />
        </button>
      </Link>

      <div className="flex flex-col flex-grow min-w-0">
        <span className="text-[10px] font-bold text-brand-primary mb-1 uppercase tracking-wider">
          {decodeHtmlEntities(product.categories[0]?.name)}
        </span>
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-xs font-bold leading-tight mb-2 h-8 line-clamp-2 text-slate-900 group-hover:text-brand-primary transition-colors">
            {decodeHtmlEntities(product.name)}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-yellow-400">
            <Star size={10} fill="currentColor" stroke="none" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold">
            {product.average_rating}
          </span>
          <span className="text-[10px] text-slate-200">|</span>
          <span className="text-[10px] text-slate-400">
            ({product.rating_count})
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div>
            {product.price_html ? (
              <div 
                className="woo-price text-sm"
                dangerouslySetInnerHTML={{ __html: product.price_html.replace(/Price range/gi, '').replace(/가격 범위/g, '').replace(/范[围|圍][^<]*/g, '').replace(/价格[^<]*/g, '') }} 
              />
            ) : (
              <>
                <span className="text-sm font-black text-slate-900">
                  ${product.price}
                </span>
                {product.regular_price &&
                  product.regular_price !== product.price && (
                    <span className="ml-1 text-[10px] line-through text-slate-300 font-bold">
                      ${product.regular_price}
                    </span>
                  )}
              </>
            )}
            <span className="block text-[9px] text-slate-400 font-medium">
              In Stock
            </span>
          </div>
          {product.type === 'variable' ? (
            <Link
              to={`/product/${product.slug}`}
              className="bg-brand-primary text-white px-3 py-1.5 rounded-lg hover:bg-brand-secondary transition-colors shadow-sm text-[11px] font-bold"
            >
              Select
            </Link>
          ) : (
            <button
              id={`add-btn-${product.id}`}
              onClick={(e) => {
                e.preventDefault();
                if (!product.price || parseFloat(product.price) <= 0) {
                  alert("This product is currently unavailable for purchase (no price set).");
                  return;
                }
                wooApi.addToCart(product, 1).catch(console.error);
                const btn = document.getElementById(`add-btn-${product.id}`);
                if (btn) {
                  const original = btn.innerHTML;
                  btn.innerHTML = `<svg class="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`;
                  setTimeout(() => (btn.innerHTML = original), 2000);
                }
              }}
              className="bg-brand-primary text-white p-2 rounded-lg hover:bg-brand-secondary transition-colors shadow-sm"
            >
              <ShoppingCart size={14} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ProductGrid = ({
  title = "Featured Products",
}: {
  title?: string;
}) => {
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || undefined;

  useEffect(() => {
    setLoading(true);
    setError(null);
    wooApi
      .getProducts({ category: slug, search: searchQuery, per_page: 8 })
      .then((res) => {
        setProducts(res.products);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load products");
        setLoading(false);
      });
  }, [slug, searchQuery]);

  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : slug
                ? `Products in ${slug}`
                : title}
          </h2>
          {!searchQuery && !slug && (
            <p className="text-slate-500 text-sm font-medium">
              Everything you need for high-performance operations.
            </p>
          )}
        </div>
        {!searchQuery && !slug && (
          <Link
            to="/shop"
            className="text-brand-primary font-bold text-sm hover:underline"
          >
            View All Products →
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-slate-100 animate-pulse rounded-xl"
            ></div>
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center border border-red-200 bg-red-50 rounded-xl">
          <h3 className="text-red-600 font-bold text-lg mb-2">
            Error Loading Products
          </h3>
          <p className="text-red-500 max-w-lg mx-auto">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center text-slate-500 font-medium">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {products.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

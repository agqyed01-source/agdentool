import React, { useEffect, useState } from "react";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { motion } from "motion/react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { wooApi, WooProduct, WooCategory } from "../services/woo";

export const ShopByCategoryBlock = () => {
  const [categories, setCategories] = useState<WooCategory[]>([]);

  useEffect(() => {
    wooApi
      .getCategories()
      .then(setCategories)
      .catch((err) => console.error("Category fetch failed:", err));
  }, []);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
          Shop by Category
        </h2>
        <Link
          to="/category/all"
          className="text-brand-primary text-sm font-bold flex items-center hover:underline"
        >
          View All Categories <span className="ml-1">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.slice(0, 6).map((cat) => (
          <Link
            to={`/category/${cat.slug}`}
            key={cat.id}
            className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center hover:border-brand-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all group"
          >
            <div className="w-full aspect-square mb-4 p-2">
              <img
                src={
                  cat.image?.src ||
                  "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=200"
                }
                alt={cat.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-brand-primary text-[13px] font-bold text-center mb-1 leading-tight">
              {cat.name}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium text-center">
              {cat.count || 0}+ Products
            </p>
          </Link>
        ))}
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
          {categories.map((cat) => (
            <Link
              to={`/category/${cat.slug}`}
              key={cat.id}
              className={`text-[13px] font-bold uppercase tracking-wider transition-colors ${slug === cat.slug ? "text-brand-primary" : "text-slate-400 hover:text-brand-primary"}`}
            >
              {cat.name}
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
          alt={product.images[0]?.alt || product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md text-slate-400 hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0"
        >
          <Heart size={14} />
        </button>
      </Link>

      <div className="flex flex-col flex-grow">
        <span className="text-[10px] font-bold text-brand-primary mb-1 uppercase tracking-wider">
          {product.categories[0]?.name}
        </span>
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-xs font-bold leading-tight mb-2 h-8 line-clamp-2 text-slate-900 group-hover:text-brand-primary transition-colors">
            {product.name}
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
            <span className="text-sm font-black text-slate-900">
              ${product.price}
            </span>
            {product.regular_price &&
              product.regular_price !== product.price && (
                <span className="ml-1 text-[10px] line-through text-slate-300 font-bold">
                  ${product.regular_price}
                </span>
              )}
            <span className="block text-[9px] text-slate-400 font-medium">
              In Stock
            </span>
          </div>
          <button
            id={`add-btn-${product.id}`}
            onClick={(e) => {
              e.preventDefault();
              wooApi.addToCart(product, 1);
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
      .getProducts({ category: slug, search: searchQuery })
      .then((data) => {
        setProducts(data);
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
              Everything your clinic needs for high-performance dentistry.
            </p>
          )}
        </div>
        {!searchQuery && !slug && (
          <Link
            to="/category/featured"
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

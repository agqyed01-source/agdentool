import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { wooApi, WooProduct } from '../services/woo';
import { ShoppingCart, Star, ShieldCheck, Truck } from 'lucide-react';

export const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<WooProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      setError(null);
      wooApi.getProductBySlug(slug).then(data => {
        setProduct(data);
        setLoading(false);
      }).catch(err => {
        setError(err.message || 'Failed to load product');
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Product</h1>
        <p className="text-red-500 max-w-lg mx-auto">{error}</p>
        <Link to="/" className="inline-block mt-8 bg-brand-primary text-white font-bold py-2 px-6 rounded-lg">Return to Home</Link>
      </div>
    );
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Seo 
        title={product.name}
        description={product.short_description.replace(/<[^>]+>/g, '')}
        type="product"
        image={product.images[0]?.src}
        jsonLd={{
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.name,
          "image": product.images.map(img => img.src),
          "description": product.short_description.replace(/<[^>]+>/g, ''),
          "sku": product.id.toString(),
          "offers": {
            "@type": "Offer",
            "url": `https://yourdentalsite.com/product/${product.slug}`,
            "priceCurrency": "USD",
            "price": product.price,
            "availability": "https://schema.org/InStock"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.average_rating,
            "reviewCount": product.rating_count
          }
        }}
      />

      <div className="mb-6 text-sm text-slate-500 font-medium">
        <Link to="/" className="hover:text-brand-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/category/${product.categories[0]?.slug}`} className="hover:text-brand-primary">
          {product.categories[0]?.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12 bg-white p-6 md:p-10 rounded-2xl border border-slate-100 shadow-sm">
        {/* Product Image Gallery */}
        <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 p-8 flex items-center justify-center">
          <img 
            src={product.images[0]?.src} 
            alt={product.images[0]?.alt || product.name} 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-2">
            {product.categories[0]?.name}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
             <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  <Star size={16} fill="currentColor" stroke="none" />
                  <Star size={16} fill="currentColor" stroke="none" />
                  <Star size={16} fill="currentColor" stroke="none" />
                  <Star size={16} fill="currentColor" stroke="none" />
                  <Star size={16} fill="currentColor" stroke="none" />
                </div>
                <span className="font-bold text-slate-900 ml-1">{product.average_rating}</span>
             </div>
             <span className="text-slate-300">|</span>
             <a href="#reviews" className="text-sm font-medium text-brand-primary hover:underline">
               {product.rating_count} Patient Reviews
             </a>
          </div>

          <div className="mb-8">
            <span className="text-4xl font-black text-slate-900">${product.price}</span>
            {product.regular_price !== product.price && (
              <span className="text-lg text-slate-400 line-through font-bold ml-3">${product.regular_price}</span>
            )}
          </div>

          <div 
            className="prose prose-sm text-slate-600 mb-8"
            dangerouslySetInnerHTML={{ __html: product.description }} 
          />

          <div className="flex flex-wrap gap-4 mt-auto border-t border-slate-100 pt-8">
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden w-32">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-slate-500 hover:bg-slate-50 transition-colors font-bold cursor-pointer">-</button>
              <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} className="w-full text-center font-bold text-slate-900 outline-none" />
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-slate-500 hover:bg-slate-50 transition-colors font-bold cursor-pointer">+</button>
            </div>
            <button 
              onClick={() => {
                wooApi.addToCart(product, quantity);
                // Simple feedback
                const btn = document.getElementById('add-btn');
                if (btn) {
                  const original = btn.innerHTML;
                  btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Added`;
                  setTimeout(() => btn.innerHTML = original, 2000);
                }
              }}
              id="add-btn"
              className="flex-grow bg-brand-primary text-white font-bold text-lg rounded-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 py-4"
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-slate-600 font-medium">
             <div className="flex gap-2 items-start">
               <Truck className="text-brand-primary shrink-0" size={20} />
               <span>Free next-day delivery for Professional members</span>
             </div>
             <div className="flex gap-2 items-start">
               <ShieldCheck className="text-brand-primary shrink-0" size={20} />
               <span>2-Year Manufacturer Warranty included</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

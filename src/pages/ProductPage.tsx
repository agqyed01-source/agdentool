import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { wooApi, WooProduct, WooVariation } from '../services/woo';
import { decodeHtmlEntities } from '../utils/format';
import { ShoppingCart, Star, ShieldCheck, Truck } from 'lucide-react';
import { ProductReviews } from '../components/ProductReviews';
import { WhatsAppAgents } from '../components/FooterAndNav';

export const ProductPage = () => {
  const { i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<WooProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [variationsData, setVariationsData] = useState<WooVariation[]>([]);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [showStickyAdd, setShowStickyAdd] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const addToCartRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const imageGalleryRef = useRef<HTMLDivElement>(null);

  const currentImageSrc = product?.images[selectedImageIndex]?.src || product?.images[0]?.src || '';
  const isImageLoading = currentImageSrc ? !loadedImages[currentImageSrc] : false;

  useEffect(() => {
    const observerAdd = new IntersectionObserver(
      ([entry]) => {
        // Show sticky button only when the target is NOT visible,
        // which means top of screen is past it or we haven't scrolled to it.
        // Actually, since we want this on mobile when add to cart is not in view:
        setShowStickyAdd(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    if (addToCartRef.current) {
      observerAdd.observe(addToCartRef.current);
    }

    const observerHeader = new IntersectionObserver(
      ([entry]) => {
        if (entry.boundingClientRect.bottom < 0) {
            setShowStickyHeader(true);
        } else {
            setShowStickyHeader(false);
        }
      },
      { threshold: 0 }
    );
    if (imageGalleryRef.current) {
      observerHeader.observe(imageGalleryRef.current);
    }

    return () => {
        observerAdd.disconnect();
        observerHeader.disconnect();
    };
  }, [product]);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      setError(null);
      setSelectedImageIndex(0);
      wooApi.getProductBySlug(slug).then(data => {
        if (!data) {
          setError("Product not found");
          setLoading(false);
          return;
        }
        setProduct(data);
        // Initialize default variations if any
        if (data.type === 'variable' && data.attributes) {
           const initialVars: Record<string, string> = {};
           if (data.default_attributes && data.default_attributes.length > 0) {
             data.default_attributes.forEach(attr => {
               let parentAttr = data.attributes.find(pa => pa.id !== 0 && pa.id === attr.id) ||
                                data.attributes.find(pa => pa.name.toLowerCase() === attr.name.toLowerCase() || 
                                                          pa.name.toLowerCase().replace(/\s+/g, '-') === attr.name.toLowerCase() || 
                                                          `pa_${pa.name.toLowerCase().replace(/\s+/g, '-')}` === attr.name.toLowerCase());
               const canonicalName = parentAttr ? parentAttr.name : attr.name;
               let exactOption = attr.option;
               if (parentAttr && parentAttr.options) {
                  const normOption = attr.option.toLowerCase().replace(/%[0-9A-F]{2}/gi, '').replace(/[^a-z0-9]/g, '');
                  const match = parentAttr.options.find(opt => opt.toLowerCase().replace(/%[0-9A-F]{2}/gi, '').replace(/[^a-z0-9]/g, '') === normOption || opt.toLowerCase() === attr.option.toLowerCase());
                  if (match) exactOption = match;
               }
               initialVars[canonicalName] = exactOption;
             });
           }
           setSelectedVariations(initialVars);
           wooApi.getProductVariations(data.id).then(vars => {
             setVariationsData(vars);
           });
        }
        setLoading(false);
      }).catch(err => {
        setError(err.message || 'Failed to load product');
        setLoading(false);
      });
    }
  }, [slug, i18n.language]);

  // Find current variation based on selected attributes
  const currentVariation = React.useMemo(() => {
    if (!variationsData || variationsData.length === 0 || !product) return null;

    // Ensure all required attributes are selected first
    if (product.attributes) {
      const requiredAttributes = product.attributes.filter(a => a.variation);
      const isMissing = requiredAttributes.some(a => !(selectedVariations[a.name] || selectedVariations[a.name.toLowerCase()]));
      if (isMissing) return null;
    }

    return variationsData.find(v => {
      // Check if every attribute in the variation matches the selected variations
      return v.attributes.every(attr => {
        if (attr.option === "") return true; // Means Any option
        
        let parentAttr;
        if (product && product.attributes) {
           parentAttr = product.attributes.find(pa => pa.id !== 0 && pa.id === attr.id) ||
                        product.attributes.find(pa => pa.name.toLowerCase() === attr.name.toLowerCase() || 
                                                      pa.name.toLowerCase().replace(/\s+/g, '-') === attr.name.toLowerCase() || 
                                                      `pa_${pa.name.toLowerCase().replace(/\s+/g, '-')}` === attr.name.toLowerCase());
        }
        
        const canonicalName = parentAttr ? parentAttr.name : attr.name;
        const selected = selectedVariations[canonicalName] || selectedVariations[attr.name] || selectedVariations[attr.name.toLowerCase()];
        
        if (!selected) return false;

        const normSelected = selected.toLowerCase().replace(/%[0-9A-F]{2}/gi, '').replace(/[^a-z0-9]/g, '');
        const normOption = attr.option.toLowerCase().replace(/%[0-9A-F]{2}/gi, '').replace(/[^a-z0-9]/g, '');
        
        return normSelected === normOption || selected.toLowerCase() === attr.option.toLowerCase();
      });
    });
  }, [variationsData, selectedVariations, product]);

  useEffect(() => {
    if (currentVariation?.image?.src && product) {
      const idx = product.images.findIndex(img => img.src === currentVariation.image?.src || img.id === currentVariation.image?.id);
      if (idx !== -1) {
        setSelectedImageIndex(idx);
      } else {
        // If the image is not in the gallery, add it temporarily so it can be selected
        setProduct((prev) => {
          if (!prev) return prev;
          if (prev.images.some(img => img.src === currentVariation.image!.src)) return prev;
          return {
            ...prev,
            images: [...prev.images, currentVariation.image!]
          };
        });
        setSelectedImageIndex(product.images.length);
      }
    }
  }, [currentVariation, product]);

  const currentPrice = currentVariation 
    ? (currentVariation.price || currentVariation.sale_price || currentVariation.regular_price)
    : product?.price;

  const isOutOfStock = (product?.type === 'variable' && currentVariation)
    ? currentVariation.stock_status === 'outofstock'
    : product?.stock_status === 'outofstock';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 animate-pulse">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-4 bg-slate-200 rounded w-12"></div>
          <div className="h-4 w-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-4 w-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-32"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 bg-white p-6 md:p-10 rounded-2xl border border-slate-100 shadow-sm mb-12">
          {/* Skeleton Image Gallery */}
          <div className="flex flex-col gap-4 min-w-0">
            <div className="aspect-square w-full bg-slate-100 rounded-xl border border-slate-100"></div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-slate-100"></div>
              <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-slate-100"></div>
              <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-slate-100"></div>
            </div>
          </div>
          
          {/* Skeleton Info */}
          <div className="flex flex-col">
            <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
            <div className="h-10 md:h-12 bg-slate-200 rounded w-3/4 mb-4"></div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="h-4 bg-slate-200 rounded w-32"></div>
            </div>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="h-8 bg-slate-200 rounded w-32"></div>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
            
            <div className="h-px bg-slate-100 w-full mb-8"></div>
            
            <div className="mb-8">
              <div className="h-4 bg-slate-200 rounded w-24 mb-4"></div>
              <div className="flex gap-4">
                 <div className="h-12 w-32 bg-slate-200 rounded-lg"></div>
                 <div className="h-12 w-full bg-slate-200 rounded-lg"></div>
              </div>
            </div>
            
            <div className="mt-8 bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
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
    <>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Seo 
          title={decodeHtmlEntities(product.name)}
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
            "price": currentPrice,
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
          {decodeHtmlEntities(product.categories[0]?.name)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{decodeHtmlEntities(product.name)}</span>
      </div>

      {/* Mobile Sticky Header for Image & Variation Name */}
      <div 
        className={`fixed top-[73px] left-0 right-0 z-[40] bg-white border-b border-slate-200 p-3 shadow-sm transition-transform duration-300 md:hidden flex items-start gap-4 ${showStickyHeader ? 'translate-y-0' : '-translate-y-[150%]'}`}
      >
        <div className="w-[40%] aspect-square max-w-[160px] bg-slate-50 border border-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
          <img 
            src={currentImageSrc} 
            alt="Current Variant" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1 pt-1">
          <span className="text-sm font-bold text-slate-900 line-clamp-2">{decodeHtmlEntities(product.name)}</span>
          {currentVariation ? (
             <span className="text-sm text-brand-primary font-bold mt-1 truncate">
                 {currentVariation.attributes.filter(a => a.option).map(a => a.option).join(', ')}
             </span>
          ) : (
             <span className="text-sm text-slate-500 mt-1 truncate">
                 {Object.values(selectedVariations).filter(v => v).join(', ') || 'Select options'}
             </span>
          )}
          <div className="font-bold text-slate-900 mt-1">
            {currentVariation ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg">${currentVariation.price}</span>
                {currentVariation.regular_price && currentVariation.regular_price !== currentVariation.price && (
                  <span className="text-xs text-slate-400 line-through font-bold">${currentVariation.regular_price}</span>
                )}
              </div>
            ) : product.price_html ? (
              <div 
                className="woo-price text-lg"
                dangerouslySetInnerHTML={{ __html: product.price_html.replace(/Price range/gi, '').replace(/가격 범위/g, '').replace(/范[围|圍][^<]*/g, '').replace(/价格[^<]*/g, '') }} 
              />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-lg">${product.price}</span>
                {product.regular_price !== product.price && (
                  <span className="text-xs text-slate-400 line-through font-bold">${product.regular_price}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 bg-white p-6 md:p-10 rounded-2xl border border-slate-100 shadow-sm mb-12">
        {/* Product Image Gallery */}
        <div ref={imageGalleryRef} className="flex flex-col gap-4 min-w-0">
          <div className="aspect-square w-full bg-slate-50 rounded-xl border border-slate-100 overflow-hidden relative flex items-center justify-center p-4 md:p-8">
            {isImageLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
              </div>
            )}
            <img 
              key={currentImageSrc}
              ref={imgRef}
              src={currentImageSrc} 
              alt={product.images[selectedImageIndex]?.alt || decodeHtmlEntities(product.name)} 
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
              referrerPolicy="no-referrer"
              onLoad={() => {
                if (currentImageSrc) setLoadedImages(prev => ({ ...prev, [currentImageSrc]: true }));
              }}
              onError={() => {
                if (currentImageSrc) setLoadedImages(prev => ({ ...prev, [currentImageSrc]: true }));
              }}
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((image, idx) => (
                <button
                  key={image.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-brand-primary' : 'border-transparent hover:border-slate-300'}`}
                >
                  <img
                    src={image.src}
                    alt={image.alt || `${decodeHtmlEntities(product.name)} - Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-2">
            {decodeHtmlEntities(product.categories[0]?.name)}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            {decodeHtmlEntities(product.name)}
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
             <a href="#reviews" onClick={(e) => { e.preventDefault(); setActiveTab('reviews'); document.getElementById('details-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-medium text-brand-primary hover:underline">
               {product.rating_count} Reviews
             </a>
          </div>

          <div className="mb-8 font-black text-slate-900 flex items-center">
            {currentVariation ? (
              <>
                <span className="text-4xl">${currentVariation.price}</span>
                {currentVariation.regular_price && currentVariation.regular_price !== currentVariation.price && (
                  <span className="text-lg text-slate-400 line-through font-bold ml-3">${currentVariation.regular_price}</span>
                )}
              </>
            ) : product.price_html ? (
              <div 
                className="woo-price text-4xl"
                dangerouslySetInnerHTML={{ __html: product.price_html.replace(/Price range/gi, '').replace(/가격 범위/g, '').replace(/范[围|圍][^<]*/g, '').replace(/价格[^<]*/g, '') }} 
              />
            ) : (
              <>
                <span className="text-4xl">${product.price}</span>
                {product.regular_price !== product.price && (
                  <span className="text-lg text-slate-400 line-through font-bold ml-3">${product.regular_price}</span>
                )}
              </>
            )}
          </div>

          <div 
            className="prose prose-sm text-slate-600 mb-6 max-w-full break-words overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: product.short_description || '' }} 
          />

          {/* Product Attributes / Variations */}
          <div ref={addToCartRef} className="scroll-mt-32">
            {product.type === 'variable' && product.attributes && product.attributes.length > 0 && (
              <div className="mb-6 space-y-5">
                {product.attributes.filter(attr => attr.variation).map(attr => (
                  <div key={attr.id || attr.name} className="flex flex-col">
                    <label className="text-sm font-semibold text-slate-900 mb-3">{attr.name}: <span className="font-normal text-slate-500">{selectedVariations[attr.name]}</span></label>
                    <div className="flex flex-wrap gap-2">
                       {attr.options.map(opt => (
                         <button
                           key={opt}
                           onClick={() => setSelectedVariations(prev => ({ ...prev, [attr.name]: opt }))}
                           className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                             selectedVariations[attr.name] === opt 
                               ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' 
                               : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                           }`}
                         >
                           {opt}
                         </button>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-auto border-t border-slate-100 pt-8">
              <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden w-32">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-slate-500 hover:bg-slate-50 transition-colors font-bold cursor-pointer">-</button>
                <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} className="w-full text-center font-bold text-slate-900 outline-none" />
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-slate-500 hover:bg-slate-50 transition-colors font-bold cursor-pointer">+</button>
              </div>
              <button 
                disabled={isOutOfStock}
                onClick={() => {
                  if (isOutOfStock) return;
                  if (product.type === 'variable') {
                    const requiredAttributes = product.attributes?.filter(a => a.variation) || [];
                    const missingAttributes = requiredAttributes.filter(a => !selectedVariations[a.name]);
                    if (missingAttributes.length > 0) {
                      alert(`Please select: ${missingAttributes.map(a => a.name).join(', ')}`);
                      return;
                    }
                  }
                  if (!currentPrice || parseFloat(currentPrice) <= 0) {
                    alert("This product is currently unavailable for purchase (no price set).");
                    return;
                  }
                  wooApi.addToCart({ 
                    ...product, 
                    price: currentPrice,
                    images: currentVariation?.image?.src 
                      ? [{ id: currentVariation.image.id, src: currentVariation.image.src, alt: currentVariation.image.alt || '' }] 
                      : product.images
                  }, quantity, selectedVariations, currentVariation?.id).then(() => {
                    if (window.gtag) {
                      window.gtag('event', 'add_to_cart', {
                        currency: 'USD',
                        value: parseFloat(currentPrice || '0') * quantity,
                        items: [{
                          item_id: product.id.toString(),
                          item_name: product.name,
                          price: parseFloat(currentPrice || '0'),
                          quantity: quantity
                        }]
                      });
                    }
                  }).catch(console.error);
                  // Simple feedback
                  const btn = document.getElementById('add-btn');
                  if (btn) {
                    const original = btn.innerHTML;
                    btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Added`;
                    setTimeout(() => btn.innerHTML = original, 2000);
                  }
                }}
                id="add-btn"
                className={`flex-grow font-bold text-lg rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 py-4 ${
                  isOutOfStock
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-brand-primary text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5'
                }`}
              >
                <ShoppingCart size={20} /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
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

      {/* Product Full Details Section */}
      <div id="details-section" className="bg-white p-6 md:p-10 rounded-2xl border border-slate-100 shadow-sm scroll-mt-24">
        <div className="flex flex-wrap gap-8 border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-4 text-lg font-bold transition-colors relative ${activeTab === 'description' ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Product Details
            {activeTab === 'description' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-lg font-bold transition-colors relative ${activeTab === 'reviews' ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Reviews ({product.rating_count})
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full" />
            )}
          </button>
        </div>

        {activeTab === 'description' && (
          <div 
            className="prose prose-slate max-w-none px-2 break-words overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}

        {activeTab === 'reviews' && (
          <ProductReviews productId={product.id} initialCount={product.rating_count} averageRating={product.average_rating} />
        )}
      </div>

      <div 
        className={`fixed bottom-[56px] left-0 right-0 z-[40] bg-white border-t border-slate-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] transition-transform duration-300 md:hidden flex justify-center ${showStickyAdd ? 'translate-y-0' : 'translate-y-[150%]'}`}
      >
        <div className="flex items-center justify-between gap-4 w-full max-w-7xl">
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-slate-500 font-medium truncate">{decodeHtmlEntities(product.name)}</span>
            <span className="text-lg font-bold text-slate-900">${currentPrice}</span>
          </div>
          <button 
            disabled={isOutOfStock}
            onClick={() => {
               if (isOutOfStock) return;
               if (addToCartRef.current) {
                 addToCartRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
               }
            }}
            className={`font-bold px-6 py-3 rounded-lg shadow-sm whitespace-nowrap ${
              isOutOfStock
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-brand-primary text-white'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : (product.type === 'variable' ? 'Select Options' : 'Add to Cart')}
          </button>
        </div>
      </div>
    </div>
    <WhatsAppAgents />
    </>
  );
};

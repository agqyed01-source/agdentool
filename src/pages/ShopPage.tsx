import React, { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Search, Grid, List as ListIcon, ChevronDown, Filter } from "lucide-react";
import { Seo } from "../components/Seo";
import { wooApi, WooProduct, WooCategory } from "../services/woo";
import { ProductCard } from "../components/ProductSection";

export const ShopPage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  
  const [categories, setCategories] = useState<WooCategory[]>([]);
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const currentCategorySlug = slug && slug !== 'all' ? slug : undefined;

  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    wooApi.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    let orderby = 'popularity';
    let order = 'desc';
    if (sortBy === 'price-asc') { orderby = 'price'; order = 'asc'; }
    if (sortBy === 'price-desc') { orderby = 'price'; order = 'desc'; }
    if (sortBy === 'rating') { orderby = 'rating'; order = 'desc'; }

    wooApi
      .getProducts({ 
        category: currentCategorySlug, 
        search: searchQuery || undefined,
        page,
        per_page: 12,
        orderby,
        order
      })
      .then((res) => {
        setProducts(res.products);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || res.products.length);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load products");
        setLoading(false);
      });
  }, [currentCategorySlug, searchQuery, sortBy, page]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = fd.get('q') as string;
    if (q) {
      setSearchParams({ search: q });
    } else {
      setSearchParams({});
    }
  };

  const handleNextPage = () => setPage(p => Math.min(p + 1, totalPages));
  const handlePrevPage = () => setPage(p => Math.max(p - 1, 1));
  
  const paginatedProducts = products;

  return (
    <>
      <Seo 
        title={currentCategorySlug ? `Category: ${currentCategorySlug}` : "Shop Products"} 
        description={currentCategorySlug ? `Shop our premium selection of ${currentCategorySlug} products.` : "Browse our full range of premium products."}
      />
      
      <div className="bg-slate-50 py-6 border-b border-slate-200">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-slate-900 capitalize">
            {searchQuery ? `Search: "${searchQuery}"` : currentCategorySlug ? currentCategorySlug.replace(/-/g, ' ') : 'All Products'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 flex-shrink-0 space-y-8">
            {/* Search */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Search size={18} /> Search
              </h3>
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search products..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary">
                  <Search size={16} />
                </button>
              </form>
            </div>

            {/* Categories */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Filter size={18} /> Categories
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/shop" 
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!currentCategorySlug ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    All Products
                  </Link>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link 
                      to={`/category/${cat.slug}`}
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentCategorySlug === cat.slug ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {cat.name} <span className="text-slate-400 font-normal">({cat.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                Showing {products.length > 0 ? (page - 1) * 12 + 1 : 0}-{Math.min((page - 1) * 12 + products.length, totalCount)} of {totalCount} results
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm text-slate-500 font-medium hidden sm:inline">Sort by:</span>
                  <div className="relative">
                    <select 
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                      className="appearance-none pl-3 pr-8 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary bg-slate-50 w-full sm:w-auto"
                    >
                      <option value="popularity">Popularity</option>
                      <option value="rating">Average Rating</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                  </div>
                </div>

                <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 shrink-0">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Grid size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <ListIcon size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-xl"></div>
                 ))}
              </div>
            ) : error ? (
              <div className="py-12 text-center border border-red-200 bg-red-50 rounded-xl">
                <h3 className="text-red-600 font-bold text-lg mb-2">Error Loading Products</h3>
                <p className="text-red-500 max-w-lg mx-auto">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-xl border border-slate-200">
                <p className="text-slate-500 font-medium text-lg">No products found.</p>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProducts.map(product => (
                      <div key={product.id}>
                         <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedProducts.map(product => (
                      <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-6 hover:border-brand-primary/30 transition-colors">
                        <Link to={`/product/${product.slug}`} className="w-full sm:w-40 h-40 flex-shrink-0 bg-slate-50 rounded-lg overflow-hidden relative group">
                           {product.sale_price && (
                             <span className="absolute top-2 left-2 z-10 text-[9px] font-black bg-brand-primary text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">Sale</span>
                           )}
                           <img src={product.images[0]?.src} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" referrerPolicy="no-referrer" />
                        </Link>
                        <div className="flex-1 flex flex-col">
                           <span className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">{product.categories[0]?.name}</span>
                           <Link to={`/product/${product.slug}`} className="text-lg font-bold text-slate-900 hover:text-brand-primary mb-2 line-clamp-2">{product.name}</Link>
                           <div dangerouslySetInnerHTML={{ __html: product.short_description || '' }} className="text-sm text-slate-600 mb-4 line-clamp-2" />
                           <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                             <div className="text-xl font-black text-slate-900">
                               ${product.price}
                               {product.regular_price && product.regular_price !== product.price && (
                                 <span className="ml-2 text-sm line-through text-slate-400 font-bold">${product.regular_price}</span>
                               )}
                             </div>
                             <button
                               onClick={() => wooApi.addToCart(product, 1)}
                               className="bg-brand-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-secondary transition-colors shadow-sm flex items-center justify-center gap-2"
                             >
                               Add to Cart
                             </button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <button 
                      onClick={handlePrevPage}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border border-slate-200 font-medium text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    {/* Render page numbers */}
                    <div className="flex items-center gap-1 overflow-x-auto max-w-full sm:max-w-none flex-wrap hide-scrollbar">
                      {(() => {
                        const pages = [];
                        let startPage = Math.max(1, page - 2);
                        let endPage = Math.min(totalPages, page + 2);

                        if (startPage > 1) {
                          pages.push(
                            <button key={1} onClick={() => setPage(1)} className={`w-10 h-10 flex-shrink-0 rounded-lg font-bold text-sm transition-colors ${page === 1 ? 'bg-brand-primary text-white shadow-sm' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>1</button>
                          );
                          if (startPage > 2) pages.push(<span key="ellipsis-start" className="w-10 text-center text-slate-400">...</span>);
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button key={i} onClick={() => setPage(i)} className={`w-10 h-10 flex-shrink-0 rounded-lg font-bold text-sm transition-colors ${page === i ? 'bg-brand-primary text-white shadow-sm' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{i}</button>
                          );
                        }

                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) pages.push(<span key="ellipsis-end" className="w-10 text-center text-slate-400">...</span>);
                          pages.push(
                            <button key={totalPages} onClick={() => setPage(totalPages)} className={`w-10 h-10 flex-shrink-0 rounded-lg font-bold text-sm transition-colors ${page === totalPages ? 'bg-brand-primary text-white shadow-sm' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{totalPages}</button>
                          );
                        }

                        return pages;
                      })()}
                    </div>
                    <button 
                      onClick={handleNextPage}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg border border-slate-200 font-medium text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

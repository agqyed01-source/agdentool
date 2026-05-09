import React, { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Search, Grid, List as ListIcon, ChevronDown, Filter } from "lucide-react";
import { Seo } from "../components/Seo";
import { wooApi, WooProduct, WooCategory } from "../services/woo";
import { ProductCard } from "../components/ProductSection";
import { decodeHtmlEntities } from "../utils/format";

const CategoryNode = ({ node, depth = 0, currentCategorySlug }: { node: any, depth?: number, currentCategorySlug?: string }) => {
  const isActive = currentCategorySlug === node.slug;
  
  const hasActiveChild = (n: any): boolean => {
    if (n.slug === currentCategorySlug) return true;
    if (n.children) {
      return n.children.some((child: any) => hasActiveChild(child));
    }
    return false;
  };
  
  const shouldAutoExpand = hasActiveChild(node);
  const [isExpanded, setIsExpanded] = useState(shouldAutoExpand || depth === 0);
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <React.Fragment>
      <li className="relative group">
        <div className="flex items-center">
          <Link 
            to={`/category/${node.slug}`}
            className={`flex-1 flex px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'}`}
            style={{ paddingLeft: `${0.75 + depth * 1.5}rem` }}
          >
            {depth > 0 && <span className="w-2 h-px bg-slate-300 inline-block mr-2 my-auto -ml-1"></span>}
            <span className="truncate">{decodeHtmlEntities(node.name)}</span>
            <span className="text-slate-400 font-normal ml-auto pl-2">({node.count})</span>
          </Link>
          {hasChildren && (
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); setIsExpanded(!isExpanded); }} 
              className="p-1.5 ml-1 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded"
              aria-label={isExpanded ? "Collapse category" : "Expand category"}
            >
              <ChevronDown size={14} className={`transform transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
            </button>
          )}
        </div>
      </li>
      
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1 relative">
          <div className="absolute top-0 bottom-0 w-px bg-slate-200" style={{ left: `${0.75 + depth * 1.5 + 0.3}rem` }}></div>
          {node.children.map((child: any) => (
            <CategoryNode 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              currentCategorySlug={currentCategorySlug} 
            />
          ))}
        </div>
      )}
    </React.Fragment>
  );
};

export const ShopPage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  
  const [categories, setCategories] = useState<WooCategory[]>([]);
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('shopViewMode');
    return (saved === 'grid' || saved === 'list') ? saved : 'grid';
  });

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('shopViewMode', mode);
  };
  const [sortBy, setSortBy] = useState('popularity');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('shopItemsPerPage');
    return saved ? Number(saved) : 18;
  });
  
  const currentCategorySlug = slug && slug !== 'all' ? slug : undefined;
  
  // Find current category name to display properly
  const findCategoryName = (cats: WooCategory[], targetSlug: string): string | undefined => {
    for (const cat of cats) {
      if (cat.slug === targetSlug) return cat.name;
    }
    return undefined;
  };
  const currentCategoryName = currentCategorySlug ? findCategoryName(categories, currentCategorySlug) : undefined;

  const [totalCount, setTotalCount] = useState(0);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
        per_page: itemsPerPage,
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
  }, [currentCategorySlug, searchQuery, sortBy, page, itemsPerPage]);

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
        title={currentCategoryName ? `Category: ${decodeHtmlEntities(currentCategoryName)}` : "Shop Products"} 
        description={currentCategoryName ? `Shop our premium selection of ${decodeHtmlEntities(currentCategoryName)} products.` : "Browse our full range of premium products."}
      />
      
      <div className="bg-slate-50 py-6 border-b border-slate-200">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-900 capitalize">
            {searchQuery ? `Search: "${searchQuery}"` : currentCategoryName ? decodeHtmlEntities(currentCategoryName) : 'All Products'}
          </h1>
          <button 
            className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 shadow-sm"
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          >
            <Filter size={16} /> Filters & Categories
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`w-full lg:w-1/4 flex-shrink-0 space-y-8 ${showMobileSidebar ? 'block' : 'hidden lg:block'}`}>
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
              <ul className="space-y-1">
                <li>
                  <Link 
                    to="/shop" 
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!currentCategorySlug ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    All Products
                  </Link>
                </li>
                {(() => {
                  const buildTree = (cats: WooCategory[]) => {
                    const tree: (WooCategory & { children?: any[] })[] = [];
                    const map = new Map<number, any>();
                    cats.forEach(c => map.set(c.id, { ...c, children: [] }));
                    
                    cats.forEach(c => {
                      const parentId = typeof c.parent === 'string' ? parseInt(c.parent, 10) : c.parent;
                      if (parentId && parentId !== 0 && map.has(parentId)) {
                        map.get(parentId).children.push(map.get(c.id));
                      } else {
                        tree.push(map.get(c.id));
                      }
                    });
                    return tree;
                  };

                  return buildTree(categories).map(node => (
                    <CategoryNode 
                      key={node.id} 
                      node={node} 
                      currentCategorySlug={currentCategorySlug} 
                    />
                  ));
                })()}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                Showing {products.length > 0 ? (page - 1) * itemsPerPage + 1 : 0}-{Math.min((page - 1) * itemsPerPage + products.length, totalCount)} of {totalCount} results
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm text-slate-500 font-medium hidden sm:inline">Show:</span>
                  <div className="relative">
                    <select 
                      value={itemsPerPage}
                      onChange={(e) => { 
                        const val = Number(e.target.value);
                        setItemsPerPage(val); 
                        localStorage.setItem('shopItemsPerPage', String(val));
                        setPage(1); 
                      }}
                      className="appearance-none pl-3 pr-8 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary bg-slate-50 w-full sm:w-auto"
                    >
                      <option value={12}>12</option>
                      <option value={18}>18</option>
                      <option value={24}>24</option>
                      <option value={36}>36</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                  </div>
                </div>

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
                    onClick={() => handleViewModeChange('grid')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Grid size={16} />
                  </button>
                  <button 
                    onClick={() => handleViewModeChange('list')}
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
                 {[...Array(itemsPerPage)].map((_, i) => (
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
                           <span className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">{decodeHtmlEntities(product.categories[0]?.name)}</span>
                           <Link to={`/product/${product.slug}`} className="text-lg font-bold text-slate-900 hover:text-brand-primary mb-2 line-clamp-2">{decodeHtmlEntities(product.name)}</Link>
                           <div dangerouslySetInnerHTML={{ __html: product.short_description || '' }} className="text-sm text-slate-600 mb-4 line-clamp-2" />
                           <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                             <div className="text-xl font-black text-slate-900">
                               ${product.price}
                               {product.regular_price && product.regular_price !== product.price && (
                                 <span className="ml-2 text-sm line-through text-slate-400 font-bold">${product.regular_price}</span>
                               )}
                             </div>
                             {product.type === 'variable' ? (
                               <Link
                                 to={`/product/${product.slug}`}
                                 className="bg-brand-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-secondary transition-colors shadow-sm flex items-center justify-center gap-2"
                               >
                                 Select Options
                               </Link>
                             ) : (
                               <button
                                 onClick={(e) => {
                                   e.preventDefault();
                                   if (!product.price || parseFloat(product.price) <= 0) {
                                     alert("This product is currently unavailable for purchase (no price set).");
                                     return;
                                   }
                                   wooApi.addToCart(product, 1).catch(console.error);
                                 }}
                                 className="bg-brand-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-secondary transition-colors shadow-sm flex items-center justify-center gap-2"
                               >
                                 Add to Cart
                               </button>
                             )}
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

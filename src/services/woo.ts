/**
 * WooCommerce REST API Service
 * 
 * To connect to your real WooCommerce, add to your environment variables:
 * VITE_WOO_API_URL=https://your-wordpress-site.com/wp-json/wc/v3
 * VITE_WOO_CONSUMER_KEY=ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 * VITE_WOO_CONSUMER_SECRET=cs_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 */

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  categories: { id: number; name: string; slug: string }[];
  images: { id: number; src: string; alt: string }[];
  average_rating: string;
  rating_count: number;
}

// Mocking the data based on our existing frontend products for demonstration
const mockProducts: WooProduct[] = [
  {
    id: 1,
    name: 'High-Speed Air Turbine Handpiece',
    slug: 'high-speed-air-turbine-handpiece',
    permalink: '/product/high-speed-air-turbine-handpiece',
    description: '<p>Premium German-engineered high-speed handpiece.</p>',
    short_description: '<p>High-performance turbine.</p>',
    price: '499.00',
    regular_price: '599.00',
    sale_price: '499.00',
    categories: [{ id: 10, name: 'Handpieces', slug: 'handpieces' }],
    images: [{ id: 100, src: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400', alt: 'Handpiece' }],
    average_rating: '4.8',
    rating_count: 124
  },
  {
    id: 2,
    name: 'LED Ultrasonic Scaler System',
    slug: 'led-ultrasonic-scaler',
    permalink: '/product/led-ultrasonic-scaler',
    description: '<p>Advanced LED Ultrasonic Scaler System for precise and painless tartar removal.</p>',
    short_description: '<p>Precise ultrasonic scaler.</p>',
    price: '850.00',
    regular_price: '850.00',
    sale_price: '',
    categories: [{ id: 11, name: 'Equipment', slug: 'equipment' }],
    images: [{ id: 101, src: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=400', alt: 'LED Scaler' }],
    average_rating: '4.9',
    rating_count: 89
  }
];

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
  image?: { src: string };
}

export interface WooCartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  price: string;
  image: string;
}

export interface WooCart {
  items: WooCartItem[];
  totals: {
    total_items: number;
    total_price: string;
    total_discount?: string;
  };
  coupons?: { code: string, discount: string }[];
}

export interface WooUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface WooOrder {
  id: number;
  status: string;
  date_created: string;
  total: string;
  discount_total?: string;
  needs_payment?: boolean;
  payment_url?: string;
  payment_method_title?: string;
  line_items: {
    id: number;
    name: string;
    product_id: number;
    quantity: number;
    total: string;
  }[];
}

// Mock categories for demonstration
const mockCategories: WooCategory[] = [
  { id: 10, name: 'Handpieces', slug: 'handpieces', count: 42, image: { src: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400' } },
  { id: 11, name: 'Equipment', slug: 'equipment', count: 18, image: { src: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=400' } },
  { id: 12, name: 'Diagnostics', slug: 'diagnostics', count: 35 },
  { id: 13, name: 'Sterilization', slug: 'sterilization', count: 24 },
  { id: 14, name: 'Anesthetics', slug: 'anesthetics', count: 56 },
  { id: 15, name: 'Furniture', slug: 'furniture', count: 12 },
  { id: 16, name: 'Whitening', slug: 'whitening', count: 89 },
  { id: 17, name: 'Oral Care', slug: 'oral-care', count: 125 }
];

async function fetchWoo(endpoint: string, queryParams: Record<string, string> = {}, method: string = 'GET', bodyData?: any) {
  const res = await fetch('/api/woo/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, queryParams, method, bodyData }),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server Error: ${res.statusText}`);
  }
  
  return res.json();
}

export const wooApi = {
  getProducts: async (params?: { category?: string, search?: string }): Promise<WooProduct[]> => {
    try {
      const query: Record<string, string> = {};
      if (params?.search) query.search = params.search;
      if (params?.category) {
        // fetch category id by slug first
        const cats = await wooApi.getCategories();
        const cat = cats.find(c => c.slug === params.category);
        if (cat) query.category = cat.id.toString();
      }
      const data = await fetchWoo('/products', query);
      if (!Array.isArray(data)) {
         throw new Error(data.message || 'WooCommerce API did not return an array of products');
      }
      return data;
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('not configured')) {
         // Fallback to mock data on error ONLY IF NOT CONFIGURED
      } else {
         throw err;
      }
    }

    return new Promise((resolve) => setTimeout(() => {
      let filtered = mockProducts;
      if (params?.category) {
        filtered = filtered.filter(p => p.categories.some(c => c.slug === params.category));
      }
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
      }
      resolve(filtered);
    }, 500));
  },
  
  getProductBySlug: async (slug: string): Promise<WooProduct | null> => {
    try {
      const products = await fetchWoo('/products', { slug });
      return products.length > 0 ? products[0] : null;
    } catch (err: any) {
      console.error(err);
      if (!err.message?.includes('not configured')) {
         throw err;
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = mockProducts.find(p => p.slug === slug);
        resolve(product || null);
      }, 300);
    });
  },

  getCategories: async (): Promise<WooCategory[]> => {
    try {
      const data = await fetchWoo('/products/categories', { hide_empty: 'true', per_page: '20' });
      if (!Array.isArray(data)) {
        throw new Error(data.message || 'WooCommerce API did not return an array of categories');
      }
      return data;
    } catch (err: any) {
      console.error(err);
      if (!err.message?.includes('not configured')) {
         throw err;
      }
    }
    return new Promise((resolve) => setTimeout(() => resolve(mockCategories), 300));
  },

  getMenus: async (): Promise<{id: number, title: string, url: string}[]> => {
    try {
      // WordPress menu API may not be available natively in WC,
      // Using main categories as navigation menus
      const cats = await wooApi.getCategories();
      return cats.map(c => ({ id: c.id, title: c.name, url: `/category/${c.slug}` }));
    } catch (err: any) {
      console.error(err);
      if (!err.message?.includes('not configured')) {
         throw err;
      }
    }
    return new Promise((resolve) => setTimeout(() => {
      resolve(mockCategories.map(c => ({ id: c.id, title: c.name, url: `/category/${c.slug}` })));
    }, 300));
  },

  // ---- Mock Cart API ----
  getCart: async (): Promise<WooCart> => {
    return new Promise((resolve) => setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(mockCartState)));
    }, 200));
  },

  addToCart: async (productOrId: number | WooProduct, quantity: number = 1): Promise<WooCart> => {
    let product: WooProduct | undefined;
    if (typeof productOrId === 'number') {
      product = mockProducts.find(p => p.id === productOrId);
      if (!product) {
         try {
            const fetched = await fetchWoo(`/products/${productOrId}`);
            if (fetched && fetched.id) product = fetched;
         } catch (err) {
            console.error('Failed to fetch product for cart', err);
         }
      }
    } else {
      product = productOrId;
    }
    
    return new Promise((resolve) => setTimeout(() => {
      if (product) {
        const existingItem = mockCartState.items.find(i => i.id === product!.id);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          mockCartState.items.push({
            key: `cart_item_${Date.now()}`,
            id: product.id,
            name: product.name,
            price: product.price || '0',
            quantity: quantity,
            image: product.images && product.images[0]?.src ? product.images[0].src : '',
          });
        }
        recalculateCart();
      }
      resolve({...mockCartState});
    }, 100));
  },

  removeFromCart: async (key: string): Promise<WooCart> => {
    return new Promise((resolve) => setTimeout(() => {
      mockCartState.items = mockCartState.items.filter(i => i.key !== key);
      recalculateCart();
      resolve({...mockCartState});
    }, 300));
  },

  applyCoupon: async (code: string): Promise<WooCart> => {
    try {
      const coupons = await fetchWoo('/coupons', { code });
      if (coupons && coupons.length > 0) {
        const coupon = coupons.find((c: any) => c.code.toLowerCase() === code.toLowerCase());
        if (coupon) {
          let discount = 0;
          if (coupon.discount_type === 'percent') {
            const subtotal = mockCartState.items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
            discount = subtotal * (parseFloat(coupon.amount) / 100);
          } else {
            discount = parseFloat(coupon.amount);
          }
          
          if (!mockCartState.coupons) mockCartState.coupons = [];
          if (!mockCartState.coupons.find(c => c.code.toLowerCase() === code.toLowerCase())) {
            mockCartState.coupons.push({ code: coupon.code, discount: discount.toFixed(2) });
            recalculateCart();
          }
          return mockCartState;
        }
      }
      throw new Error('Invalid coupon code');
    } catch (err: any) {
      console.error("Failed to apply coupon", err);
      // Mock fallback: if it's "discount10", give 10% off
      if (!mockCartState.coupons) mockCartState.coupons = [];
      if (code.toLowerCase() === 'discount10') {
         if (!mockCartState.coupons.find(c => c.code.toLowerCase() === code.toLowerCase())) {
           const subtotal = mockCartState.items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
           mockCartState.coupons.push({ code, discount: (subtotal * 0.1).toFixed(2) });
           recalculateCart();
         }
         return mockCartState;
      }
      throw new Error(err.message || 'Invalid coupon code');
    }
  },

  removeCoupon: async (code: string): Promise<WooCart> => {
    return new Promise((resolve) => setTimeout(() => {
      if (mockCartState.coupons) {
        mockCartState.coupons = mockCartState.coupons.filter(c => c.code.toLowerCase() !== code.toLowerCase());
        recalculateCart();
      }
      resolve({...mockCartState});
    }, 300));
  },

  // ---- Mock User & Orders API ----
  getCurrentUser: async (): Promise<WooUser | null> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockCurrentUser), 300));
  },
  
  login: async (email: string, password: string): Promise<WooUser> => {
    return new Promise((resolve, reject) => setTimeout(() => {
      if (email && password) {
        mockCurrentUser = { id: 1, email, first_name: 'Dr.', last_name: 'Smith' };
        saveUser();
        // pre-populate some demo orders if brand new user
        if (!localStorage.getItem(ORDERS_STORAGE_KEY)) {
           localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([{
            id: 1001,
            status: 'completed',
            date_created: new Date(Date.now() - 86400000 * 5).toISOString(),
            total: '1340.00',
            line_items: [
              { id: 1, name: 'High-Speed Air Turbine Handpiece', product_id: 1, quantity: 2, total: '998.00' }
            ]
          }]));
        }
        resolve(mockCurrentUser);
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 500));
  },

  logout: async (): Promise<void> => {
    return new Promise((resolve) => setTimeout(() => {
      mockCurrentUser = null;
      saveUser();
      resolve();
    }, 300));
  },

  getOrders: async (): Promise<WooOrder[]> => {
    return new Promise((resolve) => setTimeout(() => {
      if (!mockCurrentUser) return resolve([]);
      const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
      // sort latest first
      orders.sort((a: any, b: any) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());
      resolve(orders);
    }, 400));
  },

  getCountries: async (): Promise<any[]> => {
    try {
      const data = await fetchWoo('/data/countries');
      if (!Array.isArray(data)) {
        throw new Error(data.message || 'WooCommerce API did not return an array of countries');
      }
      return data;
    } catch (err: any) {
      console.error(err);
      if (!err.message?.includes('not configured')) {
         throw err;
      }
    }
    return [
       { code: 'US', name: 'United States', states: [{code: 'CA', name: 'California'}, {code: 'NY', name: 'New York'}] },
       { code: 'CA', name: 'Canada', states: [{code: 'ON', name: 'Ontario'}, {code: 'BC', name: 'British Columbia'}] }
    ];
  },

  getPaymentGateways: async (): Promise<any[]> => {
    try {
      const gateways = await fetchWoo('/payment_gateways');
      if (Array.isArray(gateways)) {
         return gateways.filter(g => g.enabled);
      }
    } catch (err: any) {
      console.error(err);
    }
    // mock fallback
    return [
      { id: 'bacs', title: 'Direct bank transfer', description: 'Make your payment directly into our bank account.' },
      { id: 'cod', title: 'Cash on delivery', description: 'Pay with cash upon delivery.' }
    ];
  },

  clearCartAndCreateOrder: async (orderData?: any): Promise<WooOrder> => {
    if (mockCartState.items.length === 0) throw new Error("Cart is empty");
    try {
      const payload = {
        payment_method: orderData?.payment_method || 'bacs',
        payment_method_title: orderData?.payment_method_title || 'Direct Bank Transfer',
        set_paid: false,
        billing: orderData?.billing || {
          first_name: 'John',
          last_name: 'Doe',
          address_1: '969 Market',
          address_2: '',
          city: 'San Francisco',
          state: 'CA',
          postcode: '94103',
          country: 'US',
          email: 'john.doe@example.com',
          phone: '(555) 555-5555'
        },
        shipping: orderData?.shipping || {
          first_name: 'John',
          last_name: 'Doe',
          address_1: '969 Market',
          address_2: '',
          city: 'San Francisco',
          state: 'CA',
          postcode: '94103',
          country: 'US'
        },
        line_items: mockCartState.items.map(i => ({
          product_id: i.id,
          quantity: i.quantity
        })),
        coupon_lines: (mockCartState.coupons || []).map(c => ({ code: c.code }))
      };

      const newOrder = await fetchWoo('/orders', undefined, 'POST', payload);
      
      // clear cart
      mockCartState = { items: [], coupons: [], totals: { total_items: 0, total_price: '0.00', total_discount: '0.00' } };
      saveCart();
      return newOrder;
    } catch (err: any) {
      if (!err.message?.includes('not configured')) {
        console.error("Failed to create live order", err);
      }
      // Fallback to mock order
    }

    return new Promise((resolve) => setTimeout(() => {
      const newOrder: WooOrder = {
        id: Math.floor(Math.random() * 10000) + 1000,
        status: 'processing',
        date_created: new Date().toISOString(),
        total: mockCartState.totals.total_price,
        discount_total: mockCartState.totals.total_discount,
        payment_method_title: orderData?.payment_method_title || 'Direct Bank Transfer',
        line_items: mockCartState.items.map(i => ({
          id: Math.floor(Math.random() * 10000),
          name: i.name,
          product_id: i.id,
          quantity: i.quantity,
          total: (parseFloat(i.price) * i.quantity).toFixed(2)
        }))
      };
      
      // Save to local storage
      if (mockCurrentUser) {
        const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
        orders.push(newOrder);
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      }

      mockCartState = {
        items: [],
        coupons: [],
        totals: { total_items: 0, total_price: '0.00', total_discount: '0.00' }
      };
      saveCart();
      resolve(newOrder);
    }, 500));
  }
};

// ---- Mock Runtime State ----
const CART_STORAGE_KEY = 'dental_cart';
const USER_STORAGE_KEY = 'dental_user';
const ORDERS_STORAGE_KEY = 'dental_orders';

let mockCartState: WooCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || 'null') || {
  items: [],
  coupons: [],
  totals: { total_items: 0, total_price: '0.00', total_discount: '0.00' }
};

let mockCurrentUser: WooUser | null = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null');

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(mockCartState));
}

function saveUser() {
  if (mockCurrentUser) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockCurrentUser));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

function recalculateCart() {
  const totalItems = mockCartState.items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = mockCartState.items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
  
  let totalDiscount = 0;
  if (mockCartState.coupons) {
     mockCartState.coupons.forEach(c => {
         totalDiscount += parseFloat(c.discount);
     });
  }
  
  const totalPrice = Math.max(0, subtotal - totalDiscount);
  
  mockCartState.totals = {
    total_items: totalItems,
    total_price: totalPrice.toFixed(2),
    total_discount: totalDiscount.toFixed(2)
  };
  saveCart();
}



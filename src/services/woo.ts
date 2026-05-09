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
  type: string;
  permalink: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  categories: { id: number; name: string; slug: string }[];
  images: { id: number; src: string; alt: string }[];
  attributes: {
    id: number;
    name: string;
    options: string[];
    variation: boolean;
  }[];
  variations: number[];
  average_rating: string;
  rating_count: number;
}

// Mocking the data based on our existing frontend products for demonstration
const mockProducts: WooProduct[] = [
  {
    id: 1,
    name: "High-Speed Air Turbine Handpiece",
    slug: "high-speed-air-turbine-handpiece",
    permalink: "/product/high-speed-air-turbine-handpiece",
    description: "<p>Premium German-engineered high-speed handpiece.</p>",
    short_description: "<p>High-performance turbine.</p>",
    price: "499.00",
    regular_price: "599.00",
    sale_price: "499.00",
    categories: [{ id: 10, name: "Handpieces", slug: "handpieces" }],
    images: [
      {
        id: 100,
        src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400",
        alt: "Handpiece",
      },
    ],
    average_rating: "4.8",
    rating_count: 124,
    type: "simple",
    attributes: [],
    variations: [],
  },
  {
    id: 2,
    name: "LED Ultrasonic Scaler System",
    slug: "led-ultrasonic-scaler",
    permalink: "/product/led-ultrasonic-scaler",
    description:
      "<p>Advanced LED Ultrasonic Scaler System for precise and painless tartar removal.</p>",
    short_description: "<p>Precise ultrasonic scaler.</p>",
    price: "850.00",
    regular_price: "850.00",
    sale_price: "",
    categories: [{ id: 11, name: "Equipment", slug: "equipment" }],
    images: [
      {
        id: 101,
        src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=400",
        alt: "LED Scaler",
      },
    ],
    average_rating: "4.9",
    rating_count: 89,
    type: "simple",
    attributes: [],
    variations: [],
  },
];

export interface WooReview {
  id: number;
  product_id: number;
  date_created: string;
  reviewer: string;
  review: string;
  rating: number;
  verified: boolean;
  images?: string[];
}

const mockReviews: WooReview[] = [
  {
    id: 1,
    product_id: 1,
    date_created: new Date().toISOString(),
    reviewer: "Dr. Smith",
    review: "<p>These are top notch, exactly what our clinic needed. Very durable and affordable.</p>",
    rating: 5,
    verified: true,
    images: [] // no images for mock
  }
];

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
  image?: { src: string };
  parent?: number;
}

export interface WooCartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  price: string;
  image: string;
  variations?: Record<string, string>;
}

export interface WooCart {
  items: WooCartItem[];
  totals: {
    total_items: number;
    total_price: string;
    total_discount?: string;
  };
  coupons?: { code: string; discount: string }[];
}

export interface WooUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  username?: string;
  billing?: any;
  shipping?: any;
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
  {
    id: 10,
    name: "Handpieces",
    slug: "handpieces",
    count: 42,
    image: {
      src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400",
    },
  },
  {
    id: 11,
    name: "Equipment",
    slug: "equipment",
    count: 18,
    image: {
      src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=400",
    },
  },
  { id: 12, name: "Diagnostics", slug: "diagnostics", count: 35 },
  { id: 18, name: "X-Ray", slug: "x-ray", count: 15, parent: 12 },
  { id: 19, name: "Sensors", slug: "sensors", count: 20, parent: 12 },
  { id: 13, name: "Sterilization", slug: "sterilization", count: 24 },
  { id: 14, name: "Anesthetics", slug: "anesthetics", count: 56 },
  { id: 15, name: "Furniture", slug: "furniture", count: 12 },
  { id: 16, name: "Whitening", slug: "whitening", count: 89 },
  { id: 17, name: "Oral Care", slug: "oral-care", count: 125 },
];

async function fetchWoo(
  endpoint: string,
  queryParams: Record<string, string> = {},
  method: string = "GET",
  bodyData?: any,
  includeHeaders: boolean = false
) {
  const res = await fetch("/api/woo/fetch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint, queryParams, method, bodyData, includeHeaders }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server Error: ${res.statusText}`);
  }

  return res.json();
}

export const wooApi = {
  getProducts: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    per_page?: number;
    orderby?: string;
    order?: string;
  }): Promise<{ products: WooProduct[], totalPages: number, total: number }> => {
    try {
      const query: Record<string, string> = {};
      if (params?.search) query.search = params.search;
      if (params?.page) query.page = params.page.toString();
      if (params?.per_page) query.per_page = params.per_page.toString();
      if (params?.orderby) query.orderby = params.orderby;
      if (params?.order) query.order = params.order;

      if (params?.category) {
        // fetch category id by slug first
        const cats = await wooApi.getCategories();
        const cat = cats.find((c) => c.slug === params.category);
        if (cat) query.category = cat.id.toString();
      }
      const resData = await fetchWoo("/products", query, "GET", undefined, true);
      
      let data = resData.data || resData; // If headers included, result is wrapped in { data, headers }
      let totalPages = resData.headers ? parseInt(resData.headers['x-wp-totalpages'] || '1') : 1;
      let total = resData.headers ? parseInt(resData.headers['x-wp-total'] || '0') : data.length;

      if (!Array.isArray(data)) {
        throw new Error(
          data.message || "WooCommerce API did not return an array of products",
        );
      }
      return { products: data, totalPages, total };
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("not configured")) {
        // Fallback to mock data on error ONLY IF NOT CONFIGURED
      } else {
        throw err;
      }
    }

    return new Promise((resolve) =>
      setTimeout(() => {
        let filtered = mockProducts;
        if (params?.category) {
          filtered = filtered.filter((p) =>
            p.categories.some((c) => c.slug === params.category),
          );
        }
        if (params?.search) {
          const query = params.search.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              p.description.toLowerCase().includes(query),
          );
        }
        
        // Sorting
        if (params?.orderby === 'price') {
          filtered.sort((a, b) => params.order === 'desc' ? parseFloat(b.price) - parseFloat(a.price) : parseFloat(a.price) - parseFloat(b.price));
        } else if (params?.orderby === 'rating') {
          filtered.sort((a, b) => parseFloat(b.average_rating) - parseFloat(a.average_rating));
        }
        
        let total = filtered.length;
        let perPage = params?.per_page || 10;
        let page = params?.page || 1;
        let totalPages = Math.ceil(total / perPage);
        
        filtered = filtered.slice((page - 1) * perPage, page * perPage);
        
        resolve({ products: filtered, totalPages, total });
      }, 500),
    );
  },

  getProductBySlug: async (slug: string): Promise<WooProduct | null> => {
    try {
      const products = await fetchWoo("/products", { slug });
      return products.length > 0 ? products[0] : null;
    } catch (err: any) {
      console.error(err);
      if (!err.message?.includes("not configured")) {
        throw err;
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = mockProducts.find((p) => p.slug === slug);
        resolve(product || null);
      }, 300);
    });
  },

  getCategories: async (): Promise<WooCategory[]> => {
    try {
      const data = await fetchWoo("/products/categories", {
        per_page: "100",
        hide_empty: "false"
      });
      if (!Array.isArray(data)) {
        throw new Error(
          data.message ||
            "WooCommerce API did not return an array of categories",
        );
      }
      return data;
    } catch (err: any) {
      console.error(err);
      if (!err.message?.includes("not configured")) {
        throw err;
      }
    }
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockCategories), 300),
    );
  },

  getMenus: async (): Promise<{ id: number; title: string; url: string }[]> => {
    try {
      // WordPress menu API may not be available natively in WC,
      // Using main categories as navigation menus
      const cats = await wooApi.getCategories();
      return cats.map((c) => ({
        id: c.id,
        title: c.name,
        url: `/category/${c.slug}`,
      }));
    } catch (err: any) {
      console.error(err);
      if (!err.message?.includes("not configured")) {
        throw err;
      }
    }
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(
          mockCategories.map((c) => ({
            id: c.id,
            title: c.name,
            url: `/category/${c.slug}`,
          })),
        );
      }, 300),
    );
  },

  // ---- Mock Cart API ----
  getCart: async (): Promise<WooCart> => {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(mockCartState)));
      }, 200),
    );
  },

  addToCart: async (
    productOrId: number | WooProduct,
    quantity: number = 1,
    variations?: Record<string, string>
  ): Promise<WooCart> => {
    let product: WooProduct | undefined;
    if (typeof productOrId === "number") {
      product = mockProducts.find((p) => p.id === productOrId);
      if (!product) {
        try {
          const fetched = await fetchWoo(`/products/${productOrId}`);
          if (fetched && fetched.id) product = fetched;
        } catch (err) {
          console.error("Failed to fetch product for cart", err);
        }
      }
    } else {
      product = productOrId;
    }

    return new Promise((resolve) =>
      setTimeout(() => {
        if (product) {
          const varString = variations ? JSON.stringify(variations) : '{}';
          const existingItem = mockCartState.items.find(
            (i) => i.id === product!.id && JSON.stringify(i.variations || {}) === varString,
          );
          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            const nameSuffix = variations && Object.keys(variations).length > 0
              ? ` - ${Object.values(variations).join(', ')}` 
              : '';

            mockCartState.items.push({
              key: `cart_item_${Date.now()}`,
              id: product.id,
              name: `${product.name}${nameSuffix}`,
              price: product.price || "0",
              quantity: quantity,
              image:
                product.images && product.images[0]?.src
                  ? product.images[0].src
                  : "",
              variations: variations,
            });
          }
          recalculateCart();
        }
        resolve({ ...mockCartState });
      }, 100),
    );
  },

  removeFromCart: async (key: string): Promise<WooCart> => {
    return new Promise((resolve) =>
      setTimeout(() => {
        mockCartState.items = mockCartState.items.filter((i) => i.key !== key);
        recalculateCart();
        resolve({ ...mockCartState });
      }, 300),
    );
  },

  updateCartItemQuantity: async (key: string, quantity: number): Promise<WooCart> => {
    return new Promise((resolve) =>
      setTimeout(() => {
        const item = mockCartState.items.find((i) => i.key === key);
        if (item) {
          item.quantity = quantity;
        }
        recalculateCart();
        resolve({ ...mockCartState });
      }, 300),
    );
  },

  getCoupons: async (): Promise<any[]> => {
    try {
      const coupons = await fetchWoo("/coupons");
      if (Array.isArray(coupons)) {
        return coupons;
      }
      return [];
    } catch (err: any) {
      console.error("Failed to fetch coupons", err);
      return [
        { id: 1, code: 'WELCOME10', discount_type: 'percent', amount: '10.00', description: '10% off for new customers' },
        { id: 2, code: 'FREESHIP', discount_type: 'fixed_cart', amount: '0.00', description: 'Free shipping on orders over $50' }
      ];
    }
  },

  applyCoupon: async (code: string): Promise<WooCart> => {
    try {
      const coupons = await fetchWoo("/coupons", { code });
      if (coupons && coupons.length > 0) {
        const coupon = coupons.find(
          (c: any) => c.code.toLowerCase() === code.toLowerCase(),
        );
        if (coupon) {
          let discount = 0;
          if (coupon.discount_type === "percent") {
            const subtotal = mockCartState.items.reduce(
              (acc, item) => acc + parseFloat(item.price) * item.quantity,
              0,
            );
            discount = subtotal * (parseFloat(coupon.amount) / 100);
          } else {
            discount = parseFloat(coupon.amount);
          }

          if (!mockCartState.coupons) mockCartState.coupons = [];
          if (
            !mockCartState.coupons.find(
              (c) => c.code.toLowerCase() === code.toLowerCase(),
            )
          ) {
            mockCartState.coupons.push({
              code: coupon.code,
              discount: discount.toFixed(2),
            });
            recalculateCart();
          }
          return mockCartState;
        }
      }
      throw new Error("Invalid coupon code");
    } catch (err: any) {
      console.error("Failed to apply coupon", err);
      // Mock fallback: if it's "discount10", give 10% off
      if (!mockCartState.coupons) mockCartState.coupons = [];
      if (code.toLowerCase() === "discount10") {
        if (
          !mockCartState.coupons.find(
            (c) => c.code.toLowerCase() === code.toLowerCase(),
          )
        ) {
          const subtotal = mockCartState.items.reduce(
            (acc, item) => acc + parseFloat(item.price) * item.quantity,
            0,
          );
          mockCartState.coupons.push({
            code,
            discount: (subtotal * 0.1).toFixed(2),
          });
          recalculateCart();
        }
        return mockCartState;
      }
      throw new Error(err.message || "Invalid coupon code");
    }
  },

  removeCoupon: async (code: string): Promise<WooCart> => {
    return new Promise((resolve) =>
      setTimeout(() => {
        if (mockCartState.coupons) {
          mockCartState.coupons = mockCartState.coupons.filter(
            (c) => c.code.toLowerCase() !== code.toLowerCase(),
          );
          recalculateCart();
        }
        resolve({ ...mockCartState });
      }, 300),
    );
  },

  // ---- Mock User & Orders API ----
  getCurrentUser: async (): Promise<WooUser | null> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockCurrentUser), 300),
    );
  },

  register: async (data: { email: string; password?: string; first_name?: string; last_name?: string }): Promise<WooUser> => {
    try {
      const payload = {
        email: data.email,
        password: data.password || Math.random().toString(36).slice(2) + 'aA1!',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        username: data.email.split('@')[0]
      };
      const res = await fetchWoo('/customers', undefined, 'POST', payload);
      if (res && res.id) {
        mockCurrentUser = {
          id: res.id,
          email: res.email,
          first_name: res.first_name,
          last_name: res.last_name,
          role: res.role,
          username: res.username,
          billing: res.billing,
          shipping: res.shipping
        };
        saveUser();
        
        // Even for real API, we can cache locally for mock fallback if needed
        saveMockUser({
          email: data.email,
          password: data.password,
          user: mockCurrentUser
        });
        
        return mockCurrentUser;
      }
      throw new Error("Failed to create customer");
    } catch (err: any) {
      if (!err.message?.includes("not configured") && !err.message?.includes("not update default")) {
        throw err;
      }
      // fallback
      return new Promise((resolve) => setTimeout(() => {
        const newUser: WooUser = { 
          id: Date.now(), 
          email: data.email, 
          first_name: data.first_name || 'New', 
          last_name: data.last_name || 'User', 
          role: 'customer',
          username: data.email.split('@')[0]
        };
        
        saveMockUser({
          email: data.email,
          password: data.password,
          user: newUser
        });

        mockCurrentUser = newUser;
        saveUser();
        resolve(mockCurrentUser);
      }, 500));
    }
  },

  login: async (email: string, password?: string): Promise<WooUser> => {
    try {
      // Use the server-side login proxy for real backend password validation
      const authRes = await fetch('/api/woo/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!authRes.ok) {
        const errData = await authRes.json();
        throw new Error(errData.error || 'Login failed');
      }

      const customer = await authRes.json();
      
      if (!customer.id || customer.id === 0) {
        throw new Error('Authentication was successful, but your WooCommerce user profile could not be found. Please contact support.');
      }

      // Clear old session metadata to avoid conflicts between mock and real data
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem('WOO_SAVED_BILLING_INFO');
      
      mockCurrentUser = {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        role: customer.role || 'customer',
        username: customer.username,
        billing: customer.billing,
        shipping: customer.shipping
      };
      saveUser();
      
      // Update mock storage for consistency
      if (password) {
        saveMockUser({ email, password, user: mockCurrentUser });
      }

      return mockCurrentUser;
    } catch (err: any) {
      // If server route is missing or not configured, try mock fallback
      if (!err.message?.includes("not configured") && !err.message?.includes("not update default") && !err.message?.includes("fetch")) {
        throw err;
      }
      
      // Mock fallback
      return new Promise((resolve, reject) =>
        setTimeout(() => {
          const mockUsers = getMockUsers();
          const savedUser = mockUsers[email.toLowerCase()];

          if (savedUser) {
            if (savedUser.password === password) {
              mockCurrentUser = savedUser.user;
              saveUser();
              resolve(mockCurrentUser);
            } else {
              reject(new Error("Invalid password"));
            }
            return;
          }

          // Special case for initial demo user
          if (email && password === 'admin123') {
            mockCurrentUser = {
              id: 1,
              email,
              first_name: "Dr.",
              last_name: "Smith",
              role: "administrator",
              username: email.split('@')[0]
            };
            saveUser();
            
            // Save to mock storage for next time
            saveMockUser({ email, password, user: mockCurrentUser });
            
            // pre-populate some demo orders if brand new user
            if (!localStorage.getItem(ORDERS_STORAGE_KEY)) {
              localStorage.setItem(
                ORDERS_STORAGE_KEY,
                JSON.stringify([
                  {
                    id: 1001,
                    status: "completed",
                    date_created: new Date(
                      Date.now() - 86400000 * 5,
                    ).toISOString(),
                    total: "1340.00",
                    line_items: [
                      {
                        id: 1,
                        name: "High-Speed Air Turbine Handpiece",
                        product_id: 1,
                        quantity: 2,
                        total: "998.00",
                      },
                    ],
                  },
                ]),
              );
            }
            resolve(mockCurrentUser);
          } else {
            reject(new Error("Invalid credentials. If this is a new account, please register. For demo, use password 'admin123'."));
          }
        }, 500),
      );
    }
  },

  logout: async (): Promise<void> => {
    return new Promise((resolve) =>
      setTimeout(() => {
        mockCurrentUser = null;
        saveUser();
        resolve();
      }, 300),
    );
  },

  getOrders: async (): Promise<WooOrder[]> => {
    try {
      if (!mockCurrentUser) return [];
      
      // Fetch orders explicitly tied to this user ID
      const dataByIdResp = fetchWoo('/orders', { customer: mockCurrentUser.id.toString(), per_page: "50" }).catch(() => []);
      
      // Fetch guest orders tied to this user's email 
      const dataByEmailResp = fetchWoo('/orders', { search: mockCurrentUser.email, per_page: "50" }).catch(() => []);

      const [dataById, dataByEmail] = await Promise.all([dataByIdResp, dataByEmailResp]);

      let combined: WooOrder[] = [];
      if (Array.isArray(dataById)) combined = [...combined, ...dataById];
      if (Array.isArray(dataByEmail)) {
        // filter by exact email
        const emailFiltered = dataByEmail.filter(o => o.billing?.email === mockCurrentUser?.email);
        combined = [...combined, ...emailFiltered];
      }

      // Deduplicate by ID
      const uniqueOrders = Array.from(new Map(combined.map(o => [o.id, o])).values());
      
      // Sort latest first
      uniqueOrders.sort((a, b) => new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime());

      if (uniqueOrders.length > 0 || (Array.isArray(dataById) && Array.isArray(dataByEmail))) {
        return uniqueOrders; // returns real WooOrders
      }
    } catch (err: any) {
      if (!err.message?.includes("not configured")) {
        console.error("Failed to fetch live orders", err);
      }
    }
    // Mock fallback
    return new Promise((resolve) =>
      setTimeout(() => {
        if (!mockCurrentUser) return resolve([]);
        const orders = JSON.parse(
          localStorage.getItem(ORDERS_STORAGE_KEY) || "[]",
        );
        // sort latest first
        orders.sort(
          (a: any, b: any) =>
            new Date(b.date_created).getTime() -
            new Date(a.date_created).getTime(),
        );
        resolve(orders);
      }, 400),
    );
  },

  getCountries: async (): Promise<any[]> => {
    try {
      const data = await fetchWoo("/data/countries");
      if (!Array.isArray(data)) {
        throw new Error(
          data.message ||
            "WooCommerce API did not return an array of countries",
        );
      }
      return data;
    } catch (err: any) {
      console.error(err);
      if (!err.message?.includes("not configured")) {
        throw err;
      }
    }
    return [
      {
        code: "US",
        name: "United States",
        states: [
          { code: "CA", name: "California" },
          { code: "NY", name: "New York" },
        ],
      },
      {
        code: "CA",
        name: "Canada",
        states: [
          { code: "ON", name: "Ontario" },
          { code: "BC", name: "British Columbia" },
        ],
      },
    ];
  },

  getPaymentGateways: async (): Promise<any[]> => {
    try {
      const gateways = await fetchWoo("/payment_gateways");
      if (Array.isArray(gateways)) {
        return gateways.filter((g) => g.enabled);
      }
    } catch (err: any) {
      console.error(err);
    }
    // mock fallback
    return [
      {
        id: "bacs",
        title: "Direct bank transfer",
        description: "Make your payment directly into our bank account.",
      },
      {
        id: "cod",
        title: "Cash on delivery",
        description: "Pay with cash upon delivery.",
      },
    ];
  },

  clearCartAndCreateOrder: async (orderData?: any): Promise<WooOrder> => {
    if (mockCartState.items.length === 0) throw new Error("Cart is empty");
    try {
      const payload = {
        customer_id: mockCurrentUser?.id || 0,
        payment_method: orderData?.payment_method || "bacs",
        payment_method_title:
          orderData?.payment_method_title || "Direct Bank Transfer",
        set_paid: false,
        billing: orderData?.billing || {
          first_name: "John",
          last_name: "Doe",
          address_1: "969 Market",
          address_2: "",
          city: "San Francisco",
          state: "CA",
          postcode: "94103",
          country: "US",
          email: "john.doe@example.com",
          phone: "(555) 555-5555",
        },
        shipping: orderData?.shipping || {
          first_name: "John",
          last_name: "Doe",
          address_1: "969 Market",
          address_2: "",
          city: "San Francisco",
          state: "CA",
          postcode: "94103",
          country: "US",
        },
        line_items: mockCartState.items.map((i) => ({
          product_id: i.id,
          quantity: i.quantity,
        })),
        coupon_lines: (mockCartState.coupons || []).map((c) => ({
          code: c.code,
        })),
      };

      const newOrder = await fetchWoo("/orders", undefined, "POST", payload);

      // clear cart
      mockCartState = {
        items: [],
        coupons: [],
        totals: { total_items: 0, total_price: "0.00", total_discount: "0.00" },
      };
      saveCart();
      return newOrder;
    } catch (err: any) {
      if (!err.message?.includes("not configured")) {
        console.error("Failed to create live order", err);
      }
      // Fallback to mock order
    }

    return new Promise((resolve) =>
      setTimeout(() => {
        const newOrder: WooOrder = {
          id: Math.floor(Math.random() * 10000) + 1000,
          status: "processing",
          date_created: new Date().toISOString(),
          total: mockCartState.totals.total_price,
          discount_total: mockCartState.totals.total_discount,
          payment_method_title:
            orderData?.payment_method_title || "Direct Bank Transfer",
          line_items: mockCartState.items.map((i) => ({
            id: Math.floor(Math.random() * 10000),
            name: i.name,
            product_id: i.id,
            quantity: i.quantity,
            total: (parseFloat(i.price) * i.quantity).toFixed(2),
          })),
        };

        // Save to local storage
        if (mockCurrentUser) {
          const orders = JSON.parse(
            localStorage.getItem(ORDERS_STORAGE_KEY) || "[]",
          );
          orders.push(newOrder);
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
        }

        mockCartState = {
          items: [],
          coupons: [],
          totals: {
            total_items: 0,
            total_price: "0.00",
            total_discount: "0.00",
          },
        };
        saveCart();
        resolve(newOrder);
      }, 500),
    );
  },

  submitCF7: async (
    formId: string,
    bodyData: Record<string, any>,
  ): Promise<any> => {
    try {
      const res = await fetch(`/api/woo/cf7/submit/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyData }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `Submission failed with status ${res.status}`,
        );
      }
      return data;
    } catch (err: any) {
      console.error("CF7 Service Error:", err);
      throw err;
    }
  },

  getProductReviews: async (productId: number): Promise<WooReview[]> => {
    try {
      const queryParams: Record<string, string> = {
        product: productId.toString(),
        status: 'all',
        _t: Date.now().toString()
      };
      
      let data = await fetchWoo(`/products/reviews`, queryParams).catch(async () => {
        // Fallback to older WooCommerce API endpoint format if /products/reviews fails
        return fetchWoo(`/products/${productId}/reviews`, { status: 'all', _t: Date.now().toString() });
      });

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Sometimes plugins wrap response in { data: [...] } or { reviews: [...] }
        if (Array.isArray(data.data)) data = data.data;
        else if (Array.isArray(data.reviews)) data = data.reviews;
      }

      if (Array.isArray(data)) {
         return data.map((r: any) => ({
           id: r.id,
           product_id: r.product_id || productId,
           date_created: r.date_created,
           reviewer: r.reviewer || r.name,
           review: r.review || r.comment,
           rating: r.rating !== undefined ? r.rating : 5,
           verified: !!r.verified,
           // Handle various image field names from plugins
           images: r.images || r.photo_reviews || r.wc_photo_reviews_images || []
         }));
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
    }
    
    // Fallback to mock data if completely failed
    return new Promise(resolve => setTimeout(() => {
      resolve(mockReviews.filter(r => r.product_id === productId));
    }, 300));
  },

  submitReview: async (productId: number, formData: FormData): Promise<any> => {
    try {
       // Append productId to form data
       formData.append('product_id', productId.toString());
       
       const res = await fetch('/api/woo/reviews/submit', {
         method: 'POST',
         body: formData, // letting browser set multipart/form-data with boundaries
       });

       const data = await res.json();
       console.log("Review Submission Response:", data);
       if (!res.ok) {
         throw new Error(data.error || data.message || `Review submission failed with status ${res.status}`);
       }

       // Mock local update if needed
       mockReviews.push({
         id: Math.floor(Math.random() * 10000) + 2000,
         product_id: productId,
         date_created: new Date().toISOString(),
         reviewer: formData.get('reviewer_name') as string || 'Guest',
         review: `<p>${formData.get('review_text') as string || ''}</p>`,
         rating: parseInt(formData.get('rating') as string) || 5,
         verified: false,
         images: [] // we won't show real blobs here just for mock
       });
       
       return data;
    } catch (err: any) {
       console.error("Review Submission Error:", err);
       throw err;
    }
  },

  updateCustomer: async (customerId: number, data: Partial<WooUser> & { password?: string }): Promise<WooUser> => {
    try {
      const res = await fetchWoo(`/customers/${customerId}`, undefined, 'PUT', data);
      if (res && res.id) {
        mockCurrentUser = {
          ...mockCurrentUser,
          ...res
        } as WooUser;
        saveUser();
        
        // Update mock storage if password was changed
        if (data.password) {
          saveMockUser({
            email: mockCurrentUser.email,
            password: data.password,
            user: mockCurrentUser
          });
        }

        return mockCurrentUser;
      }
      throw new Error("Failed to update customer");
    } catch (err: any) {
      if (!err.message?.includes("not configured")) {
        throw err;
      }
      // fallback for demo
      mockCurrentUser = {
        ...mockCurrentUser,
        ...data
      } as WooUser;
      saveUser();

      // Update mock storage
      if (mockCurrentUser) {
        const mockUsers = getMockUsers();
        const currentMock = mockUsers[mockCurrentUser.email.toLowerCase()];
        saveMockUser({
          email: mockCurrentUser.email,
          password: data.password || currentMock?.password,
          user: mockCurrentUser
        });
      }

      return mockCurrentUser;
    }
  },
};

// ---- Mock Runtime State ----
const CART_STORAGE_KEY = "dental_cart";
const USER_STORAGE_KEY = "dental_user";
const ORDERS_STORAGE_KEY = "dental_orders";
const MOCK_USERS_KEY = "dental_mock_users";

interface MockUserData {
  email: string;
  password?: string;
  user: WooUser;
}

function getMockUsers(): Record<string, MockUserData> {
  return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || "{}");
}

function saveMockUser(data: MockUserData) {
  const users = getMockUsers();
  users[data.email.toLowerCase()] = data;
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

let mockCartState: WooCart = JSON.parse(
  localStorage.getItem(CART_STORAGE_KEY) || "null",
) || {
  items: [],
  coupons: [],
  totals: { total_items: 0, total_price: "0.00", total_discount: "0.00" },
};

let mockCurrentUser: WooUser | null = JSON.parse(
  localStorage.getItem(USER_STORAGE_KEY) || "null",
);

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
  const totalItems = mockCartState.items.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );
  const subtotal = mockCartState.items.reduce(
    (acc, item) => acc + parseFloat(item.price) * item.quantity,
    0,
  );

  let totalDiscount = 0;
  if (mockCartState.coupons) {
    mockCartState.coupons.forEach((c) => {
      totalDiscount += parseFloat(c.discount);
    });
  }

  const totalPrice = Math.max(0, subtotal - totalDiscount);

  mockCartState.totals = {
    total_items: totalItems,
    total_price: totalPrice.toFixed(2),
    total_discount: totalDiscount.toFixed(2),
  };
  saveCart();
}

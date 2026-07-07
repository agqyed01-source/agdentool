let store = {};
(global as any).localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => store[k] = v,
};

import { wooApi } from './src/services/woo.ts';

async function run() {
  await wooApi.addToCart(99, 1);
  await wooApi.addToCart(100, 1);
  console.log("Cart items:", (await wooApi.getCart()).items.length);
  
  try {
     await wooApi.applyCoupon('6qws9y9e'); // min 1000
  } catch(e) {
     console.log("Expected Error 1:", e.message);
  }

  try {
     await wooApi.applyCoupon('ga8jsepy'); // no min, individual
     console.log("Applied ga8jsepy!");
  } catch(e) {
     console.log("Unexpected Error 2:", e.message);
  }

  try {
     await wooApi.applyCoupon('psaesuuv'); // percent, no min
  } catch(e) {
     console.log("Expected Error 3 (individual conflict):", e.message);
  }
  
  console.log("Cart coupons:", (await wooApi.getCart()).coupons);
}
run();

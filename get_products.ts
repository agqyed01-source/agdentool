import { wooApi } from './src/services/woo';
import fetch from 'node-fetch';

(global as any).fetch = fetch;

async function run() {
    const products = await wooApi.getProducts();
    for (const p of products) {
        console.log(p.id, p.name, p.shipping_class, p.weight);
    }
}
run();

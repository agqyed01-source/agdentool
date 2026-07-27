import 'dotenv/config';

const wpUrl = process.env.VITE_WOO_URL;
const consumerKey = process.env.VITE_WOO_CONSUMER_KEY;
const consumerSecret = process.env.VITE_WOO_CONSUMER_SECRET;

const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

fetch(`${wpUrl}/wp-json/wc/v3/products/categories?per_page=100`, {
    headers: { 'Authorization': `Basic ${credentials}` }
})
.then(res => res.json())
.then(cats => {
    const target = cats.find(c => c.slug === 'yidimu');
    console.log("yidimu category:", target ? target.id : "NOT FOUND");
}).catch(console.error);

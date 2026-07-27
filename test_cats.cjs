const axios = require('axios');
require('dotenv').config();

const wpUrl = process.env.VITE_WOO_URL;
const consumerKey = process.env.VITE_WOO_CONSUMER_KEY;
const consumerSecret = process.env.VITE_WOO_CONSUMER_SECRET;

axios.get(`${wpUrl}/wp-json/wc/v3/products/categories?per_page=100`, {
    auth: { username: consumerKey, password: consumerSecret }
}).then(res => {
    const cats = res.data;
    const target = cats.find(c => c.slug === 'yidimu');
    console.log("yidimu category:", target ? target.id : "NOT FOUND");
}).catch(console.error);

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routing for WooCommerce
  app.post('/api/woo/fetch', async (req, res) => {
    try {
      const { endpoint, queryParams, method, bodyData } = req.body;
      const WOO_URL = process.env.VITE_WOO_API_URL;
      const WOO_KEY = process.env.VITE_WOO_CONSUMER_KEY;
      const WOO_SECRET = process.env.VITE_WOO_CONSUMER_SECRET;

      if (!WOO_URL || !WOO_KEY || !WOO_SECRET) {
        return res.status(400).json({ error: 'WooCommerce API not configured on server' });
      }

      if (WOO_URL.includes('your-wordpress-site.com')) {
         return res.status(400).json({ error: 'Please update default WooCommerce API settings in .env' });
      }

      let baseUrl = WOO_URL.replace(/\/$/, '');
      if (!baseUrl.includes('/wp-json')) {
        baseUrl = `${baseUrl}/wp-json/wc/v3`;
      }

      const url = new URL(`${baseUrl}/${endpoint.replace(/^\//, '')}`);
      url.searchParams.append('consumer_key', WOO_KEY);
      url.searchParams.append('consumer_secret', WOO_SECRET);
      
      if (queryParams) {
        for (const [k, v] of Object.entries(queryParams)) {
          if (v !== undefined && v !== null) {
            url.searchParams.append(k, String(v));
          }
        }
      }

      const fetchOptions: RequestInit = {
        method: method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (bodyData && (method === 'POST' || method === 'PUT')) {
        fetchOptions.body = JSON.stringify(bodyData);
      }

      const wooRes = await fetch(url.toString(), fetchOptions);
      const text = await wooRes.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('Woo API returned invalid JSON. URL:', url.toString(), 'Response:', text.slice(0, 100));
        return res.status(502).json({ error: 'Invalid response from WooCommerce. Please verify your API URL and ensure REST API is enabled.' });
      }
      
      if (!wooRes.ok) {
        return res.status(wooRes.status).json({ error: data.message || 'Error from WooCommerce API' });
      }

      return res.json(data);
    } catch (error: any) {
      console.error('Woo API Error:', error);
      return res.status(500).json({ error: `Connection Error: ${error.message || 'Failed to fetch from WooCommerce'}. Verify your site is running and accessible.` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

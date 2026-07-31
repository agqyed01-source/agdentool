import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import multer from 'multer';

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = process.env.VPS_PORT ? parseInt(process.env.VPS_PORT) : 3000;

  app.use(express.json());

  // Review proxy with multipart/form-data support
  app.post('/api/woo/reviews/submit', upload.any(), async (req, res) => {
    try {
      const WOO_URL = process.env.VITE_WOO_API_URL;
      
      if (!WOO_URL || WOO_URL.includes('your-wordpress-site.com')) {
        console.log('[Review Proxy] Mock success - API not configured');
        return res.json({ status: 'success', message: 'Review successfully submitted (Mock)' });
      }

      const wpBase = WOO_URL.split('/wp-json')[0].replace(/\/$/, '');
      const ajaxUrl = `${wpBase}/wp-admin/admin-ajax.php`;
      
      const body = req.body;
      const productId = body.product_id || body.vi_comment_post_ID || body.comment_post_ID || '';
      
      // SCRAPE NONCE FIRST
      let scrapedNonce = '';
      try {
        console.log(`[Review Proxy] Attempting to scrape nonce for product ${productId}...`);
        const productUrl = `${wpBase}/?p=${productId}`; 
        const pageRes = await fetch(productUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        const html = await pageRes.text();
        
        // More robust nonce search
        const nonceMatches = [
          html.match(/id="wcpr_image_upload_nonce"\s+name="wcpr_image_upload_nonce"\s+value="([^"]+)"/),
          html.match(/name="wcpr_image_upload_nonce"\s+value="([^"]+)"/),
          html.match(/id="wcpr_image_upload_nonce"\s+value="([^"]+)"/),
          html.match(/wcpr_image_upload_nonce["']\s*:\s*["']([^"']+)["']/) 
        ];

        for (const match of nonceMatches) {
          if (match && match[1]) {
            scrapedNonce = match[1];
            break;
          }
        }

        if (scrapedNonce) {
          console.log(`[Review Proxy] Successfully scraped nonce: ${scrapedNonce}`);
        } else {
          console.log('[Review Proxy] Could not find nonce in product page HTML');
        }
      } catch (scrapeErr) {
        console.error('[Review Proxy] Nonce scraping failed:', scrapeErr);
      }

      console.log(`[Review Proxy] Submitting to: ${ajaxUrl}`);

      const rating = body.rating || '5';
      const content = body.review_text || body.content || body.comment || '';
      const author = body.reviewer_name || body.author || '';
      const email = body.reviewer_email || body.email || '';

      const actionsToTry = [
        'viwcpr_review_order', 
        'vi_wc_photo_reviews_submit_review',
        'submit_review'
      ];

      let lastText = '';
      let successFound = false;

      const commonHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': `${wpBase}/?p=${productId}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': wpBase
      };

      for (const action of actionsToTry) {
        if (successFound) break;
        
        const actionData = new FormData();
        actionData.append('action', action);
        actionData.append('rating', rating);
        actionData.append('comment', content);
        actionData.append('author', author);
        actionData.append('email', email);
        actionData.append('comment_post_ID', productId);
        actionData.append('_wp_http_referer', `${wpBase}/?p=${productId}`);
        
        if (scrapedNonce) {
          actionData.append('wcpr_image_upload_nonce', scrapedNonce);
          actionData.append('vi-wcpr-at-nonce', scrapedNonce);
        }

        actionData.append('wcpr_rating', rating);
        actionData.append('wcpr_gdpr_checkbox', 'on');
        actionData.append('vi_wc_photo_reviews_rating', rating);
        
        for (const [key, value] of Object.entries(body)) {
          const skipKeys = ['action', 'rating', 'comment', 'author', 'email', 'product_id', 'p_id', 'comment_post_ID', 'vi_comment_post_ID'];
          if (!skipKeys.includes(key) && typeof value === 'string') {
            actionData.append(key, value);
          }
        }

        if (req.files && (req.files as Express.Multer.File[]).length > 0) {
          const files = req.files as Express.Multer.File[];
          files.forEach((file) => {
            const blob = new Blob([file.buffer as any], { type: file.mimetype || 'image/jpeg' });
            actionData.append('wcpr_image_upload[]', blob, file.originalname);
          });
          actionData.append('vi_wc_photo_reviews_image_count', files.length.toString());
        }

        try {
          console.log(`[Review Proxy] Trying action: ${action}`);
          const wpRes = await fetch(ajaxUrl, {
            method: 'POST',
            headers: commonHeaders,
            body: actionData as any,
          });

          const text = await wpRes.text();
          lastText = text;
          console.log(`[Review Proxy] Response from ${action}: ${text.substring(0, 100)}`);

          let jsonResponse = null;
          try {
            jsonResponse = JSON.parse(text);
          } catch (e) {}

          if (wpRes.ok && text !== '0' && text !== '-1' && text !== '') {
            if (text.toLowerCase().includes('success') || text.toLowerCase().includes('thank you') || text.toLowerCase().includes('submitted')) {
              successFound = true;
              return res.json({ status: 'success', action_used: action });
            }
            if (jsonResponse && (jsonResponse.status === 'success' || jsonResponse.success === true || jsonResponse.code === 1 || jsonResponse.html)) {
              successFound = true;
              return res.json({ status: 'success', action_used: action, wp_response: jsonResponse });
            }
          }
        } catch (err) {
          console.error(`[Review Proxy] ${action} failed:`, err);
        }
      }

      if (!successFound) {
        console.log('[Review Proxy] Trying standard WP comment fallback (Multipart)');
        const standardData = new FormData();
        standardData.append('comment', content);
        standardData.append('author', author);
        standardData.append('email', email);
        standardData.append('comment_post_ID', productId);
        standardData.append('rating', rating);
        standardData.append('wcpr_rating', rating);
        standardData.append('wcpr_gdpr_checkbox', 'on');
        if (scrapedNonce) {
          standardData.append('wcpr_image_upload_nonce', scrapedNonce);
        }

        if (req.files && (req.files as Express.Multer.File[]).length > 0) {
          const files = req.files as Express.Multer.File[];
          files.forEach((file) => {
            const blob = new Blob([file.buffer as any], { type: file.mimetype || 'image/jpeg' });
            standardData.append('wcpr_image_upload[]', blob, file.originalname);
          });
        }

        const commentRes = await fetch(`${wpBase}/wp-comments-post.php`, {
          method: 'POST',
          headers: { 
            'User-Agent': commonHeaders['User-Agent'],
            'Referer': `${wpBase}/?p=${productId}`,
            'Origin': wpBase
          },
          body: standardData as any,
          redirect: 'manual'
        });

        if (commentRes.status === 302 || commentRes.status === 301 || commentRes.ok) {
          return res.json({ status: 'success', method: 'standard_fallback' });
        }
        lastText = await commentRes.text();
      }

      return res.status(400).json({ 
        error: 'Review submission failed after trying AJAX and standard fallback.',
        last_response: lastText.substring(0, 200)
      });
    } catch (error: any) {
      console.error('[Review Proxy] Global Exception:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // API routing for WooCommerce
  app.post('/api/woo/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const WOO_URL = process.env.VITE_WOO_API_URL;
      const WOO_KEY = process.env.VITE_WOO_CONSUMER_KEY;
      const WOO_SECRET = process.env.VITE_WOO_CONSUMER_SECRET;

      if (!WOO_URL || !WOO_KEY || !WOO_SECRET) {
        return res.status(400).json({ error: 'WooCommerce API not configured on server' });
      }

      const wpBase = WOO_URL.split('/wp-json')[0].replace(/\/$/, '');
      
      // Step 1: JWT Authentication
      console.log(`[Auth Proxy] Verifying credentials for ${email} via JWT...`);
      const jwtRes = await fetch(`${wpBase}/wp-json/jwt-auth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password: password
        })
      });

      const jwtData = await jwtRes.json();

      if (!jwtRes.ok) {
        console.error('[Auth Proxy] JWT Failed:', jwtData);
        return res.status(401).json({ error: jwtData.message || 'Invalid username or password' });
      }

      // Step 2: Use matching consumer keys to get detailed info, but use JWT to ensure correct ID
      console.log(`[Auth Proxy] Fetching full details for ${email}...`);
      
      let baseUrl = WOO_URL.replace(/\/$/, '');
      if (!baseUrl.includes('/wp-json')) {
        baseUrl = `${baseUrl}/wp-json/wc/v3`;
      }

      // Try searching for customer by email first (to get billing/shipping)
      const searchUrl = new URL(`${baseUrl}/customers`);
      searchUrl.searchParams.append('consumer_key', WOO_KEY);
      searchUrl.searchParams.append('consumer_secret', WOO_SECRET);
      searchUrl.searchParams.append('email', email);
      searchUrl.searchParams.append('role', 'all');

      const customerRes = await fetch(searchUrl.toString());
      const customers = await customerRes.json();

      let customer: any = null;

      if (customerRes.ok && Array.isArray(customers) && customers.length > 0) {
        customer = customers[0];
      } else {
        // Fallback: If WooCommerce search failed, try to get user info via standard WP API using the JWT
        console.log(`[Auth Proxy] WooCommerce search failed for ${email}, trying WP Users API...`);
        try {
          const meRes = await fetch(`${wpBase}/wp-json/wp/v2/users/me`, {
            headers: { 'Authorization': `Bearer ${jwtData.token}` }
          });
          const meData = await meRes.json();
          if (meRes.ok && meData.id) {
            // We found a WP user ID. Try to fetch this specific ID from WC
            const directUrl = new URL(`${baseUrl}/customers/${meData.id}`);
            directUrl.searchParams.append('consumer_key', WOO_KEY);
            directUrl.searchParams.append('consumer_secret', WOO_SECRET);
            
            const directRes = await fetch(directUrl.toString());
            const directData = await directRes.json();
            
            if (directRes.ok && directData.id) {
              customer = directData;
            } else {
              // Final fallback: use what we have from WP/JWT
              customer = {
                id: meData.id,
                email: jwtData.user_email || email,
                first_name: meData.first_name || jwtData.user_display_name || '',
                last_name: meData.last_name || '',
                username: meData.slug || jwtData.user_nicename || '',
                billing: {},
                shipping: {}
              };
            }
          }
        } catch (meError) {
          console.error('[Auth Proxy] WP Me Check failed:', meError);
        }
      }

      if (!customer || customer.id === 0) {
        return res.status(401).json({ error: 'Authentication succeeded, but could not retrieve your user profile (Invalid ID).' });
      }

      // Attach token for potential future use
      customer.jwt_token = jwtData.token;

      console.log(`[Auth Proxy] JWT Login successful for ${email}`);
      return res.json(customer);
    } catch (error: any) {
      console.error('[Auth Proxy] Error:', error);
      return res.status(500).json({ error: `Authentication Error: ${error.message}` });
    }
  });

  // API routing for WooCommerce (POST/PUT/DELETE)
  app.post('/api/woo/fetch', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    try {
      const { endpoint, queryParams, method, bodyData, includeHeaders } = req.body;
      
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
        method: method || 'POST',
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

      const totalPages = wooRes.headers.get('x-wp-totalpages');
      const total = wooRes.headers.get('x-wp-total');

      if (includeHeaders && (totalPages !== null)) {
        return res.json({ 
          data: data, 
          headers: {
            'x-wp-totalpages': totalPages,
            'x-wp-total': total
          }
        });
      }

      return res.json(data);
    } catch (error: any) {
      console.error('[Woo API Proxy] Error:', error);
      return res.status(500).json({ error: `API Proxy Error: ${error.message}` });
    }
  });

  // API routing for WooCommerce GET requests directly mapped to path
  app.get('/api/woo/get/*', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    try {
      let endpoint = (req.params as any)[0];
      const queryParams: Record<string, string> = { ...(req.query as Record<string, string>) };
      let includeHeaders = queryParams.includeHeaders === 'true';
      delete queryParams.includeHeaders;

      if (endpoint.includes('/-/')) {
        const parts = endpoint.split('/-/');
        endpoint = parts[0];
        const paramsArray = parts[1].split('/');
        for (let i = 0; i < paramsArray.length; i += 2) {
          const key = decodeURIComponent(paramsArray[i]);
          const value = decodeURIComponent(paramsArray[i+1] || '');
          if (key === 'includeHeaders' && value === 'true') {
            includeHeaders = true;
          } else if (key) {
            queryParams[key] = value;
          }
        }
      }

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
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      };

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

      const totalPages = wooRes.headers.get('x-wp-totalpages');
      const total = wooRes.headers.get('x-wp-total');

      if (includeHeaders && (totalPages !== null)) {
        return res.json({ 
          data: data, 
          headers: {
            'x-wp-totalpages': totalPages,
            'x-wp-total': total
          }
        });
      }

      return res.json(data);
    } catch (error: any) {
      console.error('Woo API Error:', error);
      return res.status(500).json({ error: `Connection Error: ${error.message || 'Failed to fetch from WooCommerce'}. Verify your site is running and accessible.` });
    }
  });

  app.post('/api/woo/cf7/submit/:formId', async (req, res) => {
    try {
      const { formId } = req.params;
      const { bodyData } = req.body;
      const WOO_URL = process.env.VITE_WOO_API_URL;

      if (!WOO_URL) {
        return res.status(400).json({ error: 'WooCommerce API URL not configured in environment variables.' });
      }

      // Determine WP Base and REST prefix
      let url: string;
      if (WOO_URL.includes('rest_route=')) {
        // Plain permalinks
        const wpBase = WOO_URL.split('?')[0].replace(/\/$/, '');
        url = `${wpBase}/index.php?rest_route=/contact-form-7/v1/contact-forms/${formId}/feedback`;
      } else {
        // Pretty permalinks
        const wpBase = WOO_URL.split('/wp-json')[0].replace(/\/$/, '');
        url = `${wpBase}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;
      }

      console.log(`[CF7 Proxy] Attempting POST to: ${url}`);
      console.log(`[CF7 Proxy] Payload Keys: ${Object.keys(bodyData || {}).join(', ')}`);

      const formData = new FormData();
      formData.append('_wpcf7', formId);
      formData.append('_wpcf7_unit_tag', `wpcf7-f${formId}-p0-o1`);

      if (bodyData) {
        for (const [key, value] of Object.entries(bodyData)) {
          formData.append(key, value as string);
        }
      }

      const cf7Res = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const contentType = cf7Res.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await cf7Res.json();
      } else {
        const text = await cf7Res.text();
        console.error(`[CF7 Proxy] Non-JSON Response from ${url}:`, text.substring(0, 500));
        return res.status(cf7Res.status).json({ 
          error: `WordPress returned a non-JSON response (Status ${cf7Res.status}). Check if Contact Form 7 is active and REST API is enabled.`,
          details: text.substring(0, 200)
        });
      }

      if (!cf7Res.ok || data.code === 'rest_no_route') {
        console.error(`[CF7 Proxy] Error for ${url}:`, data);
        return res.status(cf7Res.status).json({
          ...data,
          _debug_info: {
            attempted_url: url,
            status: cf7Res.status,
            hint: data.code === 'rest_no_route' ? 'The CF7 REST route was not found. Please ensure the "Contact Form 7" plugin is active and that your WordPress permalink settings are not set to "Plain" (or if they are, that the proxy handles them correctly).' : undefined
          }
        });
      }

      console.log(`[CF7 Proxy] Success: ${data.status}`);
      return res.json(data);
    } catch (error: any) {
      console.error('[CF7 Proxy] Exception:', error);
      return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
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

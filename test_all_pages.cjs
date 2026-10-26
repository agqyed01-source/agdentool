const { spawn } = require('child_process');
const http = require('http');

async function run() {
  const chrome = spawn('/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell', [
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-gpu',
    '--headless'
  ]);

  await new Promise(r => setTimeout(r, 1000));

  const target = await new Promise((resolve, reject) => {
    const req = http.request('http://127.0.0.1:9222/json/new?http://localhost:3000/', { method: 'PUT' }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let idCounter = 1;
  const pending = new Map();
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);

  const errors = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const resolve = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg.result);
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      const args = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
      errors.push(`[CONSOLE ERROR]: ${args}`);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(`[EXCEPTION]: ${JSON.stringify(msg.params.exceptionDetails)}`);
    }
  };

  await send('Runtime.enable');
  await send('Page.enable');

  // Pre-seed cart in localStorage
  const sampleCart = {
    items: [
      {
        key: 'item_1',
        id: 28664,
        name: 'Dental Electric Waxer Tips Wax Carving Pen Accessories',
        price: '17.69',
        quantity: 2,
        image: 'https://assets.agdentool.com/2026/09/Dental-Electric-Waxer-Tips-Wax-Carving-Pen-Accessories.jpg',
        weight: '0.2',
        shipping_class: 'small-light'
      },
      {
        key: 'item_2',
        id: 28653,
        variation_id: 28654,
        name: 'Dental Electric Wax Carving Kit - EU Plug',
        price: '79.68',
        quantity: 1,
        image: '',
        variations: { Types: 'EU Plug' },
        weight: '1.2',
        shipping_class: 'heavy-tools'
      }
    ],
    coupons: [],
    totals: {
      total_items: 3,
      total_price: '115.06',
      total_discount: '0.00'
    }
  };

  await send('Runtime.evaluate', {
    expression: `localStorage.setItem('dental_cart', '${JSON.stringify(sampleCart)}');`
  });

  const routes = [
    '/',
    '/shop',
    '/categories',
    '/product/28664',
    '/product/28653',
    '/cart',
    '/checkout',
    '/account'
  ];

  for (const route of routes) {
    console.log(`\nTesting route: ${route}`);
    await send('Page.navigate', { url: `http://localhost:3000${route}` });
    await new Promise(r => setTimeout(r, 2500));

    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        const hasError = text.includes('Something went wrong') || text.includes('An unexpected error occurred');
        const technicalDetails = document.querySelector('details p')?.innerText || '';
        return { hasError, technicalDetails, title: document.title, snippet: text.slice(0, 150).replace(/\\n/g, ' ') };
      })()`,
      returnByValue: true
    });

    const res = evalRes.result?.value;
    console.log(`Status for ${route}:`, res?.hasError ? `FAILED: ${res.technicalDetails}` : 'OK', `Title: ${res?.title}`);
  }

  console.log(`\nTotal errors captured: ${errors.length}`);
  errors.forEach(e => console.log(e));

  ws.close();
  chrome.kill();
}

run().catch(console.error);

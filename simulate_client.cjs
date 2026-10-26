const { spawn } = require('child_process');
const http = require('http');

async function run() {
  const chrome = spawn('/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell', [
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-gpu',
    '--headless'
  ]);

  // wait 1 sec for chrome
  await new Promise(r => setTimeout(r, 1000));

  // Create target page
  const target = await new Promise((resolve, reject) => {
    const req = http.request('http://127.0.0.1:9222/json/new?http://localhost:3000/', { method: 'PUT' }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }); req.on('error', reject); req.end();
  });

  console.log('Target created:', target.webSocketDebuggerUrl);
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

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const resolve = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg.result);
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const args = msg.params.args.map(a => a.value || a.description).join(' ');
      console.log(`[BROWSER CONSOLE ${msg.params.type}]:`, args);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]:', msg.params.exceptionDetails);
    }
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:3000/shop' });

  await new Promise(r => setTimeout(r, 3000));

  // Check page title and content
  let evalRes = await send('Runtime.evaluate', {
    expression: 'document.title + " | " + document.body.innerText.slice(0, 300)',
    returnByValue: true
  });
  console.log('Shop Page Loaded:', evalRes.result?.value);

  // Find a product link and click it
  evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const link = document.querySelector('a[href*="/product/"]');
      if (link) {
        const href = link.getAttribute('href');
        return href;
      }
      return null;
    })()`,
    returnByValue: true
  });
  console.log('Product link found:', evalRes.result?.value);
  const prodHref = evalRes.result?.value || '/product/28653';

  // Navigate to product page
  await send('Page.navigate', { url: 'http://localhost:3000' + prodHref });
  await new Promise(r => setTimeout(r, 3000));

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText.slice(0, 500)',
    returnByValue: true
  });
  console.log('Product Page text snippet:', evalRes.result?.value);

  // Click Add to Cart
  evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.innerText.includes('Add to Cart') || b.innerText.includes('Select Options'));
      if (addBtn) {
        addBtn.click();
        return 'Clicked ' + addBtn.innerText;
      }
      return 'Button not found. Buttons: ' + btns.map(b => b.innerText).join('; ');
    })()`,
    returnByValue: true
  });
  console.log('Add to cart result:', evalRes.result?.value);

  await new Promise(r => setTimeout(r, 2000));

  // Check if ErrorBoundary triggered
  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText.includes("Something went wrong")',
    returnByValue: true
  });
  console.log('Something went wrong on product page?', evalRes.result?.value);

  // Check cart page
  await send('Page.navigate', { url: 'http://localhost:3000/cart' });
  await new Promise(r => setTimeout(r, 2000));

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText',
    returnByValue: true
  });
  console.log('Cart Page text (first 400 chars):', evalRes.result?.value?.slice(0, 400));
  console.log('Something went wrong on cart page?', evalRes.result?.value?.includes('Something went wrong'));

  // Check checkout page
  await send('Page.navigate', { url: 'http://localhost:3000/checkout' });
  await new Promise(r => setTimeout(r, 3000));

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText',
    returnByValue: true
  });
  console.log('Checkout Page text (first 400 chars):', evalRes.result?.value?.slice(0, 400));
  console.log('Something went wrong on checkout page?', evalRes.result?.value?.includes('Something went wrong'));

  ws.close();
  chrome.kill();
}

run().catch(console.error);

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
    const req = http.request('http://127.0.0.1:9222/json/new?http://localhost:3000/product/28653', { method: 'PUT' }, (res) => {
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

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const resolve = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg.result);
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const args = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
      console.log(`[BROWSER CONSOLE ${msg.params.type}]: ${args}`);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]:', JSON.stringify(msg.params.exceptionDetails, null, 2));
    }
  };

  await send('Runtime.enable');
  await send('Page.enable');

  console.log('Waiting for product 28653 to load...');
  await new Promise(r => setTimeout(r, 4000));

  let evalRes = await send('Runtime.evaluate', {
    expression: 'document.title + " | " + document.body.innerText.slice(0, 400)',
    returnByValue: true
  });
  console.log('Product Page:', evalRes.result?.value);

  // Click all variation option buttons to select options
  evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const optButtons = buttons.filter(b => {
        const txt = b.innerText.trim();
        return txt && !['Add to Cart', 'Select Options', 'Try Again', 'Reload Page', 'Return to Home', 'Search'].includes(txt);
      });
      console.log('Opt buttons found:', optButtons.map(b => b.innerText));
      if (optButtons.length > 0) {
        optButtons[0].click();
        return 'Clicked ' + optButtons[0].innerText;
      }
      return 'No option buttons';
    })()`,
    returnByValue: true
  });
  console.log('Options clicked:', evalRes.result?.value);
  await new Promise(r => setTimeout(r, 1000));

  // Now click Add to Cart
  evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.innerText.includes('Add to Cart'));
      if (addBtn) {
        addBtn.click();
        return 'Clicked Add to Cart button: disabled=' + addBtn.disabled;
      }
      return 'No Add to Cart button found. Buttons: ' + btns.map(b => b.innerText).join('; ');
    })()`,
    returnByValue: true
  });
  console.log('Add to Cart action:', evalRes.result?.value);

  await new Promise(r => setTimeout(r, 3000));

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText.includes("Something went wrong")',
    returnByValue: true
  });
  console.log('Something went wrong on product page after add to cart?', evalRes.result?.value);

  // Check localStorage cart
  evalRes = await send('Runtime.evaluate', {
    expression: 'localStorage.getItem("WOO_CART")',
    returnByValue: true
  });
  console.log('WOO_CART in localStorage:', evalRes.result?.value);

  // Navigate to /cart
  console.log('Navigating to /cart...');
  await send('Page.navigate', { url: 'http://localhost:3000/cart' });
  await new Promise(r => setTimeout(r, 3000));

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText.includes("Something went wrong")',
    returnByValue: true
  });
  console.log('Something went wrong on /cart?', evalRes.result?.value);

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText.slice(0, 500)',
    returnByValue: true
  });
  console.log('Cart page text:', evalRes.result?.value);

  // Navigate to /checkout
  console.log('Navigating to /checkout...');
  await send('Page.navigate', { url: 'http://localhost:3000/checkout' });
  await new Promise(r => setTimeout(r, 4000));

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText.includes("Something went wrong")',
    returnByValue: true
  });
  console.log('Something went wrong on /checkout?', evalRes.result?.value);

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText.slice(0, 800)',
    returnByValue: true
  });
  console.log('Checkout page text:', evalRes.result?.value);

  ws.close();
  chrome.kill();
}

run().catch(console.error);

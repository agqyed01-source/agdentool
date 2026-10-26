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
    const req = http.request('http://127.0.0.1:9222/json/new?http://localhost:3000/product/28664', { method: 'PUT' }, (res) => {
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

  console.log('Waiting for product 28664 to load...');
  await new Promise(r => setTimeout(r, 3500));

  let evalRes = await send('Runtime.evaluate', {
    expression: 'document.title + " | " + document.body.innerText.slice(0, 400)',
    returnByValue: true
  });
  console.log('Product Page:', evalRes.result?.value);

  // Now click Add to Cart
  evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.innerText.includes('Add to Cart'));
      if (addBtn) {
        addBtn.click();
        return 'Clicked Add to Cart button!';
      }
      return 'No Add to Cart button found. Current buttons: ' + btns.map(b => b.innerText).join('; ');
    })()`,
    returnByValue: true
  });
  console.log('Add to Cart action:', evalRes.result?.value);

  await new Promise(r => setTimeout(r, 2000));

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText.includes("Something went wrong")',
    returnByValue: true
  });
  console.log('Something went wrong on product page after add to cart?', evalRes.result?.value);

  ws.close();
  chrome.kill();
}

run().catch(console.error);

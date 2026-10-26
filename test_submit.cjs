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

  // Click Add to Cart
  let evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.innerText.includes('Add to Cart'));
      if (addBtn) {
        addBtn.click();
        return 'Clicked Add to Cart button!';
      }
      return 'No Add to Cart button found';
    })()`,
    returnByValue: true
  });
  console.log('Add to Cart:', evalRes.result?.value);
  await new Promise(r => setTimeout(r, 2000));

  // Navigate to /checkout
  console.log('Navigating to /checkout...');
  await send('Page.navigate', { url: 'http://localhost:3000/checkout' });
  await new Promise(r => setTimeout(r, 4000));

  // Fill in checkout form fields
  console.log('Filling in checkout form fields...');
  evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      // fill inputs
      const fill = (selector, val) => {
        const el = document.querySelector(selector);
        if (el) {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };

      fill('input[type="email"]', 'doctor.chen@example.com');
      fill('input[type="tel"]', '1234567890');
      
      const textInputs = Array.from(document.querySelectorAll('input[type="text"]'));
      textInputs.forEach(input => {
        const label = input.closest('div')?.querySelector('label')?.innerText || '';
        if (label.includes('First Name')) fill('input[value="' + input.value + '"]', 'Dr. John');
        if (label.includes('Last Name')) fill('input[value="' + input.value + '"]', 'Smith');
        if (label.includes('Street')) fill('input[value="' + input.value + '"]', '123 Dental Clinic Blvd');
        if (label.includes('City')) fill('input[value="' + input.value + '"]', 'Los Angeles');
        if (label.includes('Postcode')) fill('input[value="' + input.value + '"]', '90001');
      });

      return 'Form inputs populated';
    })()`,
    returnByValue: true
  });
  console.log(evalRes.result?.value);
  await new Promise(r => setTimeout(r, 1000));

  // Select Country in react-select
  console.log('Selecting country in react-select...');
  evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const selectInput = document.querySelector('.col-span-2 input');
      if (selectInput) {
        selectInput.focus();
        selectInput.value = 'United States';
        selectInput.dispatchEvent(new Event('input', { bubbles: true }));
        return 'Typed United States';
      }
      return 'No react-select input found';
    })()`,
    returnByValue: true
  });
  console.log(evalRes.result?.value);
  await new Promise(r => setTimeout(r, 1000));

  // Click submit button!
  console.log('Submitting checkout form...');
  evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (btn) {
        btn.click();
        return 'Clicked submit button: disabled=' + btn.disabled;
      }
      return 'Submit button not found';
    })()`,
    returnByValue: true
  });
  console.log('Submit button clicked:', evalRes.result?.value);

  // Wait 6 seconds and check result
  await new Promise(r => setTimeout(r, 6000));

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText.slice(0, 800)',
    returnByValue: true
  });
  console.log('After submit page content:', evalRes.result?.value);

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText.includes("Something went wrong")',
    returnByValue: true
  });
  console.log('Something went wrong after submit?', evalRes.result?.value);

  ws.close();
  chrome.kill();
}

run().catch(console.error);

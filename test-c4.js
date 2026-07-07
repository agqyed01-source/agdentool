fetch('http://localhost:3000/api/woo/fetch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ endpoint: '/coupons', method: 'GET', queryParams: { code: 'ctbhheu6' } })
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(err => console.error(err));

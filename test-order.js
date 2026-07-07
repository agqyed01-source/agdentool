fetch('http://localhost:3000/api/woo/fetch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: '/orders',
    method: 'POST',
    bodyData: {
      payment_method: "bacs",
      payment_method_title: "Direct Bank Transfer",
      set_paid: false,
      billing: {
        first_name: "John",
        last_name: "Doe",
        address_1: "969 Market",
        address_2: "",
        city: "San Francisco",
        state: "CA",
        postcode: "94103",
        country: "US",
        email: "john.doe@example.com",
        phone: "(555) 555-5555"
      },
      line_items: [{ product_id: 112, quantity: 1 }],
      coupon_lines: [{ code: 'psaesuuv' }]
    }
  })
}).then(res => res.json()).then(console.log).catch(console.error);

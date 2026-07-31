const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
    /\{billing\.country \? \(shippingMethods\[0\]\?\.id === 'error' \? shippingMethods\[0\]\.title : 'No shipping options available for the selected address\.'\) : 'Please enter a valid address to view shipping options\.'\}/,
    "{billing.country ? (failureDetails ? `Error: ${failureDetails}` : 'No shipping options available for the selected address.') : 'Please enter a valid address to view shipping options.'}"
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

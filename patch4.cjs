const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
    /const \[shippingMethods, setShippingMethods\] = useState<any\[\]>\(\[\]\);/,
    "const [shippingMethods, setShippingMethods] = useState<any[]>([]);\n  const [shippingError, setShippingError] = useState('');"
).replace(
    /let failureDetails = '';/,
    "let failureDetails = '';\n        setShippingError('');"
).replace(
    /console\.error\('Shipping failed:', failureDetails\);/,
    "console.error('Shipping failed:', failureDetails);\n            setShippingError(failureDetails);"
).replace(
    /\{billing\.country \? \(failureDetails \? `Error: \$\{failureDetails\}` : 'No shipping options available for the selected address\.'\) : 'Please enter a valid address to view shipping options\.'\}/,
    "{billing.country ? (shippingError ? `Error: ${shippingError}` : 'No shipping options available for the selected address.') : 'Please enter a valid address to view shipping options.'}"
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

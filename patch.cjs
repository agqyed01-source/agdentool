const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
    /let allGroupsMatched = true;/,
    "let allGroupsMatched = true;\n        let failureDetails = '';"
).replace(
    /allGroupsMatched = false;/g,
    "allGroupsMatched = false;\n                 failureDetails = `No rule matched for ${sClass || 'none'}`;"
).replace(
    /if \(!allGroupsMatched\) \{/,
    "if (!allGroupsMatched) {\n            console.error('Shipping failed:', failureDetails);\n            snippetMethods = [{ method_id: 'error', id: 'error', title: 'Error: ' + failureDetails, settings: { cost: { value: '0.00' } } }];"
).replace(
    /\{billing\.country \? "No shipping options available for the selected address\." : "Please enter a valid address to view shipping options\."\}/,
    "{billing.country ? (shippingMethods[0]?.id === 'error' ? shippingMethods[0].title : 'No shipping options available for the selected address.') : 'Please enter a valid address to view shipping options.'}"
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

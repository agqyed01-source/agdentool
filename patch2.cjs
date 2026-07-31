const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
    /let failureDetails = '';/,
    "let failureDetails = '';\n        console.log('Current billing country:', billing.country);"
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
    /title: matchedRuleNames\.join\(' \+ '\) \|\| 'Shipping',/,
    "title: 'Standard Shipping', // Hide internal rule names from customer"
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
    /\/\/ Assume WooCommerce weight is already in grams or correct unit for rules\.\n\s*\/\/ itemWeight = itemWeight \* 1000;/g,
    `// WooCommerce typically uses kg, but our rules use grams. Convert here:\n             itemWeight = itemWeight * 1000;`
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

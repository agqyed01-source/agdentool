const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
    /if \(!itemShippingClass\) {\s+itemShippingClass = 'small-light'; \/\/ Default\s+}/,
    `if (!itemShippingClass) {
                 itemShippingClass = 'small-light'; // Default
             }
             itemShippingClass = itemShippingClass.toLowerCase();
             if (itemShippingClass === 'bulky') {
                 itemShippingClass = 'heavy-tools';
             }`
);

code = code.replace(/console\.log\("SHIPPING ITEM:", item\.id, itemShippingClass, itemWeight\);\s+/, '');

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
console.log('Fixed CheckoutPage.tsx');

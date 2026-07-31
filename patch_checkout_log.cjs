const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
/groups\[itemShippingClass\]\.qty \+= itemQty;/g,
`groups[itemShippingClass].qty += itemQty;
console.log("SHIPPING ITEM:", item.id, itemShippingClass, itemWeight);`
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

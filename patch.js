const fs = require('fs');
const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const target = `             itemShippingClass = itemShippingClass.toLowerCase().trim();`;
const replacement = `             itemShippingClass = itemShippingClass.toLowerCase().trim();
             
             // Map unknown shipping classes to small-light to ensure template rules apply
             const knownClasses = ['small-light', 'heavy-tools', 'no-free-ship'];
             if (!knownClasses.includes(itemShippingClass)) {
                 itemShippingClass = 'small-light';
             }`;

code = code.replace(target, replacement);
fs.writeFileSync(path, code);

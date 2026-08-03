const fs = require('fs');
let c = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf-8');

c = c.replace(/                       itemWeight = parseFloat\(variation\.weight\);\n                    }\n                 if \(\!itemWeight \|\| \!itemShippingClass\) {/,
`                       itemWeight = parseFloat(variation.weight);
                    }
                 }
                 if (!itemWeight || !itemShippingClass) {`);

c = c.replace(/                       if \(product\.shipping_class\) itemShippingClass = product\.shipping_class;\n                    }\n             } catch \(err\) {/,
`                       if (product.shipping_class) itemShippingClass = product.shipping_class;
                    }
                 }
             } catch (err) {`);

c = c.replace(/             if \(\!groupMatched\) {\n                 \/\/ Fallback to a default shipping cost so checkout isn't blocked/,
`             if (!groupMatched) {
                 // Fallback to a default shipping cost so checkout isn't blocked`);
                 
fs.writeFileSync('src/pages/CheckoutPage.tsx', c);

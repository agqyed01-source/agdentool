const fs = require('fs');
let c = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf-8');

c = c.replace(/           if \(snippetMethods.length > 0\) \{\n             setSelectedShippingMethod\(snippetMethods\[0\]\);\n           }\n        }\n      } catch \(err: any\)/,
`           if (snippetMethods.length > 0) {
             setSelectedShippingMethod(snippetMethods[0]);
           }
        }
      } catch (err: any)`);
      
fs.writeFileSync('src/pages/CheckoutPage.tsx', c);

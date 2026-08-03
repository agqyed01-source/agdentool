const fs = require('fs');
let c = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf-8');

c = c.replace(/             if \(\!groupMatched\) \{\n                 \/\/ Fallback to a default shipping cost so checkout isn't blocked\n                 groupCosts\[sClass\] = 15.00;\n                 matchedRuleIds.push\('fallback'\);\n                 matchedRuleNames.push\('Standard Shipping \(Default\)'\);\n             }\n        }\n                let totalCost = 0;/,
`             if (!groupMatched) {
                 // Fallback to a default shipping cost so checkout isn't blocked
                 groupCosts[sClass] = 15.00;
                 matchedRuleIds.push('fallback');
                 matchedRuleNames.push('Standard Shipping (Default)');
             }
         }
        let totalCost = 0;`);

fs.writeFileSync('src/pages/CheckoutPage.tsx', c);

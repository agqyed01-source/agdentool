const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
    /if \(allGroupsMatched && matchedRuleIds\.length > 0\)/,
    "let accumulatedCost = Object.values(groupCosts).reduce((a,b) => a+b, 0);\n        if (allGroupsMatched && matchedRuleIds.length > 0)"
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

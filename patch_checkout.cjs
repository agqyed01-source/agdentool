const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');
code = code.replace(
    /title: matchedRuleNames\.length > 0 \? matchedRuleNames\.join\(' \+ '\) : 'Standard Shipping',/g,
    "title: matchedRuleNames.length > 0 ? Array.from(new Set(matchedRuleNames)).join(' + ') : 'Standard Shipping',"
);
fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

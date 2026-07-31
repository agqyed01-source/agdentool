const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
    /let matchedRuleIds: string\[\] = \[\];/,
    "let matchedRuleIds: string[] = [];"
).replace(
    /method_id: 'combined_shipping',/g,
    "method_id: 'combined_shipping',\n                id: Array.from(new Set(matchedRuleIds)).join('_') || 'standard',"
).replace(
    /id: matchedRuleIds\.join\('_'\) \|\| 'standard',/g,
    ""
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

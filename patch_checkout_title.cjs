const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
/let matchedRuleIds: string\[\] = \[\];/g,
`let matchedRuleIds: string[] = [];
        let matchedRuleNames: string[] = [];`
);

code = code.replace(
/matchedRuleIds\.push\(rule\.id\);/g,
`matchedRuleIds.push(rule.id);
                     matchedRuleNames.push(rule.name || rule.id);`
);

code = code.replace(
/title: 'Standard Shipping',/g,
`title: matchedRuleNames.length > 0 ? matchedRuleNames.join(' + ') : 'Standard Shipping',`
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

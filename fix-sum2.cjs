const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
    /settings: \{ cost: \{ value: accumulatedCost\.toFixed\(2\) \} \}/g,
    "settings: { cost: { value: Object.values(groupCosts).reduce((a,b) => a+b, 0).toFixed(2) } }"
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

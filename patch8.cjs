const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
    /snippetMethods = \[\{ method_id: 'standard_fallback', id: 'standard_fallback', title: 'Standard Shipping', settings: \{ cost: \{ value: '15.00' \} \} \}\];/,
    "snippetMethods = [{ method_id: 'flat_rate', id: 'flat_rate', title: 'Standard Shipping (Rules Failed: ' + failureDetails + ')', settings: { cost: { value: '15.00' } } }];"
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
    /if \(\!allGroupsMatched\) \{/,
    "if (!allGroupsMatched) {\n            console.error('Shipping failed:', failureDetails);\n            setShippingError(failureDetails);\n            // FAIL-SAFE: Allow checkout even if rules fail\n            if (snippetMethods.length === 0) {\n                snippetMethods = [{ method_id: 'standard_fallback', id: 'standard_fallback', title: 'Standard Shipping', settings: { cost: { value: '15.00' } } }];\n            }\n        } else if (false) {"
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

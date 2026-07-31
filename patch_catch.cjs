const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');
code = code.replace(
    /\} catch \(err\) \{/,
    "} catch (err: any) { setShippingError('FETCH_ERROR: ' + (err.message || 'Unknown error'));"
);
fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

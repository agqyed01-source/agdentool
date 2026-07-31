const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

if (!code.includes('id="checkout-error-bottom"')) {
    code = code.replace(
        /<button\s+type="submit"\s+form="checkout-form"/,
        "{error && <div id=\"checkout-error-bottom\" className=\"bg-red-50 text-red-600 p-4 rounded-lg font-medium border border-red-200 mb-4\">{error}</div>}\n                <button\n                  type=\"submit\"\n                  form=\"checkout-form\""
    );
    fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
}

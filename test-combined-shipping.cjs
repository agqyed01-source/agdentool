const fs = require('fs');

console.log("Checking CheckoutPage patch...");
const code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');
if (code.includes('totalCost += c')) {
    console.log("Patch successfully applied!");
} else {
    console.log("Patch failed!");
}

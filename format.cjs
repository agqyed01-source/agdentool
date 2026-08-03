const fs = require('fs');
let c = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf-8');
let open = 0;
let lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  open += (lines[i].match(/\{/g) || []).length;
  open -= (lines[i].match(/\}/g) || []).length;
}
console.log("FINAL", open);

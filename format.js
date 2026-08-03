const fs = require('fs');
let c = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf-8');
let open = 0;
let lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  open += (lines[i].match(/\{/g) || []).length;
  open -= (lines[i].match(/\}/g) || []).length;
  if (open < 0) console.log("NEGATIVE AT", i);
}
console.log("FINAL", open);

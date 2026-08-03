const fs = require('fs');
const code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf-8');
const lines = code.split('\n');
let count = 0;
for(let i=0; i<lines.length; i++) {
   const open = (lines[i].match(/\{/g) || []).length;
   const close = (lines[i].match(/\}/g) || []).length;
   count += open - close;
   if(count < 0) {
      console.log(`NEGATIVE at line ${i+1}: ${lines[i]}`);
      break;
   }
}
console.log('Final count:', count);

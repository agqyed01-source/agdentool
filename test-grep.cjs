const fs = require('fs');
let sr = JSON.parse(fs.readFileSync('src/data/shippingRules.json', 'utf8'));
let rule = sr.rules.find(r => r.name === 'United States small-light amount <99');
console.log(rule);

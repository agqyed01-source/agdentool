const fs = require('fs');
const content = fs.readFileSync('src/data/shippingRules.json', 'utf8');
const data = JSON.parse(content);
console.log("Total rules:", data.rules.length);
console.log("A sample rule:", JSON.stringify(data.rules[data.rules.length - 1], null, 2));

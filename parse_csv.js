const fs = require('fs');
const content = fs.readFileSync('src/data/shippingRules.json', 'utf8');
const data = JSON.parse(content);
console.log("Total rules:", data.rules.length);
console.log(JSON.stringify(data.rules.find(r => r.id === 'AF_heavy_tools_weight_100'), null, 2));

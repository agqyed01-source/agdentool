const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/shippingRules.json', 'utf8'));

data.rules = data.rules.filter(rule => {
    if (rule.name.includes('(Auto-Fallback)')) return false;
    if (rule.name.includes('Worldwide Fallback')) return false;
    return true;
});

fs.writeFileSync('./src/data/shippingRules.json', JSON.stringify(data, null, 2));
console.log("Removed fallbacks. Remaining rules:", data.rules.length);

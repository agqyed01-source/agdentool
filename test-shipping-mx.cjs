const fs = require('fs');
const shippingRules = JSON.parse(fs.readFileSync('src/data/shippingRules.json', 'utf8'));

const enabledRules = (shippingRules.rules || []).filter(r => r.enabled).sort((a, b) => (a.priority || 0) - (b.priority || 0));

for(const rule of enabledRules) {
    if(rule.condition?.countries?.includes('MX')) {
        console.log(`[Priority ${rule.priority}] ${rule.name}`);
    }
}

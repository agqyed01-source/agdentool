const fs = require('fs');
const shippingRules = JSON.parse(fs.readFileSync('src/data/shippingRules.json'));
const enabledRules = shippingRules.rules.filter(r => r.enabled).sort((a, b) => (a.priority || 0) - (b.priority || 0));

function evaluate(groups, billing) {
    let groupCosts = {};
    for (const rawSClass of Object.keys(groups)) {
        let sClass = rawSClass.toLowerCase();
        const group = groups[rawSClass];
        for (const rule of enabledRules) {
            const condition = rule.condition || {};
            let match = true;
            if (condition.countries && !condition.countries.includes(billing.country)) match = false;
            if (match && condition.shipping_classes && !condition.shipping_classes.map(c => String(c).toLowerCase()).includes(sClass)) match = false;
            if (match && condition.metric === 'weight') {
                if (condition.operator === '<' && !(group.weight < condition.value)) match = false;
                if (condition.operator === '>' && !(group.weight > condition.value)) match = false;
            }
            if (match) {
                console.log(`Matched rule for ${sClass}:`, rule.name, "Fee:", rule.shipping_fee || rule.base_fee);
                break;
            }
        }
    }
}
evaluate({'small-light': {weight: 240, qty: 1, subtotal: 50}}, {country: 'BJ'});
evaluate({'heavy-tools': {weight: 2240, qty: 1, subtotal: 50}}, {country: 'Any'});

const fs = require('fs');
const shippingRules = JSON.parse(fs.readFileSync('./src/data/shippingRules.json', 'utf8'));

function testRule(country, sClass, weight, subtotal) {
    const billing = { country };
    const group = { subtotal, weight, qty: 1 };
    const enabledRules = (shippingRules.rules || []).filter(r => r.enabled).sort((a, b) => (a.priority || 0) - (b.priority || 0));

    for (const rule of enabledRules) {
        const condition = rule.condition || {};
        let match = true;
        
        if (condition.countries && !condition.countries.includes(billing.country)) match = false;
        if (match && condition.shipping_classes && !condition.shipping_classes.includes(sClass)) match = false;
        if (match && condition.max_weight !== undefined && group.weight > condition.max_weight) match = false;
        
        if (match && condition.metric && condition.operator && condition.value !== undefined) {
            let metricValue = condition.metric === 'weight' ? group.weight : (condition.metric === 'amount' ? group.subtotal : group.qty);
            const ruleValue = condition.value;
            switch (condition.operator) {
                case '<': if (!(metricValue < ruleValue)) match = false; break;
                case '<=': if (!(metricValue <= ruleValue)) match = false; break;
                case '>': if (!(metricValue > ruleValue)) match = false; break;
                case '>=': if (!(metricValue >= ruleValue)) match = false; break;
            }
        }
        
        if (match) {
            console.log(`[${country}] ${sClass} W:${weight} S:${subtotal} => MATCHED: ${rule.name} (Fee: ${rule.shipping_fee || rule.base_fee})`);
            return;
        }
    }
    console.log(`[${country}] ${sClass} W:${weight} S:${subtotal} => NO MATCH`);
}

testRule('ZW', 'small-light', 40, 10);
testRule('ZW', 'small-light', 60, 10);
testRule('US', 'small-light', 40, 10);
testRule('US', 'small-light', 40, 100);
testRule('US', 'Orthodontics', 40, 10);
testRule('US', 'heavy-tools', 2000, 10);
testRule('US', 'bulky', 5000, 10);
testRule('US', 'no-free-ship', 140, 10);

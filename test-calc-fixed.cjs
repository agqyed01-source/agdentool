const fs = require('fs');
const shippingRules = JSON.parse(fs.readFileSync('src/data/shippingRules.json', 'utf8'));

const groups = {
    'orthodontics': { weight: 10, qty: 1, subtotal: 318 }
};

let groupCosts = {};
let matchedRuleIds = [];
let matchedRuleNames = [];

let groupsToProcess = Object.keys(groups);

const billing = { country: 'US' };

const enabledRules = (shippingRules.rules || []).filter(r => r.enabled).sort((a, b) => (a.priority || 0) - (b.priority || 0));

while (groupsToProcess.length > 0) {
    let sClass = groupsToProcess.shift();
    
    // Simulating the fix
    let mappedClass = sClass;
    const knownClasses = ['small-light', 'heavy-tools', 'no-free-ship'];
    if (!knownClasses.includes(mappedClass)) {
        mappedClass = 'small-light';
    }

    const group = groups[sClass];
    let groupMatched = false;

    for (const rule of enabledRules) {
        const condition = rule.condition || {};
        let match = true;

        if (condition.countries && Array.isArray(condition.countries) && condition.countries.length > 0) {
            if (!condition.countries.includes(billing.country)) { match = false; }
        }

        if (match && condition.shipping_classes && Array.isArray(condition.shipping_classes) && condition.shipping_classes.length > 0) {
            const normalizedClasses = condition.shipping_classes.map(c => String(c).toLowerCase().trim());
            const normalizedSClass = String(mappedClass).toLowerCase().trim();
            if (!normalizedClasses.includes(normalizedSClass)) { match = false; }
        }

        if (match && condition.min_amount !== undefined && group.subtotal < condition.min_amount) { match = false; }
        if (match && condition.max_amount !== undefined && group.subtotal > condition.max_amount) { match = false; }
        if (match && condition.min_weight !== undefined && group.weight < condition.min_weight) { match = false; }
        if (match && condition.max_weight !== undefined && group.weight > condition.max_weight) { match = false; }

        if (match && condition.metric && condition.operator && condition.value !== undefined) {
            let metricValue = group.weight;
            const ruleValue = Number(condition.value);
            switch (condition.operator) {
                case '<': if (!(metricValue < ruleValue)) { match = false; } break;
                case '<=': if (!(metricValue <= ruleValue)) { match = false; } break;
                case '>': if (!(metricValue > ruleValue)) { match = false; } break;
                case '>=': if (!(metricValue >= ruleValue)) { match = false; } break;
                case '==': 
                case '=': if (!(metricValue == ruleValue)) { match = false; } break;
            }
        }

        if (match) {
            console.log("Matched Rule:", rule.name, rule.id, rule.shipping_fee);
            groupCosts[sClass] = rule.shipping_fee || 0;
            groupMatched = true;
            break;
        }
    }

    if (!groupMatched) {
        groupCosts[sClass] = 15.00;
    }
}
console.log("Final Costs:", groupCosts);

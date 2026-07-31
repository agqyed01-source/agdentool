const fs = require('fs');
const shippingRules = JSON.parse(fs.readFileSync('src/data/shippingRules.json', 'utf8'));

let groups = {
  'no-free-ship': { weight: 150, qty: 1, subtotal: 120 }
};
const billing = { country: 'US' };

const enabledRules = (shippingRules.rules || []).filter(r => r.enabled).sort((a, b) => (a.priority || 0) - (b.priority || 0));

let groupCosts = {};
let allGroupsMatched = true;
let failureDetails = '';
let groupsToProcess = Object.keys(groups);

while (groupsToProcess.length > 0) {
    const sClass = groupsToProcess.shift();
    const group = groups[sClass];
    let groupMatched = false;
    
    for (const rule of enabledRules) {
        const condition = rule.condition || {};
        let match = true;
        let failReason = "";
        
        if (condition.countries && condition.countries.length > 0) {
            if (!condition.countries.includes(billing.country)) match = false;
        }
        if (match && condition.shipping_classes && condition.shipping_classes.length > 0) {
            const normalizedClasses = condition.shipping_classes.map(c => c.toLowerCase());
            if (!normalizedClasses.includes(sClass.toLowerCase())) match = false;
        }
        if (match && condition.min_amount !== undefined && group.subtotal < condition.min_amount) match = false;
        if (match && condition.max_amount !== undefined && group.subtotal > condition.max_amount) match = false;
        if (match && condition.min_weight !== undefined && group.weight < condition.min_weight) match = false;
        if (match && condition.max_weight !== undefined && group.weight > condition.max_weight) match = false;
        
        if (match && condition.metric && condition.operator && condition.value !== undefined) {
            let metricValue = condition.metric === 'weight' ? group.weight : condition.metric === 'amount' ? group.subtotal : group.qty;
            const ruleValue = condition.value;
            switch (condition.operator) {
                case '<': if (!(metricValue < ruleValue)) match = false; break;
                case '<=': if (!(metricValue <= ruleValue)) match = false; break;
                case '>': if (!(metricValue > ruleValue)) match = false; break;
                case '>=': if (!(metricValue >= ruleValue)) match = false; break;
            }
        }
        
        if (match) {
            groupMatched = true;
            break;
        }
    }

    if (!groupMatched) {
        if (sClass === 'small-light') {
            if (!groups['no-free-ship']) groups['no-free-ship'] = { weight: 0, qty: 0, subtotal: 0 };
            groups['no-free-ship'].weight += group.weight;
            groupsToProcess.push('no-free-ship');
            continue;
        }
        allGroupsMatched = false;
        failureDetails = `No rule matched for ${sClass || 'none'}`;
    }
}
console.log("Matched?", allGroupsMatched, "Failure:", failureDetails);

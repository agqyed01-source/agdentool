const fs = require('fs');
const shippingRules = JSON.parse(fs.readFileSync('src/data/shippingRules.json', 'utf8'));

let groups = {
  'no-free-ship': { weight: 0, qty: 1, subtotal: 58.06 }
};
const billing = { country: 'MX' };

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
        
        if (condition.countries && Array.isArray(condition.countries) && condition.countries.length > 0) {
            if (!condition.countries.includes(billing.country)) { match = false; failReason = `Country ${billing.country} not in [${condition.countries}]`; }
        }
        if (match && condition.shipping_classes && Array.isArray(condition.shipping_classes) && condition.shipping_classes.length > 0) {
            const normalizedClasses = condition.shipping_classes.map(c => c.toLowerCase());
            const normalizedSClass = sClass.toLowerCase();
            if (!normalizedClasses.includes(normalizedSClass)) { match = false; failReason = `Class '${sClass}' not in [${condition.shipping_classes}]`; }
        }
        if (match && condition.min_amount !== undefined && group.subtotal < condition.min_amount) { match = false; failReason = `subtotal (${group.subtotal}) < min_amount (${condition.min_amount})`; }
        if (match && condition.max_amount !== undefined && group.subtotal > condition.max_amount) { match = false; failReason = `subtotal (${group.subtotal}) > max_amount (${condition.max_amount})`; }
        if (match && condition.min_weight !== undefined && group.weight < condition.min_weight) { match = false; failReason = `weight (${group.weight}) < min_weight (${condition.min_weight})`; }
        if (match && condition.max_weight !== undefined && group.weight > condition.max_weight) { match = false; failReason = `weight (${group.weight}) > max_weight (${condition.max_weight})`; }
        if (match && condition.min_quantity !== undefined && group.qty < condition.min_quantity) { match = false; failReason = `qty (${group.qty}) < min_quantity (${condition.min_quantity})`; }
        if (match && condition.max_quantity !== undefined && group.qty > max_quantity) { match = false; failReason = `qty (${group.qty}) > max_quantity (${condition.max_quantity})`; }
        
        if (match && condition.metric && condition.operator && condition.value !== undefined) {
            let metricValue = 0;
            if (condition.metric === 'weight') metricValue = group.weight;
            else if (condition.metric === 'amount') metricValue = group.subtotal;
            else if (condition.metric === 'quantity') metricValue = group.qty;
            
            const ruleValue = condition.value;
            switch (condition.operator) {
                case '<': if (!(metricValue < ruleValue)) { match = false; failReason = `${condition.metric} (${metricValue}) !< ${ruleValue}`; } break;
                case '<=': if (!(metricValue <= ruleValue)) { match = false; failReason = `${condition.metric} (${metricValue}) !<= ${ruleValue}`; } break;
                case '>': if (!(metricValue > ruleValue)) { match = false; failReason = `${condition.metric} (${metricValue}) !> ${ruleValue}`; } break;
                case '>=': if (!(metricValue >= ruleValue)) { match = false; failReason = `${condition.metric} (${metricValue}) !>= ${ruleValue}`; } break;
            }
        }
        
        if (match) {
            console.log(`Matched rule ${rule.name}`);
            groupMatched = true;
            break;
        } else {
            // console.log(`Skipped ${rule.name}: ${failReason}`);
        }
    }

    if (!groupMatched) {
        if (sClass === 'small-light') {
            groupsToProcess.push('no-free-ship');
            continue;
        }
        allGroupsMatched = false;
        failureDetails = `No rule matched for ${sClass || 'none'}`;
    }
}
console.log("Matched?", allGroupsMatched, "Failure:", failureDetails);

const fs = require('fs');
const shippingRules = JSON.parse(fs.readFileSync('src/data/shippingRules.json', 'utf8'));

let groups = {
  'small-light': { weight: 0, qty: 1, subtotal: 0.75 },
  '': { weight: 0, qty: 3, subtotal: 2.68 }
};
const billing = { country: 'EG' };

const enabledRules = (shippingRules.rules || []).filter(r => r.enabled).sort((a, b) => (a.priority || 0) - (b.priority || 0));

let groupCosts = {};
let matchedRuleNames = [];
let matchedRuleIds = [];
let allGroupsMatched = true;
let failureDetails = '';
let groupsToProcess = Object.keys(groups);
let snippetMethods = [];

while (groupsToProcess.length > 0) {
    const sClass = groupsToProcess.shift();
    const group = groups[sClass];
    if (!group || (group.weight === 0 && group.qty === 0 && group.subtotal === 0)) continue;

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
        
        if (match) {
            let cost = 0;
            switch (rule.calculation_mode) {
                case 'fixed': cost = rule.shipping_fee || 0; break;
                case 'percentage_of_amount': cost = group.subtotal * (rule.percentage || 0) / 100; break;
                default: cost = rule.shipping_fee || 0;
            }
            groupCosts[sClass] = cost;
            groupMatched = true;
            matchedRuleIds.push(rule.id);
            if (rule.name && !matchedRuleNames.includes(rule.name)) matchedRuleNames.push(rule.name);
            console.log(`Matched rule ${rule.name} for ${sClass}`);
            break;
        } else {
            // console.log(`Skipped ${rule.name}: ${failReason}`);
        }
    }

    if (!groupMatched) {
        if (sClass === 'small-light') {
            if (!groups['no-free-ship']) groups['no-free-ship'] = { weight: 0, qty: 0, subtotal: 0 };
            groups['no-free-ship'].weight += group.weight;
            groups['no-free-ship'].qty += group.qty;
            groups['no-free-ship'].subtotal += group.subtotal;
            groupsToProcess.push('no-free-ship');
            group.weight = 0; 
            group.qty = 0;
            group.subtotal = 0;
            continue;
        }
        allGroupsMatched = false;
        failureDetails = `No rule matched for ${sClass || 'none'}`;
    }
}
console.log("Matched?", allGroupsMatched, "Failure:", failureDetails);
console.log("Snippet Methods Built?", Object.keys(groups).length > 0 && matchedRuleIds.length > 0);

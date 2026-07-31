import fs from 'fs';
const rulesData = JSON.parse(fs.readFileSync('src/data/shippingRules.json', 'utf8'));

// Simulating Fiji
const enabledRules = (rulesData.rules || []).filter((r: any) => r.enabled).sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0));

const groupsToProcess = ['small-light'];
const groups = {
    'small-light': { weight: 0, qty: 6, subtotal: 1640.66 }
};

let groupCosts: any = {};
let matchedRuleIds: any = [];
let allGroupsMatched = true;

while (groupsToProcess.length > 0) {
    const sClass = groupsToProcess.shift()!;
    const group = groups[sClass as keyof typeof groups];
    if (!group) continue;
    let groupMatched = false;
    for (const rule of enabledRules) {
        const condition = rule.condition || {};
        let match = true;
        if (condition.countries && condition.countries.length > 0 && !condition.countries.includes('FJ')) match = false;
        if (match && condition.shipping_classes && condition.shipping_classes.length > 0) {
            const normalized = condition.shipping_classes.map((c: any) => String(c).toLowerCase());
            if (!normalized.includes(sClass.toLowerCase())) match = false;
        }
        if (match && condition.min_amount !== undefined && group.subtotal < condition.min_amount) match = false;
        if (match && condition.max_amount !== undefined && group.subtotal > condition.max_amount) match = false;
        if (match && condition.min_weight !== undefined && group.weight < condition.min_weight) match = false;
        if (match && condition.max_weight !== undefined && group.weight > condition.max_weight) match = false;
        if (match) {
            groupCosts[sClass] = rule.shipping_fee || 0;
            groupMatched = true;
            matchedRuleIds.push(rule.id);
            break;
        }
    }
}
console.log("Costs if ALL were small-light:", groupCosts);

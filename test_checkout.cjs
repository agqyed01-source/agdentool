const fs = require('fs');
const shippingRules = JSON.parse(fs.readFileSync('src/data/shippingRules.json'));
const enabledRules = shippingRules.rules.filter(r => r.enabled).sort((a, b) => (a.priority || 0) - (b.priority || 0));

function evaluate(groups, billing) {
    let groupCosts = {};
    let matchedRuleIds = [];
    let matchedRuleNames = [];
    let groupMatched = false;
    let allGroupsMatched = true;

    for (const rawSClass of Object.keys(groups)) {
        let sClass = rawSClass.toLowerCase();
        if (sClass === 'bulky') sClass = 'heavy-tools';
        const group = groups[rawSClass];
        groupMatched = false;

        for (const rule of enabledRules) {
            const condition = rule.condition || {};
            let match = true;
            let failReason = "";

            if (condition.countries && Array.isArray(condition.countries) && condition.countries.length > 0) {
                if (!condition.countries.includes(billing.country)) { match = false; }
            }

            if (match && condition.shipping_classes && Array.isArray(condition.shipping_classes) && condition.shipping_classes.length > 0) {
                const normalizedClasses = condition.shipping_classes.map((c) => String(c).toLowerCase());
                if (!normalizedClasses.includes(sClass)) { match = false; }
            }

            if (match && condition.min_amount !== undefined && group.subtotal < condition.min_amount) { match = false; }
            if (match && condition.max_amount !== undefined && group.subtotal > condition.max_amount) { match = false; }
            if (match && condition.min_weight !== undefined && group.weight < condition.min_weight) { match = false; }
            if (match && condition.max_weight !== undefined && group.weight > condition.max_weight) { match = false; }
            if (match && condition.min_quantity !== undefined && group.qty < condition.min_quantity) { match = false; }
            if (match && condition.max_quantity !== undefined && group.qty > condition.max_quantity) { match = false; }

            if (match && condition.metric && condition.operator && condition.value !== undefined) {
                let metricValue = 0;
                if (condition.metric === 'weight') metricValue = group.weight;
                else if (condition.metric === 'amount') metricValue = group.subtotal;
                else if (condition.metric === 'quantity') metricValue = group.qty;

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
                let cost = 0;
                switch (rule.calculation_mode) {
                    case 'fixed': cost = rule.shipping_fee || 0; break;
                    case 'incremental':
                        cost = (rule.base_fee || 0) + Math.ceil(Math.max(0, group.weight - (rule.base_weight || 0)) / (rule.step_weight || 1)) * (rule.step_fee || 0);
                        break;
                }
                groupCosts[rawSClass] = cost;
                groupMatched = true;
                matchedRuleIds.push(rule.id);
                matchedRuleNames.push(rule.name || rule.id);
                break;
            }
        }
        if (!groupMatched) {
            allGroupsMatched = false;
            groupCosts[rawSClass] = 15.00;
            matchedRuleNames.push('Fallback ' + rawSClass);
        }
    }
    console.log("Groups:", Object.keys(groups));
    console.log("Matched Rules:", matchedRuleNames);
    console.log("Costs:", groupCosts);
}

evaluate({'bulky': {weight: 3000, qty: 1, subtotal: 50}}, {country: 'US'});
evaluate({'heavy-tools': {weight: 3000, qty: 1, subtotal: 50}}, {country: 'US'});
evaluate({'no-free-ship': {weight: 3000, qty: 1, subtotal: 50}}, {country: 'US'});
evaluate({'small-light': {weight: 3000, qty: 1, subtotal: 50}}, {country: 'US'});


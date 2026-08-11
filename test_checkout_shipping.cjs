const fs = require('fs');
const shippingRules = JSON.parse(fs.readFileSync('src/data/shippingRules.json'));
const enabledRules = shippingRules.rules.filter(r => r.enabled).sort((a, b) => (a.priority || 0) - (b.priority || 0));

function evaluate(groups, billing) {
    let groupCosts = {};
    let matchedRuleNames = [];
    
    for (const sClass of Object.keys(groups)) {
        const group = groups[sClass];
        let groupMatched = false;
        
        for (const rule of enabledRules) {
            const condition = rule.condition || {};
            let match = true;
            
            if (condition.countries && condition.countries.length > 0) {
                if (!condition.countries.includes(billing.country)) match = false;
            }
            if (match && condition.shipping_classes && condition.shipping_classes.length > 0) {
                const normClasses = condition.shipping_classes.map(c => String(c).toLowerCase());
                if (!normClasses.includes(sClass.toLowerCase())) match = false;
            }
            if (match && condition.metric === 'weight' && condition.operator && condition.value !== undefined) {
                const ruleVal = Number(condition.value);
                switch(condition.operator) {
                    case '<': if (!(group.weight < ruleVal)) match = false; break;
                    case '<=': if (!(group.weight <= ruleVal)) match = false; break;
                    case '>': if (!(group.weight > ruleVal)) match = false; break;
                    case '>=': if (!(group.weight >= ruleVal)) match = false; break;
                }
            }
            
            if (match) {
                let cost = 0;
                if (rule.calculation_mode === 'fixed') cost = rule.shipping_fee || 0;
                if (rule.calculation_mode === 'incremental') cost = (rule.base_fee || 0) + Math.ceil(Math.max(0, group.weight - (rule.base_weight || 0)) / (rule.step_weight || 1)) * (rule.step_fee || 0);
                groupCosts[sClass] = cost;
                groupMatched = true;
                matchedRuleNames.push(rule.name);
                break;
            }
        }
        
        if (!groupMatched) {
            groupCosts[sClass] = 15.00;
            matchedRuleNames.push('Standard Shipping (Default)');
        }
    }
    console.log("Matched Rules:", matchedRuleNames.join(' + '));
    console.log("Total Cost:", Object.values(groupCosts).reduce((a, b) => a + b, 0));
}

evaluate({'small-light': {weight: 1250, qty: 4, subtotal: 80}}, {country: 'US'});

const fs = require('fs');
const shippingRules = JSON.parse(fs.readFileSync('src/data/shippingRules.json'));
const enabledRules = shippingRules.rules.filter(r => r.enabled).sort((a, b) => (a.priority || 0) - (b.priority || 0));

const testCountry = "US"; // United States
const sClass = "heavy-tools";
const group = {
  weight: 2500,
  qty: 2,
  subtotal: 350
};
const billing = { country: testCountry };

for (const rule of enabledRules) {
     const condition = rule.condition || {};
     let match = true;
     let failReason = "";
     
     if (condition.countries && Array.isArray(condition.countries) && condition.countries.length > 0) {
        if (!condition.countries.includes(billing.country)) { match = false; failReason = `Country ${billing.country} not in [${condition.countries}]`; }
     }
     
     if (match && condition.shipping_classes && Array.isArray(condition.shipping_classes) && condition.shipping_classes.length > 0) {
        const normalizedClasses = condition.shipping_classes.map(c => String(c).toLowerCase());
        const normalizedSClass = String(sClass).toLowerCase();
        if (!normalizedClasses.includes(normalizedSClass)) { match = false; failReason = `Class '${sClass}' not in [${condition.shipping_classes}]`; }
     }
     
     if (match && condition.metric && condition.operator && condition.value !== undefined) {
         let metricValue = 0;
         if (condition.metric === 'weight') metricValue = group.weight;
         else if (condition.metric === 'amount') metricValue = group.subtotal;
         else if (condition.metric === 'quantity') metricValue = group.qty;
         
         const ruleValue = Number(condition.value);
         switch (condition.operator) {
             case '<': if (!(metricValue < ruleValue)) { match = false; failReason = "Metric < failed"; } break;
             case '<=': if (!(metricValue <= ruleValue)) { match = false; failReason = "Metric <= failed"; } break;
             case '>': if (!(metricValue > ruleValue)) { match = false; failReason = "Metric > failed"; } break;
             case '>=': if (!(metricValue >= ruleValue)) { match = false; failReason = "Metric >= failed"; } break;
             case '==': 
             case '=': if (!(metricValue == ruleValue)) { match = false; failReason = "Metric == failed"; } break;
         }
     }
     
     if (match) {
         console.log("MATCHED RULE:", rule.name, rule.calculation_mode);
         let cost = 0;
         switch (rule.calculation_mode) {
            case 'fixed': cost = rule.shipping_fee || 0; break;
            case 'incremental':
                cost = (rule.base_fee || 0) + Math.ceil(Math.max(0, group.weight - (rule.base_weight || 0)) / (rule.step_weight || 1)) * (rule.step_fee || 0);
                break;
         }
         console.log("COST:", cost);
         break;
     } else {
         if (!failReason.includes("not in")) {
             console.log("Rule failed for another reason:", rule.name, failReason);
         }
     }
}

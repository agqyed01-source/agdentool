const fs = require('fs');
const shippingRules = JSON.parse(fs.readFileSync('src/data/shippingRules.json'));
const enabledRules = shippingRules.rules.filter(r => r.enabled).sort((a, b) => (a.priority || 0) - (b.priority || 0));

const testCountry = "US"; // United States
const sClass = "heavy-tools";
const group = {
  weight: 2000,
  qty: 2,
  subtotal: 50
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
         break;
     }
}

const fs = require('fs');
let data = JSON.parse(fs.readFileSync('./src/data/shippingRules.json', 'utf8'));
let rules = data.rules || [];

const rule = rules.find(r => r.name === 'Peru no-free-ship weight >2000');
const weight = 2500;
let cost = (rule.base_fee || 0) + Math.ceil(Math.max(0, weight - (rule.base_weight || 0)) / (rule.step_weight || 1)) * (rule.step_fee || 0);

console.log("Rule:", rule.name);
console.log("Calculation mode:", rule.calculation_mode);
console.log("Cost:", cost);

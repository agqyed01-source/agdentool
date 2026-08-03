const fs = require('fs');
let c = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf-8');

// I will extract everything up to `for (const rule of enabledRules) {`
const startIdx = c.indexOf('for (const rule of enabledRules) {');
const endIdx = c.indexOf('let totalCost = 0;');

const newLoop = `for (const rule of enabledRules) {
                 const condition = rule.condition || {};
                 let match = true;
                 let failReason = "";
                 
                 if (condition.countries && Array.isArray(condition.countries) && condition.countries.length > 0) {
                    if (!condition.countries.includes(billing.country)) { match = false; failReason = \`Country \${billing.country} not in [\${condition.countries}]\`; }
                 }
                 
                 if (match && condition.shipping_classes && Array.isArray(condition.shipping_classes) && condition.shipping_classes.length > 0) {
                    const normalizedClasses = condition.shipping_classes.map((c) => String(c).toLowerCase());
                    const normalizedSClass = String(sClass).toLowerCase();
                    if (!normalizedClasses.includes(normalizedSClass)) { match = false; failReason = \`Class '\${sClass}' not in [\${condition.shipping_classes}]\`; }
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
                        case 'weight_first_additional':
                            cost = (rule.first_price || 0) + Math.ceil(Math.max(0, group.weight - (rule.first_weight || 0)) / (rule.additional_weight || 1)) * (rule.additional_price || 0);
                            break;
                        case 'quantity_first_additional':
                            cost = (rule.first_price || 0) + Math.ceil(Math.max(0, group.qty - (rule.first_quantity || 0)) / (rule.additional_quantity || 1)) * (rule.additional_price || 0);
                            break;
                        case 'per_item': cost = group.qty * (rule.price_per_item || 0); break;
                        case 'per_kg': cost = group.weight * (rule.price_per_kg || 0); break;
                        case 'base_plus_per_kg': cost = (rule.base_fee || 0) + group.weight * (rule.price_per_kg || 0); break;
                        case 'base_plus_per_item': cost = (rule.base_fee || 0) + group.qty * (rule.price_per_item || 0); break;
                        case 'percentage_of_amount': cost = group.subtotal * (rule.percentage || 0) / 100; break;
                        default: cost = rule.shipping_fee || 0;
                     }
                     groupCosts[sClass] = cost;
                     groupMatched = true;
                     matchedRuleIds.push(rule.id);
                     matchedRuleNames.push(rule.name || rule.id);
                     break;
                 }
             }
             
             if (!groupMatched) {
                 groupCosts[sClass] = 15.00;
                 matchedRuleIds.push('fallback');
                 matchedRuleNames.push('Standard Shipping (Default)');
             }
        }
        
        `;

const newCode = c.substring(0, startIdx) + newLoop + c.substring(endIdx);
fs.writeFileSync('src/pages/CheckoutPage.tsx', newCode);

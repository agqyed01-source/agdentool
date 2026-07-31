const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

const newFetchShipping = `
    const fetchShipping = async () => {
      try {
        if (!isMounted) return;
        setShippingError('');
        
        const subtotal = cart?.totals?.total_price ? parseFloat(cart.totals.total_price) : 0;
        
        interface GroupData {
           weight: number;
           qty: number;
           subtotal: number;
        }
        
        const groups: Record<string, GroupData> = {};
        
        if (cart && cart.items && cart.items.length > 0) {
          for (const item of cart.items) {
             let itemWeight = 0;
             let itemShippingClass = '';
             try {
                 if (item.variation_id) {
                    const variations = await wooApi.getProductVariations(item.id);
                    const variation = variations.find((v: any) => v.id === item.variation_id);
                    if (variation && variation.weight) {
                       itemWeight = parseFloat(variation.weight);
                    }
                 }
                 if (!itemWeight || !itemShippingClass) {
                    const product = await wooApi.getProductBySlug(item.id.toString());
                    if (product) {
                       if (!itemWeight && product.weight) itemWeight = parseFloat(product.weight);
                       if (product.shipping_class) itemShippingClass = product.shipping_class;
                    }
                 }
             } catch (err) {
                 console.warn("Failed to fetch product data for item " + item.id);
             }
             
             if (!itemShippingClass) {
                 itemShippingClass = 'small-light'; // Default
             }
             
             if (isNaN(itemWeight)) itemWeight = 0;
             const itemQty = item.quantity;
             const itemPriceStr = typeof item.price === "string" ? item.price : String(item.price);
             const matchedPriceStr = itemPriceStr.match(/[\\d.]+/);
             const itemPrice = matchedPriceStr ? parseFloat(matchedPriceStr[0]) : 0;
             const itemSubtotal = itemPrice * itemQty;
             
             if (!groups[itemShippingClass]) {
                 groups[itemShippingClass] = { weight: 0, qty: 0, subtotal: 0 };
             }
             groups[itemShippingClass].weight += itemWeight * itemQty;
             groups[itemShippingClass].qty += itemQty;
             groups[itemShippingClass].subtotal += itemSubtotal;
          }
        }
        
        let snippetMethods: any[] = [];
        const enabledRules: any[] = (shippingRules.rules || []).filter((r: any) => r.enabled).sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0));
        
        let groupCosts: Record<string, number> = {};
        let matchedRuleIds: string[] = [];
        let allGroupsMatched = true;
        let failureDetails = '';
        
        let groupsToProcess = Object.keys(groups);
        
        while (groupsToProcess.length > 0) {
             const sClass = groupsToProcess.shift()!;
             const group = groups[sClass];
             if (!group || (group.weight === 0 && group.qty === 0 && group.subtotal === 0)) continue;

             let groupMatched = false;
             
             for (const rule of enabledRules) {
                 const condition = rule.condition || {};
                 let match = true;
                 let failReason = "";
                 
                 if (condition.countries && Array.isArray(condition.countries) && condition.countries.length > 0) {
                    if (!condition.countries.includes(billing.country)) { match = false; failReason = \`Country \${billing.country} not in [\${condition.countries}]\`; }
                 }
                 if (match && condition.shipping_classes && Array.isArray(condition.shipping_classes) && condition.shipping_classes.length > 0) {
                    const normalizedClasses = condition.shipping_classes.map((c: string) => String(c).toLowerCase());
                    const normalizedSClass = String(sClass).toLowerCase();
                    if (!normalizedClasses.includes(normalizedSClass)) { match = false; failReason = \`Class '\${sClass}' not in [\${condition.shipping_classes}]\`; }
                 }
                 if (match && condition.min_amount !== undefined && group.subtotal < condition.min_amount) { match = false; failReason = \`subtotal (\${group.subtotal}) < min_amount (\${condition.min_amount})\`; }
                 if (match && condition.max_amount !== undefined && group.subtotal > condition.max_amount) { match = false; failReason = \`subtotal (\${group.subtotal}) > max_amount (\${condition.max_amount})\`; }
                 if (match && condition.min_weight !== undefined && group.weight < condition.min_weight) { match = false; failReason = \`weight (\${group.weight}) < min_weight (\${condition.min_weight})\`; }
                 if (match && condition.max_weight !== undefined && group.weight > condition.max_weight) { match = false; failReason = \`weight (\${group.weight}) > max_weight (\${condition.max_weight})\`; }
                 if (match && condition.min_quantity !== undefined && group.qty < condition.min_quantity) { match = false; failReason = \`qty (\${group.qty}) < min_quantity (\${condition.min_quantity})\`; }
                 if (match && condition.max_quantity !== undefined && group.qty > condition.max_quantity) { match = false; failReason = \`qty (\${group.qty}) > max_quantity (\${condition.max_quantity})\`; }
                 
                 if (match && condition.metric && condition.operator && condition.value !== undefined) {
                     let metricValue = 0;
                     if (condition.metric === 'weight') metricValue = group.weight;
                     else if (condition.metric === 'amount') metricValue = group.subtotal;
                     else if (condition.metric === 'quantity') metricValue = group.qty;
                     
                     const ruleValue = Number(condition.value);
                     switch (condition.operator) {
                         case '<': if (!(metricValue < ruleValue)) { match = false; failReason = \`\${condition.metric} (\${metricValue}) !< \${ruleValue}\`; } break;
                         case '<=': if (!(metricValue <= ruleValue)) { match = false; failReason = \`\${condition.metric} (\${metricValue}) !<= \${ruleValue}\`; } break;
                         case '>': if (!(metricValue > ruleValue)) { match = false; failReason = \`\${condition.metric} (\${metricValue}) !> \${ruleValue}\`; } break;
                         case '>=': if (!(metricValue >= ruleValue)) { match = false; failReason = \`\${condition.metric} (\${metricValue}) !>= \${ruleValue}\`; } break;
                         case '==': 
                         case '=': if (!(metricValue == ruleValue)) { match = false; failReason = \`\${condition.metric} (\${metricValue}) != \${ruleValue}\`; } break;
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
                     break;
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
                 failureDetails = \`No rule matched for \${sClass || 'none'}\`;
             }
        }
        
        let totalCost = 0;
        Object.values(groupCosts).forEach(c => totalCost += c);
        
        if (Object.keys(groups).length > 0 && (allGroupsMatched || matchedRuleIds.length > 0)) {
            snippetMethods.push({
                method_id: 'combined_shipping',
                id: Array.from(new Set(matchedRuleIds)).join('_') || 'standard',
                title: 'Standard Shipping', 
                settings: { cost: { value: totalCost.toFixed(2) } }
            });
        }
        
        const hasFreeShippingCoupon = cart?.coupons?.some(c => c.free_shipping === true || c.code.toLowerCase() === 'freeship');
        if (hasFreeShippingCoupon) {
           snippetMethods = [{ method_id: 'free_shipping', id: 'coupon_free', title: 'Free Shipping (Coupon)', settings: { cost: { value: '0.00' } } }];
        }
        
        if (snippetMethods.length === 0) {
            snippetMethods = [{ method_id: 'flat_rate', id: 'flat_rate', title: 'Standard Shipping (Rules Failed: ' + failureDetails + ')', settings: { cost: { value: '15.00' } } }];
        }
        
        if (isMounted) {
           setShippingMethods(snippetMethods);
           if (snippetMethods.length > 0) {
             setSelectedShippingMethod(snippetMethods[0]);
           }
        }
      } catch (err: any) {
        console.error("Failed to load shipping methods", err);
        if (isMounted) {
            setShippingMethods([{ method_id: 'flat_rate', id: 'flat_rate_error', title: 'Standard Shipping (Error)', settings: { cost: { value: '15.00' } } }]);
            setSelectedShippingMethod({ method_id: 'flat_rate', id: 'flat_rate_error', title: 'Standard Shipping (Error)', settings: { cost: { value: '15.00' } } });
        }
      }
    };
`;

code = code.replace(/const fetchShipping = async \(\) => \{[\s\S]*?    \};\n    fetchShipping\(\);/, newFetchShipping + '\n    fetchShipping();');

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

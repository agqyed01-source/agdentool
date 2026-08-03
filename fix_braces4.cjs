const fs = require('fs');
let c = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf-8');

c = c.replace(/                    if \(!condition.countries.includes\(billing.country\)\) \{ match = false; failReason = \`Country \$\{billing.country\} not in \[\$\{condition.countries\}\]\`; \}\n                 if \(match && condition.shipping_classes/,
`                    if (!condition.countries.includes(billing.country)) { match = false; failReason = \`Country \${billing.country} not in [\${condition.countries}]\`; }
                 }
                 if (match && condition.shipping_classes`);

c = c.replace(/                    if \(!normalizedClasses.includes\(normalizedSClass\)\) \{ match = false; failReason = \`Class '\$\{sClass\}' not in \[\$\{condition.shipping_classes\}\]\`; \}\n                 if \(match && condition.min_amount/,
`                    if (!normalizedClasses.includes(normalizedSClass)) { match = false; failReason = \`Class '\${sClass}' not in [\${condition.shipping_classes}]\`; }
                 }
                 if (match && condition.min_amount`);
                 
c = c.replace(/                         case '=': if \(!\(metricValue == ruleValue\)\) \{ match = false; failReason = \`\$\{condition.metric\} \(\$\{metricValue\}\) != \$\{ruleValue\}\`; \} break;\n                     }\n                                  if \(match\) \{/,
`                         case '=': if (!(metricValue == ruleValue)) { match = false; failReason = \`\${condition.metric} (\${metricValue}) != \${ruleValue}\`; } break;
                     }
                 }
                 if (match) {`);

c = c.replace(/                     break;\n             }\n             if \(\!groupMatched\) \{/,
`                     break;
                 }
             }
             if (!groupMatched) {`);

fs.writeFileSync('src/pages/CheckoutPage.tsx', c);

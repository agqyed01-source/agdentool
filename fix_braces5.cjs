const fs = require('fs');
let c = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf-8');

c = c.replace(/                         case '=': if \(!\(metricValue == ruleValue\)\) \{ match = false; failReason = \`\$\{condition.metric\} \(\$\{metricValue\}\) != \$\{ruleValue\}\`; \} break;\n                     }\n                  \n                  if \(match\) \{/,
`                         case '=': if (!(metricValue == ruleValue)) { match = false; failReason = \`\${condition.metric} (\${metricValue}) != \${ruleValue}\`; } break;
                     }
                 }
                  if (match) {`);

c = c.replace(/                     break;\n             }\n \n             if \(\!groupMatched\) \{/,
`                     break;
                 }
             }
             if (!groupMatched) {`);

fs.writeFileSync('src/pages/CheckoutPage.tsx', c);

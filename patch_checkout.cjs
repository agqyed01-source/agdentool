const fs = require('fs');

let content = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf-8');

const target = `                 allGroupsMatched = false;
                 failureDetails = \`No rule matched for \${sClass || 'none'}\`;`;

const replacement = `                 // Fallback to a default shipping cost so checkout isn't blocked
                 groupCosts[sClass] = 15.00;
                 matchedRuleIds.push('fallback');
                 matchedRuleNames.push('Standard Shipping (Default)');`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/pages/CheckoutPage.tsx', content);
    console.log("Patched fallback successfully!");
} else {
    console.log("Could not find target to patch.");
}

const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
    /if \(lowerClass === 'bulky' \|\| lowerClass === 'heavy-tools'\) \{/,
    "if (lowerClass === 'bulky' || lowerClass === 'heavy-tools') {\n                 itemShippingClass = 'no-free-ship';\n             } else if (lowerClass !== 'small-light' && lowerClass !== 'no-free-ship' && lowerClass !== 'orthodontics') {\n                 console.warn(`Unknown shipping class: ${itemShippingClass}. Falling back to 'small-light'`);\n                 itemShippingClass = 'small-light';\n             } else if (lowerClass === 'bulky' || lowerClass === 'heavy-tools') {" // dummy to match replace
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

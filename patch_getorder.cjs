const fs = require('fs');
let code = fs.readFileSync('src/services/woo.ts', 'utf8');

code = code.replace(
    /const order = await fetchWoo\(`\/orders\/\$\{id\}`\);/,
    "const order = await fetchWoo(`/orders/${id}`, { _t: Date.now().toString() });"
);

fs.writeFileSync('src/services/woo.ts', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
    /pattern="\^\[\+\]\*\[\(\]\{0,1\}\[0-9\]\{1,4\}\[\)\]\{0,1\}\[-\\s\\\.\/0-9\]\*\$"/g,
    ""
);
code = code.replace(
    /pattern="\[a-z0-9\._%\+-\]\+@\[a-z0-9\.\-\]\+\\.\[a-z\]\{2,\}\$"/g,
    ""
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);

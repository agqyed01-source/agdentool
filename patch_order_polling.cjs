const fs = require('fs');
let code = fs.readFileSync('src/pages/OrderPage.tsx', 'utf8');

code = code.replace(
/if \(order && order\.status === 'pending'\) \{\s*intervalId = setInterval\(\(\) => \{\s*wooApi\.getOrder\(id!\)\.then\(data => \{\s*if \(data && data\.status !== 'pending'\) \{\s*setOrder\(data\);\s*clearInterval\(intervalId\);\s*\}\s*\}\);\s*\}, 5000\);\s*\}/g,
`if (order && order.needs_payment) {
      intervalId = setInterval(() => {
        wooApi.getOrder(id!).then(data => {
          if (data && !data.needs_payment) {
            setOrder(data);
            clearInterval(intervalId);
          }
        });
      }, 5000);
    }`
);

// update dependency array
code = code.replace(
/\}, \[order\?\.status, id\]\);/g,
`}, [order?.needs_payment, id]);`
);

fs.writeFileSync('src/pages/OrderPage.tsx', code);

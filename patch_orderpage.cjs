const fs = require('fs');
let code = fs.readFileSync('src/pages/OrderPage.tsx', 'utf8');

const pollCode = `
  useEffect(() => {
    let intervalId: any;
    if (order && order.status === 'pending') {
      intervalId = setInterval(() => {
        wooApi.getOrder(id!).then(data => {
          if (data && data.status !== 'pending') {
            setOrder(data);
            clearInterval(intervalId);
          }
        });
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [order?.status, id]);
`;

// Insert after the first useEffect
code = code.replace(
    /(\n\s*useEffect\(\(\) => \{\n\s*if \(id\) \{[\s\S]*?\}, \[id\]\);\n)/,
    "$1" + pollCode
);

fs.writeFileSync('src/pages/OrderPage.tsx', code);

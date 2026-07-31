const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
/const fetchOptions: RequestInit = \{\s*method: 'GET',\s*headers: \{\s*'Accept': 'application\/json'\s*\}\s*\};/g,
`const fetchOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      };`
);

fs.writeFileSync('server.ts', code);

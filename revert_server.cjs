const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

const target1 = `      // Handle TranslatePress URL structure if lang parameter is provided
      let langSlug = '';
      if (queryParams && queryParams.lang && queryParams.lang !== 'en') {
        langSlug = \`/\${queryParams.lang}\`;
        delete queryParams.lang; // Remove it so it doesn't get added to the query string
      }
      
      if (!baseUrl.includes('/wp-json')) {
        baseUrl = \`\${baseUrl}\${langSlug}/wp-json/wc/v3\`;
      } else {
        const parts = baseUrl.split('/wp-json');
        baseUrl = \`\${parts[0]}\${langSlug}/wp-json\${parts[1] || ''}\`;
      }`;

const replacement1 = `      if (!baseUrl.includes('/wp-json')) {
        baseUrl = \`\${baseUrl}/wp-json/wc/v3\`;
      }`;

server = server.split(target1).join(replacement1);

fs.writeFileSync('server.ts', server);

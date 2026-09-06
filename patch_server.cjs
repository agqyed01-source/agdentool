const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

// Inside server.ts, replace the part where we set baseUrl
const target = `      let baseUrl = WOO_URL.replace(/\\/$/, '');
      if (!baseUrl.includes('/wp-json')) {
        baseUrl = \`\${baseUrl}/wp-json/wc/v3\`;
      }`;

const replacement = `      let baseUrl = WOO_URL.replace(/\\/$/, '');
      
      // Handle TranslatePress URL structure if lang parameter is provided
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

if (server.includes(target)) {
  server = server.split(target).join(replacement);
} else {
  console.log("Target not found!");
}

fs.writeFileSync('server.ts', server);

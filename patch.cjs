const fs = require('fs');
const file = 'src/services/woo.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  'async function fetchWoo(\n  endpoint: string,\n  queryParams: Record<string, string> = {},\n  method: string = "GET",\n  bodyData?: any,\n  includeHeaders: boolean = false\n) {\n  let fetchOptions: RequestInit;',
  `async function fetchWoo(
  endpoint: string,
  queryParams: Record<string, string> = {},
  method: string = "GET",
  bodyData?: any,
  includeHeaders: boolean = false
) {
  if (i18n && i18n.language) {
    const lang = i18n.language.split("-")[0];
    if (lang !== "en") {
      queryParams = { ...queryParams, lang };
    }
  }

  let fetchOptions: RequestInit;`
);
fs.writeFileSync(file, content);

const fs = require('fs');
const file = 'src/pages/ProductPage.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useTranslation')) {
  content = content.replace("import { Link", "import { useTranslation } from 'react-i18next';\nimport { Link");
}

if (!content.includes('const { i18n } = useTranslation();')) {
  content = content.replace("export const ProductPage = () => {", "export const ProductPage = () => {\n  const { i18n } = useTranslation();");
}

content = content.replace("    }\n  }, [slug]);", "    }\n  }, [slug, i18n.language]);");

fs.writeFileSync(file, content);

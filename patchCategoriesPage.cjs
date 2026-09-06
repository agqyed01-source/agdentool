const fs = require('fs');
const file = 'src/pages/CategoriesPage.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useTranslation')) {
  content = content.replace("import React,", "import { useTranslation } from 'react-i18next';\nimport React,");
}

if (!content.includes('const { i18n } = useTranslation();')) {
  content = content.replace("export const CategoriesPage = () => {", "export const CategoriesPage = () => {\n  const { i18n } = useTranslation();");
}

content = content.replace(".finally(() => setLoading(false));\n  }, []);", ".finally(() => setLoading(false));\n  }, [i18n.language]);");

fs.writeFileSync(file, content);

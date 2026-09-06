const fs = require('fs');

let header = fs.readFileSync('src/components/Header.tsx', 'utf8');
if (!header.includes('const { t, i18n } = useTranslation();')) {
  header = header.replace('const { t } = useTranslation();', 'const { t, i18n } = useTranslation();');
}
header = header.replace('  }, []);\n\n  useEffect(() => {\n    const query', '  }, [i18n.language]);\n\n  useEffect(() => {\n    const query');
fs.writeFileSync('src/components/Header.tsx', header);

let footer = fs.readFileSync('src/components/FeaturedAndFooter.tsx', 'utf8');
if (!footer.includes('useTranslation')) {
  footer = footer.replace("import React,", "import { useTranslation } from 'react-i18next';\nimport React,");
}
if (!footer.includes('const { i18n } = useTranslation();')) {
  footer = footer.replace("export const FeaturedCategories = () => {", "export const FeaturedCategories = () => {\n  const { i18n } = useTranslation();");
  footer = footer.replace("wooApi.getCategories().then(setCategories);\n  }, []);", "wooApi.getCategories().then(setCategories);\n  }, [i18n.language]);");
}
fs.writeFileSync('src/components/FeaturedAndFooter.tsx', footer);

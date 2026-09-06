const fs = require('fs');
const file = 'src/pages/ShopPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import if not exists
if (!content.includes('useTranslation')) {
  content = content.replace("import { Link", "import { useTranslation } from 'react-i18next';\nimport { Link");
}

// Add i18n hook
if (!content.includes('const { i18n } = useTranslation();')) {
  content = content.replace("export const ShopPage = () => {", "export const ShopPage = () => {\n  const { i18n } = useTranslation();");
}

// Update useEffect for categories
content = content.replace("wooApi.getCategories().then(setCategories).catch(console.error);\n  }, []);", "wooApi.getCategories().then(setCategories).catch(console.error);\n  }, [i18n.language]);");

// Update useEffect for products
content = content.replace("}, [currentCategorySlug, searchParams, sortBy]);", "}, [currentCategorySlug, searchParams, sortBy, i18n.language]);");

fs.writeFileSync(file, content);

const fs = require('fs');
const file = 'src/components/ProductSection.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useTranslation')) {
  content = content.replace("import React,", "import { useTranslation } from 'react-i18next';\nimport React,");
}

// ProductCategories component
if (content.includes('export const ProductCategories = () => {') && !content.includes('const { i18n } = useTranslation();', content.indexOf('export const ProductCategories = () => {'))) {
  content = content.replace("export const ProductCategories = () => {", "export const ProductCategories = () => {\n  const { i18n } = useTranslation();");
  content = content.replace("setCategories(filtered);\n      })\n      .catch(console.error);\n  }, []);", "setCategories(filtered);\n      })\n      .catch(console.error);\n  }, [i18n.language]);");
}

// ProductSection component
if (content.includes('export const ProductSection = () => {') && !content.includes('const { i18n } = useTranslation();', content.indexOf('export const ProductSection = () => {'))) {
  content = content.replace("export const ProductSection = () => {", "export const ProductSection = () => {\n  const { i18n } = useTranslation();");
  content = content.replace("setCategories(cats);\n      })\n      .catch(console.error);\n  }, []);", "setCategories(cats);\n      })\n      .catch(console.error);\n  }, [i18n.language]);");
  content = content.replace(".catch((err) => {\n        console.error(err);\n        setError(\"Failed to load products. Please try again later.\");\n      })\n      .finally(() => setLoading(false));\n  }, [activeCategory]);", ".catch((err) => {\n        console.error(err);\n        setError(\"Failed to load products. Please try again later.\");\n      })\n      .finally(() => setLoading(false));\n  }, [activeCategory, i18n.language]);");
}

fs.writeFileSync(file, content);

const fs = require('fs');

let product = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

// The translation hook is already there as: const { i18n } = useTranslation();
// Need to add t
product = product.replace('const { i18n } = useTranslation();', 'const { t, i18n } = useTranslation();');

product = product.replace(
  "{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}",
  "{isOutOfStock ? t('cart.out_of_stock', 'Out of Stock') : t('cart.add_to_cart', 'Add to Cart')}"
);

product = product.replace(
  "{isOutOfStock ? 'Out of Stock' : (product.type === 'variable' ? 'Select Options' : 'Add to Cart')}",
  "{isOutOfStock ? t('cart.out_of_stock', 'Out of Stock') : (product.type === 'variable' ? t('product.select_options', 'Select Options') : t('cart.add_to_cart', 'Add to Cart'))}"
);

// Breadcrumb "Home"
product = product.replace(
  'className="text-slate-500 hover:text-slate-900 transition-colors">Home</Link>',
  'className="text-slate-500 hover:text-slate-900 transition-colors">{t("nav.home", "Home")}</Link>'
);

fs.writeFileSync('src/pages/ProductPage.tsx', product);

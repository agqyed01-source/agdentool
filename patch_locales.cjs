const fs = require('fs');

function addProductKeys(file, translations) {
  let json = JSON.parse(fs.readFileSync(file, 'utf8'));
  json.product = translations;
  fs.writeFileSync(file, JSON.stringify(json, null, 2));
}

addProductKeys('src/i18n/locales/en.json', {
  "select_options": "Select Options",
  "reviews": "Reviews",
  "details": "Product Details"
});

addProductKeys('src/i18n/locales/es.json', {
  "select_options": "Seleccionar opciones",
  "reviews": "Opiniones",
  "details": "Detalles del producto"
});

addProductKeys('src/i18n/locales/pt.json', {
  "select_options": "Selecionar opções",
  "reviews": "Avaliações",
  "details": "Detalhes do Produto"
});

addProductKeys('src/i18n/locales/ru.json', {
  "select_options": "Выбрать опции",
  "reviews": "Отзывы",
  "details": "О товаре"
});

addProductKeys('src/i18n/locales/ar.json', {
  "select_options": "تحديد الخيارات",
  "reviews": "التقييمات",
  "details": "تفاصيل المنتج"
});

const fs = require('fs');
const content = fs.readFileSync('src/data/shippingRules.json', 'utf8');
const data = JSON.parse(content);
const countries = {};
data.rules.forEach(r => {
  if (r.condition && r.condition.country_names && r.condition.countries) {
    for (let i = 0; i < r.condition.country_names.length; i++) {
      countries[r.condition.country_names[i]] = r.condition.countries[i];
    }
  }
});
console.log(JSON.stringify(countries, null, 2));

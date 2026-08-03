const fs = require('fs');
const csv = require('csv-parse/sync');
const isoCountries = require('i18n-iso-countries');

const csvData = fs.readFileSync('r1.csv', 'utf8');
const records = csv.parse(csvData, { skip_empty_lines: true });

const rules = [];
let ruleIdCounter = 1;

for (let i = 0; i < records.length; i++) {
  const row = records[i];
  if (row.length < 7) continue;

  const countryName = row[0].trim();
  const zone = row[1].trim();
  const shippingClass = row[2].trim();
  const condType = row[3].trim();
  const condOpValue = row[4].trim();
  const feeStr = row[5].trim();
  const currency = row[6].trim();

  const rule = {
      id: `rule_csv_${ruleIdCounter++}`,
      enabled: true,
      priority: 100, // Default priority
      name: `${countryName} ${shippingClass} ${condType} ${condOpValue}`,
      condition: {
          country_names: [countryName],
          countries: [],
          shipping_classes: [shippingClass]
      }
  };

  if (countryName.toLowerCase() === 'rest of world') {
      rule.condition.countries = [];
  } else {
      let isoCode = isoCountries.getAlpha2Code(countryName, 'en');
      if (!isoCode) {
          if (countryName.toLowerCase() === 'united kingdom') isoCode = 'GB';
          else if (countryName.toLowerCase() === 'macao(china)') isoCode = 'MO';
          else if (countryName.toLowerCase() === 'republic of korea') isoCode = 'KR';
          else if (countryName.toLowerCase() === 'czech republic') isoCode = 'CZ';
          else if (countryName.toLowerCase() === 'united states virgin islands') isoCode = 'VI';
          else if (countryName.toLowerCase() === 'tortola (british virgin islands)') isoCode = 'VG';
      }
      if (isoCode) {
          rule.condition.countries.push(isoCode);
      }
  }

  let operator = '';
  let value = 0;
  if (condOpValue.startsWith('<=')) { operator = '<='; value = parseFloat(condOpValue.substring(2)); }
  else if (condOpValue.startsWith('>=')) { operator = '>='; value = parseFloat(condOpValue.substring(2)); }
  else if (condOpValue.startsWith('<')) { operator = '<'; value = parseFloat(condOpValue.substring(1)); }
  else if (condOpValue.startsWith('>')) { operator = '>'; value = parseFloat(condOpValue.substring(1)); }
  else if (condOpValue.startsWith('=')) { operator = '='; value = parseFloat(condOpValue.substring(1)); }
  else { operator = '='; value = parseFloat(condOpValue); }

  if (operator === '<' && condType === '重量') {
      operator = '<=';
  }

  let metric = 'amount';
  if (condType === '金额' || condType === '购买数量区间') {
      if(shippingClass === 'small-light' && condType === '购买数量区间') {
          metric = 'quantity';
      } else {
          metric = 'amount';
      }
  } else if (condType === '重量' || condType === '每增加基础计费') {
      metric = 'weight';
  }

  rule.condition.metric = metric;
  rule.condition.operator = operator;
  rule.condition.value = value;
  rule.name = `${countryName} ${shippingClass} ${metric} ${operator} ${value}`;

  if (metric === 'amount') {
     rule.priority = 100 + value;
  }
  if (metric === 'quantity') {
     rule.priority = 100 + value;
  }
  if (metric === 'weight') {
     rule.priority = 1000 + value;
  }

  if (condType === '每增加基础计费') {
      const match = feeStr.match(/([\d\.]+)\+ceil\(\(重量-([\d\.]+)\)\/([\d\.]+)\)\*([\d\.]+)/);
      if (match) {
          rule.calculation_mode = 'incremental';
          rule.base_fee = parseFloat(match[1]);
          rule.base_weight = parseFloat(match[2]);
          rule.step_weight = parseFloat(match[3]);
          rule.step_fee = parseFloat(match[4]);
      } else {
          rule.calculation_mode = 'fixed';
          rule.shipping_fee = parseFloat(feeStr);
      }
  } else {
      rule.calculation_mode = 'fixed';
      rule.shipping_fee = parseFloat(feeStr);
  }

  rules.push(rule);
}

// Global fallback rules (copy US rules without country restriction and lower priority)
const usRules = rules.filter(r => r.condition.countries && r.condition.countries.includes('US'));
for (const usRule of usRules) {
    const fallbackRule = JSON.parse(JSON.stringify(usRule));
    fallbackRule.id = `rule_csv_fallback_${ruleIdCounter++}`;
    fallbackRule.name = fallbackRule.name.replace('United States ', 'Global Fallback ');
    delete fallbackRule.condition.countries; // Matches any country
    fallbackRule.condition.country_names = ['Any'];
    fallbackRule.priority += 10000; // Make them lowest priority
    rules.push(fallbackRule);
}

fs.writeFileSync('src/data/shippingRules.json', JSON.stringify({ rules }, null, 2));
console.log(`Generated ${rules.length} rules (including fallbacks) to src/data/shippingRules.json`);

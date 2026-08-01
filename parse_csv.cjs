const fs = require('fs');
const countriesObj = require('i18n-iso-countries');

const csv = fs.readFileSync('r1.csv', 'utf-8');
const lines = csv.split('\n').filter(l => l.trim() !== '');

const rules = [];
let idCounter = 1;

for (let line of lines) {
  // Fix quotes if any
  line = line.replace(/"/g, '');
  const parts = line.split(',');
  if (parts.length < 7) continue;
  
  const country = parts[0].trim();
  const zone = parts[1].trim();
  const shippingClass = parts[2].trim();
  const condType = parts[3].trim();
  const condOpValue = parts[4].trim(); // e.g. <50
  const feeStr = parts[5].trim();
  const currency = parts[6].trim();
  
  if (country === '国家' || country === 'Country') continue;
  
  let operator = '';
  let value = 0;
  
  if (condOpValue.startsWith('<=')) {
    operator = '<=';
    value = parseFloat(condOpValue.substring(2));
  } else if (condOpValue.startsWith('<')) {
    operator = '<';
    value = parseFloat(condOpValue.substring(1));
  } else if (condOpValue.startsWith('>=')) {
    operator = '>=';
    value = parseFloat(condOpValue.substring(2));
  } else if (condOpValue.startsWith('>')) {
    operator = '>';
    value = parseFloat(condOpValue.substring(1));
  }
  
  if (operator === '<' && condType === '重量') {
      operator = '<=';
  }
  
  let metric = '';
  if (condType === '金额' || condType === '购买数量区间') {
      if(shippingClass === 'small-light' && condType === '购买数量区间') {
          metric = 'quantity';
      } else {
          metric = 'amount';
      }
  } else if (condType === '重量' || condType === '每增加基础计费') {
      metric = 'weight';
  }
  
  let isoCode = countriesObj.getAlpha2Code(country, 'en');
  // Manual overrides for names that don't match exactly
  if (!isoCode) {
      const overrides = {
          "Macao(China)": "MO",
          "Macau": "MO",
          "Czech Republic": "CZ",
          "Congo (REP. OF)": "CG",
          "Congo (DEM. REP. OF)": "CD",
          "Wallis And Futuna Islands": "WF",
          "Tortola (British Virgin Islands)": "VG",
          "Sint Maarteen": "SX",
          "Samoa": "WS",
          "Saint Vincent and The Grenadies": "VC",
          "Saint Pierre And Miquelon": "PM",
          "Ascension Island": "AC",
          "Curacao": "CW",
          "Bonaire": "BQ",
          "Tristan Da Cunha": "TA", // TA or SH-TA
          "Reunion": "RE",
          "Cote D'Ivoire": "CI",
          "Turks And Caicos Islands": "TC",
          "Saint Helena": "SH",
          "Pitcairn": "PN",
          "Kosovo": "XK",
          "Moldova": "MD",
          "Macedonia": "MK",
          "Laos": "LA",
          "United States Virgin Islands": "VI",
          "Swaziland": "SZ",
          "Falkland Islands": "FK"
      };
      isoCode = overrides[country];
  }
  
  if (!isoCode) {
      console.warn("Could not find ISO code for:", country);
      isoCode = "__MISSING__";
  }
  
  const rule = {
    id: `rule_csv_${idCounter++}`,
    enabled: true,
    priority: 100,
    name: `${country} ${shippingClass} ${metric} ${operator} ${value}`,
    condition: {
      metric: metric,
      operator: operator,
      value: value,
      country_names: [country],
      countries: [isoCode],
      shipping_classes: [shippingClass]
    }
  };
  
  if (shippingClass === 'small-light') {
     rule.priority = 10;
  }
  
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

// Add a default fallback rule

fs.writeFileSync('src/data/shippingRules.json', JSON.stringify({rules}, null, 2));
console.log('Done converting', rules.length, 'rules');

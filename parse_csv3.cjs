const fs = require('fs');

const countries = {
  "Afghanistan": "AF",  "Albania": "AL",  "Algeria": "DZ",  "American Samoa": "AS",  "Andorra": "AD",  "Angola": "AO",  "Anguilla": "AI",  "Antigua and Barbuda": "AG",  "Argentina": "AR",  "Armenia": "AM",  "Aruba": "AW",  "Ascension Island": "AC",  "Australia": "AU",  "Austria": "AT",  "Azerbaijan": "AZ",  "Bahamas": "BS",  "Bahrain": "BH",  "Bangladesh": "BD",  "Barbados": "BB",  "Belarus": "BY",  "Belgium": "BE",  "Belize": "BZ",  "Benin": "BJ",  "Bermuda": "BM",  "Bhutan": "BT",  "Bolivia": "BO",  "Bonaire": "BQ",  "Bosnia And Herzegovina": "BA",  "Botswana": "BW",  "Brazil": "BR",  "Brunei Darussalam": "BN",  "Bulgaria": "BG",  "Burkina Faso": "BF",  "Burundi": "BI",  "Cambodia": "KH",  "Cameroon": "CM",  "Canada": "CA",  "Cape Verde": "CV",  "Cayman Islands": "KY",  "Central African Republic": "CF",  "Chad": "TD",  "Chile": "CL",  "Colombia": "CO",  "Comoros": "KM",  "Congo (DEM. REP. OF)": "CD",  "Congo (REP. OF)": "CG",  "Cook Islands": "CK",  "Costa Rica": "CR",  "Cote D'Ivoire": "CI",  "Croatia": "HR",  "Cuba": "CU",  "Curacao": "CW",  "Cyprus": "CY",  "Czech Republic": "CZ",  "Denmark": "DK",  "Djibouti": "DJ",  "Dominica": "DM",  "Dominican Republic": "DO",  "Ecuador": "EC",  "Egypt": "EG",  "El Salvador": "SV",  "Equatorial Guinea": "GQ",  "Eritrea": "ER",  "Estonia": "EE",  "Ethiopia": "ET",  "Falkland Islands": "FK",  "Faroe Islands": "FO",  "Fiji": "FJ",  "Finland": "FI",  "France": "FR",  "French Polynesia": "PF",  "Gabon": "GA",  "Gambia": "GM",  "Georgia": "GE",  "Germany": "DE",  "Ghana": "GH",  "Gibraltar": "GI",  "Greece": "GR",  "Greenland": "GL",  "Grenada": "GD",  "Guadeloupe": "GP",  "Guam": "GU",  "Guatemala": "GT",  "Guernsey": "GG",  "Guinea": "GN",  "Haiti": "HT",  "Honduras": "HN",  "Hong Kong": "HK",  "Hungary": "HU",  "Iceland": "IS",  "India": "IN",  "Indonesia": "ID",  "Iran": "IR",  "Iraq": "IQ",  "Ireland": "IE",  "Isle of Man": "IM",  "Israel": "IL",  "Italy": "IT",  "Jamaica": "JM",  "Japan": "JP",  "Jersey": "JE",  "Jordan": "JO",  "Kazakhstan": "KZ",  "Kenya": "KE",  "Kiribati": "KI",  "Kosovo": "XK",  "Kuwait": "KW",  "Kyrgyzstan": "KG",  "Laos": "LA",  "Latvia": "LV",  "Lebanon": "LB",  "Lesotho": "LS",  "Liberia": "LR",  "Libya": "LY",  "Liechtenstein": "LI",  "Lithuania": "LT",  "Luxembourg": "LU",  "Macao(China)": "MO",  "Macedonia": "MK",  "Madagascar": "MG",  "Malawi": "MW",  "Malaysia": "MY",  "Maldives": "MV",  "Mali": "ML",  "Malta": "MT",  "Marshall Islands": "MH",  "Martinique": "MQ",  "Mauritius": "MU",  "Mexico": "MX",  "Moldova": "MD",  "Monaco": "MC",  "Mongolia": "MN",  "Montenegro": "ME",  "Montserrat": "MS",  "Morocco": "MA",  "Mozambique": "MZ",  "Myanmar": "MM",  "Namibia": "NA",  "Nauru": "NR",  "Nepal": "NP",  "Netherlands": "NL",  "New Caledonia": "NC",  "New Zealand": "NZ",  "Nicaragua": "NI",  "Niger": "NE",  "Nigeria": "NG",  "Niue": "NU",  "Norfolk Island": "NF",  "Northern Mariana Islands": "MP",  "Norway": "NO",  "Oman": "OM",  "Pakistan": "PK",  "Palestine": "PS",  "Panama": "PA",  "Papua New Guinea": "PG",  "Paraguay": "PY",  "Peru": "PE",  "Philippines": "PH",  "Pitcairn": "PN",  "Poland": "PL",  "Portugal": "PT",  "Puerto Rico": "PR",  "Qatar": "QA",  "Republic of Korea": "KR",  "Reunion": "RE",  "Romania": "RO",  "Russia": "RU",  "Rwanda": "RW",  "Saint Helena": "SH",  "Saint Kitts And Nevis": "KN",  "Saint Lucia": "LC",  "Saint Pierre And Miquelon": "PM",  "Saint Vincent and The Grenadies": "VC",  "Samoa, Western": "WS",  "San Marino": "SM",  "Sao Tome and Principe": "ST",  "Saudi Arabia": "SA",  "Senegal": "SN",  "Serbia": "RS",  "Seychelles": "SC",  "Sierra Leone": "SL",  "Singapore": "SG",  "Sint Maarteen": "SX",  "Slovakia": "SK",  "Slovenia": "SI",  "Solomon Islands": "SB",  "Somalia": "SO",  "South Africa": "ZA",  "Spain": "ES",  "Sri Lanka": "LK",  "Sudan": "SD",  "Suriname": "SR",  "Swaziland": "SZ",  "Sweden": "SE",  "Switzerland": "CH",  "Taiwan": "TW",  "Tajikistan": "TJ",  "Tanzania": "TZ",  "Thailand": "TH",  "Timor-leste": "TL",  "Togo": "TG",  "Tokelau": "TK",  "Tonga": "TO",  "Tortola (British Virgin Islands)": "VG",  "Trinidad and Tobago": "TT",  "Tristan Da Cunha": "SH",  "Tunisia": "TN",  "Turkey": "TR",  "Turks And Caicos Islands": "TC",  "Tuvalu": "TV",  "UAE": "AE",  "Uganda": "UG",  "Ukraine": "UA",  "United Kingdom": "GB",  "United States": "US",  "United States Virgin Islands": "VI",  "Uruguay": "UY",  "Uzbekistan": "UZ",  "Vanuatu": "VU",  "Venezuela": "VE",  "Vietnam": "VN",  "Wallis And Futuna Islands": "WF",  "Zambia": "ZM",  "Zimbabwe": "ZW"
};

let allRules = [];

function generateRule(countryName, shippingClass, conditionStr, formulaStr) {
  let cc = countries[countryName];
  if (!cc) {
    if (countryName === "Macao(China)") cc = "MO";
    else if (countryName === "Samoa, Western") cc = "WS";
    else if (countryName === "Tortola (British Virgin Islands)") cc = "VG";
    else {
      console.error("Unknown country: " + countryName);
      return null;
    }
  }

  let metric = "weight";
  let operator = conditionStr.charAt(0);
  if (conditionStr.startsWith(">=")) operator = ">=";
  else if (conditionStr.startsWith("<=")) operator = "<=";
  
  let valueStr = conditionStr.replace(/^[<>=]+/, '');
  let value = parseFloat(valueStr);
  let maxWeight = null;
  if (operator === "<" || operator === "<=") {
    maxWeight = value;
  }
  
  if (shippingClass === "Orthodontics") {
    metric = "item_count";
    operator = ">=";
    value = 1;
    maxWeight = null;
  }

  let calcMode = "fixed";
  let fee = 0;
  let baseFee = 0;
  let stepWeight = 0;
  let stepFee = 0;
  let baseWeight = 0;

  formulaStr = formulaStr.trim();
  if (formulaStr.includes("ceil")) {
    calcMode = "incremental";
    // 31.03+ceil((-2000)/10)*1.76
    // or 48.09+ceil((W-2000)/10)*1.26
    let m = formulaStr.match(/^([\d\.]+)\s*\+\s*ceil\s*\(\s*\([^\-\)]*\-\s*([\d\.]+)\s*\)\s*\/\s*([\d\.]+)\s*\)\s*\*\s*([\d\.]+)/);
    if (m) {
      baseFee = parseFloat(m[1]);
      baseWeight = parseFloat(m[2]);
      stepWeight = parseFloat(m[3]);
      stepFee = parseFloat(m[4]);
    } else {
      console.error("Failed to parse formula: " + formulaStr);
      return null;
    }
  } else {
    fee = parseFloat(formulaStr);
    if (isNaN(fee)) {
        console.error("Fee is NaN for: " + formulaStr);
        return null;
    }
  }

  let id = `${cc}_${shippingClass.replace(/-/g, '_')}_${metric}_${value}`;
  let priority = 10;
  if (operator === "<" || operator === "<=") {
    priority = value * 10;
  } else if (operator === ">" || operator === ">=") {
    priority = 100000 + value;
  }

  if (shippingClass === "Orthodontics") {
    priority = 5;
  }

  let rule = {
    id: id,
    enabled: true,
    priority: priority,
    name: `${countryName} ${shippingClass} ${metric} ${operator}${value}`,
    condition: {
      metric: metric,
      operator: operator,
      value: value,
      countries: [cc],
      country_names: [countryName],
      shipping_classes: [shippingClass]
    }
  };
  
  if (maxWeight !== null) {
    rule.condition.max_weight = maxWeight;
  }
  
  rule.calculation_mode = calcMode;
  if (calcMode === "fixed") {
    rule.shipping_fee = fee;
  } else {
    rule.base_fee = baseFee;
    rule.base_weight = baseWeight;
    rule.step_weight = stepWeight;
    rule.step_fee = stepFee;
  }
  
  return rule;
}

const csvData = fs.readFileSync('input.csv', 'utf8').split('\n');
csvData.forEach((line, index) => {
  if (index === 0 || !line.trim()) return;
  
  let parts = [];
  let inQuotes = false;
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    let char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(cur);
      cur = '';
    } else {
      cur += char;
    }
  }
  parts.push(cur);

  if (parts.length >= 6) {
    let country = parts[0].trim();
    let shippingClass = parts[2].trim();
    let condition = parts[4].trim();
    let formula = parts[5].trim();
    
    if (country && shippingClass && condition && formula) {
      let r = generateRule(country, shippingClass, condition, formula);
      if (r) {
        allRules.push(r);
      }
    }
  }
});

const output = {
  version: "2.0",
  currency: "USD",
  weight_unit: "g",
  match_type: "first_match",
  rules: allRules
};

fs.writeFileSync('src/data/shippingRules.json', JSON.stringify(output, null, 2));
console.log("Wrote " + allRules.length + " rules to shippingRules.json");

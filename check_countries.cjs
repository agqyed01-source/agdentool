const fs = require('fs');

const countryMap = {
  "United States": "US", "United Kingdom": "GB", "Sweden": "SE", "Spain": "ES", "Slovenia": "SI", "Slovakia": "SK", "Singapore": "SG", "Romania": "RO", "Republic of Korea": "KR", "Portugal": "PT", "Poland": "PL", "Philippines": "PH", "New Zealand": "NZ", "Netherlands": "NL", "Mexico": "MX", "Malaysia": "MY", "Macau": "MO", "Luxembourg": "LU", "Lithuania": "LT", "Latvia": "LV", "Japan": "JP", "Italy": "IT", "Ireland": "IE", "Indonesia": "ID", "Hungary": "HU", "Hong Kong": "HK", "Greece": "GR", "Germany": "DE", "France": "FR", "Finland": "FI", "Estonia": "EE", "Denmark": "DK", "Czechia": "CZ", "Cyprus": "CY", "Croatia": "HR", "Canada": "CA", "Cambodia": "KH", "Bulgaria": "BG", "Brazil": "BR", "Belgium": "BE", "Austria": "AT", "Australia": "AU", "Vietnam": "VN", "Uruguay": "UY", "UAE": "AE", "Turkey": "TR", "Thailand": "TH", "Taiwan": "TW", "Switzerland": "CH", "Sri Lanka": "LK", "South Africa": "ZA", "Serbia": "RS", "Saudi Arabia": "SA", "Qatar": "QA", "Peru": "PE", "Panama": "PA", "Oman": "OM", "Norway": "NO", "Nigeria": "NG", "Nicaragua": "NI", "Nepal": "NP", "Myanmar": "MM", "Morocco": "MA", "Montenegro": "ME", "Mongolia": "MN", "Moldova": "MD", "Mauritius": "MU", "Malta": "MT", "Maldives": "MV", "Macedonia": "MK", "Lebanon": "LB", "Laos": "LA", "Kyrgyzstan": "KG", "Kuwait": "KW", "Kazakhstan": "KZ", "Jordan": "JO", "Israel": "IL", "India": "IN", "Honduras": "HN", "Guatemala": "GT", "Georgia": "GE", "El Salvador": "SV", "Egypt": "EG", "Ecuador": "EC", "Dominican Republic": "DO", "Colombia": "CO", "Chile": "CL", "Brunei Darussalam": "BN", "Bosnia And Herzegovina": "BA", "Bolivia": "BO", "Belize": "BZ", "Bangladesh": "BD", "Bahrain": "BH", "Azerbaijan": "AZ", "Armenia": "AM", "Argentina": "AR", "Albania": "AL", "Uzbekistan": "UZ", "Tunisia": "TN", "Tajikistan": "TJ", "Suriname": "SR", "Paraguay": "PY", "United States Virgin Islands": "VI"
};

const csv = fs.readFileSync('r1.csv', 'utf-8');
const lines = csv.split('\n').filter(l => l.trim() !== '');

const missing = new Set();
for (const line of lines) {
  const parts = line.split(',');
  if (parts.length < 7) continue;
  
  const country = parts[0].trim();
  if (country === '国家' || country === 'Country') continue;
  
  if (!countryMap[country]) {
      missing.add(country);
  }
}

console.log(Array.from(missing).join("\n"));

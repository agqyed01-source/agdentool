const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/shippingRules.json'));

data.rules.push({
    "id": "global_fallback_heavy_tools_gt",
    "enabled": true,
    "priority": 100000,
    "name": "Global Fallback heavy-tools weight > 2000",
    "condition": {
        "country_names": ["Any"],
        "shipping_classes": ["heavy-tools"],
        "metric": "weight",
        "operator": ">",
        "value": 2000
    },
    "calculation_mode": "incremental",
    "base_fee": 15.29,
    "base_weight": 2000,
    "step_weight": 10,
    "step_fee": 1.74
});

data.rules.push({
    "id": "global_fallback_heavy_tools_le",
    "enabled": true,
    "priority": 10000,
    "name": "Global Fallback heavy-tools weight <= 2000",
    "condition": {
        "country_names": ["Any"],
        "shipping_classes": ["heavy-tools"],
        "metric": "weight",
        "operator": "<=",
        "value": 2000
    },
    "calculation_mode": "fixed",
    "shipping_fee": 15.29
});

data.rules.push({
    "id": "benin_no_free_ship_gt",
    "enabled": true,
    "priority": 100000,
    "name": "Benin no-free-ship weight > 2000",
    "condition": {
        "country_names": ["Benin"],
        "countries": ["BJ"],
        "shipping_classes": ["no-free-ship"],
        "metric": "weight",
        "operator": ">",
        "value": 2000
    },
    "calculation_mode": "incremental",
    "base_fee": 51.91,
    "base_weight": 2000,
    "step_weight": 10,
    "step_fee": 2.16
});

fs.writeFileSync('src/data/shippingRules.json', JSON.stringify(data, null, 2));
console.log("Added fallbacks. Total rules:", data.rules.length);

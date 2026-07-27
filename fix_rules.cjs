const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./src/data/shippingRules.json', 'utf8'));

// 1. Fix small-light amount rules
for (let rule of data.rules) {
    if (rule.condition.shipping_classes.includes('small-light')) {
        const val = rule.condition.value;
        if (val === 39 || val === 99) {
            rule.condition.metric = 'amount';
            delete rule.condition.max_weight;
            rule.name = rule.name.replace('weight', 'amount');
            
            // Adjust priority: amount rules should probably be evaluated early, 
            // but > 99 (free shipping) should be evaluated FIRST.
            if (rule.condition.operator === '>' || rule.condition.operator === '>=') {
                rule.priority = 10; // high priority for free shipping
            } else {
                rule.priority = 20 + val;
            }
        }
    }
}

// 2. Add Orthodontics (Free shipping worldwide)
const orthoRule = {
    id: 'worldwide_orthodontics_free',
    enabled: true,
    priority: 5,
    name: 'Worldwide Orthodontics Free Shipping',
    condition: {
        metric: 'quantity',
        operator: '>=',
        value: 1,
        shipping_classes: ['Orthodontics']
    },
    calculation_mode: 'fixed',
    shipping_fee: 0
};
data.rules.push(orthoRule);

// 3. Add heavy-tools and bulky rules
// The user said they fallback. We'll add some default rules for them.
// Let's add weight-based rules for heavy-tools and bulky, worldwide fallback.
const heavyToolsRule = {
    id: 'worldwide_heavy_tools',
    enabled: true,
    priority: 50000,
    name: 'Worldwide heavy-tools',
    condition: {
        metric: 'weight',
        operator: '>=',
        value: 0,
        shipping_classes: ['heavy-tools']
    },
    calculation_mode: 'incremental',
    base_fee: 50,
    base_weight: 1000,
    step_weight: 1000,
    step_fee: 10
};
data.rules.push(heavyToolsRule);

const bulkyRule = {
    id: 'worldwide_bulky',
    enabled: true,
    priority: 50000,
    name: 'Worldwide bulky',
    condition: {
        metric: 'weight',
        operator: '>=',
        value: 0,
        shipping_classes: ['bulky']
    },
    calculation_mode: 'incremental',
    base_fee: 100,
    base_weight: 1000,
    step_weight: 1000,
    step_fee: 20
};
data.rules.push(bulkyRule);

// 4. Fill in missing no-free-ship <300, <500, etc. for all countries
// Just in case, we will add fallback rules for no-free-ship so it doesn't jump to <2000 for countries missing <300.
// Actually, if a country has <2000 but not <300, it's better to add a fallback so they get a reasonable rate.
// But we don't know the rates. 
// We will add generic fallback bands for no-free-ship if they are missing.
const weightBands = [
    { limit: 50, fee: 5 },
    { limit: 100, fee: 8 },
    { limit: 300, fee: 15 },
    { limit: 500, fee: 20 }
];

const existingCountries = new Set();
data.rules.forEach(r => {
    if (r.condition.countries && r.condition.countries.length > 0) {
        existingCountries.add(r.condition.countries[0]);
    }
});

for (let cc of existingCountries) {
    // Check which bands are missing for no-free-ship
    let hasBand = {};
    data.rules.forEach(r => {
        if (r.condition.shipping_classes.includes('no-free-ship') && r.condition.countries && r.condition.countries.includes(cc)) {
            if (r.condition.operator === '<' || r.condition.operator === '<=') {
                hasBand[r.condition.value] = true;
            }
        }
    });
    
    for (let band of weightBands) {
        if (!hasBand[band.limit]) {
            data.rules.push({
                id: `${cc}_no_free_ship_weight_${band.limit}_fallback`,
                enabled: true,
                priority: band.limit * 10,
                name: `${cc} no-free-ship weight <${band.limit} (Fallback)`,
                condition: {
                    metric: 'weight',
                    operator: '<',
                    value: band.limit,
                    countries: [cc],
                    shipping_classes: ['no-free-ship'],
                    max_weight: band.limit
                },
                calculation_mode: 'fixed',
                shipping_fee: band.fee
            });
        }
    }
}

// 5. Fill missing small-light weight bands similarly
const smallLightWeightBands = [
    { limit: 20, fee: 2 },
    { limit: 50, fee: 3 },
    { limit: 100, fee: 5 },
    { limit: 200, fee: 8 },
    { limit: 300, fee: 10 }
];

for (let cc of existingCountries) {
    // some countries have small-light amount rules instead of weight rules (e.g. US)
    // we should only add weight fallbacks if they don't have amount rules?
    // Actually, if they only have amount rules, maybe small-light is entirely amount-based for them.
    // Let's only add weight rules if they already have AT LEAST ONE weight rule for small-light.
    let hasWeightRule = false;
    let hasBand = {};
    data.rules.forEach(r => {
        if (r.condition.shipping_classes.includes('small-light') && r.condition.countries && r.condition.countries.includes(cc)) {
            if (r.condition.metric === 'weight' && (r.condition.operator === '<' || r.condition.operator === '<=')) {
                hasWeightRule = true;
                hasBand[r.condition.value] = true;
            }
        }
    });
    
    if (hasWeightRule) {
        for (let band of smallLightWeightBands) {
            if (!hasBand[band.limit]) {
                data.rules.push({
                    id: `${cc}_small_light_weight_${band.limit}_fallback`,
                    enabled: true,
                    priority: band.limit * 10,
                    name: `${cc} small-light weight <${band.limit} (Fallback)`,
                    condition: {
                        metric: 'weight',
                        operator: '<',
                        value: band.limit,
                        countries: [cc],
                        shipping_classes: ['small-light'],
                        max_weight: band.limit
                    },
                    calculation_mode: 'fixed',
                    shipping_fee: band.fee
                });
            }
        }
    }
}


fs.writeFileSync('./src/data/shippingRules.json', JSON.stringify(data, null, 2));
console.log("Updated shippingRules.json with " + data.rules.length + " rules");

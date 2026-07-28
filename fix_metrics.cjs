const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/shippingRules.json', 'utf8'));

data.rules.forEach(rule => {
    if (rule.condition.shipping_classes.includes('small-light')) {
        const val = rule.condition.value;
        // If value ends in 9, it's an amount
        if (val % 10 === 9) {
            rule.condition.metric = 'amount';
            rule.name = rule.name.replace('weight', 'amount');
            // If operator is >, it might be free shipping.
            // Let's set max_amount if it's <
            if (rule.condition.operator === '<') {
                rule.condition.max_amount = val;
                delete rule.condition.max_weight;
            } else if (rule.condition.operator === '>') {
                rule.condition.min_amount = val;
                delete rule.condition.min_weight;
            }
        } else {
            rule.condition.metric = 'weight';
            rule.name = rule.name.replace('amount', 'weight');
            if (rule.condition.operator === '<') {
                rule.condition.max_weight = val;
                delete rule.condition.max_amount;
            } else if (rule.condition.operator === '>') {
                rule.condition.min_weight = val;
                delete rule.condition.min_amount;
            }
        }
    }
});

fs.writeFileSync('./src/data/shippingRules.json', JSON.stringify(data, null, 2));
console.log("Fixed metrics!");

# WooCommerce Advanced Shipping Rules

This project uses a custom JSON configuration file for dynamic shipping rule evaluation during checkout. It replaces default native WooCommerce shipping methods with rules that take into account cart weight, item quantity, shipping classes, cart total, and destination country.

## Configuration File

The shipping rules are configured in the `src/data/shippingRules.json` file. 

## Structure & Logic
The layout allows you to define multiple rules in a list. When checking out, the app processes all rules where `enabled` is `true`. They are evaluated sequentially based on `priority` (lowest number first).

### Rule Matching
A rule matches if **all conditions defined** in the `condition` object are met:
- `countries`: Delivery country matches.
- `shipping_classes`: Cart contains at least one item mapped to the specified shipping classes.
- `min_amount` / `max_amount`: Delivery subtotal boundaries.
- `min_weight` / `max_weight`: Total cart weight boundaries.
- `min_quantity` / `max_quantity`: Total item quantity boundaries.
- `metric`, `operator`, `value`: Dynamic conditional checks where `metric` can be `weight`, `amount`, or `quantity`. The `operator` can be `<`, `>`, `<=`, `>=`, or `==`. The `value` is the threshold.

If `match_type` is `"first_match"`, the checkout will immediately select the first perfectly matched rule (typically Standard, Free Shipping over X, etc.) and stop evaluating remaining rules.

### Calculation Modes
Once a rule matches, its cost is calculated using one of the following `calculation_mode` types:
- `fixed`: `shipping_fee`
- `weight_first_additional`: `first_price + Math.ceil(Math.max(0, weight - first_weight) / additional_weight) * additional_price`
- `quantity_first_additional`: `first_price + Math.ceil(Math.max(0, quantity - first_quantity) / additional_quantity) * additional_price`
- `per_item`: `quantity * price_per_item`
- `per_kg`: `weight * price_per_kg`
- `base_plus_per_kg`: `base_fee + weight * price_per_kg`
- `base_plus_per_item`: `base_fee + quantity * price_per_item`
- `percentage_of_amount`: `amount * percentage / 100`

### Sample Configuration Format
```json
{
  "version": "2.0",
  "currency": "USD",
  "weight_unit": "kg",
  "match_type": "first_match",
  "rules": [
    {
      "id": "free_shipping_us_over_100",
      "enabled": true,
      "priority": 10,
      "name": "US free shipping over 100",
      "condition": {
        "countries": ["US"],
        "shipping_classes": ["standard"],
        "min_amount": 100
      },
      "calculation_mode": "fixed",
      "shipping_fee": 0
    },
    {
      "id": "us_standard_weight",
      "enabled": true,
      "priority": 20,
      "name": "US standard weight shipping",
      "condition": {
        "countries": ["US"],
        "min_weight": 0,
        "max_weight": 5
      },
      "calculation_mode": "weight_first_additional",
      "first_weight": 0.5,
      "first_price": 6.99,
      "additional_weight": 0.5,
      "additional_price": 2.5
    }
  ]
}
```

## Free Shipping Coupons
The logic also supports overriding these configured prices if the cart has a free shipping coupon applied. Usually, applying a coupon code like `freeship` will yield a $0 cost standard method regardless of matched rules.

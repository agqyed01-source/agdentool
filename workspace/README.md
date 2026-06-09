# WooCommerce Advanced Shipping Rules

This project uses a custom JSON-like configuration for calculating advanced shipping rules based on conditions such as product weight, cart quantity, or total price.

## Configuration File

The shipping rules are configured in `src/data/shippingRates.ts`.

## Structure

The configuration follows a hierarchical structure:
1. **Country**: Rules are grouped by destination country code (e.g., `"US"`, `"GB"`). A special `"DEFAULT"` group acts as a fallback for any unlisted countries.
2. **Shipping Method**: Within a country, you can define multiple shipping methods (e.g., Standard Shipping, Express Shipping). Each method specifies its rules.
3. **Rules**: A list of conditions and calculations for a shipping method. **The first matching rule** within a method will be applied.

### Configuration Types

```typescript
export type ShippingRuleConditionType = 'weight' | 'quantity' | 'price';

export interface ShippingRuleCondition {
  type: ShippingRuleConditionType; // The criteria to check against ('weight', 'quantity', or 'price')
  min?: number;                    // Minimum value (inclusive) to match this rule
  max?: number;                    // Maximum value (inclusive) to match this rule
}

export interface ShippingRuleCalculation {
  basePrice: number; // Base shipping cost
  baseVal: number;   // The threshold from which extra calculation applies (e.g., after 2kg)
  stepVal: number;   // The unit of extra value (e.g., every 1kg or every 0.5kg)
  stepPrice: number; // The additional cost added per stepVal
}
```

## Calculation Formula

When a rule is matched, the shipping cost is calculated using the formula:

`Cost = basePrice + Math.ceil(max(0, Condition_Value - baseVal) / stepVal) * stepPrice`

- **Condition_Value**: The cart's total weight, quantity, or price depending on the rule's `type`.
- If `stepVal` or `stepPrice` are 0, it acts as a flat rate.

## Example Configuration

```typescript
export const shippingRates: ShippingRatesMap = {
  "US": [
    {
      id: "us_local",
      title: "Local Shipping",
      rules: [
        {
          // IF weight is between 0 and 2(kg)
          condition: { type: "weight", min: 0, max: 2 },
          // THEN cost = 10 (flat rate)
          calculation: { basePrice: 10, baseVal: 0, stepVal: 1, stepPrice: 0 } 
        },
        {
          // IF weight is greater than or equal to 2(kg)
          condition: { type: "weight", min: 2 },
          // THEN cost = 10 + (weight - 2) / 1 * 2
          calculation: { basePrice: 10, baseVal: 2, stepVal: 1, stepPrice: 2 } 
        }
      ]
    }
  ],
  "DEFAULT": [
    {
      id: "intl_standard",
      title: "International Standard",
      rules: [
        {
          // IF weight is 0 or more
          condition: { type: "weight", min: 0 },
          // THEN cost = 20 + (weight - 2) / 1 * 5
          calculation: { basePrice: 20, baseVal: 2, stepVal: 1, stepPrice: 5 }
        }
      ]
    }
  ]
};
```

## Free Shipping Coupons
The system currently automatically overrides these rules to provide a `0.00` shipping cost method if the user has applied a free shipping coupon or a coupon that reduces the cart total discount significantly (or has the code 'freeship').

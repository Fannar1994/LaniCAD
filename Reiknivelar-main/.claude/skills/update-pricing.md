# Skill: Update Product Pricing

When asked to update prices or product catalogues in a calculator:

## Steps

1. **Identify the calculator file** and locate the product/item array in the `<script>` section
2. **Find the specific items** by their `id` or `name` properties
3. **Update the `price` values** – prices are in ISK (Icelandic Króna), stored as numbers without formatting
4. **Verify number formatting** – displayed prices use `.toLocaleString('de-DE')` for dot-separated thousands
5. **Test the calculation** – ensure totals update correctly after price changes

## Important

- Prices are stored as plain numbers (e.g., `1500`, not `"1.500"`)
- Display formatting happens at render time, not in the data
- Some calculators have tiered pricing or quantity-based discounts – check for pricing logic before blindly updating values
- If updating many prices, consider whether an Excel import/export workflow would be faster for the user

# Matsu Matcha Demo Data

This folder contains comprehensive demo CSV files for testing the Matsu Matcha dashboard. The data includes realistic patterns and trends to showcase the analytics capabilities.

## Files Overview

### ingredients.csv (50 ingredients)
Contains all inventory items across categories:
- **Matcha Powder**: Ceremonial Grade, Premium Culinary, Everyday Blend
- **Tea Powder**: Houjicha varieties
- **Dairy**: Meiji Fresh Milk, Whipping Cream, Condensed Milk
- **Plant Milk**: Oatly, Almond Breeze, Coconut, Soy
- **Fresh Produce**: Strawberries (fresh and frozen puree)
- **Sweeteners**: Honey, Sugar, Syrups (Vanilla, Caramel, Hazelnut, Brown Sugar)
- **Packaging**: Bio-Cups (Hot/Cold, various sizes), Lids, Straws, Napkins, Bags
- **Equipment**: Chasen, Chawan, Sifter
- **Specialty**: Lavender, Rose Petals, Yuzu, Black Sesame, Kinako, Red Bean, Mochi, Tapioca

### menu_items.csv (12 drinks)
Complete drink menu with pricing:
| Drink | Category | Price |
|-------|----------|-------|
| Signature Matcha Latte | Signature | $8.50 |
| Premium Ceremonial Bowl | Premium | $12.00 |
| Iced Matcha | Regular | $6.50 |
| Oat Matcha Latte | Signature | $9.00 |
| Strawberry Matcha | Seasonal | $9.50 |
| Honey Foam Matcha | Specialty | $10.00 |
| Matcha Affogato | Premium | $11.50 |
| Houjicha Latte | Regular | $7.00 |
| Lavender Matcha | Seasonal | $10.50 |
| Black Sesame Matcha | Specialty | $11.00 |
| Yuzu Matcha Refresher | Seasonal | $9.50 |
| Matcha Espresso Fusion | Specialty | $10.50 |

### recipes.csv (60 recipe lines)
Links each menu item to its ingredients with exact quantities:
- Matcha powder amounts (2-4g depending on drink)
- Milk volumes (150-200ml)
- Add-ons (honey, strawberry puree, ice cream)
- Packaging (cups, lids, straws)

### sales.csv (279 transactions over 31 days)
January 2026 sales data with realistic patterns:

**Weekly Trends:**
- **Weekdays (Mon-Thu)**: Moderate traffic (40-60 orders/day per drink)
- **Fridays**: Increased traffic (+20%)
- **Weekends (Sat-Sun)**: Peak traffic (+50-70%)
- **Mondays**: Lowest traffic (recovery day)

**Notable Patterns:**
- **CNY Period (Jan 29-30)**: Massive spike in sales (Chinese New Year celebration)
- **Week-over-week growth**: Gradual 5-10% increase showing business momentum
- **Payment Methods**: Credit Card (55%), Apple Pay (25%), Cash (15%), Gift Card (5%)
- **Milk Preference**: Meiji Fresh Milk (65%), Oatly (35%)

**Top Sellers (by volume):**
1. Signature Matcha Latte
2. Iced Matcha
3. Oat Matcha Latte
4. Houjicha Latte
5. Strawberry Matcha

**Highest Margin Items:**
1. Premium Ceremonial Bowl (70%+ margin)
2. Matcha Affogato (68% margin)
3. Signature Matcha Latte (81% margin)

## How to Use

1. **Upload ingredients.csv** via Menu & Costs → Ingredients tab
2. **Upload menu_items.csv** via Menu & Costs → Menu Items tab
3. **Upload recipes.csv** via Menu & Costs → Recipes tab
4. **Upload sales.csv** via Sales → Import Sales Data

The dashboard will automatically:
- Calculate COGS for each menu item
- Generate profitability analysis
- Create procurement recommendations
- Show inventory usage trends
- Provide AI-powered strategy suggestions

## Data Characteristics for Testing

| Metric | Value |
|--------|-------|
| Total Ingredients | 50 |
| Menu Items | 12 |
| Recipe Lines | 60 |
| Sales Transactions | 279 |
| Date Range | Jan 1-31, 2026 |
| Total Revenue | ~$75,000 |
| Avg Daily Orders | 250-300 |

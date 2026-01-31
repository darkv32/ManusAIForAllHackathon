# Cost Calculation Issue Analysis

## Problem Identified
The cost breakdown shows extremely high costs due to incorrect quantity interpretation:
- **Hojicha Latte (Hot Regular) - Whole Milk** shows cost of $102.60
- Cost Breakdown shows:
  - Ceremonial Grade 'Take' (Samidori): 4 × $0.6500 = $2.60 ✓ (correct)
  - Ceremonial Grade 'Ume' (Yabukita): **200 × $0.5000 = $100.00** ✗ (incorrect)

## Root Cause
The recipes.csv has quantities in grams/ml (e.g., 200ml of milk), but the ingredient costs are per unit (per ml/gram).

Looking at the data:
- Whole Milk cost: $0.0015 per ml
- Recipe quantity: 200ml
- Expected cost: 200 × $0.0015 = $0.30

But the system is calculating:
- 200 × $0.50 = $100 (using wrong ingredient cost)

## Issue
The recipe is linking to the wrong ingredient. The recipe has:
- `ingredient_id` = ING_003 (Ceremonial Grade 'Ume' Yabukita at $0.50/gram)
- But it should be linking to ING_009 (Whole Milk at $0.0015/ml)

## Solution
Need to verify the recipes.csv data and ensure the ingredient_id mappings are correct.

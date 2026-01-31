## Profitability & Sales Performance Dashboard Enhancement
- [x] Upgrade to full-stack for Gemini API integration
- [x] Extend mock data with menu engineering and cost trend data
- [x] Build Profitability & Sales Performance dashboard with KPIs
- [x] Implement Profit vs Popularity Matrix (Menu Engineering)
- [x] Add ingredient cost trend analysis with 3-month comparison
- [x] Add Margin Sensitivity table (10% price increase impact)
- [x] Create AI Strategy Generator with Gemini API integration
- [x] Add Monthly Profit Goal input and Gap Analysis
- [x] Add Required Order list based on projected sales


## Menu & Profitability Dynamic Data Refactoring
- [x] Analyze CSV files and design database schema
- [x] Create database tables (ingredients, menu_items, recipes, sales)
- [x] Create tRPC endpoints for ingredient CRUD operations
- [x] Create tRPC endpoints for menu items, recipes, and sales
- [x] Build Menu page ingredient management section with CSV upload
- [x] Implement ingredient CRUD UI (Add, Edit, Delete)
- [x] Add dynamic cost breakdown with live ingredient prices
- [x] Fix bar chart X-axis label overlap (horizontal bar chart)
- [x] Remove sales/revenue columns from Menu page
- [x] Refactor Profitability page with reactive data calculations
- [x] Group profitability by Base Drink Name with milk variant breakdown
- [x] Ensure real-time reactivity when ingredient costs change


## Authentication & Security
- [x] Create login page with admin credentials (admin/admin)
- [x] Implement route protection for all dashboard pages
- [x] Add session management with 8-hour expiration
- [x] Add logout functionality in user menu
- [x] Add password hashing recommendations (SECURITY.md)
- [x] Add rate limiting recommendations (SECURITY.md)
- [x] Add audit logging recommendations (SECURITY.md)


## AI Generated Insights Enhancement
- [x] Update Gemini API response schema to include structured recipe data (ingredient, qty, unit)
- [x] Create ProposedItemDrawer component with recipe table and financial summary
- [x] Implement ingredient mapping logic with dynamic costing from inventory
- [x] Add "New Sourcing Required" flag for unknown ingredients
- [x] Calculate Total COGS, Recommended Price, and Projected Margin
- [x] Add margin status indicator (green >70%, yellow 50-70%, red <50%)
- [x] Add "Save to Draft Menu" button to save proposed recipes
- [x] Add "Edit Recipe" button for manual quantity/ingredient adjustments
- [x] Ensure UI matches Matsu Matcha minimalist aesthetic


## Inventory Tab Enhancement - Ingredient Detail View
- [x] Create IngredientDetailDrawer component with comprehensive insights
- [x] Add Key Risk & Status Indicators (days to stockout, avg daily usage, inventory value, cost burn rate)
- [x] Implement Stock Timeline with historical vs projected stock distinction
- [x] Add projected stockout date visualization
- [x] Calculate usage velocity trend (increasing/stable/decreasing week-on-week)
- [x] Show top contributing menu items by percentage of ingredient usage
- [x] Add Reorder Recommendation with explainability (rationale + impact note)
- [x] Implement manual controls for current stock, cost per unit, expiry, and notes
- [x] Add expiry date field to ingredients schema
- [x] Add notes field to ingredients schema
- [x] Ensure all AI outputs remain advisory and editable

## Cross-Tab Consistency - Ingredients as Single Source of Truth
- [x] Ensure ingredients.csv acts as canonical source for ingredient data
- [x] Verify Menu tab references ingredients by ID only
- [x] Verify Profitability tab derives costs from ingredient cost per unit
- [x] Verify Procurement tab aggregates ingredient-level reorder needs
- [x] Ensure editing ingredient cost updates all dependent calculations automatically


## Navigation Reorganization & Profitability Enhancements
- [x] Move Profitability tab under Strategy & Insights section
- [x] Remove Goal text field from Profitability tab
- [x] Sync Monthly Profit Goal between Strategy and Profitability pages
- [x] Add sorting to Profitability by Base Drink table (sort by profit or avg margin)

## Promotions Component
- [x] Create database schema for promotions (active and suggested)
- [x] Build Active Promotions section with status tracking (planned/running/completed)
- [x] Display promotion details (name, affected items, period, status)
- [x] Show expected vs actual impact (sales volume, inventory depletion, profit)
- [x] Build Suggested Promotions section with ranked recommendations
- [x] Include clear rationale for each suggestion (expiry risk, demand trends, margin opportunity)
- [x] Show inventory impact (percentage of at-risk inventory consumed)
- [x] Display projected impact (sales uplift, profit impact, waste reduction)
- [x] Add promotion activation controls (approve/modify/ignore)
- [x] Ensure all promotions are advisory only with full user control
- [x] Add explainability for each suggestion (data inputs, key assumptions)


## Order Command Page Improvements
- [x] Make "Export Order List" button generate actual PDF file
- [x] Fix order quantity calculation: order qty = projected need - current stock
- [x] Use sales trends and ingredient data for accurate projected need calculations
- [x] Ensure all order quantities match the calculated shortage

## AI Suggested Menu Improvements
- [x] Add exact measurements (grams, ml) for each ingredient in AI recipes
- [x] Add "Copy Recipe" button to copy recipe details to clipboard
- [x] Ensure recipe format is clear and actionable for baristas


## Demo CSV Files Creation
- [x] Create ingredients.csv with 50+ ingredients across categories (matcha, milk, packaging, add-ons)
- [x] Create menu_items.csv with 8-10 drinks including pricing
- [x] Create recipes.csv linking drinks to ingredients with quantities
- [x] Create sales.csv with 30+ days of transaction data showing trends
- [x] Include seasonal patterns, weekend peaks, and popular item trends


## Data Sync & Daily Usage Improvements
- [x] Sync Strategy page data with Profitability page calculations
- [x] Ensure both pages use same data source for profit metrics
- [x] Update Order Command daily usage to use past month average from sales data
- [x] Calculate average daily ingredient usage from actual sales transactions


## Promotions AI Recommendation Fix
- [x] Filter out packaging ingredients from AI promotion recommendations
- [x] Only recommend promotions based on food ingredients (matcha, milk, syrups, fresh produce)
- [x] Exclude categories: Packaging, Equipment, Supplies


## Inventory Daily Usage Fix
- [x] Fix daily usage calculation to properly link sales -> menu items -> recipes -> ingredients
- [x] Calculate ingredient consumption from sales transactions using recipe quantities
- [x] Ensure past 30 days of sales data is used for average daily usage
- [x] Use most recent sales date as reference point for historical data compatibility

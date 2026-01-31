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

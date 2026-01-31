import { eq, sql, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  ingredients, InsertIngredient, Ingredient,
  menuItems, InsertMenuItem, MenuItem,
  recipes, InsertRecipe, Recipe,
  sales, InsertSale, Sale,
  promotions, InsertPromotion, Promotion,
  appSettings, InsertAppSetting, AppSetting
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ INGREDIENTS ============

export async function getAllIngredients(): Promise<Ingredient[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(ingredients).orderBy(ingredients.category, ingredients.name);
}

export async function getIngredientById(ingredientId: string): Promise<Ingredient | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(ingredients).where(eq(ingredients.ingredientId, ingredientId)).limit(1);
  return result[0];
}

export async function createIngredient(data: InsertIngredient): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(ingredients).values(data).onDuplicateKeyUpdate({
    set: {
      name: data.name,
      category: data.category,
      unit: data.unit,
      costPerUnit: data.costPerUnit,
      currentStock: data.currentStock,
    }
  });
}

export async function updateIngredient(ingredientId: string, data: Partial<InsertIngredient>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ingredients).set(data).where(eq(ingredients.ingredientId, ingredientId));
}

export async function deleteIngredient(ingredientId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(ingredients).where(eq(ingredients.ingredientId, ingredientId));
}

export async function bulkUpsertIngredients(items: InsertIngredient[]): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let count = 0;
  for (const item of items) {
    await db.insert(ingredients).values(item).onDuplicateKeyUpdate({
      set: {
        name: item.name,
        category: item.category,
        unit: item.unit,
        costPerUnit: item.costPerUnit,
        currentStock: item.currentStock,
      }
    });
    count++;
  }
  return count;
}

// ============ MENU ITEMS ============

export async function getAllMenuItems(): Promise<MenuItem[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(menuItems).orderBy(menuItems.category, menuItems.itemName);
}

export async function getMenuItemById(itemId: string): Promise<MenuItem | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(menuItems).where(eq(menuItems.itemId, itemId)).limit(1);
  return result[0];
}

export async function createMenuItem(data: InsertMenuItem): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(menuItems).values(data).onDuplicateKeyUpdate({
    set: {
      itemName: data.itemName,
      category: data.category,
      salesPrice: data.salesPrice,
      taxRate: data.taxRate,
    }
  });
}

export async function updateMenuItem(itemId: string, data: Partial<InsertMenuItem>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(menuItems).set(data).where(eq(menuItems.itemId, itemId));
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(menuItems).where(eq(menuItems.itemId, itemId));
}

export async function bulkUpsertMenuItems(items: InsertMenuItem[]): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let count = 0;
  for (const item of items) {
    await db.insert(menuItems).values(item).onDuplicateKeyUpdate({
      set: {
        itemName: item.itemName,
        category: item.category,
        salesPrice: item.salesPrice,
        taxRate: item.taxRate,
      }
    });
    count++;
  }
  return count;
}

// ============ RECIPES ============

export async function getAllRecipes(): Promise<Recipe[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(recipes);
}

export async function getRecipesByMenuItemId(menuItemId: string): Promise<Recipe[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(recipes).where(eq(recipes.menuItemId, menuItemId));
}

export async function createRecipe(data: InsertRecipe): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(recipes).values(data).onDuplicateKeyUpdate({
    set: {
      menuItemId: data.menuItemId,
      ingredientId: data.ingredientId,
      quantity: data.quantity,
    }
  });
}

export async function deleteRecipesByMenuItemId(menuItemId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(recipes).where(eq(recipes.menuItemId, menuItemId));
}

export async function bulkUpsertRecipes(items: InsertRecipe[]): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let count = 0;
  for (const item of items) {
    await db.insert(recipes).values(item).onDuplicateKeyUpdate({
      set: {
        menuItemId: item.menuItemId,
        ingredientId: item.ingredientId,
        quantity: item.quantity,
      }
    });
    count++;
  }
  return count;
}

// ============ SALES ============

export async function getAllSales(): Promise<Sale[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(sales).orderBy(sales.timestamp);
}

export async function getSalesSummary(): Promise<{ menuItemId: string; itemName: string; totalQuantity: number; totalRevenue: string }[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    menuItemId: sales.menuItemId,
    itemName: sales.itemName,
    totalQuantity: sql<number>`SUM(${sales.quantity})`,
    totalRevenue: sql<string>`SUM(${sales.totalSales})`,
  }).from(sales).groupBy(sales.menuItemId, sales.itemName);
  
  return result;
}

export async function bulkInsertSales(items: InsertSale[]): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Clear existing sales before bulk insert
  await db.delete(sales);
  
  let count = 0;
  for (const item of items) {
    await db.insert(sales).values(item);
    count++;
  }
  return count;
}

export async function clearAllSales(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(sales);
}

// ============ COMPUTED DATA ============

export type MenuItemWithCost = MenuItem & {
  calculatedCost: number;
  costBreakdown: { ingredientId: string; ingredientName: string; quantity: number; unitCost: number; totalCost: number }[];
  margin: number;
};

export async function getMenuItemsWithCosts(): Promise<MenuItemWithCost[]> {
  const db = await getDb();
  if (!db) return [];
  
  const allMenuItems = await getAllMenuItems();
  const allRecipes = await getAllRecipes();
  const allIngredients = await getAllIngredients();
  
  const ingredientMap = new Map(allIngredients.map(i => [i.ingredientId, i]));
  
  return allMenuItems.map(item => {
    const itemRecipes = allRecipes.filter(r => r.menuItemId === item.itemId);
    const costBreakdown = itemRecipes.map(recipe => {
      const ingredient = ingredientMap.get(recipe.ingredientId);
      const quantity = Number(recipe.quantity);
      const unitCost = ingredient ? Number(ingredient.costPerUnit) : 0;
      return {
        ingredientId: recipe.ingredientId,
        ingredientName: ingredient?.name || 'Unknown',
        quantity,
        unitCost,
        totalCost: quantity * unitCost,
      };
    });
    
    const calculatedCost = costBreakdown.reduce((sum, b) => sum + b.totalCost, 0);
    const salesPrice = Number(item.salesPrice);
    const margin = salesPrice > 0 ? ((salesPrice - calculatedCost) / salesPrice) * 100 : 0;
    
    return {
      ...item,
      calculatedCost,
      costBreakdown,
      margin,
    };
  });
}

export type ProfitabilityData = {
  menuItemId: string;
  itemName: string;
  baseDrink: string;
  milkVariant: string;
  salesPrice: number;
  cogs: number;
  margin: number;
  totalQuantity: number;
  totalRevenue: number;
  totalProfit: number;
};

export async function getProfitabilityData(): Promise<ProfitabilityData[]> {
  const db = await getDb();
  if (!db) return [];
  
  const menuItemsWithCosts = await getMenuItemsWithCosts();
  const salesSummary = await getSalesSummary();
  
  const menuItemMap = new Map(menuItemsWithCosts.map(m => [m.itemId, m]));
  
  return salesSummary.map(sale => {
    const menuItem = menuItemMap.get(sale.menuItemId);
    const salesPrice = menuItem ? Number(menuItem.salesPrice) : Number(sale.totalRevenue) / sale.totalQuantity;
    const cogs = menuItem?.calculatedCost || 0;
    const margin = salesPrice > 0 ? ((salesPrice - cogs) / salesPrice) * 100 : 0;
    const totalRevenue = Number(sale.totalRevenue);
    const totalProfit = totalRevenue - (cogs * sale.totalQuantity);
    
    // Parse item name to extract base drink and milk variant
    const itemName = sale.itemName;
    let baseDrink = itemName;
    let milkVariant = 'Standard';
    
    // Extract milk variant from item name (e.g., "Matcha Latte (Hot, Regular) - Oat Milk (Oatly)")
    const milkMatch = itemName.match(/- (.+)$/);
    if (milkMatch) {
      milkVariant = milkMatch[1].trim();
      baseDrink = itemName.replace(/\s*-\s*.+$/, '').trim();
    }
    
    // Extract base drink name (remove size/temp info)
    const baseMatch = baseDrink.match(/^([^(]+)/);
    if (baseMatch) {
      baseDrink = baseMatch[1].trim();
    }
    
    return {
      menuItemId: sale.menuItemId,
      itemName: sale.itemName,
      baseDrink,
      milkVariant,
      salesPrice,
      cogs,
      margin,
      totalQuantity: sale.totalQuantity,
      totalRevenue,
      totalProfit,
    };
  });
}


// ============ DRAFT MENU ITEMS ============

import { draftMenuItems, DraftMenuItem, InsertDraftMenuItem } from "../drizzle/schema";

export type DraftRecipeItem = {
  ingredientName: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  isNewSourcing: boolean;
};

export async function getAllDraftMenuItems(): Promise<(DraftMenuItem & { parsedRecipe: DraftRecipeItem[] })[]> {
  const db = await getDb();
  if (!db) return [];
  const items = await db.select().from(draftMenuItems).orderBy(draftMenuItems.createdAt);
  return items.map(item => ({
    ...item,
    parsedRecipe: JSON.parse(item.recipe || '[]') as DraftRecipeItem[],
  }));
}

export async function createDraftMenuItem(data: {
  itemName: string;
  category: string;
  recommendedPrice: string;
  totalCogs: string;
  projectedMargin: string;
  strategicJustification: string;
  recipe: DraftRecipeItem[];
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(draftMenuItems).values({
    itemName: data.itemName,
    category: data.category,
    recommendedPrice: data.recommendedPrice,
    totalCogs: data.totalCogs,
    projectedMargin: data.projectedMargin,
    strategicJustification: data.strategicJustification,
    recipe: JSON.stringify(data.recipe),
  });
  
  return Number(result[0].insertId);
}

export async function updateDraftMenuItem(id: number, data: Partial<{
  itemName: string;
  category: string;
  recommendedPrice: string;
  totalCogs: string;
  projectedMargin: string;
  strategicJustification: string;
  recipe: DraftRecipeItem[];
  status: 'draft' | 'active' | 'archived';
}>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Partial<InsertDraftMenuItem> = {};
  if (data.itemName !== undefined) updateData.itemName = data.itemName;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.recommendedPrice !== undefined) updateData.recommendedPrice = data.recommendedPrice;
  if (data.totalCogs !== undefined) updateData.totalCogs = data.totalCogs;
  if (data.projectedMargin !== undefined) updateData.projectedMargin = data.projectedMargin;
  if (data.strategicJustification !== undefined) updateData.strategicJustification = data.strategicJustification;
  if (data.recipe !== undefined) updateData.recipe = JSON.stringify(data.recipe);
  if (data.status !== undefined) updateData.status = data.status;
  
  await db.update(draftMenuItems).set(updateData).where(eq(draftMenuItems.id, id));
}

export async function deleteDraftMenuItem(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(draftMenuItems).where(eq(draftMenuItems.id, id));
}

export async function promoteDraftToActive(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get the draft item
  const draftItems = await db.select().from(draftMenuItems).where(eq(draftMenuItems.id, id)).limit(1);
  if (draftItems.length === 0) throw new Error("Draft item not found");
  
  const draft = draftItems[0];
  
  // Generate a unique item ID
  const itemId = `MENU_${Date.now()}`;
  
  // Create the menu item
  await db.insert(menuItems).values({
    itemId,
    itemName: draft.itemName,
    category: draft.category,
    salesPrice: draft.recommendedPrice,
  });
  
  // Parse recipe and create recipe entries
  const recipeItems = JSON.parse(draft.recipe || '[]') as DraftRecipeItem[];
  const allIngredients = await getAllIngredients();
  const ingredientMap = new Map(allIngredients.map(i => [i.name.toLowerCase(), i]));
  
  for (let i = 0; i < recipeItems.length; i++) {
    const recipeItem = recipeItems[i];
    const ingredient = ingredientMap.get(recipeItem.ingredientName.toLowerCase());
    
    if (ingredient) {
      await db.insert(recipes).values({
        recipeId: `${itemId}_R${i + 1}`,
        menuItemId: itemId,
        ingredientId: ingredient.ingredientId,
        quantity: String(recipeItem.quantity),
      });
    }
  }
  
  // Update draft status to active
  await db.update(draftMenuItems).set({ status: 'active' }).where(eq(draftMenuItems.id, id));
}


// ============ INGREDIENT ANALYTICS ============

export type IngredientUsageByMenuItem = {
  menuItemId: string;
  menuItemName: string;
  quantityPerServing: number;
  totalServings: number;
  totalUsage: number;
  percentageOfTotal: number;
};

export type IngredientAnalyticsData = {
  ingredientId: string;
  ingredient: Ingredient;
  // Key metrics
  averageDailyUsage: number;
  daysToStockout: number;
  inventoryValueRemaining: number;
  costBurnRatePerDay: number;
  // Velocity trend
  velocityTrend: 'increasing' | 'stable' | 'decreasing';
  velocityChangePercent: number;
  // Usage breakdown
  usageByMenuItem: IngredientUsageByMenuItem[];
  // Reorder recommendation
  recommendedReorderQty: number;
  recommendedOrderDate: string;
  reorderRationale: string;
  inactionImpact: string;
  // Historical data (last 14 days)
  dailyUsageHistory: { date: string; usage: number }[];
  stockHistory: { date: string; stock: number }[];
  projectedStock: { date: string; stock: number }[];
  projectedStockoutDate: string | null;
};

export async function getIngredientAnalytics(ingredientId: string): Promise<IngredientAnalyticsData | null> {
  const db = await getDb();
  if (!db) return null;
  
  // Get ingredient
  const ingredient = await getIngredientById(ingredientId);
  if (!ingredient) return null;
  
  // Get all sales data
  const allSales = await getAllSales();
  const allRecipes = await getAllRecipes();
  const allMenuItems = await getAllMenuItems();
  
  // Build recipe map: menuItemId -> recipes
  const recipesByMenuItem = new Map<string, Recipe[]>();
  for (const recipe of allRecipes) {
    const existing = recipesByMenuItem.get(recipe.menuItemId) || [];
    existing.push(recipe);
    recipesByMenuItem.set(recipe.menuItemId, existing);
  }
  
  // Build menu item map
  const menuItemMap = new Map(allMenuItems.map(m => [m.itemId, m]));
  
  // Calculate usage by menu item
  const usageByMenuItemMap = new Map<string, { menuItemName: string; quantityPerServing: number; totalServings: number }>();
  
  for (const sale of allSales) {
    const recipes = recipesByMenuItem.get(sale.menuItemId) || [];
    const ingredientRecipe = recipes.find(r => r.ingredientId === ingredientId);
    
    if (ingredientRecipe) {
      const existing = usageByMenuItemMap.get(sale.menuItemId) || {
        menuItemName: sale.itemName,
        quantityPerServing: Number(ingredientRecipe.quantity),
        totalServings: 0,
      };
      existing.totalServings += sale.quantity;
      usageByMenuItemMap.set(sale.menuItemId, existing);
    }
  }
  
  // Convert to array and calculate percentages
  let totalUsage = 0;
  const usageByMenuItem: IngredientUsageByMenuItem[] = [];
  
  for (const [menuItemId, data] of Array.from(usageByMenuItemMap)) {
    const usage = data.quantityPerServing * data.totalServings;
    totalUsage += usage;
    usageByMenuItem.push({
      menuItemId,
      menuItemName: data.menuItemName,
      quantityPerServing: data.quantityPerServing,
      totalServings: data.totalServings,
      totalUsage: usage,
      percentageOfTotal: 0, // Will calculate after
    });
  }
  
  // Calculate percentages
  for (const item of usageByMenuItem) {
    item.percentageOfTotal = totalUsage > 0 ? (item.totalUsage / totalUsage) * 100 : 0;
  }
  
  // Sort by usage descending
  usageByMenuItem.sort((a, b) => b.totalUsage - a.totalUsage);
  
  // Calculate daily usage from sales data
  const salesByDate = new Map<string, number>();
  for (const sale of allSales) {
    const date = new Date(sale.timestamp).toISOString().split('T')[0];
    const recipes = recipesByMenuItem.get(sale.menuItemId) || [];
    const ingredientRecipe = recipes.find(r => r.ingredientId === ingredientId);
    
    if (ingredientRecipe) {
      const usage = Number(ingredientRecipe.quantity) * sale.quantity;
      salesByDate.set(date, (salesByDate.get(date) || 0) + usage);
    }
  }
  
  // Get last 30 days of usage for monthly average
  const today = new Date();
  const dailyUsageHistory: { date: string; usage: number }[] = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyUsageHistory.push({
      date: dateStr,
      usage: salesByDate.get(dateStr) || 0,
    });
  }
  
  // Calculate average daily usage (past 30 days for more accurate projections)
  const daysWithData = dailyUsageHistory.filter(d => d.usage > 0).length;
  const totalMonthUsage = dailyUsageHistory.reduce((sum, d) => sum + d.usage, 0);
  // Use actual days with data if less than 30, minimum 1 to avoid division by zero
  const effectiveDays = Math.max(daysWithData, 1);
  const averageDailyUsage = totalMonthUsage / effectiveDays;
  
  // Calculate velocity trend (compare last 15 days vs previous 15 days)
  const last15Days = dailyUsageHistory.slice(-15);
  const last15DaysUsage = last15Days.reduce((sum, d) => sum + d.usage, 0);
  const last15DaysAvg = last15DaysUsage / 15;
  
  const prev15Days = dailyUsageHistory.slice(0, 15);
  const prev15DaysUsage = prev15Days.reduce((sum, d) => sum + d.usage, 0);
  const prev15DaysAvg = prev15DaysUsage / 15;
  
  let velocityTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  let velocityChangePercent = 0;
  
  if (prev15DaysAvg > 0) {
    velocityChangePercent = ((last15DaysAvg - prev15DaysAvg) / prev15DaysAvg) * 100;
    if (velocityChangePercent > 10) {
      velocityTrend = 'increasing';
    } else if (velocityChangePercent < -10) {
      velocityTrend = 'decreasing';
    }
  }
  
  // Calculate days to stockout
  const currentStock = Number(ingredient.currentStock);
  const daysToStockout = averageDailyUsage > 0 ? Math.floor(currentStock / averageDailyUsage) : 999;
  
  // Calculate inventory value remaining
  const costPerUnit = Number(ingredient.costPerUnit);
  const inventoryValueRemaining = currentStock * costPerUnit;
  
  // Calculate cost burn rate per day
  const costBurnRatePerDay = averageDailyUsage * costPerUnit;
  
  // Generate stock history (simulated based on usage)
  const stockHistory: { date: string; stock: number }[] = [];
  let simulatedStock = currentStock + last15DaysUsage; // Estimate starting stock
  
  for (const day of last15Days) {
    simulatedStock -= day.usage;
    stockHistory.push({
      date: day.date,
      stock: Math.max(0, simulatedStock),
    });
  }
  
  // Generate projected stock (next 7 days)
  const projectedStock: { date: string; stock: number }[] = [];
  let projectedStockValue = currentStock;
  let projectedStockoutDate: string | null = null;
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    projectedStockValue -= averageDailyUsage;
    
    if (projectedStockValue <= 0 && !projectedStockoutDate) {
      projectedStockoutDate = dateStr;
    }
    
    projectedStock.push({
      date: dateStr,
      stock: Math.max(0, projectedStockValue),
    });
  }
  
  // Calculate reorder recommendation
  const leadTimeDays = ingredient.leadTimeDays || 3;
  const safetyStockDays = 2;
  const targetCoverageDays = 14;
  
  // Recommended reorder quantity to cover target days
  const recommendedReorderQty = Math.ceil(averageDailyUsage * targetCoverageDays);
  
  // Recommended order date (lead time before stockout)
  const orderByDays = Math.max(0, daysToStockout - leadTimeDays - safetyStockDays);
  const orderByDate = new Date(today);
  orderByDate.setDate(orderByDate.getDate() + orderByDays);
  const recommendedOrderDate = orderByDate.toISOString().split('T')[0];
  
  // Generate rationale
  const reorderRationale = `Based on average daily usage of ${averageDailyUsage.toFixed(1)} ${ingredient.unit} and a ${leadTimeDays}-day supplier lead time, ordering ${recommendedReorderQty} ${ingredient.unit} will provide ${targetCoverageDays} days of coverage.`;
  
  // Generate inaction impact
  let inactionImpact = '';
  if (daysToStockout <= leadTimeDays) {
    inactionImpact = `Critical: Stock will run out before new order arrives. Immediate action required.`;
  } else if (daysToStockout <= leadTimeDays + safetyStockDays) {
    inactionImpact = `High risk: Expected stockout during peak hours if not reordered within ${orderByDays} days.`;
  } else if (daysToStockout <= 7) {
    inactionImpact = `Moderate risk: Stock running low. Order soon to maintain buffer.`;
  } else {
    inactionImpact = `Low risk: Adequate stock levels. Monitor usage trends.`;
  }
  
  return {
    ingredientId,
    ingredient,
    averageDailyUsage,
    daysToStockout,
    inventoryValueRemaining,
    costBurnRatePerDay,
    velocityTrend,
    velocityChangePercent,
    usageByMenuItem: usageByMenuItem.slice(0, 5), // Top 5
    recommendedReorderQty,
    recommendedOrderDate,
    reorderRationale,
    inactionImpact,
    dailyUsageHistory,
    stockHistory,
    projectedStock,
    projectedStockoutDate,
  };
}

export async function getAllIngredientAnalytics(): Promise<IngredientAnalyticsData[]> {
  const allIngredients = await getAllIngredients();
  const analytics: IngredientAnalyticsData[] = [];
  
  for (const ingredient of allIngredients) {
    const data = await getIngredientAnalytics(ingredient.ingredientId);
    if (data) {
      analytics.push(data);
    }
  }
  
  return analytics;
}


// ============ PROMOTIONS ============

export async function getAllPromotions(): Promise<Promotion[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(promotions).orderBy(promotions.startDate);
}

export async function getActivePromotions(): Promise<Promotion[]> {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return await db.select().from(promotions)
    .where(and(
      eq(promotions.status, 'running'),
      lte(promotions.startDate, now),
      gte(promotions.endDate, now)
    ))
    .orderBy(promotions.startDate);
}

export async function getPlannedPromotions(): Promise<Promotion[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(promotions)
    .where(eq(promotions.status, 'planned'))
    .orderBy(promotions.startDate);
}

export async function getCompletedPromotions(): Promise<Promotion[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(promotions)
    .where(eq(promotions.status, 'completed'))
    .orderBy(promotions.endDate);
}

export async function getPromotionById(promotionId: string): Promise<Promotion | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(promotions).where(eq(promotions.promotionId, promotionId)).limit(1);
  return result[0];
}

export async function createPromotion(data: InsertPromotion): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(promotions).values(data);
}

export async function updatePromotion(promotionId: string, data: Partial<InsertPromotion>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(promotions).set(data).where(eq(promotions.promotionId, promotionId));
}

export async function deletePromotion(promotionId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(promotions).where(eq(promotions.promotionId, promotionId));
}

// ============ APP SETTINGS ============

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(appSettings).where(eq(appSettings.settingKey, key)).limit(1);
  return result[0]?.settingValue ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(appSettings).values({ settingKey: key, settingValue: value })
    .onDuplicateKeyUpdate({ set: { settingValue: value } });
}

export async function getMonthlyProfitGoal(): Promise<number> {
  const value = await getSetting('monthlyProfitGoal');
  return value ? parseFloat(value) : 15000;
}

export async function setMonthlyProfitGoal(goal: number): Promise<void> {
  await setSetting('monthlyProfitGoal', goal.toString());
}

// ============ SUGGESTED PROMOTIONS (AI-GENERATED) ============

export interface SuggestedPromotion {
  id: string;
  title: string;
  promotionType: 'featured' | 'limited_time' | 'bundle' | 'discount' | 'seasonal';
  affectedMenuItems: string[];
  rationale: string;
  inventoryImpact: {
    ingredientsAffected: string[];
    percentageConsumed: number;
    wasteReduction: number;
  };
  projectedImpact: {
    salesUplift: number;
    profitImpact: number;
    wasteReduction: number;
  };
  dataInputs: string[];
  assumptions: string[];
  priority: 'high' | 'medium' | 'low';
}

export async function generateSuggestedPromotions(): Promise<SuggestedPromotion[]> {
  // Get all necessary data
  const allIngredients = await getAllIngredients();
  const allMenuItems = await getAllMenuItems();
  const allRecipes = await getAllRecipes();
  const allSales = await getAllSales();
  
  const suggestions: SuggestedPromotion[] = [];
  
  // 1. Find ingredients with expiry risk (within 7 days)
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expiringIngredients = allIngredients.filter(i => 
    i.expiryDate && new Date(i.expiryDate) <= sevenDaysFromNow
  );
  
  // 2. Find ingredients with overstock (high stock relative to usage)
  const ingredientUsage = new Map<string, number>();
  const ingredientMap = new Map(allIngredients.map(i => [i.ingredientId, i]));
  
  // Calculate usage from sales
  for (const sale of allSales) {
    const itemRecipes = allRecipes.filter(r => r.menuItemId === sale.menuItemId);
    for (const recipe of itemRecipes) {
      const current = ingredientUsage.get(recipe.ingredientId) || 0;
      ingredientUsage.set(recipe.ingredientId, current + (parseFloat(String(recipe.quantity)) * sale.quantity));
    }
  }
  
  // Calculate average daily usage
  const salesDays = allSales.length > 0 
    ? Math.max(1, Math.ceil((new Date(allSales[allSales.length - 1].timestamp).getTime() - new Date(allSales[0].timestamp).getTime()) / (24 * 60 * 60 * 1000)))
    : 30;
  
  const overstockedIngredients = allIngredients.filter(i => {
    const totalUsage = ingredientUsage.get(i.ingredientId) || 0;
    const dailyUsage = totalUsage / salesDays;
    const currentStock = parseFloat(String(i.currentStock || 0));
    const daysOfStock = dailyUsage > 0 ? currentStock / dailyUsage : 999;
    return daysOfStock > 60; // More than 60 days of stock
  });
  
  // 3. Find drinks with strong sales trends
  const drinkSales = new Map<string, { total: number; recent: number }>();
  const halfwayPoint = Math.floor(allSales.length / 2);
  
  allSales.forEach((sale, index) => {
    const current = drinkSales.get(sale.menuItemId) || { total: 0, recent: 0 };
    current.total += sale.quantity;
    if (index >= halfwayPoint) {
      current.recent += sale.quantity;
    }
    drinkSales.set(sale.menuItemId, current);
  });
  
  const trendingDrinks = Array.from(drinkSales.entries())
    .map(([itemId, data]) => ({
      itemId,
      total: data.total,
      recent: data.recent,
      trend: data.total > 0 ? ((data.recent * 2) - data.total) / data.total : 0
    }))
    .filter(d => d.trend > 0.1)
    .sort((a, b) => b.trend - a.trend);
  
  // Generate suggestions based on expiring ingredients
  for (const ingredient of expiringIngredients.slice(0, 2)) {
    const affectedRecipes = allRecipes.filter(r => r.ingredientId === ingredient.ingredientId);
    const affectedItems = affectedRecipes.map(r => r.menuItemId);
    const affectedMenuItemNames = allMenuItems
      .filter(m => affectedItems.includes(m.itemId))
      .map(m => m.itemName);
    
    if (affectedMenuItemNames.length > 0) {
      const daysUntilExpiry = ingredient.expiryDate 
        ? Math.ceil((new Date(ingredient.expiryDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        : 7;
      
      suggestions.push({
        id: `expiry-${ingredient.ingredientId}`,
        title: `Flash Sale: ${affectedMenuItemNames[0]} Special`,
        promotionType: 'limited_time',
        affectedMenuItems: affectedItems,
        rationale: `${ingredient.name} expires in ${daysUntilExpiry} days. Promoting drinks that use this ingredient will reduce waste and recover ingredient costs.`,
        inventoryImpact: {
          ingredientsAffected: [ingredient.ingredientId],
          percentageConsumed: 80,
          wasteReduction: parseFloat(String(ingredient.currentStock || 0)) * parseFloat(String(ingredient.costPerUnit)),
        },
        projectedImpact: {
          salesUplift: 25,
          profitImpact: parseFloat(String(ingredient.currentStock || 0)) * parseFloat(String(ingredient.costPerUnit)) * 0.6,
          wasteReduction: parseFloat(String(ingredient.currentStock || 0)) * parseFloat(String(ingredient.costPerUnit)) * 0.8,
        },
        dataInputs: ['Ingredient expiry dates', 'Current stock levels', 'Recipe mappings'],
        assumptions: ['20% discount will drive 25% sales increase', 'Promotion runs for 3 days'],
        priority: 'high',
      });
    }
  }
  
  // Generate suggestions based on overstocked ingredients
  for (const ingredient of overstockedIngredients.slice(0, 2)) {
    const affectedRecipes = allRecipes.filter(r => r.ingredientId === ingredient.ingredientId);
    const affectedItems = affectedRecipes.map(r => r.menuItemId);
    const affectedMenuItemNames = allMenuItems
      .filter(m => affectedItems.includes(m.itemId))
      .map(m => m.itemName);
    
    if (affectedMenuItemNames.length > 0) {
      suggestions.push({
        id: `overstock-${ingredient.ingredientId}`,
        title: `Featured: ${affectedMenuItemNames[0]}`,
        promotionType: 'featured',
        affectedMenuItems: affectedItems,
        rationale: `${ingredient.name} has excess stock (${parseFloat(String(ingredient.currentStock || 0)).toFixed(0)} ${ingredient.unit}). Featuring drinks that use this ingredient will improve inventory turnover.`,
        inventoryImpact: {
          ingredientsAffected: [ingredient.ingredientId],
          percentageConsumed: 30,
          wasteReduction: 0,
        },
        projectedImpact: {
          salesUplift: 15,
          profitImpact: parseFloat(String(ingredient.currentStock || 0)) * parseFloat(String(ingredient.costPerUnit)) * 0.3,
          wasteReduction: 0,
        },
        dataInputs: ['Current stock levels', 'Historical usage rates', 'Recipe mappings'],
        assumptions: ['Featured placement drives 15% sales increase', 'No discount required'],
        priority: 'medium',
      });
    }
  }
  
  // Generate suggestions based on trending drinks
  for (const trending of trendingDrinks.slice(0, 2)) {
    const menuItem = allMenuItems.find(m => m.itemId === trending.itemId);
    if (menuItem) {
      suggestions.push({
        id: `trending-${trending.itemId}`,
        title: `Capitalize on Trend: ${menuItem.itemName}`,
        promotionType: 'featured',
        affectedMenuItems: [trending.itemId],
        rationale: `${menuItem.itemName} shows ${(trending.trend * 100).toFixed(0)}% sales acceleration. Amplifying this trend with prominent placement can maximize revenue.`,
        inventoryImpact: {
          ingredientsAffected: [],
          percentageConsumed: 0,
          wasteReduction: 0,
        },
        projectedImpact: {
          salesUplift: 20,
          profitImpact: trending.total * parseFloat(String(menuItem.salesPrice)) * 0.2 * 0.6,
          wasteReduction: 0,
        },
        dataInputs: ['Sales transaction history', 'Trend analysis'],
        assumptions: ['Trend continues for 2 weeks', 'Featured placement adds 20% to existing growth'],
        priority: 'medium',
      });
    }
  }
  
  return suggestions;
}


// ============ PROCUREMENT ORDER LIST ============

export type ProcurementOrderItem = {
  ingredientId: string;
  ingredientName: string;
  category: string;
  unit: string;
  currentStock: number;
  projectedNeed: number;
  orderQuantity: number;
  priority: 'urgent' | 'normal' | 'low';
  orderBy: string;
  supplier: string;
  costPerUnit: number;
  totalCost: number;
  daysToStockout: number;
  averageDailyUsage: number;
};

export async function getProcurementOrderList(): Promise<ProcurementOrderItem[]> {
  const allAnalytics = await getAllIngredientAnalytics();
  const orderList: ProcurementOrderItem[] = [];
  
  for (const analytics of allAnalytics) {
    const ingredient = analytics.ingredient;
    const currentStock = Number(ingredient.currentStock);
    const averageDailyUsage = analytics.averageDailyUsage;
    
    // Calculate projected need for 14 days
    const targetCoverageDays = 14;
    const projectedNeed = averageDailyUsage * targetCoverageDays;
    
    // Order quantity = projected need - current stock (minimum 0)
    const orderQuantity = Math.max(0, Math.ceil(projectedNeed - currentStock));
    
    // Skip items that don't need ordering
    if (orderQuantity <= 0 && analytics.daysToStockout > 14) {
      continue;
    }
    
    // Determine priority based on days to stockout
    let priority: 'urgent' | 'normal' | 'low' = 'low';
    const leadTimeDays = ingredient.leadTimeDays || 3;
    
    if (analytics.daysToStockout <= leadTimeDays) {
      priority = 'urgent';
    } else if (analytics.daysToStockout <= leadTimeDays + 4) {
      priority = 'normal';
    }
    
    // Calculate order by date
    const today = new Date();
    const orderByDays = Math.max(0, analytics.daysToStockout - leadTimeDays - 2);
    const orderByDate = new Date(today);
    orderByDate.setDate(orderByDate.getDate() + orderByDays);
    
    const costPerUnit = Number(ingredient.costPerUnit);
    
    orderList.push({
      ingredientId: ingredient.ingredientId,
      ingredientName: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      currentStock,
      projectedNeed: Math.ceil(projectedNeed),
      orderQuantity,
      priority,
      orderBy: orderByDate.toISOString().split('T')[0],
      supplier: ingredient.supplier || 'Unknown',
      costPerUnit,
      totalCost: orderQuantity * costPerUnit,
      daysToStockout: analytics.daysToStockout,
      averageDailyUsage,
    });
  }
  
  // Sort by priority (urgent first) then by days to stockout
  orderList.sort((a, b) => {
    const priorityOrder = { urgent: 0, normal: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.daysToStockout - b.daysToStockout;
  });
  
  return orderList;
}


// ============ BUSINESS METRICS (for Strategy page sync) ============

export interface BusinessMetrics {
  monthlyProfitGoal: number;
  currentMonthProfit: number;
  lastMonthProfit: number;
  profitGrowth: number;
  avgDailyRevenue: number;
  avgDailyOrders: number;
  topSellingItem: string;
  highestMarginItem: string;
  inventoryValue: number;
  wastageThisMonth: number;
}

export async function getBusinessMetrics(): Promise<BusinessMetrics> {
  const db = await getDb();
  
  // Get monthly profit goal from settings
  const monthlyProfitGoal = await getMonthlyProfitGoal();
  
  // Get all sales data
  const allSales = db ? await db.select().from(sales) : [];
  const allIngredients = await getAllIngredients();
  const allMenuItems = await getAllMenuItems();
  const allRecipes = await getAllRecipes();
  
  // Calculate date ranges
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  // Build recipe cost map
  const recipeCostMap = new Map<string, number>();
  for (const recipe of allRecipes) {
    const ingredient = allIngredients.find(i => i.ingredientId === recipe.ingredientId);
    if (ingredient) {
      const costPerUnit = Number(ingredient.costPerUnit);
      const quantity = Number(recipe.quantity);
      const existingCost = recipeCostMap.get(recipe.menuItemId) || 0;
      recipeCostMap.set(recipe.menuItemId, existingCost + (costPerUnit * quantity));
    }
  }
  
  // Filter sales by month
  const currentMonthSales = allSales.filter(s => new Date(s.timestamp) >= currentMonthStart);
  const lastMonthSales = allSales.filter(s => {
    const date = new Date(s.timestamp);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });
  
  // Calculate current month metrics
  let currentMonthRevenue = 0;
  let currentMonthCost = 0;
  let currentMonthOrders = 0;
  const itemSalesCount = new Map<string, { name: string; count: number; profit: number; margin: number }>();
  
  for (const sale of currentMonthSales) {
    const revenue = Number(sale.totalSales);
    const cogs = recipeCostMap.get(sale.menuItemId) || 0;
    const profit = revenue - (cogs * sale.quantity);
    
    currentMonthRevenue += revenue;
    currentMonthCost += cogs * sale.quantity;
    currentMonthOrders += sale.quantity;
    
    const existing = itemSalesCount.get(sale.menuItemId) || { name: sale.itemName, count: 0, profit: 0, margin: 0 };
    existing.count += sale.quantity;
    existing.profit += profit;
    itemSalesCount.set(sale.menuItemId, existing);
  }
  
  // Calculate margins for each item
  for (const [itemId, data] of Array.from(itemSalesCount)) {
    const menuItem = allMenuItems.find(m => m.itemId === itemId);
    if (menuItem) {
      const cogs = recipeCostMap.get(itemId) || 0;
      const price = Number(menuItem.salesPrice);
      data.margin = price > 0 ? ((price - cogs) / price) * 100 : 0;
    }
  }
  
  const currentMonthProfit = currentMonthRevenue - currentMonthCost;
  
  // Calculate last month profit
  let lastMonthRevenue = 0;
  let lastMonthCost = 0;
  
  for (const sale of lastMonthSales) {
    const revenue = Number(sale.totalSales);
    const cogs = recipeCostMap.get(sale.menuItemId) || 0;
    lastMonthRevenue += revenue;
    lastMonthCost += cogs * sale.quantity;
  }
  
  const lastMonthProfit = lastMonthRevenue - lastMonthCost;
  
  // Calculate profit growth
  const profitGrowth = lastMonthProfit > 0 
    ? ((currentMonthProfit - lastMonthProfit) / lastMonthProfit) * 100 
    : 0;
  
  // Calculate average daily metrics
  const daysInCurrentMonth = Math.max(1, Math.ceil((now.getTime() - currentMonthStart.getTime()) / (24 * 60 * 60 * 1000)));
  const avgDailyRevenue = currentMonthRevenue / daysInCurrentMonth;
  const avgDailyOrders = currentMonthOrders / daysInCurrentMonth;
  
  // Find top selling item
  const sortedByCount = Array.from(itemSalesCount.entries()).sort((a, b) => b[1].count - a[1].count);
  const topSellingItem = sortedByCount[0]?.[1]?.name || 'No data';
  
  // Find highest margin item
  const sortedByMargin = Array.from(itemSalesCount.entries()).sort((a, b) => b[1].margin - a[1].margin);
  const highestMarginItem = sortedByMargin[0]?.[1]?.name || 'No data';
  
  // Calculate inventory value
  const inventoryValue = allIngredients.reduce((sum, i) => {
    return sum + (Number(i.currentStock) * Number(i.costPerUnit));
  }, 0);
  
  // Estimate wastage (items near expiry with low usage)
  let wastageThisMonth = 0;
  for (const ingredient of allIngredients) {
    if (ingredient.expiryDate) {
      const expiryDate = new Date(ingredient.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        // Estimate 20% of near-expiry stock as potential waste
        wastageThisMonth += Number(ingredient.currentStock) * Number(ingredient.costPerUnit) * 0.2;
      }
    }
  }
  
  return {
    monthlyProfitGoal,
    currentMonthProfit: Math.round(currentMonthProfit * 100) / 100,
    lastMonthProfit: Math.round(lastMonthProfit * 100) / 100,
    profitGrowth: Math.round(profitGrowth * 10) / 10,
    avgDailyRevenue: Math.round(avgDailyRevenue * 100) / 100,
    avgDailyOrders: Math.round(avgDailyOrders),
    topSellingItem,
    highestMarginItem,
    inventoryValue: Math.round(inventoryValue * 100) / 100,
    wastageThisMonth: Math.round(wastageThisMonth * 100) / 100,
  };
}

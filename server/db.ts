import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  ingredients, InsertIngredient, Ingredient,
  menuItems, InsertMenuItem, MenuItem,
  recipes, InsertRecipe, Recipe,
  sales, InsertSale, Sale
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
  
  // Get last 14 days of usage
  const today = new Date();
  const dailyUsageHistory: { date: string; usage: number }[] = [];
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyUsageHistory.push({
      date: dateStr,
      usage: salesByDate.get(dateStr) || 0,
    });
  }
  
  // Calculate average daily usage (last 7 days)
  const last7Days = dailyUsageHistory.slice(-7);
  const last7DaysUsage = last7Days.reduce((sum, d) => sum + d.usage, 0);
  const averageDailyUsage = last7DaysUsage / 7;
  
  // Calculate velocity trend (compare last 7 days vs previous 7 days)
  const prev7Days = dailyUsageHistory.slice(0, 7);
  const prev7DaysUsage = prev7Days.reduce((sum, d) => sum + d.usage, 0);
  const prev7DaysAvg = prev7DaysUsage / 7;
  
  let velocityTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  let velocityChangePercent = 0;
  
  if (prev7DaysAvg > 0) {
    velocityChangePercent = ((averageDailyUsage - prev7DaysAvg) / prev7DaysAvg) * 100;
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
  let simulatedStock = currentStock + last7DaysUsage; // Estimate starting stock
  
  for (const day of last7Days) {
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

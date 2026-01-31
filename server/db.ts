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

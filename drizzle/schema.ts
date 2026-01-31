import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Ingredients table - stores all raw materials with costs
 */
export const ingredients = mysqlTable("ingredients", {
  id: int("id").autoincrement().primaryKey(),
  ingredientId: varchar("ingredientId", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  unit: varchar("unit", { length: 32 }).notNull(),
  costPerUnit: decimal("costPerUnit", { precision: 10, scale: 6 }).notNull(),
  currentStock: decimal("currentStock", { precision: 12, scale: 2 }).default("0"),
  minStock: decimal("minStock", { precision: 12, scale: 2 }).default("0"),
  reorderPoint: decimal("reorderPoint", { precision: 12, scale: 2 }).default("0"),
  leadTimeDays: int("leadTimeDays").default(3),
  expiryDate: timestamp("expiryDate"),
  notes: text("notes"),
  supplier: varchar("supplier", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = typeof ingredients.$inferInsert;

/**
 * Menu items table - stores all drinks/products with prices
 */
export const menuItems = mysqlTable("menuItems", {
  id: int("id").autoincrement().primaryKey(),
  itemId: varchar("itemId", { length: 32 }).notNull().unique(),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  salesPrice: decimal("salesPrice", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("taxRate", { precision: 5, scale: 4 }).default("0.08"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

/**
 * Recipes table - links menu items to ingredients with quantities
 */
export const recipes = mysqlTable("recipes", {
  id: int("id").autoincrement().primaryKey(),
  recipeId: varchar("recipeId", { length: 32 }).notNull().unique(),
  menuItemId: varchar("menuItemId", { length: 32 }).notNull(),
  ingredientId: varchar("ingredientId", { length: 32 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 4 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;

/**
 * Sales transactions table - stores all sales data
 */
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: varchar("transactionId", { length: 32 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  menuItemId: varchar("menuItemId", { length: 32 }).notNull(),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalSales: decimal("totalSales", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 64 }).notNull(),
  paymentDetail: varchar("paymentDetail", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;


/**
 * Draft menu items table - stores AI-proposed menu items before activation
 */
export const draftMenuItems = mysqlTable("draftMenuItems", {
  id: int("id").autoincrement().primaryKey(),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).notNull(),
  recommendedPrice: decimal("recommendedPrice", { precision: 10, scale: 2 }).notNull(),
  totalCogs: decimal("totalCogs", { precision: 10, scale: 4 }).notNull(),
  projectedMargin: decimal("projectedMargin", { precision: 5, scale: 2 }).notNull(),
  strategicJustification: text("strategicJustification"),
  recipe: text("recipe").notNull(), // JSON string of recipe array
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DraftMenuItem = typeof draftMenuItems.$inferSelect;
export type InsertDraftMenuItem = typeof draftMenuItems.$inferInsert;


/**
 * Promotions table - stores active and planned promotions
 */
export const promotions = mysqlTable("promotions", {
  id: int("id").autoincrement().primaryKey(),
  promotionId: varchar("promotionId", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  promotionType: mysqlEnum("promotionType", ["featured", "limited_time", "bundle", "discount", "seasonal"]).notNull(),
  affectedMenuItems: text("affectedMenuItems").notNull(), // JSON array of menu item IDs
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  status: mysqlEnum("status", ["planned", "running", "completed", "cancelled"]).default("planned").notNull(),
  // Expected impact
  expectedSalesVolume: int("expectedSalesVolume"),
  expectedInventoryDepletion: decimal("expectedInventoryDepletion", { precision: 5, scale: 2 }), // percentage
  expectedProfitContribution: decimal("expectedProfitContribution", { precision: 10, scale: 2 }),
  // Actual impact (filled after completion)
  actualSalesVolume: int("actualSalesVolume"),
  actualInventoryDepletion: decimal("actualInventoryDepletion", { precision: 5, scale: 2 }),
  actualProfitContribution: decimal("actualProfitContribution", { precision: 10, scale: 2 }),
  // Metadata
  rationale: text("rationale"),
  dataInputs: text("dataInputs"), // JSON describing data sources used
  assumptions: text("assumptions"), // JSON describing key assumptions
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;

/**
 * App settings table - stores application-wide settings like monthly profit goal
 */
export const appSettings = mysqlTable("appSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 64 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = typeof appSettings.$inferInsert;

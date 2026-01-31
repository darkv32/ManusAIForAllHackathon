// Mock data for Matsu Matcha Dashboard
// Design: Japanese Wabi-Sabi Minimalism - data structured to support serene, asymmetric layouts

export interface InventoryItem {
  id: string;
  name: string;
  category: 'powder' | 'milk' | 'fruit' | 'equipment' | 'other';
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  shelfLife: 'long' | 'short';
  expiryDate?: string;
  costPerUnit: number;
  supplier: string;
  lastRestocked: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'signature' | 'premium' | 'regular' | 'seasonal';
  price: number;
  cost: number;
  margin: number;
  weeklyVolume: number;
  monthlyVolume: number;
  ingredients: { itemId: string; quantity: number }[];
  trending: 'up' | 'down' | 'stable';
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export interface ProcurementItem {
  itemId: string;
  itemName: string;
  currentStock: number;
  projectedNeed: number;
  orderQuantity: number;
  priority: 'urgent' | 'normal' | 'low';
  orderBy: string;
}

// Inventory Items
export const inventoryItems: InventoryItem[] = [
  {
    id: 'matcha-ceremonial',
    name: 'Ceremonial Grade Matcha',
    category: 'powder',
    currentStock: 2.5,
    unit: 'kg',
    minStock: 1,
    maxStock: 5,
    shelfLife: 'long',
    costPerUnit: 180,
    supplier: 'Uji Tea Farm',
    lastRestocked: '2026-01-25'
  },
  {
    id: 'matcha-culinary',
    name: 'Culinary Grade Matcha',
    category: 'powder',
    currentStock: 4.2,
    unit: 'kg',
    minStock: 2,
    maxStock: 8,
    shelfLife: 'long',
    costPerUnit: 85,
    supplier: 'Uji Tea Farm',
    lastRestocked: '2026-01-20'
  },
  {
    id: 'houjicha',
    name: 'Houjicha Powder',
    category: 'powder',
    currentStock: 1.8,
    unit: 'kg',
    minStock: 1,
    maxStock: 4,
    shelfLife: 'long',
    costPerUnit: 65,
    supplier: 'Kyoto Roasters',
    lastRestocked: '2026-01-22'
  },
  {
    id: 'meiji-milk',
    name: 'Meiji Fresh Milk',
    category: 'milk',
    currentStock: 15,
    unit: 'L',
    minStock: 10,
    maxStock: 30,
    shelfLife: 'short',
    expiryDate: '2026-02-05',
    costPerUnit: 3.5,
    supplier: 'Meiji Singapore',
    lastRestocked: '2026-01-30'
  },
  {
    id: 'oatly',
    name: 'Oatly Barista Edition',
    category: 'milk',
    currentStock: 12,
    unit: 'L',
    minStock: 8,
    maxStock: 24,
    shelfLife: 'short',
    expiryDate: '2026-02-20',
    costPerUnit: 5.2,
    supplier: 'Oatly Distributor',
    lastRestocked: '2026-01-28'
  },
  {
    id: 'strawberries',
    name: 'Fresh Strawberries',
    category: 'fruit',
    currentStock: 3,
    unit: 'kg',
    minStock: 2,
    maxStock: 6,
    shelfLife: 'short',
    expiryDate: '2026-02-03',
    costPerUnit: 18,
    supplier: 'Fresh Produce Co',
    lastRestocked: '2026-01-29'
  },
  {
    id: 'chasen',
    name: 'SUIKAEN Chasen',
    category: 'equipment',
    currentStock: 8,
    unit: 'pcs',
    minStock: 5,
    maxStock: 15,
    shelfLife: 'long',
    costPerUnit: 25,
    supplier: 'Takayama Craft',
    lastRestocked: '2026-01-15'
  },
  {
    id: 'honey',
    name: 'Raw Wildflower Honey',
    category: 'other',
    currentStock: 2.5,
    unit: 'kg',
    minStock: 1,
    maxStock: 4,
    shelfLife: 'long',
    costPerUnit: 28,
    supplier: 'Local Apiary',
    lastRestocked: '2026-01-18'
  }
];

// Menu Items with profitability data
export const menuItems: MenuItem[] = [
  {
    id: 'signature-matcha-latte',
    name: 'Signature Matcha Latte',
    category: 'signature',
    price: 8.50,
    cost: 2.85,
    margin: 66.5,
    weeklyVolume: 245,
    monthlyVolume: 980,
    ingredients: [
      { itemId: 'matcha-ceremonial', quantity: 0.003 },
      { itemId: 'meiji-milk', quantity: 0.25 }
    ],
    trending: 'up'
  },
  {
    id: 'premium-ceremonial',
    name: 'Premium Ceremonial Bowl',
    category: 'premium',
    price: 12.00,
    cost: 3.20,
    margin: 73.3,
    weeklyVolume: 85,
    monthlyVolume: 340,
    ingredients: [
      { itemId: 'matcha-ceremonial', quantity: 0.004 }
    ],
    trending: 'stable'
  },
  {
    id: 'houjicha-latte',
    name: 'Houjicha Latte',
    category: 'regular',
    price: 7.00,
    cost: 2.15,
    margin: 69.3,
    weeklyVolume: 156,
    monthlyVolume: 624,
    ingredients: [
      { itemId: 'houjicha', quantity: 0.003 },
      { itemId: 'meiji-milk', quantity: 0.25 }
    ],
    trending: 'up'
  },
  {
    id: 'strawberry-matcha',
    name: 'Strawberry Matcha',
    category: 'seasonal',
    price: 9.50,
    cost: 3.95,
    margin: 58.4,
    weeklyVolume: 78,
    monthlyVolume: 312,
    ingredients: [
      { itemId: 'matcha-culinary', quantity: 0.002 },
      { itemId: 'meiji-milk', quantity: 0.2 },
      { itemId: 'strawberries', quantity: 0.05 }
    ],
    trending: 'down'
  },
  {
    id: 'oat-matcha',
    name: 'Oat Matcha Latte',
    category: 'regular',
    price: 9.00,
    cost: 3.10,
    margin: 65.6,
    weeklyVolume: 198,
    monthlyVolume: 792,
    ingredients: [
      { itemId: 'matcha-culinary', quantity: 0.003 },
      { itemId: 'oatly', quantity: 0.25 }
    ],
    trending: 'up'
  },
  {
    id: 'honey-matcha',
    name: 'Honey Foam Matcha',
    category: 'signature',
    price: 10.00,
    cost: 3.45,
    margin: 65.5,
    weeklyVolume: 134,
    monthlyVolume: 536,
    ingredients: [
      { itemId: 'matcha-ceremonial', quantity: 0.003 },
      { itemId: 'meiji-milk', quantity: 0.2 },
      { itemId: 'honey', quantity: 0.015 }
    ],
    trending: 'stable'
  },
  {
    id: 'iced-matcha',
    name: 'Iced Matcha',
    category: 'regular',
    price: 6.50,
    cost: 1.80,
    margin: 72.3,
    weeklyVolume: 312,
    monthlyVolume: 1248,
    ingredients: [
      { itemId: 'matcha-culinary', quantity: 0.002 },
      { itemId: 'meiji-milk', quantity: 0.15 }
    ],
    trending: 'up'
  },
  {
    id: 'matcha-affogato',
    name: 'Matcha Affogato',
    category: 'premium',
    price: 11.50,
    cost: 4.20,
    margin: 63.5,
    weeklyVolume: 45,
    monthlyVolume: 180,
    ingredients: [
      { itemId: 'matcha-ceremonial', quantity: 0.003 }
    ],
    trending: 'down'
  }
];

// Weekly sales data (last 8 weeks)
export const weeklySalesData: SalesData[] = [
  { date: '2025-12-09', revenue: 12450, orders: 1580, avgOrderValue: 7.88 },
  { date: '2025-12-16', revenue: 14200, orders: 1720, avgOrderValue: 8.26 },
  { date: '2025-12-23', revenue: 18500, orders: 2150, avgOrderValue: 8.60 },
  { date: '2025-12-30', revenue: 16800, orders: 1980, avgOrderValue: 8.48 },
  { date: '2026-01-06', revenue: 13200, orders: 1620, avgOrderValue: 8.15 },
  { date: '2026-01-13', revenue: 15600, orders: 1850, avgOrderValue: 8.43 },
  { date: '2026-01-20', revenue: 16200, orders: 1920, avgOrderValue: 8.44 },
  { date: '2026-01-27', revenue: 17100, orders: 2010, avgOrderValue: 8.51 }
];

// Daily sales data (last 7 days)
export const dailySalesData: SalesData[] = [
  { date: '2026-01-25', revenue: 2180, orders: 258, avgOrderValue: 8.45 },
  { date: '2026-01-26', revenue: 2450, orders: 285, avgOrderValue: 8.60 },
  { date: '2026-01-27', revenue: 2680, orders: 312, avgOrderValue: 8.59 },
  { date: '2026-01-28', revenue: 2520, orders: 298, avgOrderValue: 8.46 },
  { date: '2026-01-29', revenue: 2890, orders: 335, avgOrderValue: 8.63 },
  { date: '2026-01-30', revenue: 3120, orders: 365, avgOrderValue: 8.55 },
  { date: '2026-01-31', revenue: 2950, orders: 342, avgOrderValue: 8.63 }
];

// Procurement recommendations
export const procurementList: ProcurementItem[] = [
  {
    itemId: 'meiji-milk',
    itemName: 'Meiji Fresh Milk',
    currentStock: 15,
    projectedNeed: 35,
    orderQuantity: 20,
    priority: 'urgent',
    orderBy: '2026-02-01'
  },
  {
    itemId: 'strawberries',
    itemName: 'Fresh Strawberries',
    currentStock: 3,
    projectedNeed: 5,
    orderQuantity: 4,
    priority: 'urgent',
    orderBy: '2026-02-01'
  },
  {
    itemId: 'matcha-ceremonial',
    itemName: 'Ceremonial Grade Matcha',
    currentStock: 2.5,
    projectedNeed: 3.5,
    orderQuantity: 2,
    priority: 'normal',
    orderBy: '2026-02-03'
  },
  {
    itemId: 'oatly',
    itemName: 'Oatly Barista Edition',
    currentStock: 12,
    projectedNeed: 18,
    orderQuantity: 12,
    priority: 'normal',
    orderBy: '2026-02-04'
  },
  {
    itemId: 'houjicha',
    itemName: 'Houjicha Powder',
    currentStock: 1.8,
    projectedNeed: 2.2,
    orderQuantity: 1,
    priority: 'low',
    orderBy: '2026-02-07'
  }
];

// Business metrics
export const businessMetrics = {
  monthlyProfitGoal: 15000,
  currentMonthProfit: 12850,
  lastMonthProfit: 11200,
  profitGrowth: 14.7,
  avgDailyRevenue: 2541,
  avgDailyOrders: 299,
  topSellingItem: 'Iced Matcha',
  highestMarginItem: 'Premium Ceremonial Bowl',
  inventoryValue: 4250,
  wastageThisMonth: 180
};

// Strategic recommendations
export const strategicRecommendations = [
  {
    id: 'rec-1',
    type: 'promotion',
    title: 'Promote Strawberry Matcha',
    description: 'Clear excess strawberry inventory before expiry (Feb 3). Consider 15% discount or bundle deal.',
    impact: 'Reduce potential wastage of $54',
    priority: 'high'
  },
  {
    id: 'rec-2',
    type: 'menu',
    title: 'Introduce Summer Blend',
    description: 'Create a new drink using culinary matcha and seasonal fruits to lower COGS while maintaining appeal.',
    impact: 'Potential 8% margin improvement',
    priority: 'medium'
  },
  {
    id: 'rec-3',
    type: 'upsell',
    title: 'Signature Latte Push',
    description: 'Increase Signature Matcha Latte sales by 15% to hit monthly profit goal. Train staff on upselling.',
    impact: 'Additional $320/week revenue',
    priority: 'high'
  },
  {
    id: 'rec-4',
    type: 'pricing',
    title: 'Review Affogato Pricing',
    description: 'Matcha Affogato has lowest volume and declining trend. Consider price adjustment or menu removal.',
    impact: 'Optimize menu efficiency',
    priority: 'low'
  }
];

// Category breakdown for charts
export const categoryBreakdown = [
  { name: 'Signature', revenue: 5890, percentage: 34.5 },
  { name: 'Regular', revenue: 6420, percentage: 37.5 },
  { name: 'Premium', revenue: 2850, percentage: 16.7 },
  { name: 'Seasonal', revenue: 1940, percentage: 11.3 }
];

// Hourly sales pattern
export const hourlySalesPattern = [
  { hour: '8AM', orders: 45 },
  { hour: '9AM', orders: 68 },
  { hour: '10AM', orders: 52 },
  { hour: '11AM', orders: 38 },
  { hour: '12PM', orders: 85 },
  { hour: '1PM', orders: 92 },
  { hour: '2PM', orders: 65 },
  { hour: '3PM', orders: 78 },
  { hour: '4PM', orders: 55 },
  { hour: '5PM', orders: 72 },
  { hour: '6PM', orders: 88 },
  { hour: '7PM', orders: 62 }
];

// Extended Inventory Analytics Data
export interface IngredientAnalytics {
  ingredientId: string;
  averageDailyUsage: number;
  projectedDaysRemaining: number;
  recommendedReorderQty: number;
  recommendedOrderDate: string;
  leadTimeDays: number;
  urgencyStatus: 'critical' | 'soon' | 'monitor';
  impactedMenuItems: string[];
  usageByMenuItem: { menuItemId: string; menuItemName: string; dailyUsage: number; percentage: number }[];
  stockHistory: { date: string; stock: number }[];
  projectedStock: { date: string; stock: number }[];
  notes: string;
}

// Calculate analytics for each inventory item
export const ingredientAnalytics: IngredientAnalytics[] = [
  {
    ingredientId: 'matcha-ceremonial',
    averageDailyUsage: 0.045,
    projectedDaysRemaining: 56,
    recommendedReorderQty: 2,
    recommendedOrderDate: '2026-03-15',
    leadTimeDays: 7,
    urgencyStatus: 'monitor',
    impactedMenuItems: ['Signature Matcha Latte', 'Premium Ceremonial Bowl', 'Honey Foam Matcha', 'Matcha Affogato'],
    usageByMenuItem: [
      { menuItemId: 'signature-matcha-latte', menuItemName: 'Signature Matcha Latte', dailyUsage: 0.0105, percentage: 23.3 },
      { menuItemId: 'premium-ceremonial', menuItemName: 'Premium Ceremonial Bowl', dailyUsage: 0.0049, percentage: 10.9 },
      { menuItemId: 'honey-matcha', menuItemName: 'Honey Foam Matcha', dailyUsage: 0.0057, percentage: 12.7 },
      { menuItemId: 'matcha-affogato', menuItemName: 'Matcha Affogato', dailyUsage: 0.0019, percentage: 4.2 }
    ],
    stockHistory: [
      { date: '2026-01-25', stock: 3.2 },
      { date: '2026-01-26', stock: 3.15 },
      { date: '2026-01-27', stock: 3.1 },
      { date: '2026-01-28', stock: 3.05 },
      { date: '2026-01-29', stock: 2.95 },
      { date: '2026-01-30', stock: 2.55 },
      { date: '2026-01-31', stock: 2.5 }
    ],
    projectedStock: [
      { date: '2026-01-31', stock: 2.5 },
      { date: '2026-02-07', stock: 2.19 },
      { date: '2026-02-14', stock: 1.88 },
      { date: '2026-02-21', stock: 1.57 },
      { date: '2026-02-28', stock: 1.26 },
      { date: '2026-03-07', stock: 0.95 },
      { date: '2026-03-14', stock: 0.64 }
    ],
    notes: ''
  },
  {
    ingredientId: 'matcha-culinary',
    averageDailyUsage: 0.082,
    projectedDaysRemaining: 51,
    recommendedReorderQty: 4,
    recommendedOrderDate: '2026-03-10',
    leadTimeDays: 7,
    urgencyStatus: 'monitor',
    impactedMenuItems: ['Strawberry Matcha', 'Oat Matcha Latte', 'Iced Matcha'],
    usageByMenuItem: [
      { menuItemId: 'strawberry-matcha', menuItemName: 'Strawberry Matcha', dailyUsage: 0.022, percentage: 26.8 },
      { menuItemId: 'oat-matcha', menuItemName: 'Oat Matcha Latte', dailyUsage: 0.085, percentage: 36.6 },
      { menuItemId: 'iced-matcha', menuItemName: 'Iced Matcha', dailyUsage: 0.089, percentage: 38.4 }
    ],
    stockHistory: [
      { date: '2026-01-25', stock: 4.8 },
      { date: '2026-01-26', stock: 4.72 },
      { date: '2026-01-27', stock: 4.62 },
      { date: '2026-01-28', stock: 4.52 },
      { date: '2026-01-29', stock: 4.42 },
      { date: '2026-01-30', stock: 4.3 },
      { date: '2026-01-31', stock: 4.2 }
    ],
    projectedStock: [
      { date: '2026-01-31', stock: 4.2 },
      { date: '2026-02-07', stock: 3.63 },
      { date: '2026-02-14', stock: 3.06 },
      { date: '2026-02-21', stock: 2.49 },
      { date: '2026-02-28', stock: 1.92 },
      { date: '2026-03-07', stock: 1.35 },
      { date: '2026-03-14', stock: 0.78 }
    ],
    notes: ''
  },
  {
    ingredientId: 'houjicha',
    averageDailyUsage: 0.067,
    projectedDaysRemaining: 27,
    recommendedReorderQty: 2,
    recommendedOrderDate: '2026-02-20',
    leadTimeDays: 5,
    urgencyStatus: 'monitor',
    impactedMenuItems: ['Houjicha Latte'],
    usageByMenuItem: [
      { menuItemId: 'houjicha-latte', menuItemName: 'Houjicha Latte', dailyUsage: 0.067, percentage: 100 }
    ],
    stockHistory: [
      { date: '2026-01-25', stock: 2.2 },
      { date: '2026-01-26', stock: 2.13 },
      { date: '2026-01-27', stock: 2.06 },
      { date: '2026-01-28', stock: 1.99 },
      { date: '2026-01-29', stock: 1.92 },
      { date: '2026-01-30', stock: 1.86 },
      { date: '2026-01-31', stock: 1.8 }
    ],
    projectedStock: [
      { date: '2026-01-31', stock: 1.8 },
      { date: '2026-02-07', stock: 1.33 },
      { date: '2026-02-14', stock: 0.86 },
      { date: '2026-02-21', stock: 0.39 },
      { date: '2026-02-28', stock: 0 }
    ],
    notes: ''
  },
  {
    ingredientId: 'meiji-milk',
    averageDailyUsage: 8.5,
    projectedDaysRemaining: 2,
    recommendedReorderQty: 30,
    recommendedOrderDate: '2026-02-01',
    leadTimeDays: 1,
    urgencyStatus: 'critical',
    impactedMenuItems: ['Signature Matcha Latte', 'Houjicha Latte', 'Strawberry Matcha', 'Honey Foam Matcha', 'Iced Matcha'],
    usageByMenuItem: [
      { menuItemId: 'signature-matcha-latte', menuItemName: 'Signature Matcha Latte', dailyUsage: 8.75, percentage: 35.7 },
      { menuItemId: 'houjicha-latte', menuItemName: 'Houjicha Latte', dailyUsage: 5.57, percentage: 22.7 },
      { menuItemId: 'strawberry-matcha', menuItemName: 'Strawberry Matcha', dailyUsage: 2.23, percentage: 9.1 },
      { menuItemId: 'honey-matcha', menuItemName: 'Honey Foam Matcha', dailyUsage: 3.83, percentage: 15.6 },
      { menuItemId: 'iced-matcha', menuItemName: 'Iced Matcha', dailyUsage: 6.69, percentage: 27.3 }
    ],
    stockHistory: [
      { date: '2026-01-25', stock: 28 },
      { date: '2026-01-26', stock: 22 },
      { date: '2026-01-27', stock: 18 },
      { date: '2026-01-28', stock: 25 },
      { date: '2026-01-29', stock: 20 },
      { date: '2026-01-30', stock: 18 },
      { date: '2026-01-31', stock: 15 }
    ],
    projectedStock: [
      { date: '2026-01-31', stock: 15 },
      { date: '2026-02-01', stock: 6.5 },
      { date: '2026-02-02', stock: 0 }
    ],
    notes: 'High velocity item - order daily or every other day'
  },
  {
    ingredientId: 'oatly',
    averageDailyUsage: 7.07,
    projectedDaysRemaining: 2,
    recommendedReorderQty: 24,
    recommendedOrderDate: '2026-02-01',
    leadTimeDays: 2,
    urgencyStatus: 'critical',
    impactedMenuItems: ['Oat Matcha Latte'],
    usageByMenuItem: [
      { menuItemId: 'oat-matcha', menuItemName: 'Oat Matcha Latte', dailyUsage: 7.07, percentage: 100 }
    ],
    stockHistory: [
      { date: '2026-01-25', stock: 20 },
      { date: '2026-01-26', stock: 18 },
      { date: '2026-01-27', stock: 16 },
      { date: '2026-01-28', stock: 24 },
      { date: '2026-01-29', stock: 19 },
      { date: '2026-01-30', stock: 15 },
      { date: '2026-01-31', stock: 12 }
    ],
    projectedStock: [
      { date: '2026-01-31', stock: 12 },
      { date: '2026-02-01', stock: 4.93 },
      { date: '2026-02-02', stock: 0 }
    ],
    notes: 'Popular dairy alternative - maintain buffer stock'
  },
  {
    ingredientId: 'strawberries',
    averageDailyUsage: 0.56,
    projectedDaysRemaining: 5,
    recommendedReorderQty: 4,
    recommendedOrderDate: '2026-02-03',
    leadTimeDays: 1,
    urgencyStatus: 'soon',
    impactedMenuItems: ['Strawberry Matcha'],
    usageByMenuItem: [
      { menuItemId: 'strawberry-matcha', menuItemName: 'Strawberry Matcha', dailyUsage: 0.56, percentage: 100 }
    ],
    stockHistory: [
      { date: '2026-01-25', stock: 5.5 },
      { date: '2026-01-26', stock: 5.0 },
      { date: '2026-01-27', stock: 4.4 },
      { date: '2026-01-28', stock: 3.9 },
      { date: '2026-01-29', stock: 6.0 },
      { date: '2026-01-30', stock: 3.5 },
      { date: '2026-01-31', stock: 3.0 }
    ],
    projectedStock: [
      { date: '2026-01-31', stock: 3.0 },
      { date: '2026-02-02', stock: 1.88 },
      { date: '2026-02-04', stock: 0.76 },
      { date: '2026-02-05', stock: 0.2 },
      { date: '2026-02-06', stock: 0 }
    ],
    notes: 'Expiring Feb 3 - consider promotion to reduce waste'
  },
  {
    ingredientId: 'chasen',
    averageDailyUsage: 0.14,
    projectedDaysRemaining: 57,
    recommendedReorderQty: 5,
    recommendedOrderDate: '2026-03-20',
    leadTimeDays: 14,
    urgencyStatus: 'monitor',
    impactedMenuItems: ['Premium Ceremonial Bowl'],
    usageByMenuItem: [
      { menuItemId: 'premium-ceremonial', menuItemName: 'Premium Ceremonial Bowl', dailyUsage: 0.14, percentage: 100 }
    ],
    stockHistory: [
      { date: '2026-01-25', stock: 9 },
      { date: '2026-01-26', stock: 9 },
      { date: '2026-01-27', stock: 8 },
      { date: '2026-01-28', stock: 8 },
      { date: '2026-01-29', stock: 8 },
      { date: '2026-01-30', stock: 8 },
      { date: '2026-01-31', stock: 8 }
    ],
    projectedStock: [
      { date: '2026-01-31', stock: 8 },
      { date: '2026-02-14', stock: 6 },
      { date: '2026-02-28', stock: 4 },
      { date: '2026-03-14', stock: 2 },
      { date: '2026-03-28', stock: 0 }
    ],
    notes: 'Long lead time from Japan - order well in advance'
  },
  {
    ingredientId: 'honey',
    averageDailyUsage: 0.029,
    projectedDaysRemaining: 86,
    recommendedReorderQty: 2,
    recommendedOrderDate: '2026-04-15',
    leadTimeDays: 3,
    urgencyStatus: 'monitor',
    impactedMenuItems: ['Honey Foam Matcha'],
    usageByMenuItem: [
      { menuItemId: 'honey-matcha', menuItemName: 'Honey Foam Matcha', dailyUsage: 0.029, percentage: 100 }
    ],
    stockHistory: [
      { date: '2026-01-25', stock: 2.7 },
      { date: '2026-01-26', stock: 2.67 },
      { date: '2026-01-27', stock: 2.64 },
      { date: '2026-01-28', stock: 2.61 },
      { date: '2026-01-29', stock: 2.58 },
      { date: '2026-01-30', stock: 2.55 },
      { date: '2026-01-31', stock: 2.5 }
    ],
    projectedStock: [
      { date: '2026-01-31', stock: 2.5 },
      { date: '2026-02-28', stock: 1.69 },
      { date: '2026-03-31', stock: 0.79 },
      { date: '2026-04-15', stock: 0.36 }
    ],
    notes: ''
  }
];

// Helper function to get analytics for an ingredient
export function getIngredientAnalytics(ingredientId: string): IngredientAnalytics | undefined {
  return ingredientAnalytics.find(a => a.ingredientId === ingredientId);
}

// Get priority ingredients sorted by urgency
export function getPriorityIngredients(): (IngredientAnalytics & { ingredient: InventoryItem })[] {
  const urgencyOrder = { critical: 0, soon: 1, monitor: 2 };
  
  return ingredientAnalytics
    .map(analytics => {
      const ingredient = inventoryItems.find(i => i.id === analytics.ingredientId);
      return ingredient ? { ...analytics, ingredient } : null;
    })
    .filter((item): item is (IngredientAnalytics & { ingredient: InventoryItem }) => item !== null)
    .sort((a, b) => {
      // First sort by urgency
      const urgencyDiff = urgencyOrder[a.urgencyStatus] - urgencyOrder[b.urgencyStatus];
      if (urgencyDiff !== 0) return urgencyDiff;
      // Then by days remaining
      return a.projectedDaysRemaining - b.projectedDaysRemaining;
    });
}


// ============================================
// MENU ENGINEERING & PROFITABILITY ANALYTICS
// ============================================

export interface MenuEngineeringItem {
  menuItemId: string;
  name: string;
  category: 'signature' | 'premium' | 'regular' | 'seasonal';
  price: number;
  cost: number;
  margin: number;
  marginPercentage: number;
  weeklyVolume: number;
  monthlyVolume: number;
  weeklyProfit: number;
  monthlyProfit: number;
  classification: 'star' | 'plowhorse' | 'puzzle' | 'dog';
  trending: 'up' | 'down' | 'stable';
}

export interface IngredientCostTrend {
  ingredientId: string;
  name: string;
  currentCost: number;
  unit: string;
  costHistory: { month: string; cost: number }[];
  trendDirection: 'rising' | 'falling' | 'stable';
  percentageChange: number;
  alertType: 'red' | 'green' | 'neutral';
}

export interface MarginSensitivity {
  ingredientId: string;
  ingredientName: string;
  currentCost: number;
  impactedDrinks: {
    drinkId: string;
    drinkName: string;
    currentMargin: number;
    marginAfter10PercentIncrease: number;
    profitImpactPerUnit: number;
    monthlyProfitImpact: number;
  }[];
  totalMonthlyImpact: number;
}

// Calculate menu engineering classification
function classifyMenuItem(item: MenuItem, avgMargin: number, avgVolume: number): MenuEngineeringItem {
  const isHighMargin = item.margin >= avgMargin;
  const isHighVolume = item.weeklyVolume >= avgVolume;
  
  let classification: 'star' | 'plowhorse' | 'puzzle' | 'dog';
  if (isHighMargin && isHighVolume) classification = 'star';
  else if (!isHighMargin && isHighVolume) classification = 'plowhorse';
  else if (isHighMargin && !isHighVolume) classification = 'puzzle';
  else classification = 'dog';
  
  const weeklyProfit = (item.price - item.cost) * item.weeklyVolume;
  const monthlyProfit = (item.price - item.cost) * item.monthlyVolume;
  
  return {
    menuItemId: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    cost: item.cost,
    margin: item.price - item.cost,
    marginPercentage: item.margin,
    weeklyVolume: item.weeklyVolume,
    monthlyVolume: item.monthlyVolume,
    weeklyProfit,
    monthlyProfit,
    classification,
    trending: item.trending
  };
}

// Generate menu engineering data
const avgMargin = menuItems.reduce((sum, item) => sum + item.margin, 0) / menuItems.length;
const avgVolume = menuItems.reduce((sum, item) => sum + item.weeklyVolume, 0) / menuItems.length;

export const menuEngineeringData: MenuEngineeringItem[] = menuItems.map(item => 
  classifyMenuItem(item, avgMargin, avgVolume)
);

// Get items by classification
export function getMenuItemsByClassification(classification: 'star' | 'plowhorse' | 'puzzle' | 'dog'): MenuEngineeringItem[] {
  return menuEngineeringData.filter(item => item.classification === classification);
}

// Ingredient cost trends (last 3 months)
export const ingredientCostTrends: IngredientCostTrend[] = [
  {
    ingredientId: 'matcha-ceremonial',
    name: 'Ceremonial Grade Matcha',
    currentCost: 180,
    unit: 'kg',
    costHistory: [
      { month: 'Nov 2025', cost: 165 },
      { month: 'Dec 2025', cost: 172 },
      { month: 'Jan 2026', cost: 180 }
    ],
    trendDirection: 'rising',
    percentageChange: 9.1,
    alertType: 'red'
  },
  {
    ingredientId: 'matcha-culinary',
    name: 'Culinary Grade Matcha',
    currentCost: 85,
    unit: 'kg',
    costHistory: [
      { month: 'Nov 2025', cost: 82 },
      { month: 'Dec 2025', cost: 84 },
      { month: 'Jan 2026', cost: 85 }
    ],
    trendDirection: 'stable',
    percentageChange: 3.7,
    alertType: 'neutral'
  },
  {
    ingredientId: 'meiji-milk',
    name: 'Meiji Fresh Milk',
    currentCost: 3.5,
    unit: 'L',
    costHistory: [
      { month: 'Nov 2025', cost: 3.8 },
      { month: 'Dec 2025', cost: 3.6 },
      { month: 'Jan 2026', cost: 3.5 }
    ],
    trendDirection: 'falling',
    percentageChange: -7.9,
    alertType: 'green'
  },
  {
    ingredientId: 'oatly',
    name: 'Oatly Barista Edition',
    currentCost: 5.2,
    unit: 'L',
    costHistory: [
      { month: 'Nov 2025', cost: 4.8 },
      { month: 'Dec 2025', cost: 5.0 },
      { month: 'Jan 2026', cost: 5.2 }
    ],
    trendDirection: 'rising',
    percentageChange: 8.3,
    alertType: 'red'
  },
  {
    ingredientId: 'strawberries',
    name: 'Fresh Strawberries',
    currentCost: 18,
    unit: 'kg',
    costHistory: [
      { month: 'Nov 2025', cost: 22 },
      { month: 'Dec 2025', cost: 20 },
      { month: 'Jan 2026', cost: 18 }
    ],
    trendDirection: 'falling',
    percentageChange: -18.2,
    alertType: 'green'
  },
  {
    ingredientId: 'honey',
    name: 'Raw Wildflower Honey',
    currentCost: 28,
    unit: 'kg',
    costHistory: [
      { month: 'Nov 2025', cost: 26 },
      { month: 'Dec 2025', cost: 27 },
      { month: 'Jan 2026', cost: 28 }
    ],
    trendDirection: 'rising',
    percentageChange: 7.7,
    alertType: 'red'
  }
];

// Margin sensitivity analysis
export const marginSensitivityData: MarginSensitivity[] = [
  {
    ingredientId: 'matcha-ceremonial',
    ingredientName: 'Ceremonial Grade Matcha',
    currentCost: 180,
    impactedDrinks: [
      {
        drinkId: 'signature-matcha-latte',
        drinkName: 'Signature Matcha Latte',
        currentMargin: 66.5,
        marginAfter10PercentIncrease: 65.9,
        profitImpactPerUnit: -0.054,
        monthlyProfitImpact: -52.92
      },
      {
        drinkId: 'premium-ceremonial',
        drinkName: 'Premium Ceremonial Bowl',
        currentMargin: 73.3,
        marginAfter10PercentIncrease: 72.7,
        profitImpactPerUnit: -0.072,
        monthlyProfitImpact: -24.48
      },
      {
        drinkId: 'honey-matcha',
        drinkName: 'Honey Foam Matcha',
        currentMargin: 65.5,
        marginAfter10PercentIncrease: 64.9,
        profitImpactPerUnit: -0.054,
        monthlyProfitImpact: -28.94
      }
    ],
    totalMonthlyImpact: -106.34
  },
  {
    ingredientId: 'meiji-milk',
    ingredientName: 'Meiji Fresh Milk',
    currentCost: 3.5,
    impactedDrinks: [
      {
        drinkId: 'signature-matcha-latte',
        drinkName: 'Signature Matcha Latte',
        currentMargin: 66.5,
        marginAfter10PercentIncrease: 65.5,
        profitImpactPerUnit: -0.0875,
        monthlyProfitImpact: -85.75
      },
      {
        drinkId: 'houjicha-latte',
        drinkName: 'Houjicha Latte',
        currentMargin: 69.3,
        marginAfter10PercentIncrease: 68.0,
        profitImpactPerUnit: -0.0875,
        monthlyProfitImpact: -54.60
      },
      {
        drinkId: 'iced-matcha',
        drinkName: 'Iced Matcha',
        currentMargin: 72.3,
        marginAfter10PercentIncrease: 71.5,
        profitImpactPerUnit: -0.0525,
        monthlyProfitImpact: -65.52
      }
    ],
    totalMonthlyImpact: -205.87
  },
  {
    ingredientId: 'oatly',
    ingredientName: 'Oatly Barista Edition',
    currentCost: 5.2,
    impactedDrinks: [
      {
        drinkId: 'oat-matcha',
        drinkName: 'Oat Matcha Latte',
        currentMargin: 65.6,
        marginAfter10PercentIncrease: 64.2,
        profitImpactPerUnit: -0.13,
        monthlyProfitImpact: -102.96
      }
    ],
    totalMonthlyImpact: -102.96
  }
];

// Profitability KPIs
export interface ProfitabilityKPIs {
  actualMargin: number;
  targetMargin: number;
  topProfitContributor: { name: string; monthlyProfit: number };
  oatmilkLiftProfit: number;
  totalMonthlyRevenue: number;
  totalMonthlyCost: number;
  totalMonthlyProfit: number;
  profitGapToGoal: number;
}

// Calculate oatmilk lift (surcharge profit from milk swaps)
const oatmilkSurcharge = 1.0; // $1 extra for oat milk
const oatmilkOrders = menuItems.find(m => m.id === 'oat-matcha')?.monthlyVolume || 0;
const oatmilkLiftProfit = oatmilkSurcharge * oatmilkOrders * 0.85; // 85% margin on surcharge

// Find top profit contributor
const topContributor = menuEngineeringData.reduce((max, item) => 
  item.monthlyProfit > max.monthlyProfit ? item : max
);

export const profitabilityKPIs: ProfitabilityKPIs = {
  actualMargin: 67.2,
  targetMargin: 70.0,
  topProfitContributor: { name: topContributor.name, monthlyProfit: topContributor.monthlyProfit },
  oatmilkLiftProfit: oatmilkLiftProfit,
  totalMonthlyRevenue: menuItems.reduce((sum, item) => sum + (item.price * item.monthlyVolume), 0),
  totalMonthlyCost: menuItems.reduce((sum, item) => sum + (item.cost * item.monthlyVolume), 0),
  totalMonthlyProfit: businessMetrics.currentMonthProfit,
  profitGapToGoal: businessMetrics.monthlyProfitGoal - businessMetrics.currentMonthProfit
};

// Gap analysis data
export interface GapAnalysis {
  currentProfit: number;
  targetProfit: number;
  gap: number;
  starItemsNeeded: { itemName: string; additionalUnits: number; additionalRevenue: number }[];
  requiredIngredients: { ingredientId: string; ingredientName: string; additionalQty: number; unit: string; cost: number }[];
}

export function calculateGapAnalysis(targetProfit: number): GapAnalysis {
  const currentProfit = businessMetrics.currentMonthProfit;
  const gap = targetProfit - currentProfit;
  
  if (gap <= 0) {
    return {
      currentProfit,
      targetProfit,
      gap: 0,
      starItemsNeeded: [],
      requiredIngredients: []
    };
  }
  
  // Get star items sorted by profit per unit
  const stars = menuEngineeringData
    .filter(item => item.classification === 'star')
    .sort((a, b) => b.margin - a.margin);
  
  let remainingGap = gap;
  const starItemsNeeded: { itemName: string; additionalUnits: number; additionalRevenue: number }[] = [];
  const ingredientRequirements: Map<string, { name: string; qty: number; unit: string; cost: number }> = new Map();
  
  for (const star of stars) {
    if (remainingGap <= 0) break;
    
    const unitsNeeded = Math.ceil(remainingGap / star.margin);
    const actualUnits = Math.min(unitsNeeded, Math.floor(star.monthlyVolume * 0.3)); // Max 30% increase
    const profitFromUnits = actualUnits * star.margin;
    
    if (actualUnits > 0) {
      starItemsNeeded.push({
        itemName: star.name,
        additionalUnits: actualUnits,
        additionalRevenue: actualUnits * star.price
      });
      
      // Calculate ingredient requirements
      const menuItem = menuItems.find(m => m.id === star.menuItemId);
      if (menuItem) {
        for (const ing of menuItem.ingredients) {
          const ingredient = inventoryItems.find(i => i.id === ing.itemId);
          if (ingredient) {
            const existing = ingredientRequirements.get(ing.itemId) || { 
              name: ingredient.name, 
              qty: 0, 
              unit: ingredient.unit,
              cost: 0 
            };
            existing.qty += ing.quantity * actualUnits;
            existing.cost += ing.quantity * actualUnits * ingredient.costPerUnit;
            ingredientRequirements.set(ing.itemId, existing);
          }
        }
      }
      
      remainingGap -= profitFromUnits;
    }
  }
  
  return {
    currentProfit,
    targetProfit,
    gap,
    starItemsNeeded,
    requiredIngredients: Array.from(ingredientRequirements.entries()).map(([id, data]) => ({
      ingredientId: id,
      ingredientName: data.name,
      additionalQty: Math.round(data.qty * 100) / 100,
      unit: data.unit,
      cost: Math.round(data.cost * 100) / 100
    }))
  };
}

// AI Strategy context for Gemini API
export function getStrategyContext() {
  return {
    menuEngineering: {
      stars: menuEngineeringData.filter(i => i.classification === 'star'),
      plowhorses: menuEngineeringData.filter(i => i.classification === 'plowhorse'),
      puzzles: menuEngineeringData.filter(i => i.classification === 'puzzle'),
      dogs: menuEngineeringData.filter(i => i.classification === 'dog')
    },
    costTrends: {
      rising: ingredientCostTrends.filter(t => t.alertType === 'red'),
      falling: ingredientCostTrends.filter(t => t.alertType === 'green')
    },
    profitability: profitabilityKPIs,
    gapAnalysis: calculateGapAnalysis(businessMetrics.monthlyProfitGoal),
    excessInventory: inventoryItems.filter(i => i.currentStock > i.maxStock * 0.8),
    expiringItems: inventoryItems.filter(i => i.expiryDate && new Date(i.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  };
}

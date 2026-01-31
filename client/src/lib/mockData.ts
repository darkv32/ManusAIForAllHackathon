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

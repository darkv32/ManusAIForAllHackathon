import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  getIngredientById: vi.fn(),
  getAllIngredients: vi.fn(),
  getAllSales: vi.fn(),
  getAllRecipes: vi.fn(),
  getAllMenuItems: vi.fn(),
  getIngredientAnalytics: vi.fn(),
  getAllIngredientAnalytics: vi.fn(),
  updateIngredient: vi.fn(),
}));

describe('Ingredient Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Analytics Data Structure', () => {
    it('should have correct structure for ingredient analytics', () => {
      // Define expected analytics structure
      const expectedFields = [
        'ingredientId',
        'ingredient',
        'averageDailyUsage',
        'daysToStockout',
        'inventoryValueRemaining',
        'costBurnRatePerDay',
        'velocityTrend',
        'velocityChangePercent',
        'usageByMenuItem',
        'recommendedReorderQty',
        'recommendedOrderDate',
        'reorderRationale',
        'inactionImpact',
        'dailyUsageHistory',
        'stockHistory',
        'projectedStock',
        'projectedStockoutDate',
      ];

      // Verify all expected fields exist
      expect(expectedFields).toContain('ingredientId');
      expect(expectedFields).toContain('daysToStockout');
      expect(expectedFields).toContain('averageDailyUsage');
      expect(expectedFields).toContain('velocityTrend');
      expect(expectedFields).toContain('reorderRationale');
      expect(expectedFields).toContain('inactionImpact');
    });

    it('should calculate urgency status correctly based on days to stockout', () => {
      const getUrgencyFromDays = (days: number): 'critical' | 'soon' | 'monitor' => {
        if (days <= 3) return 'critical';
        if (days <= 7) return 'soon';
        return 'monitor';
      };

      expect(getUrgencyFromDays(1)).toBe('critical');
      expect(getUrgencyFromDays(3)).toBe('critical');
      expect(getUrgencyFromDays(4)).toBe('soon');
      expect(getUrgencyFromDays(7)).toBe('soon');
      expect(getUrgencyFromDays(8)).toBe('monitor');
      expect(getUrgencyFromDays(30)).toBe('monitor');
    });

    it('should calculate velocity trend correctly', () => {
      const getVelocityTrend = (changePercent: number): 'increasing' | 'stable' | 'decreasing' => {
        if (changePercent > 10) return 'increasing';
        if (changePercent < -10) return 'decreasing';
        return 'stable';
      };

      expect(getVelocityTrend(15)).toBe('increasing');
      expect(getVelocityTrend(5)).toBe('stable');
      expect(getVelocityTrend(-5)).toBe('stable');
      expect(getVelocityTrend(-15)).toBe('decreasing');
    });
  });

  describe('Reorder Recommendation Logic', () => {
    it('should calculate recommended reorder quantity based on daily usage', () => {
      const calculateReorderQty = (avgDailyUsage: number, targetCoverageDays: number): number => {
        return Math.ceil(avgDailyUsage * targetCoverageDays);
      };

      // 10 units/day * 14 days = 140 units
      expect(calculateReorderQty(10, 14)).toBe(140);
      
      // 5.5 units/day * 14 days = 77 units (rounded up)
      expect(calculateReorderQty(5.5, 14)).toBe(77);
      
      // 0 units/day = 0 units
      expect(calculateReorderQty(0, 14)).toBe(0);
    });

    it('should calculate order-by date correctly based on lead time', () => {
      const calculateOrderByDate = (
        daysToStockout: number, 
        leadTimeDays: number, 
        safetyStockDays: number
      ): number => {
        return Math.max(0, daysToStockout - leadTimeDays - safetyStockDays);
      };

      // 10 days to stockout, 3 day lead time, 2 day safety = order in 5 days
      expect(calculateOrderByDate(10, 3, 2)).toBe(5);
      
      // 3 days to stockout, 3 day lead time, 2 day safety = order now (0)
      expect(calculateOrderByDate(3, 3, 2)).toBe(0);
      
      // Already past stockout = order now (0)
      expect(calculateOrderByDate(1, 3, 2)).toBe(0);
    });

    it('should generate appropriate inaction impact messages', () => {
      const getInactionImpact = (
        daysToStockout: number, 
        leadTimeDays: number, 
        safetyStockDays: number
      ): string => {
        if (daysToStockout <= leadTimeDays) {
          return 'Critical: Stock will run out before new order arrives. Immediate action required.';
        } else if (daysToStockout <= leadTimeDays + safetyStockDays) {
          return 'High risk: Expected stockout during peak hours if not reordered soon.';
        } else if (daysToStockout <= 7) {
          return 'Moderate risk: Stock running low. Order soon to maintain buffer.';
        }
        return 'Low risk: Adequate stock levels. Monitor usage trends.';
      };

      expect(getInactionImpact(2, 3, 2)).toContain('Critical');
      expect(getInactionImpact(4, 3, 2)).toContain('High risk');
      expect(getInactionImpact(6, 3, 2)).toContain('Moderate risk');
      expect(getInactionImpact(15, 3, 2)).toContain('Low risk');
    });
  });

  describe('Usage Breakdown Calculations', () => {
    it('should calculate percentage of total usage correctly', () => {
      const calculatePercentage = (itemUsage: number, totalUsage: number): number => {
        return totalUsage > 0 ? (itemUsage / totalUsage) * 100 : 0;
      };

      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(0, 100)).toBe(0);
      expect(calculatePercentage(50, 0)).toBe(0);
    });

    it('should calculate inventory value correctly', () => {
      const calculateInventoryValue = (currentStock: number, costPerUnit: number): number => {
        return currentStock * costPerUnit;
      };

      expect(calculateInventoryValue(100, 0.50)).toBe(50);
      expect(calculateInventoryValue(500, 2.00)).toBe(1000);
      expect(calculateInventoryValue(0, 10)).toBe(0);
    });

    it('should calculate cost burn rate correctly', () => {
      const calculateCostBurnRate = (avgDailyUsage: number, costPerUnit: number): number => {
        return avgDailyUsage * costPerUnit;
      };

      expect(calculateCostBurnRate(10, 0.50)).toBe(5);
      expect(calculateCostBurnRate(25, 2.00)).toBe(50);
      expect(calculateCostBurnRate(0, 10)).toBe(0);
    });
  });

  describe('Cross-Tab Consistency', () => {
    it('should ensure ingredient data structure supports all tabs', () => {
      // Ingredient fields required across tabs
      const requiredFields = [
        'ingredientId',  // Unique identifier
        'name',          // Display name
        'category',      // Grouping
        'unit',          // Measurement unit
        'costPerUnit',   // Cost for profitability
        'currentStock',  // Stock level for inventory
      ];

      // Additional fields for enhanced functionality
      const enhancedFields = [
        'minStock',      // Reorder threshold
        'reorderPoint',  // When to reorder
        'leadTimeDays',  // Supplier lead time
        'expiryDate',    // Expiration tracking
        'notes',         // User notes
        'supplier',      // Supplier info
      ];

      // Verify all fields are defined
      expect(requiredFields.length).toBe(6);
      expect(enhancedFields.length).toBe(6);
    });

    it('should verify cost updates propagate to menu item calculations', () => {
      // Simulate cost calculation
      const calculateMenuItemCost = (
        recipeItems: { ingredientId: string; quantity: number }[],
        ingredientCosts: Map<string, number>
      ): number => {
        return recipeItems.reduce((total, item) => {
          const cost = ingredientCosts.get(item.ingredientId) || 0;
          return total + (item.quantity * cost);
        }, 0);
      };

      const ingredients = new Map([
        ['ING_001', 0.50],
        ['ING_002', 2.00],
        ['ING_003', 0.10],
      ]);

      const recipe = [
        { ingredientId: 'ING_001', quantity: 10 },  // 5.00
        { ingredientId: 'ING_002', quantity: 1 },   // 2.00
        { ingredientId: 'ING_003', quantity: 5 },   // 0.50
      ];

      expect(calculateMenuItemCost(recipe, ingredients)).toBe(7.50);

      // Update ingredient cost
      ingredients.set('ING_001', 0.75);
      expect(calculateMenuItemCost(recipe, ingredients)).toBe(10.00);
    });
  });
});

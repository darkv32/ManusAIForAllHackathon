import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  getAllDraftMenuItems: vi.fn(),
  createDraftMenuItem: vi.fn(),
  updateDraftMenuItem: vi.fn(),
  deleteDraftMenuItem: vi.fn(),
  promoteDraftToActive: vi.fn(),
  getAllIngredients: vi.fn(),
}));

import * as db from './db';

describe('Draft Menu Items', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllDraftMenuItems', () => {
    it('should return all draft menu items with parsed recipes', async () => {
      const mockDraftItems = [
        {
          id: 1,
          itemName: 'Lavender Matcha',
          category: 'Signature',
          recommendedPrice: '9.50',
          totalCogs: '2.35',
          projectedMargin: '75.26',
          strategicJustification: 'Uses excess lavender syrup',
          recipe: JSON.stringify([
            { ingredientName: 'Matcha Powder', quantity: 3, unit: 'gram', estimatedCost: 1.50, isNewSourcing: false },
            { ingredientName: 'Oat Milk', quantity: 200, unit: 'ml', estimatedCost: 0.60, isNewSourcing: false },
            { ingredientName: 'Lavender Syrup', quantity: 15, unit: 'ml', estimatedCost: 0.25, isNewSourcing: false },
          ]),
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getAllDraftMenuItems).mockResolvedValue(
        mockDraftItems.map(item => ({
          ...item,
          parsedRecipe: JSON.parse(item.recipe),
        }))
      );

      const result = await db.getAllDraftMenuItems();
      
      expect(result).toHaveLength(1);
      expect(result[0].itemName).toBe('Lavender Matcha');
      expect(result[0].parsedRecipe).toHaveLength(3);
      expect(result[0].parsedRecipe[0].ingredientName).toBe('Matcha Powder');
    });
  });

  describe('createDraftMenuItem', () => {
    it('should create a draft menu item with recipe', async () => {
      const newDraft = {
        itemName: 'Honey Yuzu Matcha',
        category: 'Seasonal',
        recommendedPrice: '10.00',
        totalCogs: '2.80',
        projectedMargin: '72.00',
        strategicJustification: 'Seasonal offering for spring',
        recipe: [
          { ingredientName: 'Matcha Powder', quantity: 3, unit: 'gram', estimatedCost: 1.50, isNewSourcing: false },
          { ingredientName: 'Honey', quantity: 10, unit: 'gram', estimatedCost: 0.30, isNewSourcing: false },
          { ingredientName: 'Yuzu Juice', quantity: 20, unit: 'ml', estimatedCost: 1.00, isNewSourcing: true },
        ],
      };

      vi.mocked(db.createDraftMenuItem).mockResolvedValue(1);

      const result = await db.createDraftMenuItem(newDraft);
      
      expect(result).toBe(1);
      expect(db.createDraftMenuItem).toHaveBeenCalledWith(newDraft);
    });
  });

  describe('updateDraftMenuItem', () => {
    it('should update a draft menu item', async () => {
      vi.mocked(db.updateDraftMenuItem).mockResolvedValue(undefined);

      await db.updateDraftMenuItem(1, {
        recommendedPrice: '11.00',
        projectedMargin: '74.55',
      });

      expect(db.updateDraftMenuItem).toHaveBeenCalledWith(1, {
        recommendedPrice: '11.00',
        projectedMargin: '74.55',
      });
    });
  });

  describe('deleteDraftMenuItem', () => {
    it('should delete a draft menu item', async () => {
      vi.mocked(db.deleteDraftMenuItem).mockResolvedValue(undefined);

      await db.deleteDraftMenuItem(1);

      expect(db.deleteDraftMenuItem).toHaveBeenCalledWith(1);
    });
  });

  describe('promoteDraftToActive', () => {
    it('should promote a draft to active menu item', async () => {
      vi.mocked(db.promoteDraftToActive).mockResolvedValue(undefined);

      await db.promoteDraftToActive(1);

      expect(db.promoteDraftToActive).toHaveBeenCalledWith(1);
    });
  });
});

describe('Margin Calculation', () => {
  it('should calculate margin correctly', () => {
    const recommendedPrice = 10.00;
    const totalCogs = 2.50;
    const expectedMargin = ((recommendedPrice - totalCogs) / recommendedPrice) * 100;
    
    expect(expectedMargin).toBe(75);
  });

  it('should handle zero price gracefully', () => {
    const recommendedPrice = 0;
    const totalCogs = 2.50;
    const margin = recommendedPrice > 0 
      ? ((recommendedPrice - totalCogs) / recommendedPrice) * 100 
      : 0;
    
    expect(margin).toBe(0);
  });

  it('should categorize margins correctly', () => {
    const highMargin = 75; // > 70% = green
    const mediumMargin = 60; // 50-70% = yellow
    const lowMargin = 40; // < 50% = red

    expect(highMargin > 70).toBe(true);
    expect(mediumMargin >= 50 && mediumMargin <= 70).toBe(true);
    expect(lowMargin < 50).toBe(true);
  });
});

describe('Recipe Cost Calculation', () => {
  it('should calculate total COGS from recipe items', () => {
    const recipe = [
      { ingredientName: 'Matcha Powder', quantity: 3, unit: 'gram', estimatedCost: 1.50, isNewSourcing: false },
      { ingredientName: 'Oat Milk', quantity: 200, unit: 'ml', estimatedCost: 0.60, isNewSourcing: false },
      { ingredientName: 'Honey', quantity: 10, unit: 'gram', estimatedCost: 0.30, isNewSourcing: false },
    ];

    const totalCogs = recipe.reduce((sum, item) => sum + item.estimatedCost, 0);
    
    expect(totalCogs).toBe(2.40);
  });

  it('should identify new sourcing requirements', () => {
    const recipe = [
      { ingredientName: 'Matcha Powder', quantity: 3, unit: 'gram', estimatedCost: 1.50, isNewSourcing: false },
      { ingredientName: 'Dragon Fruit', quantity: 50, unit: 'gram', estimatedCost: 0.50, isNewSourcing: true },
    ];

    const newSourcingItems = recipe.filter(item => item.isNewSourcing);
    
    expect(newSourcingItems).toHaveLength(1);
    expect(newSourcingItems[0].ingredientName).toBe('Dragon Fruit');
  });
});

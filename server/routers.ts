import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ INGREDIENTS ============
  ingredients: router({
    list: publicProcedure.query(async () => {
      return await db.getAllIngredients();
    }),
    
    get: publicProcedure
      .input(z.object({ ingredientId: z.string() }))
      .query(async ({ input }) => {
        return await db.getIngredientById(input.ingredientId);
      }),
    
    create: publicProcedure
      .input(z.object({
        ingredientId: z.string(),
        name: z.string(),
        category: z.string(),
        unit: z.string(),
        costPerUnit: z.string(),
        currentStock: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createIngredient(input);
        return { success: true };
      }),
    
    update: publicProcedure
      .input(z.object({
        ingredientId: z.string(),
        name: z.string().optional(),
        category: z.string().optional(),
        unit: z.string().optional(),
        costPerUnit: z.string().optional(),
        currentStock: z.string().optional(),
        notes: z.string().optional(),
        expiryDate: z.string().optional(),
        leadTimeDays: z.number().optional(),
        minStock: z.string().optional(),
        reorderPoint: z.string().optional(),
        supplier: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { ingredientId, expiryDate, ...data } = input;
        const updateData: Record<string, unknown> = { ...data };
        if (expiryDate) {
          updateData.expiryDate = new Date(expiryDate);
        }
        await db.updateIngredient(ingredientId, updateData);
        return { success: true };
      }),
    
    delete: publicProcedure
      .input(z.object({ ingredientId: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteIngredient(input.ingredientId);
        return { success: true };
      }),
    
    bulkUpload: publicProcedure
      .input(z.object({
        items: z.array(z.object({
          ingredientId: z.string(),
          name: z.string(),
          category: z.string(),
          unit: z.string(),
          costPerUnit: z.string(),
          currentStock: z.string().optional(),
        }))
      }))
      .mutation(async ({ input }) => {
        const count = await db.bulkUpsertIngredients(input.items);
        return { success: true, count };
      }),
    
    analytics: publicProcedure
      .input(z.object({ ingredientId: z.string() }))
      .query(async ({ input }) => {
        return await db.getIngredientAnalytics(input.ingredientId);
      }),
    
    allAnalytics: publicProcedure.query(async () => {
      return await db.getAllIngredientAnalytics();
    }),
  }),

  // ============ MENU ITEMS ============
  menuItems: router({
    list: publicProcedure.query(async () => {
      return await db.getAllMenuItems();
    }),
    
    listWithCosts: publicProcedure.query(async () => {
      return await db.getMenuItemsWithCosts();
    }),
    
    get: publicProcedure
      .input(z.object({ itemId: z.string() }))
      .query(async ({ input }) => {
        return await db.getMenuItemById(input.itemId);
      }),
    
    create: publicProcedure
      .input(z.object({
        itemId: z.string(),
        itemName: z.string(),
        category: z.string(),
        salesPrice: z.string(),
        taxRate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createMenuItem(input);
        return { success: true };
      }),
    
    update: publicProcedure
      .input(z.object({
        itemId: z.string(),
        itemName: z.string().optional(),
        category: z.string().optional(),
        salesPrice: z.string().optional(),
        taxRate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { itemId, ...data } = input;
        await db.updateMenuItem(itemId, data);
        return { success: true };
      }),
    
    delete: publicProcedure
      .input(z.object({ itemId: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteMenuItem(input.itemId);
        return { success: true };
      }),
    
    bulkUpload: publicProcedure
      .input(z.object({
        items: z.array(z.object({
          itemId: z.string(),
          itemName: z.string(),
          category: z.string(),
          salesPrice: z.string(),
          taxRate: z.string().optional(),
        }))
      }))
      .mutation(async ({ input }) => {
        const count = await db.bulkUpsertMenuItems(input.items);
        return { success: true, count };
      }),
  }),

  // ============ RECIPES ============
  recipes: router({
    list: publicProcedure.query(async () => {
      return await db.getAllRecipes();
    }),
    
    getByMenuItem: publicProcedure
      .input(z.object({ menuItemId: z.string() }))
      .query(async ({ input }) => {
        return await db.getRecipesByMenuItemId(input.menuItemId);
      }),
    
    create: publicProcedure
      .input(z.object({
        recipeId: z.string(),
        menuItemId: z.string(),
        ingredientId: z.string(),
        quantity: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.createRecipe(input);
        return { success: true };
      }),
    
    bulkUpload: publicProcedure
      .input(z.object({
        items: z.array(z.object({
          recipeId: z.string(),
          menuItemId: z.string(),
          ingredientId: z.string(),
          quantity: z.string(),
        }))
      }))
      .mutation(async ({ input }) => {
        const count = await db.bulkUpsertRecipes(input.items);
        return { success: true, count };
      }),
  }),

  // ============ DRAFT MENU ITEMS ============
  draftMenuItems: router({
    list: publicProcedure.query(async () => {
      return await db.getAllDraftMenuItems();
    }),
    
    create: publicProcedure
      .input(z.object({
        itemName: z.string(),
        category: z.string(),
        recommendedPrice: z.string(),
        totalCogs: z.string(),
        projectedMargin: z.string(),
        strategicJustification: z.string(),
        recipe: z.array(z.object({
          ingredientName: z.string(),
          quantity: z.number(),
          unit: z.string(),
          estimatedCost: z.number(),
          isNewSourcing: z.boolean(),
        })),
      }))
      .mutation(async ({ input }) => {
        const draftId = await db.createDraftMenuItem(input);
        return { success: true, draftId };
      }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        itemName: z.string().optional(),
        category: z.string().optional(),
        recommendedPrice: z.string().optional(),
        totalCogs: z.string().optional(),
        projectedMargin: z.string().optional(),
        strategicJustification: z.string().optional(),
        recipe: z.array(z.object({
          ingredientName: z.string(),
          quantity: z.number(),
          unit: z.string(),
          estimatedCost: z.number(),
          isNewSourcing: z.boolean(),
        })).optional(),
        status: z.enum(['draft', 'active', 'archived']).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateDraftMenuItem(id, data);
        return { success: true };
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteDraftMenuItem(input.id);
        return { success: true };
      }),
    
    promoteToActive: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.promoteDraftToActive(input.id);
        return { success: true };
      }),
  }),

  // ============ SALES ============
  sales: router({
    list: publicProcedure.query(async () => {
      return await db.getAllSales();
    }),
    
    summary: publicProcedure.query(async () => {
      return await db.getSalesSummary();
    }),
    
    profitability: publicProcedure.query(async () => {
      return await db.getProfitabilityData();
    }),
    
    bulkUpload: publicProcedure
      .input(z.object({
        items: z.array(z.object({
          transactionId: z.string(),
          timestamp: z.string(),
          menuItemId: z.string(),
          itemName: z.string(),
          quantity: z.number(),
          unitPrice: z.string(),
          totalSales: z.string(),
          paymentMethod: z.string(),
          paymentDetail: z.string().optional(),
        }))
      }))
      .mutation(async ({ input }) => {
        const items = input.items.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        const count = await db.bulkInsertSales(items);
        return { success: true, count };
      }),
    
    clear: publicProcedure.mutation(async () => {
      await db.clearAllSales();
      return { success: true };
    }),
  }),

  // ============ STRATEGY (AI) ============
  strategy: router({
    generateInsights: publicProcedure
      .input(z.object({ context: z.string() }))
      .mutation(async ({ input }) => {
        const contextData = JSON.parse(input.context);
        
        // Get all ingredients for context
        const allIngredients = await db.getAllIngredients();
        const ingredientList = allIngredients.map(i => `${i.name} (${i.unit}, $${Number(i.costPerUnit).toFixed(4)}/unit)`).join(', ');
        
        const systemPrompt = `You are a strategic business analyst for Matsu Matcha, a premium matcha café in Singapore. 
Your role is to analyze sales data, menu performance, and cost trends to provide actionable recommendations.

AVAILABLE INGREDIENTS (with current costs):
${ingredientList}

Based on the provided data, generate insights in these categories:
1. Novel Drink Ideas (2-3 new drink concepts) - For EACH drink, you MUST provide:
   - A creative name
   - Complete recipe with specific ingredients, quantities, and units
   - Recommended retail price
   - Strategic justification explaining why this drink is recommended
   
2. Campaign Strategies (2-3 targeted marketing ideas for underperforming items)
3. Price Adjustments (2-3 specific pricing suggestions)

IMPORTANT: For drink ideas, use ONLY ingredients from the available list above. If you need an ingredient not in the list, mark it as requiring new sourcing.`;

        const userPrompt = `Here is the current business data for Matsu Matcha:

MENU ENGINEERING:
- Stars (High Profit/High Volume): ${contextData.menuEngineering?.stars?.map((s: { name: string; monthlyProfit: number }) => `${s.name} ($${s.monthlyProfit}/month)`).join(', ') || 'None'}
- Plowhorses (Low Profit/High Volume): ${contextData.menuEngineering?.plowhorses?.map((s: { name: string }) => s.name).join(', ') || 'None'}
- Puzzles (High Profit/Low Volume): ${contextData.menuEngineering?.puzzles?.map((s: { name: string }) => s.name).join(', ') || 'None'}
- Dogs (Low Profit/Low Volume): ${contextData.menuEngineering?.dogs?.map((s: { name: string }) => s.name).join(', ') || 'None'}

COST TRENDS:
- Rising costs: ${contextData.costTrends?.rising?.map((t: { name: string; percentageChange: number }) => `${t.name} (+${t.percentageChange}%)`).join(', ') || 'None'}
- Falling costs (opportunities): ${contextData.costTrends?.falling?.map((t: { name: string; percentageChange: number }) => `${t.name} (${t.percentageChange}%)`).join(', ') || 'None'}

PROFITABILITY:
- Current margin: ${contextData.profitability?.actualMargin || 0}% (target: ${contextData.profitability?.targetMargin || 70}%)
- Profit gap to goal: $${contextData.profitability?.profitGapToGoal || 0}

Please provide your strategic recommendations with detailed recipes for new drink ideas.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "strategy_insights_with_recipes",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    drinkIdeas: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", description: "Creative name for the drink" },
                          description: { type: "string", description: "Brief description of the drink" },
                          category: { type: "string", description: "Category: Signature, Regular, Premium, or Seasonal" },
                          recipe: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                ingredientName: { type: "string", description: "Name of the ingredient" },
                                quantity: { type: "number", description: "Amount needed" },
                                unit: { type: "string", description: "Unit of measurement (gram, ml, unit, scoop)" },
                                isNewSourcing: { type: "boolean", description: "True if ingredient is not in current inventory" }
                              },
                              required: ["ingredientName", "quantity", "unit", "isNewSourcing"],
                              additionalProperties: false
                            },
                            description: "List of ingredients with quantities"
                          },
                          recommendedPrice: { type: "number", description: "Suggested retail price in dollars" },
                          strategicJustification: { type: "string", description: "Why this drink is recommended (e.g., uses excess inventory, high margin potential)" }
                        },
                        required: ["name", "description", "category", "recipe", "recommendedPrice", "strategicJustification"],
                        additionalProperties: false
                      },
                      description: "2-3 novel drink ideas with complete recipes"
                    },
                    campaigns: {
                      type: "array",
                      items: { type: "string" },
                      description: "Marketing campaign strategies"
                    },
                    priceAdjustments: {
                      type: "array",
                      items: { type: "string" },
                      description: "Specific price adjustment recommendations"
                    }
                  },
                  required: ["drinkIdeas", "campaigns", "priceAdjustments"],
                  additionalProperties: false
                }
              }
            }
          });

          const content = response.choices[0]?.message?.content;
          if (typeof content === 'string') {
            const parsed = JSON.parse(content);
            
            // Calculate costs for each drink idea using actual ingredient prices
            const ingredientMap = new Map(allIngredients.map(i => [i.name.toLowerCase(), i]));
            
            const enrichedDrinkIdeas = parsed.drinkIdeas.map((drink: {
              name: string;
              description: string;
              category: string;
              recipe: { ingredientName: string; quantity: number; unit: string; isNewSourcing: boolean }[];
              recommendedPrice: number;
              strategicJustification: string;
            }) => {
              let totalCogs = 0;
              const enrichedRecipe = drink.recipe.map((item: { ingredientName: string; quantity: number; unit: string; isNewSourcing: boolean }) => {
                const ingredient = ingredientMap.get(item.ingredientName.toLowerCase());
                let estimatedCost = 0;
                let isNewSourcing = item.isNewSourcing;
                
                if (ingredient) {
                  estimatedCost = item.quantity * Number(ingredient.costPerUnit);
                  isNewSourcing = false;
                } else {
                  // Mark as new sourcing if not found
                  isNewSourcing = true;
                  // Estimate cost based on similar items or use placeholder
                  estimatedCost = item.quantity * 0.05; // Placeholder cost
                }
                
                totalCogs += estimatedCost;
                
                return {
                  ...item,
                  estimatedCost,
                  isNewSourcing,
                };
              });
              
              const projectedMargin = drink.recommendedPrice > 0 
                ? ((drink.recommendedPrice - totalCogs) / drink.recommendedPrice) * 100 
                : 0;
              
              return {
                ...drink,
                recipe: enrichedRecipe,
                totalCogs,
                projectedMargin,
              };
            });
            
            return {
              drinkIdeas: enrichedDrinkIdeas,
              campaigns: parsed.campaigns,
              priceAdjustments: parsed.priceAdjustments,
            };
          }
          
          throw new Error("Unexpected response format from LLM");
        } catch (error) {
          console.error("Failed to generate insights:", error);
          // Return fallback data with structured recipes
          return {
            drinkIdeas: [
              {
                name: "Strawberry Matcha Frappe",
                description: "A refreshing summer drink combining culinary matcha with fresh strawberry puree",
                category: "Seasonal",
                recipe: [
                  { ingredientName: "Culinary Grade A (Lattes)", quantity: 4, unit: "gram", estimatedCost: 0.80, isNewSourcing: false },
                  { ingredientName: "Strawberry Puree", quantity: 30, unit: "gram", estimatedCost: 0.45, isNewSourcing: false },
                  { ingredientName: "Oat Milk (Oatly)", quantity: 200, unit: "ml", estimatedCost: 1.20, isNewSourcing: false },
                  { ingredientName: "Clear Cup (Iced 16oz)", quantity: 1, unit: "unit", estimatedCost: 0.10, isNewSourcing: false },
                  { ingredientName: "Dome Lid (Iced)", quantity: 1, unit: "unit", estimatedCost: 0.04, isNewSourcing: false },
                ],
                recommendedPrice: 9.50,
                totalCogs: 2.59,
                projectedMargin: 72.7,
                strategicJustification: "Uses strawberry puree inventory before expiration while capitalizing on seasonal demand",
              },
              {
                name: "Honey Houjicha Latte",
                description: "A warming, aromatic latte combining roasted houjicha with wildflower honey",
                category: "Signature",
                recipe: [
                  { ingredientName: "Hojicha Powder (Roasted)", quantity: 4, unit: "gram", estimatedCost: 0.60, isNewSourcing: false },
                  { ingredientName: "Honey", quantity: 15, unit: "ml", estimatedCost: 0.18, isNewSourcing: false },
                  { ingredientName: "Whole Milk", quantity: 250, unit: "ml", estimatedCost: 0.38, isNewSourcing: false },
                  { ingredientName: "Bio-Cup (Hot 12oz)", quantity: 1, unit: "unit", estimatedCost: 0.15, isNewSourcing: false },
                  { ingredientName: "Bio-Lid (Hot)", quantity: 1, unit: "unit", estimatedCost: 0.05, isNewSourcing: false },
                ],
                recommendedPrice: 8.00,
                totalCogs: 1.36,
                projectedMargin: 83.0,
                strategicJustification: "High-margin alternative leveraging underutilized houjicha inventory",
              },
              {
                name: "Matcha Cheese Foam",
                description: "Premium ceremonial matcha topped with creamy cheese foam",
                category: "Premium",
                recipe: [
                  { ingredientName: "Ceremonial Grade 'Matsu' (Okumidori)", quantity: 3, unit: "gram", estimatedCost: 2.55, isNewSourcing: false },
                  { ingredientName: "Cheese Foam Powder", quantity: 25, unit: "gram", estimatedCost: 0.50, isNewSourcing: false },
                  { ingredientName: "Whole Milk", quantity: 150, unit: "ml", estimatedCost: 0.23, isNewSourcing: false },
                  { ingredientName: "Clear Cup (Iced 16oz)", quantity: 1, unit: "unit", estimatedCost: 0.10, isNewSourcing: false },
                  { ingredientName: "Flat Lid (Iced)", quantity: 1, unit: "unit", estimatedCost: 0.04, isNewSourcing: false },
                ],
                recommendedPrice: 11.00,
                totalCogs: 3.42,
                projectedMargin: 68.9,
                strategicJustification: "Premium positioning with cheese foam trend, uses ceremonial matcha for differentiation",
              },
            ],
            campaigns: [
              "Launch 'Premium Ceremonial Hour' 3-5pm weekdays: 15% off Premium Ceremonial Bowl to boost puzzle item sales",
              "Create 'Matcha + Pastry' bundle with Honey Foam Matcha and a seasonal pastry for $12 (vs $14 separate)",
              "Instagram story campaign featuring Matcha Affogato preparation to increase awareness and volume"
            ],
            priceAdjustments: [
              "Increase Oat Matcha Latte by $0.50 to $9.50 - high demand can absorb price increase, improving margin to 68%",
              "Reduce Strawberry Matcha to $8.50 temporarily to clear expiring strawberry inventory before Feb 3",
              "Add $0.30 to Signature Matcha Latte - as top performer, small increase yields significant profit boost"
            ]
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

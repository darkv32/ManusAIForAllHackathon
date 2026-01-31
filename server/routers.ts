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
      }))
      .mutation(async ({ input }) => {
        const { ingredientId, ...data } = input;
        await db.updateIngredient(ingredientId, data);
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
        
        const systemPrompt = `You are a strategic business analyst for Matsu Matcha, a premium matcha café in Singapore. 
Your role is to analyze sales data, menu performance, and cost trends to provide actionable recommendations.

Based on the provided data, generate insights in these three categories:
1. Novel Drink Ideas (2-3 new drink concepts using high-margin or excess-inventory ingredients)
2. Campaign Strategies (targeted marketing for underperforming but high-margin items)
3. Price Adjustments (specific pricing suggestions to improve profitability)

Be specific with numbers, ingredient names, and actionable steps. Keep each recommendation concise (1-2 sentences).`;

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

Please provide your strategic recommendations.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "strategy_insights",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    drinkIdeas: {
                      type: "array",
                      items: { type: "string" },
                      description: "2-3 novel drink ideas using available ingredients"
                    },
                    campaigns: {
                      type: "array",
                      items: { type: "string" },
                      description: "Marketing campaign strategies for puzzle items"
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
            return JSON.parse(content) as {
              drinkIdeas: string[];
              campaigns: string[];
              priceAdjustments: string[];
            };
          }
          
          throw new Error("Unexpected response format from LLM");
        } catch (error) {
          console.error("Failed to generate insights:", error);
          return {
            drinkIdeas: [
              "Strawberry Matcha Frappe: Use expiring strawberries with culinary matcha and oat milk for a refreshing summer drink ($9.50, est. 62% margin)",
              "Honey Houjicha Latte: Combine houjicha with wildflower honey for a warming, aromatic alternative ($8.00, est. 68% margin)",
              "Matcha Affogato Float: Reinvent the underperforming Affogato with vanilla ice cream and ceremonial matcha ($10.50, est. 65% margin)"
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

/**
 * Profitability & Sales Performance Dashboard
 * Enhanced with:
 * - KPIs: Actual vs Target Margin, Top Profit Contributor, Oatmilk Lift
 * - Menu Engineering Matrix (Stars, Plowhorses, Puzzles, Dogs)
 * - Ingredient Cost Trend Analysis
 * - Margin Sensitivity Table
 * - AI Strategy Generator (Gemini API)
 * - Profit Goal Setting & Gap Analysis
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  businessMetrics,
  calculateGapAnalysis,
  getStrategyContext,
  ingredientCostTrends,
  marginSensitivityData,
  menuEngineeringData,
  menuItems,
  profitabilityKPIs,
  weeklySalesData,
  type MenuEngineeringItem
} from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  DollarSign,
  Lightbulb,
  Loader2,
  Milk,
  Minus,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from 'recharts';

// Classification colors
const classificationColors = {
  star: 'oklch(0.55 0.15 85)', // Gold
  plowhorse: 'oklch(0.55 0.12 250)', // Blue
  puzzle: 'oklch(0.60 0.15 145)', // Green
  dog: 'oklch(0.60 0.12 25)' // Coral
};

const classificationLabels = {
  star: { label: 'Star', icon: Star, description: 'High Profit / High Volume' },
  plowhorse: { label: 'Plowhorse', icon: BarChart3, description: 'Low Profit / High Volume' },
  puzzle: { label: 'Puzzle', icon: Lightbulb, description: 'High Profit / Low Volume' },
  dog: { label: 'Dog', icon: AlertTriangle, description: 'Low Profit / Low Volume' }
};

// KPI Summary Cards
function KPISummary() {
  const marginGap = profitabilityKPIs.targetMargin - profitabilityKPIs.actualMargin;
  const isOnTarget = marginGap <= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Actual vs Target Margin */}
      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Gross Margin</p>
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-display font-medium mono-numbers">
                {profitabilityKPIs.actualMargin.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground mb-1">
                / {profitabilityKPIs.targetMargin}% target
              </span>
            </div>
            <Progress 
              value={(profitabilityKPIs.actualMargin / profitabilityKPIs.targetMargin) * 100} 
              className="h-2" 
            />
            <p className={cn(
              "text-xs",
              isOnTarget ? "text-green-600" : "text-amber-600"
            )}>
              {isOnTarget ? 'On target' : `${marginGap.toFixed(1)}% below target`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Profit Contributor */}
      <Card className="wabi-card border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Top Profit Contributor</p>
              <Star className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-lg font-medium truncate">
              {profitabilityKPIs.topProfitContributor.name}
            </p>
            <p className="text-2xl font-display font-medium text-green-600 mono-numbers">
              ${profitabilityKPIs.topProfitContributor.monthlyProfit.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Monthly net profit</p>
          </div>
        </CardContent>
      </Card>

      {/* Oatmilk Lift */}
      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Oatmilk Lift</p>
              <Milk className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-display font-medium mono-numbers">
              ${profitabilityKPIs.oatmilkLiftProfit.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">
              Monthly profit from milk-swap surcharges
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profit Gap */}
      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Profit Gap to Goal</p>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className={cn(
              "text-2xl font-display font-medium mono-numbers",
              profitabilityKPIs.profitGapToGoal > 0 ? "text-amber-600" : "text-green-600"
            )}>
              ${Math.abs(profitabilityKPIs.profitGapToGoal).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {profitabilityKPIs.profitGapToGoal > 0 ? 'Remaining to reach goal' : 'Exceeded goal!'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Menu Engineering Matrix
function MenuEngineeringMatrix() {
  const stars = menuEngineeringData.filter(i => i.classification === 'star');
  const plowhorses = menuEngineeringData.filter(i => i.classification === 'plowhorse');
  const puzzles = menuEngineeringData.filter(i => i.classification === 'puzzle');
  const dogs = menuEngineeringData.filter(i => i.classification === 'dog');

  const avgMargin = menuEngineeringData.reduce((sum, i) => sum + i.marginPercentage, 0) / menuEngineeringData.length;
  const avgVolume = menuEngineeringData.reduce((sum, i) => sum + i.weeklyVolume, 0) / menuEngineeringData.length;

  // Scatter plot data
  const scatterData = menuEngineeringData.map(item => ({
    name: item.name,
    volume: item.weeklyVolume,
    margin: item.marginPercentage,
    profit: item.monthlyProfit,
    classification: item.classification
  }));

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader>
        <CardTitle className="text-lg font-display">Profit vs Popularity Matrix</CardTitle>
        <CardDescription>Menu engineering classification based on margin and volume</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chart">Scatter Plot</TabsTrigger>
            <TabsTrigger value="table">Classification Table</TabsTrigger>
          </TabsList>

          <TabsContent value="chart">
            <div className="h-[350px] relative">
              {/* Quadrant labels */}
              <div className="absolute top-2 left-12 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                PUZZLES (High Margin / Low Volume)
              </div>
              <div className="absolute top-2 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                STARS (High Margin / High Volume)
              </div>
              <div className="absolute bottom-12 left-12 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                DOGS (Low Margin / Low Volume)
              </div>
              <div className="absolute bottom-12 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                PLOWHORSES (Low Margin / High Volume)
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 40, right: 20, bottom: 40, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.015 85)" />
                  {/* Average lines */}
                  <XAxis
                    type="number"
                    dataKey="volume"
                    name="Weekly Volume"
                    domain={[0, 'dataMax + 50']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="margin"
                    name="Margin %"
                    domain={[55, 75]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
                  />
                  <ZAxis type="number" dataKey="profit" range={[100, 600]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.99 0.008 85)',
                      border: '1px solid oklch(0.88 0.015 85)',
                      borderRadius: '8px'
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 space-y-1">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm">Volume: {data.volume}/week</p>
                            <p className="text-sm">Margin: {data.margin.toFixed(1)}%</p>
                            <p className="text-sm">Monthly Profit: ${data.profit.toLocaleString()}</p>
                            <Badge 
                              style={{ backgroundColor: classificationColors[data.classification as keyof typeof classificationColors] }}
                              className="text-white mt-1"
                            >
                              {classificationLabels[data.classification as keyof typeof classificationLabels].label}
                            </Badge>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Menu Items" data={scatterData}>
                    {scatterData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={classificationColors[entry.classification as keyof typeof classificationColors]} 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-border/50">
              {Object.entries(classificationLabels).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: classificationColors[key as keyof typeof classificationColors] }} 
                  />
                  <span className="text-xs">{value.label}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="table">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stars */}
              <div className="p-4 rounded-lg border-2" style={{ borderColor: classificationColors.star }}>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5" style={{ color: classificationColors.star }} />
                  <h4 className="font-medium">Stars</h4>
                  <Badge variant="secondary" className="ml-auto">{stars.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Protect & maintain quality</p>
                {stars.map(item => (
                  <div key={item.menuItemId} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm mono-numbers text-green-600">${item.monthlyProfit.toFixed(0)}</span>
                  </div>
                ))}
              </div>

              {/* Plowhorses */}
              <div className="p-4 rounded-lg border-2" style={{ borderColor: classificationColors.plowhorse }}>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-5 w-5" style={{ color: classificationColors.plowhorse }} />
                  <h4 className="font-medium">Plowhorses</h4>
                  <Badge variant="secondary" className="ml-auto">{plowhorses.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Optimize pricing or reduce costs</p>
                {plowhorses.map(item => (
                  <div key={item.menuItemId} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm mono-numbers">${item.monthlyProfit.toFixed(0)}</span>
                  </div>
                ))}
                {plowhorses.length === 0 && <p className="text-sm text-muted-foreground">None</p>}
              </div>

              {/* Puzzles */}
              <div className="p-4 rounded-lg border-2" style={{ borderColor: classificationColors.puzzle }}>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5" style={{ color: classificationColors.puzzle }} />
                  <h4 className="font-medium">Puzzles</h4>
                  <Badge variant="secondary" className="ml-auto">{puzzles.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Promote & market more</p>
                {puzzles.map(item => (
                  <div key={item.menuItemId} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm mono-numbers">${item.monthlyProfit.toFixed(0)}</span>
                  </div>
                ))}
                {puzzles.length === 0 && <p className="text-sm text-muted-foreground">None</p>}
              </div>

              {/* Dogs */}
              <div className="p-4 rounded-lg border-2" style={{ borderColor: classificationColors.dog }}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5" style={{ color: classificationColors.dog }} />
                  <h4 className="font-medium">Dogs</h4>
                  <Badge variant="secondary" className="ml-auto">{dogs.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Consider replacing or removing</p>
                {dogs.map(item => (
                  <div key={item.menuItemId} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm mono-numbers text-amber-600">${item.monthlyProfit.toFixed(0)}</span>
                  </div>
                ))}
                {dogs.length === 0 && <p className="text-sm text-muted-foreground">None</p>}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Ingredient Cost Trends
function CostTrendAnalysis() {
  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader>
        <CardTitle className="text-lg font-display">Ingredient Cost Trends</CardTitle>
        <CardDescription>3-month cost comparison with alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ingredientCostTrends.map(trend => (
            <div 
              key={trend.ingredientId}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg",
                trend.alertType === 'red' && "bg-red-50 border border-red-200",
                trend.alertType === 'green' && "bg-green-50 border border-green-200",
                trend.alertType === 'neutral' && "bg-muted/30"
              )}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{trend.name}</p>
                  {trend.alertType === 'red' && (
                    <Badge variant="destructive" className="text-xs">Rising Cost</Badge>
                  )}
                  {trend.alertType === 'green' && (
                    <Badge className="text-xs bg-green-600">Opportunity</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>${trend.currentCost.toFixed(2)}/{trend.unit}</span>
                  <span className="flex items-center gap-1">
                    {trend.costHistory.map((h, i) => (
                      <span key={h.month} className="text-xs">
                        {i > 0 && ' → '}${h.cost.toFixed(2)}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-1 text-lg font-medium mono-numbers",
                trend.percentageChange > 0 ? "text-red-600" : "text-green-600"
              )}>
                {trend.percentageChange > 0 ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                {Math.abs(trend.percentageChange).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Margin Sensitivity Table
function MarginSensitivityTable() {
  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader>
        <CardTitle className="text-lg font-display">Margin Sensitivity Analysis</CardTitle>
        <CardDescription>Impact of 10% ingredient price increase on drink margins</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium">Ingredient</th>
                <th className="text-left py-3 px-2 font-medium">Impacted Drinks</th>
                <th className="text-right py-3 px-2 font-medium">Monthly Impact</th>
              </tr>
            </thead>
            <tbody>
              {marginSensitivityData.map(item => (
                <tr key={item.ingredientId} className="border-b border-border/50">
                  <td className="py-3 px-2">
                    <p className="font-medium">{item.ingredientName}</p>
                    <p className="text-xs text-muted-foreground">${item.currentCost}/unit</p>
                  </td>
                  <td className="py-3 px-2">
                    <div className="space-y-1">
                      {item.impactedDrinks.map(drink => (
                        <div key={drink.drinkId} className="flex items-center gap-2 text-xs">
                          <span>{drink.drinkName}</span>
                          <span className="text-muted-foreground">
                            {drink.currentMargin.toFixed(1)}% → {drink.marginAfter10PercentIncrease.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="text-red-600 font-medium mono-numbers">
                      -${Math.abs(item.totalMonthlyImpact).toFixed(0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// AI Strategy Generator
function AIStrategyGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategies, setStrategies] = useState<{
    drinkIdeas: string[];
    campaigns: string[];
    priceAdjustments: string[];
  } | null>(null);

  const generateMutation = trpc.strategy.generateInsights.useMutation({
    onSuccess: (data) => {
      setStrategies(data);
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Failed to generate strategies:', error);
      setIsGenerating(false);
    }
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    const context = getStrategyContext();
    generateMutation.mutate({ context: JSON.stringify(context) });
  };

  return (
    <Card className="wabi-card animate-fade-up border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-display">AI Strategy Generator</CardTitle>
        </div>
        <CardDescription>
          Get AI-powered recommendations for new drinks, campaigns, and pricing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!strategies ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Analyze your sales data, cost trends, and menu performance to generate actionable insights
            </p>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Insights...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Novel Drink Ideas */}
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">1</span>
                Novel Drink Ideas
              </h4>
              <div className="space-y-2">
                {strategies.drinkIdeas.map((idea, i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-lg text-sm">
                    {idea}
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Strategies */}
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
                Campaign Strategies
              </h4>
              <div className="space-y-2">
                {strategies.campaigns.map((campaign, i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-lg text-sm">
                    {campaign}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Adjustments */}
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs">3</span>
                Price Adjustments
              </h4>
              <div className="space-y-2">
                {strategies.priceAdjustments.map((adjustment, i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-lg text-sm">
                    {adjustment}
                  </div>
                ))}
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Regenerate Insights
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Gap Analysis & Goal Setting
function GapAnalysisPanel() {
  const [targetProfit, setTargetProfit] = useState(businessMetrics.monthlyProfitGoal);
  const gapAnalysis = calculateGapAnalysis(targetProfit);

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader>
        <CardTitle className="text-lg font-display">Profit Goal & Gap Analysis</CardTitle>
        <CardDescription>Calculate what's needed to reach your profit target</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Goal Input */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Monthly Profit Goal (SGD):</label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">$</span>
            <Input
              type="number"
              value={targetProfit}
              onChange={(e) => setTargetProfit(Number(e.target.value))}
              className="w-32 mono-numbers"
            />
          </div>
        </div>

        {/* Current vs Target */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Current</p>
            <p className="text-xl font-display font-medium mono-numbers">
              ${gapAnalysis.currentProfit.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="text-xl font-display font-medium mono-numbers">
              ${gapAnalysis.targetProfit.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Gap</p>
            <p className={cn(
              "text-xl font-display font-medium mono-numbers",
              gapAnalysis.gap > 0 ? "text-amber-600" : "text-green-600"
            )}>
              ${gapAnalysis.gap.toLocaleString()}
            </p>
          </div>
        </div>

        {gapAnalysis.gap > 0 && (
          <>
            {/* Star Items Needed */}
            <div>
              <h4 className="font-medium mb-3">Required Star Item Sales</h4>
              <div className="space-y-2">
                {gapAnalysis.starItemsNeeded.map((item, i) => (
                  <div key={i} className="flex justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">{item.itemName}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium mono-numbers">+{item.additionalUnits} units</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        (${item.additionalRevenue.toFixed(0)} revenue)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Ingredients */}
            <div>
              <h4 className="font-medium mb-3">Required Ingredient Orders</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium">Ingredient</th>
                      <th className="text-right py-2 font-medium">Additional Qty</th>
                      <th className="text-right py-2 font-medium">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gapAnalysis.requiredIngredients.map(ing => (
                      <tr key={ing.ingredientId} className="border-b border-border/50">
                        <td className="py-2">{ing.ingredientName}</td>
                        <td className="py-2 text-right mono-numbers">{ing.additionalQty} {ing.unit}</td>
                        <td className="py-2 text-right mono-numbers">${ing.cost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {gapAnalysis.gap <= 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-green-700 font-medium">
              🎉 You've exceeded your profit goal!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Weekly Profit Trend
function ProfitTrendChart() {
  const profitData = weeklySalesData.map((week) => ({
    ...week,
    profit: week.revenue * 0.65,
    weekLabel: new Date(week.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader>
        <CardTitle className="text-lg font-display">Weekly Profit Trend</CardTitle>
        <CardDescription>Gross profit over the last 8 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={profitData}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.42 0.08 145)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.42 0.08 145)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.015 85)" vertical={false} />
              <XAxis
                dataKey="weekLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.99 0.008 85)',
                  border: '1px solid oklch(0.88 0.015 85)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Gross Profit']}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="oklch(0.42 0.08 145)"
                strokeWidth={2}
                fill="url(#profitGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Profitability() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-medium">Profitability & Sales Performance</h1>
          <p className="text-muted-foreground">
            Analyze margins, menu engineering, cost trends, and get AI-powered strategy recommendations
          </p>
        </div>

        {/* KPI Summary */}
        <KPISummary />

        {/* Menu Engineering Matrix */}
        <MenuEngineeringMatrix />

        {/* Cost Analysis Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CostTrendAnalysis />
          <MarginSensitivityTable />
        </div>

        {/* AI Strategy & Gap Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIStrategyGenerator />
          <GapAnalysisPanel />
        </div>

        {/* Profit Trend */}
        <ProfitTrendChart />
      </div>
    </DashboardLayout>
  );
}

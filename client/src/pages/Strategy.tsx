/**
 * Strategy & Recommendations Page
 * Design: Japanese Wabi-Sabi Minimalism
 * - AI-generated strategic recommendations
 * - Scenario planning interface
 * - Monthly performance review
 * - Synced with Profitability page data
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Brain,
  Calculator,
  ChevronRight,
  DollarSign,
  Lightbulb,
  Loader2,
  Megaphone,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  Utensils,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Recommendation type icons
const typeIcons: Record<string, React.ReactNode> = {
  promotion: <Megaphone className="h-5 w-5" />,
  menu: <Utensils className="h-5 w-5" />,
  upsell: <TrendingUp className="h-5 w-5" />,
  pricing: <Tag className="h-5 w-5" />
};

const typeColors: Record<string, string> = {
  promotion: 'bg-purple-100 text-purple-700',
  menu: 'bg-blue-100 text-blue-700',
  upsell: 'bg-green-100 text-green-700',
  pricing: 'bg-amber-100 text-amber-700'
};

interface StrategicRecommendation {
  id: string;
  type: 'promotion' | 'menu' | 'upsell' | 'pricing';
  title: string;
  description: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
}

// Recommendation card
function RecommendationCard({
  recommendation
}: {
  recommendation: StrategicRecommendation;
}) {
  return (
    <Card className={cn(
      'wabi-card animate-fade-up',
      recommendation.priority === 'high' && 'border-l-4 border-l-primary'
    )}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn('p-2.5 rounded-lg', typeColors[recommendation.type])}>
            {typeIcons[recommendation.type]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">{recommendation.title}</h3>
              <Badge
                variant={recommendation.priority === 'high' ? 'default' : 'outline'}
                className="text-xs"
              >
                {recommendation.priority === 'high' ? 'High Priority' : 
                 recommendation.priority === 'medium' ? 'Medium' : 'Low'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">{recommendation.impact}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Monthly performance review - uses real data
function MonthlyReview({ metrics, isLoading }: { 
  metrics: {
    monthlyProfitGoal: number;
    currentMonthProfit: number;
    lastMonthProfit: number;
    profitGrowth: number;
    avgDailyRevenue: number;
    avgDailyOrders: number;
    topSellingItem: string;
    highestMarginItem: string;
    inventoryValue: number;
    wastageThisMonth: number;
  } | undefined;
  isLoading: boolean;
}) {
  if (isLoading || !metrics) {
    return (
      <Card className="wabi-card animate-fade-up">
        <CardHeader>
          <CardTitle className="text-lg font-serif">Monthly Performance Review</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  const progress = metrics.monthlyProfitGoal > 0 
    ? (metrics.currentMonthProfit / metrics.monthlyProfitGoal) * 100 
    : 0;
  const daysInMonth = 31;
  const currentDay = new Date().getDate();
  const expectedProgress = (currentDay / daysInMonth) * 100;
  const isOnTrack = progress >= expectedProgress - 5;

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-serif">Monthly Performance Review</CardTitle>
            <CardDescription>January 2026 Progress Report</CardDescription>
          </div>
          <div className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            isOnTrack ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          )}>
            {isOnTrack ? 'On Track' : 'Needs Attention'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profit Progress */}
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Profit</p>
              <p className="text-3xl font-serif font-semibold mono-numbers">
                ${metrics.currentMonthProfit.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Goal</p>
              <p className="text-xl font-medium mono-numbers">
                ${metrics.monthlyProfitGoal.toLocaleString()}
              </p>
            </div>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-3" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{progress.toFixed(1)}% achieved</span>
            <span className="text-muted-foreground">
              ${Math.max(0, metrics.monthlyProfitGoal - metrics.currentMonthProfit).toLocaleString()} remaining
            </span>
          </div>
        </div>

        <Separator />

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">vs Last Month</p>
            <div className="flex items-center gap-2">
              {metrics.profitGrowth >= 0 ? (
                <ArrowUp className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-600" />
              )}
              <span className={cn(
                'text-lg font-semibold',
                metrics.profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {metrics.profitGrowth >= 0 ? '+' : ''}{metrics.profitGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Daily Revenue</p>
            <p className="text-lg font-semibold mono-numbers">${metrics.avgDailyRevenue.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Daily Orders</p>
            <p className="text-lg font-semibold mono-numbers">{metrics.avgDailyOrders}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Wastage This Month</p>
            <p className="text-lg font-semibold text-amber-600 mono-numbers">${metrics.wastageThisMonth.toLocaleString()}</p>
          </div>
        </div>

        <Separator />

        {/* Highlights */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Performance Highlights</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <ChevronRight className="h-4 w-4 text-primary" />
              <span>Top seller: <strong>{metrics.topSellingItem}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ChevronRight className="h-4 w-4 text-primary" />
              <span>Best margin: <strong>{metrics.highestMarginItem}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ChevronRight className="h-4 w-4 text-primary" />
              <span>Inventory value: <strong>${metrics.inventoryValue.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Scenario planning tool - uses real data
function ScenarioPlanner({ metrics, profitabilityData, isLoading }: { 
  metrics: {
    monthlyProfitGoal: number;
    currentMonthProfit: number;
    avgDailyRevenue: number;
  } | undefined;
  profitabilityData: Array<{
    menuItemId: string;
    itemName: string;
    salesPrice: number;
    cogs: number;
    margin: number;
    totalQuantity: number;
    totalRevenue: number;
    totalProfit: number;
  }> | undefined;
  isLoading: boolean;
}) {
  const [targetProfit, setTargetProfit] = useState(15000);
  const [salesIncrease, setSalesIncrease] = useState(15);
  
  const utils = trpc.useUtils();
  const setMonthlyGoalMutation = trpc.settings.setMonthlyProfitGoal.useMutation({
    onSuccess: () => {
      utils.metrics.business.invalidate();
      utils.settings.getMonthlyProfitGoal.invalidate();
      toast.success('Monthly profit goal updated');
    },
  });

  // Sync target profit with database
  useEffect(() => {
    if (metrics?.monthlyProfitGoal) {
      setTargetProfit(metrics.monthlyProfitGoal);
    }
  }, [metrics?.monthlyProfitGoal]);

  const handleTargetChange = (newTarget: number) => {
    setTargetProfit(newTarget);
    setMonthlyGoalMutation.mutate({ goal: newTarget });
  };

  if (isLoading || !metrics || !profitabilityData) {
    return (
      <Card className="wabi-card animate-fade-up">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-serif">Scenario Planner</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  // Calculate projections from real data
  const currentAvgMargin = profitabilityData.length > 0
    ? profitabilityData.reduce((sum, item) => sum + item.margin, 0) / profitabilityData.length
    : 70;
  const currentWeeklyRevenue = profitabilityData.reduce((sum, item) => sum + item.totalRevenue, 0) / 4; // Approximate weekly
  const projectedWeeklyRevenue = currentWeeklyRevenue * (1 + salesIncrease / 100);
  const projectedMonthlyProfit = projectedWeeklyRevenue * 4 * (currentAvgMargin / 100);

  // Find signature latte for scenario
  const signatureLatte = profitabilityData.find(i => i.itemName.toLowerCase().includes('signature')) 
    || profitabilityData[0];
  const latteProfit = signatureLatte ? signatureLatte.salesPrice - signatureLatte.cogs : 5;
  const additionalSignatureNeeded = Math.ceil(
    (targetProfit - metrics.currentMonthProfit) / (latteProfit * 4)
  );

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-serif">Scenario Planner</CardTitle>
        </div>
        <CardDescription>Model different scenarios to hit your profit targets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Input */}
        <div className="space-y-3">
          <Label>Target Monthly Profit</Label>
          <div className="flex items-center gap-4">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <Input
              type="number"
              value={targetProfit}
              onChange={(e) => handleTargetChange(Number(e.target.value))}
              className="mono-numbers"
            />
            {setMonthlyGoalMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        <Separator />

        {/* Scenario 1: Sales Increase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Scenario: Overall Sales Increase</Label>
            <span className="text-sm font-medium text-primary mono-numbers">{salesIncrease}%</span>
          </div>
          <Slider
            value={[salesIncrease]}
            onValueChange={(v) => setSalesIncrease(v[0])}
            min={0}
            max={50}
            step={5}
          />
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Projected Weekly Revenue</span>
              <span className="font-medium mono-numbers">${projectedWeeklyRevenue.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Projected Monthly Profit</span>
              <span className={cn(
                'font-semibold mono-numbers',
                projectedMonthlyProfit >= targetProfit ? 'text-green-600' : 'text-amber-600'
              )}>
                ${projectedMonthlyProfit.toFixed(0)}
              </span>
            </div>
            {projectedMonthlyProfit >= targetProfit ? (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                This scenario meets your target!
              </p>
            ) : (
              <p className="text-xs text-amber-600">
                Need additional ${(targetProfit - projectedMonthlyProfit).toFixed(0)} to reach target
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Scenario 2: Signature Latte Focus */}
        {signatureLatte && (
          <div className="space-y-3">
            <Label>Scenario: {signatureLatte.itemName} Push</Label>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm mb-3">
                To reach <strong className="text-primary">${targetProfit.toLocaleString()}</strong> monthly profit:
              </p>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <ArrowRight className="h-5 w-5 text-primary" />
                <span>Sell <span className="text-primary mono-numbers">{Math.max(0, additionalSignatureNeeded)}</span> more {signatureLatte.itemName}/week</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Each {signatureLatte.itemName} contributes ${latteProfit.toFixed(2)} profit
              </p>
            </div>
          </div>
        )}

        <Separator />

        {/* AI Suggestion */}
        <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm mb-1">AI Recommendation</p>
              <p className="text-sm text-muted-foreground">
                Based on current trends, focus on upselling {signatureLatte?.itemName || 'top items'} during peak hours (12-1PM, 6PM) 
                and introduce a limited-time promotion for seasonal items to clear inventory. 
                Combined, this could increase monthly profit by approximately 18%.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Menu optimization proposals - uses real data
function MenuOptimization({ profitabilityData, isLoading }: { 
  profitabilityData: Array<{
    menuItemId: string;
    itemName: string;
    margin: number;
    totalQuantity: number;
    totalRevenue: number;
    totalProfit: number;
  }> | undefined;
  isLoading: boolean;
}) {
  if (isLoading || !profitabilityData) {
    return (
      <Card className="wabi-card animate-fade-up">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-serif">Menu Optimization</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Calculate averages and find top performers for comparison
  const avgMargin = profitabilityData.reduce((sum, i) => sum + i.margin, 0) / profitabilityData.length;
  const avgVolume = profitabilityData.reduce((sum, i) => sum + Number(i.totalQuantity), 0) / profitabilityData.length;
  const maxMargin = Math.max(...profitabilityData.map(i => i.margin));
  const maxVolume = Math.max(...profitabilityData.map(i => Number(i.totalQuantity)));
  
  // Identify items needing attention with specific reasons
  // Use relative thresholds to always show some items for improvement
  const itemsNeedingAttention = profitabilityData.map(item => {
    const itemQuantity = Number(item.totalQuantity);
    const marginGap = maxMargin - item.margin;
    const volumeGap = maxVolume - itemQuantity;
    
    // Calculate relative performance scores
    const marginScore = item.margin / maxMargin; // 0-1, higher is better
    const volumeScore = itemQuantity / maxVolume; // 0-1, higher is better
    
    let reason = '';
    let priority: 'high' | 'medium' | 'low' = 'low';
    let suggestion = '';
    
    // Critical: margin below 60% or volume less than half of average
    if (item.margin < 60) {
      reason = `Low margin: ${item.margin.toFixed(1)}% (target: 60%)`;
      priority = 'high';
      suggestion = 'Review ingredient costs or increase price';
    } else if (itemQuantity < avgVolume * 0.5) {
      reason = `Low volume: ${itemQuantity} sold (avg: ${avgVolume.toFixed(0)})`;
      priority = 'high';
      suggestion = 'Consider promotion or recipe refresh';
    }
    // Medium: lowest margin items (bottom 25% relative to best)
    else if (marginScore < 0.85 && marginGap > 5) {
      reason = `Margin opportunity: ${item.margin.toFixed(1)}% vs best ${maxMargin.toFixed(1)}%`;
      priority = 'medium';
      suggestion = `Optimize recipe to gain ${marginGap.toFixed(1)}% margin`;
    }
    // Low: lowest volume items (bottom 25% relative to best)
    else if (volumeScore < 0.92 && volumeGap > 30) {
      reason = `Sales opportunity: ${itemQuantity} sold vs best ${maxVolume}`;
      priority = 'low';
      suggestion = 'Promote more or add to combo deals';
    }
    
    return { ...item, reason, priority, suggestion, needsAttention: reason !== '', marginScore, volumeScore };
  }).filter(item => item.needsAttention)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Within same priority, sort by margin score (lower first)
      return a.marginScore - b.marginScore;
    })
    .slice(0, 4);

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-serif">Menu Optimization</CardTitle>
        </div>
        <CardDescription>AI-suggested menu improvements based on real data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {itemsNeedingAttention.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Items Needing Attention</p>
              <Badge variant="outline" className="text-xs">
                {itemsNeedingAttention.length} items
              </Badge>
            </div>
            {itemsNeedingAttention.map((item) => (
              <div 
                key={item.menuItemId} 
                className={cn(
                  'p-3 rounded-lg border-l-4',
                  item.priority === 'high' ? 'bg-red-50 border-l-red-500' :
                  item.priority === 'medium' ? 'bg-amber-50 border-l-amber-500' :
                  'bg-muted/30 border-l-muted-foreground/30'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{item.itemName}</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={item.priority === 'high' ? 'destructive' : 'outline'} 
                      className="text-xs"
                    >
                      {item.priority === 'high' ? 'High Priority' : 
                       item.priority === 'medium' ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {item.reason}
                </p>
                <p className="text-xs font-medium text-primary">
                  → {item.suggestion}
                </p>
              </div>
            ))}
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">New Menu Suggestions</p>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-700">Summer Blend Matcha</span>
            </div>
            <p className="text-xs text-green-600">
              Use culinary matcha + seasonal fruits for a refreshing drink with estimated 72% margin
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-700">Matcha Cold Brew</span>
            </div>
            <p className="text-xs text-blue-600">
              Low-cost preparation with premium positioning, estimated 75% margin
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Generate dynamic recommendations based on real data
function generateRecommendations(
  metrics: { currentMonthProfit: number; monthlyProfitGoal: number; wastageThisMonth: number } | undefined,
  profitabilityData: Array<{ itemName: string; margin: number; totalQuantity: number; totalProfit: number }> | undefined
): StrategicRecommendation[] {
  if (!metrics || !profitabilityData || profitabilityData.length === 0) {
    return [];
  }

  const recommendations: StrategicRecommendation[] = [];
  
  // Find top seller
  const topSeller = [...profitabilityData].sort((a, b) => b.totalQuantity - a.totalQuantity)[0];
  
  // Find highest margin item
  const highestMargin = [...profitabilityData].sort((a, b) => b.margin - a.margin)[0];
  
  // Find lowest performer
  const lowestPerformer = [...profitabilityData].sort((a, b) => a.totalProfit - b.totalProfit)[0];

  // Recommendation 1: Push high-margin item
  if (highestMargin && highestMargin.margin > 70) {
    recommendations.push({
      id: 'rec-1',
      type: 'upsell',
      title: `Push ${highestMargin.itemName}`,
      description: `With ${highestMargin.margin.toFixed(1)}% margin, increasing sales of this item will significantly boost profits. Train staff on upselling techniques.`,
      impact: `+$${(highestMargin.totalProfit * 0.15).toFixed(0)}/week potential`,
      priority: 'high'
    });
  }

  // Recommendation 2: Address wastage
  if (metrics.wastageThisMonth > 50) {
    recommendations.push({
      id: 'rec-2',
      type: 'promotion',
      title: 'Reduce Ingredient Wastage',
      description: `$${metrics.wastageThisMonth.toFixed(0)} in potential wastage detected. Consider flash sales or bundle deals for items using near-expiry ingredients.`,
      impact: `Save $${(metrics.wastageThisMonth * 0.7).toFixed(0)} in waste`,
      priority: 'high'
    });
  }

  // Recommendation 3: Review low performer
  if (lowestPerformer && lowestPerformer.totalProfit < profitabilityData.reduce((s, i) => s + i.totalProfit, 0) / profitabilityData.length * 0.5) {
    recommendations.push({
      id: 'rec-3',
      type: 'pricing',
      title: `Review ${lowestPerformer.itemName} Pricing`,
      description: `This item is underperforming. Consider price adjustment, recipe optimization, or limited-time removal to focus on higher performers.`,
      impact: 'Improve menu efficiency',
      priority: 'medium'
    });
  }

  // Recommendation 4: Capitalize on top seller
  if (topSeller) {
    recommendations.push({
      id: 'rec-4',
      type: 'menu',
      title: `Expand ${topSeller.itemName} Line`,
      description: `Your top seller could have seasonal variants or size options to capture more revenue from existing demand.`,
      impact: `+10-15% category revenue`,
      priority: 'medium'
    });
  }

  return recommendations;
}

export default function Strategy() {
  const metricsQuery = trpc.metrics.business.useQuery();
  const profitabilityQuery = trpc.sales.profitability.useQuery();

  const recommendations = generateRecommendations(
    metricsQuery.data,
    profitabilityQuery.data
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-semibold">Strategic Insights</h1>
            <p className="text-muted-foreground">
              AI-powered recommendations and scenario planning based on real-time data
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <MonthlyReview 
              metrics={metricsQuery.data} 
              isLoading={metricsQuery.isLoading} 
            />
            <MenuOptimization 
              profitabilityData={profitabilityQuery.data} 
              isLoading={profitabilityQuery.isLoading} 
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ScenarioPlanner 
              metrics={metricsQuery.data}
              profitabilityData={profitabilityQuery.data}
              isLoading={metricsQuery.isLoading || profitabilityQuery.isLoading}
            />
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold">Action Recommendations</h2>
            <Badge variant="outline">
              {recommendations.length} suggestions
            </Badge>
          </div>
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          ) : (
            <Card className="wabi-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Upload sales and inventory data to generate personalized recommendations</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

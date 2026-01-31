/**
 * Strategy & Recommendations Page
 * Design: Japanese Wabi-Sabi Minimalism
 * - AI-generated strategic recommendations
 * - Scenario planning interface
 * - Monthly performance review
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { businessMetrics, menuItems, strategicRecommendations } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  ArrowUp,
  Brain,
  Calculator,
  ChevronRight,
  DollarSign,
  Lightbulb,
  Megaphone,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  Utensils,
  Zap
} from 'lucide-react';
import { useState } from 'react';

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

// Recommendation card
function RecommendationCard({
  recommendation
}: {
  recommendation: typeof strategicRecommendations[0];
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

// Monthly performance review
function MonthlyReview() {
  const progress = (businessMetrics.currentMonthProfit / businessMetrics.monthlyProfitGoal) * 100;
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
                ${businessMetrics.currentMonthProfit.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Goal</p>
              <p className="text-xl font-medium mono-numbers">
                ${businessMetrics.monthlyProfitGoal.toLocaleString()}
              </p>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{progress.toFixed(1)}% achieved</span>
            <span className="text-muted-foreground">
              ${(businessMetrics.monthlyProfitGoal - businessMetrics.currentMonthProfit).toLocaleString()} remaining
            </span>
          </div>
        </div>

        <Separator />

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">vs Last Month</p>
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-green-600" />
              <span className="text-lg font-semibold text-green-600">+{businessMetrics.profitGrowth}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Daily Revenue</p>
            <p className="text-lg font-semibold mono-numbers">${businessMetrics.avgDailyRevenue}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Daily Orders</p>
            <p className="text-lg font-semibold mono-numbers">{businessMetrics.avgDailyOrders}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Wastage This Month</p>
            <p className="text-lg font-semibold text-amber-600 mono-numbers">${businessMetrics.wastageThisMonth}</p>
          </div>
        </div>

        <Separator />

        {/* Highlights */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Performance Highlights</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <ChevronRight className="h-4 w-4 text-primary" />
              <span>Top seller: <strong>{businessMetrics.topSellingItem}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ChevronRight className="h-4 w-4 text-primary" />
              <span>Best margin: <strong>{businessMetrics.highestMarginItem}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ChevronRight className="h-4 w-4 text-primary" />
              <span>Inventory value: <strong>${businessMetrics.inventoryValue.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Scenario planning tool
function ScenarioPlanner() {
  const [targetProfit, setTargetProfit] = useState(15000);
  const [salesIncrease, setSalesIncrease] = useState(15);

  // Calculate projections
  const currentAvgMargin = menuItems.reduce((sum, item) => sum + item.margin, 0) / menuItems.length;
  const currentWeeklyRevenue = menuItems.reduce((sum, item) => sum + item.weeklyVolume * item.price, 0);
  const projectedWeeklyRevenue = currentWeeklyRevenue * (1 + salesIncrease / 100);
  const projectedMonthlyProfit = projectedWeeklyRevenue * 4 * (currentAvgMargin / 100);

  const signatureLatte = menuItems.find((i) => i.id === 'signature-matcha-latte')!;
  const additionalSignatureNeeded = Math.ceil(
    (targetProfit - businessMetrics.currentMonthProfit) / 
    ((signatureLatte.price - signatureLatte.cost) * 4)
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
              onChange={(e) => setTargetProfit(Number(e.target.value))}
              className="mono-numbers"
            />
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
        <div className="space-y-3">
          <Label>Scenario: Signature Latte Push</Label>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm mb-3">
              To reach <strong className="text-primary">${targetProfit.toLocaleString()}</strong> monthly profit:
            </p>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <ArrowRight className="h-5 w-5 text-primary" />
              <span>Sell <span className="text-primary mono-numbers">{additionalSignatureNeeded}</span> more Signature Lattes/week</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Each Signature Latte contributes ${(signatureLatte.price - signatureLatte.cost).toFixed(2)} profit
            </p>
          </div>
        </div>

        <Separator />

        {/* AI Suggestion */}
        <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm mb-1">AI Recommendation</p>
              <p className="text-sm text-muted-foreground">
                Based on current trends, focus on upselling Signature Lattes during peak hours (12-1PM, 6PM) 
                and introduce a limited-time promotion for Strawberry Matcha to clear inventory. 
                Combined, this could increase monthly profit by approximately 18%.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Menu optimization proposals
function MenuOptimization() {
  const lowPerformers = menuItems.filter((item) => item.trending === 'down' || item.margin < 60);

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-serif">Menu Optimization</CardTitle>
        </div>
        <CardDescription>AI-suggested menu improvements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lowPerformers.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Items Needing Attention</p>
            {lowPerformers.map((item) => (
              <div key={item.id} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.margin.toFixed(1)}% margin
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.trending === 'down' 
                    ? 'Declining sales trend - consider promotion or recipe refresh'
                    : 'Low margin - review ingredient costs or adjust pricing'}
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

export default function Strategy() {
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
              AI-powered recommendations and scenario planning for maximum profitability
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <MonthlyReview />
            <MenuOptimization />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ScenarioPlanner />
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold">Action Recommendations</h2>
            <Badge variant="outline">{strategicRecommendations.length} suggestions</Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {strategicRecommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

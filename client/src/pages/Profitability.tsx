/**
 * Profitability Analysis Page
 * Design: Japanese Wabi-Sabi Minimalism
 * - Profitability heatmap visualization
 * - Margin analysis with visual indicators
 * - Performance comparison charts
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { businessMetrics, menuItems, weeklySalesData, type MenuItem } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, DollarSign, Minus, Target, TrendingDown, TrendingUp } from 'lucide-react';
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

// Margin color scale
function getMarginColor(margin: number): string {
  if (margin >= 70) return 'oklch(0.42 0.08 145)'; // High - matcha green
  if (margin >= 65) return 'oklch(0.55 0.06 145)'; // Good - light matcha
  if (margin >= 60) return 'oklch(0.72 0.08 55)'; // Medium - terracotta
  return 'oklch(0.68 0.14 25)'; // Low - coral
}

function getMarginBadge(margin: number) {
  if (margin >= 70) return { label: 'Excellent', variant: 'default' as const };
  if (margin >= 65) return { label: 'Good', variant: 'secondary' as const };
  if (margin >= 60) return { label: 'Fair', variant: 'outline' as const };
  return { label: 'Low', variant: 'destructive' as const };
}

// Profitability Heatmap Card
function ProfitabilityHeatmap() {
  const sortedItems = [...menuItems].sort((a, b) => b.margin - a.margin);

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader>
        <CardTitle className="text-lg font-serif">Profitability Heatmap</CardTitle>
        <CardDescription>Menu items ranked by gross margin percentage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className="w-3 h-12 rounded-full"
                style={{ backgroundColor: getMarginColor(item.margin) }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{item.name}</p>
                  <Badge variant={getMarginBadge(item.margin).variant} className="text-xs">
                    {getMarginBadge(item.margin).label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>Price: ${item.price.toFixed(2)}</span>
                  <span>Cost: ${item.cost.toFixed(2)}</span>
                  <span className="flex items-center gap-1">
                    {item.trending === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                    {item.trending === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                    {item.trending === 'stable' && <Minus className="h-3 w-3 text-muted-foreground" />}
                    {item.weeklyVolume}/week
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold mono-numbers" style={{ color: getMarginColor(item.margin) }}>
                  {item.margin.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">margin</p>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'oklch(0.42 0.08 145)' }} />
            <span className="text-xs text-muted-foreground">≥70% Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'oklch(0.55 0.06 145)' }} />
            <span className="text-xs text-muted-foreground">65-70% Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'oklch(0.72 0.08 55)' }} />
            <span className="text-xs text-muted-foreground">60-65% Fair</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'oklch(0.68 0.14 25)' }} />
            <span className="text-xs text-muted-foreground">&lt;60% Low</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Volume vs Margin Scatter Plot
function VolumeMarginChart() {
  const data = menuItems.map((item) => ({
    name: item.name,
    volume: item.weeklyVolume,
    margin: item.margin,
    revenue: item.weeklyVolume * item.price
  }));

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader>
        <CardTitle className="text-lg font-serif">Volume vs Margin Analysis</CardTitle>
        <CardDescription>Identify high-performers and opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.015 85)" />
              <XAxis
                type="number"
                dataKey="volume"
                name="Weekly Volume"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
                label={{ value: 'Weekly Orders', position: 'bottom', fontSize: 12, fill: 'oklch(0.50 0.02 45)' }}
              />
              <YAxis
                type="number"
                dataKey="margin"
                name="Margin %"
                domain={[55, 75]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
                label={{ value: 'Margin %', angle: -90, position: 'insideLeft', fontSize: 12, fill: 'oklch(0.50 0.02 45)' }}
              />
              <ZAxis type="number" dataKey="revenue" range={[100, 500]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.99 0.008 85)',
                  border: '1px solid oklch(0.88 0.015 85)',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'Weekly Volume') return [value, 'Orders/Week'];
                  if (name === 'Margin %') return [`${value.toFixed(1)}%`, 'Margin'];
                  return [value, name];
                }}
                labelFormatter={(_, payload) => payload[0]?.payload?.name || ''}
              />
              <Scatter name="Menu Items" data={data}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getMarginColor(entry.margin)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Insight:</strong> Items in the top-right quadrant (high volume, high margin) 
            are your star performers. Focus promotions on items with high margin but low volume to boost profitability.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Weekly Profit Trend
function ProfitTrendChart() {
  // Calculate estimated profit (assuming 65% average margin)
  const profitData = weeklySalesData.map((week) => ({
    ...week,
    profit: week.revenue * 0.65,
    weekLabel: new Date(week.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader>
        <CardTitle className="text-lg font-serif">Weekly Profit Trend</CardTitle>
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

// Category Margin Comparison
function CategoryMarginChart() {
  const categoryData = [
    { category: 'Premium', avgMargin: 68.4, items: 2 },
    { category: 'Signature', avgMargin: 66.0, items: 2 },
    { category: 'Regular', avgMargin: 69.1, items: 3 },
    { category: 'Seasonal', avgMargin: 58.4, items: 1 }
  ];

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader>
        <CardTitle className="text-lg font-serif">Category Performance</CardTitle>
        <CardDescription>Average margin by menu category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <XAxis
                type="number"
                domain={[50, 75]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'oklch(0.35 0.02 45)' }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.99 0.008 85)',
                  border: '1px solid oklch(0.88 0.015 85)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Avg Margin']}
              />
              <Bar dataKey="avgMargin" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getMarginColor(entry.avgMargin)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Summary KPIs
function ProfitabilitySummary() {
  const avgMargin = menuItems.reduce((sum, item) => sum + item.margin, 0) / menuItems.length;
  const highestMarginItem = menuItems.reduce((max, item) => item.margin > max.margin ? item : max, menuItems[0]);
  const lowestMarginItem = menuItems.reduce((min, item) => item.margin < min.margin ? item : min, menuItems[0]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Profit</p>
              <p className="text-2xl font-serif font-semibold mono-numbers">
                ${businessMetrics.currentMonthProfit.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+{businessMetrics.profitGrowth}% vs last month</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Margin</p>
              <p className="text-2xl font-serif font-semibold mono-numbers">{avgMargin.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">Across all menu items</p>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="wabi-card border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div>
            <p className="text-sm text-muted-foreground">Highest Margin</p>
            <p className="text-lg font-medium truncate">{highestMarginItem.name}</p>
            <p className="text-2xl font-serif font-semibold text-green-600 mono-numbers">
              {highestMarginItem.margin.toFixed(1)}%
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="wabi-card border-l-4 border-l-amber-500">
        <CardContent className="p-4">
          <div>
            <p className="text-sm text-muted-foreground">Lowest Margin</p>
            <p className="text-lg font-medium truncate">{lowestMarginItem.name}</p>
            <p className="text-2xl font-serif font-semibold text-amber-600 mono-numbers">
              {lowestMarginItem.margin.toFixed(1)}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Profitability() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold">Profitability Analysis</h1>
          <p className="text-muted-foreground">
            Analyze margins, identify opportunities, and optimize your menu for maximum profit
          </p>
        </div>

        {/* Summary KPIs */}
        <ProfitabilitySummary />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfitabilityHeatmap />
          <div className="space-y-6">
            <VolumeMarginChart />
            <CategoryMarginChart />
          </div>
        </div>

        {/* Profit Trend */}
        <ProfitTrendChart />
      </div>
    </DashboardLayout>
  );
}

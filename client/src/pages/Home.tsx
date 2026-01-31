/**
 * Overview Dashboard Page
 * Design: Premium Matsu Matcha Brand
 * - Deep forest green color palette
 * - Elegant Playfair Display typography
 * - Refined shadows and subtle borders
 * - Warm cream backgrounds
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  businessMetrics,
  categoryBreakdown,
  dailySalesData,
  menuItems,
  procurementList,
  strategicRecommendations
} from '@/lib/mockData';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  DollarSign,
  Package,
  ShoppingCart,
  Target,
  TrendingUp
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Link } from 'wouter';

// KPI Card Component
function KPICard({
  title,
  value,
  change,
  changeType,
  icon,
  subtitle,
  className
}: {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <Card className={cn('wabi-card animate-fade-up', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-display font-medium mono-numbers tracking-tight">{value}</p>
            {change && (
              <div className="flex items-center gap-1.5">
                {changeType === 'positive' && <ArrowUp className="h-3.5 w-3.5 text-green-600" />}
                {changeType === 'negative' && <ArrowDown className="h-3.5 w-3.5 text-red-500" />}
                <span
                  className={cn(
                    'text-xs font-medium',
                    changeType === 'positive' && 'text-green-600',
                    changeType === 'negative' && 'text-red-500',
                    changeType === 'neutral' && 'text-muted-foreground'
                  )}
                >
                  {change}
                </span>
              </div>
            )}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Profit Goal Progress Component
function ProfitGoalCard() {
  const progress = (businessMetrics.currentMonthProfit / businessMetrics.monthlyProfitGoal) * 100;
  const remaining = businessMetrics.monthlyProfitGoal - businessMetrics.currentMonthProfit;

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display">Monthly Profit Goal</CardTitle>
          <Target className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>January 2026 Progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-display font-medium mono-numbers tracking-tight">
              ${businessMetrics.currentMonthProfit.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              of ${businessMetrics.monthlyProfitGoal.toLocaleString()} goal
            </p>
          </div>
          <p className="text-2xl font-medium text-primary mono-numbers">{progress.toFixed(1)}%</p>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">${remaining.toLocaleString()}</span> remaining
          to reach goal
        </p>
      </CardContent>
    </Card>
  );
}

// Revenue Chart Component
function RevenueChart() {
  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display">Daily Revenue</CardTitle>
        <CardDescription>Last 7 days performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySalesData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.35 0.12 145)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.35 0.12 145)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'oklch(0.50 0.02 45)' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'oklch(0.50 0.02 45)' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.99 0.008 85)',
                  border: '1px solid oklch(0.88 0.015 85)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px oklch(0.25 0.02 45 / 0.08)'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="oklch(0.35 0.12 145)"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Category Breakdown Chart
function CategoryChart() {
  const COLORS = [
    'oklch(0.35 0.12 145)',
    'oklch(0.48 0.10 145)',
    'oklch(0.60 0.08 145)',
    'oklch(0.72 0.06 145)'
  ];

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display">Sales by Category</CardTitle>
        <CardDescription>Revenue distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="revenue"
              >
                {categoryBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.99 0.008 85)',
                  border: '1px solid oklch(0.88 0.015 85)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {categoryBreakdown.map((cat, index) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm flex-1">{cat.name}</span>
                <span className="text-sm font-medium mono-numbers">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Top Performers Component
function TopPerformers() {
  const topItems = [...menuItems]
    .sort((a, b) => b.weeklyVolume - a.weeklyVolume)
    .slice(0, 5);

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display">Top Performers</CardTitle>
        <CardDescription>This week's best sellers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topItems} layout="vertical">
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'oklch(0.35 0.02 45)' }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.99 0.008 85)',
                  border: '1px solid oklch(0.88 0.015 85)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [value, 'Orders']}
              />
              <Bar dataKey="weeklyVolume" fill="oklch(0.35 0.12 145)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Urgent Alerts Component
function UrgentAlerts() {
  const urgentItems = procurementList.filter((item) => item.priority === 'urgent');
  const highPriorityRecs = strategicRecommendations.filter((rec) => rec.priority === 'high');

  return (
    <Card className="wabi-card animate-fade-up border-l-4 border-l-amber-500">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg font-display">Attention Required</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {urgentItems.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Urgent Orders</p>
            {urgentItems.map((item) => (
              <div
                key={item.itemId}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{item.itemName}</p>
                  <p className="text-xs text-muted-foreground">Order by {item.orderBy}</p>
                </div>
                <span className="text-sm font-medium text-amber-600 mono-numbers">
                  {item.orderQuantity} {item.itemId.includes('milk') ? 'L' : 'kg'}
                </span>
              </div>
            ))}
          </div>
        )}
        {highPriorityRecs.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Strategic Actions</p>
            {highPriorityRecs.slice(0, 2).map((rec) => (
              <div key={rec.id} className="py-2 border-b border-border/50 last:border-0">
                <p className="text-sm font-medium">{rec.title}</p>
                <p className="text-xs text-muted-foreground">{rec.impact}</p>
              </div>
            ))}
          </div>
        )}
        <Link href="/procurement">
          <span className="text-sm text-primary hover:underline cursor-pointer">
            View all recommendations →
          </span>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-medium tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back. Here's what's happening at Matsu Matcha today.
          </p>
        </div>

        {/* KPI Cards - Asymmetric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Today's Revenue"
            value={`$${dailySalesData[dailySalesData.length - 1].revenue.toLocaleString()}`}
            change="+5.2% vs yesterday"
            changeType="positive"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <KPICard
            title="Orders Today"
            value={dailySalesData[dailySalesData.length - 1].orders.toString()}
            change="+12 orders"
            changeType="positive"
            icon={<ShoppingCart className="h-5 w-5" />}
          />
          <KPICard
            title="Avg Order Value"
            value={`$${dailySalesData[dailySalesData.length - 1].avgOrderValue.toFixed(2)}`}
            change="Stable"
            changeType="neutral"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KPICard
            title="Inventory Value"
            value={`$${businessMetrics.inventoryValue.toLocaleString()}`}
            subtitle="Across all items"
            icon={<Package className="h-5 w-5" />}
          />
        </div>

        {/* Main Content Grid - Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - 2 cols wide */}
          <div className="lg:col-span-2 space-y-4">
            <ProfitGoalCard />
            <RevenueChart />
            <TopPerformers />
          </div>

          {/* Right Column - 1 col wide */}
          <div className="space-y-4">
            <UrgentAlerts />
            <CategoryChart />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

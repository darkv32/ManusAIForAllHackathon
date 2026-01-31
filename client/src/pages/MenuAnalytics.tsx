/**
 * Menu Analytics Page
 * Design: Japanese Wabi-Sabi Minimalism
 * - Detailed menu item performance analysis
 * - Sales patterns and trends
 * - Ingredient usage tracking
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { hourlySalesPattern, menuItems, type MenuItem } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Clock,
  Coffee,
  DollarSign,
  Filter,
  Minus,
  Search,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// Category colors
const categoryColors: Record<string, string> = {
  signature: 'oklch(0.42 0.08 145)',
  premium: 'oklch(0.55 0.06 145)',
  regular: 'oklch(0.72 0.08 55)',
  seasonal: 'oklch(0.78 0.04 145)'
};

// Menu item card
function MenuItemCard({ item }: { item: MenuItem }) {
  const weeklyRevenue = item.weeklyVolume * item.price;
  const weeklyProfit = item.weeklyVolume * (item.price - item.cost);

  return (
    <Card className="wabi-card animate-fade-up hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <Badge
              variant="outline"
              className="mt-1 capitalize"
              style={{ borderColor: categoryColors[item.category], color: categoryColors[item.category] }}
            >
              {item.category}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {item.trending === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
            {item.trending === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
            {item.trending === 'stable' && <Minus className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-lg font-semibold mono-numbers">${item.price.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Cost</p>
            <p className="text-lg font-medium mono-numbers text-muted-foreground">${item.cost.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weekly Volume</span>
            <span className="font-medium mono-numbers">{item.weeklyVolume} orders</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weekly Revenue</span>
            <span className="font-medium mono-numbers">${weeklyRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Gross Margin</span>
            <span
              className="font-semibold mono-numbers"
              style={{ color: item.margin >= 65 ? 'oklch(0.42 0.08 145)' : 'oklch(0.72 0.08 55)' }}
            >
              {item.margin.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weekly Profit</span>
            <span className="font-semibold text-primary mono-numbers">${weeklyProfit.toFixed(0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hourly sales pattern chart
function HourlySalesChart() {
  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Hourly Sales Pattern
        </CardTitle>
        <CardDescription>Average orders by hour of day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlySalesPattern}>
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.99 0.008 85)',
                  border: '1px solid oklch(0.88 0.015 85)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [value, 'Orders']}
              />
              <Bar dataKey="orders" fill="oklch(0.42 0.08 145)" radius={[4, 4, 0, 0]}>
                {hourlySalesPattern.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.orders > 80 ? 'oklch(0.42 0.08 145)' : 'oklch(0.55 0.06 145)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Peak Hours:</strong> 12PM-1PM (lunch rush) and 6PM (evening rush). 
            Consider staffing adjustments and prep timing accordingly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Category distribution chart
function CategoryDistributionChart() {
  const categoryData = [
    { name: 'Signature', value: menuItems.filter((i) => i.category === 'signature').reduce((s, i) => s + i.weeklyVolume, 0) },
    { name: 'Premium', value: menuItems.filter((i) => i.category === 'premium').reduce((s, i) => s + i.weeklyVolume, 0) },
    { name: 'Regular', value: menuItems.filter((i) => i.category === 'regular').reduce((s, i) => s + i.weeklyVolume, 0) },
    { name: 'Seasonal', value: menuItems.filter((i) => i.category === 'seasonal').reduce((s, i) => s + i.weeklyVolume, 0) }
  ];

  const COLORS = [
    'oklch(0.42 0.08 145)',
    'oklch(0.55 0.06 145)',
    'oklch(0.72 0.08 55)',
    'oklch(0.78 0.04 145)'
  ];

  return (
    <Card className="wabi-card animate-fade-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Coffee className="h-5 w-5 text-primary" />
          Category Mix
        </CardTitle>
        <CardDescription>Weekly orders by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.99 0.008 85)',
                  border: '1px solid oklch(0.88 0.015 85)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [value, 'Orders']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {categoryData.map((cat, index) => {
              const total = categoryData.reduce((s, c) => s + c.value, 0);
              const percentage = ((cat.value / total) * 100).toFixed(1);
              return (
                <div key={cat.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm flex-1">{cat.name}</span>
                  <span className="text-sm font-medium mono-numbers">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Top performers summary
function TopPerformersSummary() {
  const topByVolume = [...menuItems].sort((a, b) => b.weeklyVolume - a.weeklyVolume)[0];
  const topByMargin = [...menuItems].sort((a, b) => b.margin - a.margin)[0];
  const topByRevenue = [...menuItems].sort((a, b) => (b.weeklyVolume * b.price) - (a.weeklyVolume * a.price))[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Most Popular</p>
              <p className="font-medium">{topByVolume.name}</p>
              <p className="text-sm text-primary mono-numbers">{topByVolume.weeklyVolume} orders/week</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Highest Margin</p>
              <p className="font-medium">{topByMargin.name}</p>
              <p className="text-sm text-primary mono-numbers">{topByMargin.margin.toFixed(1)}% margin</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Top Revenue</p>
              <p className="font-medium">{topByRevenue.name}</p>
              <p className="text-sm text-primary mono-numbers">
                ${(topByRevenue.weeklyVolume * topByRevenue.price).toLocaleString()}/week
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MenuAnalytics() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('volume');

  const filteredAndSortedItems = useMemo(() => {
    let items = menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case 'volume':
        items.sort((a, b) => b.weeklyVolume - a.weeklyVolume);
        break;
      case 'margin':
        items.sort((a, b) => b.margin - a.margin);
        break;
      case 'revenue':
        items.sort((a, b) => (b.weeklyVolume * b.price) - (a.weeklyVolume * a.price));
        break;
      case 'price':
        items.sort((a, b) => b.price - a.price);
        break;
    }

    return items;
  }, [searchQuery, categoryFilter, sortBy]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold">Menu Analytics</h1>
          <p className="text-muted-foreground">
            Deep dive into menu performance, sales patterns, and item-level insights
          </p>
        </div>

        {/* Top Performers Summary */}
        <TopPerformersSummary />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HourlySalesChart />
          <CategoryDistributionChart />
        </div>

        {/* Filters */}
        <Card className="wabi-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="signature">Signature</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volume">By Volume</SelectItem>
                  <SelectItem value="margin">By Margin</SelectItem>
                  <SelectItem value="revenue">By Revenue</SelectItem>
                  <SelectItem value="price">By Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>

        {filteredAndSortedItems.length === 0 && (
          <Card className="wabi-card">
            <CardContent className="p-8 text-center">
              <Coffee className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No menu items found matching your criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

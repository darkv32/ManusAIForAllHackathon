/**
 * Inventory Management Page
 * Design: Japanese Wabi-Sabi Minimalism
 * - Clean data tables with soft styling
 * - Visual stock level indicators
 * - Category-based organization
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { inventoryItems, type InventoryItem } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { AlertTriangle, Box, Calendar, Filter, Leaf, Milk, Package, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  powder: <Sparkles className="h-4 w-4" />,
  milk: <Milk className="h-4 w-4" />,
  fruit: <Leaf className="h-4 w-4" />,
  equipment: <Package className="h-4 w-4" />,
  other: <Box className="h-4 w-4" />
};

// Stock level indicator component
function StockLevelIndicator({ item }: { item: InventoryItem }) {
  const percentage = (item.currentStock / item.maxStock) * 100;
  const isLow = item.currentStock <= item.minStock;
  const isCritical = item.currentStock < item.minStock * 0.5;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="mono-numbers">
          {item.currentStock} {item.unit}
        </span>
        <span className="text-muted-foreground text-xs">
          max {item.maxStock} {item.unit}
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn(
          'h-1.5',
          isCritical && '[&>div]:bg-red-500',
          isLow && !isCritical && '[&>div]:bg-amber-500'
        )}
      />
    </div>
  );
}

// Inventory card for grid view
function InventoryCard({ item }: { item: InventoryItem }) {
  const isLow = item.currentStock <= item.minStock;
  const isExpiringSoon = item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Card className={cn(
      'wabi-card animate-fade-up',
      isLow && 'border-l-4 border-l-amber-500'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {categoryIcons[item.category]}
            </div>
            <div>
              <h3 className="font-medium text-sm">{item.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {isLow && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs">
                Low Stock
              </Badge>
            )}
            {isExpiringSoon && (
              <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 text-xs">
                Expiring
              </Badge>
            )}
          </div>
        </div>

        <StockLevelIndicator item={item} />

        <div className="mt-4 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Cost/Unit</p>
            <p className="font-medium mono-numbers">${item.costPerUnit.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Shelf Life</p>
            <p className="font-medium capitalize">{item.shelfLife}</p>
          </div>
          {item.expiryDate && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Expires</p>
              <p className={cn(
                'font-medium',
                isExpiringSoon && 'text-red-600'
              )}>
                {new Date(item.expiryDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Inventory table row
function InventoryRow({ item }: { item: InventoryItem }) {
  const isLow = item.currentStock <= item.minStock;
  const isExpiringSoon = item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <tr className="border-b border-border/50 hover:bg-accent/30 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {categoryIcons[item.category]}
          </div>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.supplier}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge variant="outline" className="capitalize">{item.category}</Badge>
      </td>
      <td className="py-3 px-4">
        <div className="w-32">
          <StockLevelIndicator item={item} />
        </div>
      </td>
      <td className="py-3 px-4 mono-numbers">${item.costPerUnit.toFixed(2)}</td>
      <td className="py-3 px-4">
        <Badge variant={item.shelfLife === 'short' ? 'secondary' : 'outline'} className="capitalize">
          {item.shelfLife}
        </Badge>
      </td>
      <td className="py-3 px-4">
        {item.expiryDate ? (
          <span className={cn(isExpiringSoon && 'text-red-600 font-medium')}>
            {new Date(item.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-1">
          {isLow && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          {isExpiringSoon && <Calendar className="h-4 w-4 text-red-500" />}
        </div>
      </td>
    </tr>
  );
}

// Summary cards
function InventorySummary() {
  const totalValue = inventoryItems.reduce((sum, item) => sum + item.currentStock * item.costPerUnit, 0);
  const lowStockCount = inventoryItems.filter((item) => item.currentStock <= item.minStock).length;
  const expiringCount = inventoryItems.filter(
    (item) => item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Inventory Value</p>
              <p className="text-2xl font-serif font-semibold mono-numbers">${totalValue.toFixed(0)}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className={cn('wabi-card', lowStockCount > 0 && 'border-l-4 border-l-amber-500')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-serif font-semibold">{lowStockCount}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className={cn('wabi-card', expiringCount > 0 && 'border-l-4 border-l-red-500')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-serif font-semibold">{expiringCount}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-red-100 text-red-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  const categories = ['all', ...Array.from(new Set(inventoryItems.map((item) => item.category)))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-semibold">Inventory Management</h1>
            <p className="text-muted-foreground">Track stock levels and manage your ingredients</p>
          </div>
        </div>

        {/* Summary Cards */}
        <InventorySummary />

        {/* Filters and Controls */}
        <Card className="wabi-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items or suppliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'table')}>
                  <TabsList>
                    <TabsTrigger value="grid">Grid</TabsTrigger>
                    <TabsTrigger value="table">Table</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <InventoryCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Card className="wabi-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-sm">Item</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Stock Level</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Cost/Unit</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Shelf Life</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Expiry</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Alerts</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <InventoryRow key={item.id} item={item} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {filteredItems.length === 0 && (
          <Card className="wabi-card">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No items found matching your criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

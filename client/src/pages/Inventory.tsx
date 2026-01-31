/**
 * Inventory Management Page
 * Design: Japanese Wabi-Sabi Minimalism
 * - Clean data tables with soft styling
 * - Visual stock level indicators
 * - Category-based organization
 * - CSV import functionality
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseIngredientsCSV, type IngredientRecord } from '@/lib/csvParser';
import { inventoryItems as defaultInventoryItems, type InventoryItem } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Box,
  Calendar,
  FileSpreadsheet,
  Filter,
  Leaf,
  Milk,
  Package,
  Search,
  Sparkles,
  Upload,
  X
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  powder: <Sparkles className="h-4 w-4" />,
  milk: <Milk className="h-4 w-4" />,
  fruit: <Leaf className="h-4 w-4" />,
  equipment: <Package className="h-4 w-4" />,
  other: <Box className="h-4 w-4" />
};

// Convert IngredientRecord to InventoryItem format
function convertToInventoryItem(record: IngredientRecord): InventoryItem {
  return {
    id: record.ingredient_id,
    name: record.name,
    category: record.category.toLowerCase() as InventoryItem['category'],
    unit: record.unit,
    currentStock: record.current_stock,
    minStock: Math.floor(record.current_stock * 0.3), // Default min stock to 30% of current
    maxStock: Math.ceil(record.current_stock * 2), // Default max stock to 2x current
    costPerUnit: record.cost_per_unit,
    supplier: 'Imported via CSV',
    shelfLife: 'long' as const,
    expiryDate: undefined,
    lastRestocked: new Date().toISOString().split('T')[0]
  };
}

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
              {categoryIcons[item.category] || categoryIcons.other}
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
            {categoryIcons[item.category] || categoryIcons.other}
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

// Summary cards component
function InventorySummary({ items }: { items: InventoryItem[] }) {
  const totalValue = items.reduce((sum, item) => sum + item.currentStock * item.costPerUnit, 0);
  const lowStockCount = items.filter((item) => item.currentStock <= item.minStock).length;
  const expiringCount = items.filter(
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
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(defaultInventoryItems);
  const [isUsingImportedData, setIsUsingImportedData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle CSV file upload
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setIsLoading(true);
    try {
      const data = await parseIngredientsCSV(file);
      if (data.length === 0) {
        toast.error('No valid data found in CSV');
        return;
      }
      
      // Convert to InventoryItem format
      const convertedItems = data.map(convertToInventoryItem);
      setInventoryItems(convertedItems);
      setIsUsingImportedData(true);
      toast.success(`Successfully imported ${data.length} ingredients`);
    } catch (error) {
      toast.error('Failed to parse CSV file');
      console.error(error);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  // Reset to default data
  const handleResetData = useCallback(() => {
    setInventoryItems(defaultInventoryItems);
    setIsUsingImportedData(false);
    toast.info('Restored default inventory data');
  }, []);

  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter, inventoryItems]);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(inventoryItems.map((item) => item.category)))];
  }, [inventoryItems]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-semibold">Inventory Management</h1>
            <p className="text-muted-foreground">Track stock levels and manage your ingredients</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="inventory-csv-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {isLoading ? 'Importing...' : 'Import CSV'}
            </Button>
            {isUsingImportedData && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetData}
                className="gap-1 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Import Status Banner */}
        {isUsingImportedData && (
          <Card className="wabi-card bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Using Imported Data</p>
                  <p className="text-xs text-muted-foreground">
                    Showing {inventoryItems.length} ingredients from your CSV file
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleResetData}>
                  Restore Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <InventorySummary items={inventoryItems} />

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

        {/* CSV Format Help */}
        <Card className="wabi-card">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">CSV Import Format</p>
                <p className="text-xs text-muted-foreground">
                  Upload <code className="bg-muted px-1 py-0.5 rounded">ingredients.csv</code> with headers: 
                  <code className="bg-muted px-1 py-0.5 rounded ml-1">ingredient_id, name, category, unit, cost_per_unit, current_stock</code>
                </p>
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

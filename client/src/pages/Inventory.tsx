/**
 * Inventory Management Page - Refined Layout
 * Design: Premium Matsu Matcha Brand
 * - Single unified Priority Inventory table (no duplication)
 * - Search bar at top interacting with main table
 * - Summary cards showing key metrics
 * - CSV import helper moved to bottom
 * - AI-powered projections with manual-first data entry
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { parseIngredientsCSV, type IngredientRecord } from '@/lib/csvParser';
import {
  getIngredientAnalytics,
  getPriorityIngredients,
  ingredientAnalytics,
  inventoryItems as defaultInventoryItems,
  type IngredientAnalytics,
  type InventoryItem
} from '@/lib/mockData';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  ArrowUpDown,
  Box,
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  Edit3,
  FileSpreadsheet,
  Filter,
  HelpCircle,
  Leaf,
  Milk,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  Upload,
  X
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { toast } from 'sonner';

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  powder: <Sparkles className="h-4 w-4" />,
  milk: <Milk className="h-4 w-4" />,
  fruit: <Leaf className="h-4 w-4" />,
  equipment: <Package className="h-4 w-4" />,
  other: <Box className="h-4 w-4" />
};

// Urgency status colors and labels
const urgencyConfig = {
  critical: { 
    bg: 'bg-red-50', 
    text: 'text-red-700', 
    border: 'border-red-200', 
    badge: 'bg-red-100 text-red-700',
    label: 'Critical'
  },
  soon: { 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    border: 'border-amber-200', 
    badge: 'bg-amber-100 text-amber-700',
    label: 'Soon'
  },
  monitor: { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700', 
    border: 'border-emerald-200', 
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'Healthy'
  }
};

// Convert IngredientRecord to InventoryItem format
function convertToInventoryItem(record: IngredientRecord): InventoryItem {
  return {
    id: record.ingredient_id,
    name: record.name,
    category: record.category.toLowerCase() as InventoryItem['category'],
    unit: record.unit,
    currentStock: record.current_stock,
    minStock: Math.floor(record.current_stock * 0.3),
    maxStock: Math.ceil(record.current_stock * 2),
    costPerUnit: record.cost_per_unit,
    supplier: 'Imported via CSV',
    shelfLife: 'long' as const,
    expiryDate: undefined,
    lastRestocked: new Date().toISOString().split('T')[0]
  };
}

// Summary cards component - refined with clear definitions
function InventorySummary({ items }: { items: InventoryItem[] }) {
  // Total Inventory Value: sum of (current stock × cost per unit), excluding expired items
  const now = new Date();
  const totalValue = items
    .filter(item => !item.expiryDate || new Date(item.expiryDate) > now)
    .reduce((sum, item) => sum + item.currentStock * item.costPerUnit, 0);
  
  const lowStockCount = items.filter((item) => item.currentStock <= item.minStock).length;
  const expiringCount = items.filter(
    (item) => item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;
  
  // Calculate average days of stock remaining
  const itemsWithAnalytics = items.map(item => ({
    item,
    analytics: getIngredientAnalytics(item.id)
  })).filter(x => x.analytics);
  
  const avgDaysRemaining = itemsWithAnalytics.length > 0
    ? Math.round(itemsWithAnalytics.reduce((sum, x) => sum + (x.analytics?.projectedDaysRemaining || 0), 0) / itemsWithAnalytics.length)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Inventory Value</p>
              <p className="text-2xl font-display font-medium mono-numbers">${totalValue.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Cost price × stock (excl. expired)</p>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className={cn('wabi-card', lowStockCount > 0 && 'border-l-4 border-l-amber-500')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-display font-medium">{lowStockCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Below minimum threshold</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className={cn('wabi-card', expiringCount > 0 && 'border-l-4 border-l-orange-500')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-display font-medium">{expiringCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Within next 7 days</p>
            </div>
            <div className="p-2.5 rounded-lg bg-orange-100 text-orange-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Days of Stock</p>
              <p className="text-2xl font-display font-medium">{avgDaysRemaining}</p>
              <p className="text-xs text-muted-foreground mt-1">Based on usage velocity</p>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Ingredient Detail Drawer Component
function IngredientDetailDrawer({
  ingredient,
  analytics,
  isOpen,
  onClose
}: {
  ingredient: InventoryItem | null;
  analytics: IngredientAnalytics | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [currentStock, setCurrentStock] = useState(ingredient?.currentStock || 0);
  const [costPerUnit, setCostPerUnit] = useState(ingredient?.costPerUnit || 0);
  const [leadTime, setLeadTime] = useState(analytics?.leadTimeDays || 3);
  const [notes, setNotes] = useState('');

  // Reset state when ingredient changes
  useMemo(() => {
    if (ingredient) {
      setCurrentStock(ingredient.currentStock);
      setCostPerUnit(ingredient.costPerUnit);
      setLeadTime(analytics?.leadTimeDays || 3);
      setEditMode(false);
    }
  }, [ingredient, analytics]);

  if (!ingredient || !analytics) return null;

  // Generate stock timeline data
  const stockTimelineData = analytics.stockHistory.map((entry, index) => {
    return {
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: entry.stock,
    };
  });

  // Add projected future data
  const projectedData = analytics.projectedStock.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    projected: entry.stock,
  }));

  const fullTimelineData = [...stockTimelineData.slice(-7), ...projectedData];

  // Calculate expected coverage after reorder
  const expectedCoverageAfterReorder = Math.round(
    (ingredient.currentStock + analytics.recommendedReorderQty) / analytics.averageDailyUsage
  );

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <div className="overflow-y-auto">
          <DrawerHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {categoryIcons[ingredient.category]}
              </div>
              <div>
                <DrawerTitle className="font-display text-xl">{ingredient.name}</DrawerTitle>
                <DrawerDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">{ingredient.category}</Badge>
                  <span>•</span>
                  <span>{ingredient.supplier}</span>
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="p-6 space-y-6">
            {/* Stock Timeline Chart */}
            <div>
              <h3 className="font-display text-lg mb-4">Stock Timeline</h3>
              <Card className="wabi-card">
                <CardContent className="p-4">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={fullTimelineData}>
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Out of Stock', fill: '#ef4444', fontSize: 10 }} />
                        <Area type="monotone" dataKey="actual" fill="#1a472a" fillOpacity={0.2} stroke="#1a472a" strokeWidth={2} />
                        <Line type="monotone" dataKey="projected" stroke="#1a472a" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-primary" />
                      <span>Historical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-primary border-dashed border-t-2 border-primary" style={{ borderStyle: 'dashed' }} />
                      <span>Projected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Breakdown & Reorder Recommendation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Breakdown */}
              <div>
                <h3 className="font-display text-lg mb-4">Usage by Menu Item</h3>
                <Card className="wabi-card">
                  <CardContent className="p-4">
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.usageByMenuItem} layout="vertical">
                          <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                          <YAxis 
                            type="category" 
                            dataKey="menuItem" 
                            tick={{ fontSize: 10 }} 
                            tickLine={false} 
                            axisLine={false}
                            width={100}
                          />
                          <Tooltip />
                          <Bar dataKey="usage" fill="#1a472a" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reorder Recommendation */}
              <div>
                <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Reorder Recommendation
                </h3>
                <Card className="wabi-card border-l-4 border-l-primary">
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Suggested Quantity</p>
                        <p className="text-xl font-display font-medium mono-numbers">
                          {analytics.recommendedReorderQty} {ingredient.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Order By</p>
                        <p className="text-xl font-display font-medium">
                          {new Date(analytics.recommendedOrderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Lead Time</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={leadTime}
                            onChange={(e) => setLeadTime(parseInt(e.target.value) || 1)}
                            className="w-16 h-8 text-center mono-numbers"
                            min={1}
                          />
                          <span className="text-muted-foreground">days</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Coverage After Reorder</span>
                        <span className="font-medium mono-numbers">{expectedCoverageAfterReorder} days</span>
                      </div>
                    </div>

                    <Button className="w-full gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Add to Order List
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Manual Edit Controls */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg">Manual Adjustments</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                  className="gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  {editMode ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              <Card className="wabi-card">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-stock">Current Stock</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="current-stock"
                          type="number"
                          value={currentStock}
                          onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                          disabled={!editMode}
                          className="mono-numbers"
                        />
                        <span className="text-sm text-muted-foreground">{ingredient.unit}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost-per-unit">Cost per Unit</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">$</span>
                        <Input
                          id="cost-per-unit"
                          type="number"
                          step="0.01"
                          value={costPerUnit}
                          onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                          disabled={!editMode}
                          className="mono-numbers"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry-date">Expiry Date</Label>
                      <Input
                        id="expiry-date"
                        type="date"
                        defaultValue={ingredient.expiryDate}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-restocked">Last Restocked</Label>
                      <Input
                        id="last-restocked"
                        type="date"
                        defaultValue={ingredient.lastRestocked}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={!editMode}
                      placeholder="Add notes about this ingredient..."
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                  {editMode && (
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                      <Button onClick={() => {
                        setEditMode(false);
                        toast.success('Changes saved successfully');
                      }}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <DrawerFooter className="border-t">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// Sort options type
type SortField = 'name' | 'category' | 'daysRemaining' | 'currentStock' | 'value' | 'status';
type SortDirection = 'asc' | 'desc';

export default function Inventory() {
  // Use global context for inventory data persistence
  const { inventoryData, setInventoryData, resetInventoryData, isInventoryImported } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('daysRemaining');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use global inventory data
  const inventoryItems = inventoryData;

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

      const convertedItems = data.map(convertToInventoryItem);
      setInventoryData(convertedItems);
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
  }, [setInventoryData]);

  // Reset to default data
  const handleResetData = useCallback(() => {
    resetInventoryData();
    toast.info('Restored default inventory data');
  }, [resetInventoryData]);

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get urgency status for an item
  const getUrgencyStatus = (itemId: string): 'critical' | 'soon' | 'monitor' => {
    const analytics = getIngredientAnalytics(itemId);
    return analytics?.urgencyStatus || 'monitor';
  };

  // Filter and sort items - unified table sorted by urgency by default
  const filteredItems = useMemo(() => {
    let items = inventoryItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      // Status filter
      if (statusFilter !== 'all') {
        const analytics = getIngredientAnalytics(item.id);
        if (!analytics) return false;
        if (statusFilter !== analytics.urgencyStatus) return false;
      }

      return matchesSearch && matchesCategory;
    });

    // Sort items
    items.sort((a, b) => {
      const analyticsA = getIngredientAnalytics(a.id);
      const analyticsB = getIngredientAnalytics(b.id);

      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'daysRemaining':
          comparison = (analyticsA?.projectedDaysRemaining || 999) - (analyticsB?.projectedDaysRemaining || 999);
          break;
        case 'currentStock':
          comparison = a.currentStock - b.currentStock;
          break;
        case 'value':
          comparison = (a.currentStock * a.costPerUnit) - (b.currentStock * b.costPerUnit);
          break;
        case 'status':
          const statusOrder = { critical: 0, soon: 1, monitor: 2 };
          comparison = statusOrder[getUrgencyStatus(a.id)] - statusOrder[getUrgencyStatus(b.id)];
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return items;
  }, [searchQuery, categoryFilter, statusFilter, inventoryItems, sortField, sortDirection]);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(inventoryItems.map((item) => item.category)))];
  }, [inventoryItems]);

  // Get selected ingredient details
  const selectedIngredient = selectedIngredientId
    ? inventoryItems.find(i => i.id === selectedIngredientId) || null
    : null;
  const selectedAnalytics = selectedIngredientId
    ? getIngredientAnalytics(selectedIngredientId) || null
    : null;

  // Sortable column header component
  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={cn(
          "h-3 w-3 transition-colors",
          sortField === field && "text-primary"
        )} />
      </div>
    </th>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header with Search Bar at Top */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-display font-medium tracking-tight">Inventory Management</h1>
              <p className="text-muted-foreground">Track stock levels, forecast usage, and manage reorders</p>
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
              {isInventoryImported && (
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

          {/* Prominent Search Bar */}
          <Card className="wabi-card border-primary/20">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search ingredients by name, category, or supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 text-base"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px] h-11">
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-11">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="soon">Soon</SelectItem>
                      <SelectItem value="monitor">Healthy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import Status Banner */}
        {isInventoryImported && (
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

        {/* Main Priority Inventory Table - Single Unified View */}
        <Card className="wabi-card overflow-hidden border-l-4 border-l-primary">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-display">Priority Inventory</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono bg-red-50 text-red-700 border-red-200">
                  {filteredItems.filter(i => getUrgencyStatus(i.id) === 'critical').length} Critical
                </Badge>
                <Badge variant="outline" className="font-mono bg-amber-50 text-amber-700 border-amber-200">
                  {filteredItems.filter(i => getUrgencyStatus(i.id) === 'soon').length} Soon
                </Badge>
              </div>
            </div>
            <CardDescription>Sorted by urgency • Click any row for detailed analytics and manual adjustments</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border/50">
                <tr>
                  <SortableHeader field="name">Ingredient</SortableHeader>
                  <SortableHeader field="category">Category</SortableHeader>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Unit</th>
                  <SortableHeader field="currentStock">Current Stock</SortableHeader>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Daily Usage</th>
                  <SortableHeader field="daysRemaining">Days Left</SortableHeader>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Reorder Qty</th>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Order By</th>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Impacted Items</th>
                  <SortableHeader field="status">Status</SortableHeader>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const analytics = getIngredientAnalytics(item.id);
                  const urgency = getUrgencyStatus(item.id);
                  const isLow = item.currentStock <= item.minStock;
                  
                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        'border-b border-border/30 hover:bg-accent/20 transition-colors cursor-pointer',
                        urgency === 'critical' && 'bg-red-50/50',
                        urgency === 'soon' && 'bg-amber-50/30',
                        searchQuery && item.name.toLowerCase().includes(searchQuery.toLowerCase()) && 'ring-2 ring-primary/20 ring-inset'
                      )}
                      onClick={() => setSelectedIngredientId(item.id)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-primary/10 text-primary">
                            {categoryIcons[item.category]}
                          </div>
                          <span className="font-medium text-sm">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize text-xs">{item.category}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{item.unit}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          'mono-numbers text-sm font-medium',
                          isLow && 'text-amber-600'
                        )}>
                          {item.currentStock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="mono-numbers text-sm text-muted-foreground">
                          {analytics?.averageDailyUsage.toFixed(1) || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {analytics && analytics.projectedDaysRemaining <= 3 && (
                            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                          )}
                          <span className={cn(
                            'mono-numbers text-sm font-medium',
                            analytics?.projectedDaysRemaining && analytics.projectedDaysRemaining <= 3 && 'text-red-600',
                            analytics?.projectedDaysRemaining && analytics.projectedDaysRemaining <= 7 && analytics.projectedDaysRemaining > 3 && 'text-amber-600'
                          )}>
                            {analytics?.projectedDaysRemaining || '-'} days
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="mono-numbers text-sm font-medium text-primary">
                          {analytics?.recommendedReorderQty || '-'} {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">
                          {analytics?.recommendedOrderDate 
                            ? new Date(analytics.recommendedOrderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '-'
                          }
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {analytics?.usageByMenuItem.slice(0, 2).map((menuItem, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs py-0">
                              {menuItem.menuItemName.split(' ').slice(0, 2).join(' ')}
                            </Badge>
                          ))}
                          {analytics && analytics.usageByMenuItem.length > 2 && (
                            <Badge variant="outline" className="text-xs py-0">
                              +{analytics.usageByMenuItem.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={cn('text-xs', urgencyConfig[urgency].badge)}>
                          {urgencyConfig[urgency].label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredItems.length === 0 && (
          <Card className="wabi-card">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No items found matching your criteria</p>
            </CardContent>
          </Card>
        )}

        {/* CSV Format Help - Moved to Bottom as Helper Tip */}
        <Card className="wabi-card bg-muted/20 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">CSV Import Format</p>
                <p className="text-xs text-muted-foreground">
                  To import inventory data, upload a CSV file named <code className="bg-muted px-1.5 py-0.5 rounded">ingredients.csv</code> with the following headers:
                </p>
                <code className="block mt-2 text-xs bg-muted px-2 py-1.5 rounded text-muted-foreground">
                  ingredient_id, name, category, unit, cost_per_unit, current_stock
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ingredient Detail Drawer */}
      <IngredientDetailDrawer
        ingredient={selectedIngredient}
        analytics={selectedAnalytics}
        isOpen={!!selectedIngredientId}
        onClose={() => setSelectedIngredientId(null)}
      />
    </DashboardLayout>
  );
}

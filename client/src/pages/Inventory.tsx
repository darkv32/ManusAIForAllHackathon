/**
 * Inventory Management Page - Enhanced with Forecasting & Analytics
 * Design: Premium Matsu Matcha Brand
 * - Priority Ingredients to Order section
 * - Enhanced table view with analytics columns
 * - Ingredient detail drawer with charts and controls
 * - CSV import functionality preserved
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Box,
  Calendar,
  ChevronRight,
  Clock,
  Edit3,
  FileSpreadsheet,
  Filter,
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

// Urgency status colors
const urgencyColors = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
  soon: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  monitor: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' }
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

// Priority Ingredients Table Component
function PriorityIngredientsSection({ onSelectIngredient }: { onSelectIngredient: (id: string) => void }) {
  const priorityItems = getPriorityIngredients();

  return (
    <Card className="wabi-card border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-display">Priority Ingredients to Order</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono">
            {priorityItems.filter(i => i.urgencyStatus === 'critical').length} Critical
          </Badge>
        </div>
        <CardDescription>Sorted by urgency based on projected usage and stock levels</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-y border-border/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Ingredient</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Current Stock</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Days Left</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Reorder Qty</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Order By</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Impacted Items</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {priorityItems.map((item) => (
                <tr
                  key={item.ingredientId}
                  className={cn(
                    'border-b border-border/30 hover:bg-accent/20 transition-colors cursor-pointer',
                    item.urgencyStatus === 'critical' && 'bg-red-50/50'
                  )}
                  onClick={() => onSelectIngredient(item.ingredientId)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-primary/10 text-primary">
                        {categoryIcons[item.ingredient.category]}
                      </div>
                      <span className="font-medium text-sm">{item.ingredient.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="mono-numbers text-sm">
                      {item.ingredient.currentStock} {item.ingredient.unit}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {item.projectedDaysRemaining <= 3 && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                      <span className={cn(
                        'mono-numbers text-sm font-medium',
                        item.projectedDaysRemaining <= 3 && 'text-red-600',
                        item.projectedDaysRemaining <= 7 && item.projectedDaysRemaining > 3 && 'text-amber-600'
                      )}>
                        {item.projectedDaysRemaining} days
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="mono-numbers text-sm font-medium text-primary">
                      {item.recommendedReorderQty} {item.ingredient.unit}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm">
                      {new Date(item.recommendedOrderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {item.impactedMenuItems.slice(0, 2).map((menuItem, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs py-0">
                          {menuItem.split(' ').slice(0, 2).join(' ')}
                        </Badge>
                      ))}
                      {item.impactedMenuItems.length > 2 && (
                        <Badge variant="outline" className="text-xs py-0">
                          +{item.impactedMenuItems.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={cn('text-xs', urgencyColors[item.urgencyStatus].badge)}>
                      {item.urgencyStatus.charAt(0).toUpperCase() + item.urgencyStatus.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
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

// Enhanced Inventory Table Row
function EnhancedInventoryRow({
  item,
  analytics,
  onSelect
}: {
  item: InventoryItem;
  analytics?: IngredientAnalytics;
  onSelect: () => void;
}) {
  const isLow = item.currentStock <= item.minStock;
  const isExpiringSoon = item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const inventoryValue = item.currentStock * item.costPerUnit;

  return (
    <tr
      className="border-b border-border/30 hover:bg-accent/20 transition-colors cursor-pointer"
      onClick={onSelect}
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
          {analytics?.averageDailyUsage.toFixed(2) || '—'}
        </span>
      </td>
      <td className="py-3 px-4">
        {analytics ? (
          <span className={cn(
            'mono-numbers text-sm font-medium',
            analytics.projectedDaysRemaining <= 3 && 'text-red-600',
            analytics.projectedDaysRemaining <= 7 && analytics.projectedDaysRemaining > 3 && 'text-amber-600'
          )}>
            {analytics.projectedDaysRemaining} days
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        <span className="mono-numbers text-sm">${item.costPerUnit.toFixed(2)}</span>
      </td>
      <td className="py-3 px-4">
        <span className="mono-numbers text-sm">${inventoryValue.toFixed(0)}</span>
      </td>
      <td className="py-3 px-4">
        {item.expiryDate ? (
          <span className={cn('text-sm', isExpiringSoon && 'text-red-600 font-medium')}>
            {new Date(item.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground capitalize">{item.shelfLife}</span>
        )}
      </td>
      <td className="py-3 px-4">
        {analytics && (
          <Badge className={cn('text-xs', urgencyColors[analytics.urgencyStatus].badge)}>
            {analytics.urgencyStatus.charAt(0).toUpperCase() + analytics.urgencyStatus.slice(1)}
          </Badge>
        )}
      </td>
      <td className="py-3 px-4">
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </td>
    </tr>
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
  const [leadTime, setLeadTime] = useState(analytics?.leadTimeDays || 3);
  const [notes, setNotes] = useState(analytics?.notes || '');
  const [currentStock, setCurrentStock] = useState(ingredient?.currentStock || 0);
  const [costPerUnit, setCostPerUnit] = useState(ingredient?.costPerUnit || 0);

  if (!ingredient) return null;

  // Combine historical and projected data for chart
  const stockTimelineData = analytics ? [
    ...analytics.stockHistory.map(d => ({ ...d, type: 'historical' })),
    ...analytics.projectedStock.slice(1).map(d => ({ ...d, type: 'projected' }))
  ] : [];

  // Calculate expected coverage after reorder
  const expectedCoverageAfterReorder = analytics
    ? Math.round((ingredient.currentStock + analytics.recommendedReorderQty) / analytics.averageDailyUsage)
    : 0;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-4xl overflow-y-auto">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {categoryIcons[ingredient.category]}
                </div>
                <div>
                  <DrawerTitle className="font-display text-xl">{ingredient.name}</DrawerTitle>
                  <DrawerDescription className="capitalize">{ingredient.category} • {ingredient.supplier}</DrawerDescription>
                </div>
              </div>
              {analytics && (
                <Badge className={cn('text-sm', urgencyColors[analytics.urgencyStatus].badge)}>
                  {analytics.urgencyStatus.charAt(0).toUpperCase() + analytics.urgencyStatus.slice(1)}
                </Badge>
              )}
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
                      <ComposedChart data={stockTimelineData}>
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
                          tickFormatter={(value) => `${value} ${ingredient.unit}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'oklch(0.99 0.008 85)',
                            border: '1px solid oklch(0.88 0.015 85)',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number, name: string) => [
                            `${value.toFixed(2)} ${ingredient.unit}`,
                            name === 'stock' ? 'Stock Level' : name
                          ]}
                          labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        />
                        <ReferenceLine y={ingredient.minStock} stroke="oklch(0.65 0.15 30)" strokeDasharray="5 5" label={{ value: 'Min Stock', position: 'right', fontSize: 10 }} />
                        <ReferenceLine y={0} stroke="oklch(0.55 0.20 25)" strokeWidth={2} label={{ value: 'Stock Out', position: 'right', fontSize: 10, fill: 'oklch(0.55 0.20 25)' }} />
                        <Area
                          type="monotone"
                          dataKey="stock"
                          stroke="oklch(0.35 0.12 145)"
                          strokeWidth={2}
                          fill="oklch(0.35 0.12 145)"
                          fillOpacity={0.1}
                        />
                        
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-primary" />
                      <span>Historical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-primary border-dashed" style={{ borderTop: '2px dashed oklch(0.35 0.12 145)' }} />
                      <span>Projected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-amber-400" />
                      <span>Min Stock</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Breakdown */}
              <div>
                <h3 className="font-display text-lg mb-4">Usage by Menu Item</h3>
                <Card className="wabi-card">
                  <CardContent className="p-4">
                    {analytics && analytics.usageByMenuItem.length > 0 ? (
                      <div className="space-y-3">
                        {analytics.usageByMenuItem.map((usage) => (
                          <div key={usage.menuItemId} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{usage.menuItemName}</span>
                                <span className="text-xs text-muted-foreground mono-numbers">{usage.percentage.toFixed(1)}%</span>
                              </div>
                              <Progress value={usage.percentage} className="h-1.5" />
                            </div>
                            <span className="text-xs text-muted-foreground mono-numbers w-20 text-right">
                              {usage.dailyUsage.toFixed(3)}/{ingredient.unit}/day
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No usage data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Reorder Recommendation Panel */}
              <div>
                <h3 className="font-display text-lg mb-4">Reorder Recommendation</h3>
                <Card className="wabi-card">
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Suggested Quantity</p>
                        <p className="text-lg font-display font-medium text-primary mono-numbers">
                          {analytics?.recommendedReorderQty || 0} {ingredient.unit}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Order By</p>
                        <p className="text-lg font-display font-medium">
                          {analytics ? new Date(analytics.recommendedOrderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="lead-time" className="text-sm">Lead Time (days)</Label>
                        <Input
                          id="lead-time"
                          type="number"
                          value={leadTime}
                          onChange={(e) => setLeadTime(parseInt(e.target.value) || 0)}
                          className="w-20 h-8 text-right mono-numbers"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Expected Coverage After Reorder</span>
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

// Summary cards component
function InventorySummary({ items }: { items: InventoryItem[] }) {
  const totalValue = items.reduce((sum, item) => sum + item.currentStock * item.costPerUnit, 0);
  const lowStockCount = items.filter((item) => item.currentStock <= item.minStock).length;
  const expiringCount = items.filter(
    (item) => item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;
  const criticalCount = ingredientAnalytics.filter(a => a.urgencyStatus === 'critical').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Inventory Value</p>
              <p className="text-2xl font-display font-medium mono-numbers">${totalValue.toFixed(0)}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className={cn('wabi-card', criticalCount > 0 && 'border-l-4 border-l-red-500')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical Items</p>
              <p className="text-2xl font-display font-medium">{criticalCount}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
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
            </div>
            <div className="p-2.5 rounded-lg bg-orange-100 text-orange-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sort options type
type SortField = 'name' | 'daysRemaining' | 'currentStock' | 'value';
type SortDirection = 'asc' | 'desc';

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('daysRemaining');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(defaultInventoryItems);
  const [isUsingImportedData, setIsUsingImportedData] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
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

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = inventoryItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
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
        case 'daysRemaining':
          comparison = (analyticsA?.projectedDaysRemaining || 999) - (analyticsB?.projectedDaysRemaining || 999);
          break;
        case 'currentStock':
          comparison = a.currentStock - b.currentStock;
          break;
        case 'value':
          comparison = (a.currentStock * a.costPerUnit) - (b.currentStock * b.costPerUnit);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
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

        {/* Priority Ingredients Section */}
        <PriorityIngredientsSection onSelectIngredient={setSelectedIngredientId} />

        {/* Filters and Controls */}
        <Card className="wabi-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px]">
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
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="soon">Soon</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                  </SelectContent>
                </Select>
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

        {/* Enhanced Inventory Table */}
        <Card className="wabi-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                    Ingredient
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                    Unit
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('currentStock')}
                  >
                    <div className="flex items-center gap-1">
                      Current Stock
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                    Daily Usage
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('daysRemaining')}
                  >
                    <div className="flex items-center gap-1">
                      Days Left
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                    Cost/Unit
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('value')}
                  >
                    <div className="flex items-center gap-1">
                      Value
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                    Shelf Life
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <EnhancedInventoryRow
                    key={item.id}
                    item={item}
                    analytics={getIngredientAnalytics(item.id)}
                    onSelect={() => setSelectedIngredientId(item.id)}
                  />
                ))}
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

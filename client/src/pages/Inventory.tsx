/**
 * Inventory Management Page - Enhanced with Decision-Critical Insights
 * Design: Premium Matsu Matcha Brand
 * - Comprehensive ingredient detail view with risk indicators
 * - Real-time analytics from database
 * - Ingredients as single source of truth across all tabs
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
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Box,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  Edit3,
  FileSpreadsheet,
  Filter,
  Flame,
  HelpCircle,
  Leaf,
  Loader2,
  Milk,
  Package,
  Save,
  Search,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Upload,
  X
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
  sweetener: <Box className="h-4 w-4" />,
  topping: <Box className="h-4 w-4" />,
  flavoring: <Leaf className="h-4 w-4" />,
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

// Get urgency status based on days to stockout
function getUrgencyFromDays(days: number): 'critical' | 'soon' | 'monitor' {
  if (days <= 3) return 'critical';
  if (days <= 7) return 'soon';
  return 'monitor';
}

// Velocity trend icon component
function VelocityTrendIcon({ trend, className }: { trend: 'increasing' | 'stable' | 'decreasing'; className?: string }) {
  if (trend === 'increasing') {
    return <TrendingUp className={cn('text-amber-500', className)} />;
  } else if (trend === 'decreasing') {
    return <TrendingDown className={cn('text-emerald-500', className)} />;
  }
  return <ArrowUp className={cn('text-muted-foreground rotate-90', className)} />;
}

// Summary cards component
function InventorySummary({ 
  totalValue, 
  lowStockCount, 
  expiringCount, 
  avgDaysRemaining 
}: { 
  totalValue: number;
  lowStockCount: number;
  expiringCount: number;
  avgDaysRemaining: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Inventory Value</p>
              <p className="text-2xl font-display font-medium mono-numbers">${totalValue.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Cost price × stock</p>
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
              <p className="text-xs text-muted-foreground mt-1">Needs reorder soon</p>
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

// Enhanced Ingredient Detail Drawer Component
function IngredientDetailDrawer({
  ingredientId,
  isOpen,
  onClose,
  onUpdate
}: {
  ingredientId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [editedStock, setEditedStock] = useState<string>('');
  const [editedCost, setEditedCost] = useState<string>('');
  const [editedNotes, setEditedNotes] = useState<string>('');
  const [editedExpiry, setEditedExpiry] = useState<string>('');

  // Fetch analytics data
  const { data: analytics, isLoading } = trpc.ingredients.analytics.useQuery(
    { ingredientId: ingredientId || '' },
    { enabled: !!ingredientId && isOpen }
  );

  // Update mutation
  const updateMutation = trpc.ingredients.update.useMutation({
    onSuccess: () => {
      toast.success('Ingredient updated successfully');
      setEditMode(false);
      onUpdate();
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    }
  });

  // Reset edit state when ingredient changes
  useMemo(() => {
    if (analytics?.ingredient) {
      setEditedStock(String(analytics.ingredient.currentStock || 0));
      setEditedCost(String(analytics.ingredient.costPerUnit));
      setEditedNotes(analytics.ingredient.notes || '');
      setEditedExpiry(analytics.ingredient.expiryDate ? new Date(analytics.ingredient.expiryDate).toISOString().split('T')[0] : '');
      setEditMode(false);
    }
  }, [analytics]);

  const handleSave = () => {
    if (!ingredientId) return;
    
    updateMutation.mutate({
      ingredientId,
      currentStock: editedStock,
      costPerUnit: editedCost,
      notes: editedNotes,
      expiryDate: editedExpiry || undefined,
    });
  };

  if (!ingredientId) return null;

  const ingredient = analytics?.ingredient;
  const urgency = analytics ? getUrgencyFromDays(analytics.daysToStockout) : 'monitor';

  // Prepare chart data
  const stockTimelineData = analytics ? [
    ...analytics.stockHistory.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: entry.stock,
      projected: null as number | null,
    })),
    ...analytics.projectedStock.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: null as number | null,
      projected: entry.stock,
    }))
  ] : [];

  const usageChartData = analytics?.usageByMenuItem.map(item => ({
    name: item.menuItemName.length > 20 ? item.menuItemName.substring(0, 20) + '...' : item.menuItemName,
    usage: item.totalUsage,
    percentage: item.percentageOfTotal,
  })) || [];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[92vh]">
        <div className="overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : analytics && ingredient ? (
            <>
              <DrawerHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {categoryIcons[ingredient.category.toLowerCase()] || <Box className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <DrawerTitle className="font-display text-xl">{ingredient.name}</DrawerTitle>
                    <DrawerDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">{ingredient.category}</Badge>
                      <span>•</span>
                      <span>{ingredient.unit}</span>
                      {ingredient.supplier && (
                        <>
                          <span>•</span>
                          <span>{ingredient.supplier}</span>
                        </>
                      )}
                    </DrawerDescription>
                  </div>
                  <Badge className={cn('text-sm', urgencyConfig[urgency].badge)}>
                    {urgencyConfig[urgency].label}
                  </Badge>
                </div>
              </DrawerHeader>

              <div className="p-6 space-y-6">
                {/* Key Risk & Status Indicators */}
                <div>
                  <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Key Risk Indicators
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className={cn(
                      'wabi-card',
                      analytics.daysToStockout <= 3 && 'border-l-4 border-l-red-500',
                      analytics.daysToStockout <= 7 && analytics.daysToStockout > 3 && 'border-l-4 border-l-amber-500'
                    )}>
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Days to Stockout</p>
                        <p className={cn(
                          'text-2xl font-display font-medium mono-numbers',
                          analytics.daysToStockout <= 3 && 'text-red-600',
                          analytics.daysToStockout <= 7 && analytics.daysToStockout > 3 && 'text-amber-600'
                        )}>
                          {analytics.daysToStockout > 100 ? '100+' : analytics.daysToStockout}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {analytics.projectedStockoutDate 
                            ? `Est. ${new Date(analytics.projectedStockoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                            : 'No stockout projected'
                          }
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="wabi-card">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Avg Daily Usage</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-display font-medium mono-numbers">
                            {analytics.averageDailyUsage.toFixed(1)}
                          </p>
                          <VelocityTrendIcon trend={analytics.velocityTrend} className="h-4 w-4" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {ingredient.unit}/day • {analytics.velocityTrend === 'increasing' ? '↑' : analytics.velocityTrend === 'decreasing' ? '↓' : '→'} {Math.abs(analytics.velocityChangePercent).toFixed(0)}% WoW
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="wabi-card">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Inventory Value</p>
                        <p className="text-2xl font-display font-medium mono-numbers">
                          ${analytics.inventoryValueRemaining.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Number(ingredient.currentStock).toFixed(1)} {ingredient.unit} remaining
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="wabi-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-1 mb-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          <p className="text-xs text-muted-foreground">Cost Burn Rate</p>
                        </div>
                        <p className="text-2xl font-display font-medium mono-numbers">
                          ${analytics.costBurnRatePerDay.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">per day consumed</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Stock Timeline Chart */}
                <div>
                  <h3 className="font-display text-lg mb-4">Stock Timeline</h3>
                  <Card className="wabi-card">
                    <CardContent className="p-4">
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={stockTimelineData}>
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'oklch(0.99 0.008 85)',
                                border: '1px solid oklch(0.88 0.015 85)',
                                borderRadius: '8px',
                              }}
                            />
                            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                            <Area 
                              type="monotone" 
                              dataKey="actual" 
                              fill="#1a472a" 
                              fillOpacity={0.2} 
                              stroke="#1a472a" 
                              strokeWidth={2}
                              name="Historical"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="projected" 
                              stroke="#1a472a" 
                              strokeWidth={2} 
                              strokeDasharray="5 5" 
                              dot={false}
                              name="Projected"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-primary" />
                          <span>Historical</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-primary" style={{ borderTop: '2px dashed' }} />
                          <span>Projected (estimate based on recent sales)</span>
                        </div>
                      </div>
                      {analytics.projectedStockoutDate && (
                        <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm text-red-700 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Projected stockout: {new Date(analytics.projectedStockoutDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Consumption Insights & Reorder Recommendation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Consumption Insights */}
                  <div>
                    <h3 className="font-display text-lg mb-4">Consumption Insights</h3>
                    <Card className="wabi-card">
                      <CardContent className="p-4 space-y-4">
                        {/* Velocity Trend */}
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <VelocityTrendIcon trend={analytics.velocityTrend} className="h-5 w-5" />
                            <span className="text-sm font-medium">Usage Velocity</span>
                          </div>
                          <Badge variant={
                            analytics.velocityTrend === 'increasing' ? 'destructive' : 
                            analytics.velocityTrend === 'decreasing' ? 'default' : 'secondary'
                          }>
                            {analytics.velocityTrend === 'increasing' ? 'Increasing' : 
                             analytics.velocityTrend === 'decreasing' ? 'Decreasing' : 'Stable'}
                            {' '}{Math.abs(analytics.velocityChangePercent).toFixed(0)}%
                          </Badge>
                        </div>

                        {/* Top Contributing Menu Items */}
                        <div>
                          <p className="text-sm font-medium mb-3">Top Contributing Menu Items</p>
                          {usageChartData.length > 0 ? (
                            <div className="h-[150px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={usageChartData} layout="vertical">
                                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                  <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    tick={{ fontSize: 10 }} 
                                    tickLine={false} 
                                    axisLine={false}
                                    width={120}
                                  />
                                  <Tooltip 
                                    formatter={(value: number, name: string) => [
                                      name === 'usage' ? `${value.toFixed(1)} ${ingredient.unit}` : `${value.toFixed(1)}%`,
                                      name === 'usage' ? 'Usage' : 'Share'
                                    ]}
                                  />
                                  <Bar dataKey="usage" fill="#1a472a" radius={[0, 4, 4, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No menu item usage data available
                            </p>
                          )}
                        </div>

                        {/* Usage breakdown list */}
                        {analytics.usageByMenuItem.length > 0 && (
                          <div className="space-y-2">
                            {analytics.usageByMenuItem.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground truncate max-w-[60%]">{item.menuItemName}</span>
                                <span className="mono-numbers font-medium">{item.percentageOfTotal.toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        )}
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

                        {/* Rationale */}
                        <div className="p-3 bg-primary/5 rounded-lg">
                          <p className="text-xs font-medium text-primary mb-1">Why this recommendation?</p>
                          <p className="text-sm text-muted-foreground">{analytics.reorderRationale}</p>
                        </div>

                        {/* Impact Note */}
                        <div className={cn(
                          'p-3 rounded-lg',
                          urgency === 'critical' && 'bg-red-50 border border-red-200',
                          urgency === 'soon' && 'bg-amber-50 border border-amber-200',
                          urgency === 'monitor' && 'bg-emerald-50 border border-emerald-200'
                        )}>
                          <p className={cn(
                            'text-xs font-medium mb-1',
                            urgency === 'critical' && 'text-red-700',
                            urgency === 'soon' && 'text-amber-700',
                            urgency === 'monitor' && 'text-emerald-700'
                          )}>
                            {urgency === 'critical' ? '⚠️ Impact if not reordered' : 
                             urgency === 'soon' ? '⏰ Action needed' : '✓ Status'}
                          </p>
                          <p className={cn(
                            'text-sm',
                            urgency === 'critical' && 'text-red-600',
                            urgency === 'soon' && 'text-amber-600',
                            urgency === 'monitor' && 'text-emerald-600'
                          )}>
                            {analytics.inactionImpact}
                          </p>
                        </div>

                        <Button className="w-full gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Add to Order List
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Manual Controls */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg">Manual Adjustments</h3>
                    {!editMode ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditMode(true)}
                        className="gap-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditMode(false);
                            setEditedStock(String(ingredient.currentStock || 0));
                            setEditedCost(String(ingredient.costPerUnit));
                            setEditedNotes(ingredient.notes || '');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={updateMutation.isPending}
                          className="gap-2"
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                  <Card className="wabi-card">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-4">
                        All AI recommendations are advisory. You can manually adjust values below.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-stock">Current Stock</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="current-stock"
                              type="number"
                              step="0.01"
                              value={editedStock}
                              onChange={(e) => setEditedStock(e.target.value)}
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
                              step="0.0001"
                              value={editedCost}
                              onChange={(e) => setEditedCost(e.target.value)}
                              disabled={!editMode}
                              className="mono-numbers"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Changes update all menu item costs
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiry-date">Expiry Date</Label>
                          <Input
                            id="expiry-date"
                            type="date"
                            value={editedExpiry}
                            onChange={(e) => setEditedExpiry(e.target.value)}
                            disabled={!editMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lead-time">Lead Time</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="lead-time"
                              type="number"
                              value={ingredient.leadTimeDays || 3}
                              disabled={!editMode}
                              className="mono-numbers"
                            />
                            <span className="text-sm text-muted-foreground">days</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={editedNotes}
                          onChange={(e) => setEditedNotes(e.target.value)}
                          disabled={!editMode}
                          placeholder="Add notes about this ingredient (supplier info, quality notes, etc.)..."
                          className="resize-none"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No data available for this ingredient
            </div>
          )}

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
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('daysRemaining');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch ingredients from database
  const { data: ingredients, isLoading: ingredientsLoading, refetch: refetchIngredients } = trpc.ingredients.list.useQuery();
  
  // Fetch all analytics
  const { data: allAnalytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = trpc.ingredients.allAnalytics.useQuery();

  // Bulk upload mutation
  const bulkUploadMutation = trpc.ingredients.bulkUpload.useMutation({
    onSuccess: (result) => {
      toast.success(`Successfully imported ${result.count} ingredients`);
      refetchIngredients();
      refetchAnalytics();
    },
    onError: (error) => {
      toast.error(`Failed to import: ${error.message}`);
    }
  });

  // Handle CSV file upload
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const items = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const record: Record<string, string> = {};
        headers.forEach((h, i) => {
          record[h] = values[i] || '';
        });
        
        return {
          ingredientId: record['ingredient_id'] || record['ingredientid'] || `ING_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: record['name'] || record['ingredient_name'] || '',
          category: record['category'] || 'other',
          unit: record['unit'] || 'unit',
          costPerUnit: record['cost_per_unit'] || record['costperunit'] || '0',
          currentStock: record['current_stock'] || record['currentstock'] || '0',
        };
      }).filter(item => item.name);

      if (items.length === 0) {
        toast.error('No valid data found in CSV');
        return;
      }

      bulkUploadMutation.mutate({ items });
    } catch (error) {
      toast.error('Failed to parse CSV file');
      console.error(error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [bulkUploadMutation]);

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Create analytics map for quick lookup
  type AnalyticsItem = NonNullable<typeof allAnalytics>[number];
  const analyticsMap = useMemo(() => {
    const map = new Map<string, AnalyticsItem>();
    if (allAnalytics) {
      for (const a of allAnalytics) {
        map.set(a.ingredientId, a);
      }
    }
    return map;
  }, [allAnalytics]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!ingredients || !allAnalytics) {
      return { totalValue: 0, lowStockCount: 0, expiringCount: 0, avgDaysRemaining: 0 };
    }

    const now = new Date();
    let totalValue = 0;
    let lowStockCount = 0;
    let expiringCount = 0;
    let totalDays = 0;
    let countWithDays = 0;

    for (const ing of ingredients) {
      const stock = Number(ing.currentStock) || 0;
      const cost = Number(ing.costPerUnit) || 0;
      totalValue += stock * cost;

      const analytics = analyticsMap.get(ing.ingredientId);
      if (analytics) {
        if (analytics.daysToStockout <= 7) {
          lowStockCount++;
        }
        totalDays += analytics.daysToStockout;
        countWithDays++;
      }

      if (ing.expiryDate && new Date(ing.expiryDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        expiringCount++;
      }
    }

    return {
      totalValue,
      lowStockCount,
      expiringCount,
      avgDaysRemaining: countWithDays > 0 ? Math.round(totalDays / countWithDays) : 0,
    };
  }, [ingredients, allAnalytics, analyticsMap]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    if (!ingredients) return [];

    let items = ingredients.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();

      // Status filter
      if (statusFilter !== 'all') {
        const analytics = analyticsMap.get(item.ingredientId);
        if (!analytics) return false;
        const urgency = getUrgencyFromDays(analytics.daysToStockout);
        if (statusFilter !== urgency) return false;
      }

      return matchesSearch && matchesCategory;
    });

    // Sort items
    items.sort((a, b) => {
      const analyticsA = analyticsMap.get(a.ingredientId);
      const analyticsB = analyticsMap.get(b.ingredientId);

      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'daysRemaining':
          comparison = (analyticsA?.daysToStockout || 999) - (analyticsB?.daysToStockout || 999);
          break;
        case 'currentStock':
          comparison = Number(a.currentStock) - Number(b.currentStock);
          break;
        case 'value':
          comparison = (Number(a.currentStock) * Number(a.costPerUnit)) - (Number(b.currentStock) * Number(b.costPerUnit));
          break;
        case 'status':
          const statusOrder = { critical: 0, soon: 1, monitor: 2 };
          const urgencyA = analyticsA ? getUrgencyFromDays(analyticsA.daysToStockout) : 'monitor';
          const urgencyB = analyticsB ? getUrgencyFromDays(analyticsB.daysToStockout) : 'monitor';
          comparison = statusOrder[urgencyA] - statusOrder[urgencyB];
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return items;
  }, [searchQuery, categoryFilter, statusFilter, ingredients, sortField, sortDirection, analyticsMap]);

  const categories = useMemo(() => {
    if (!ingredients) return ['all'];
    return ['all', ...Array.from(new Set(ingredients.map((item) => item.category.toLowerCase())))];
  }, [ingredients]);

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

  const isLoading = ingredientsLoading || analyticsLoading;

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
                disabled={bulkUploadMutation.isPending}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {bulkUploadMutation.isPending ? 'Importing...' : 'Import CSV'}
              </Button>
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

        {/* Summary Cards */}
        <InventorySummary 
          totalValue={summaryMetrics.totalValue}
          lowStockCount={summaryMetrics.lowStockCount}
          expiringCount={summaryMetrics.expiringCount}
          avgDaysRemaining={summaryMetrics.avgDaysRemaining}
        />

        {/* Main Priority Inventory Table */}
        <Card className="wabi-card overflow-hidden border-l-4 border-l-primary">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-display">Priority Inventory</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono bg-red-50 text-red-700 border-red-200">
                  {filteredItems.filter(i => {
                    const a = analyticsMap.get(i.ingredientId);
                    return a && getUrgencyFromDays(a.daysToStockout) === 'critical';
                  }).length} Critical
                </Badge>
                <Badge variant="outline" className="font-mono bg-amber-50 text-amber-700 border-amber-200">
                  {filteredItems.filter(i => {
                    const a = analyticsMap.get(i.ingredientId);
                    return a && getUrgencyFromDays(a.daysToStockout) === 'soon';
                  }).length} Soon
                </Badge>
              </div>
            </div>
            <CardDescription>Sorted by urgency • Click any row for detailed analytics and manual adjustments</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
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
                    <SortableHeader field="status">Status</SortableHeader>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const analytics = analyticsMap.get(item.ingredientId);
                    const urgency = analytics ? getUrgencyFromDays(analytics.daysToStockout) : 'monitor';
                    
                    return (
                      <tr
                        key={item.ingredientId}
                        className={cn(
                          'border-b border-border/30 hover:bg-accent/20 transition-colors cursor-pointer',
                          urgency === 'critical' && 'bg-red-50/50',
                          urgency === 'soon' && 'bg-amber-50/30',
                        )}
                        onClick={() => setSelectedIngredientId(item.ingredientId)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-primary/10 text-primary">
                              {categoryIcons[item.category.toLowerCase()] || <Box className="h-4 w-4" />}
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
                          <span className="mono-numbers text-sm font-medium">
                            {Number(item.currentStock).toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="mono-numbers text-sm text-muted-foreground">
                            {analytics?.averageDailyUsage.toFixed(1) || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {analytics && analytics.daysToStockout <= 3 && (
                              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                            )}
                            <span className={cn(
                              'mono-numbers text-sm font-medium',
                              analytics?.daysToStockout && analytics.daysToStockout <= 3 && 'text-red-600',
                              analytics?.daysToStockout && analytics.daysToStockout <= 7 && analytics.daysToStockout > 3 && 'text-amber-600'
                            )}>
                              {analytics ? (analytics.daysToStockout > 100 ? '100+' : analytics.daysToStockout) : '-'} days
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
            )}
          </div>
        </Card>

        {filteredItems.length === 0 && !isLoading && (
          <Card className="wabi-card">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No items found matching your criteria</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or import ingredients via CSV</p>
            </CardContent>
          </Card>
        )}

        {/* CSV Format Help */}
        <Card className="wabi-card bg-muted/20 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">CSV Import Format</p>
                <p className="text-xs text-muted-foreground">
                  To import inventory data, upload a CSV file with the following headers:
                </p>
                <code className="block mt-2 text-xs bg-muted px-2 py-1.5 rounded text-muted-foreground">
                  ingredient_id, name, category, unit, cost_per_unit, current_stock
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Note:</strong> Ingredients serve as the single source of truth. Changes to cost per unit will automatically update all menu item costs and profitability calculations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ingredient Detail Drawer */}
      <IngredientDetailDrawer
        ingredientId={selectedIngredientId}
        isOpen={!!selectedIngredientId}
        onClose={() => setSelectedIngredientId(null)}
        onUpdate={() => {
          refetchIngredients();
          refetchAnalytics();
        }}
      />
    </DashboardLayout>
  );
}

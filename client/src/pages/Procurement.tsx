/**
 * Procurement / Order Command Page
 * Design: Japanese Wabi-Sabi Minimalism
 * - Clear order list with priority indicators
 * - Actionable procurement recommendations
 * - Timeline-based ordering schedule
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { inventoryItems, procurementList, type ProcurementItem } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ClipboardList,
  Download,
  Package,
  Printer,
  ShoppingCart,
  Truck
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Priority badge component
function PriorityBadge({ priority }: { priority: 'urgent' | 'normal' | 'low' }) {
  const config = {
    urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 border-red-200' },
    normal: { label: 'Normal', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    low: { label: 'Low', className: 'bg-green-100 text-green-700 border-green-200' }
  };

  return (
    <Badge variant="outline" className={cn('text-xs', config[priority].className)}>
      {config[priority].label}
    </Badge>
  );
}

// Order item card
function OrderItemCard({
  item,
  checked,
  onToggle
}: {
  item: ProcurementItem;
  checked: boolean;
  onToggle: () => void;
}) {
  const inventoryItem = inventoryItems.find((inv) => inv.id === item.itemId);
  const stockPercentage = inventoryItem
    ? (item.currentStock / inventoryItem.maxStock) * 100
    : 0;

  return (
    <Card className={cn(
      'wabi-card transition-all duration-300',
      checked && 'opacity-60 bg-muted/50',
      item.priority === 'urgent' && !checked && 'border-l-4 border-l-red-500'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox
            checked={checked}
            onCheckedChange={onToggle}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className={cn('font-medium', checked && 'line-through')}>{item.itemName}</h3>
              <PriorityBadge priority={item.priority} />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
              <div>
                <p className="text-muted-foreground text-xs">Current Stock</p>
                <p className="font-medium mono-numbers">
                  {item.currentStock} {inventoryItem?.unit || 'units'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Projected Need</p>
                <p className="font-medium mono-numbers">
                  {item.projectedNeed} {inventoryItem?.unit || 'units'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Order Quantity</p>
                <p className="font-semibold text-primary mono-numbers">
                  {item.orderQuantity} {inventoryItem?.unit || 'units'}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Stock Level</span>
                <span className="text-muted-foreground">{stockPercentage.toFixed(0)}%</span>
              </div>
              <Progress
                value={stockPercentage}
                className={cn(
                  'h-1.5',
                  stockPercentage < 30 && '[&>div]:bg-red-500',
                  stockPercentage >= 30 && stockPercentage < 50 && '[&>div]:bg-amber-500'
                )}
              />
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Order by <strong className="text-foreground">{item.orderBy}</strong></span>
              {inventoryItem && (
                <>
                  <span className="mx-1">•</span>
                  <span>Supplier: {inventoryItem.supplier}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Order summary card
function OrderSummary({ checkedItems }: { checkedItems: string[] }) {
  const pendingItems = procurementList.filter((item) => !checkedItems.includes(item.itemId));
  const urgentCount = pendingItems.filter((item) => item.priority === 'urgent').length;
  const totalItems = procurementList.length;
  const completedItems = checkedItems.length;

  return (
    <Card className="wabi-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium">{completedItems}/{totalItems} items</span>
        </div>
        <Progress value={(completedItems / totalItems) * 100} className="h-2" />

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Urgent Items</span>
            </div>
            <span className="font-medium text-red-600">{urgentCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm">Normal Priority</span>
            </div>
            <span className="font-medium">
              {pendingItems.filter((i) => i.priority === 'normal').length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">Completed</span>
            </div>
            <span className="font-medium text-green-600">{completedItems}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Button className="w-full" onClick={() => toast.success('Order list exported!')}>
            <Download className="h-4 w-4 mr-2" />
            Export Order List
          </Button>
          <Button variant="outline" className="w-full" onClick={() => toast.info('Printing order list...')}>
            <Printer className="h-4 w-4 mr-2" />
            Print Order List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Order timeline
function OrderTimeline() {
  const sortedByDate = [...procurementList].sort(
    (a, b) => new Date(a.orderBy).getTime() - new Date(b.orderBy).getTime()
  );

  const groupedByDate = sortedByDate.reduce((acc, item) => {
    if (!acc[item.orderBy]) {
      acc[item.orderBy] = [];
    }
    acc[item.orderBy].push(item);
    return acc;
  }, {} as Record<string, ProcurementItem[]>);

  return (
    <Card className="wabi-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Order Timeline
        </CardTitle>
        <CardDescription>Upcoming order deadlines</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, items], index) => {
              const isToday = new Date(date).toDateString() === new Date().toDateString();
              const isTomorrow = new Date(date).toDateString() === 
                new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();

              return (
                <div key={date} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className={cn(
                    'absolute left-2.5 w-3 h-3 rounded-full border-2 bg-background',
                    items.some((i) => i.priority === 'urgent') 
                      ? 'border-red-500' 
                      : 'border-primary'
                  )} />

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">
                        {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : 
                          new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                      </span>
                      {(isToday || isTomorrow) && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                          {isToday ? 'Due Today' : 'Due Tomorrow'}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.itemId}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{item.itemName}</span>
                          </div>
                          <span className="text-sm font-medium mono-numbers">
                            {item.orderQuantity} {inventoryItems.find((i) => i.id === item.itemId)?.unit || 'units'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick order command display
function OrderCommand() {
  const urgentItems = procurementList.filter((item) => item.priority === 'urgent');

  return (
    <Card className="wabi-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Order Command
        </CardTitle>
        <CardDescription>Today's recommended orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-card rounded-lg border border-border/50 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            Priority Orders for This Week:
          </p>
          <ul className="space-y-2">
            {urgentItems.map((item) => {
              const inv = inventoryItems.find((i) => i.id === item.itemId);
              return (
                <li key={item.itemId} className="flex items-center gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span>
                    Order <strong className="text-primary">{item.orderQuantity}{inv?.unit}</strong> {item.itemName}
                  </span>
                  <span className="text-muted-foreground">by {item.orderBy}</span>
                </li>
              );
            })}
          </ul>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground">
            Based on current stock levels and projected weekly demand. Review and adjust quantities as needed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Procurement() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleItem = (itemId: string) => {
    setCheckedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Sort by priority: urgent first, then normal, then low
  const sortedItems = [...procurementList].sort((a, b) => {
    const priorityOrder = { urgent: 0, normal: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-semibold">Procurement Orders</h1>
            <p className="text-muted-foreground">
              AI-generated order recommendations based on inventory and demand forecasting
            </p>
          </div>
        </div>

        {/* Order Command Banner */}
        <OrderCommand />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order List - 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-medium">Order List</h2>
              <span className="text-sm text-muted-foreground">
                {checkedItems.length} of {procurementList.length} completed
              </span>
            </div>
            {sortedItems.map((item) => (
              <OrderItemCard
                key={item.itemId}
                item={item}
                checked={checkedItems.includes(item.itemId)}
                onToggle={() => toggleItem(item.itemId)}
              />
            ))}
          </div>

          {/* Sidebar - 1 col */}
          <div className="space-y-6">
            <OrderSummary checkedItems={checkedItems} />
            <OrderTimeline />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

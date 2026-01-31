/**
 * Procurement / Order Command Page
 * Design: Japanese Wabi-Sabi Minimalism
 * - Clear order list with priority indicators
 * - Actionable procurement recommendations
 * - Timeline-based ordering schedule
 * - Real data from database with accurate calculations
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ClipboardList,
  Download,
  FileText,
  Package,
  Printer,
  ShoppingCart,
  Truck
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

// Type for procurement order item from API
type ProcurementOrderItem = {
  ingredientId: string;
  ingredientName: string;
  category: string;
  unit: string;
  currentStock: number;
  projectedNeed: number;
  orderQuantity: number;
  priority: 'urgent' | 'normal' | 'low';
  orderBy: string;
  supplier: string;
  costPerUnit: number;
  totalCost: number;
  daysToStockout: number;
  averageDailyUsage: number;
};

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
  item: ProcurementOrderItem;
  checked: boolean;
  onToggle: () => void;
}) {
  // Calculate stock percentage based on projected need
  const stockPercentage = item.projectedNeed > 0 
    ? (item.currentStock / item.projectedNeed) * 100 
    : 100;

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
              <div>
                <h3 className={cn('font-medium', checked && 'line-through')}>{item.ingredientName}</h3>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
              <PriorityBadge priority={item.priority} />
            </div>

            <div className="grid grid-cols-4 gap-3 text-sm mb-3">
              <div>
                <p className="text-muted-foreground text-xs">Current Stock</p>
                <p className="font-medium mono-numbers">
                  {item.currentStock.toFixed(1)} {item.unit}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Projected Need</p>
                <p className="font-medium mono-numbers">
                  {item.projectedNeed} {item.unit}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Order Quantity</p>
                <p className="font-semibold text-primary mono-numbers">
                  {item.orderQuantity} {item.unit}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Est. Cost</p>
                <p className="font-medium mono-numbers">
                  ${item.totalCost.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Stock vs Need</span>
                <span className="text-muted-foreground">{Math.min(100, stockPercentage).toFixed(0)}%</span>
              </div>
              <Progress
                value={Math.min(100, stockPercentage)}
                className={cn(
                  'h-1.5',
                  stockPercentage < 30 && '[&>div]:bg-red-500',
                  stockPercentage >= 30 && stockPercentage < 70 && '[&>div]:bg-amber-500'
                )}
              />
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Order by <strong className="text-foreground">{new Date(item.orderBy).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong></span>
              <span className="mx-1">•</span>
              <span>Supplier: {item.supplier}</span>
              <span className="mx-1">•</span>
              <span>{item.daysToStockout} days to stockout</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Order summary card with PDF export
function OrderSummary({ 
  orderList, 
  checkedItems,
  onExportPDF 
}: { 
  orderList: ProcurementOrderItem[];
  checkedItems: string[];
  onExportPDF: () => void;
}) {
  const pendingItems = orderList.filter((item) => !checkedItems.includes(item.ingredientId));
  const urgentCount = pendingItems.filter((item) => item.priority === 'urgent').length;
  const normalCount = pendingItems.filter((item) => item.priority === 'normal').length;
  const totalItems = orderList.length;
  const completedItems = checkedItems.length;
  
  const totalCost = pendingItems.reduce((sum, item) => sum + item.totalCost, 0);

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
        <Progress value={totalItems > 0 ? (completedItems / totalItems) * 100 : 0} className="h-2" />

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
            <span className="font-medium">{normalCount}</span>
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
        
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estimated Total Cost</span>
            <span className="text-lg font-semibold text-primary mono-numbers">${totalCost.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={onExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export Order List (PDF)
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print Order List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Order timeline
function OrderTimeline({ orderList }: { orderList: ProcurementOrderItem[] }) {
  const groupedByDate = useMemo(() => {
    const sorted = [...orderList].sort(
      (a, b) => new Date(a.orderBy).getTime() - new Date(b.orderBy).getTime()
    );
    
    return sorted.reduce((acc, item) => {
      if (!acc[item.orderBy]) {
        acc[item.orderBy] = [];
      }
      acc[item.orderBy].push(item);
      return acc;
    }, {} as Record<string, ProcurementOrderItem[]>);
  }, [orderList]);

  if (orderList.length === 0) {
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
          <p className="text-sm text-muted-foreground text-center py-4">
            No orders scheduled. All inventory levels are adequate.
          </p>
        </CardContent>
      </Card>
    );
  }

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
            {Object.entries(groupedByDate).map(([date, items]) => {
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
                          key={item.ingredientId}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{item.ingredientName}</span>
                          </div>
                          <span className="text-sm font-medium mono-numbers">
                            {item.orderQuantity} {item.unit}
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
function OrderCommandBanner({ orderList }: { orderList: ProcurementOrderItem[] }) {
  const urgentItems = orderList.filter((item) => item.priority === 'urgent');

  if (urgentItems.length === 0) {
    return (
      <Card className="wabi-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            All Clear
          </CardTitle>
          <CardDescription>No urgent orders required</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All inventory levels are adequate. Continue monitoring usage trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="wabi-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Order Command
        </CardTitle>
        <CardDescription>Priority orders based on sales trends and stock levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-card rounded-lg border border-border/50 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            Priority Orders for This Week:
          </p>
          <ul className="space-y-2">
            {urgentItems.slice(0, 5).map((item) => (
              <li key={item.ingredientId} className="flex items-center gap-2 text-sm">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  Order <strong className="text-primary">{item.orderQuantity} {item.unit}</strong> {item.ingredientName}
                </span>
                <span className="text-muted-foreground">by {new Date(item.orderBy).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground">
            <strong>Calculation:</strong> Order Quantity = Projected 14-day Need − Current Stock. Based on average daily usage from recent sales data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Generate PDF content
function generatePDFContent(orderList: ProcurementOrderItem[], checkedItems: string[]): string {
  const pendingItems = orderList.filter(item => !checkedItems.includes(item.ingredientId));
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const totalCost = pendingItems.reduce((sum, item) => sum + item.totalCost, 0);
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Matsu Matcha - Order List</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1a1a1a; }
        h1 { color: #1a472a; margin-bottom: 5px; }
        .subtitle { color: #666; margin-bottom: 30px; }
        .summary { background: #f5f5f0; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .summary-label { color: #666; }
        .summary-value { font-weight: bold; }
        .total { font-size: 1.2em; color: #1a472a; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #1a472a; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        tr:nth-child(even) { background: #f9f9f9; }
        .priority-urgent { color: #dc2626; font-weight: bold; }
        .priority-normal { color: #d97706; }
        .priority-low { color: #16a34a; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>Matsu Matcha Order List</h1>
      <p class="subtitle">Generated on ${today}</p>
      
      <div class="summary">
        <div class="summary-row">
          <span class="summary-label">Total Items:</span>
          <span class="summary-value">${pendingItems.length}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Urgent Items:</span>
          <span class="summary-value">${pendingItems.filter(i => i.priority === 'urgent').length}</span>
        </div>
        <div class="summary-row total">
          <span class="summary-label">Estimated Total Cost:</span>
          <span class="summary-value">$${totalCost.toFixed(2)}</span>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Ingredient</th>
            <th>Category</th>
            <th>Current Stock</th>
            <th>Projected Need</th>
            <th>Order Qty</th>
            <th>Order By</th>
            <th>Supplier</th>
            <th>Est. Cost</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  for (const item of pendingItems) {
    const priorityClass = `priority-${item.priority}`;
    html += `
          <tr>
            <td><strong>${item.ingredientName}</strong></td>
            <td>${item.category}</td>
            <td>${item.currentStock.toFixed(1)} ${item.unit}</td>
            <td>${item.projectedNeed} ${item.unit}</td>
            <td><strong>${item.orderQuantity} ${item.unit}</strong></td>
            <td>${new Date(item.orderBy).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
            <td>${item.supplier}</td>
            <td>$${item.totalCost.toFixed(2)}</td>
            <td class="${priorityClass}">${item.priority.toUpperCase()}</td>
          </tr>
    `;
  }
  
  html += `
        </tbody>
      </table>
      
      <div class="footer">
        <p><strong>Notes:</strong></p>
        <ul>
          <li>Order quantities are calculated as: Projected 14-day Need − Current Stock</li>
          <li>Projected need is based on average daily usage from recent sales data</li>
          <li>Priority is determined by days to stockout vs supplier lead time</li>
        </ul>
        <p style="margin-top: 20px;">© ${new Date().getFullYear()} Matsu Matcha. Generated by Matsu Dash.</p>
      </div>
    </body>
    </html>
  `;
  
  return html;
}

export default function Procurement() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const { data: orderList, isLoading } = trpc.procurement.orderList.useQuery();

  const toggleItem = (ingredientId: string) => {
    setCheckedItems((prev) =>
      prev.includes(ingredientId)
        ? prev.filter((id) => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const handleExportPDF = () => {
    if (!orderList) return;
    
    const htmlContent = generatePDFContent(orderList, checkedItems);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window for printing/saving as PDF
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    
    toast.success('Order list opened for printing/export');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="space-y-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const items = orderList || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-semibold">Procurement Orders</h1>
            <p className="text-muted-foreground">
              AI-generated order recommendations based on inventory levels and sales trends
            </p>
          </div>
        </div>

        {/* Order Command Banner */}
        <OrderCommandBanner orderList={items} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order List - 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-medium">Order List</h2>
              <span className="text-sm text-muted-foreground">
                {checkedItems.length} of {items.length} completed
              </span>
            </div>
            {items.length === 0 ? (
              <Card className="wabi-card">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No Orders Needed</h3>
                  <p className="text-sm text-muted-foreground">
                    All inventory levels are adequate based on current sales trends.
                  </p>
                </CardContent>
              </Card>
            ) : (
              items.map((item) => (
                <OrderItemCard
                  key={item.ingredientId}
                  item={item}
                  checked={checkedItems.includes(item.ingredientId)}
                  onToggle={() => toggleItem(item.ingredientId)}
                />
              ))
            )}
          </div>

          {/* Sidebar - 1 col */}
          <div className="space-y-6">
            <OrderSummary 
              orderList={items} 
              checkedItems={checkedItems}
              onExportPDF={handleExportPDF}
            />
            <OrderTimeline orderList={items} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

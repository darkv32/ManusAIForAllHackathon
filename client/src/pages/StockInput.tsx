/**
 * Stock Input Page
 * Design: Japanese Wabi-Sabi Minimalism
 * - Frictionless input interface for staff
 * - Quick stock update forms
 * - Recent activity log
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { inventoryItems, type InventoryItem } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import {
  Box,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Edit3,
  History,
  Leaf,
  Milk,
  Package,
  Plus,
  Save,
  Sparkles,
  Truck
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Category icons
const categoryIcons: Record<string, React.ReactNode> = {
  powder: <Sparkles className="h-4 w-4" />,
  milk: <Milk className="h-4 w-4" />,
  fruit: <Leaf className="h-4 w-4" />,
  equipment: <Package className="h-4 w-4" />,
  other: <Box className="h-4 w-4" />
};

// Stock input form for a single item
function StockInputRow({
  item,
  value,
  onChange
}: {
  item: InventoryItem;
  value: string;
  onChange: (value: string) => void;
}) {
  const isLow = item.currentStock <= item.minStock;

  return (
    <div className={cn(
      'flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors',
      isLow && 'border-l-4 border-l-amber-500'
    )}>
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {categoryIcons[item.category]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          Current: {item.currentStock} {item.unit} | Min: {item.minStock} {item.unit}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 mono-numbers text-right"
          placeholder={item.currentStock.toString()}
        />
        <span className="text-sm text-muted-foreground w-8">{item.unit}</span>
      </div>
    </div>
  );
}

// Quick stock take form
function QuickStockTake() {
  const [stockValues, setStockValues] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(inventoryItems.map((item) => item.category)))];

  const filteredItems = selectedCategory === 'all'
    ? inventoryItems
    : inventoryItems.filter((item) => item.category === selectedCategory);

  const handleSubmit = () => {
    const updatedItems = Object.entries(stockValues).filter(([_, value]) => value !== '');
    if (updatedItems.length === 0) {
      toast.error('Please enter at least one stock value');
      return;
    }
    toast.success(`Updated ${updatedItems.length} item(s) successfully!`);
    setStockValues({});
  };

  return (
    <Card className="wabi-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              Quick Stock Take
            </CardTitle>
            <CardDescription>Update current stock levels</CardDescription>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Items' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {filteredItems.map((item) => (
          <StockInputRow
            key={item.id}
            item={item}
            value={stockValues[item.id] || ''}
            onChange={(value) => setStockValues((prev) => ({ ...prev, [item.id]: value }))}
          />
        ))}
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {Object.values(stockValues).filter((v) => v !== '').length} items to update
          </p>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Save Stock Take
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Add new delivery form
function NewDeliveryForm() {
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [cost, setCost] = useState<string>('');

  const handleSubmit = () => {
    if (!selectedItem || !quantity) {
      toast.error('Please select an item and enter quantity');
      return;
    }
    toast.success(`Delivery logged: ${quantity} units of ${inventoryItems.find(i => i.id === selectedItem)?.name}`);
    setSelectedItem('');
    setQuantity('');
    setCost('');
  };

  return (
    <Card className="wabi-card">
      <CardHeader>
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Log New Delivery
        </CardTitle>
        <CardDescription>Record incoming stock deliveries</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Item</Label>
          <Select value={selectedItem} onValueChange={setSelectedItem}>
            <SelectTrigger>
              <SelectValue placeholder="Select item..." />
            </SelectTrigger>
            <SelectContent>
              {inventoryItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <div className="flex items-center gap-2">
                    {categoryIcons[item.category]}
                    <span>{item.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Quantity Received</Label>
            <Input
              type="number"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="mono-numbers"
            />
          </div>
          <div className="space-y-2">
            <Label>Total Cost (Optional)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="pl-9 mono-numbers"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Log Delivery
        </Button>
      </CardContent>
    </Card>
  );
}

// Update supplier prices form
function UpdatePricesForm() {
  const [priceUpdates, setPriceUpdates] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const updates = Object.entries(priceUpdates).filter(([_, value]) => value !== '');
    if (updates.length === 0) {
      toast.error('Please enter at least one price update');
      return;
    }
    toast.success(`Updated prices for ${updates.length} item(s)`);
    setPriceUpdates({});
  };

  return (
    <Card className="wabi-card">
      <CardHeader>
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Update Supplier Prices
        </CardTitle>
        <CardDescription>Keep cost data accurate for margin calculations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {inventoryItems.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                Current: ${item.costPerUnit.toFixed(2)}/{item.unit}
              </p>
            </div>
            <div className="relative w-28">
              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="number"
                step="0.01"
                value={priceUpdates[item.id] || ''}
                onChange={(e) => setPriceUpdates((prev) => ({ ...prev, [item.id]: e.target.value }))}
                className="pl-7 mono-numbers text-sm h-8"
                placeholder={item.costPerUnit.toFixed(2)}
              />
            </div>
          </div>
        ))}
        <Button onClick={handleSubmit} variant="outline" className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Update Prices
        </Button>
      </CardContent>
    </Card>
  );
}

// Recent activity log
function RecentActivity() {
  const activities = [
    { id: 1, action: 'Stock Take', item: 'Meiji Fresh Milk', value: '15L', time: '2 hours ago', user: 'Staff A' },
    { id: 2, action: 'Delivery', item: 'Ceremonial Matcha', value: '+2kg', time: '5 hours ago', user: 'Staff B' },
    { id: 3, action: 'Price Update', item: 'Oatly Barista', value: '$5.20/L', time: '1 day ago', user: 'Manager' },
    { id: 4, action: 'Stock Take', item: 'Fresh Strawberries', value: '3kg', time: '1 day ago', user: 'Staff A' },
    { id: 5, action: 'Delivery', item: 'Houjicha Powder', value: '+1kg', time: '2 days ago', user: 'Staff C' }
  ];

  return (
    <Card className="wabi-card">
      <CardHeader>
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest inventory updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-primary/10 text-primary mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{activity.action}</Badge>
                  <span className="text-sm font-medium">{activity.item}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{activity.value}</span>
                  <span>•</span>
                  <span>{activity.time}</span>
                  <span>•</span>
                  <span>{activity.user}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StockInput() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold">Stock Input</h1>
          <p className="text-muted-foreground">
            Quick and easy inventory updates for daily operations
          </p>
        </div>

        {/* Quick Tips */}
        <Card className="wabi-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Quick Tips for Accurate Stock Takes</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3 text-primary" />
                    Count stock at the same time each day for consistency
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3 text-primary" />
                    Check expiry dates while counting perishables
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3 text-primary" />
                    Log deliveries immediately upon receipt
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="stock-take" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stock-take">Stock Take</TabsTrigger>
            <TabsTrigger value="delivery">Log Delivery</TabsTrigger>
            <TabsTrigger value="prices">Update Prices</TabsTrigger>
          </TabsList>

          <TabsContent value="stock-take" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <QuickStockTake />
              </div>
              <div>
                <RecentActivity />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <NewDeliveryForm />
              </div>
              <div>
                <RecentActivity />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <UpdatePricesForm />
              </div>
              <div>
                <RecentActivity />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

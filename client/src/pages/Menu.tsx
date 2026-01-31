/**
 * Menu Page - Product & Cost Management
 * Features:
 * - Ingredient Management with CSV upload and CRUD
 * - Menu Items with dynamic cost breakdown
 * - Recipe management
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  Edit,
  FileUp,
  Info,
  Package,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

// CSV Parser utility
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx];
      });
      rows.push(row);
    }
  }
  return rows;
}

// Ingredient Edit Dialog
function IngredientDialog({
  open,
  onOpenChange,
  ingredient,
  onSave,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient?: {
    ingredientId: string;
    name: string;
    category: string;
    unit: string;
    costPerUnit: string;
    currentStock: string;
  };
  onSave: (data: {
    ingredientId: string;
    name: string;
    category: string;
    unit: string;
    costPerUnit: string;
    currentStock: string;
  }) => void;
  mode: 'add' | 'edit';
}) {
  const [formData, setFormData] = useState({
    ingredientId: ingredient?.ingredientId || '',
    name: ingredient?.name || '',
    category: ingredient?.category || 'Tea',
    unit: ingredient?.unit || 'gram',
    costPerUnit: ingredient?.costPerUnit || '0',
    currentStock: ingredient?.currentStock || '0',
  });

  const handleSubmit = () => {
    if (!formData.ingredientId || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Ingredient' : 'Edit Ingredient'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Add a new ingredient to your inventory' : 'Update ingredient details'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ingredientId" className="text-right">ID</Label>
            <Input
              id="ingredientId"
              value={formData.ingredientId}
              onChange={(e) => setFormData({ ...formData, ingredientId: e.target.value })}
              className="col-span-3"
              disabled={mode === 'edit'}
              placeholder="ING_001"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="col-span-3"
              placeholder="Ceremonial Grade Matcha"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tea">Tea</SelectItem>
                <SelectItem value="Dairy">Dairy</SelectItem>
                <SelectItem value="Syrup">Syrup</SelectItem>
                <SelectItem value="Sweetener">Sweetener</SelectItem>
                <SelectItem value="Topping">Topping</SelectItem>
                <SelectItem value="Packaging">Packaging</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">Unit</Label>
            <Select
              value={formData.unit}
              onValueChange={(value) => setFormData({ ...formData, unit: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gram">gram</SelectItem>
                <SelectItem value="ml">ml</SelectItem>
                <SelectItem value="count">count</SelectItem>
                <SelectItem value="piece">piece</SelectItem>
                <SelectItem value="scoop">scoop</SelectItem>
                <SelectItem value="sheet">sheet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="costPerUnit" className="text-right">Cost/Unit ($)</Label>
            <Input
              id="costPerUnit"
              type="number"
              step="0.000001"
              value={formData.costPerUnit}
              onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currentStock" className="text-right">Stock</Label>
            <Input
              id="currentStock"
              type="number"
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{mode === 'add' ? 'Add' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Cost Breakdown Tooltip
function CostBreakdownTooltip({
  breakdown,
}: {
  breakdown: { ingredientName: string; quantity: number; unitCost: number; totalCost: number }[];
}) {
  if (!breakdown || breakdown.length === 0) {
    return <span className="text-muted-foreground">No recipe data</span>;
  }

  return (
    <div className="space-y-1 text-xs">
      <p className="font-medium mb-2">Cost Breakdown:</p>
      {breakdown.map((item, idx) => (
        <div key={idx} className="flex justify-between gap-4">
          <span>{item.ingredientName}</span>
          <span className="mono-numbers">${item.totalCost.toFixed(4)}</span>
        </div>
      ))}
      <div className="border-t pt-1 mt-2 flex justify-between font-medium">
        <span>Total</span>
        <span className="mono-numbers">${breakdown.reduce((s, i) => s + i.totalCost, 0).toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function Menu() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ingredientDialogOpen, setIngredientDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<{
    ingredientId: string;
    name: string;
    category: string;
    unit: string;
    costPerUnit: string;
    currentStock: string;
  } | undefined>();
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [expandedMenuItem, setExpandedMenuItem] = useState<string | null>(null);

  // tRPC queries
  const ingredientsQuery = trpc.ingredients.list.useQuery();
  const menuItemsQuery = trpc.menuItems.listWithCosts.useQuery();
  const utils = trpc.useUtils();

  // Mutations
  const createIngredient = trpc.ingredients.create.useMutation({
    onSuccess: () => {
      utils.ingredients.list.invalidate();
      utils.menuItems.listWithCosts.invalidate();
      toast.success('Ingredient added successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateIngredient = trpc.ingredients.update.useMutation({
    onSuccess: () => {
      utils.ingredients.list.invalidate();
      utils.menuItems.listWithCosts.invalidate();
      toast.success('Ingredient updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteIngredient = trpc.ingredients.delete.useMutation({
    onSuccess: () => {
      utils.ingredients.list.invalidate();
      utils.menuItems.listWithCosts.invalidate();
      toast.success('Ingredient deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const bulkUploadIngredients = trpc.ingredients.bulkUpload.useMutation({
    onSuccess: (data) => {
      utils.ingredients.list.invalidate();
      utils.menuItems.listWithCosts.invalidate();
      toast.success(`Imported ${data.count} ingredients successfully`);
    },
    onError: (error) => toast.error(error.message),
  });

  const bulkUploadMenuItems = trpc.menuItems.bulkUpload.useMutation({
    onSuccess: (data) => {
      utils.menuItems.listWithCosts.invalidate();
      toast.success(`Imported ${data.count} menu items successfully`);
    },
    onError: (error) => toast.error(error.message),
  });

  const bulkUploadRecipes = trpc.recipes.bulkUpload.useMutation({
    onSuccess: (data) => {
      utils.menuItems.listWithCosts.invalidate();
      toast.success(`Imported ${data.count} recipes successfully`);
    },
    onError: (error) => toast.error(error.message),
  });

  // Handle ingredient CSV upload
  const handleIngredientCSVUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      
      const items = rows.map(row => ({
        ingredientId: row.ingredient_id || row.ingredientId || '',
        name: row.name || '',
        category: row.category || 'Tea',
        unit: row.unit || 'gram',
        costPerUnit: row.cost_per_unit || row.costPerUnit || '0',
        currentStock: row.current_stock || row.currentStock || '0',
      })).filter(item => item.ingredientId && item.name);

      if (items.length > 0) {
        bulkUploadIngredients.mutate({ items });
      } else {
        toast.error('No valid ingredients found in CSV');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [bulkUploadIngredients]);

  // Handle menu items CSV upload
  const handleMenuItemsCSVUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      
      const items = rows.map(row => ({
        itemId: row.item_id || row.itemId || '',
        itemName: row.item_name || row.itemName || '',
        category: row.category || 'Regular',
        salesPrice: row.sales_price || row.salesPrice || '0',
        taxRate: row.tax_rate || row.taxRate || '0.08',
      })).filter(item => item.itemId && item.itemName);

      if (items.length > 0) {
        bulkUploadMenuItems.mutate({ items });
      } else {
        toast.error('No valid menu items found in CSV');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [bulkUploadMenuItems]);

  // Handle recipes CSV upload
  const handleRecipesCSVUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      
      const items = rows.map(row => ({
        recipeId: row.recipe_id || row.recipeId || '',
        menuItemId: row.menu_item_id || row.menuItemId || '',
        ingredientId: row.ingredient_id || row.ingredientId || '',
        quantity: row.quantity || '0',
      })).filter(item => item.recipeId && item.menuItemId && item.ingredientId);

      if (items.length > 0) {
        bulkUploadRecipes.mutate({ items });
      } else {
        toast.error('No valid recipes found in CSV');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [bulkUploadRecipes]);

  // Filter ingredients
  const filteredIngredients = useMemo(() => {
    if (!ingredientsQuery.data) return [];
    return ingredientsQuery.data.filter(ing => {
      const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ing.ingredientId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || ing.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [ingredientsQuery.data, searchQuery, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!ingredientsQuery.data) return [];
    return Array.from(new Set(ingredientsQuery.data.map(i => i.category)));
  }, [ingredientsQuery.data]);

  // Menu items chart data (horizontal bar chart)
  const menuChartData = useMemo(() => {
    if (!menuItemsQuery.data) return [];
    return menuItemsQuery.data
      .slice(0, 10)
      .map(item => ({
        name: item.itemName.length > 25 ? item.itemName.substring(0, 25) + '...' : item.itemName,
        cost: item.calculatedCost,
        margin: item.margin,
      }));
  }, [menuItemsQuery.data]);

  const handleSaveIngredient = (data: {
    ingredientId: string;
    name: string;
    category: string;
    unit: string;
    costPerUnit: string;
    currentStock: string;
  }) => {
    if (dialogMode === 'add') {
      createIngredient.mutate(data);
    } else {
      updateIngredient.mutate(data);
    }
  };

  const handleEditIngredient = (ingredient: typeof filteredIngredients[0]) => {
    setEditingIngredient({
      ingredientId: ingredient.ingredientId,
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      costPerUnit: String(ingredient.costPerUnit),
      currentStock: String(ingredient.currentStock || 0),
    });
    setDialogMode('edit');
    setIngredientDialogOpen(true);
  };

  const handleAddIngredient = () => {
    setEditingIngredient(undefined);
    setDialogMode('add');
    setIngredientDialogOpen(true);
  };

  const handleDeleteIngredient = (ingredientId: string) => {
    if (confirm('Are you sure you want to delete this ingredient?')) {
      deleteIngredient.mutate({ ingredientId });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-medium tracking-tight">Menu & Cost Management</h1>
          <p className="text-muted-foreground">
            Manage ingredients, recipes, and track product costs in real-time.
          </p>
        </div>

        <Tabs defaultValue="ingredients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="menuItems">Menu Items</TabsTrigger>
          </TabsList>

          {/* Ingredients Tab */}
          <TabsContent value="ingredients" className="space-y-4">
            {/* Actions Bar */}
            <Card className="wabi-card">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-1 gap-3 items-center">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search ingredients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleAddIngredient}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                    <label>
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-1" />
                          Import CSV
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleIngredientCSVUpload}
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ingredients Table */}
            <Card className="wabi-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Ingredients ({filteredIngredients.length})
                </CardTitle>
                <CardDescription>
                  Manage your ingredient costs. Changes will automatically update menu item costs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ingredientsQuery.isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : filteredIngredients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No ingredients found. Upload a CSV or add ingredients manually.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead className="text-right">Cost/Unit</TableHead>
                          <TableHead className="text-right">Stock</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIngredients.map((ing) => (
                          <TableRow key={ing.ingredientId} className="hover:bg-muted/30">
                            <TableCell className="font-mono text-xs">{ing.ingredientId}</TableCell>
                            <TableCell className="font-medium">{ing.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{ing.category}</Badge>
                            </TableCell>
                            <TableCell>{ing.unit}</TableCell>
                            <TableCell className="text-right mono-numbers">
                              ${Number(ing.costPerUnit).toFixed(4)}
                            </TableCell>
                            <TableCell className="text-right mono-numbers">
                              {Number(ing.currentStock || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditIngredient(ing)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteIngredient(ing.ingredientId)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CSV Format Helper */}
            <Card className="wabi-card bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">CSV Import Format</p>
                    <p>Headers: <code className="bg-muted px-1 rounded">ingredient_id, name, category, unit, cost_per_unit, current_stock</code></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Items Tab */}
          <TabsContent value="menuItems" className="space-y-4">
            {/* Actions Bar */}
            <Card className="wabi-card">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Menu item costs are calculated dynamically from ingredient prices and recipes.
                  </div>
                  <div className="flex gap-2">
                    <label>
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-1" />
                          Import Menu CSV
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleMenuItemsCSVUpload}
                      />
                    </label>
                    <label>
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-1" />
                          Import Recipes CSV
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleRecipesCSVUpload}
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Chart - Horizontal Bar */}
            <Card className="wabi-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Menu Item Costs
                </CardTitle>
                <CardDescription>Cost breakdown by menu item (top 10)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={menuChartData} layout="vertical" margin={{ left: 120 }}>
                      <XAxis type="number" tickFormatter={(v) => `$${v.toFixed(2)}`} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        width={120}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.99 0.008 85)',
                          border: '1px solid oklch(0.88 0.015 85)',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number, name: string) => [
                          name === 'cost' ? `$${value.toFixed(2)}` : `${value.toFixed(1)}%`,
                          name === 'cost' ? 'Cost' : 'Margin',
                        ]}
                      />
                      <Bar dataKey="cost" fill="oklch(0.42 0.08 145)" radius={[0, 4, 4, 0]}>
                        {menuChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.margin >= 60 ? 'oklch(0.42 0.08 145)' : 'oklch(0.72 0.08 55)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Menu Items Table with Cost Breakdown */}
            <Card className="wabi-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display">Menu Items with Dynamic Costs</CardTitle>
                <CardDescription>
                  Click on a row to see the detailed cost breakdown based on current ingredient prices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {menuItemsQuery.isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : !menuItemsQuery.data || menuItemsQuery.data.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No menu items found. Upload menu_items.csv and recipes.csv to get started.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8"></TableHead>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              Cost
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Calculated from ingredient costs × recipe quantities</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableHead>
                          <TableHead className="text-right">Margin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {menuItemsQuery.data.map((item) => (
                          <>
                            <TableRow
                              key={item.itemId}
                              className="hover:bg-muted/30 cursor-pointer"
                              onClick={() => setExpandedMenuItem(
                                expandedMenuItem === item.itemId ? null : item.itemId
                              )}
                            >
                              <TableCell>
                                {expandedMenuItem === item.itemId ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{item.itemName}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.category}</Badge>
                              </TableCell>
                              <TableCell className="text-right mono-numbers">
                                ${Number(item.salesPrice).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right mono-numbers">
                                ${item.calculatedCost.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                <span
                                  className={cn(
                                    'font-semibold mono-numbers',
                                    item.margin >= 60 ? 'text-green-600' : 'text-amber-600'
                                  )}
                                >
                                  {item.margin.toFixed(1)}%
                                </span>
                              </TableCell>
                            </TableRow>
                            {expandedMenuItem === item.itemId && (
                              <TableRow className="bg-muted/20">
                                <TableCell colSpan={6} className="py-4">
                                  <div className="pl-8">
                                    <p className="text-sm font-medium mb-2">Cost Breakdown:</p>
                                    {item.costBreakdown.length === 0 ? (
                                      <p className="text-sm text-muted-foreground">No recipe data available</p>
                                    ) : (
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {item.costBreakdown.map((b, idx) => (
                                          <div key={idx} className="bg-background rounded-lg p-3 border">
                                            <p className="text-xs text-muted-foreground">{b.ingredientName}</p>
                                            <p className="text-sm font-medium">
                                              {b.quantity} × ${b.unitCost.toFixed(4)}
                                            </p>
                                            <p className="text-sm text-primary mono-numbers">
                                              = ${b.totalCost.toFixed(4)}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CSV Format Helper */}
            <Card className="wabi-card bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div>
                      <p className="font-medium text-foreground">Menu Items CSV Format</p>
                      <p><code className="bg-muted px-1 rounded">item_id, item_name, category, sales_price, tax_rate</code></p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Recipes CSV Format</p>
                      <p><code className="bg-muted px-1 rounded">recipe_id, menu_item_id, ingredient_id, quantity</code></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ingredient Dialog */}
      <IngredientDialog
        open={ingredientDialogOpen}
        onOpenChange={setIngredientDialogOpen}
        ingredient={editingIngredient}
        onSave={handleSaveIngredient}
        mode={dialogMode}
      />
    </DashboardLayout>
  );
}

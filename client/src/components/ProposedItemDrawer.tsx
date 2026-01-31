/**
 * ProposedItemDrawer Component
 * Displays detailed recipe and cost breakdown for AI-recommended menu items
 * Features:
 * - Recipe table with ingredient costs
 * - Financial summary (COGS, Price, Margin)
 * - Margin status indicator (green/yellow/red)
 * - Edit recipe functionality
 * - Save to draft functionality
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Check,
  ClipboardCopy,
  DollarSign,
  Edit3,
  Loader2,
  Package,
  Percent,
  Save,
  Sparkles,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface RecipeItem {
  ingredientName: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  isNewSourcing: boolean;
}

export interface ProposedDrink {
  name: string;
  description: string;
  category: string;
  recipe: RecipeItem[];
  recommendedPrice: number;
  totalCogs: number;
  projectedMargin: number;
  strategicJustification: string;
}

interface ProposedItemDrawerProps {
  drink: ProposedDrink | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

// Margin status indicator component
function MarginIndicator({ margin }: { margin: number }) {
  let color = 'bg-red-500';
  let icon = <AlertTriangle className="h-4 w-4" />;
  let label = 'Low Margin';
  
  if (margin > 70) {
    color = 'bg-green-500';
    icon = <Check className="h-4 w-4" />;
    label = 'High Margin';
  } else if (margin >= 50) {
    color = 'bg-yellow-500';
    icon = <Percent className="h-4 w-4" />;
    label = 'Medium Margin';
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-3 h-3 rounded-full', color)} />
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm text-muted-foreground">({margin.toFixed(1)}%)</span>
    </div>
  );
}

export default function ProposedItemDrawer({
  drink,
  open,
  onOpenChange,
  onSaved,
}: ProposedItemDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<RecipeItem[]>([]);
  const [editedPrice, setEditedPrice] = useState(0);
  
  // Calculate totals from edited recipe
  const totalCogs = editedRecipe.reduce((sum, item) => sum + item.estimatedCost, 0);
  const projectedMargin = editedPrice > 0 ? ((editedPrice - totalCogs) / editedPrice) * 100 : 0;
  
  // Reset state when drink changes
  useEffect(() => {
    if (drink) {
      setEditedRecipe([...drink.recipe]);
      setEditedPrice(drink.recommendedPrice);
      setIsEditing(false);
    }
  }, [drink]);
  
  // Save to draft mutation
  const saveToDraftMutation = trpc.draftMenuItems.create.useMutation({
    onSuccess: () => {
      toast.success('Saved to draft menu');
      onOpenChange(false);
      onSaved?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Handle quantity change
  const handleQuantityChange = useCallback((index: number, newQuantity: number) => {
    setEditedRecipe(prev => {
      const updated = [...prev];
      const item = updated[index];
      // Recalculate cost based on new quantity
      const costPerUnit = item.estimatedCost / item.quantity;
      updated[index] = {
        ...item,
        quantity: newQuantity,
        estimatedCost: costPerUnit * newQuantity,
      };
      return updated;
    });
  }, []);
  
  // Handle save to draft
  const handleSaveToDraft = useCallback(() => {
    if (!drink) return;
    
    saveToDraftMutation.mutate({
      itemName: drink.name,
      category: drink.category,
      recommendedPrice: editedPrice.toFixed(2),
      totalCogs: totalCogs.toFixed(4),
      projectedMargin: projectedMargin.toFixed(2),
      strategicJustification: drink.strategicJustification,
      recipe: editedRecipe,
    });
  }, [drink, editedPrice, totalCogs, projectedMargin, editedRecipe, saveToDraftMutation]);
  
  // Generate recipe text for clipboard
  const generateRecipeText = useCallback(() => {
    if (!drink) return '';
    
    let text = `=== ${drink.name} Recipe ===\n\n`;
    text += `Category: ${drink.category}\n`;
    text += `Description: ${drink.description}\n\n`;
    text += `--- INGREDIENTS ---\n`;
    
    for (const item of editedRecipe) {
      const newSourcingNote = item.isNewSourcing ? ' [NEW SOURCING REQUIRED]' : '';
      text += `• ${item.ingredientName}: ${item.quantity} ${item.unit}${newSourcingNote}\n`;
    }
    
    text += `\n--- COST BREAKDOWN ---\n`;
    text += `Total COGS: $${totalCogs.toFixed(2)}\n`;
    text += `Recommended Price: $${editedPrice.toFixed(2)}\n`;
    text += `Projected Margin: ${projectedMargin.toFixed(1)}%\n\n`;
    text += `--- STRATEGIC JUSTIFICATION ---\n`;
    text += `${drink.strategicJustification}\n`;
    
    return text;
  }, [drink, editedRecipe, totalCogs, editedPrice, projectedMargin]);
  
  // Handle copy recipe
  const handleCopyRecipe = useCallback(async () => {
    const text = generateRecipeText();
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Recipe copied to clipboard');
    } catch {
      toast.error('Failed to copy recipe');
    }
  }, [generateRecipeText]);
  
  if (!drink) return null;
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-display flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {drink.name}
              </SheetTitle>
              <SheetDescription className="mt-1">
                {drink.description}
              </SheetDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              {drink.category}
            </Badge>
          </div>
        </SheetHeader>
        
        {/* Financial Summary */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total COGS</p>
                <p className="text-lg font-semibold mono-numbers text-amber-600">
                  ${totalCogs.toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Retail Price</p>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm">$</span>
                    <Input
                      type="number"
                      step="0.50"
                      min="0"
                      value={editedPrice}
                      onChange={(e) => setEditedPrice(Number(e.target.value))}
                      className="h-8 w-20 mono-numbers"
                    />
                  </div>
                ) : (
                  <p className="text-lg font-semibold mono-numbers text-primary">
                    ${editedPrice.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Projected Margin</p>
                <MarginIndicator margin={projectedMargin} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recipe Table */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Proposed Recipe
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit Recipe
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Cost/Unit</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedRecipe.map((item, index) => {
                  const costPerUnit = item.quantity > 0 ? item.estimatedCost / item.quantity : 0;
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.ingredientName}</span>
                          {item.isNewSourcing && (
                            <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              New Sourcing
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                            className="h-8 w-20 mono-numbers text-right"
                          />
                        ) : (
                          <span className="mono-numbers font-semibold">{item.quantity}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                      <TableCell className="text-right mono-numbers text-muted-foreground">
                        ${costPerUnit.toFixed(4)}/{item.unit}
                      </TableCell>
                      <TableCell className="text-right mono-numbers">
                        ${item.estimatedCost.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="font-semibold bg-muted/30">
                  <TableCell colSpan={4}>Total COGS</TableCell>
                  <TableCell className="text-right mono-numbers">
                    ${totalCogs.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Strategic Justification */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Strategic Justification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {drink.strategicJustification}
            </p>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={handleSaveToDraft}
              disabled={saveToDraftMutation.isPending}
            >
              {saveToDraftMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save to Draft Menu
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleCopyRecipe}
          >
            <ClipboardCopy className="h-4 w-4 mr-2" />
            Copy Recipe to Clipboard
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

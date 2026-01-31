/**
 * Promotions Page
 * Features:
 * - Active Promotions: Currently running promotions with status and performance
 * - Suggested Promotions: AI-generated recommendations based on inventory and sales data
 * - Promotion creation and management
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
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  DollarSign,
  Gift,
  Lightbulb,
  Loader2,
  Megaphone,
  Package,
  Percent,
  Play,
  Plus,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Promotion type icons and colors
const typeIcons: Record<string, React.ReactNode> = {
  featured: <Star className="h-4 w-4" />,
  limited_time: <Clock className="h-4 w-4" />,
  bundle: <Gift className="h-4 w-4" />,
  discount: <Percent className="h-4 w-4" />,
  seasonal: <Sparkles className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  featured: 'bg-amber-100 text-amber-700 border-amber-200',
  limited_time: 'bg-red-100 text-red-700 border-red-200',
  bundle: 'bg-purple-100 text-purple-700 border-purple-200',
  discount: 'bg-green-100 text-green-700 border-green-200',
  seasonal: 'bg-blue-100 text-blue-700 border-blue-200',
};

const statusColors: Record<string, string> = {
  planned: 'bg-slate-100 text-slate-700',
  running: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
};

interface SuggestedPromotion {
  id: string;
  title: string;
  promotionType: 'featured' | 'limited_time' | 'bundle' | 'discount' | 'seasonal';
  affectedMenuItems: string[];
  rationale: string;
  inventoryImpact: {
    ingredientsAffected: string[];
    percentageConsumed: number;
    wasteReduction: number;
  };
  projectedImpact: {
    salesUplift: number;
    profitImpact: number;
    wasteReduction: number;
  };
  dataInputs: string[];
  assumptions: string[];
  priority: 'high' | 'medium' | 'low';
}

function ActivePromotionCard({ promotion }: { promotion: {
  promotionId: string;
  name: string;
  description: string | null;
  promotionType: 'featured' | 'limited_time' | 'bundle' | 'discount' | 'seasonal';
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'running' | 'completed' | 'cancelled';
  expectedSalesVolume: number | null;
  expectedProfitContribution: string | null;
  rationale: string | null;
} }) {
  const now = new Date();
  const start = new Date(promotion.startDate);
  const end = new Date(promotion.endDate);
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));

  return (
    <Card className="wabi-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg border', typeColors[promotion.promotionType])}>
              {typeIcons[promotion.promotionType]}
            </div>
            <div>
              <h3 className="font-medium">{promotion.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">{promotion.promotionType.replace('_', ' ')}</p>
            </div>
          </div>
          <Badge className={statusColors[promotion.status]}>
            {promotion.status === 'running' && <Play className="h-3 w-3 mr-1" />}
            {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
          </Badge>
        </div>

        {promotion.description && (
          <p className="text-sm text-muted-foreground mb-3">{promotion.description}</p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{daysRemaining} days remaining</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{start.toLocaleDateString()}</span>
            <span>{end.toLocaleDateString()}</span>
          </div>
        </div>

        {(promotion.expectedSalesVolume || promotion.expectedProfitContribution) && (
          <>
            <Separator className="my-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              {promotion.expectedSalesVolume && (
                <div>
                  <p className="text-muted-foreground text-xs">Expected Sales</p>
                  <p className="font-medium mono-numbers">{promotion.expectedSalesVolume} units</p>
                </div>
              )}
              {promotion.expectedProfitContribution && (
                <div>
                  <p className="text-muted-foreground text-xs">Expected Profit</p>
                  <p className="font-medium text-green-600 mono-numbers">
                    ${parseFloat(promotion.expectedProfitContribution).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {promotion.rationale && (
          <>
            <Separator className="my-3" />
            <div className="flex items-start gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-muted-foreground">{promotion.rationale}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SuggestedPromotionCard({ 
  suggestion, 
  onActivate 
}: { 
  suggestion: SuggestedPromotion;
  onActivate: (suggestion: SuggestedPromotion) => void;
}) {
  return (
    <Card className={cn(
      'wabi-card transition-all hover:shadow-md',
      suggestion.priority === 'high' && 'border-l-4 border-l-red-500'
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg border', typeColors[suggestion.promotionType])}>
              {typeIcons[suggestion.promotionType]}
            </div>
            <div>
              <h3 className="font-medium">{suggestion.title}</h3>
              <p className="text-xs text-muted-foreground capitalize">{suggestion.promotionType.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', priorityColors[suggestion.priority])} />
            <span className="text-xs text-muted-foreground capitalize">{suggestion.priority} priority</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm">{suggestion.rationale}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Sales Uplift</p>
              <p className="font-medium text-green-600 mono-numbers">+{suggestion.projectedImpact.salesUplift}%</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Profit Impact</p>
              <p className="font-medium text-blue-600 mono-numbers">${suggestion.projectedImpact.profitImpact.toFixed(0)}</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Package className="h-4 w-4 text-amber-600 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Waste Saved</p>
              <p className="font-medium text-amber-600 mono-numbers">${suggestion.projectedImpact.wasteReduction.toFixed(0)}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Data Inputs</p>
            <div className="flex flex-wrap gap-1">
              {suggestion.dataInputs.map((input, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {input}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Key Assumptions</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {suggestion.assumptions.map((assumption, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{assumption}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button 
            className="w-full" 
            onClick={() => onActivate(suggestion)}
          >
            <Zap className="h-4 w-4 mr-2" />
            Activate Promotion
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Promotions() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestedPromotion | null>(null);
  const [newPromotion, setNewPromotion] = useState<{
    name: string;
    description: string;
    promotionType: 'featured' | 'limited_time' | 'bundle' | 'discount' | 'seasonal';
    startDate: string;
    endDate: string;
    expectedSalesVolume: string;
    expectedProfitContribution: string;
    rationale: string;
  }>({
    name: '',
    description: '',
    promotionType: 'featured',
    startDate: '',
    endDate: '',
    expectedSalesVolume: '',
    expectedProfitContribution: '',
    rationale: '',
  });

  const utils = trpc.useUtils();
  const activePromotionsQuery = trpc.promotions.active.useQuery();
  const plannedPromotionsQuery = trpc.promotions.planned.useQuery();
  const suggestedPromotionsQuery = trpc.promotions.suggested.useQuery();

  const createPromotionMutation = trpc.promotions.create.useMutation({
    onSuccess: () => {
      utils.promotions.active.invalidate();
      utils.promotions.planned.invalidate();
      toast.success('Promotion created successfully');
      setCreateDialogOpen(false);
      setActivateDialogOpen(false);
      setNewPromotion({
        name: '',
        description: '',
        promotionType: 'featured' as const,
        startDate: '',
        endDate: '',
        expectedSalesVolume: '',
        expectedProfitContribution: '',
        rationale: '',
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const handleActivateSuggestion = (suggestion: SuggestedPromotion) => {
    setSelectedSuggestion(suggestion);
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);
    
    setNewPromotion({
      name: suggestion.title,
      description: suggestion.rationale,
      promotionType: suggestion.promotionType,
      startDate: today.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      expectedSalesVolume: Math.round(suggestion.projectedImpact.salesUplift * 10).toString(),
      expectedProfitContribution: suggestion.projectedImpact.profitImpact.toFixed(2),
      rationale: suggestion.rationale,
    });
    setActivateDialogOpen(true);
  };

  const handleCreatePromotion = () => {
    if (!newPromotion.name || !newPromotion.startDate || !newPromotion.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    createPromotionMutation.mutate({
      promotionId: `promo-${Date.now()}`,
      name: newPromotion.name,
      description: newPromotion.description || undefined,
      promotionType: newPromotion.promotionType,
      affectedMenuItems: JSON.stringify([]),
      startDate: newPromotion.startDate,
      endDate: newPromotion.endDate,
      status: new Date(newPromotion.startDate) <= new Date() ? 'running' : 'planned',
      expectedSalesVolume: newPromotion.expectedSalesVolume ? parseInt(newPromotion.expectedSalesVolume) : undefined,
      expectedProfitContribution: newPromotion.expectedProfitContribution || undefined,
      rationale: newPromotion.rationale || undefined,
      dataInputs: selectedSuggestion ? JSON.stringify(selectedSuggestion.dataInputs) : undefined,
      assumptions: selectedSuggestion ? JSON.stringify(selectedSuggestion.assumptions) : undefined,
    });
  };

  const activePromotions = activePromotionsQuery.data || [];
  const plannedPromotions = plannedPromotionsQuery.data || [];
  const suggestedPromotions = (suggestedPromotionsQuery.data || []) as SuggestedPromotion[];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-medium">Promotions</h1>
              <p className="text-muted-foreground">
                Manage active promotions and review AI-suggested campaigns
              </p>
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Promotion
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="wabi-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Promotions</p>
                  <p className="text-3xl font-display font-medium mono-numbers">{activePromotions.length}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-green-100 text-green-600">
                  <Play className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="wabi-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Planned</p>
                  <p className="text-3xl font-display font-medium mono-numbers">{plannedPromotions.length}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="wabi-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Suggestions</p>
                  <p className="text-3xl font-display font-medium mono-numbers">{suggestedPromotions.length}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-purple-100 text-purple-600">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active & Planned</TabsTrigger>
            <TabsTrigger value="suggested">
              AI Suggestions
              {suggestedPromotions.length > 0 && (
                <Badge variant="secondary" className="ml-2">{suggestedPromotions.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activePromotionsQuery.isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : activePromotions.length === 0 && plannedPromotions.length === 0 ? (
              <Card className="wabi-card">
                <CardContent className="py-12 text-center">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Active Promotions</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a new promotion or activate an AI suggestion to get started.
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Promotion
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {activePromotions.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-display font-medium flex items-center gap-2">
                      <Play className="h-5 w-5 text-green-600" />
                      Running Now
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {activePromotions.map((promo) => (
                        <ActivePromotionCard key={promo.promotionId} promotion={promo} />
                      ))}
                    </div>
                  </div>
                )}

                {plannedPromotions.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-display font-medium flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Upcoming
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {plannedPromotions.map((promo) => (
                        <ActivePromotionCard key={promo.promotionId} promotion={promo} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggested" className="space-y-4">
            <Card className="wabi-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">AI-Generated Recommendations</h3>
                    <p className="text-sm text-muted-foreground">
                      These suggestions are generated based on your current inventory levels, sales trends, 
                      and ingredient expiry dates. Each recommendation includes projected impact and the 
                      data sources used to generate it.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {suggestedPromotionsQuery.isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Analyzing your data...</p>
              </div>
            ) : suggestedPromotions.length === 0 ? (
              <Card className="wabi-card">
                <CardContent className="py-12 text-center">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Suggestions Available</h3>
                  <p className="text-muted-foreground">
                    Upload more sales and inventory data to generate AI-powered promotion suggestions.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {suggestedPromotions.map((suggestion) => (
                  <SuggestedPromotionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onActivate={handleActivateSuggestion}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Promotion Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Promotion</DialogTitle>
              <DialogDescription>
                Set up a new promotional campaign for your menu items.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Promotion Name *</Label>
                <Input
                  id="name"
                  value={newPromotion.name}
                  onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
                  placeholder="e.g., Summer Matcha Special"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Promotion Type</Label>
                <Select
                  value={newPromotion.promotionType}
                  onValueChange={(value: 'featured' | 'limited_time' | 'bundle' | 'discount' | 'seasonal') => 
                    setNewPromotion({ ...newPromotion, promotionType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="limited_time">Limited Time</SelectItem>
                    <SelectItem value="bundle">Bundle</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newPromotion.startDate}
                    onChange={(e) => setNewPromotion({ ...newPromotion, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newPromotion.endDate}
                    onChange={(e) => setNewPromotion({ ...newPromotion, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPromotion.description}
                  onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
                  placeholder="Describe the promotion..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePromotion} disabled={createPromotionMutation.isPending}>
                {createPromotionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Create Promotion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Activate Suggestion Dialog */}
        <Dialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Activate AI Suggestion</DialogTitle>
              <DialogDescription>
                Review and customize the promotion before activating.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activateName">Promotion Name</Label>
                <Input
                  id="activateName"
                  value={newPromotion.name}
                  onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activateStartDate">Start Date</Label>
                  <Input
                    id="activateStartDate"
                    type="date"
                    value={newPromotion.startDate}
                    onChange={(e) => setNewPromotion({ ...newPromotion, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activateEndDate">End Date</Label>
                  <Input
                    id="activateEndDate"
                    type="date"
                    value={newPromotion.endDate}
                    onChange={(e) => setNewPromotion({ ...newPromotion, endDate: e.target.value })}
                  />
                </div>
              </div>
              {selectedSuggestion && (
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Projected Impact</p>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <p className="text-green-600 font-medium">+{selectedSuggestion.projectedImpact.salesUplift}%</p>
                      <p className="text-xs text-muted-foreground">Sales</p>
                    </div>
                    <div>
                      <p className="text-blue-600 font-medium">${selectedSuggestion.projectedImpact.profitImpact.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">Profit</p>
                    </div>
                    <div>
                      <p className="text-amber-600 font-medium">${selectedSuggestion.projectedImpact.wasteReduction.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">Saved</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActivateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePromotion} disabled={createPromotionMutation.isPending}>
                {createPromotionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Activate Promotion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

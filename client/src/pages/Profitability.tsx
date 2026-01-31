/**
 * Profitability & Sales Performance Dashboard
 * Features:
 * - Reactive data from database (ingredients, menu items, recipes, sales)
 * - Grouping by Base Drink Name with milk variant breakdown
 * - Real-time margin updates when ingredient costs change
 * - AI Strategy Generator (Gemini API) with detailed proposed item panel
 */

import DashboardLayout from '@/components/DashboardLayout';
import ProposedItemDrawer, { ProposedDrink } from '@/components/ProposedItemDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  DollarSign,
  ExternalLink,
  Lightbulb,
  Loader2,
  Milk,
  Percent,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Upload,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx]; });
      rows.push(row);
    }
  }
  return rows;
}

interface BaseDrinkGroup {
  baseDrink: string;
  totalRevenue: number;
  totalProfit: number;
  totalQuantity: number;
  avgMargin: number;
  variants: {
    milkVariant: string;
    menuItemId: string;
    itemName: string;
    salesPrice: number;
    cogs: number;
    margin: number;
    totalQuantity: number;
    totalRevenue: number;
    totalProfit: number;
  }[];
}

interface EnhancedDrinkIdea {
  name: string;
  description: string;
  category: string;
  recipe: {
    ingredientName: string;
    quantity: number;
    unit: string;
    estimatedCost: number;
    isNewSourcing: boolean;
  }[];
  recommendedPrice: number;
  totalCogs: number;
  projectedMargin: number;
  strategicJustification: string;
}

interface EnhancedAiInsights {
  drinkIdeas: EnhancedDrinkIdea[];
  campaigns: string[];
  priceAdjustments: string[];
}

function MarginBadge({ margin }: { margin: number }) {
  if (margin > 70) {
    return (
      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
        <Check className="h-3 w-3 mr-1" />
        {margin.toFixed(0)}%
      </Badge>
    );
  } else if (margin >= 50) {
    return (
      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
        <Percent className="h-3 w-3 mr-1" />
        {margin.toFixed(0)}%
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {margin.toFixed(0)}%
      </Badge>
    );
  }
}

export default function Profitability() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [monthlyGoal, setMonthlyGoal] = useState(15000);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<EnhancedAiInsights | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<ProposedDrink | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const profitabilityQuery = trpc.sales.profitability.useQuery();
  const utils = trpc.useUtils();

  const bulkUploadSales = trpc.sales.bulkUpload.useMutation({
    onSuccess: (data) => {
      utils.sales.profitability.invalidate();
      utils.sales.summary.invalidate();
      toast.success(`Imported ${data.count} sales records successfully`);
    },
    onError: (error) => toast.error(error.message),
  });

  const generateInsightsMutation = trpc.strategy.generateInsights.useMutation({
    onSuccess: (data) => {
      setAiInsights(data as EnhancedAiInsights);
      setIsGeneratingInsights(false);
      toast.success('AI insights generated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
      setIsGeneratingInsights(false);
    },
  });

  const handleSalesCSVUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      const items = rows.map(row => ({
        transactionId: row.transaction_id || row.transactionId || '',
        timestamp: row.timestamp || '',
        menuItemId: row.menu_item_id || row.item_id || row.menuItemId || '',
        itemName: row.item_name || row.itemName || '',
        quantity: parseInt(row.quantity || '1', 10),
        unitPrice: row.unit_price || row.unitPrice || '0',
        totalSales: row.total_sales || row.totalSales || '0',
        paymentMethod: row.payment_method || row.paymentMethod || 'Cash',
        paymentDetail: row.payment_detail || row.paymentDetail || undefined,
      })).filter(item => item.transactionId && item.menuItemId);
      if (items.length > 0) {
        bulkUploadSales.mutate({ items });
      } else {
        toast.error('No valid sales records found in CSV');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [bulkUploadSales]);

  const groupedData = useMemo<BaseDrinkGroup[]>(() => {
    if (!profitabilityQuery.data) return [];
    const groups = new Map<string, BaseDrinkGroup>();
    profitabilityQuery.data.forEach(item => {
      const existing = groups.get(item.baseDrink);
      const variant = {
        milkVariant: item.milkVariant,
        menuItemId: item.menuItemId,
        itemName: item.itemName,
        salesPrice: item.salesPrice,
        cogs: item.cogs,
        margin: item.margin,
        totalQuantity: item.totalQuantity,
        totalRevenue: item.totalRevenue,
        totalProfit: item.totalProfit,
      };
      if (existing) {
        existing.variants.push(variant);
        existing.totalRevenue += item.totalRevenue;
        existing.totalProfit += item.totalProfit;
        existing.totalQuantity += item.totalQuantity;
      } else {
        groups.set(item.baseDrink, {
          baseDrink: item.baseDrink,
          totalRevenue: item.totalRevenue,
          totalProfit: item.totalProfit,
          totalQuantity: item.totalQuantity,
          avgMargin: 0,
          variants: [variant],
        });
      }
    });
    groups.forEach(group => {
      if (group.totalRevenue > 0) {
        group.avgMargin = (group.totalProfit / group.totalRevenue) * 100;
      }
      group.variants.sort((a, b) => b.totalProfit - a.totalProfit);
    });
    return Array.from(groups.values()).sort((a, b) => b.totalProfit - a.totalProfit);
  }, [profitabilityQuery.data]);

  const kpis = useMemo(() => {
    if (!profitabilityQuery.data || profitabilityQuery.data.length === 0) {
      return {
        totalRevenue: 0,
        totalProfit: 0,
        avgMargin: 0,
        topContributor: null as { name: string; profit: number } | null,
        oatmilkLift: 0,
        profitGap: monthlyGoal,
      };
    }
    const totalRevenue = profitabilityQuery.data.reduce((s, i) => s + i.totalRevenue, 0);
    const totalProfit = profitabilityQuery.data.reduce((s, i) => s + i.totalProfit, 0);
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const sorted = [...profitabilityQuery.data].sort((a, b) => b.totalProfit - a.totalProfit);
    const topContributor = sorted[0] ? { name: sorted[0].itemName, profit: sorted[0].totalProfit } : null;
    const oatmilkLift = profitabilityQuery.data
      .filter(i => i.milkVariant.toLowerCase().includes('oat'))
      .reduce((s, i) => s + i.totalProfit, 0);
    const profitGap = Math.max(0, monthlyGoal - totalProfit);
    return { totalRevenue, totalProfit, avgMargin, topContributor, oatmilkLift, profitGap };
  }, [profitabilityQuery.data, monthlyGoal]);

  const chartData = useMemo(() => {
    return groupedData.slice(0, 8).map(g => ({
      name: g.baseDrink.length > 15 ? g.baseDrink.substring(0, 15) + '...' : g.baseDrink,
      profit: g.totalProfit,
      margin: g.avgMargin,
    }));
  }, [groupedData]);

  const toggleGroup = (baseDrink: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(baseDrink)) {
      newExpanded.delete(baseDrink);
    } else {
      newExpanded.add(baseDrink);
    }
    setExpandedGroups(newExpanded);
  };

  const handleGenerateInsights = () => {
    setIsGeneratingInsights(true);
    const context = {
      menuEngineering: {
        stars: groupedData.filter(g => g.avgMargin >= 60 && g.totalQuantity >= 50).map(g => ({
          name: g.baseDrink,
          monthlyProfit: g.totalProfit,
        })),
        plowhorses: groupedData.filter(g => g.avgMargin < 60 && g.totalQuantity >= 50).map(g => ({
          name: g.baseDrink,
        })),
        puzzles: groupedData.filter(g => g.avgMargin >= 60 && g.totalQuantity < 50).map(g => ({
          name: g.baseDrink,
        })),
        dogs: groupedData.filter(g => g.avgMargin < 60 && g.totalQuantity < 50).map(g => ({
          name: g.baseDrink,
        })),
      },
      costTrends: { rising: [], falling: [] },
      profitability: {
        actualMargin: kpis.avgMargin,
        targetMargin: 70,
        profitGapToGoal: kpis.profitGap,
      },
    };
    generateInsightsMutation.mutate({ context: JSON.stringify(context) });
  };

  const handleDrinkClick = (drink: EnhancedDrinkIdea) => {
    setSelectedDrink(drink);
    setDrawerOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-medium tracking-tight">Profitability & Sales Performance</h1>
            <p className="text-muted-foreground">
              Analyze margins by base drink and milk variant. Data updates in real-time with ingredient costs.
            </p>
          </div>
          <label>
            <input type="file" accept=".csv" onChange={handleSalesCSVUpload} className="hidden" />
            <Button variant="outline" asChild>
              <span className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import Sales CSV
              </span>
            </Button>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="wabi-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-display font-medium mono-numbers tracking-tight">
                    ${kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="wabi-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Average Margin</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-display font-medium mono-numbers tracking-tight">
                      {kpis.avgMargin.toFixed(1)}%
                    </p>
                    <span className="text-xs text-muted-foreground">target: 60%</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Target className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="wabi-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Top Profit Contributor</p>
                  <p className="text-lg font-medium truncate max-w-[180px]">
                    {kpis.topContributor?.name || 'N/A'}
                  </p>
                  {kpis.topContributor && (
                    <p className="text-sm text-primary mono-numbers">
                      ${kpis.topContributor.profit.toFixed(2)} profit
                    </p>
                  )}
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <Star className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="wabi-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Oatmilk Lift</p>
                  <p className="text-2xl font-display font-medium mono-numbers tracking-tight">
                    ${kpis.oatmilkLift.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Profit from oat milk variants</p>
                </div>
                <div className="p-2.5 rounded-lg bg-green-600/10 text-green-600">
                  <Milk className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="wabi-card">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-display font-medium">Monthly Profit Goal</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Goal:</span>
                <Input
                  type="number"
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                  className="w-28 mono-numbers"
                />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-display font-medium mono-numbers tracking-tight">
                    ${kpis.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">of ${monthlyGoal.toLocaleString()} goal</p>
                </div>
                <p className={cn(
                  "text-2xl font-medium mono-numbers",
                  kpis.totalProfit >= monthlyGoal ? "text-green-600" : "text-amber-600"
                )}>
                  {((kpis.totalProfit / monthlyGoal) * 100).toFixed(1)}%
                </p>
              </div>
              <Progress value={Math.min((kpis.totalProfit / monthlyGoal) * 100, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="breakdown" className="space-y-4">
          <TabsList>
            <TabsTrigger value="breakdown">Profitability Breakdown</TabsTrigger>
            <TabsTrigger value="ai">AI Strategy</TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="space-y-4">
            <Card className="wabi-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display">Profit by Base Drink</CardTitle>
                <CardDescription>Total profit contribution by drink type</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 20 }}>
                        <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'oklch(0.99 0.008 85)',
                            border: '1px solid oklch(0.88 0.015 85)',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Profit']}
                        />
                        <Bar dataKey="profit" fill="oklch(0.35 0.12 145)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No data available. Upload sales data to see profit breakdown.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="wabi-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display">Profitability by Base Drink & Milk Variant</CardTitle>
                <CardDescription>
                  Click on a drink to see margin breakdown by milk type.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profitabilityQuery.isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : groupedData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No profitability data. Upload sales_data.csv to analyze margins.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8"></TableHead>
                          <TableHead>Base Drink</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                          <TableHead className="text-right">Profit</TableHead>
                          <TableHead className="text-right">Avg Margin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedData.map((group) => (
                          <>
                            <TableRow
                              key={group.baseDrink}
                              className="hover:bg-muted/30 cursor-pointer font-medium"
                              onClick={() => toggleGroup(group.baseDrink)}
                            >
                              <TableCell>
                                {expandedGroups.has(group.baseDrink) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </TableCell>
                              <TableCell>{group.baseDrink}</TableCell>
                              <TableCell className="text-right mono-numbers">{group.totalQuantity}</TableCell>
                              <TableCell className="text-right mono-numbers">${group.totalRevenue.toFixed(2)}</TableCell>
                              <TableCell className="text-right mono-numbers text-primary">${group.totalProfit.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <span className={cn(
                                  "font-semibold mono-numbers",
                                  group.avgMargin >= 60 ? "text-green-600" : "text-amber-600"
                                )}>
                                  {group.avgMargin.toFixed(1)}%
                                </span>
                              </TableCell>
                            </TableRow>
                            {expandedGroups.has(group.baseDrink) && group.variants.map((variant) => (
                              <TableRow key={variant.menuItemId} className="bg-muted/20 text-sm">
                                <TableCell></TableCell>
                                <TableCell className="pl-8">
                                  <div className="flex items-center gap-2">
                                    <Milk className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>{variant.milkVariant}</span>
                                    {variant.margin >= 65 && (
                                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                        High Margin
                                      </Badge>
                                    )}
                                    {variant.margin < 50 && (
                                      <Badge variant="outline" className="text-xs text-red-500 border-red-500">
                                        Low Margin
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right mono-numbers">{variant.totalQuantity}</TableCell>
                                <TableCell className="text-right mono-numbers">${variant.totalRevenue.toFixed(2)}</TableCell>
                                <TableCell className="text-right mono-numbers">${variant.totalProfit.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                  <span className={cn(
                                    "mono-numbers",
                                    variant.margin >= 60 ? "text-green-600" : variant.margin < 50 ? "text-red-500" : "text-amber-600"
                                  )}>
                                    {variant.margin.toFixed(1)}%
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card className="wabi-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Strategy Generator
                    </CardTitle>
                    <CardDescription>
                      Generate data-driven recommendations based on your current profitability data.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleGenerateInsights}
                    disabled={isGeneratingInsights || groupedData.length === 0}
                  >
                    {isGeneratingInsights ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Generate Insights
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!aiInsights && !isGeneratingInsights && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Click "Generate Insights" to get AI-powered recommendations.</p>
                  </div>
                )}
                {aiInsights && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Proposed Menu Items
                        <span className="text-xs">(Click for details)</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {aiInsights.drinkIdeas.map((drink, idx) => (
                          <Card
                            key={idx}
                            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                            onClick={() => handleDrinkClick(drink)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium">{drink.name}</h4>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {drink.category}
                                  </Badge>
                                </div>
                                <MarginBadge margin={drink.projectedMargin} />
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {drink.description}
                              </p>
                              <div className="flex items-center justify-between text-sm">
                                <div>
                                  <span className="text-muted-foreground">Price: </span>
                                  <span className="font-medium mono-numbers">${drink.recommendedPrice.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">COGS: </span>
                                  <span className="font-medium mono-numbers">${drink.totalCogs.toFixed(2)}</span>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center text-xs text-primary">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Recipe & Details
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-amber-500/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                            Campaign Strategies
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {aiInsights.campaigns.map((campaign, idx) => (
                            <p key={idx} className="text-sm text-muted-foreground">{campaign}</p>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="border-green-600/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            Price Adjustments
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {aiInsights.priceAdjustments.map((adj, idx) => (
                            <p key={idx} className="text-sm text-muted-foreground">{adj}</p>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ProposedItemDrawer
        drink={selectedDrink}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSaved={() => {
          utils.draftMenuItems.list.invalidate();
        }}
      />
    </DashboardLayout>
  );
}

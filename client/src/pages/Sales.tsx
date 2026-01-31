/**
 * Sales Dashboard Page
 * Design: Japanese Wabi-Sabi Minimalism
 * - CSV upload for sales data
 * - Analytics charts (Revenue, Payment Methods, Top Items)
 * - Raw data table with pagination
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  getPaymentMethodDistribution,
  getTopItemsByQuantity,
  groupSalesByDay,
  parseSalesCSV,
  type SalesRecord
} from '@/lib/csvParser';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  Package,
  PieChart,
  ShoppingCart,
  TrendingUp,
  Upload
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { toast } from 'sonner';

// Chart colors matching the matcha theme
const CHART_COLORS = [
  'oklch(0.42 0.08 145)',
  'oklch(0.55 0.06 145)',
  'oklch(0.72 0.08 55)',
  'oklch(0.78 0.04 145)',
  'oklch(0.65 0.10 145)'
];

// CSV Upload Component
function CSVUploader({ onUpload }: { onUpload: (data: SalesRecord[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setIsLoading(true);
    try {
      const data = await parseSalesCSV(file);
      if (data.length === 0) {
        toast.error('No valid data found in CSV');
        return;
      }
      onUpload(data);
      toast.success(`Successfully loaded ${data.length} sales records`);
    } catch (error) {
      toast.error('Failed to parse CSV file');
      console.error(error);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="wabi-card border-dashed border-2 hover:border-primary/50 transition-colors">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="font-serif font-medium text-lg mb-2">Upload Sales Data</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            Upload your <code className="bg-muted px-1 py-0.5 rounded text-xs">sales_data.csv</code> file to view analytics and data.
            Expected headers: transaction_id, timestamp, item_id, item_name, quantity, unit_price, total_sales, payment_method
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="sales-csv-upload"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {isLoading ? 'Processing...' : 'Select CSV File'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// KPI Summary Cards
function KPISummary({ data }: { data: SalesRecord[] }) {
  const stats = useMemo(() => {
    const totalRevenue = data.reduce((sum, r) => sum + r.total_sales, 0);
    const totalOrders = data.length;
    const totalItems = data.reduce((sum, r) => sum + r.quantity, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return { totalRevenue, totalOrders, totalItems, avgOrderValue };
  }, [data]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-semibold mono-numbers">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Transactions</p>
              <p className="text-xl font-semibold mono-numbers">{stats.totalOrders.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Items Sold</p>
              <p className="text-xl font-semibold mono-numbers">{stats.totalItems.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="wabi-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Transaction</p>
              <p className="text-xl font-semibold mono-numbers">${stats.avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Revenue Chart
function RevenueChart({ data }: { data: SalesRecord[] }) {
  const chartData = useMemo(() => groupSalesByDay(data), [data]);

  return (
    <Card className="wabi-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Revenue Over Time
        </CardTitle>
        <CardDescription>Daily total sales</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.99 0.008 85)',
                    border: '1px solid oklch(0.88 0.015 85)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="oklch(0.42 0.08 145)"
                  strokeWidth={2}
                  dot={{ fill: 'oklch(0.42 0.08 145)', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: 'oklch(0.42 0.08 145)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Payment Method Pie Chart
function PaymentMethodChart({ data }: { data: SalesRecord[] }) {
  const chartData = useMemo(() => getPaymentMethodDistribution(data), [data]);

  return (
    <Card className="wabi-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Payment Methods
        </CardTitle>
        <CardDescription>Distribution by payment type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] flex items-center">
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="50%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="method"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.99 0.008 85)',
                      border: '1px solid oklch(0.88 0.015 85)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {chartData.map((item, index) => {
                  const total = chartData.reduce((s, c) => s + c.count, 0);
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  return (
                    <div key={item.method} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-sm flex-1 truncate">{item.method}</span>
                      <span className="text-sm font-medium mono-numbers">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Top Items Bar Chart
function TopItemsChart({ data }: { data: SalesRecord[] }) {
  const chartData = useMemo(() => getTopItemsByQuantity(data, 5), [data]);

  return (
    <Card className="wabi-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Top 5 Items
        </CardTitle>
        <CardDescription>By quantity sold</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'oklch(0.50 0.02 45)' }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.99 0.008 85)',
                    border: '1px solid oklch(0.88 0.015 85)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [value, 'Quantity']}
                />
                <Bar dataKey="quantity" fill="oklch(0.42 0.08 145)" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Data Table with Pagination
function SalesDataTable({ data }: { data: SalesRecord[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <Card className="wabi-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Raw Sales Data
            </CardTitle>
            <CardDescription>{data.length} total records</CardDescription>
          </div>
          <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Transaction ID</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Timestamp</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Item</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Qty</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Unit Price</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Payment</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((record, index) => (
                <tr key={`${record.transaction_id}-${index}`} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2.5 px-2 font-mono text-xs">{record.transaction_id}</td>
                  <td className="py-2.5 px-2 text-muted-foreground">
                    {new Date(record.timestamp).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-2.5 px-2">{record.item_name}</td>
                  <td className="py-2.5 px-2 text-right mono-numbers">{record.quantity}</td>
                  <td className="py-2.5 px-2 text-right mono-numbers">${record.unit_price.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-right font-medium mono-numbers">${record.total_sales.toFixed(2)}</td>
                  <td className="py-2.5 px-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted">
                      {record.payment_method}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Sales() {
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [hasData, setHasData] = useState(false);

  const handleUpload = useCallback((data: SalesRecord[]) => {
    setSalesData(data);
    setHasData(true);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold">Sales Dashboard</h1>
          <p className="text-muted-foreground">
            Upload your sales data to view analytics and insights
          </p>
        </div>

        {!hasData ? (
          <CSVUploader onUpload={handleUpload} />
        ) : (
          <>
            {/* Re-upload option */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing data from uploaded CSV
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setHasData(false); setSalesData([]); }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload New File
              </Button>
            </div>

            {/* KPI Summary */}
            <KPISummary data={salesData} />

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart data={salesData} />
              <div className="grid grid-cols-1 gap-6">
                <PaymentMethodChart data={salesData} />
                <TopItemsChart data={salesData} />
              </div>
            </div>

            {/* Raw Data Table */}
            <SalesDataTable data={salesData} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

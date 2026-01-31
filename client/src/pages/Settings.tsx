/**
 * Settings Page
 * Design: Japanese Wabi-Sabi Minimalism
 * - Clean settings interface
 * - Business configuration options
 * - System preferences
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Building2,
  Calendar,
  DollarSign,
  Globe,
  Lock,
  Mail,
  MapPin,
  Palette,
  Save,
  Settings as SettingsIcon,
  Shield,
  Store,
  User
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Business settings
function BusinessSettings() {
  const [businessName, setBusinessName] = useState('Matsu Matcha');
  const [location, setLocation] = useState('Guoco Tower, Tanjong Pagar');
  const [currency, setCurrency] = useState('SGD');
  const [timezone, setTimezone] = useState('Asia/Singapore');

  const handleSave = () => {
    toast.success('Business settings saved successfully!');
  };

  return (
    <Card className="wabi-card">
      <CardHeader>
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Business Information
        </CardTitle>
        <CardDescription>Basic business details and location</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter business name"
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-9"
                placeholder="Store location"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Singapore">Asia/Singapore (GMT+8)</SelectItem>
                <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                <SelectItem value="Asia/Hong_Kong">Asia/Hong Kong (GMT+8)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}

// Profit goals settings
function GoalsSettings() {
  const [monthlyGoal, setMonthlyGoal] = useState('15000');
  const [marginTarget, setMarginTarget] = useState('65');
  const [wastageLimit, setWastageLimit] = useState('200');

  const handleSave = () => {
    toast.success('Profit goals updated!');
  };

  return (
    <Card className="wabi-card">
      <CardHeader>
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Profit Goals
        </CardTitle>
        <CardDescription>Set your financial targets and thresholds</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Monthly Profit Goal</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(e.target.value)}
                className="pl-9 mono-numbers"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Target Margin (%)</Label>
            <Input
              type="number"
              value={marginTarget}
              onChange={(e) => setMarginTarget(e.target.value)}
              className="mono-numbers"
            />
          </div>
          <div className="space-y-2">
            <Label>Max Monthly Wastage</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={wastageLimit}
                onChange={(e) => setWastageLimit(e.target.value)}
                className="pl-9 mono-numbers"
              />
            </div>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Update Goals
        </Button>
      </CardContent>
    </Card>
  );
}

// Notification settings
function NotificationSettings() {
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  return (
    <Card className="wabi-card">
      <CardHeader>
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
        </CardTitle>
        <CardDescription>Configure alert preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Low Stock Alerts</Label>
            <p className="text-sm text-muted-foreground">Get notified when items fall below minimum stock</p>
          </div>
          <Switch checked={lowStockAlerts} onCheckedChange={setLowStockAlerts} />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Expiry Alerts</Label>
            <p className="text-sm text-muted-foreground">Receive alerts for items expiring within 7 days</p>
          </div>
          <Switch checked={expiryAlerts} onCheckedChange={setExpiryAlerts} />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Daily Summary</Label>
            <p className="text-sm text-muted-foreground">End-of-day sales and inventory summary</p>
          </div>
          <Switch checked={dailySummary} onCheckedChange={setDailySummary} />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Weekly Report</Label>
            <p className="text-sm text-muted-foreground">Comprehensive weekly performance report</p>
          </div>
          <Switch checked={weeklyReport} onCheckedChange={setWeeklyReport} />
        </div>
      </CardContent>
    </Card>
  );
}

// Security settings
function SecuritySettings() {
  return (
    <Card className="wabi-card">
      <CardHeader>
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Security & Privacy
        </CardTitle>
        <CardDescription>Data protection and access controls</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Data Encryption</p>
              <p className="text-sm text-muted-foreground">
                All sensitive data including cost prices and supplier information is encrypted at rest and in transit.
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
          </div>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Access Control</p>
              <p className="text-sm text-muted-foreground">
                Role-based access ensures staff can only view relevant data. Margin data is restricted to managers.
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
          </div>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Audit Logging</p>
              <p className="text-sm text-muted-foreground">
                All inventory changes and price updates are logged with timestamps and user attribution.
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// System info
function SystemInfo() {
  return (
    <Card className="wabi-card">
      <CardHeader>
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" />
          System Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">January 31, 2026</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Data Sync</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Connected</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Support</span>
            <a href="#" className="text-primary hover:underline">Contact Support</a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your dashboard preferences and business settings
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="business" className="space-y-6">
          <TabsList>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BusinessSettings />
              </div>
              <div>
                <SystemInfo />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <GoalsSettings />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

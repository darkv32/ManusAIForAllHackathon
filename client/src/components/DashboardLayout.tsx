/**
 * Dashboard Layout Component
 * Design: Japanese Wabi-Sabi Minimalism
 * - Left-weighted navigation mimicking Japanese scroll reading
 * - Generous whitespace and asymmetric balance
 * - Soft shadows and paper-like card aesthetics
 */

import { cn } from '@/lib/utils';
import {
  BarChart3,
  Box,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Home,
  Lightbulb,
  Menu,
  Package,
  Settings,
  TrendingUp
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { title: 'Overview', href: '/', icon: <Home className="h-5 w-5" /> },
  { title: 'Inventory', href: '/inventory', icon: <Box className="h-5 w-5" /> },
  { title: 'Sales', href: '/sales', icon: <DollarSign className="h-5 w-5" /> },
  { title: 'Profitability', href: '/profitability', icon: <TrendingUp className="h-5 w-5" /> },
  { title: 'Order Command', href: '/procurement', icon: <ClipboardList className="h-5 w-5" />, badge: '5' },
  { title: 'Menu Analytics', href: '/menu', icon: <BarChart3 className="h-5 w-5" /> },
  { title: 'Strategy', href: '/strategy', icon: <Lightbulb className="h-5 w-5" />, badge: '4' },
];

const bottomNavItems: NavItem[] = [
  { title: 'Stock Input', href: '/stock-input', icon: <Package className="h-5 w-5" /> },
  { title: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const [location] = useLocation();
  const isActive = location === item.href;

  return (
    <Link href={item.href}>
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300',
          'hover:bg-accent/50',
          isActive && 'bg-accent text-accent-foreground font-medium',
          collapsed && 'justify-center px-2'
        )}
      >
        <span className={cn(isActive && 'text-primary')}>{item.icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 text-sm">{item.title}</span>
            {item.badge && (
              <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </div>
    </Link>
  );
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40',
        'transition-all duration-300 ease-out',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-sidebar-border',
          collapsed ? 'justify-center' : 'gap-3'
        )}>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
            <img 
              src="/images/matcha-latte-hero.jpg" 
              alt="Matsu Matcha" 
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-serif font-semibold text-foreground">Matsu Matcha</span>
              <span className="text-xs text-muted-foreground">Guoco Tower</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} />
            ))}
          </nav>

          <Separator className="my-4 mx-3" />

          <nav className="px-3 space-y-1">
            {bottomNavItems.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} />
            ))}
          </nav>
        </ScrollArea>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn('w-full', collapsed && 'px-2')}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
              <img 
                src="/images/matcha-latte-hero.jpg" 
                alt="Matsu Matcha" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-semibold">Matsu Matcha</span>
              <span className="text-xs text-muted-foreground">Guoco Tower</span>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} collapsed={false} />
              ))}
            </nav>

            <Separator className="my-4 mx-3" />

            <nav className="px-3 space-y-1">
              {bottomNavItems.map((item) => (
                <NavLink key={item.href} item={item} collapsed={false} />
              ))}
            </nav>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-sm border-b flex items-center px-4 lg:px-6">
          <MobileNav />
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

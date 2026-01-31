/**
 * Dashboard Layout Component
 * Design: Premium Matsu Matcha Brand
 * - Deep forest green color palette inspired by matsumatcha.com
 * - Elegant Playfair Display typography for headings
 * - Refined shadows and subtle borders
 * - Warm cream backgrounds with premium feel
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
  LogOut,
  Megaphone,
  Menu,
  Package,
  Settings,
  TrendingUp,
  User
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Grouped navigation for better organization
// Group 1: Dashboard - Overview and high-level insights
// Group 2: Inventory & Procurement - Stock management and ordering
// Group 3: Sales & Finance - Revenue, profitability, and menu performance
// Group 4: Operations - Day-to-day tasks and settings

const navGroups: NavGroup[] = [
  {
    label: 'Dashboard',
    items: [
      { title: 'Overview', href: '/', icon: <Home className="h-[18px] w-[18px]" /> },
    ]
  },
  {
    label: 'Inventory & Procurement',
    items: [
      { title: 'Inventory', href: '/inventory', icon: <Box className="h-[18px] w-[18px]" /> },
      { title: 'Order Command', href: '/procurement', icon: <ClipboardList className="h-[18px] w-[18px]" />, badge: '5' },
      { title: 'Stock Input', href: '/stock-input', icon: <Package className="h-[18px] w-[18px]" /> },
    ]
  },
  {
    label: 'Sales & Finance',
    items: [
      { title: 'Sales', href: '/sales', icon: <DollarSign className="h-[18px] w-[18px]" /> },
      { title: 'Menu & Costs', href: '/menu', icon: <BarChart3 className="h-[18px] w-[18px]" /> },
    ]
  },
  {
    label: 'Strategy & Insights',
    items: [
      { title: 'Strategy', href: '/strategy', icon: <Lightbulb className="h-[18px] w-[18px]" />, badge: '4' },
      { title: 'Profitability', href: '/profitability', icon: <TrendingUp className="h-[18px] w-[18px]" /> },
      { title: 'Promotions', href: '/promotions', icon: <Megaphone className="h-[18px] w-[18px]" /> },
    ]
  },
];

const bottomNavItems: NavItem[] = [
  { title: 'Settings', href: '/settings', icon: <Settings className="h-[18px] w-[18px]" /> },
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
          'group flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200',
          'hover:bg-primary/5',
          isActive && 'bg-primary/8 border-l-2 border-primary -ml-[2px] pl-[14px]',
          collapsed && 'justify-center px-2 border-l-0 ml-0 pl-2'
        )}
      >
        <span className={cn(
          'transition-colors duration-200',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )}>
          {item.icon}
        </span>
        {!collapsed && (
          <>
            <span className={cn(
              'flex-1 text-[13px] tracking-wide transition-colors duration-200',
              isActive ? 'text-primary font-medium' : 'text-foreground/80 group-hover:text-foreground'
            )}>
              {item.title}
            </span>
            {item.badge && (
              <span className="badge-premium">
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
        'fixed left-0 top-0 h-screen bg-sidebar z-40',
        'border-r border-primary/8',
        'transition-all duration-300 ease-out',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={cn(
          'flex items-center h-[72px] px-5 border-b border-primary/8',
          collapsed ? 'justify-center px-3' : 'gap-4'
        )}>
          <div className="w-10 h-10 rounded-md overflow-hidden shadow-sm ring-1 ring-primary/10">
            <img 
              src="/images/matcha-latte-hero.jpg" 
              alt="Matsu Matcha" 
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display text-lg tracking-tight text-foreground">
                Matsu Matcha
              </span>
              <span className="text-[11px] text-muted-foreground tracking-wide uppercase">
                Guoco Tower
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          {navGroups.map((group, groupIndex) => (
            <div key={group.label}>
              {/* Group Label */}
              {!collapsed && (
                <div className="px-5 pt-4 pb-2">
                  <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest">
                    {group.label}
                  </span>
                </div>
              )}
              {collapsed && groupIndex > 0 && (
                <div className="ink-divider my-3 mx-3" />
              )}
              <nav className="px-4 space-y-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} collapsed={collapsed} />
                ))}
              </nav>
            </div>
          ))}

          <div className="ink-divider my-4 mx-4" />

          <nav className="px-4 space-y-0.5">
            {bottomNavItems.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} />
            ))}
          </nav>
        </ScrollArea>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-primary/8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'w-full text-muted-foreground hover:text-foreground hover:bg-primary/5',
              collapsed && 'px-2'
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="text-[13px]">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-primary/5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[13px] font-medium hidden md:block">{user?.username || 'User'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.username || 'User'}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLocation('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden hover:bg-primary/5">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 border-r-primary/10">
        <VisuallyHidden>
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Main navigation for Matsu Matcha Dashboard</SheetDescription>
        </VisuallyHidden>
        <div className="flex flex-col h-full bg-sidebar">
          {/* Logo */}
          <div className="flex items-center h-[72px] px-5 border-b border-primary/8 gap-4">
            <div className="w-10 h-10 rounded-md overflow-hidden shadow-sm ring-1 ring-primary/10">
              <img 
                src="/images/matcha-latte-hero.jpg" 
                alt="Matsu Matcha" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg tracking-tight">Matsu Matcha</span>
              <span className="text-[11px] text-muted-foreground tracking-wide uppercase">
                Guoco Tower
              </span>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            {navGroups.map((group) => (
              <div key={group.label}>
                {/* Group Label */}
                <div className="px-5 pt-4 pb-2">
                  <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest">
                    {group.label}
                  </span>
                </div>
                <nav className="px-4 space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink key={item.href} item={item} collapsed={false} />
                  ))}
                </nav>
              </div>
            ))}

            <div className="ink-divider my-4 mx-4" />

            <nav className="px-4 space-y-0.5">
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
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur-md border-b border-primary/8 flex items-center px-4 lg:px-8">
          <MobileNav />
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-muted-foreground hidden sm:block tracking-wide">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

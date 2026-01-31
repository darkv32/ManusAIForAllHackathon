import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { DataProvider } from "./contexts/DataContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import MenuAnalytics from "./pages/MenuAnalytics";
import Procurement from "./pages/Procurement";
import Profitability from "./pages/Profitability";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";
import StockInput from "./pages/StockInput";
import Strategy from "./pages/Strategy";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/sales" component={Sales} />
      <Route path="/profitability" component={Profitability} />
      <Route path="/procurement" component={Procurement} />
      <Route path="/menu" component={MenuAnalytics} />
      <Route path="/strategy" component={Strategy} />
      <Route path="/stock-input" component={StockInput} />
      <Route path="/settings" component={Settings} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Design: Japanese Wabi-Sabi Minimalism
// - Light theme with warm cream background
// - Matcha green primary color
// - Noto Serif/Sans JP typography
// - Soft shadows and paper-like aesthetics

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </DataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Procurement from "./pages/Procurement";
import Profitability from "./pages/Profitability";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";
import StockInput from "./pages/StockInput";
import Strategy from "./pages/Strategy";
import Promotions from "./pages/Promotions";

// Protected Route wrapper - redirects to login if not authenticated
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <Component />;
}

function Router() {
  const { isAuthenticated, login } = useAuth();
  
  return (
    <Switch>
      {/* Public route - Login */}
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/" /> : <Login onLogin={login} />}
      </Route>
      
      {/* Protected routes - require authentication */}
      <Route path="/">
        <ProtectedRoute component={Home} />
      </Route>
      <Route path="/inventory">
        <ProtectedRoute component={Inventory} />
      </Route>
      <Route path="/sales">
        <ProtectedRoute component={Sales} />
      </Route>
      <Route path="/profitability">
        <ProtectedRoute component={Profitability} />
      </Route>
      <Route path="/procurement">
        <ProtectedRoute component={Procurement} />
      </Route>
      <Route path="/menu">
        <ProtectedRoute component={Menu} />
      </Route>
      <Route path="/strategy">
        <ProtectedRoute component={Strategy} />
      </Route>
      <Route path="/promotions">
        <ProtectedRoute component={Promotions} />
      </Route>
      <Route path="/stock-input">
        <ProtectedRoute component={StockInput} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
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
        <AuthProvider>
          <DataProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

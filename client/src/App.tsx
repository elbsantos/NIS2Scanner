import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NewScan from "./pages/NewScan";
import ScanDetails from "./pages/ScanDetails";
import Reports from "./pages/Reports";
import Scans from "./pages/Scans";
import Assets from "./pages/Assets";
import Compliance from "./pages/Compliance";
import ComplianceHistory from "./pages/ComplianceHistory";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/scans" component={Scans} />
      <Route path="/scans/new" component={NewScan} />
      <Route path="/scans/:id" component={ScanDetails} />
      <Route path="/reports" component={Reports} />
      <Route path="/assets" component={Assets} />
      <Route path="/compliance" component={Compliance} />
      <Route path="/compliance/history" component={ComplianceHistory} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

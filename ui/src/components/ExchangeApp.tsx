import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  Wallet,
  Users,
  Activity,
  Clock,
  Settings,
  ShieldCheck,
  BarChart3,
  Network,
  Menu,
  X,
} from "lucide-react";
import { TradingTerminal } from "./TradingTerminal";
import { PortfolioMargin } from "./PortfolioMargin";
import { SubaccountsManager } from "./SubaccountsManager";
import { RiskDashboard } from "./RiskDashboard";
import { AdminConsole } from "./AdminConsole";
import { cn } from "../lib/utils";

type View = "trading" | "portfolio" | "subaccounts" | "funding" | "activity" | "settings" | "admin" | "risk";

const navigation = [
  { id: "trading" as View, label: "Perpetual Markets", icon: TrendingUp },
  { id: "portfolio" as View, label: "Portfolio Margin", icon: Wallet },
  { id: "subaccounts" as View, label: "Subaccounts", icon: Users },
  { id: "risk" as View, label: "Risk Dashboard", icon: BarChart3 },
  { id: "funding" as View, label: "Funding Rates", icon: Clock },
  { id: "activity" as View, label: "Activity", icon: Activity },
  { id: "settings" as View, label: "Account Settings", icon: Settings },
  { id: "admin" as View, label: "Admin", icon: ShieldCheck, adminOnly: true },
];

export function ExchangeApp({ onBackToLanding }: { onBackToLanding: () => void }) {
  const [activeView, setActiveView] = useState<View>("trading");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case "trading":
        return <TradingTerminal />;
      case "portfolio":
        return <PortfolioMargin />;
      case "subaccounts":
        return <SubaccountsManager />;
      case "risk":
        return <RiskDashboard />;
      case "admin":
        return <AdminConsole />;
      default:
        return (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">View: {activeView}</p>
              <p className="mt-2 text-sm text-muted-foreground">Coming soon</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        className="flex flex-col border-r border-border bg-sidebar"
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-ultramarine-500 to-ultramarine-700">
                <Network className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-sidebar-foreground">[PRODUCT_NAME]</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="rounded p-1 hover:bg-sidebar-accent"
          >
            {sidebarCollapsed ? (
              <Menu className="h-5 w-5 text-sidebar-foreground" />
            ) : (
              <X className="h-5 w-5 text-sidebar-foreground" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ultramarine-100 dark:bg-ultramarine-900/30">
              <span className="text-sm font-medium text-ultramarine-700 dark:text-ultramarine-300">
                IN
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  Institutional_01
                </p>
                <button
                  onClick={onBackToLanding}
                  className="text-xs text-muted-foreground hover:text-sidebar-foreground"
                >
                  Back to landing
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-foreground" style={{ fontSize: "1.25rem" }}>
              {navigation.find((n) => n.id === activeView)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Network Status */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-sm text-muted-foreground">Minitia Active</span>
            </div>

            {/* Account Equity */}
            <div className="rounded-lg border border-border bg-background px-4 py-1.5">
              <p className="text-xs text-muted-foreground">Account Equity</p>
              <p className="font-semibold">$2,847,392.18</p>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

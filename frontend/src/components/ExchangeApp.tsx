import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, Wallet, Users, Activity, Clock, Settings, ShieldCheck, BarChart3, Network, Menu, X } from "lucide-react";
import { TradingTerminal }    from "./TradingTerminal";
import { PortfolioMargin }    from "./PortfolioMargin";
import { SubaccountsManager } from "./SubaccountsManager";
import { RiskDashboard }      from "./RiskDashboard";
import { AdminConsole }       from "./AdminConsole";
import { cn }                 from "../lib/utils";
import { useChain }           from "../hooks";
import { usePerpilizeWallet } from "../lib/wallet";
import { formatUSD } from "../lib/utils";
import Logoimg from "../assets/Perpilelogo.png";

type View = "trading" | "portfolio" | "subaccounts" | "funding" | "activity" | "settings" | "admin" | "risk";

const NAV = [
  { id: "trading"     as View, label: "Perpetual Markets",  icon: TrendingUp  },
  { id: "portfolio"   as View, label: "Portfolio Margin",   icon: Wallet      },
  { id: "subaccounts" as View, label: "Subaccounts",        icon: Users       },
  { id: "risk"        as View, label: "Risk Dashboard",     icon: BarChart3   },
  { id: "funding"     as View, label: "Funding Rates",      icon: Clock       },
  { id: "activity"    as View, label: "Activity",           icon: Activity    },
  { id: "settings"    as View, label: "Account Settings",   icon: Settings    },
  { id: "admin"       as View, label: "Admin",              icon: ShieldCheck },
];

export function ExchangeApp({ onBackToLanding }: { onBackToLanding: () => void }) {
  const [activeView,       setActiveView]       = useState<View>("trading");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { connected, connect, shortAddress, viewWallet } = usePerpilizeWallet();
  const { chain, wallet } = useChain();

  const renderView = () => {
    switch (activeView) {
      case "trading":     return <TradingTerminal />;
      case "portfolio":   return <PortfolioMargin />;
      case "subaccounts": return <SubaccountsManager />;
      case "risk":        return <RiskDashboard />;
      case "admin":       return <AdminConsole />;
      default:
        return (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground capitalize">{activeView} — coming soon</p>
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
              <div className="flex h-8 w-9 items-center justify-center">
                <img src={Logoimg} alt="Perpilize Logo" />
              </div>
              <span className="font-semibold text-sidebar-foreground">Perpilize</span>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="rounded p-1 hover:bg-sidebar-accent">
            {sidebarCollapsed
              ? <Menu className="h-5 w-5 text-sidebar-foreground" />
              : <X    className="h-5 w-5 text-sidebar-foreground" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                  activeView === id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">{label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-sidebar-border p-4">
  <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ultramarine-100 dark:bg-ultramarine-900/30">
      <span className="text-sm font-medium text-ultramarine-700 dark:text-ultramarine-300">
        {connected ? shortAddress?.slice(0, 2).toUpperCase() : "??"}
      </span>
    </div>
    {!sidebarCollapsed && (
      <div className="flex-1 overflow-hidden">
        {connected ? (
          <>
            <p className="truncate text-xs font-medium text-sidebar-foreground">{shortAddress}</p>
            <button onClick={viewWallet} className="text-xs text-muted-foreground hover:text-sidebar-foreground">
              Manage wallet
            </button>
          </>
        ) : (
          <button
            onClick={connect}
            className="text-xs font-medium text-ultramarine-400 hover:text-ultramarine-300"
          >
            Connect Wallet
          </button>
        )}
        <button onClick={onBackToLanding} className="block text-xs text-muted-foreground hover:text-sidebar-foreground">
          Back to landing
        </button>
      </div>
    )}
  </div>
</div>
      </motion.aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <h1 className="font-semibold text-foreground" style={{ fontSize: "1.25rem" }}>
            {NAV.find((n) => n.id === activeView)?.label}
          </h1>
          <div className="flex items-center gap-4">
            {/* Live chain status */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
              <div className={cn("h-2 w-2 rounded-full", chain.connected ? "bg-success animate-pulse" : "bg-destructive")} />
              <span className="text-sm text-muted-foreground">
                {chain.connected ? `Block ${chain.blockHeight.toLocaleString()}` : "Disconnected"}
              </span>
            </div>
            {/* Equity */}
            <div className="rounded-lg border border-border bg-background px-4 py-1.5">
              <p className="text-xs text-muted-foreground">Account Equity</p>
              <p className="font-semibold">{formatUSD(wallet.accountEquity)}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
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
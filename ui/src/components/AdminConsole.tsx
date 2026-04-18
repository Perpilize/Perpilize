import { useState } from "react";
import { Button } from "./Button";
import { DataCard } from "./DataCard";
import { Settings, Database, Shield, Activity, Users, DollarSign } from "lucide-react";
import { useOracle } from "../hooks";
import { MOCK_MARKET_CONFIGS, MOCK_SYSTEM_STATUS } from "../utils/mockData";

export function AdminConsole() {
  const [activeSection, setActiveSection] = useState<"markets" | "oracles" | "risk" | "users">("markets");
  const { sources: oracleSources } = useOracle();
  const sys = MOCK_SYSTEM_STATUS;

  const tabs = [
    { id: "markets" as const, label: "Market Configuration" },
    { id: "oracles" as const, label: "Oracle Management"   },
    { id: "risk"    as const, label: "Risk Parameters"     },
    { id: "users"   as const, label: "User Management"     },
  ];

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold" style={{ fontSize: "1.5rem" }}>Admin Console</h2>
            <p className="mt-1 text-sm text-muted-foreground">System configuration and operational controls</p>
          </div>
          <div className="rounded-full bg-success/10 px-3 py-1.5">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-sm font-medium text-success">
                {sys.allOperational ? "All Systems Operational" : "Degraded"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <DataCard label="Active Markets" value={String(sys.activeMarkets)} icon={<Activity className="h-5 w-5" />} />
          <DataCard label="Total Users"    value={String(sys.totalUsers)}    icon={<Users className="h-5 w-5" />} />
          <DataCard label="24h Volume"     value={sys.volume24h}             icon={<DollarSign className="h-5 w-5" />} />
          <DataCard label="Oracle Health"  value={sys.oracleHealth}          changeType="positive" icon={<Database className="h-5 w-5" />} />
          <DataCard label="System Uptime"  value={sys.uptime}                changeType="positive" icon={<Shield className="h-5 w-5" />} />
        </div>

        {/* Nav Tabs */}
        <div className="flex gap-2 border-b border-border">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={activeSection === id
                ? "border-b-2 border-primary px-4 py-2 font-medium"
                : "px-4 py-2 text-muted-foreground hover:text-foreground"}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Markets ── */}
        {activeSection === "markets" && (
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-semibold">Market Configurations</h3>
              <Button size="sm">Add Market</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    {["Market","Status","Max Leverage","Maker Fee","Taker Fee","Min Order","Actions"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left font-medium text-muted-foreground last:text-right">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_MARKET_CONFIGS.map((market, i) => (
                    <tr key={i} className="border-b border-border hover:bg-accent">
                      <td className="px-6 py-4 font-medium">{market.symbol}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                          {market.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">{market.maxLeverage}x</td>
                      <td className="px-6 py-4 font-mono">{market.makerFee}%</td>
                      <td className="px-6 py-4 font-mono">{market.takerFee}%</td>
                      <td className="px-6 py-4 font-mono">{market.minOrder}</td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="outline"><Settings className="h-3.5 w-3.5" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Oracles ── */}
        {activeSection === "oracles" && (
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-semibold">Oracle Source Configuration</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    {["Asset","Source","Status","Latency (ms)","Deviation","Actions"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left font-medium text-muted-foreground last:text-right">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {oracleSources.map((oracle, i) => (
                    <tr key={i} className="border-b border-border hover:bg-accent">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ultramarine-100 dark:bg-ultramarine-900/30">
                            <span className="text-xs font-medium text-ultramarine-700 dark:text-ultramarine-300">{oracle.asset.slice(0,2)}</span>
                          </div>
                          <span className="font-medium">{oracle.asset}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{oracle.source}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium
                          ${oracle.status === "Healthy" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${oracle.status === "Healthy" ? "bg-success" : "bg-destructive"}`} />
                          {oracle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">{oracle.latency}</td>
                      <td className="px-6 py-4 font-mono">{oracle.deviation}%</td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="outline">Configure</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Risk Params ── */}
        {activeSection === "risk" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>Global Risk Parameters</h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Max Account Leverage",      defaultValue: 20    },
                  { label: "Initial Margin Ratio (%)",  defaultValue: 10    },
                  { label: "Maintenance Margin Ratio (%).", defaultValue: 5  },
                  { label: "Liquidation Fee (%)",       defaultValue: 0.5   },
                ].map(({ label, defaultValue }) => (
                  <div key={label}>
                    <label className="mb-2 block text-sm text-muted-foreground">{label}</label>
                    <input
                      type="number"
                      defaultValue={defaultValue}
                      className="w-full rounded-lg border border-input bg-input-background px-3 py-2 outline-none focus:border-ring"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline">Reset</Button>
                <Button>Save Changes</Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>Asset Haircuts</h3>
              <div className="space-y-4">
                {["BTC","ETH","SOL","INIT","USDC"].map((asset) => (
                  <div key={asset} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ultramarine-100 dark:bg-ultramarine-900/30">
                        <span className="text-sm font-medium text-ultramarine-700 dark:text-ultramarine-300">{asset.slice(0,2)}</span>
                      </div>
                      <span className="font-medium">{asset}</span>
                    </div>
                    <input
                      type="number"
                      defaultValue={asset === "USDC" ? 1.0 : 0.95}
                      step={0.01} max={1} min={0}
                      className="w-32 rounded-lg border border-input bg-input-background px-3 py-2 text-right outline-none focus:border-ring"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {activeSection === "users" && (
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-center text-muted-foreground">User management interface — coming soon</p>
          </div>
        )}

      </div>
    </div>
  );
}
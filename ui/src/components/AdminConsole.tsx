import { useState } from "react";
import { Button } from "./Button";
import { DataCard } from "./DataCard";
import { Settings, Database, Shield, Activity, Users, DollarSign } from "lucide-react";

const marketConfigs = [
  {
    symbol: "BTC-PERP",
    status: "Active",
    maxLeverage: 20,
    makerFee: 0.02,
    takerFee: 0.05,
    minOrder: 0.001,
  },
  {
    symbol: "ETH-PERP",
    status: "Active",
    maxLeverage: 20,
    makerFee: 0.02,
    takerFee: 0.05,
    minOrder: 0.01,
  },
  {
    symbol: "SOL-PERP",
    status: "Active",
    maxLeverage: 15,
    makerFee: 0.03,
    takerFee: 0.06,
    minOrder: 1.0,
  },
];

const oracleSources = [
  { asset: "BTC", source: "Initia Oracle Aggregator", status: "Healthy", latency: 245, deviation: 0.02 },
  { asset: "ETH", source: "Initia Oracle Aggregator", status: "Healthy", latency: 238, deviation: 0.03 },
  { asset: "SOL", source: "Chainlink", status: "Healthy", latency: 412, deviation: 0.05 },
  { asset: "INIT", source: "Initia L1 Direct", status: "Healthy", latency: 125, deviation: 0.01 },
];

export function AdminConsole() {
  const [activeSection, setActiveSection] = useState<"markets" | "oracles" | "risk" | "users">(
    "markets"
  );

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold" style={{ fontSize: "1.5rem" }}>
              Admin Console
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              System configuration and operational controls
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-success/10 px-3 py-1.5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-sm font-medium text-success">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <DataCard label="Active Markets" value="4" icon={<Activity className="h-5 w-5" />} />
          <DataCard label="Total Users" value="247" icon={<Users className="h-5 w-5" />} />
          <DataCard label="24h Volume" value="$2.4B" icon={<DollarSign className="h-5 w-5" />} />
          <DataCard
            label="Oracle Health"
            value="100%"
            changeType="positive"
            icon={<Database className="h-5 w-5" />}
          />
          <DataCard
            label="System Uptime"
            value="99.98%"
            changeType="positive"
            icon={<Shield className="h-5 w-5" />}
          />
        </div>

        {/* Navigation */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveSection("markets")}
            className={
              activeSection === "markets"
                ? "border-b-2 border-primary px-4 py-2 font-medium"
                : "px-4 py-2 text-muted-foreground hover:text-foreground"
            }
          >
            Market Configuration
          </button>
          <button
            onClick={() => setActiveSection("oracles")}
            className={
              activeSection === "oracles"
                ? "border-b-2 border-primary px-4 py-2 font-medium"
                : "px-4 py-2 text-muted-foreground hover:text-foreground"
            }
          >
            Oracle Management
          </button>
          <button
            onClick={() => setActiveSection("risk")}
            className={
              activeSection === "risk"
                ? "border-b-2 border-primary px-4 py-2 font-medium"
                : "px-4 py-2 text-muted-foreground hover:text-foreground"
            }
          >
            Risk Parameters
          </button>
          <button
            onClick={() => setActiveSection("users")}
            className={
              activeSection === "users"
                ? "border-b-2 border-primary px-4 py-2 font-medium"
                : "px-4 py-2 text-muted-foreground hover:text-foreground"
            }
          >
            User Management
          </button>
        </div>

        {/* Content */}
        {activeSection === "markets" && (
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Market Configurations</h3>
                <Button size="sm">Add Market</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                      Market
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                      Max Leverage
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                      Maker Fee
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                      Taker Fee
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                      Min Order
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {marketConfigs.map((market, i) => (
                    <tr key={i} className="border-b border-border hover:bg-accent">
                      <td className="px-6 py-4 font-medium">{market.symbol}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                          {market.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">{market.maxLeverage}x</td>
                      <td className="px-6 py-4 text-right font-mono">{market.makerFee}%</td>
                      <td className="px-6 py-4 text-right font-mono">{market.takerFee}%</td>
                      <td className="px-6 py-4 text-right font-mono">{market.minOrder}</td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="outline">
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === "oracles" && (
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-semibold">Oracle Source Configuration</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Asset</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                      Latency (ms)
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                      Deviation
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {oracleSources.map((oracle, i) => (
                    <tr key={i} className="border-b border-border hover:bg-accent">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ultramarine-100 dark:bg-ultramarine-900/30">
                            <span className="text-xs font-medium text-ultramarine-700 dark:text-ultramarine-300">
                              {oracle.asset.slice(0, 2)}
                            </span>
                          </div>
                          <span className="font-medium">{oracle.asset}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{oracle.source}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                          <div className="h-1.5 w-1.5 rounded-full bg-success" />
                          {oracle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">{oracle.latency}</td>
                      <td className="px-6 py-4 text-right font-mono">{oracle.deviation}%</td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="outline">
                          Configure
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === "risk" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>
                Global Risk Parameters
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">
                    Max Account Leverage
                  </label>
                  <input
                    type="number"
                    defaultValue={20}
                    className="w-full rounded-lg border border-input bg-input-background px-3 py-2 outline-none focus:border-ring"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">
                    Initial Margin Ratio
                  </label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full rounded-lg border border-input bg-input-background px-3 py-2 outline-none focus:border-ring"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">
                    Maintenance Margin Ratio
                  </label>
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-full rounded-lg border border-input bg-input-background px-3 py-2 outline-none focus:border-ring"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">
                    Liquidation Fee
                  </label>
                  <input
                    type="number"
                    defaultValue={0.5}
                    className="w-full rounded-lg border border-input bg-input-background px-3 py-2 outline-none focus:border-ring"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline">Reset</Button>
                <Button>Save Changes</Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>
                Asset Haircuts
              </h3>
              <div className="space-y-4">
                {["BTC", "ETH", "SOL", "INIT", "USDC"].map((asset) => (
                  <div key={asset} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ultramarine-100 dark:bg-ultramarine-900/30">
                        <span className="text-sm font-medium text-ultramarine-700 dark:text-ultramarine-300">
                          {asset.slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium">{asset}</span>
                    </div>
                    <input
                      type="number"
                      defaultValue={asset === "USDC" ? 1.0 : 0.95}
                      step={0.01}
                      max={1}
                      min={0}
                      className="w-32 rounded-lg border border-input bg-input-background px-3 py-2 text-right outline-none focus:border-ring"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "users" && (
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-center text-muted-foreground">User management interface</p>
          </div>
        )}
      </div>
    </div>
  );
}

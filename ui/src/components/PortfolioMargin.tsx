import { DataCard } from "./DataCard";
import { Wallet, TrendingUp, Shield, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const portfolioAssets = [
  { asset: "BTC", amount: 2.5, value: 105392.05, weight: 45.2, haircut: 0.95 },
  { asset: "ETH", amount: 47.3, value: 105653.99, weight: 45.3, haircut: 0.93 },
  { asset: "USDC", amount: 22000, value: 22000, weight: 9.4, haircut: 1.0 },
];

const exposureData = [
  { market: "BTC-PERP", exposure: 105000, type: "long" },
  { market: "ETH-PERP", exposure: -33500, type: "short" },
  { market: "SOL-PERP", exposure: 9800, type: "long" },
  { market: "INIT-PERP", exposure: -4560, type: "short" },
];

export function PortfolioMargin() {
  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <DataCard
            label="Total Equity"
            value="$2,847,392"
            change="+12.4% today"
            changeType="positive"
            icon={<Wallet className="h-5 w-5" />}
          />
          <DataCard
            label="Initial Margin"
            value="$284,739"
            change="10% of equity"
            changeType="neutral"
            icon={<Shield className="h-5 w-5" />}
          />
          <DataCard
            label="Maintenance Margin"
            value="$142,370"
            change="5% of equity"
            changeType="neutral"
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <DataCard
            label="Available Balance"
            value="$2,420,283"
            change="85% available"
            changeType="positive"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* Portfolio Composition */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>
            Portfolio Composition
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Asset</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Value (USD)</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Weight</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Haircut</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Adj. Value</th>
                </tr>
              </thead>
              <tbody>
                {portfolioAssets.map((asset, i) => (
                  <tr key={i} className="border-b border-border hover:bg-accent">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ultramarine-100 dark:bg-ultramarine-900/30">
                          <span className="text-xs font-medium text-ultramarine-700 dark:text-ultramarine-300">
                            {asset.asset.slice(0, 2)}
                          </span>
                        </div>
                        <span className="font-medium">{asset.asset}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-mono">{asset.amount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-mono">${asset.value.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-mono">{asset.weight}%</td>
                    <td className="px-4 py-4 text-right font-mono">{asset.haircut}</td>
                    <td className="px-4 py-4 text-right font-mono">
                      ${(asset.value * asset.haircut).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-border">
                <tr>
                  <td className="px-4 py-4 font-semibold">Total</td>
                  <td className="px-4 py-4"></td>
                  <td className="px-4 py-4 text-right font-mono font-semibold">
                    ${portfolioAssets.reduce((sum, a) => sum + a.value, 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right font-mono font-semibold">100%</td>
                  <td className="px-4 py-4"></td>
                  <td className="px-4 py-4 text-right font-mono font-semibold">
                    ${portfolioAssets
                      .reduce((sum, a) => sum + a.value * a.haircut, 0)
                      .toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Exposure Breakdown */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>
            Net Exposure by Market
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={exposureData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--muted-foreground)" />
              <YAxis dataKey="market" type="category" stroke="var(--muted-foreground)" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="exposure" radius={[0, 4, 4, 0]}>
                {exposureData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.exposure > 0 ? "var(--success)" : "var(--destructive)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Margin Requirements Detail */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>
            Margin Requirements Detail
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Initial Margin</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Requirement</span>
                  <span className="font-mono">$250,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Option Premium</span>
                  <span className="font-mono">$0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Add-on Margin</span>
                  <span className="font-mono">$34,739</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Total Initial</span>
                  <span className="font-mono">$284,739</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Maintenance Margin</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Requirement</span>
                  <span className="font-mono">$125,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Option Premium</span>
                  <span className="font-mono">$0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Add-on Margin</span>
                  <span className="font-mono">$17,370</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Total Maintenance</span>
                  <span className="font-mono">$142,370</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Margin Ratios</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Initial Margin Ratio</span>
                  <span className="font-mono">10.0%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Maint. Margin Ratio</span>
                  <span className="font-mono">5.0%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Usage</span>
                  <span className="font-mono text-success">15.0%</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Margin Buffer</span>
                  <span className="font-mono text-success">85.0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

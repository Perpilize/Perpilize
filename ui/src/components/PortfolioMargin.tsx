import { DataCard } from "./DataCard";
import { Wallet, TrendingUp, Shield, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { usePortfolio } from "../hooks";
import { formatUSD } from "../lib/utils";

export function PortfolioMargin() {
  const { assets, exposures, summary } = usePortfolio();

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        <div className="grid grid-cols-4 gap-4">
          <DataCard label="Total Equity"       value={formatUSD(summary.totalEquity, true)}      change="+12.4% today"                          changeType="positive" icon={<Wallet className="h-5 w-5" />} />
          <DataCard label="Initial Margin"     value={formatUSD(summary.initialMargin, true)}    change={`${summary.imRatio}% of equity`}        changeType="neutral"  icon={<Shield className="h-5 w-5" />} />
          <DataCard label="Maintenance Margin" value={formatUSD(summary.maintenanceMargin, true)} change={`${summary.mmRatio}% of equity`}        changeType="neutral"  icon={<AlertTriangle className="h-5 w-5" />} />
          <DataCard label="Available Balance"  value={formatUSD(summary.availableBalance, true)}  change={`${summary.bufferPercent.toFixed(0)}% available`} changeType="positive" icon={<TrendingUp className="h-5 w-5" />} />
        </div>

        {/* Portfolio Composition */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>Portfolio Composition</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {["Asset","Amount","Value (USD)","Weight","Haircut","Adj. Value"].map((h, i) => (
                    <th key={h} className={`px-4 py-3 font-medium text-muted-foreground ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assets.map((asset, i) => (
                  <tr key={i} className="border-b border-border hover:bg-accent">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ultramarine-100 dark:bg-ultramarine-900/30">
                          <span className="text-xs font-medium text-ultramarine-700 dark:text-ultramarine-300">{asset.asset.slice(0,2)}</span>
                        </div>
                        <span className="font-medium">{asset.asset}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-mono">{asset.amount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-mono">{formatUSD(asset.value)}</td>
                    <td className="px-4 py-4 text-right font-mono">{asset.weight}%</td>
                    <td className="px-4 py-4 text-right font-mono">{asset.haircut}</td>
                    <td className="px-4 py-4 text-right font-mono">{formatUSD(asset.value * asset.haircut)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-border">
                <tr>
                  <td className="px-4 py-4 font-semibold">Total</td>
                  <td /><td className="px-4 py-4 text-right font-mono font-semibold">{formatUSD(assets.reduce((s,a) => s+a.value,0))}</td>
                  <td className="px-4 py-4 text-right font-mono font-semibold">100%</td>
                  <td />
                  <td className="px-4 py-4 text-right font-mono font-semibold">{formatUSD(assets.reduce((s,a) => s+a.value*a.haircut,0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Exposure */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>Net Exposure by Market</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={exposures} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--muted-foreground)" tickFormatter={(v) => formatUSD(v, true)} />
              <YAxis dataKey="market" type="category" stroke="var(--muted-foreground)" width={110} />
              <Tooltip formatter={(v: number) => formatUSD(v)} contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem" }} />
              <Bar dataKey="exposure" radius={[0,4,4,0]}>
                {exposures.map((e, i) => (
                  <Cell key={i} fill={e.exposure > 0 ? "var(--success)" : "var(--destructive)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Margin Detail */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>Margin Requirements Detail</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Initial Margin</h4>
              <div className="space-y-2">
                {[["Base Requirement","$250,000"],["Option Premium","$0"],["Add-on Margin","$34,739"]].map(([l,v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-mono">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Total Initial</span>
                  <span className="font-mono">{formatUSD(summary.initialMargin)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Maintenance Margin</h4>
              <div className="space-y-2">
                {[["Base Requirement","$125,000"],["Option Premium","$0"],["Add-on Margin","$17,370"]].map(([l,v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-mono">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Total Maintenance</span>
                  <span className="font-mono">{formatUSD(summary.maintenanceMargin)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Margin Ratios</h4>
              <div className="space-y-2">
                {[
                  ["Initial Margin Ratio",   `${summary.imRatio.toFixed(1)}%`],
                  ["Maint. Margin Ratio",    `${summary.mmRatio.toFixed(1)}%`],
                  ["Current Usage",          `${summary.usagePercent.toFixed(1)}%`],
                ].map(([l,v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-mono text-success">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Margin Buffer</span>
                  <span className="font-mono text-success">{summary.bufferPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
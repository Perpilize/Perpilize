import { useMemo } from "react";
import { DataCard } from "./DataCard";
import { AlertTriangle, TrendingUp, Shield, Activity } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useRisk } from "../hooks";
import { formatUSD, formatPercent } from "../lib/utils";
import { MOCK_LIQUIDATION_CURVE, MOCK_RISK_LIMITS, generateVarHistory } from "../utils/mockData";

const RISK_BADGE: Record<string, string> = {
  Low:    "bg-success/10 text-success",
  Medium: "bg-warning/10 text-warning",
  High:   "bg-destructive/10 text-destructive",
};

function limitBarColor(pct: number) {
  if (pct >= 80) return "bg-destructive";
  if (pct >= 60) return "bg-warning";
  return "bg-success";
}

export function RiskDashboard() {
  const { metrics, positionRisk } = useRisk();
  const varHistory = useMemo(() => generateVarHistory(30), []);

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4">
          <DataCard label="Portfolio VaR (95%)"   value={formatUSD(metrics.var95)}                   change="Daily risk estimate"    changeType="neutral"  icon={<AlertTriangle className="h-5 w-5" />} />
          <DataCard label="Liquidation Distance"  value={formatPercent(metrics.liquidationDistance, false)} change="Price move to liq." changeType="positive" icon={<Shield className="h-5 w-5" />} />
          <DataCard label="Max Drawdown (30d)"    value={formatUSD(metrics.maxDrawdown30d)}           change="-5.0% from peak"       changeType="negative" icon={<TrendingUp className="h-5 w-5" />} />
          <DataCard label="Sharpe Ratio (30d)"    value={metrics.sharpe30d.toFixed(2)}               change="Risk-adjusted return"  changeType="positive" icon={<Activity className="h-5 w-5" />} />
        </div>

        {/* Liquidation Curve */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold" style={{ fontSize: "1.125rem" }}>Liquidation Impact Curve</h3>
              <p className="mt-1 text-sm text-muted-foreground">Portfolio liquidation impact across BTC price movements</p>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Mark</p>
                <p className="font-mono font-semibold">$42,156</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Full Liquidation</p>
                <p className="font-mono font-semibold text-destructive">$38,345</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={MOCK_LIQUIDATION_CURVE}>
              <defs>
                <linearGradient id="liqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="var(--destructive)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="price" stroke="var(--muted-foreground)" tickFormatter={(v) => `$${Number(v).toLocaleString()}`} />
              <YAxis stroke="var(--muted-foreground)" tickFormatter={(v) => `${v}%`} />
              <Tooltip
                labelFormatter={(l) => `BTC: $${Number(l).toLocaleString()}`}
                formatter={(v: number) => [`${v}%`, "Impact"]}
                contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem" }}
              />
              <ReferenceLine x={42156} stroke="var(--ultramarine-500)" strokeDasharray="3 3" label={{ value: "Current", fill: "var(--ultramarine-500)", fontSize: 11 }} />
              <ReferenceLine x={38345} stroke="var(--destructive)"     strokeDasharray="3 3" label={{ value: "Liq.",    fill: "var(--destructive)",     fontSize: 11 }} />
              <Area type="monotone" dataKey="impact" stroke="var(--destructive)" fill="url(#liqGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Exposure + VaR History */}
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>Risk Exposure by Asset</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={positionRisk}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="market" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" tickFormatter={(v) => formatUSD(v, true)} />
                <Tooltip formatter={(v: number) => formatUSD(v)} contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem" }} />
                <Bar dataKey="notional" fill="var(--ultramarine-500)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>Value at Risk (30-day)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={varHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" tickFormatter={(v) => formatUSD(v, true)} />
                <Tooltip formatter={(v: number, n: string) => [formatUSD(v), n]} contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem" }} />
                <Line type="monotone" dataKey="var95" stroke="var(--ultramarine-500)" strokeWidth={2} dot={false} name="95% VaR" />
                <Line type="monotone" dataKey="var99" stroke="var(--destructive)"     strokeWidth={2} dot={false} name="99% VaR" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Position Risk Table */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>Position Risk Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted">
                <tr>
                  {["Market","Notional","Delta","Gamma","Margin","Risk Score"].map((h) => (
                    <th key={h} className="px-4 py-3 text-right first:text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positionRisk.map((row, i) => (
                  <tr key={i} className="border-b border-border hover:bg-accent">
                    <td className="px-4 py-4 font-medium">{row.market}</td>
                    <td className="px-4 py-4 text-right font-mono">{formatUSD(row.notional)}</td>
                    <td className={`px-4 py-4 text-right font-mono ${row.delta >= 0 ? "text-success" : "text-destructive"}`}>
                      {row.delta >= 0 ? "+" : ""}{row.delta}
                    </td>
                    <td className="px-4 py-4 text-right font-mono">{row.gamma.toFixed(3)}</td>
                    <td className="px-4 py-4 text-right font-mono">{formatUSD(row.margin)}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_BADGE[row.riskScore]}`}>
                        {row.riskScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Limits */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>Risk Limits & Controls</h3>
          <div className="grid grid-cols-3 gap-6">
            {MOCK_RISK_LIMITS.map((limit) => {
              const pct = (limit.current / limit.max) * 100;
              return (
                <div key={limit.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{limit.label}</span>
                    <span className="text-sm font-medium">{limit.current}{limit.unit} / {limit.max}{limit.unit}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full transition-all ${limitBarColor(pct)}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
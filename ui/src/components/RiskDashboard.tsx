import { DataCard } from "./DataCard";
import { AlertTriangle, TrendingUp, Shield, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

const liquidationData = [
  { price: 38000, impact: 0 },
  { price: 39000, impact: 0 },
  { price: 40000, impact: 15 },
  { price: 40500, impact: 35 },
  { price: 41000, impact: 58 },
  { price: 41500, impact: 75 },
  { price: 42000, impact: 85 },
  { price: 42500, impact: 92 },
  { price: 43000, impact: 100 },
];

const exposureByAsset = [
  { asset: "BTC", exposure: 105000, risk: 85 },
  { asset: "ETH", exposure: 72000, risk: 65 },
  { asset: "SOL", exposure: 9800, risk: 15 },
  { asset: "INIT", exposure: 4560, risk: 10 },
];

const varHistory = Array.from({ length: 30 }, (_, i) => ({
  day: i,
  var95: 25000 + Math.random() * 15000,
  var99: 35000 + Math.random() * 20000,
}));

export function RiskDashboard() {
  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Risk Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <DataCard
            label="Portfolio VaR (95%)"
            value="$35,821"
            change="Daily risk estimate"
            changeType="neutral"
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <DataCard
            label="Liquidation Distance"
            value="18.2%"
            change="Price movement to liq."
            changeType="positive"
            icon={<Shield className="h-5 w-5" />}
          />
          <DataCard
            label="Max Drawdown (30d)"
            value="$142,350"
            change="-5.0% from peak"
            changeType="negative"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <DataCard
            label="Sharpe Ratio (30d)"
            value="2.34"
            change="Risk-adjusted return"
            changeType="positive"
            icon={<Activity className="h-5 w-5" />}
          />
        </div>

        {/* Liquidation Curve */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold" style={{ fontSize: "1.125rem" }}>
                Liquidation Impact Curve
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Portfolio liquidation impact across BTC price movements
              </p>
            </div>
            <div className="flex items-center gap-4">
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
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={liquidationData}>
              <defs>
                <linearGradient id="liquidationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="price"
                stroke="var(--muted-foreground)"
                label={{ value: "BTC Price (USD)", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                label={{ value: "Liquidation %", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                }}
              />
              <ReferenceLine
                x={42156}
                stroke="var(--ultramarine-500)"
                strokeDasharray="3 3"
                label="Current"
              />
              <ReferenceLine
                x={38345}
                stroke="var(--destructive)"
                strokeDasharray="3 3"
                label="Liquidation"
              />
              <Area
                type="monotone"
                dataKey="impact"
                stroke="var(--destructive)"
                fill="url(#liquidationGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Exposure by Asset */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>
              Risk Exposure by Asset
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={exposureByAsset}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="asset" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="exposure" fill="var(--ultramarine-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* VaR History */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>
              Value at Risk (30-day History)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={varHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="var95"
                  stroke="var(--ultramarine-500)"
                  strokeWidth={2}
                  dot={false}
                  name="95% VaR"
                />
                <Line
                  type="monotone"
                  dataKey="var99"
                  stroke="var(--destructive)"
                  strokeWidth={2}
                  dot={false}
                  name="99% VaR"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Breakdown Table */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>
            Position Risk Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Market</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Notional
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Delta
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Gamma
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Margin
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Risk Score
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-accent">
                  <td className="px-4 py-4 font-medium">BTC-PERP</td>
                  <td className="px-4 py-4 text-right font-mono">$105,392</td>
                  <td className="px-4 py-4 text-right font-mono text-success">+2.5</td>
                  <td className="px-4 py-4 text-right font-mono">0.023</td>
                  <td className="px-4 py-4 text-right font-mono">$10,539</td>
                  <td className="px-4 py-4 text-right">
                    <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                      Medium
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent">
                  <td className="px-4 py-4 font-medium">ETH-PERP</td>
                  <td className="px-4 py-4 text-right font-mono">$72,518</td>
                  <td className="px-4 py-4 text-right font-mono text-destructive">-15.0</td>
                  <td className="px-4 py-4 text-right font-mono">-0.041</td>
                  <td className="px-4 py-4 text-right font-mono">$7,252</td>
                  <td className="px-4 py-4 text-right">
                    <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                      Low
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent">
                  <td className="px-4 py-4 font-medium">SOL-PERP</td>
                  <td className="px-4 py-4 text-right font-mono">$9,823</td>
                  <td className="px-4 py-4 text-right font-mono text-success">+100.0</td>
                  <td className="px-4 py-4 text-right font-mono">0.156</td>
                  <td className="px-4 py-4 text-right font-mono">$982</td>
                  <td className="px-4 py-4 text-right">
                    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                      High
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Limits */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>
            Risk Limits & Controls
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Max Position Size</span>
                <span className="text-sm font-medium">45% / 50%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[90%] bg-warning" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Daily Loss Limit</span>
                <span className="text-sm font-medium">$12K / $50K</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[24%] bg-success" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Leverage Usage</span>
                <span className="text-sm font-medium">8x / 20x</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[40%] bg-success" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

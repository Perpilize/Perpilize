import { useState } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Layers,
  X,
  Info,
} from "lucide-react";
import { Button } from "./Button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn } from "../lib/utils";

// Mock data
const candleData = Array.from({ length: 100 }, (_, i) => {
  const base = 42000 + Math.random() * 2000;
  return {
    time: i,
    price: base,
    volume: Math.random() * 1000000,
  };
});

const depthData = [
  ...Array.from({ length: 20 }, (_, i) => ({
    price: 41500 - i * 10,
    amount: (20 - i) * 100,
    type: "bid",
  })),
  ...Array.from({ length: 20 }, (_, i) => ({
    price: 41500 + i * 10,
    amount: i * 100,
    type: "ask",
  })),
];

const markets = [
  { symbol: "BTC-PERP", price: 42156.82, change: 2.34, volume: "1.2B" },
  { symbol: "ETH-PERP", price: 2234.56, change: -1.12, volume: "842M" },
  { symbol: "SOL-PERP", price: 98.23, change: 5.67, volume: "234M" },
  { symbol: "INIT-PERP", price: 4.56, change: 3.21, volume: "89M" },
];

const positions = [
  {
    market: "BTC-PERP",
    size: 2.5,
    entry: 41200,
    current: 42156.82,
    pnl: 2391.05,
    pnlPercent: 2.31,
    margin: 10500,
  },
  {
    market: "ETH-PERP",
    size: -15,
    entry: 2280,
    current: 2234.56,
    pnl: 681.6,
    pnlPercent: 1.99,
    margin: 8200,
  },
];

const openOrders = [
  {
    market: "BTC-PERP",
    type: "Limit",
    side: "Long",
    size: 1.0,
    price: 41500,
    filled: 0,
    status: "Open",
  },
  {
    market: "SOL-PERP",
    type: "Trigger",
    side: "Short",
    size: 100,
    price: 102.5,
    filled: 0,
    status: "Open",
  },
];

export function TradingTerminal() {
  const [selectedMarket, setSelectedMarket] = useState(markets[0]);
  const [chartView, setChartView] = useState<"candle" | "depth" | "heatmap">("candle");
  const [orderType, setOrderType] = useState<"limit" | "market" | "trigger" | "twap" | "rfq">("limit");
  const [orderSide, setOrderSide] = useState<"long" | "short">("long");
  const [executionMode, setExecutionMode] = useState<"batch" | "low-latency">("low-latency");

  return (
    <div className="grid h-full grid-cols-[280px_1fr_320px] gap-px bg-border">
      {/* Markets Panel */}
      <div className="flex flex-col overflow-hidden bg-card">
        <div className="border-b border-border p-4">
          <h3 className="font-medium">Markets</h3>
          <input
            type="text"
            placeholder="Search markets..."
            className="mt-2 w-full rounded-lg border border-input bg-input-background px-3 py-1.5 text-sm outline-none focus:border-ring"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {markets.map((market) => (
            <button
              key={market.symbol}
              onClick={() => setSelectedMarket(market)}
              className={cn(
                "flex w-full items-center justify-between border-b border-border p-3 text-left transition-colors hover:bg-accent",
                selectedMarket.symbol === market.symbol && "bg-accent"
              )}
            >
              <div>
                <p className="font-medium">{market.symbol}</p>
                <p className="text-xs text-muted-foreground">Vol: {market.volume}</p>
              </div>
              <div className="text-right">
                <p className="font-mono">${market.price.toLocaleString()}</p>
                <p
                  className={cn(
                    "text-xs",
                    market.change >= 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {market.change >= 0 ? "+" : ""}
                  {market.change}%
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Trading Area */}
      <div className="flex flex-col overflow-hidden bg-background">
        {/* Market Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="font-semibold" style={{ fontSize: "1.25rem" }}>
                {selectedMarket.symbol}
              </h2>
              <p className="text-xs text-muted-foreground">Perpetual</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-xs text-muted-foreground">Mark Price</p>
              <p className="font-mono font-semibold">
                ${selectedMarket.price.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">24h Change</p>
              <p
                className={cn(
                  "font-mono font-semibold",
                  selectedMarket.change >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {selectedMarket.change >= 0 ? "+" : ""}
                {selectedMarket.change}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Funding</p>
              <p className="font-mono font-semibold text-success">+0.0087%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Oracle</p>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
                <p className="text-sm">Healthy</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartView("candle")}
              className={cn(
                "rounded px-3 py-1 text-sm transition-colors",
                chartView === "candle"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartView("depth")}
              className={cn(
                "rounded px-3 py-1 text-sm transition-colors",
                chartView === "depth"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <Activity className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartView("heatmap")}
              className={cn(
                "rounded px-3 py-1 text-sm transition-colors",
                chartView === "heatmap"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <Layers className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 border-b border-border bg-card p-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === "candle" ? (
              <AreaChart data={candleData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--ultramarine-500)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--ultramarine-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" domain={["dataMin", "dataMax"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="var(--ultramarine-500)"
                  fill="url(#priceGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : chartView === "depth" ? (
              <AreaChart data={depthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="price" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <ReferenceLine x={41500} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
                <Area
                  type="stepAfter"
                  dataKey="amount"
                  stroke="var(--success)"
                  fill="var(--success)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            ) : (
              <BarChart data={candleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="volume" fill="var(--ultramarine-500)" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Positions and Orders */}
        <div className="h-64 overflow-y-auto border-b border-border bg-card">
          <div className="flex border-b border-border">
            <button className="border-b-2 border-primary px-4 py-2 text-sm font-medium">
              Positions
            </button>
            <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              Open Orders
            </button>
            <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              Order History
            </button>
          </div>

          {/* Positions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Market</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Size</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Entry</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Current</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">PnL</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Margin</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position, i) => (
                  <tr key={i} className="border-b border-border hover:bg-accent">
                    <td className="px-4 py-3 font-medium">{position.market}</td>
                    <td
                      className={cn(
                        "px-4 py-3 font-mono",
                        position.size > 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {position.size > 0 ? "+" : ""}
                      {position.size}
                    </td>
                    <td className="px-4 py-3 font-mono">${position.entry.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono">${position.current.toLocaleString()}</td>
                    <td
                      className={cn(
                        "px-4 py-3 font-mono",
                        position.pnl >= 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      ${position.pnl.toLocaleString()} ({position.pnlPercent >= 0 ? "+" : ""}
                      {position.pnlPercent}%)
                    </td>
                    <td className="px-4 py-3 font-mono">${position.margin.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="destructive">
                        Close
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Entry Panel */}
      <div className="flex flex-col overflow-hidden bg-card">
        <div className="border-b border-border p-4">
          <h3 className="mb-3 font-medium">Order Entry</h3>

          {/* Execution Mode */}
          <div className="mb-4 rounded-lg bg-accent p-2">
            <div className="flex gap-1">
              <button
                onClick={() => setExecutionMode("low-latency")}
                className={cn(
                  "flex-1 rounded px-2 py-1 text-xs transition-colors",
                  executionMode === "low-latency"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-background"
                )}
              >
                Low Latency
              </button>
              <button
                onClick={() => setExecutionMode("batch")}
                className={cn(
                  "flex-1 rounded px-2 py-1 text-xs transition-colors",
                  executionMode === "batch"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-background"
                )}
              >
                Batch
              </button>
            </div>
          </div>

          {/* Long/Short Toggle */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setOrderSide("long")}
              className={cn(
                "flex-1 rounded-lg py-2 font-medium transition-colors",
                orderSide === "long"
                  ? "bg-success text-success-foreground"
                  : "border border-border hover:bg-accent"
              )}
            >
              Long
            </button>
            <button
              onClick={() => setOrderSide("short")}
              className={cn(
                "flex-1 rounded-lg py-2 font-medium transition-colors",
                orderSide === "short"
                  ? "bg-destructive text-destructive-foreground"
                  : "border border-border hover:bg-accent"
              )}
            >
              Short
            </button>
          </div>

          {/* Order Type */}
          <div className="mb-4">
            <label className="mb-2 block text-sm text-muted-foreground">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm outline-none focus:border-ring"
            >
              <option value="limit">Limit</option>
              <option value="market">Market</option>
              <option value="trigger">Trigger</option>
              <option value="twap">TWAP</option>
              <option value="rfq">RFQ</option>
            </select>
          </div>

          {/* Price */}
          {orderType !== "market" && (
            <div className="mb-4">
              <label className="mb-2 block text-sm text-muted-foreground">Price</label>
              <input
                type="number"
                defaultValue={selectedMarket.price}
                className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm outline-none focus:border-ring"
              />
            </div>
          )}

          {/* Size */}
          <div className="mb-4">
            <label className="mb-2 block text-sm text-muted-foreground">Size</label>
            <input
              type="number"
              placeholder="0.00"
              className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
          </div>

          {/* Leverage */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Leverage</label>
              <span className="text-sm font-medium">10x</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              defaultValue="10"
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>1x</span>
              <span>20x</span>
            </div>
          </div>

          {/* Submit */}
          <Button
            className="w-full"
            variant={orderSide === "long" ? "primary" : "destructive"}
          >
            {orderSide === "long" ? "Open Long" : "Open Short"}
          </Button>

          {/* Order Summary */}
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Margin</span>
              <span className="font-mono">$4,215.68</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Liquidation Price</span>
              <span className="font-mono text-destructive">$38,345.12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className="font-mono">$2.11</span>
            </div>
          </div>
        </div>

        {/* Open Orders */}
        <div className="flex-1 overflow-y-auto border-t border-border p-4">
          <h4 className="mb-3 font-medium">Open Orders</h4>
          <div className="space-y-2">
            {openOrders.map((order, i) => (
              <div key={i} className="rounded-lg border border-border bg-background p-3">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-medium">{order.market}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.type} • {order.side}
                    </p>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-mono">{order.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-mono">${order.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Filled</span>
                    <span>{order.filled}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

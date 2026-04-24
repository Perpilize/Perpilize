import { useState } from "react";
import { BarChart3, Activity, Layers, X } from "lucide-react";
import { Button } from "./Button";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "../lib/utils";
import { useMarkets, usePositions, useOrders, usePriceHistory } from "../hooks";
import { formatUSD, formatPercent, formatLeverage, pnlColor, calcLiquidationPrice } from "../lib/utils";
import type { OrderType, ExecutionMode } from "../types";

export function TradingTerminal() {
  const { markets, selectedMarket, selectMarket } = useMarkets();
  const priceMap = Object.fromEntries(markets.map((m) => [m.symbol, m.price]));
  const { positions, closePosition } = usePositions(priceMap);
  const { openOrders, submitOrder, cancelOrder, loading, lastError, estimatedMargin, estimatedFee } = useOrders(selectedMarket);
  const { data: priceHistory } = usePriceHistory(selectedMarket.symbol);

  const [chartView, setChartView]     = useState<"price" | "depth" | "volume">("price");
  const [orderType, setOrderType]     = useState<OrderType>("limit");
  const [orderSide, setOrderSide]     = useState<"long" | "short">("long");
  const [execMode, setExecMode]       = useState<ExecutionMode>("low-latency");
  const [price, setPrice]             = useState(selectedMarket.price.toFixed(2));
  const [size, setSize]               = useState("");
  const [leverage, setLeverage]       = useState(10);

  const liqPrice = calcLiquidationPrice(parseFloat(price) || selectedMarket.price, leverage, orderSide);

  const handleSubmit = async () => {
    if (!size || parseFloat(size) <= 0) return;
    await submitOrder({
      market: selectedMarket.symbol,
      side: orderSide, type: orderType,
      size: parseFloat(size),
      price: orderType !== "market" ? parseFloat(price) : undefined,
      leverage, executionMode: execMode,
    });
    setSize("");
  };

  return (
    <div className="grid h-full grid-cols-[280px_1fr_320px] gap-px bg-border">

      {/* Markets Panel */}
      <div className="flex flex-col overflow-hidden bg-card">
        <div className="border-b border-border p-4">
          <h3 className="font-medium">Markets</h3>
          <input type="text" placeholder="Search markets..."
            className="mt-2 w-full rounded-lg border border-input bg-input-background px-3 py-1.5 text-sm outline-none focus:border-ring" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {markets.map((m) => (
            <button key={m.symbol} onClick={() => selectMarket(m.symbol)}
              className={cn("flex w-full items-center justify-between border-b border-border p-3 text-left transition-colors hover:bg-accent",
                selectedMarket.symbol === m.symbol && "bg-accent")}>
              <div>
                <p className="font-medium">{m.symbol}</p>
                <p className="text-xs text-muted-foreground">Vol: {m.volume}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm">{formatUSD(m.price)}</p>
                <p className={cn("text-xs", pnlColor(m.change))}>{formatPercent(m.change)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chart + Positions */}
      <div className="flex flex-col overflow-hidden bg-background">
        {/* Market Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="font-semibold" style={{ fontSize: "1.25rem" }}>{selectedMarket.symbol}</h2>
              <p className="text-xs text-muted-foreground">Perpetual</p>
            </div>
            <div className="h-8 w-px bg-border" />
            {[
              { label: "Mark Price", value: formatUSD(selectedMarket.price), cls: "" },
              { label: "24h Change",  value: formatPercent(selectedMarket.change), cls: pnlColor(selectedMarket.change) },
              { label: "Funding",     value: formatPercent((selectedMarket.fundingRate ?? 0) * 100), cls: pnlColor(selectedMarket.fundingRate ?? 0) },
            ].map(({ label, value, cls }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn("font-mono font-semibold text-sm", cls)}>{value}</p>
              </div>
            ))}
            <div>
              <p className="text-xs text-muted-foreground">Oracle</p>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
                <p className="text-sm">{selectedMarket.oracleStatus ?? "Healthy"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[
              { id: "price"  as const, icon: <BarChart3 className="h-4 w-4" /> },
              { id: "depth"  as const, icon: <Activity  className="h-4 w-4" /> },
              { id: "volume" as const, icon: <Layers    className="h-4 w-4" /> },
            ].map(({ id, icon }) => (
              <button key={id} onClick={() => setChartView(id)}
                className={cn("rounded p-1.5 transition-colors", chartView === id ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 border-b border-border bg-card p-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === "volume" ? (
              <BarChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem" }} />
                <Bar dataKey="volume" fill="var(--ultramarine-500)" />
              </BarChart>
            ) : (
              <AreaChart data={priceHistory}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="var(--ultramarine-500)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--ultramarine-500)" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" domain={["dataMin","dataMax"]} tickFormatter={(v) => formatUSD(v, true)} />
                <Tooltip formatter={(v: number) => formatUSD(v)} contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem" }} />
                <Area type="monotone" dataKey="price" stroke="var(--ultramarine-500)" fill="url(#priceGrad)" strokeWidth={2} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Positions Table */}
        <div className="h-64 overflow-y-auto border-b border-border bg-card">
          <div className="flex border-b border-border">
            <button className="border-b-2 border-primary px-4 py-2 text-sm font-medium">Positions ({positions.length})</button>
            <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Open Orders ({openOrders.length})</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted">
                <tr>
                  {["Market","Size","Entry","Current","PnL","Margin","Action"].map((h) => (
                    <th key={h} className="px-4 py-2 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, i) => (
                  <tr key={i} className="border-b border-border hover:bg-accent">
                    <td className="px-4 py-3 font-medium">{pos.market}</td>
                    <td className={cn("px-4 py-3 font-mono", pnlColor(pos.size))}>
                      {pos.size > 0 ? "+" : ""}{pos.size}
                    </td>
                    <td className="px-4 py-3 font-mono">{formatUSD(pos.entry)}</td>
                    <td className="px-4 py-3 font-mono">{formatUSD(pos.current)}</td>
                    <td className={cn("px-4 py-3 font-mono", pnlColor(pos.pnl))}>
                      {formatUSD(pos.pnl)} ({formatPercent(pos.pnlPercent)})
                    </td>
                    <td className="px-4 py-3 font-mono">{formatUSD(pos.margin)}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="destructive" onClick={() => closePosition(pos.market)}>Close</Button>
                    </td>
                  </tr>
                ))}
                {positions.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No open positions</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Entry */}
      <div className="flex flex-col overflow-hidden bg-card">
        <div className="border-b border-border p-4">
          <h3 className="mb-3 font-medium">Order Entry</h3>

          {/* Exec mode */}
          <div className="mb-4 flex gap-1 rounded-lg bg-accent p-1">
            {(["low-latency","batch"] as const).map((m) => (
              <button key={m} onClick={() => setExecMode(m)}
                className={cn("flex-1 rounded px-2 py-1 text-xs transition-colors",
                  execMode === m ? "bg-primary text-primary-foreground" : "hover:bg-background")}>
                {m === "low-latency" ? "Low Latency" : "Batch"}
              </button>
            ))}
          </div>

          {/* Side */}
          <div className="mb-4 flex gap-2">
            {(["long","short"] as const).map((side) => (
              <button key={side} onClick={() => setOrderSide(side)}
                className={cn("flex-1 rounded-lg py-2 font-medium capitalize transition-colors",
                  orderSide === side
                    ? side === "long" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
                    : "border border-border hover:bg-accent")}>
                {side}
              </button>
            ))}
          </div>

          {/* Type */}
          <div className="mb-4">
            <label className="mb-2 block text-sm text-muted-foreground">Order Type</label>
            <select value={orderType} onChange={(e) => setOrderType(e.target.value as OrderType)}
              className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm outline-none focus:border-ring">
              {["limit","market","trigger","twap","rfq"].map((t) => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          {orderType !== "market" && (
            <div className="mb-4">
              <label className="mb-2 block text-sm text-muted-foreground">Price</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm outline-none focus:border-ring" />
            </div>
          )}

          {/* Size */}
          <div className="mb-4">
            <label className="mb-2 block text-sm text-muted-foreground">Size</label>
            <input type="number" value={size} onChange={(e) => setSize(e.target.value)} placeholder="0.00"
              className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm outline-none focus:border-ring" />
          </div>

          {/* Leverage */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Leverage</label>
              <span className="text-sm font-medium">{formatLeverage(leverage)}</span>
            </div>
            <input type="range" min="1" max={selectedMarket.maxLeverage ?? 20} value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))} className="w-full" />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>1x</span><span>{selectedMarket.maxLeverage ?? 20}x</span>
            </div>
          </div>

          {lastError && (
            <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{lastError}</p>
          )}

          <Button className="w-full" variant={orderSide === "long" ? "primary" : "destructive"}
            onClick={handleSubmit} disabled={loading || !size}>
            {loading ? "Submitting…" : orderSide === "long" ? "Open Long" : "Open Short"}
          </Button>

          <div className="mt-4 space-y-2 rounded-lg bg-muted p-3 text-sm">
            {[
              ["Est. Margin",        formatUSD(estimatedMargin), ""],
              ["Liquidation Price",  formatUSD(liqPrice),        "text-destructive"],
              ["Fee",                formatUSD(estimatedFee),    ""],
            ].map(([label, value, cls]) => (
              <div key={label} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn("font-mono", cls)}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Open Orders */}
        <div className="flex-1 overflow-y-auto border-t border-border p-4">
          <h4 className="mb-3 font-medium">Open Orders ({openOrders.length})</h4>
          <div className="space-y-2">
            {openOrders.map((order, i) => (
              <div key={i} className="rounded-lg border border-border bg-background p-3">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-medium">{order.market}</p>
                    <p className="text-xs text-muted-foreground">{order.type} • {order.side}</p>
                  </div>
                  <button onClick={() => cancelOrder(order.market, i)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  {[["Size", String(order.size)], ["Price", formatUSD(order.price)], ["Filled", `${order.filled}%`]].map(([l,v]) => (
                    <div key={l} className="flex justify-between">
                      <span className="text-muted-foreground">{l}</span>
                      <span className="font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {openOrders.length === 0 && <p className="text-center text-sm text-muted-foreground">No open orders</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
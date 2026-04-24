import { useState } from "react";
import { DataCard } from "./DataCard";
import {
  Wallet,
  TrendingUp,
  Shield,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { usePortfolio } from "../hooks";
import { useChain } from "../hooks";
import { formatUSD } from "../lib/utils";
import { Button } from "./Button";
import { cn } from "../lib/utils";

const DEMO_MODE = true;

export function PortfolioMargin() {
  const { assets, exposures, summary } = usePortfolio();
  const { wallet, connect } = useChain();
  const [depositedTotal, setDepositedTotal] = useState(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [txLoading, setTxLoading] = useState(false);
  const [txMessage, setTxMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");

  // Use real equity if connected, otherwise mock summary
  const totalEquity =
    (wallet.connected ? wallet.accountEquity : summary.totalEquity) +
    depositedTotal;

  const handleDeposit = async () => {
    if (!wallet.connected) {
      await connect();
      setTxMessage("Please connect your wallet first, then try again.");
      return;
    }
    const amount = parseFloat(depositAmount);
    if (!depositAmount || amount <= 0) return;
    setTxLoading(true);
    setTxMessage(null);
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 1400));
      const hash = "0x" + Math.random().toString(16).slice(2).padEnd(64, "0");
      setDepositedTotal((prev) => prev + amount); // ← adds to equity
      setTxMessage(
        `✓ Deposited ${amount.toLocaleString()} USDC — tx: ${hash.slice(0, 18)}…`,
      );
      setDepositAmount("");
    }
    setTxLoading(false);
  };

  const handleWithdraw = async () => {
    if (!wallet.connected) {
      await connect();
      setTxMessage("Please connect your wallet first, then try again.");
      return;
    }
    const amount = parseFloat(withdrawAmount);
    if (!withdrawAmount || amount <= 0) return;
    if (amount > depositedTotal) {
      setTxMessage("Insufficient deposited balance to withdraw.");
      return;
    }
    setTxLoading(true);
    setTxMessage(null);
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 1400));
      const hash = "0x" + Math.random().toString(16).slice(2).padEnd(64, "0");
      setDepositedTotal((prev) => prev - amount); // ← removes from equity
      setTxMessage(
        `✓ Withdrew ${amount.toLocaleString()} USDC — tx: ${hash.slice(0, 18)}…`,
      );
      setWithdrawAmount("");
    }
    setTxLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ── Equity Cards ── */}
        <div className="grid grid-cols-4 gap-4">
          <DataCard
            label="Total Equity"
            value={formatUSD(totalEquity, true)}
            change={wallet.connected ? "Live balance" : "+12.4% today"}
            changeType="positive"
            icon={<Wallet className="h-5 w-5" />}
          />
          <DataCard
            label="Initial Margin"
            value={formatUSD(summary.initialMargin, true)}
            change={`${summary.imRatio}% of equity`}
            changeType="neutral"
            icon={<Shield className="h-5 w-5" />}
          />
          <DataCard
            label="Maintenance Margin"
            value={formatUSD(summary.maintenanceMargin, true)}
            change={`${summary.mmRatio}% of equity`}
            changeType="neutral"
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <DataCard
            label="Available Balance"
            value={formatUSD(summary.availableBalance, true)}
            change={`${summary.bufferPercent.toFixed(0)}% available`}
            changeType="positive"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* ── Deposit / Withdraw ── */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold" style={{ fontSize: "1.125rem" }}>
            Collateral Management
          </h3>

          {!wallet.connected && (
            <div className="mb-4 flex items-center justify-between rounded-lg bg-ultramarine-50 dark:bg-ultramarine-900/20 border border-ultramarine-200 dark:border-ultramarine-800 px-4 py-3">
              <p className="text-sm text-ultramarine-800 dark:text-ultramarine-200">
                Connect your wallet to deposit or withdraw collateral.
              </p>
              <Button size="sm" onClick={connect}>
                Connect Wallet
              </Button>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-4 flex gap-1 rounded-lg bg-accent p-1 w-48">
            {(["deposit", "withdraw"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setTxMessage(null);
                }}
                className={cn(
                  "flex-1 rounded px-3 py-1.5 text-sm capitalize transition-colors",
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-background",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Input */}
            <div className="space-y-3">
              <label className="block text-sm text-muted-foreground">
                {tab === "deposit"
                  ? "Deposit Amount (IUSD)"
                  : "Withdraw Amount (IUSD)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={tab === "deposit" ? depositAmount : withdrawAmount}
                  onChange={(e) =>
                    tab === "deposit"
                      ? setDepositAmount(e.target.value)
                      : setWithdrawAmount(e.target.value)
                  }
                  className="w-full rounded-lg border border-input bg-input-background px-3 py-2.5 text-sm outline-none focus:border-ring pr-16"
                />
                <button
                  onClick={() =>
                    tab === "deposit"
                      ? setDepositAmount(String(wallet.accountEquity))
                      : setWithdrawAmount(String(summary.availableBalance))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-ultramarine-500 hover:text-ultramarine-400 font-medium"
                >
                  MAX
                </button>
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2">
                {["100", "500", "1000", "5000"].map((amt) => (
                  <button
                    key={amt}
                    onClick={() =>
                      tab === "deposit"
                        ? setDepositAmount(amt)
                        : setWithdrawAmount(amt)
                    }
                    className="rounded border border-border px-2 py-1 text-xs hover:bg-accent transition-colors"
                  >
                    {amt}
                  </button>
                ))}
              </div>

              <Button
                className="w-full"
                onClick={tab === "deposit" ? handleDeposit : handleWithdraw}
                disabled={txLoading}
                variant={tab === "deposit" ? "primary" : "outline"}
              >
                {txLoading ? (
                  "Processing…"
                ) : tab === "deposit" ? (
                  <>
                    <ArrowDownCircle className="mr-2 h-4 w-4" />
                    Deposit IUSD
                  </>
                ) : (
                  <>
                    <ArrowUpCircle className="mr-2 h-4 w-4" />
                    Withdraw IUSD
                  </>
                )}
              </Button>

              {txMessage && (
                <p className="rounded-lg bg-success/10 border border-success/20 px-3 py-2 text-xs text-success">
                  {txMessage}
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-3 rounded-lg bg-muted p-4 text-sm">
              <h4 className="font-medium">Account Summary</h4>
              {[
                ["Wallet Balance", formatUSD(wallet.accountEquity)],
                ["Deposited", formatUSD(depositedTotal)], // ← real deposited total
                ["Total Equity", formatUSD(totalEquity)], // ← wallet + deposited
                [
                  "Available Margin",
                  formatUSD(summary.availableBalance + depositedTotal),
                ],
                ["Used Margin", formatUSD(summary.initialMargin)],
                [
                  "Health Ratio",
                  `${((totalEquity / Math.max(summary.maintenanceMargin, 1)) * 100).toFixed(0)}%`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Portfolio Composition ── */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>
            Portfolio Composition
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {[
                    "Asset",
                    "Amount",
                    "Value (USD)",
                    "Weight",
                    "Haircut",
                    "Adj. Value",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 font-medium text-muted-foreground ${i === 0 ? "text-left" : "text-right"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assets.map((asset, i) => (
                  <tr
                    key={i}
                    className="border-b border-border hover:bg-accent"
                  >
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
                    <td className="px-4 py-4 text-right font-mono">
                      {asset.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right font-mono">
                      {formatUSD(asset.value)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono">
                      {asset.weight}%
                    </td>
                    <td className="px-4 py-4 text-right font-mono">
                      {asset.haircut}
                    </td>
                    <td className="px-4 py-4 text-right font-mono">
                      {formatUSD(asset.value * asset.haircut)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-border">
                <tr>
                  <td className="px-4 py-4 font-semibold">Total</td>
                  <td />
                  <td className="px-4 py-4 text-right font-mono font-semibold">
                    {formatUSD(assets.reduce((s, a) => s + a.value, 0))}
                  </td>
                  <td className="px-4 py-4 text-right font-mono font-semibold">
                    100%
                  </td>
                  <td />
                  <td className="px-4 py-4 text-right font-mono font-semibold">
                    {formatUSD(
                      assets.reduce((s, a) => s + a.value * a.haircut, 0),
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Exposure ── */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>
            Net Exposure by Market
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={exposures} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                stroke="var(--muted-foreground)"
                tickFormatter={(v) => formatUSD(v, true)}
              />
              <YAxis
                dataKey="market"
                type="category"
                stroke="var(--muted-foreground)"
                width={110}
              />
              <Tooltip
                formatter={(v: number) => formatUSD(v)}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="exposure" radius={[0, 4, 4, 0]}>
                {exposures.map((e, i) => (
                  <Cell
                    key={i}
                    fill={
                      e.exposure > 0 ? "var(--success)" : "var(--destructive)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Margin Detail ── */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-6 font-semibold" style={{ fontSize: "1.125rem" }}>
            Margin Requirements Detail
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Initial Margin</h4>
              <div className="space-y-2">
                {[
                  ["Base Requirement", "$250,000"],
                  ["Option Premium", "$0"],
                  ["Add-on Margin", "$34,739"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-mono">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Total Initial</span>
                  <span className="font-mono">
                    {formatUSD(summary.initialMargin)}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">
                Maintenance Margin
              </h4>
              <div className="space-y-2">
                {[
                  ["Base Requirement", "$125,000"],
                  ["Option Premium", "$0"],
                  ["Add-on Margin", "$17,370"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-mono">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Total Maintenance</span>
                  <span className="font-mono">
                    {formatUSD(summary.maintenanceMargin)}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Margin Ratios</h4>
              <div className="space-y-2">
                {[
                  ["Initial Margin Ratio", `${summary.imRatio.toFixed(1)}%`],
                  ["Maint. Margin Ratio", `${summary.mmRatio.toFixed(1)}%`],
                  ["Current Usage", `${summary.usagePercent.toFixed(1)}%`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-mono text-success">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Margin Buffer</span>
                  <span className="font-mono text-success">
                    {summary.bufferPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

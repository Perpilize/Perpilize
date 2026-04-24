import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind class merger (already used in your mock components)
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Number formatters ─────────────────────────────────────────────────────

/**
 * Format a USD value. Handles compact notation for large numbers.
 * formatUSD(1234567)  → "$1.23M"
 * formatUSD(1234.56)  → "$1,234.56"
 */
export function formatUSD(value: number, compact = false): string {
  if (compact || Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a percentage with sign.
 * formatPercent(2.34)  → "+2.34%"
 * formatPercent(-1.12) → "-1.12%"
 */
export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format a token amount with appropriate decimal places.
 * formatAmount(2.5, "BTC")  → "2.5000 BTC"
 * formatAmount(47.3, "ETH") → "47.3000 ETH"
 */
export function formatAmount(value: number, symbol?: string, decimals = 4): string {
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return symbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Format a large volume string. Accepts raw numbers or human-readable strings.
 * formatVolume(1_200_000_000) → "1.2B"
 * formatVolume("1.2B")        → "1.2B" (passthrough)
 */
export function formatVolume(value: number | string): string {
  if (typeof value === "string") return value;
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

/**
 * Format a funding rate.
 * formatFundingRate(0.0087) → "+0.0087%"
 */
export function formatFundingRate(rate: number): string {
  return formatPercent(rate * 100);
}

/**
 * Format a leverage multiplier.
 * formatLeverage(10) → "10x"
 */
export function formatLeverage(leverage: number): string {
  return `${leverage}x`;
}

// ─── PnL helpers ───────────────────────────────────────────────────────────

/** Returns "positive" | "negative" | "neutral" for color styling */
export function pnlType(value: number): "positive" | "negative" | "neutral" {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

/** Returns "text-success" | "text-destructive" tailwind class */
export function pnlColor(value: number): string {
  return value >= 0 ? "text-success" : "text-destructive";
}

// ─── Price helpers ─────────────────────────────────────────────────────────

/**
 * Compute unrealized PnL for a position.
 * Long:  (current - entry) * size
 * Short: (entry - current) * |size|
 */
export function calcPnL(size: number, entry: number, current: number): number {
  if (size >= 0) return (current - entry) * size;
  return (entry - current) * Math.abs(size);
}

/**
 * Compute PnL as a percentage of initial margin.
 */
export function calcPnLPercent(pnl: number, margin: number): number {
  if (margin === 0) return 0;
  return (pnl / margin) * 100;
}

/**
 * Estimate margin required for a position.
 * margin = notional * imr
 */
export function calcMarginRequired(size: number, price: number, imr: number): number {
  return Math.abs(size) * price * imr;
}

/**
 * Estimate liquidation price.
 * Long:  entry * (1 - 1/leverage + mmr)
 * Short: entry * (1 + 1/leverage - mmr)
 */
export function calcLiquidationPrice(
  entry: number,
  leverage: number,
  side: "long" | "short",
  mmr = 0.03
): number {
  if (side === "long") return entry * (1 - 1 / leverage + mmr);
  return entry * (1 + 1 / leverage - mmr);
}

// ─── Health ratio ──────────────────────────────────────────────────────────

/** Returns a color class based on health ratio threshold */
export function healthRatioColor(ratio: number): string {
  if (ratio >= 1.5) return "text-success";
  if (ratio >= 1.1) return "text-warning";
  return "text-destructive";
}

// ─── Misc ──────────────────────────────────────────────────────────────────

/** Truncate a bech32 address for display: "init1abc...xyz" */
export function truncateAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars + 5)}...${address.slice(-chars)}`;
}

/** Sleep utility for async flows */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
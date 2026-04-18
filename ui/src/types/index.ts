// ─── Market ────────────────────────────────────────────────────────────────

export interface Market {
  symbol: string;
  price: number;
  change: number;   // 24h % change
  volume: string;   // human-readable e.g. "1.2B"
  fundingRate?: number;  // e.g. 0.0087
  oracleStatus?: "Healthy" | "Degraded" | "Stale";
  maxLeverage?: number;
  makerFee?: number;
  takerFee?: number;
  minOrder?: number;
  status?: "Active" | "Paused" | "Delisted";
}

// ─── Position ──────────────────────────────────────────────────────────────

export type PositionSide = "long" | "short";

export interface Position {
  market: string;
  size: number;           // positive = long, negative = short
  entry: number;
  current: number;
  pnl: number;
  pnlPercent: number;
  margin: number;
}

// ─── Order ─────────────────────────────────────────────────────────────────

export type OrderType = "limit" | "market" | "trigger" | "twap" | "rfq";
export type OrderSide = "Long" | "Short";
export type OrderStatus = "Open" | "Filled" | "Cancelled" | "Partial";
export type ExecutionMode = "low-latency" | "batch";

export interface Order {
  market: string;
  type: string;
  side: OrderSide;
  size: number;
  price: number;
  filled: number;   // % 0-100
  status: OrderStatus;
}

export interface OrderRequest {
  market: string;
  side: PositionSide;
  type: OrderType;
  size: number;
  price?: number;
  leverage?: number;
  executionMode?: ExecutionMode;
}

// ─── Portfolio / Margin ────────────────────────────────────────────────────

export interface PortfolioAsset {
  asset: string;
  amount: number;
  value: number;
  weight: number;     // %
  haircut: number;    // 0-1
}

export interface MarginSummary {
  totalEquity: number;
  initialMargin: number;
  maintenanceMargin: number;
  availableBalance: number;
  imRatio: number;    // %
  mmRatio: number;    // %
  usagePercent: number;
  bufferPercent: number;
}

export interface ExposureEntry {
  market: string;
  exposure: number;   // positive = net long, negative = net short
  type: "long" | "short";
}

// ─── Risk ──────────────────────────────────────────────────────────────────

export type RiskLevel = "Low" | "Medium" | "High";

export interface RiskMetrics {
  var95: number;
  var99: number;
  liquidationDistance: number;  // %
  maxDrawdown30d: number;
  sharpe30d: number;
}

export interface PositionRisk {
  market: string;
  notional: number;
  delta: number;
  gamma: number;
  margin: number;
  riskScore: RiskLevel;
}

export interface RiskLimit {
  label: string;
  current: number;
  max: number;
  unit: string;
}

export interface LiquidationPoint {
  price: number;
  impact: number;   // % 0-100
}

// ─── Oracle ────────────────────────────────────────────────────────────────

export interface OracleSource {
  asset: string;
  source: string;
  status: "Healthy" | "Degraded" | "Stale";
  latency: number;    // ms
  deviation: number;  // %
}

// ─── Subaccount ────────────────────────────────────────────────────────────

export type Permission = "trade" | "view" | "transfer" | "admin";

export interface Subaccount {
  id: string;
  name: string;
  permissions: Permission[];
  equity: number;
  margin: number;
  positions: number;
  users: string[];
}

export interface Role {
  role: string;
  users: number;
  permissions: string[];
}

// ─── Admin / System ────────────────────────────────────────────────────────

export interface MarketConfig {
  symbol: string;
  status: "Active" | "Paused" | "Delisted";
  maxLeverage: number;
  makerFee: number;
  takerFee: number;
  minOrder: number;
}

export interface RiskParams {
  maxAccountLeverage: number;
  initialMarginRatio: number;
  maintenanceMarginRatio: number;
  liquidationFee: number;
}

export interface AssetHaircut {
  asset: string;
  haircut: number;
}

export interface SystemStatus {
  allOperational: boolean;
  activeMarkets: number;
  totalUsers: number;
  volume24h: string;
  oracleHealth: string;
  uptime: string;
}

// ─── Chain / Wallet ────────────────────────────────────────────────────────

export interface ChainStatus {
  name: string;
  blockHeight: number;
  connected: boolean;
  finality: string;   // e.g. "2.1s avg"
}

export interface WalletState {
  address: string | null;
  connected: boolean;
  accountEquity: number;
}

// ─── Chart data ────────────────────────────────────────────────────────────

export interface PricePoint {
  time: number;
  price: number;
  volume?: number;
}

export interface VarPoint {
  day: number;
  var95: number;
  var99: number;
}

export interface DepthPoint {
  price: number;
  amount: number;
  type: "bid" | "ask";
}
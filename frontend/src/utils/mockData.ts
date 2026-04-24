import type {
  Market, Position, Order, PortfolioAsset, ExposureEntry,
  RiskMetrics, PositionRisk, RiskLimit, LiquidationPoint,
  OracleSource, Subaccount, Role, MarketConfig, SystemStatus,
  PricePoint, VarPoint, DepthPoint, ChainStatus, WalletState,
} from "../types";

// ─── Markets ───────────────────────────────────────────────────────────────

export const MOCK_MARKETS: Market[] = [
  { symbol: "BTC-PERP", price: 42156.82, change: 2.34,  volume: "1.2B", fundingRate: 0.0087, oracleStatus: "Healthy", maxLeverage: 20, makerFee: 0.02, takerFee: 0.05, minOrder: 0.001, status: "Active" },
  { symbol: "ETH-PERP", price: 2234.56,  change: -1.12, volume: "842M", fundingRate: -0.0032, oracleStatus: "Healthy", maxLeverage: 20, makerFee: 0.02, takerFee: 0.05, minOrder: 0.01,  status: "Active" },
  { symbol: "SOL-PERP", price: 98.23,    change: 5.67,  volume: "234M", fundingRate: 0.0123, oracleStatus: "Healthy", maxLeverage: 15, makerFee: 0.03, takerFee: 0.06, minOrder: 1.0,   status: "Active" },
  { symbol: "INIT-PERP",price: 4.56,     change: 3.21,  volume: "89M",  fundingRate: 0.0045, oracleStatus: "Healthy", maxLeverage: 10, makerFee: 0.03, takerFee: 0.06, minOrder: 10.0,  status: "Active" },
];

// ─── Positions ─────────────────────────────────────────────────────────────

export const MOCK_POSITIONS: Position[] = [
  { market: "BTC-PERP", size: 2.5,   entry: 41200, current: 42156.82, pnl: 2391.05,  pnlPercent: 2.31,  margin: 10500 },
  { market: "ETH-PERP", size: -15.0, entry: 2280,  current: 2234.56,  pnl: 681.6,    pnlPercent: 1.99,  margin: 8200  },
];

// ─── Open Orders ───────────────────────────────────────────────────────────

export const MOCK_OPEN_ORDERS: Order[] = [
  { market: "BTC-PERP", type: "Limit",   side: "Long",  size: 1.0,   price: 41500, filled: 0, status: "Open" },
  { market: "SOL-PERP", type: "Trigger", side: "Short", size: 100.0, price: 102.5, filled: 0, status: "Open" },
];

// ─── Portfolio ─────────────────────────────────────────────────────────────

export const MOCK_PORTFOLIO_ASSETS: PortfolioAsset[] = [
  { asset: "BTC",  amount: 2.5,   value: 105392.05, weight: 45.2, haircut: 0.95 },
  { asset: "ETH",  amount: 47.3,  value: 105653.99, weight: 45.3, haircut: 0.93 },
  { asset: "USDC", amount: 22000, value: 22000,      weight: 9.4,  haircut: 1.0  },
];

export const MOCK_EXPOSURE_DATA: ExposureEntry[] = [
  { market: "BTC-PERP",  exposure: 105000,  type: "long"  },
  { market: "ETH-PERP",  exposure: -33500,  type: "short" },
  { market: "SOL-PERP",  exposure: 9800,    type: "long"  },
  { market: "INIT-PERP", exposure: -4560,   type: "short" },
];

// ─── Risk ──────────────────────────────────────────────────────────────────

export const MOCK_RISK_METRICS: RiskMetrics = {
  var95: 35821,
  var99: 51200,
  liquidationDistance: 18.2,
  maxDrawdown30d: 142350,
  sharpe30d: 2.34,
};

export const MOCK_POSITION_RISK: PositionRisk[] = [
  { market: "BTC-PERP", notional: 105392, delta: 2.5,    gamma: 0.023,  margin: 10539, riskScore: "Medium" },
  { market: "ETH-PERP", notional: 72518,  delta: -15.0,  gamma: -0.041, margin: 7252,  riskScore: "Low"    },
  { market: "SOL-PERP", notional: 9823,   delta: 100.0,  gamma: 0.156,  margin: 982,   riskScore: "High"   },
];

export const MOCK_RISK_LIMITS: RiskLimit[] = [
  { label: "Max Position Size", current: 45, max: 50,    unit: "%" },
  { label: "Daily Loss Limit",  current: 12, max: 50,    unit: "K" },
  { label: "Leverage Usage",    current: 8,  max: 20,    unit: "x" },
];

export const MOCK_LIQUIDATION_CURVE: LiquidationPoint[] = [
  { price: 38000, impact: 0   },
  { price: 39000, impact: 0   },
  { price: 40000, impact: 15  },
  { price: 40500, impact: 35  },
  { price: 41000, impact: 58  },
  { price: 41500, impact: 75  },
  { price: 42000, impact: 85  },
  { price: 42500, impact: 92  },
  { price: 43000, impact: 100 },
];

// ─── Oracle ────────────────────────────────────────────────────────────────

export const MOCK_ORACLE_SOURCES: OracleSource[] = [
  { asset: "BTC",  source: "Initia Oracle Aggregator", status: "Healthy", latency: 245, deviation: 0.02 },
  { asset: "ETH",  source: "Initia Oracle Aggregator", status: "Healthy", latency: 238, deviation: 0.03 },
  { asset: "SOL",  source: "Chainlink",                status: "Healthy", latency: 412, deviation: 0.05 },
  { asset: "INIT", source: "Initia L1 Direct",         status: "Healthy", latency: 125, deviation: 0.01 },
];

// ─── Subaccounts ───────────────────────────────────────────────────────────

export const MOCK_SUBACCOUNTS: Subaccount[] = [
  { id: "sa_001", name: "Trading Desk Alpha",    permissions: ["trade","view","transfer"], equity: 1250000, margin: 125000, positions: 12, users: ["trader_01","trader_02"] },
  { id: "sa_002", name: "Market Making",          permissions: ["trade","view"],            equity: 875000,  margin: 87500,  positions: 8,  users: ["mm_01"] },
  { id: "sa_003", name: "Research & Analytics",   permissions: ["view"],                    equity: 0,       margin: 0,      positions: 0,  users: ["analyst_01","analyst_02","analyst_03"] },
];

export const MOCK_ROLES: Role[] = [
  { role: "Admin",   users: 2, permissions: ["All permissions"] },
  { role: "Trader",  users: 3, permissions: ["Trade", "View positions", "Modify orders"] },
  { role: "Analyst", users: 3, permissions: ["View positions", "Export data"] },
  { role: "Viewer",  users: 5, permissions: ["View positions"] },
];

// ─── Admin ─────────────────────────────────────────────────────────────────

export const MOCK_MARKET_CONFIGS: MarketConfig[] = [
  { symbol: "BTC-PERP",  status: "Active", maxLeverage: 20, makerFee: 0.02, takerFee: 0.05, minOrder: 0.001 },
  { symbol: "ETH-PERP",  status: "Active", maxLeverage: 20, makerFee: 0.02, takerFee: 0.05, minOrder: 0.01  },
  { symbol: "SOL-PERP",  status: "Active", maxLeverage: 15, makerFee: 0.03, takerFee: 0.06, minOrder: 1.0   },
];

export const MOCK_SYSTEM_STATUS: SystemStatus = {
  allOperational: true,
  activeMarkets: 4,
  totalUsers: 247,
  volume24h: "$2.4B",
  oracleHealth: "100%",
  uptime: "99.98%",
};

// ─── Chain ─────────────────────────────────────────────────────────────────

export const MOCK_CHAIN_STATUS: ChainStatus = {
  name: "Perpilize Minitia",
  blockHeight: 8_234_192,
  connected: true,
  finality: "2.1s avg",
};


// ─── Chart generators ──────────────────────────────────────────────────────

export function generatePriceData(points = 100, base = 42000, variance = 2000): PricePoint[] {
  return Array.from({ length: points }, (_, i) => ({
    time: i,
    price: base + Math.random() * variance,
    volume: Math.random() * 1_000_000,
  }));
}

export const MOCK_WALLET: WalletState = {
  address: null,       
  connected: false,    
  accountEquity: 0,    
};

export function generateVarHistory(days = 30): VarPoint[] {
  return Array.from({ length: days }, (_, i) => ({
    day: i,
    var95: 25000 + Math.random() * 15000,
    var99: 35000 + Math.random() * 20000,
  }));
}

export function generateDepthData(midPrice = 41500, levels = 20): DepthPoint[] {
  return [
    ...Array.from({ length: levels }, (_, i) => ({
      price: midPrice - i * 10,
      amount: (levels - i) * 100,
      type: "bid" as const,
    })),
    ...Array.from({ length: levels }, (_, i) => ({
      price: midPrice + i * 10,
      amount: i * 100,
      type: "ask" as const,
    })),
  ];
}

export function generateLatencyData(points = 50): { value: number }[] {
  return Array.from({ length: points }, () => ({ value: 0.8 + Math.random() * 0.4 }));
}

export function generateThroughputData(points = 50): { value: number }[] {
  return Array.from({ length: points }, () => ({ value: 45000 + Math.random() * 5000 }));
}
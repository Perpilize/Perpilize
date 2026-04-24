import { useState, useEffect, useCallback } from "react";
import type {
  Market, Position, Order, OrderRequest, PortfolioAsset,
  ExposureEntry, MarginSummary, RiskMetrics, PositionRisk,
  OracleSource, Subaccount, ChainStatus, WalletState,
} from "../types";
import {
  MOCK_MARKETS, MOCK_POSITIONS, MOCK_OPEN_ORDERS,
  MOCK_PORTFOLIO_ASSETS, MOCK_EXPOSURE_DATA,
  MOCK_RISK_METRICS, MOCK_POSITION_RISK, MOCK_ORACLE_SOURCES,
  MOCK_SUBACCOUNTS, MOCK_CHAIN_STATUS,
  generatePriceData,
} from "../utils/mockData";
import { calcPnL, calcPnLPercent } from "../lib/utils";
import { usePerpilizeWallet } from "../lib/wallet";
import { openPosition, getEvmSigner } from "../lib/contracts";
import { restUrl } from "../lib/rpc";
import { ethers } from "ethers";


const DEMO_MODE = true;

interface UseMarketsReturn {
  markets: Market[];
  selectedMarket: Market;
  selectMarket: (symbol: string) => void;
  loading: boolean;
}

export function useMarkets(): UseMarketsReturn {
  const [markets, setMarkets] = useState<Market[]>(MOCK_MARKETS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(MOCK_MARKETS[0].symbol);
  const [loading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets((prev) =>
        prev.map((m) => ({
          ...m,
          price: m.price * (1 + (Math.random() - 0.5) * 0.001),
          change: m.change + (Math.random() - 0.5) * 0.05,
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const selectedMarket = markets.find((m) => m.symbol === selectedSymbol) ?? markets[0];
  const selectMarket = useCallback((symbol: string) => setSelectedSymbol(symbol), []);

  return { markets, selectedMarket, selectMarket, loading };
}

// ─── usePositions ──────────────────────────────────────────────────────────

interface UsePositionsReturn {
  positions: Position[];
  totalPnL: number;
  totalMargin: number;
  closePosition: (market: string) => Promise<void>;
  loading: boolean;
}

export function usePositions(currentPrices: Record<string, number> = {}): UsePositionsReturn {
  const [positions, setPositions] = useState<Position[]>(MOCK_POSITIONS);
  const [loading, setLoading] = useState(false);

  const updatedPositions = positions.map((pos) => {
    const current = currentPrices[pos.market] ?? pos.current;
    const pnl = calcPnL(pos.size, pos.entry, current);
    const pnlPercent = calcPnLPercent(pnl, pos.margin);
    return { ...pos, current, pnl, pnlPercent };
  });

  const totalPnL = updatedPositions.reduce((sum, p) => sum + p.pnl, 0);
  const totalMargin = updatedPositions.reduce((sum, p) => sum + p.margin, 0);

  const closePosition = useCallback(async (market: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setPositions((prev) => prev.filter((p) => p.market !== market));
    setLoading(false);
  }, []);

  return { positions: updatedPositions, totalPnL, totalMargin, closePosition, loading };
}

// ─── useOrders ─────────────────────────────────────────────────────────────

interface UseOrdersReturn {
  openOrders: Order[];
  submitOrder: (req: OrderRequest) => Promise<void>;
  cancelOrder: (market: string, index: number) => Promise<void>;
  loading: boolean;
  lastError: string | null;
  estimatedMargin: number;
  estimatedFee: number;
  liquidationPrice: number;
}

export function useOrders(selectedMarket: Market): UseOrdersReturn {
  const [openOrders, setOpenOrders] = useState<Order[]>(MOCK_OPEN_ORDERS);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const { connected, connect, requestTx, address } = usePerpilizeWallet();

  const imr = 0.05;
  const takerFeeRate = 0.0005;
  const size = 1;
  const leverage = 10;

  const estimatedMargin = Math.abs(size) * selectedMarket.price * imr;
  const estimatedFee = Math.abs(size) * selectedMarket.price * takerFeeRate;
  const liquidationPrice = selectedMarket.price * (1 - 1 / leverage + 0.03);

  const submitOrder = useCallback(
  async (req: OrderRequest) => {
    setLastError(null);

    if (!connected || !address) {
      try {
        await connect();
      } catch {
        setLastError("Please connect your wallet to trade.");
        return;
      }
      return;
    }

    setLoading(true);

    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 1200));
      const fakeTxHash = "0x" + Math.random().toString(16).slice(2).padEnd(64, "0");
      console.log(`[DEMO] Order submitted — tx: ${fakeTxHash}`);
      console.log(`[DEMO] ${req.side.toUpperCase()} ${req.size} ${req.market} @ ${req.price ?? "market"} x${req.leverage}`);

      if (req.type !== "market") {
        const newOrder: Order = {
          market: req.market,
          type: req.type.charAt(0).toUpperCase() + req.type.slice(1),
          side: req.side === "long" ? "Long" : "Short",
          size: req.size,
          price: req.price ?? selectedMarket.price,
          filled: 0,
          status: "Open",
        };
        setOpenOrders((prev) => [newOrder, ...prev]);
      } else {
        // Market order: add as filled position immediately
        const newOrder: Order = {
          market: req.market,
          type: "Market",
          side: req.side === "long" ? "Long" : "Short",
          size: req.size,
          price: selectedMarket.price,
          filled: 100,
          status: "Filled",
        };
        setOpenOrders((prev) => [newOrder, ...prev]);
      }

      setLoading(false);
      return;
    }

    // Real tx path (used when DEMO_MODE = false)
    try {
      const signer = await getEvmSigner();
      const sizeScaled = BigInt(
        Math.round(req.size * (req.side === "long" ? 1 : -1) * 1e18)
      );
      const priceScaled = ethers.parseEther(String(req.price ?? selectedMarket.price));
      await openPosition(signer, req.market, sizeScaled, priceScaled);

      if (req.type !== "market") {
        const newOrder: Order = {
          market: req.market,
          type: req.type.charAt(0).toUpperCase() + req.type.slice(1),
          side: req.side === "long" ? "Long" : "Short",
          size: req.size,
          price: req.price ?? selectedMarket.price,
          filled: 0,
          status: "Open",
        };
        setOpenOrders((prev) => [newOrder, ...prev]);
      }
    } catch {
      try {
        await requestTx({
          messages: [
            {
              typeUrl: "/perpilize.settlement.MsgExecuteTrade",
              value: {
                sender: address,
                market: req.market,
                side: req.side,
                size: String(req.size),
                price: String(req.price ?? selectedMarket.price),
                leverage: String(req.leverage),
              },
            },
          ],
        });
      } catch (txErr: any) {
        setLastError(txErr?.message ?? "Order submission failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  },
  [selectedMarket, connected, connect, requestTx, address]
);

  const cancelOrder = useCallback(async (_market: string, index: number) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setOpenOrders((prev) => prev.filter((_, i) => i !== index));
    setLoading(false);
  }, []);

  return {
    openOrders, submitOrder, cancelOrder,
    loading, lastError,
    estimatedMargin, estimatedFee, liquidationPrice,
  };
}

// ─── usePortfolio ──────────────────────────────────────────────────────────

interface UsePortfolioReturn {
  assets: PortfolioAsset[];
  exposures: ExposureEntry[];
  summary: MarginSummary;
}

export function usePortfolio(): UsePortfolioReturn {
  const [assets] = useState<PortfolioAsset[]>(MOCK_PORTFOLIO_ASSETS);
  const [exposures] = useState<ExposureEntry[]>(MOCK_EXPOSURE_DATA);

  const totalValue = assets.reduce((s, a) => s + a.value, 0);
  const imr = 0.1;
  const mmr = 0.05;

  const summary: MarginSummary = {
    totalEquity: totalValue,
    initialMargin: totalValue * imr,
    maintenanceMargin: totalValue * mmr,
    availableBalance: totalValue * (1 - imr),
    imRatio: imr * 100,
    mmRatio: mmr * 100,
    usagePercent: imr * 100,
    bufferPercent: (1 - imr) * 100,
  };

  return { assets, exposures, summary };
}

// ─── useRisk ───────────────────────────────────────────────────────────────

interface UseRiskReturn {
  metrics: RiskMetrics;
  positionRisk: PositionRisk[];
}

export function useRisk(): UseRiskReturn {
  return { metrics: MOCK_RISK_METRICS, positionRisk: MOCK_POSITION_RISK };
}

// ─── useOracle ─────────────────────────────────────────────────────────────

interface UseOracleReturn {
  sources: OracleSource[];
  allHealthy: boolean;
}

export function useOracle(): UseOracleReturn {
  const [sources] = useState<OracleSource[]>(MOCK_ORACLE_SOURCES);
  const allHealthy = sources.every((s) => s.status === "Healthy");
  return { sources, allHealthy };
}

// ─── useSubaccounts ────────────────────────────────────────────────────────

interface UseSubaccountsReturn {
  subaccounts: Subaccount[];
  totalEquity: number;
  totalPositions: number;
}

export function useSubaccounts(): UseSubaccountsReturn {
  const [subaccounts] = useState<Subaccount[]>(MOCK_SUBACCOUNTS);
  const totalEquity = subaccounts.reduce((s, a) => s + a.equity, 0);
  const totalPositions = subaccounts.reduce((s, a) => s + a.positions, 0);
  return { subaccounts, totalEquity, totalPositions };
}

// ─── useChain ──────────────────────────────────────────────────────────────

interface UseChainReturn {
  chain: ChainStatus;
  wallet: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useChain(): UseChainReturn {
  const [chain, setChain] = useState<ChainStatus>(MOCK_CHAIN_STATUS);
  const [accountEquity, setAccountEquity] = useState(0);
  const { address, connected, connect: walletConnect, viewWallet } = usePerpilizeWallet();

  // Block ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setChain((prev) => ({ ...prev, blockHeight: prev.blockHeight + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real USDC balance from testnet REST
  useEffect(() => {
    if (!address) { setAccountEquity(0); return; }

    async function fetchBalance() {
      try {
        const res = await fetch(
          `${restUrl}/cosmos/bank/v1beta1/balances/${address}`
        );
        const data = await res.json();
        const balances: { denom: string; amount: string }[] = data.balances ?? [];
        const usdc = balances.find((b) => b.denom === "uusdc");
        // uusdc has 6 decimals
        setAccountEquity(usdc ? Number(usdc.amount) / 1_000_000 : 0);
      } catch {
        setAccountEquity(0);
      }
    }

    fetchBalance();
    const interval = setInterval(fetchBalance, 10_000); // refresh every 10s
    return () => clearInterval(interval);
  }, [address]);

  const wallet: WalletState = {
    address: address ?? null,
    connected,
    accountEquity,
  };

  const connect = useCallback(async () => {
    await walletConnect();
  }, [walletConnect]);

  const disconnect = useCallback(() => {
    viewWallet();
  }, [viewWallet]);

  return { chain, wallet, connect, disconnect };
}

// ─── usePriceHistory ───────────────────────────────────────────────────────

interface UsePriceHistoryReturn {
  data: { time: number; price: number; volume?: number }[];
  refresh: () => void;
}

export function usePriceHistory(symbol: string): UsePriceHistoryReturn {
  const basePrice = symbol.startsWith("BTC") ? 42000 : symbol.startsWith("ETH") ? 2200 : 98;
  const [data, setData] = useState(() => generatePriceData(100, basePrice));

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        const newPoint = {
          time: last.time + 1,
          price: last.price * (1 + (Math.random() - 0.5) * 0.002),
          volume: Math.random() * 1_000_000,
        };
        return [...prev.slice(-199), newPoint];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [symbol]);

  const refresh = useCallback(() => setData(generatePriceData(100, basePrice)), [basePrice]);

  return { data, refresh };
}
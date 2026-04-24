// ── Network endpoints ───────────────────────────────────────────────────────
// Switch between devnet / testnet by changing NETWORK

const NETWORKS = {
  devnet: {
    chainId:     "perpilize-1",
    rpcUrl:      "http://localhost:26657",
    evmRpcUrl:   "http://localhost:8545",
    restUrl:     "http://localhost:1317",
    wsUrl:       "ws://localhost:8080",
    explorerUrl: "",
  },
  testnet: {
    chainId:     "perpilize-testnet-1",
    rpcUrl:      "https://rpc.perpilize.initia.xyz",
    evmRpcUrl:   "https://evm-rpc.perpilize.initia.xyz",
    restUrl:     "https://rest.perpilize.initia.xyz",
    wsUrl:       "wss://ws.perpilize.initia.xyz",
    explorerUrl: "https://scan.initia.xyz/perpilize-testnet-1",
  },
} as const;

export const NETWORK = (import.meta.env.VITE_NETWORK as keyof typeof NETWORKS) ?? "devnet";
export const { chainId, rpcUrl, evmRpcUrl, restUrl, wsUrl, explorerUrl } = NETWORKS[NETWORK];

// ── Live data subscription ──────────────────────────────────────────────────

export interface TradeEvent {
  market:    string;
  price:     number;
  size:      number;
  timestamp: number;
  maker:     string;
  taker:     string;
}

/**
 * Subscribe to live trade events from the indexer WebSocket.
 * Returns a cleanup function — call it on component unmount.
 */
export function subscribeTrades(callback: (trade: TradeEvent) => void): () => void {
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function connect() {
    ws = new WebSocket(`${wsUrl}/trades`);

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data) as TradeEvent;
        callback(data);
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      // Reconnect after 3s on unexpected close
      reconnectTimer = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws?.close();
  }

  connect();

  return () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    ws?.close();
  };
}

/**
 * Subscribe to oracle price updates for a specific market.
 */
export function subscribePrice(
  market: string,
  callback: (price: number) => void,
): () => void {
  return subscribeTrades((trade) => {
    if (trade.market === market) {
      callback(trade.price);
    }
  });
}
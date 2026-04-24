import { ethers } from "ethers";

export const PRECOMPILE_ADDRESSES = {
  ORACLE:     "0x0000000000000000000000000000000000000901",
  FUNDING:    "0x0000000000000000000000000000000000000902",
  POSITION:   "0x0000000000000000000000000000000000000903",
  MARGIN:     "0x0000000000000000000000000000000000000904",
  SETTLEMENT: "0x0000000000000000000000000000000000000905",
} as const;

// ── ABIs ────────────────────────────────────────────────────────────────────

const MARGIN_ABI = [
  "function deposit(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function getHealthRatio(address account) view returns (uint256)",
  "function isLiquidatable(address account) view returns (bool)",
];

const SETTLEMENT_ABI = [
  "function executeTrade(bytes32 marketId, int256 size, uint256 price) returns (bool)",
];

const ORACLE_ABI = [
  "function getPrice(bytes32 marketId) view returns (uint256 price, uint256 timestamp)",
];

const POSITION_ABI = [
  "function getPosition(address owner, bytes32 marketId) view returns (int256 size, uint256 avgEntryPrice, uint256 margin)",
];

// ── Provider helper ─────────────────────────────────────────────────────────

function getProvider(): ethers.BrowserProvider {
  const win = window as any;
  if (!win.ethereum) {
    throw new Error("No EVM wallet detected. Please install Metamask or use the Initia wallet.");
  }
  return new ethers.BrowserProvider(win.ethereum);
}

// ── Contract factories ──────────────────────────────────────────────────────

export function getMarginContract(signer: ethers.Signer) {
  return new ethers.Contract(PRECOMPILE_ADDRESSES.MARGIN, MARGIN_ABI, signer);
}

export function getSettlementContract(signer: ethers.Signer) {
  return new ethers.Contract(PRECOMPILE_ADDRESSES.SETTLEMENT, SETTLEMENT_ABI, signer);
}

export function getOracleContract(provider: ethers.Provider) {
  return new ethers.Contract(PRECOMPILE_ADDRESSES.ORACLE, ORACLE_ABI, provider);
}

export function getPositionContract(provider: ethers.Provider) {
  return new ethers.Contract(PRECOMPILE_ADDRESSES.POSITION, POSITION_ABI, provider);
}

// ── High-level actions ──────────────────────────────────────────────────────

export async function depositCollateral(signer: ethers.Signer, amount: bigint) {
  const contract = getMarginContract(signer);
  const tx = await contract.deposit(amount);
  return tx.wait();
}

export async function openPosition(
  signer: ethers.Signer,
  market: string,
  size: bigint,
  price: bigint,
) {
  const contract = getSettlementContract(signer);
  const marketBytes = ethers.encodeBytes32String(market);
  const tx = await contract.executeTrade(marketBytes, size, price);
  return tx.wait();
}

export async function getMarkPrice(
  provider: ethers.Provider,
  market: string,
): Promise<number> {
  const contract = getOracleContract(provider);
  const marketBytes = ethers.encodeBytes32String(market);
  const [price] = await contract.getPrice(marketBytes);
  return Number(ethers.formatEther(price));
}

export async function getHealthRatio(
  provider: ethers.Provider,
  address: string,
): Promise<number> {
  const contract = new ethers.Contract(
    PRECOMPILE_ADDRESSES.MARGIN,
    MARGIN_ABI,
    provider,
  );
  const ratio = await contract.getHealthRatio(address);
  return Number(ethers.formatEther(ratio));
}

// ── EVM signer helper (used by hooks/index.ts) ──────────────────────────────

export async function getEvmSigner(): Promise<ethers.Signer> {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}
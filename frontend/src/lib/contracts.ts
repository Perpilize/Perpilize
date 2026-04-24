import { ethers } from "ethers";

// ── Precompile addresses ────────────────────────────────────────────────────
// These are fixed addresses where Cosmos precompiles are exposed as EVM contracts.
// Replace with your actual deployed addresses after devnet launch.

export const PRECOMPILE_ADDRESSES = {
  MARGIN:     "0x0000000000000000000000000000000000000901",
  SETTLEMENT: "0x0000000000000000000000000000000000000902",
  ORACLE:     "0x0000000000000000000000000000000000000903",
  POSITION:   "0x0000000000000000000000000000000000000904",
  FUNDING:    "0x0000000000000000000000000000000000000905",
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

/**
 * Deposit USDC collateral into the margin module.
 * amount is in USDC with 6 decimals (e.g. 1000_000000 = $1,000)
 */
export async function depositCollateral(signer: ethers.Signer, amount: bigint) {
  const contract = getMarginContract(signer);
  const tx = await contract.deposit(amount);
  return tx.wait();
}

/**
 * Open a perpetual position via the settlement precompile.
 * size > 0 = long, size < 0 = short
 * price is 18dp scaled (use ethers.parseEther for dollar amounts)
 */
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

/**
 * Fetch the mark price for a market from the oracle precompile.
 * Returns price as a number (divided back from 18dp).
 */
export async function getMarkPrice(
  provider: ethers.Provider,
  market: string,
): Promise<number> {
  const contract = getOracleContract(provider);
  const marketBytes = ethers.encodeBytes32String(market);
  const [price] = await contract.getPrice(marketBytes);
  return Number(ethers.formatEther(price));
}

/**
 * Get the health ratio for an account (1.0 = at maintenance margin).
 * Returns as a number (divided back from 18dp).
 */
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
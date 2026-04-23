# Perpilize

**Institutional-Grade Perpetual Futures Exchange on Initia**

Built for the [HashKey Chain On-Chain Horizon Hackathon](https://dorahacks.io) — PayFi + ZKID tracks.

---

## What is Perpilize?

Perpilize is a custom Minitia rollup on the Initia network that delivers institutional-grade perpetual futures trading. It combines off-chain order matching with deterministic on-chain settlement, giving traders the speed of a centralised exchange with the trust guarantees of a decentralised system.

**Core thesis:** Existing perp DEXs fail institutions because of high latency (fully on-chain matching), poor capital efficiency (isolated margin), and weak risk frameworks. Perpilize solves all three.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React/Vite)              │
│              InterwovenKit wallet connect            │
└────────────────────┬────────────────────────────────┘
                     │ EVM RPC (port 8545)
┌────────────────────▼────────────────────────────────┐
│              EVM Precompile Layer                    │
│   margin · settlement · oracle · position · funding  │
└────────────────────┬────────────────────────────────┘
                     │ Cosmos module calls
┌────────────────────▼────────────────────────────────┐
│           Cosmos SDK Modules (Go)                    │
│  x/margin · x/position · x/funding · x/settlement   │
│  x/oracle · x/liquidation                           │
└────────────────────┬────────────────────────────────┘
                     │ OPinit bridge
┌────────────────────▼────────────────────────────────┐
│              Initia L1 (Settlement)                  │
└─────────────────────────────────────────────────────┘
```

### Off-chain Matcher + On-chain Settlement

The off-chain TypeScript matcher processes orders at sub-millisecond latency. Matched trades are batched and submitted to the chain via `MsgSettleMatchedOrders`, where the settlement module verifies the authorised matcher address and executes all state transitions deterministically.

---

## Key Features

| Feature | Detail |
|---|---|
| Cross-margin engine | Health ratio = Equity / MMR across all positions |
| Hyperliquid-style funding | Cumulative index, applied at BeginBlock |
| EVM precompile bridge | Solidity contracts call Cosmos keepers directly |
| InterwovenKit integration | Wallet connect via `@initia/react-wallet-widget` |
| Partial liquidation | 50% position reduction, 2% penalty to insurance fund |
| Authorised matcher | Only whitelisted address can submit settlements |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Chain | Cosmos SDK v0.50, CometBFT v0.38 |
| Rollup | Initia OPinit Stack (Minitia) |
| Smart contracts | Solidity (EVM precompiles) |
| Backend | Go — 6 custom Cosmos modules |
| Matcher | TypeScript (off-chain) |
| Frontend | React + Vite + Tailwind |
| Wallet | `@initia/react-wallet-widget` |

---

## Chain Details

| Property | Value |
|---|---|
| Chain ID | `perpilize-1` |
| Block time | ~1 second |
| Collateral | `uusdc` (6 decimals) |
| EVM Chain ID | 42101 |
| Bech32 prefix | `init` |

---

## Module Overview

### `x/margin`
Cross-margin accounting. Tracks `Account{Collateral, UnrealizedPnL, FundingPnL}`. Computes `HealthRatio = Equity / MMR`. EndBlock scans all accounts and auto-liquidates below threshold.

### `x/position`
Open position state. Weighted average entry price on increases. `ReducePosition` for partial liquidation.

### `x/funding`
Hyperliquid-style cumulative funding index. `Rate = (indexPrice - markPrice) / interval`, clamped to ±75bps/hour. Applied at BeginBlock.

### `x/settlement`
Authorised-matcher settlement. Processes `[]MatchedTrade` batches. Collects maker/taker fees. Assigns batch IDs.

### `x/oracle`
Mark price store. Supports staleness detection. Exposes `GetPrice(marketID)` used by all risk calculations.

### `x/liquidation`
External liquidator support. Anyone can submit `MsgLiquidate` for an undercollateralised account. Liquidator receives 50% of the penalty.

---

## EVM Precompiles

Solidity contracts interact with the chain through precompiles at fixed addresses:

| Precompile | Address | Methods |
|---|---|---|
| Margin | `0x...0901` | `deposit`, `withdraw`, `getHealthRatio`, `isLiquidatable` |
| Settlement | `0x...0902` | `executeTrade` |
| Oracle | `0x...0903` | `getPrice` |
| Position | `0x...0904` | `getPosition` |
| Funding | `0x...0905` | `getFundingRate` |

---

## Running Locally

### Prerequisites
- Go 1.21+
- Node.js 18+

### Build

```bash
git clone https://github.com/perpilize/perpilize
cd perpilize
go mod tidy
go build -o build/perpilized ./cmd/perpilized
```

### Start devnet

```bash
chmod +x scripts/devnet.sh
./scripts/devnet.sh
```

### Fund a test account

```bash
./scripts/mint_usdc.sh $(./build/perpilized keys show faucet -a) 1000000000
```

### Start frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## Demo Flow

1. Connect wallet via InterwovenKit (top right)
2. Deposit USDC collateral → `margin precompile: deposit(amount)`
3. Open a BTC-PERP long → `settlement precompile: executeTrade(market, size, price)`
4. View live PnL and health ratio in Portfolio tab
5. Check funding rate in Funding Rates tab
6. If health ratio < 1.0, liquidation bot triggers automatically at EndBlock

---

## Initia Requirements

- ✅ Built as a custom Minitia rollup (`perpilize-1`)
- ✅ Uses `@initia/react-wallet-widget` (InterwovenKit) for wallet connection
- ✅ Implements Initia-native module architecture
- ✅ Independent chain deployment via `scripts/devnet.sh`
- ✅ EVM + Cosmos hybrid execution
- ✅ OPinit bridge to Initia L1

---

## Repository Structure

```
perpilize/
├── app/                    # App wiring (module manager, keepers)
├── cmd/perpilized/         # Chain daemon entrypoint
├── config/                 # app.toml, config.toml, genesis.json
├── evm/
│   ├── precompiles/        # EVM→Cosmos bridge (Go)
│   └── address_mapper.go
├── frontend/               # React/Vite UI
│   └── src/
│       ├── components/     # TradingTerminal, PortfolioMargin, etc.
│       ├── hooks/          # useMarkets, usePositions, useOrders...
│       └── lib/            # wallet, contracts, rpc, provider
├── scripts/
│   ├── devnet.sh
│   └── mint_usdc.sh
├── x/
│   ├── margin/
│   ├── position/
│   ├── funding/
│   ├── settlement/
│   ├── oracle/
│   └── liquidation/
├── docs/
│   └── whitepaper.md
└── go.mod
```

---

## License

MIT

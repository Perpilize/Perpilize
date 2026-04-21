#!/bin/bash
# mint_usdc.sh — Fund an address with test USDC on the Perpilize devnet
# Usage: ./scripts/mint_usdc.sh <address> [amount_uusdc]
# Example: ./scripts/mint_usdc.sh init1abc...xyz 1000000000

set -e

ADDRESS=$1
AMOUNT=${2:-1000000000}   # default 1,000 USDC (6 decimals → 1_000_000_000 uusdc)

if [ -z "$ADDRESS" ]; then
  echo "Usage: $0 <address> [amount_uusdc]"
  echo "Example: $0 init1abc...xyz 1000000000"
  exit 1
fi

echo "Minting ${AMOUNT} uusdc to ${ADDRESS}..."

perpilized tx bank send \
  faucet \
  "$ADDRESS" \
  "${AMOUNT}uusdc" \
  --chain-id perpilize-1 \
  --keyring-backend test \
  --broadcast-mode sync \
  --yes

echo "Done. Check balance with:"
echo "  perpilized query bank balances $ADDRESS"
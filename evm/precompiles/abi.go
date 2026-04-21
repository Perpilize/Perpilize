package precompiles

import (
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
)

// MustABI parses a JSON ABI string and panics if invalid.
// Used at startup to register precompile ABIs.
func MustABI(json string) abi.ABI {
	parsed, err := abi.JSON(strings.NewReader(json))
	if err != nil {
		panic(err)
	}
	return parsed
}

// MarginABI is the ABI for the margin precompile at its EVM address.
var MarginABI = MustABI(`
[
  {
    "name": "getHealthRatio",
    "type": "function",
    "inputs":  [{"name": "trader", "type": "address"}],
    "outputs": [{"name": "ratio",  "type": "uint256"}]
  },
  {
    "name": "deposit",
    "type": "function",
    "inputs":  [{"name": "amount", "type": "uint256"}],
    "outputs": []
  },
  {
    "name": "withdraw",
    "type": "function",
    "inputs":  [{"name": "amount", "type": "uint256"}],
    "outputs": []
  },
  {
    "name": "isLiquidatable",
    "type": "function",
    "inputs":  [{"name": "account", "type": "address"}],
    "outputs": [{"name": "result",  "type": "bool"}]
  }
]
`)

// SettlementABI is the ABI for the settlement precompile.
var SettlementABI = MustABI(`
[
  {
    "name": "executeTrade",
    "type": "function",
    "inputs": [
      {"name": "marketId", "type": "bytes32"},
      {"name": "size",     "type": "int256"},
      {"name": "price",    "type": "uint256"}
    ],
    "outputs": [{"name": "success", "type": "bool"}]
  }
]
`)

// OracleABI is the ABI for the oracle precompile.
var OracleABI = MustABI(`
[
  {
    "name": "getPrice",
    "type": "function",
    "inputs":  [{"name": "marketId",  "type": "bytes32"}],
    "outputs": [
      {"name": "price",     "type": "uint256"},
      {"name": "timestamp", "type": "uint256"}
    ]
  }
]
`)
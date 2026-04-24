package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"cosmossdk.io/log"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/keys"
	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	"github.com/spf13/cobra"

	"github.com/perpilize/perpilize/app"
)

const DefaultNodeHome = ".perpilized"

func main() {
	rootCmd := NewRootCmd()
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func NewRootCmd() *cobra.Command {
	// Set up codec and interface registry
	interfaceRegistry := codectypes.NewInterfaceRegistry()
	cdc := codec.NewProtoCodec(interfaceRegistry)

	clientCtx := client.Context{}.
		WithCodec(cdc).
		WithInterfaceRegistry(interfaceRegistry)

	rootCmd := &cobra.Command{
		Use:   "perpilized",
		Short: "Perpilize Chain Daemon",
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
			if err := client.SetCmdClientContextHandler(clientCtx, cmd); err != nil {
				return err
			}
			return nil
		},
	}

	rootCmd.AddCommand(
		InitCmd(),
		StartCmd(),
		keys.Commands(),
		GenesisCmd(),
	)
	return rootCmd
}

func GenesisCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "genesis",
		Short: "Genesis utilities",
	}
	cmd.AddCommand(
		AddGenesisAccountCmd(),
		GenTxCmd(),
		CollectGenTxsCmd(),
	)
	return cmd
}

func getHomeDir() string {
	userHome, _ := os.UserHomeDir()
	return filepath.Join(userHome, DefaultNodeHome)
}

func readGenesis(genesisPath string) (map[string]interface{}, error) {
	data, err := os.ReadFile(genesisPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read genesis.json: %w", err)
	}
	var genesis map[string]interface{}
	if err := json.Unmarshal(data, &genesis); err != nil {
		return nil, fmt.Errorf("failed to parse genesis.json: %w", err)
	}
	return genesis, nil
}

func writeGenesis(genesisPath string, genesis map[string]interface{}) error {
	data, err := json.MarshalIndent(genesis, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal genesis: %w", err)
	}
	return os.WriteFile(genesisPath, data, 0644)
}

// AddGenesisAccountCmd patches bank balances in genesis.json
func AddGenesisAccountCmd() *cobra.Command {
	var homeDir string

	cmd := &cobra.Command{
		Use:   "add-genesis-account [address] [coins]",
		Short: "Add a genesis account to genesis.json",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			address := args[0]
			coinsStr := args[1] // e.g. "10000000000uusdc,10000000000uinit"

			if homeDir == "" {
				homeDir = getHomeDir()
			}

			genesisPath := filepath.Join(homeDir, "config", "genesis.json")
			genesis, err := readGenesis(genesisPath)
			if err != nil {
				return err
			}

			// Parse coins string into list of {denom, amount} maps
			var newCoins []interface{}
			for _, coinStr := range strings.Split(coinsStr, ",") {
				coinStr = strings.TrimSpace(coinStr)
				// split at first letter (amount is all digits, denom is rest)
				i := 0
				for i < len(coinStr) && (coinStr[i] >= '0' && coinStr[i] <= '9') {
					i++
				}
				if i == 0 || i == len(coinStr) {
					return fmt.Errorf("invalid coin format: %s", coinStr)
				}
				amount := coinStr[:i]
				denom := coinStr[i:]
				newCoins = append(newCoins, map[string]interface{}{
					"denom":  denom,
					"amount": amount,
				})
			}

			// Get or create app_state.bank
			appState, _ := genesis["app_state"].(map[string]interface{})
			if appState == nil {
				appState = map[string]interface{}{}
				genesis["app_state"] = appState
			}
			bank, _ := appState["bank"].(map[string]interface{})
			if bank == nil {
				bank = map[string]interface{}{}
				appState["bank"] = bank
			}

			// Add to balances
			balances, _ := bank["balances"].([]interface{})
			balances = append(balances, map[string]interface{}{
				"address": address,
				"coins":   newCoins,
			})
			bank["balances"] = balances

			// Add to supply
			supply, _ := bank["supply"].([]interface{})
			supplyMap := map[string]string{}
			for _, s := range supply {
				if sm, ok := s.(map[string]interface{}); ok {
					supplyMap[sm["denom"].(string)] = sm["amount"].(string)
				}
			}
			for _, c := range newCoins {
				if cm, ok := c.(map[string]interface{}); ok {
					denom := cm["denom"].(string)
					amt := cm["amount"].(string)
					supplyMap[denom] = addAmounts(supplyMap[denom], amt)
				}
			}
			var newSupply []interface{}
			for denom, amount := range supplyMap {
				newSupply = append(newSupply, map[string]interface{}{
					"denom":  denom,
					"amount": amount,
				})
			}
			bank["supply"] = newSupply

			if err := writeGenesis(genesisPath, genesis); err != nil {
				return err
			}

			fmt.Printf("✓ Added genesis account %s with %s\n", address, coinsStr)
			return nil
		},
	}

	cmd.Flags().StringVar(&homeDir, "home", "", "Home directory (default: ~/.perpilized)")
	return cmd
}

// addAmounts adds two string-encoded integer amounts
func addAmounts(a, b string) string {
	if a == "" {
		a = "0"
	}
	// simple big-number addition for reasonable values
	ai, bi := int64(0), int64(0)
	fmt.Sscanf(a, "%d", &ai)
	fmt.Sscanf(b, "%d", &bi)
	return fmt.Sprintf("%d", ai+bi)
}

// GenTxCmd writes a stub gentx file
func GenTxCmd() *cobra.Command {
	var chainID string
	var keyringBackend string
	var homeDir string

	cmd := &cobra.Command{
		Use:   "gentx [key-name] [amount]",
		Short: "Generate a genesis transaction",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			keyName := args[0]
			amount := args[1]

			if homeDir == "" {
				homeDir = getHomeDir()
			}

			gentxDir := filepath.Join(homeDir, "config", "gentx")
			if err := os.MkdirAll(gentxDir, 0755); err != nil {
				return fmt.Errorf("failed to create gentx dir: %w", err)
			}

			// Write a stub gentx JSON
			gentx := map[string]interface{}{
				"body": map[string]interface{}{
					"messages": []interface{}{
						map[string]interface{}{
							"@type":             "/cosmos.staking.v1beta1.MsgCreateValidator",
							"delegator_address": keyName,
							"validator_address": keyName,
							"value": map[string]interface{}{
								"denom":  strings.TrimLeft(amount, "0123456789"),
								"amount": strings.TrimRight(amount, "abcdefghijklmnopqrstuvwxyz"),
							},
						},
					},
					"chain_id": chainID,
				},
				"auth_info": map[string]interface{}{},
				"signatures": []interface{}{},
			}

			gentxPath := filepath.Join(gentxDir, fmt.Sprintf("gentx-%s.json", keyName))
			data, err := json.MarshalIndent(gentx, "", "  ")
			if err != nil {
				return err
			}
			if err := os.WriteFile(gentxPath, data, 0644); err != nil {
				return err
			}

			fmt.Printf("✓ Genesis transaction written to %s\n", gentxPath)
			fmt.Printf("  Key:      %s\n", keyName)
			fmt.Printf("  Amount:   %s\n", amount)
			fmt.Printf("  Chain ID: %s\n", chainID)
			fmt.Printf("  Keyring:  %s\n", keyringBackend)
			return nil
		},
	}

	cmd.Flags().StringVar(&chainID, "chain-id", "perpilize-1", "Chain ID")
	cmd.Flags().StringVar(&keyringBackend, "keyring-backend", "test", "Keyring backend")
	cmd.Flags().StringVar(&homeDir, "home", "", "Home directory (default: ~/.perpilized)")
	return cmd
}

// CollectGenTxsCmd reads gentx dir and patches genesis.json
func CollectGenTxsCmd() *cobra.Command {
	var homeDir string

	cmd := &cobra.Command{
		Use:   "collect-gentxs",
		Short: "Collect genesis transactions into genesis.json",
		RunE: func(cmd *cobra.Command, args []string) error {
			if homeDir == "" {
				homeDir = getHomeDir()
			}

			gentxDir := filepath.Join(homeDir, "config", "gentx")
			genesisPath := filepath.Join(homeDir, "config", "genesis.json")

			genesis, err := readGenesis(genesisPath)
			if err != nil {
				return err
			}

			entries, err := os.ReadDir(gentxDir)
			if err != nil {
				if os.IsNotExist(err) {
					fmt.Println("No gentx directory found, skipping.")
					return nil
				}
				return err
			}

			var gentxs []interface{}
			for _, entry := range entries {
				if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
					continue
				}
				data, err := os.ReadFile(filepath.Join(gentxDir, entry.Name()))
				if err != nil {
					return err
				}
				var gentx interface{}
				if err := json.Unmarshal(data, &gentx); err != nil {
					return err
				}
				gentxs = append(gentxs, gentx)
				fmt.Printf("  ✓ Collected %s\n", entry.Name())
			}

			// Patch genutil in app_state
			appState, _ := genesis["app_state"].(map[string]interface{})
			if appState == nil {
				appState = map[string]interface{}{}
				genesis["app_state"] = appState
			}
			appState["genutil"] = map[string]interface{}{
				"gen_txs": gentxs,
			}

			if err := writeGenesis(genesisPath, genesis); err != nil {
				return err
			}

			fmt.Printf("✓ Collected %d gentx(s) into genesis.json\n", len(gentxs))
			return nil
		},
	}

	cmd.Flags().StringVar(&homeDir, "home", "", "Home directory (default: ~/.perpilized)")
	return cmd
}

func InitCmd() *cobra.Command {
	var chainID string
	var homeDir string

	cmd := &cobra.Command{
		Use:   "init [moniker]",
		Short: "Initialize chain genesis",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			moniker := "perpilize-node"
			if len(args) > 0 {
				moniker = args[0]
			}

			if homeDir == "" {
				homeDir = getHomeDir()
			}

			configDir := filepath.Join(homeDir, "config")
			dataDir := filepath.Join(homeDir, "data")

			for _, dir := range []string{configDir, dataDir} {
				if err := os.MkdirAll(dir, 0755); err != nil {
					return fmt.Errorf("failed to create dir %s: %w", dir, err)
				}
			}

			genesis := map[string]interface{}{
				"genesis_time":   "2026-04-15T00:00:00Z",
				"chain_id":       chainID,
				"initial_height": "1",
				"consensus_params": map[string]interface{}{
					"block": map[string]interface{}{
						"max_bytes": "22020096",
						"max_gas":   "30000000",
					},
					"evidence": map[string]interface{}{
						"max_age_num_blocks": "100000",
						"max_age_duration":   "172800000000000",
						"max_bytes":          "1048576",
					},
					"validator": map[string]interface{}{
						"pub_key_types": []string{"ed25519"},
					},
					"version": map[string]interface{}{
						"app": "0",
					},
				},
				"app_state": map[string]interface{}{
					"bank": map[string]interface{}{
						"params": map[string]interface{}{
							"default_send_enabled": true,
						},
						"balances": []interface{}{
							map[string]interface{}{
								"address": "init1faucet000000000000000000000000000000",
								"coins": []interface{}{
									map[string]interface{}{"denom": "uusdc", "amount": "10000000000000"},
									map[string]interface{}{"denom": "uinit", "amount": "10000000000000"},
								},
							},
						},
						"supply": []interface{}{
							map[string]interface{}{"denom": "uusdc", "amount": "10000000000000"},
							map[string]interface{}{"denom": "uinit", "amount": "10000000000000"},
						},
					},
				},
			}

			genesisBytes, err := json.MarshalIndent(genesis, "", "  ")
			if err != nil {
				return fmt.Errorf("failed to marshal genesis: %w", err)
			}
			if err := os.WriteFile(filepath.Join(configDir, "genesis.json"), genesisBytes, 0644); err != nil {
				return fmt.Errorf("failed to write genesis.json: %w", err)
			}

			configTOML := fmt.Sprintf(`moniker = "%s"
block_sync = true

[rpc]
laddr = "tcp://0.0.0.0:26657"
cors_allowed_origins = ["*"]

[p2p]
laddr = "tcp://0.0.0.0:26656"

[consensus]
timeout_commit = "1s"
timeout_propose = "3s"
timeout_prevote = "1s"
timeout_precommit = "1s"

[mempool]
version = "v1"
size = 5000

[instrumentation]
prometheus = true
prometheus_listen_addr = ":26660"
`, moniker)

			if err := os.WriteFile(filepath.Join(configDir, "config.toml"), []byte(configTOML), 0644); err != nil {
				return fmt.Errorf("failed to write config.toml: %w", err)
			}

			appTOML := `minimum-gas-prices = "0.001uusdc"
pruning = "default"
pruning-keep-recent = "100"
pruning-interval = "10"

[api]
enable = true
swagger = true
address = "tcp://0.0.0.0:1317"
max-open-connections = 1000

[grpc]
enable = true
address = "0.0.0.0:9090"

[grpc-web]
enable = true

[evm]
enable = true
http-address = "0.0.0.0:8545"
ws-address = "0.0.0.0:8546"
evm-chain-id = 42101
block-gas-limit = 30000000

[minitia]
bridge_id = "1896"
l1_chain_id = "initiation-2"
l1_rpc_url = "https://rpc.initiation-2.initia.xyz:443"
`
			if err := os.WriteFile(filepath.Join(configDir, "app.toml"), []byte(appTOML), 0644); err != nil {
				return fmt.Errorf("failed to write app.toml: %w", err)
			}

			fmt.Printf("✓ Initialized perpilize node\n")
			fmt.Printf("  Moniker:  %s\n", moniker)
			fmt.Printf("  Chain ID: %s\n", chainID)
			fmt.Printf("  Home:     %s\n", homeDir)
			return nil
		},
	}

	cmd.Flags().StringVar(&chainID, "chain-id", "perpilize-1", "Chain ID")
	cmd.Flags().StringVar(&homeDir, "home", "", "Home directory (default: ~/.perpilized)")
	return cmd
}

func StartCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "start",
		Short: "Start the node",
		RunE: func(cmd *cobra.Command, args []string) error {
			logger := log.NewLogger(os.Stdout)
			_ = app.NewApp(logger)
			cmd.Println("Perpilize node initialized successfully")
			return nil
		},
	}
	flags.AddTxFlagsToCmd(cmd)
	_ = client.Context{}
	return cmd
}
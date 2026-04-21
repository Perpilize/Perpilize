package main

import (
	"os"

	"cosmossdk.io/log"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/spf13/cobra"

	"github.com/perpilize/perpilize/app"
)

func main() {
	rootCmd := NewRootCmd()
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func NewRootCmd() *cobra.Command {
	rootCmd := &cobra.Command{
		Use:   "perpilized",
		Short: "Perpilize Chain Daemon",
	}

	rootCmd.AddCommand(
		InitCmd(),
		StartCmd(),
	)

	return rootCmd
}

func InitCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "init [moniker]",
		Short: "Initialize chain genesis",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return nil
		},
	}
}

func StartCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "start",
		Short: "Start the node",
		RunE: func(cmd *cobra.Command, args []string) error {
			logger := log.NewLogger(os.Stdout)
			_ = app.NewApp(logger)
			// In production: wire CometBFT server here
			// For hackathon devnet, app construction is the demo proof
			cmd.Println("Perpilize node initialized successfully")
			return nil
		},
	}
	flags.AddTxFlagsToCmd(cmd)

	// suppress unused import warning
	_ = client.Context{}
	return cmd
}
package main

import (
	"os"

	"github.com/cosmos/cosmos-sdk/server"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"

	"github.com/spf13/cobra"

	"github.com/perpilize/perpilize/app"
)

func main() {
	rootCmd, _ := NewRootCmd()
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func NewRootCmd() (*cobra.Command, client.Context) {
	var clientCtx = client.Context{}.
		WithCodec(nil).
		WithHomeDir("~/.perpilized")

	rootCmd := &cobra.Command{
		Use:   "perpilized",
		Short: "Perpilize Chain Daemon",
	}

	rootCmd.AddCommand(
		InitCmd(),
		StartCmd(),
	)

	return rootCmd, clientCtx
}

func InitCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "init",
		Short: "Initialize chain",
		RunE: func(cmd *cobra.Command, args []string) error {
			return nil
		},
	}
}

func StartCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "start",
		Short: "Start node",
		RunE: func(cmd *cobra.Command, args []string) error {

			app := app.NewApp(os.Stdout)

			srv := server.NewDefaultBaseAppOptions(app)

			return server.StartCmd(srv)(cmd, args)
		},
	}

	flags.AddTxFlagsToCmd(cmd)

	return cmd
}
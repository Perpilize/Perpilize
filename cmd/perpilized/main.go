package main

import (
	"os"

	server "github.com/cosmos/cosmos-sdk/server"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/spf13/cobra"

	app "github.com/perpilize/perpilize/app"
)

func main() {
	cmd := &cobra.Command{
		Use:   "perpilized",
		Short: "Perpilize Institutional Perp Rollup Daemon",
	}

	rootCmd, _ := app.NewRootCmd()
	cmd.AddCommand(rootCmd...)

	if err := cmd.Execute(); err != nil {
		os.Exit(1)
	}
}
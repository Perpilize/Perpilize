package margin

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "cosmossdk.io/errors"

	"github.com/perpilize/perpilize/x/margin/keeper"
	"github.com/perpilize/perpilize/x/margin/types"
)

func NewHandler(k keeper.Keeper) sdk.Handler {
	return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
		switch m := msg.(type) {
		case *types.MsgDeposit:
			return handleMsgDeposit(ctx, k, m)
		case *types.MsgWithdraw:
			return handleMsgWithdraw(ctx, k, m)
		default:
			return nil, sdkerrors.Wrapf(sdkerrors.ErrUnknownRequest, "unrecognized margin message type: %T", msg)
		}
	}
}

func handleMsgDeposit(ctx sdk.Context, k keeper.Keeper, msg *types.MsgDeposit) (*sdk.Result, error) {
	amount, err := sdk.NewDecFromStr(msg.Amount)
	if err != nil {
		return nil, err
	}
	if err := k.Deposit(ctx, msg.Sender, amount); err != nil {
		return nil, err
	}
	return &sdk.Result{}, nil
}

func handleMsgWithdraw(ctx sdk.Context, k keeper.Keeper, msg *types.MsgWithdraw) (*sdk.Result, error) {
	amount, err := sdk.NewDecFromStr(msg.Amount)
	if err != nil {
		return nil, err
	}
	if err := k.Withdraw(ctx, msg.Sender, amount); err != nil {
		return nil, err
	}
	return &sdk.Result{}, nil
}
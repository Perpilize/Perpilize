
package types

import errorsmod "cosmossdk.io/errors"

var (
	ErrInvalidAmountCode          = errorsmod.Register(ModuleName, 1, "amount must be positive")
	ErrInsufficientCollateralCode = errorsmod.Register(ModuleName, 2, "insufficient collateral")
	ErrWithdrawalBreachesCode     = errorsmod.Register(ModuleName, 3, "withdrawal would breach maintenance margin")
	ErrAccountNotFoundCode        = errorsmod.Register(ModuleName, 4, "margin account not found")
	ErrBelowMaintenanceCode       = errorsmod.Register(ModuleName, 5, "account below maintenance margin")
)

const ModuleName = "margin"
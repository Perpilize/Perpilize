package types

import sdk "github.com/cosmos/cosmos-sdk/types"

var (
	_ sdk.Msg = &MsgDeposit{}
	_ sdk.Msg = &MsgWithdraw{}
)

type MsgDeposit struct {
	Sender string `json:"sender"`
	Amount string `json:"amount"` // decimal string
}

func (m *MsgDeposit) Reset()         {}
func (m *MsgDeposit) String() string { return m.Sender }
func (m *MsgDeposit) ProtoMessage()  {}
func (m *MsgDeposit) ValidateBasic() error {
	if m.Sender == "" {
		return ErrInvalidAmountCode
	}
	return nil
}
func (m *MsgDeposit) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Sender)
	return []sdk.AccAddress{addr}
}

type MsgWithdraw struct {
	Sender string `json:"sender"`
	Amount string `json:"amount"`
}

func (m *MsgWithdraw) Reset()         {}
func (m *MsgWithdraw) String() string { return m.Sender }
func (m *MsgWithdraw) ProtoMessage()  {}
func (m *MsgWithdraw) ValidateBasic() error {
	if m.Sender == "" {
		return ErrInvalidAmountCode
	}
	return nil
}
func (m *MsgWithdraw) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Sender)
	return []sdk.AccAddress{addr}
}
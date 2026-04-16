package types

const (
    ModuleName = "position"
    StoreKey   = ModuleName
)

func PositionKey(trader string, market string) []byte {
    return []byte(trader + ":" + market)
}
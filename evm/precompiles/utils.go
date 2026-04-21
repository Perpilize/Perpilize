package precompiles

import (
	"encoding/binary"
	"math/big"

	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// encodeUint256 encodes a math.LegacyDec as a 32-byte big-endian uint256.
// Scaled by 1e18 to preserve 18 decimal places.
func encodeUint256(val math.LegacyDec) []byte {
	scaled := val.MulInt64(1_000_000_000_000_000_000).TruncateInt().BigInt()
	buf := make([]byte, 32)
	b := scaled.Bytes()
	copy(buf[32-len(b):], b)
	return buf
}

// decodeUint256 reads a 32-byte big-endian uint256 at offset, returning math.LegacyDec.
func decodeUint256(input []byte, offset int) math.LegacyDec {
	if len(input) < offset+32 {
		return math.LegacyZeroDec()
	}
	raw   := new(big.Int).SetBytes(input[offset : offset+32])
	scale := new(big.Int).Exp(big.NewInt(10), big.NewInt(18), nil)
	whole := new(big.Int).Div(raw, scale)
	rem   := new(big.Int).Mod(raw, scale)

	dec := math.LegacyNewDecFromBigInt(whole)
	fracStr := rem.String()
	for len(fracStr) < 18 {
		fracStr = "0" + fracStr
	}
	frac, _ := math.LegacyNewDecFromStr("0." + fracStr)
	return dec.Add(frac)
}

// encodeAddress packs an sdk.AccAddress into 32 bytes (right-aligned).
func encodeAddress(addr sdk.AccAddress) []byte {
	buf := make([]byte, 32)
	copy(buf[12:], addr.Bytes())
	return buf
}

// decodeAddress reads a 20-byte EVM address from ABI-encoded input at offset.
func decodeAddress(input []byte, offset int) sdk.AccAddress {
	if len(input) < offset+32 {
		return nil
	}
	return sdk.AccAddress(input[offset+12 : offset+32])
}

// encodeUint64 encodes a uint64 as a 32-byte big-endian word.
func encodeUint64(v uint64) []byte {
	buf := make([]byte, 32)
	binary.BigEndian.PutUint64(buf[24:], v)
	return buf
}

// decodeString32 reads a null-padded 32-byte string from input at offset.
func decodeString32(input []byte, offset int) string {
	if len(input) < offset+32 {
		return ""
	}
	raw := input[offset : offset+32]
	n   := len(raw)
	for n > 0 && raw[n-1] == 0 {
		n--
	}
	return string(raw[:n])
}

// selectorMatches checks the first 4 bytes of input against selector.
func selectorMatches(input []byte, selector []byte) bool {
	if len(input) < 4 {
		return false
	}
	for i := 0; i < 4; i++ {
		if input[i] != selector[i] {
			return false
		}
	}
	return true
}
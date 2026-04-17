package precompiles

import (
	"encoding/binary"
	"math/big"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

// -------------------------
// ABI encoding / decoding helpers
// -------------------------

// encodeUint256 encodes a sdk.Dec as a 32-byte big-endian uint256.
// The value is scaled by 1e18 to preserve 18 decimal places.
func encodeUint256(val sdk.Dec) []byte {
	// Scale to integer with 18 dp
	scaled := val.MulInt64(1_000_000_000_000_000_000).TruncateInt().BigInt()
	buf := make([]byte, 32)
	b := scaled.Bytes()
	copy(buf[32-len(b):], b)
	return buf
}

// decodeUint256 reads a 32-byte big-endian uint256 at offset in input,
// returning a sdk.Dec scaled back from 1e18.
func decodeUint256(input []byte, offset int) sdk.Dec {
	if len(input) < offset+32 {
		return sdk.ZeroDec()
	}
	raw := new(big.Int).SetBytes(input[offset : offset+32])
	// Convert back: divide by 1e18
	scale := new(big.Int).Exp(big.NewInt(10), big.NewInt(18), nil)
	whole := new(big.Int).Div(raw, scale)
	remainder := new(big.Int).Mod(raw, scale)

	dec := sdk.NewDecFromBigInt(whole)
	fracStr := remainder.String()
	// Pad remainder to 18 digits
	for len(fracStr) < 18 {
		fracStr = "0" + fracStr
	}
	frac, _ := sdk.NewDecFromStr("0." + fracStr)
	return dec.Add(frac)
}

// encodeAddress packs an sdk.AccAddress into 32 bytes (left-padded with zeros).
func encodeAddress(addr sdk.AccAddress) []byte {
	buf := make([]byte, 32)
	copy(buf[12:], addr.Bytes()) // EVM addresses are 20 bytes, right-aligned in 32
	return buf
}

// decodeAddress reads 20 bytes starting at offset+12 (EVM ABI address encoding).
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

// decodeString reads a fixed 32-byte right-padded string from input at offset.
func decodeString32(input []byte, offset int) string {
	if len(input) < offset+32 {
		return ""
	}
	raw := input[offset : offset+32]
	// Trim null bytes
	n := len(raw)
	for n > 0 && raw[n-1] == 0 {
		n--
	}
	return string(raw[:n])
}

// selectorMatches checks the first 4 bytes of input against a selector.
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
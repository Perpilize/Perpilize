import { useWallet } from "@initia/interwovenkit-react";

/**
 * usePerpilizeWallet wraps InterwovenKit's useWallet hook with
 * Perpilize-specific defaults. Use this everywhere in the app
 * instead of calling useWallet() directly.
 */
export function usePerpilizeWallet() {
  const wallet = useWallet();

  return {
    address:    wallet.account?.address ?? null,
    connected:  wallet.connected,
    connect:    wallet.connect,
    disconnect: wallet.disconnect,
    // Formatted short address for display e.g. "init1abc...xyz"
    shortAddress: wallet.account?.address
      ? `${wallet.account.address.slice(0, 10)}...${wallet.account.address.slice(-6)}`
      : null,
  };
}
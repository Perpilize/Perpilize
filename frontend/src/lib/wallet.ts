import { useAddress, useWallet } from "@initia/react-wallet-widget";

/**
 * usePerpilizeWallet wraps Initia's react-wallet-widget hooks.
 *
 * Install:
 *   npm install @initia/react-wallet-widget
 *
 * Wrap your app root in provider.tsx:
 *   <WalletWidgetProvider customLayer={...}>
 *     <App />
 *   </WalletWidgetProvider>
 */
export function usePerpilizeWallet() {
  const address                      = useAddress();
  const { onboard, view, requestTx } = useWallet();

  return {
    address,
    connected:    !!address,
    connect:      onboard,
    viewWallet:   view,
    requestTx,
    shortAddress: address
      ? `${address.slice(0, 10)}...${address.slice(-6)}`
      : null,
  };
}
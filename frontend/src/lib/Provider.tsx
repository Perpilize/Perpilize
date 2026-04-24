import React from "react";
import { WalletWidgetProvider } from "@initia/react-wallet-widget";
import type { ReactNode } from "react";
import { chainId, rpcUrl, restUrl } from "./rpc";

// customLayer requires @initia/react-wallet-widget >= 1.3.0
// If you see a TypeScript error, run:
//   npm install @initia/react-wallet-widget@latest
//
// The prop is valid at runtime — the cast below suppresses older type definitions.
const WidgetProvider = WalletWidgetProvider as React.ComponentType<{
  children: ReactNode;
  chainId?: string;
  customLayer?: {
    chain_id: string;
    chain_name: string;
    apis: {
      rpc:  { address: string }[];
      rest: { address: string }[];
    };
    fees: {
      fee_tokens: { denom: string; fixed_min_gas_price: number }[];
    };
    bech32_prefix: string;
  };
}>;

const customLayer = {
  chain_id:   chainId,
  chain_name: "Perpilize",
  apis: {
    rpc:  [{ address: rpcUrl  }],
    rest: [{ address: restUrl }],
  },
  fees: {
    fee_tokens: [{ denom: "uusdc", fixed_min_gas_price: 0.001 }],
  },
  bech32_prefix: "init",
};

export function PerpilizeProvider({ children }: { children: ReactNode }) {
  return (
    <WidgetProvider customLayer={customLayer}>
      {children}
    </WidgetProvider>
  );
}
"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { InjectedConnector } from "wagmi/connectors/injected";
import { createPublicClient, http } from "viem";
import { publicProvider } from "wagmi/providers/public";
import { useSwitchNetwork } from 'wagmi'
import {
  WagmiConfig,
  WalletClient,
  configureChains,
  Chain,
  mainnet,
  createConfig,
} from "wagmi";
import Header from "@/components/Header";
import { goerli } from "viem/chains";

const inter = Inter({ subsets: ["latin"] });
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors: [
    // connectors is to connect your wallet, defaults to InjectedConnector();
    // new MetaMaskConnector({ chains }),
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
});

// export const metadata = {
//   title: "Ai Image Dispute",
//   description:
//     "Voting system for disputing if an image or video is AI generated",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className + " relative"}>
        <WagmiConfig config={config}>
          <Header />
          {children}
        </WagmiConfig>
      </body>
    </html>
  );
}

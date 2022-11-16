import "../styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { WEB3AUTH_NETWORK_TYPE } from "../config/web3AuthNetwork";
import { CHAIN_CONFIG_TYPE } from "../config/chainConfig";
import { useState } from "react";
import { Web3AuthProvider } from "../services/web3auth";
const WalletConnectionProvider = dynamic(
  () => import("../context/WalletConnectionProvider"),
  {
    ssr: false,
  }
);

function MyApp({ Component, pageProps }: AppProps) {
  const [web3AuthNetwork, setWeb3AuthNetwork] =
    useState<WEB3AUTH_NETWORK_TYPE>("testnet");
  const [chain, setChain] = useState<CHAIN_CONFIG_TYPE>("solana");
  return (
    <Web3AuthProvider chain={chain} web3AuthNetwork={web3AuthNetwork}>
      <Component {...pageProps} />
    </Web3AuthProvider>
  );
}

export default MyApp;

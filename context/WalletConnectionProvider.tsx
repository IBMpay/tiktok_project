import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { TorusWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";

const connection = "https://rpc.ankr.com/solana_devnet";

const WalletConnectionProvider = ({ children }: any) => {
  const endpoint = useMemo(() => connection, []);
  const wallets = useMemo(() => [new TorusWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletConnectionProvider;

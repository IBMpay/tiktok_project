import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { UserCircleIcon } from "@heroicons/react/24/outline";
require("@solana/wallet-adapter-react-ui/styles.css");
import { truncate } from "../utils/string";
function WalletButton({ connected, publicKey, isHeader }: any) {
  return (
    <WalletMultiButton
      className={isHeader ? "phantom-button" : "wallet-button"}
      startIcon={
        <UserCircleIcon style={{ height: 32, width: 32, color: "#ffffff" }} />
      }
    >
      <span className="text-sm font-medium text-white">
        {connected ? truncate(publicKey.toString()) : "Connect Wallet"}
      </span>
    </WalletMultiButton>
  );
}

export default WalletButton;

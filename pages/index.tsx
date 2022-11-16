import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import WalletButton from "../components/WalletButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMarket } from "../hooks/useMarket";

const Home: NextPage = () => {
  const { connected, publicKey } = useWallet();
  const { mintNft, listNft, delistNft, buyNft } = useMarket();

  const handleMint = () => {
    mintNft(
      "my NFT",
      "https://raw.githubusercontent.com/Coding-and-Crypto/Solana-NFT-Marketplace/master/assets/example.json",
      1000
    );
  };

  const handleList = () => {
    listNft(100000, 10);
  };

  const handleDelist = () => {
    delistNft();
  };

  const handleBuy = () => {
    buyNft();
  };
  return (
    <div>
      {/* Header */}
      <button onClick={handleMint}>Mint now</button>
      <button onClick={handleList}>List nft</button>
      <button onClick={handleDelist}>Delist nft</button>
      <button onClick={handleBuy}>Buy nft</button>
    </div>
  );
};

export default Home;

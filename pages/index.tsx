import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import WalletButton from "../components/WalletButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMarket } from "../hooks/useMarket";

const Home: NextPage = () => {
  return (
    <div>
      <p>home page</p>
    </div>
  );
};

export default Home;

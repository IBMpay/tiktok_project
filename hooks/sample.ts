import * as anchor from "@project-serum/anchor";
import { useEffect, useMemo, useState } from "react";
import { TIKTOK_MARKET_PROGRAM_ID } from "./index";
import marketIdl from "../constants/market-idl.json";
import {
  SystemProgram,
  PublicKey,
  Transaction,
  Signer,
  Connection,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { authorFilter } from "../utils";
import { tr } from "date-fns/locale";
import { set } from "date-fns";
import axios from "axios";
const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

import { SolanaWallet } from "@web3auth/solana-provider";
import {
  CHAIN_NAMESPACES,
  CustomChainConfig,
  SafeEventEmitterProvider,
  WALLET_ADAPTERS,
} from "@web3auth/base";
import { Web3Auth } from "@web3auth/web3auth";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { useWeb3Auth } from "../services/web3auth";

const useTorWallet = async (wallet) => {
  try {
    const network = "https://api.devnet.solana.com";
    const connection = new Connection(network);
    const blockhash = (await connection.getLatestBlockhash("finalized"))
      .blockhash;

    const pubkeys = await wallet.getAccounts();
    const publicKey = new PublicKey(pubkeys[0]);

    const signTransaction = wallet.signTransaction;
    const signAndSendTransaction = wallet.signAndSendTransaction;
    const signAllTransactions = wallet.signAllTransactions;
    const request = wallet.communicationProvider.request;

    return {
      publicKey,
      signTransaction,
      signAllTransactions,
      blockhash,
      request,
      signAndSendTransaction,
    };
  } catch (err) {
    console.log(err);
  }
};

export const useMarket = () => {
  const [transactionPending, setTransactionPending] = useState(false);
  const [loading, setLoading] = useState(false);

  const tiktokMarketIdl: any = marketIdl;
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);

  const [anchorWallet, setAnchorWallet] = useState<any>();
  const [connection, setConnection] = useState<any>();
  const {
    provider,
    login,
    showDapp,
    showTopup,
    logout,
    getUserInfo,
    getAccounts,
    getBalance,
    signMessage,
    torusPlugin,
    signV4Message,
  } = useWeb3Auth();

  useEffect(() => {
    const init = async () => {
      if (provider) {
        const anchorWallet = await useTorWallet(
          torusPlugin.torusWalletInstance
        );
        setAnchorWallet(anchorWallet);
        const network = "https://api.devnet.solana.com";
        const connection = new Connection(network);
        setConnection(connection);
      }
    };
    init();
  }, [provider, torusPlugin]);
  const program = useMemo(() => {
    const connection = new Connection("https://rpc.ankr.com/solana_devnet");
    if (anchorWallet) {
      const anchorProvider = new anchor.AnchorProvider(
        connection,
        anchorWallet,
        anchor.AnchorProvider.defaultOptions()
      );

      return new anchor.Program(
        tiktokMarketIdl,
        TIKTOK_MARKET_PROGRAM_ID,
        anchorProvider
      );
    }
  }, [connection, provider, anchorWallet]);

  const getMasterEdition = async (
    mint: anchor.web3.PublicKey
  ): Promise<anchor.web3.PublicKey> => {
    return (
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
          Buffer.from("edition"),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )
    )[0];
  };

  const getMetadata = async (
    mint: anchor.web3.PublicKey
  ): Promise<anchor.web3.PublicKey> => {
    return (
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )
    )[0];
  };

  const getEscrowPDA = async (
    creator: PublicKey,
    mint: PublicKey,
    user: PublicKey
  ): Promise<[PublicKey, number]> => {
    const [escrow, bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("escrow"),
        creator.toBuffer(),
        mint.toBuffer(),
        user.toBuffer(),
      ],
      program.programId
    );
    console.log("escrow: ", escrow);
    return [escrow, bump];
  };

  const mintNft = async (title: string, uri: string, price: number) => {
    if (program && anchorWallet) {
      try {
        setLoading(true);
        setTransactionPending(true);

        const userPubkey = anchorWallet.publicKey;
        const mintKeypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
        const creatorKeypair: anchor.web3.Keypair =
          anchor.web3.Keypair.generate();
        // anchor.web3.Keypair.fromSecretKey
        const treasuryAddress = new anchor.web3.PublicKey(
          "2zzfJ4AtuhjiFf9CoopizwjcDaK2oARiRfKTTRC3b8vH"
        );
        const usdcMintAddress = new anchor.web3.PublicKey(
          "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        );
        console.log("holo: ", anchorWallet.publicKey);
        const userUsdcAddress = await anchor.utils.token.associatedAddress({
          mint: usdcMintAddress,
          owner: anchorWallet.publicKey,
        });
        console.log("the price: ", price);

        const treasuryUsdcAddress = await anchor.utils.token.associatedAddress({
          mint: usdcMintAddress,
          owner: treasuryAddress,
        });

        console.log("treasury usdc account: ", treasuryAddress.toString());
        console.log("user usdc account: ", treasuryAddress.toString());
        const tokenAddress = await anchor.utils.token.associatedAddress({
          mint: mintKeypair.publicKey,
          owner: anchorWallet.publicKey,
        });

        console.log(`New token: ${mintKeypair.publicKey}`);

        // Derive the metadata and master edition addresses

        const metadataAddress = await getMetadata(mintKeypair.publicKey);

        console.log("Metadata initialized");
        const masterEditionAddress = await getMasterEdition(
          mintKeypair.publicKey
        );
        console.log("Master edition metadata initialized");

        // Transact with the "mint" function in our on-chain program

        const blockhash = await connection.getLatestBlockhash("finalized");
        const mintTx = new Transaction(blockhash);
        const mintIx = await program.methods
          .mintNft(creatorKeypair.publicKey, title, uri, new anchor.BN(price))
          .accounts({
            masterEdition: masterEditionAddress,
            metadata: metadataAddress,
            mint: mintKeypair.publicKey,
            tokenAccount: tokenAddress,
            userUsdcAccount: userUsdcAddress,
            user: anchorWallet.publicKey,
            treasuryUsdcAccount: treasuryUsdcAddress,
            treasury: treasuryAddress,
            usdcMint: usdcMintAddress,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          })
          .instruction();

        mintTx.add(mintIx);
        mintTx.feePayer = anchorWallet.publicKey;
        mintTx.sign(mintKeypair);

        await torusPlugin.torusWalletInstance.signAndSendTransaction(mintTx);

        console.log("successful!", mintIx);
        console.log(
          "token has been minted: ",
          mintKeypair.publicKey.toString()
        );
        setLoading(false);
        setTransactionPending(false);
        return mintKeypair.publicKey.toString();
      } catch (error) {
        console.log(error);
      }
    } else console.log("figure");
  };

  const listNft = async (
    price: number,
    creatorRoyalty: number,
    mint: string,
    creator: string
  ) => {
    if (program && anchorWallet) {
      try {
        console.log("the price", price);
        console.log("the creatorRoyalty", creatorRoyalty);
        console.log("the mint", mint);
        console.log("the creator", creator);
        setLoading(true);
        setTransactionPending(true);

        const nftMintAddress = new anchor.web3.PublicKey(
          // "4Ghiuuy9CpjzRDMyniHPe1kYCQcEtQqTAa31cCUKXuA8"
          mint
        );

        const metadataAccount = await getMetadata(nftMintAddress);

        const creatorAddress = new anchor.web3.PublicKey(
          // "5GBtEsP3xeRQriFmYKyroQow8XMBcrQwA3LfmJxdkxtZ"
          creator
        );

        const escrowAccountPda = (
          await getEscrowPDA(
            creatorAddress,
            nftMintAddress,
            anchorWallet.publicKey
          )
        )[0];

        const [escrowTokenAccountPda] = await findProgramAddressSync(
          [utf8.encode("token-account"), escrowAccountPda.toBuffer()],
          program.programId
        );

        const sellerNftTokenAccountAddress =
          await anchor.utils.token.associatedAddress({
            mint: nftMintAddress,
            owner: anchorWallet.publicKey,
          });
        console.log("escrow: ", escrowAccountPda.toString());
        const blockhash = await connection.getLatestBlockhash("finalized");
        const listTx = new Transaction(blockhash);
        const listIx = await program.methods
          .listNft(new anchor.BN(price), new anchor.BN(creatorRoyalty))
          .accounts({
            escrowAccount: escrowAccountPda,
            escrowTokenAccount: escrowTokenAccountPda,
            nftMint: nftMintAddress,
            nftMetadataAccount: metadataAccount,
            sellerNftTokenAccount: sellerNftTokenAccountAddress,
            seller: anchorWallet.publicKey,
            creator: creatorAddress,
          })
          .instruction();
        listTx.add(listIx);
        listTx.feePayer = anchorWallet.publicKey;

        torusPlugin.torusWalletInstance.signAndSendTransaction(listTx);
        console.log(listTx);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const delistNft = async (mint: string, creator: string) => {
    if (program && anchorWallet) {
      try {
        console.log("the mint: ", mint);
        console.log("the creator: ", creator);
        setLoading(true);
        setTransactionPending(true);

        const nftMintAddress = new anchor.web3.PublicKey(
          // "4Ghiuuy9CpjzRDMyniHPe1kYCQcEtQqTAa31cCUKXuA8"
          mint
        );

        const metadataAccount = await getMetadata(nftMintAddress);

        const creatorAddress = new anchor.web3.PublicKey(
          // "5GBtEsP3xeRQriFmYKyroQow8XMBcrQwA3LfmJxdkxtZ"
          creator
        );

        const [escrowAccountPda, bump] = await getEscrowPDA(
          creatorAddress,
          nftMintAddress,
          anchorWallet.publicKey
        );
        console.log("escrow: ", escrowAccountPda.toString());

        const [escrowTokenAccountPda] = await findProgramAddressSync(
          [utf8.encode("token-account"), escrowAccountPda.toBuffer()],
          program.programId
        );

        const sellerNftTokenAccountAddress =
          await anchor.utils.token.associatedAddress({
            mint: nftMintAddress,
            owner: anchorWallet.publicKey,
          });
        const blockhash = await connection.getLatestBlockhash("finalized");
        const delistTx = new Transaction(blockhash);
        const delistIx = await program.methods
          .delistNft(bump)
          .accounts({
            escrowAccount: escrowAccountPda,
            escrowTokenAccount: escrowTokenAccountPda,
            nftMint: nftMintAddress,
            nftMetadataAccount: metadataAccount,
            sellerNftTokenAccount: sellerNftTokenAccountAddress,
            seller: anchorWallet.publicKey,
            creator: creatorAddress,
          })
          .instruction();

        delistTx.add(delistIx);
        delistTx.feePayer = anchorWallet.publicKey;

        torusPlugin.torusWalletInstance.signAndSendTransaction(delistTx);
        console.log(delistIx);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const buyNft = async (mint: string, seller: string, creator: string) => {
    if (program && anchorWallet) {
      try {
        console.log("the mint: ", mint);
        console.log("the creator: ", creator);
        console.log("the seller: ", seller);
        setLoading(true);
        setTransactionPending(true);

        const nftMintAddress = new anchor.web3.PublicKey(
          // "4Ghiuuy9CpjzRDMyniHPe1kYCQcEtQqTAa31cCUKXuA8"
          mint
        );

        const usdcMintAddress = new anchor.web3.PublicKey(
          "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        );

        const creatorAddress = new anchor.web3.PublicKey(
          // "5GBtEsP3xeRQriFmYKyroQow8XMBcrQwA3LfmJxdkxtZ"
          creator
        );

        const sellerAddress = new anchor.web3.PublicKey(
          // "AoPUZLeqdgA8BHqC3nrmYKxQwbTUNZBcam4jNgKgYu2z"
          seller
        );

        const sellerUsdcAddress = await anchor.utils.token.associatedAddress({
          mint: usdcMintAddress,
          owner: sellerAddress,
        });

        const buyerUsdcAddress = await anchor.utils.token.associatedAddress({
          mint: usdcMintAddress,
          owner: anchorWallet.publicKey,
        });

        const creatorUsdcAddress = await anchor.utils.token.associatedAddress({
          mint: usdcMintAddress,
          owner: creatorAddress,
        });

        const [escrowAccountPda, bump] = await getEscrowPDA(
          creatorAddress,
          nftMintAddress,
          sellerAddress
        );

        const [escrowTokenAccountPda] = await findProgramAddressSync(
          [utf8.encode("token-account"), escrowAccountPda.toBuffer()],
          program.programId
        );
        console.log("escrow: ", escrowAccountPda.toString());
        const buyerNftTokenAccountAddress =
          await anchor.utils.token.associatedAddress({
            mint: nftMintAddress,
            owner: anchorWallet.publicKey,
          });
        const blockhash = await connection.getLatestBlockhash("finalized");
        const buyTx = new Transaction(blockhash);
        const buyIx = await program.methods
          .buyNft(bump)
          .accounts({
            escrowAccount: escrowAccountPda,
            escrowTokenAccount: escrowTokenAccountPda,
            nftMint: nftMintAddress,
            buyerNftTokenAccount: buyerNftTokenAccountAddress,
            seller: sellerAddress,
            sellerUsdcAccount: sellerUsdcAddress,
            buyer: anchorWallet.publicKey,
            buyerUsdcAccount: buyerUsdcAddress,
            creator: creatorAddress,
            creatorUsdcAccount: creatorUsdcAddress,
          })
          .instruction();
        buyTx.add(buyIx);
        buyTx.feePayer = anchorWallet.publicKey;

        torusPlugin.torusWalletInstance.signAndSendTransaction(buyTx);
        console.log(buyIx);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  return {
    transactionPending,
    loading,
    mintNft,
    listNft,
    delistNft,
    buyNft,
  };
};

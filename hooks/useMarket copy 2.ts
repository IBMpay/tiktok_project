import * as anchor from "@project-serum/anchor";
import { useEffect, useMemo, useState } from "react";
import { TIKTOK_MARKET_PROGRAM_ID } from "./index";
import marketIdl from "../constants/market-idl.json";
import {
  SystemProgram,
  PublicKey,
  Transaction,
  Connection,
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
// import Torus from "@toruslabs/solana-embed";
const clientId =
  "BOjke_VdSeEjE5Gap8t4hfg_1QRymSFuTYxklhGttI-6H-ZJARwiLQunE9PYrl9xyxwNerQQT6u01uDP744_mM8";

const useTorWallet = async (wallet) => {
  try {
    // const solanaWallet = new SolanaWallet(provider);
    // const connectionConfig = await solanaWallet.request<CustomChainConfig>({
    //   method: "solana_provider_config",
    //   params: [],
    // });
    // const conn = new Connection(connectionConfig.rpcTarget);
    // console.log("the wal: ", solanaWallet);
    const network = "https://api.devnet.solana.com";
    const connection = new Connection(network);
    const blockhash = (await connection.getLatestBlockhash("finalized"))
      .blockhash;

    const pubkeys = await wallet.getAccounts();
    const publicKey = new PublicKey(pubkeys[0]);
    console.log("the public: ", publicKey);
    const signTransaction = wallet.signTransaction;
    const signAndSendTransaction = wallet.signAndSendTransaction;
    const signAllTransactions = wallet.signAllTransactions;
    const request = wallet.communicationProvider.request;
    // const request = wallet.request;
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
  const [torusWallet, setTorusWallet] = useState<any>();
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );
  const [anchorWallet, setAnchorWallet] = useState<any>();
  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       const web3auth = new Web3Auth({
  //         clientId,
  //         chainConfig: {
  //           chainNamespace: CHAIN_NAMESPACES.SOLANA,
  //           chainId: "0x3",
  //           rpcTarget: "https://rpc.ankr.com/solana_devnet",
  //         },
  //         uiConfig: {
  //           theme: "dark",
  //           loginMethodsOrder: ["google"],
  //           appLogo: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
  //         },
  //       });

  //       const openloginAdapter = new OpenloginAdapter({
  //         adapterSettings: {
  //           clientId,
  //           network: "testnet",
  //           uxMode: "popup",
  //           whiteLabel: {
  //             name: "tiktok web3",
  //             logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
  //             logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
  //             defaultLanguage: "en",
  //             dark: true,
  //           },
  //           loginConfig: {
  //             google: {
  //               name: "Custom Auth Login",
  //               verifier: "zerus",
  //               typeOfLogin: "google",
  //               clientId:
  //                 "113546939659-0dk3adkkrls56eb6n4tfe10tn5km09ov.apps.googleusercontent.com",
  //             },
  //           },
  //         },
  //       });
  //       web3auth.configureAdapter(openloginAdapter);
  //       setWeb3auth(web3auth);

  //       await web3auth.initModal({
  //         modalConfig: {
  //           [WALLET_ADAPTERS.OPENLOGIN]: {
  //             label: "openlogin",
  //             loginMethods: {
  //               reddit: {
  //                 showOnModal: false,
  //                 name: "reddit",
  //               },
  //             },
  //           },
  //         },
  //       });
  //       if (web3auth.provider) {
  //         setProvider(web3auth.provider);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   init();
  // }, []);

  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    const init = async () => {
      const Torus = (await import("@toruslabs/solana-embed")).default;
      const torus = new Torus();
      await torus.init({
        buildEnv: "testing", // uses solana-testing.tor.us (which uses testnet)
        enableLogging: true, // default : false
        showTorusButton: true, // default: true
      });
      const publicKeys = await torus.login(); // return array of public key in base 58
      // const publicKey = publicKeys[0];
      // console.log("torus ===== ", torus);
      // const accounts = await torus.getAccounts();
      // console.log("far: ", accounts);
      setTorusWallet(torus);
      const anchorWallet = await useTorWallet(torus);

      // console.log("the wallet adapter: ", anchorWallet);
      setAnchorWallet(anchorWallet);
    };
    init();
  }, []);

  const program = useMemo(() => {
    // console.log("the connectionX: ", connection);
    const connection = new Connection("https://rpc.ankr.com/solana_devnet");
    if (anchorWallet) {
      const anchorProvider = new anchor.AnchorProvider(
        connection,
        anchorWallet,
        anchor.AnchorProvider.defaultOptions()
      );
      console.log("anchor provider: ", anchorProvider);
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

  const mintNftTorus = async (title: string, uri: string, price: number) => {
    // console.log("geooo");
    console.log("gooo:", anchorWallet);
    // const publicKeys = await torusWallet.login();
    // console.log("the pubkies: ", publicKeys);
    if (program && anchorWallet) {
      try {
        setLoading(true);
        setTransactionPending(true);
        console.log("start", anchorWallet);
        console.log(program);
        // const solanaWallet = new SolanaWallet(provider);
        // const connectionConfig = await solanaWallet.request<CustomChainConfig>({
        //   method: "solana_provider_config",
        //   params: [],
        // });
        // const conn = new Connection(connectionConfig.rpcTarget);

        // const block = await conn.getLatestBlockhash("finalized");

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

        const treasuryUsdcAddress = await anchor.utils.token.associatedAddress({
          mint: usdcMintAddress,
          owner: treasuryAddress,
        });

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

        // // const pubKey = await solanaWallet.requestAccounts();

        const TransactionInstruction = await program.methods
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
          // .signers([mintKeypair, torusWallet])
          .instruction();
        // console.log("transaction: ", TransactionInstruction);
        // console.log("block: ", block);
        const connection = new Connection("https://rpc.ankr.com/solana_devnet");
        const block = await connection.getLatestBlockhash("finalized");
        const transaction = new Transaction({
          blockhash: block.blockhash,
          lastValidBlockHeight: block.lastValidBlockHeight,
          feePayer: anchorWallet.publicKey,
        }).add(TransactionInstruction);
        // console.log("anchor wallet: ", anchorWallet);
        const signedTx = await torusWallet.signAndSendTransaction(transaction);
        // const signedTx = await solanaWallet.signAndSendTransaction(transaction);
        // .rpc();failed to send transaction: Transaction signature verification failure
        console.log("signed: ", signedTx);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    } else console.log("figure");
  };

  const mintNft = async (title: string, uri: string, price: number) => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);

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
        const userUsdcAddress = await anchor.utils.token.associatedAddress({
          mint: usdcMintAddress,
          owner: anchorWallet.publicKey,
        });

        const treasuryUsdcAddress = await anchor.utils.token.associatedAddress({
          mint: usdcMintAddress,
          owner: treasuryAddress,
        });

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

        await program.methods
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
          .signers([mintKeypair])
          .rpc();
        console.log("hello");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const listNft = async (price: number, creatorRoyalty: number) => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);

        const nftMintAddress = new anchor.web3.PublicKey(
          "4Ghiuuy9CpjzRDMyniHPe1kYCQcEtQqTAa31cCUKXuA8"
        );

        const metadataAccount = await getMetadata(nftMintAddress);

        const creatorAddress = new anchor.web3.PublicKey(
          "5GBtEsP3xeRQriFmYKyroQow8XMBcrQwA3LfmJxdkxtZ"
        );

        const escrowAccountPda = (
          await getEscrowPDA(creatorAddress, nftMintAddress, publicKey)
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
        await program.methods
          .listNft(new anchor.BN(price), new anchor.BN(creatorRoyalty))
          .accounts({
            escrowAccount: escrowAccountPda,
            escrowTokenAccount: escrowTokenAccountPda,
            nftMint: nftMintAddress,
            nftMetadataAccount: metadataAccount,
            sellerNftTokenAccount: sellerNftTokenAccountAddress,
            // seller: anchorWallet.publicKey,
            creator: creatorAddress,
          })
          .rpc();
        // console.log("hello");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const delistNft = async () => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);

        const nftMintAddress = new anchor.web3.PublicKey(
          "4Ghiuuy9CpjzRDMyniHPe1kYCQcEtQqTAa31cCUKXuA8"
        );

        const metadataAccount = await getMetadata(nftMintAddress);

        const creatorAddress = new anchor.web3.PublicKey(
          "5GBtEsP3xeRQriFmYKyroQow8XMBcrQwA3LfmJxdkxtZ"
        );

        const [escrowAccountPda, bump] = await getEscrowPDA(
          creatorAddress,
          nftMintAddress,
          publicKey
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

        await program.methods
          .delistNft(bump)
          .accounts({
            escrowAccount: escrowAccountPda,
            escrowTokenAccount: escrowTokenAccountPda,
            nftMint: nftMintAddress,
            nftMetadataAccount: metadataAccount,
            sellerNftTokenAccount: sellerNftTokenAccountAddress,
            // seller: anchorWallet.publicKey,
            creator: creatorAddress,
          })
          .rpc();
        // console.log("hello");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const buyNft = async () => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);

        const nftMintAddress = new anchor.web3.PublicKey(
          "4Ghiuuy9CpjzRDMyniHPe1kYCQcEtQqTAa31cCUKXuA8"
        );

        const usdcMintAddress = new anchor.web3.PublicKey(
          "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        );

        // const creatorAddress = new anchor.web3.PublicKey(
        //   "PtAUrTXxqagzgZmsigs9BVibhWCriGFEtG1dYJsMqMH"
        // );
        const creatorAddress = new anchor.web3.PublicKey(
          "5GBtEsP3xeRQriFmYKyroQow8XMBcrQwA3LfmJxdkxtZ"
        );

        const sellerAddress = new anchor.web3.PublicKey(
          "AoPUZLeqdgA8BHqC3nrmYKxQwbTUNZBcam4jNgKgYu2z"
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

        await program.methods
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
          .rpc();
        // console.log("hello");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const initializePlayAccount = async (vaultCreator: PublicKey) => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);
        const [vaultPda] = findProgramAddressSync(
          [utf8.encode("vault"), vaultCreator.toBuffer()],
          program.programId
        );
        const [userStatsPda] = findProgramAddressSync(
          [
            utf8.encode("user-stats"),
            publicKey.toBuffer(),
            vaultPda.toBuffer(),
          ],
          program.programId
        );

        const tx = await program.methods
          .initPlayingState()
          .accounts({
            user: publicKey,
            userStats: userStatsPda,
            vault: vaultPda,
            vaultCreator: vaultCreator,
          })
          .rpc();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  return {
    initializePlayAccount,
    transactionPending,
    loading,
    mintNft,
    listNft,
    delistNft,
    mintNftTorus,
    buyNft,
  };
};

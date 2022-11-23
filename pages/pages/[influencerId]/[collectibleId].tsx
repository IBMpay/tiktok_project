import { Container, Modal } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  where,
  serverTimestamp,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
} from "@firebase/firestore";
import dateFormat from "dateformat";
import Button from "../../../components/Button";
import NFTGridItem from "../../../components/NFTGridItem";
import { db } from "../../../firebase-config";
import { useWeb3Auth } from "../../../services/web3auth";
import Link from "next/link";
import { useMarket } from "../../../hooks/useMarket";
import LoginSection from "../../../components/loginSection";
import Loader from "../../../components/loader";
import { truncate } from "../../../utils/string";
import NFTPostItem from "../../../components/NFTPostItem";
import Header from "../../../components/Header";
import { Web3Auth } from "@web3auth/web3auth";
import axios from "axios";
const Grifter = () => {
  const router = useRouter();
  const { influencerId, collectibleId } = router.query;
  const {
    provider,
    login,
    // showWalletConnectScanner,
    showDapp,
    showTopup,
    logout,
    getUserInfo,
    getAccounts,
    getBalance,
    web3Auth,
    signMessage,
    user,
    isConnected,
    getUser,
    isConnecting,
    signV4Message,
    getWallets,
  } = useWeb3Auth();

  const [title, setTitle] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [mintAddr, setMintAddr] = useState<string>("");
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [artist, setArtist] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [metadataUri, setMetadataUri] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [royalty, setRoyalty] = useState<number>(0);
  const [influencerWallet, setInfluencerWallet] = useState<string>("");
  const [listPrice, setListPrice] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [transactions, setTransactions] = useState([]);
  const [loadingProcess, setLoadingProcess] = useState<boolean>(false);
  const [currentPrice, setCurrentPrice] = useState<string>("");
  const [lastSalePrice, setLastSalePrice] = useState<string>("");
  const [relatedItems, setRelatedItems] = useState([]);
  const [path, setPath] = useState<string>("");
  const [mediaType, setMediaType] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");
  const [balance, setBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [notEnoughUsdc, setNotEnoughUsdc] = useState<boolean>(false);
  const [notEnoughSol, setNotEnoughSol] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  // const router = useRouter();
  const { mintNft, listNft, delistNft, buyNft, transactionPending } =
    useMarket();
  useEffect(() => {
    const init = async () => {
      // if (!isConnected && !isConnecting) router.push("/login");

      if (influencerId && collectibleId && provider) {
        try {
          setPath(router.asPath);
          const influencerUsername = influencerId.toString();
          const user = await getUser();
          const username = user.email.split("@", 1)[0].replace(".", "");
          setUserName(username);
          const collectibleRef = doc(
            db,
            "users",
            influencerId.toString(),
            "collectibles",
            collectibleId.toString()
          );
          const transactionsRef = collection(
            db,
            "users",
            influencerId.toString(),
            "collectibles",
            collectibleId.toString(),
            "transactions"
          );
          const transactionsResponse = await getDocs(transactionsRef);
          console.log(transactionsResponse);
          const transactionsData = transactionsResponse.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          console.log("transactions: ", transactionsData);
          setTransactions(transactionsData);
          const address = await getWallets();
          console.log(address);
          const influencerRef = doc(db, "users", influencerId.toString());
          const userData = (await getDoc(influencerRef)).data();
          const influencerWalletAddress = userData.wallet;
          setInfluencerWallet(influencerWalletAddress);
          console.log("influencer wallet: ", influencerWallet);

          const collectiblesRef = collection(
            db,
            "users",
            influencerId.toString(),
            "collectibles"
          );
          const relatedCollectibles = query(
            collectiblesRef,
            orderBy("price"),
            limit(4)
          );
          const relatedCollectiblesResponse = await getDocs(
            relatedCollectibles
          );
          const relatedCollectiblesData = relatedCollectiblesResponse.docs.map(
            (doc) => ({
              ...doc.data(),
              id: doc.id,
            })
          );
          setRelatedItems(relatedCollectiblesData);
          const userSnap = await getDoc(collectibleRef);
          if (userSnap.exists()) {
            const collectiblesSnap = await getDoc(collectibleRef);
            const collectiblesData = collectiblesSnap.data();
            setMediaType(collectiblesData.mediaType);
            setTitle(collectiblesData.title);
            setDesc(collectiblesData.description);
            setStatus(collectiblesData.status);
            setMetadataUri(collectiblesData.metadataUrl);
            setRoyalty(collectiblesData.royalties);
            setPrice(+collectiblesData.price * 1_000_000);
            setCurrentPrice(collectiblesData.price);
            setLastSalePrice(collectiblesData.lastSalePrice);
            if (collectiblesData.status !== "offchain") {
              setMintAddr(collectiblesData.mint);
              setOwner(collectiblesData.owner);
            }
            console.log("the video is : ", collectiblesData.videoUrl);
            setMediaUrl(collectiblesData.videoUrl);
            setArtist(influencerId.toString());

            const response = await axios({
              url: `https://api.devnet.solana.com`,
              method: "post",
              headers: { "Content-Type": "application/json" },
              data: [
                {
                  jsonrpc: "2.0",
                  id: 1,
                  method: "getTokenAccountsByOwner",
                  params: [
                    address[0],
                    {
                      mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
                    },
                    {
                      encoding: "jsonParsed",
                    },
                  ],
                },
              ],
            });
            const solResponse = await axios({
              url: `https://api.devnet.solana.com`,
              method: "post",
              headers: { "Content-Type": "application/json" },
              data: [
                {
                  jsonrpc: "2.0",
                  id: 1,
                  method: "getBalance",
                  params: [address[0]],
                },
              ],
            });
            const usdcBal =
              +response.data[0].result.value[0].account.data.parsed.info
                .tokenAmount.uiAmountString;
            const solBal = +(
              solResponse.data[0].result.value / 1_000_000_000
            ).toFixed(3);
            setNotEnoughSol(solBal < 0.03);
            switch (collectiblesData.status) {
              case "offchain":
                if (username !== influencerId && price >= usdcBal)
                  setNotEnoughUsdc(true);
                break;
              case "listed":
                if (collectiblesData.owner !== username && price >= usdcBal)
                  setNotEnoughUsdc(true);
                break;
            }
          } else {
            console.log("doesn't exist");
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    init();
  }, [influencerId, provider]);

  const handleMint = async () => {
    try {
      // const mintAddress = await mintNft(
      //   title,
      //   "https://arweave.net/Um4-3tbD57AuA92hZoYKXWIibI-UXwuU033yocR85tA",
      //   price
      // );
      // const mintAddress = "As9pKmGg6yTugSgfonnig6UVRPZigZbMEr24YGcyCbZq";
      setLoadingProcess(false);
      const mintAddress = await mintNft(
        title,
        metadataUri,
        price,
        influencerWallet
      );
      const user = await getUser();
      const username = user.email.split("@", 1)[0].replace(".", "");
      console.log(username);
      // console.log("minted");
      const collectibleDoc = doc(
        db,
        "users",
        influencerId.toString(),
        "collectibles",
        collectibleId.toString()
      );
      const address = (await getWallets())[0];
      console.log("the address is clear ", address);
      await updateDoc(collectibleDoc, {
        status: "onchain",
        owner: username,
        mint: mintAddress,
      });

      const transactionsDoc = collection(
        db,
        "users",
        influencerId.toString(),
        "collectibles",
        collectibleId.toString(),
        "transactions"
      );
      await addDoc(transactionsDoc, {
        type: "mint",
        to: username,
        timestamp: serverTimestamp(),
        price: (price / 1_000_000).toString(),
      });
      console.log("transaction created");

      const activitiesDoc = collection(db, "users", username, "activities");
      await addDoc(activitiesDoc, {
        type: "mint",
        mint: mintAddress,
        timestamp: serverTimestamp(),
        price: (price / 1_000_000).toString(),
      });

      const collectedRef = doc(
        db,
        "users",
        username,
        "collected",
        collectibleId.toString()
      );
      await setDoc(collectedRef, {
        id: collectibleId,
        media: mediaUrl,
        title,
        buyTimestamp: serverTimestamp(),
        creator: artist,
        buyPrice: (price / 1_000_000).toString(),
        mediaType,
        active: true,
      });
      setMintAddr(mintAddress);
      setModalMessage("Your NFT has been minted successfully!");
      setOpen(true);
      // console.log("token ", mintAddress, " has been minted--");
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingProcess(false);
    }
  };

  const handleList = async () => {
    try {
      // const mintAddress = "As9pKmGg6yTugSgfonnig6UVRPZigZbMEr24YGcyCbZq";
      //     price: number,
      // creatorRoyalty: number,
      // mint: string,
      // creator: string
      setLoadingProcess(true);
      const tx = await listNft(
        +listPrice * 1_000_000,
        royalty,
        mintAddr,
        influencerWallet
      );
      console.log("transaction is: ", tx);
      if (tx) {
        console.log("your nft has been listed");
        const user = await getUser();
        const username = user.email.split("@", 1)[0].replace(".", "");
        // const address = (await getWallets)[0]
        console.log(username);
        // console.log("minted");
        const collectibleDoc = doc(
          db,
          "users",
          influencerId.toString(),
          "collectibles",
          collectibleId.toString()
        );
        const address = (await getWallets())[0];
        console.log("the address is clear ", address);
        await updateDoc(collectibleDoc, {
          status: "listed",
          price: listPrice,
        });

        const transactionsDoc = collection(
          db,
          "users",
          influencerId.toString(),
          "collectibles",
          collectibleId.toString(),
          "transactions"
        );
        await addDoc(transactionsDoc, {
          type: "list",
          from: username,
          timestamp: serverTimestamp(),
          price: listPrice,
        });
        console.log("transaction created");

        const activitiesDoc = collection(db, "users", username, "activities");
        await addDoc(activitiesDoc, {
          type: "list",
          mint: mintAddr,
          timestamp: serverTimestamp(),
          price: listPrice,
        });
        const collectedRef = doc(
          db,
          "users",
          username,
          "collected",
          collectibleId.toString()
        );
        await updateDoc(collectedRef, {
          active: false,
        });
      }
      setModalMessage("Your NFT has been listed successfully!");
      setOpen(true);
      // console.log("token ", mintAddress, " has been minted--");
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingProcess(false);
    }
  };

  const handleDelist = async () => {
    try {
      // const mintAddress = "As9pKmGg6yTugSgfonnig6UVRPZigZbMEr24YGcyCbZq";
      //     price: number,
      // creatorRoyalty: number,
      // mint: string,
      // creator: string
      setLoadingProcess(true);
      const tx = await delistNft(mintAddr, influencerWallet);
      console.log("transaction is: ", tx);
      if (tx) {
        console.log("your nft has been delisted");
        const user = await getUser();
        const username = user.email.split("@", 1)[0].replace(".", "");
        // const address = (await getWallets)[0]
        console.log(username);
        // console.log("minted");
        const collectibleDoc = doc(
          db,
          "users",
          influencerId.toString(),
          "collectibles",
          collectibleId.toString()
        );
        const address = (await getWallets())[0];
        console.log("the address is clear ", address);
        await updateDoc(collectibleDoc, {
          status: "onchain",
        });

        const transactionsDoc = collection(
          db,
          "users",
          influencerId.toString(),
          "collectibles",
          collectibleId.toString(),
          "transactions"
        );
        await addDoc(transactionsDoc, {
          type: "delist",
          from: username,
          timestamp: serverTimestamp(),
        });
        console.log("transaction created");

        const activitiesDoc = collection(db, "users", username, "activities");
        await addDoc(activitiesDoc, {
          type: "delist",
          mint: mintAddr,
          timestamp: serverTimestamp(),
        });
        const collectedRef = doc(
          db,
          "users",
          username,
          "collected",
          collectibleId.toString()
        );
        await updateDoc(collectedRef, {
          active: true,
        });
      }
      setModalMessage("Your NFT has been delisted successfully!");
      setOpen(true);
      // console.log("token ", mintAddress, " has been minted--");
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingProcess(false);
    }
  };

  const handleBuy = async () => {
    try {
      // const mintAddress = "As9pKmGg6yTugSgfonnig6UVRPZigZbMEr24YGcyCbZq";
      //     price: number,
      // creatorRoyalty: number,
      // mint: string,
      // creator: string
      console.log("hello");
      const sellerRef = doc(db, "users", owner);
      const sellerData = (await getDoc(sellerRef)).data();
      setLoadingProcess(true);
      console.log("mint: ", mintAddr);
      console.log("seller: ", sellerData.wallet);
      console.log("influencer: ", influencerWallet);

      const tx = await buyNft(mintAddr, sellerData.wallet, influencerWallet);
      console.log("transaction is: ", tx);
      if (tx) {
        console.log("your nft has been delisted");
        const user = await getUser();
        const username = user.email.split("@", 1)[0].replace(".", "");
        // const address = (await getWallets)[0]
        console.log(username);
        // console.log("minted");
        const collectibleDoc = doc(
          db,
          "users",
          influencerId.toString(),
          "collectibles",
          collectibleId.toString()
        );
        const address = (await getWallets())[0];
        console.log("the address is clear ", address);
        const lastPrice = +price / 1_000_000;
        await updateDoc(collectibleDoc, {
          status: "onchain",
          owner: userName,
          lastSalePrice: lastPrice.toString(),
        });

        const transactionsDoc = collection(
          db,
          "users",
          influencerId.toString(),
          "collectibles",
          collectibleId.toString(),
          "transactions"
        );
        await addDoc(transactionsDoc, {
          type: "buy",
          to: username,
          timestamp: serverTimestamp(),
        });
        console.log("transaction created");

        const activitiesDoc = collection(db, "users", username, "activities");
        await addDoc(activitiesDoc, {
          type: "buy",
          mint: mintAddr,
          timestamp: serverTimestamp(),
        });
        const collectedRef = doc(
          db,
          "users",
          username,
          "collected",
          collectibleId.toString()
        );
        const collectedSnap = await getDoc(collectedRef);
        if (collectedSnap.exists()) {
          await updateDoc(collectedRef, {
            buyPrice: lastPrice.toString(),
            active: true,
          });
        } else {
          await setDoc(collectedRef, {
            id: collectibleId,
            media: mediaUrl,
            title,
            creator: artist,
            buyTimestamp: serverTimestamp(),
            buyPrice: lastPrice.toString(),
            mediaType,
            active: true,
          });
        }
      }
      setModalMessage("Your NFT has been bought successfully!");
      setOpen(true);
      // console.log("token ", mintAddress, " has been minted--");
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingProcess(false);
    }
  };

  return (
    <>
      {!isConnecting && provider /* 
        provider ? ( */ ? (
        <Container>
          <Header />
          <div className="md:flex mt-20">
            <div className="md:w-2/4">
              {/* <img src={"/assets/MakeOfferImg.png"} className="rounded-xl" alt="" /> */}
              <div className="rounded-xl overflow-hidden mb-8">
                {mediaType !== "video/mp4" &&
                mediaType !== "video/ogg" &&
                mediaType !== "video/webm" ? (
                  <img src={mediaUrl} />
                ) : (
                  <video width="620" height="620" controls>
                    <source src={mediaUrl} type="video/mp4" />
                    some
                  </video>
                )}
              </div>
              <div className="mt-6">
                <h1 className="font-bold text-xl">Description</h1>
                <p className="text-gray-500 text-sm mt-2">{desc}</p>
              </div>
              <div className="mt-6">
                <h1 className="font-bold text-xl">Details</h1>
                <div className="rounded-xl mt-4 border-1 border border-black p-6">
                  <div className="flex justify-between">
                    <p>Contract address</p>
                    <p className="justify-end">
                      <a
                        href={`https://explorer.solana.com/address/${mintAddr}/metadata?cluster=devnet`}
                      >
                        {truncate(mintAddr)}
                      </a>
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p>Blockchain</p>
                    <p className="justify-end">
                      <a href="">Solana</a>
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p>Token Standard</p>
                    <p className="justify-end">
                      <a href="">Solana</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-0 md:ml-20 md:w-2/4">
              <div className="flex gap-2 mb-3">
                <button className="text-center text-gray-500 px-6 py-1 border border-1 hover:bg-[#635BFF] border-gray-500 rounded-md  hover:text-white">
                  Follow
                </button>
                <button className="text-center text-gray-500 px-6 py-1 border border-1 border-gray-500 rounded-md hover:bg-[#635BFF] hover:text-white">
                  Share
                </button>
              </div>
              <div>
                <h1 className="text-4xl font-bold">{title}</h1>
                <div className="flex py-4 border-b-2">
                  <div className="flex mr-6 items-center">
                    <img
                      src={"/assets/Ellips.png"}
                      className="h-8 w-8"
                      alt=""
                    />

                    <p className="ml-2 font-semibold">
                      Artist <Link href={`/pages/${artist}`}>{artist}</Link>
                    </p>
                  </div>

                  {status !== "offchain" && (
                    <div className="flex mr-6 items-center">
                      <img
                        src={"/assets/Ellips.png"}
                        className="h-8 w-8"
                        alt=""
                      />
                      <p className="ml-2 font-semibold">
                        Owner <Link href={`/pages/${owner}`}>{owner}</Link>
                      </p>
                    </div>
                  )}
                </div>
                {loadingProcess && (
                  <div className="my-2 flex justify-center">
                    <div className="circle-spinner">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                )}
                <div className="mt-3 p-5 border border-gray-200 rounded-xl">
                  {" "}
                  <div className="w-full bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700">Price</p>
                    <h3 className="text-black font-bold flex text-lg">
                      <span>${currentPrice}</span>{" "}
                      <img
                        src="/assets/usdc.webp"
                        className="w-5 h-5 mt-1 ml-1"
                      />
                    </h3>
                  </div>
                  <div className="my-2 ">
                    {lastSalePrice && (
                      <p className="text-sm text text-center font-semibold justify-center flex">
                        Last sale price ${lastSalePrice}{" "}
                        <img
                          src="/assets/usdc.webp"
                          className="w-4 h-4 mt-1 ml-1"
                        />
                      </p>
                    )}
                  </div>
                  {status === "offchain" && (
                    <>
                      {notEnoughUsdc || notEnoughSol ? (
                        <>
                          <button
                            disabled
                            className=" border-none text-white bg-[#b7b4f3]  px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                          >
                            Mint Now
                          </button>
                          <p className="text-sm my-4 text text-center font-semibold justify-center flex">
                            Please fund your wallet to be able to mint the token{" "}
                            <img
                              src="/assets/usdc.webp"
                              className="w-4 h-4 mt-1 ml-1"
                            />
                          </p>
                          <button
                            className=" border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                            onClick={showTopup}
                          >
                            Fund your wallet
                          </button>
                        </>
                      ) : (
                        <button
                          className=" border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                          onClick={handleMint}
                        >
                          Mint Now
                        </button>
                      )}
                    </>
                  )}
                  {status === "onchain" && owner === userName && (
                    <>
                      {notEnoughSol ? (
                        <>
                          <input
                            disabled
                            type="text"
                            value={listPrice}
                            placeholder="Price here"
                            className="w-full p-2 pl-4 rounded-lg my-3 border border-gray-300"
                            onChange={(e) => setListPrice(e.target.value)}
                          />
                          <button
                            disabled
                            className=" border-none text-white bg-[#b7b4f3]  px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                          >
                            List Now
                          </button>
                          <p className="text-sm my-4 text text-center font-semibold justify-center flex">
                            Please fund your wallet to be able to list the token{" "}
                            <img
                              src="/assets/usdc.webp"
                              className="w-4 h-4 mt-1 ml-1"
                            />
                          </p>
                          <button
                            className=" border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                            onClick={showTopup}
                          >
                            Fund your wallet
                          </button>
                        </>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={listPrice}
                            placeholder="Price here"
                            className="w-full p-2 pl-4 rounded-lg my-3 border border-gray-300"
                            onChange={(e) => setListPrice(e.target.value)}
                          />
                          <button
                            className=" border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                            onClick={handleList}
                          >
                            List Now
                          </button>
                        </>
                      )}
                    </>
                  )}
                  {status === "listed" && owner === userName && (
                    <>
                      {notEnoughSol ? (
                        <>
                          <button
                            disabled
                            className="border-none text-white bg-[#b7b4f3]  px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                          >
                            Delist Now
                          </button>
                          <p className="text-sm my-4 text text-center font-semibold justify-center flex">
                            Please fund your wallet to be able to delist the
                            token{" "}
                            <img
                              src="/assets/usdc.webp"
                              className="w-4 h-4 mt-1 ml-1"
                            />
                          </p>
                          <button
                            className=" border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                            onClick={showTopup}
                          >
                            Fund your wallet
                          </button>
                        </>
                      ) : (
                        <button
                          className=" border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                          onClick={handleDelist}
                        >
                          Delist Now
                        </button>
                      )}
                    </>
                  )}
                  {status === "listed" && owner !== userName && (
                    <>
                      {notEnoughSol ? (
                        <>
                          <button
                            disabled
                            className="border-none text-white bg-[#b7b4f3]  px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                            // onClick={handleBuy}
                          >
                            Buy Now for ${currentPrice} USDC
                          </button>
                          <p className="text-sm my-4 text text-center font-semibold justify-center flex">
                            Please fund your wallet to be able to buy the token{" "}
                            <img
                              src="/assets/usdc.webp"
                              className="w-4 h-4 mt-1 ml-1"
                            />
                          </p>
                          <button
                            className=" border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                            onClick={showTopup}
                          >
                            Fund your wallet
                          </button>
                        </>
                      ) : (
                        <button
                          className="mt-1 border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                          onClick={handleBuy}
                        >
                          Buy Now for ${currentPrice} USDC
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h1 className="font-bold text-xl">History</h1>
                <div className="mt-4 max-h-96 overflow-y-scroll">
                  {transactions.map((transaction, i) => (
                    <>
                      {transaction.type === "list" && (
                        <div className="flex items-center mb-3" key={i}>
                          <div className="mr-4">
                            <img src="/assets/ellips.png" />
                          </div>
                          <div className=" text-md">
                            {transaction.from} listed the token for{" "}
                            {transaction.price}
                            usdc
                            <p className="text-xs text-gray-500 mt-1">
                              {dateFormat(
                                transaction.timestamp.toDate(),
                                "dddd, mmmm dS, yyyy, h:MM:ss TT"
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                      {transaction.type === "mint" && (
                        <div className="flex items-center mb-3" key={i}>
                          <div className="mr-4">
                            <img src="/assets/ellips.png" />
                          </div>
                          <div className=" text-md">
                            {transaction.from} minted the token
                            <p className="text-xs text-gray-500 mt-1">
                              {dateFormat(
                                transaction.timestamp.toDate(),
                                "dddd, mmmm dS, yyyy, h:MM:ss TT"
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                      {transaction.type === "delist" && (
                        <div className="flex items-center mb-3" key={i}>
                          <div className="mr-4">
                            <img src="/assets/ellips.png" />
                          </div>
                          <div className=" text-md">
                            {transaction.from} delisted the token
                            <p className="text-xs text-gray-500 mt-1">
                              {dateFormat(
                                transaction.timestamp.toDate(),
                                "dddd, mmmm dS, yyyy, h:MM:ss TT"
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <h1 className="font-bold text-xl">Tags</h1>
                <div className="flex mt-4">
                  <span className="py-0 px-3 rounded-full border-1 border-black border hover:bg-black hover:text-white cursor-pointer mr-2">
                    green
                  </span>
                  <span className="py-0 px-3 rounded-full border-1 border-black border hover:bg-black hover:text-white cursor-pointer mr-2">
                    blue
                  </span>
                  <span className="py-0 px-3 rounded-full border-1 border-black border hover:bg-black hover:text-white cursor-pointer mr-2">
                    yellow
                  </span>
                  <span className="py-0 px-3 rounded-full border-1 border-black border hover:bg-black hover:text-white cursor-pointer mr-2">
                    orange
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-white drop-shadow-xl rounded-3xl p-4">
              <div className="relative -top-12 px-8">
                <div className="flex justify-center ">
                  {mediaType === "video/mp4" ? (
                    <div className="flex justify-center relative -top-6">
                      <video
                        width="128"
                        height="128"
                        className="h-32 w-32 rounded-xl justify-centers"
                      >
                        <source src={mediaUrl} type="video/mp4" />
                        sample
                      </video>
                    </div>
                  ) : (
                    <img
                      className="h-32 w-32 rounded-xl justify-centers"
                      src={mediaUrl}
                    />
                  )}
                </div>

                <div className="mt-4">
                  <h1 className="capitalize text-3xl font-bold text-center">
                    congratulations!
                  </h1>
                  <p className="text-center  mt-2">{modalMessage}</p>
                </div>
                <div className="grid grid-rows-1 mb-6 mt-2">
                  {/* <Link href={`/pages/${influencerId}/${collectibleId}`}> */}
                  <a
                    href={`/pages/${influencerId}/${collectibleId}`}
                    className=" border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold text-center"
                  >
                    View NFT
                  </a>
                  {/* </Link> */}
                </div>
                <div className="relative mb-4">
                  <div className="absolute border-t border-black w-full"></div>
                  <p className="text-center relative -top-3">
                    <span className="bg-white px-2 font-semibold">or</span>
                  </p>
                  <p className="text-center text-sm text-gray-700 font-bold">
                    More you can do
                  </p>
                </div>
                <div className="grid grid-rows-3 gap-2">
                  <button className="py-2 rounded-full font-semibold text-[#635BFF] border-2 border-[#635BFF] hover:bg-[#635BFF] hover:text-white">
                    Share your NFT
                  </button>
                </div>
              </div>
            </div>
          </Modal>
          <div className="mt-8">
            <h1 className="font-bold text-xl">More from {influencerId}</h1>
          </div>
          <div className="grid mt-8 md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6">
            {relatedItems.map((nft, i) => (
              <NFTPostItem
                key={i}
                id={nft.id}
                type={nft.mediaType}
                lastSalePrice={nft.lastSalePrice || null}
                baseLink={path}
                video={nft.videoUrl}
                title={nft.title}
                price={+nft.price}
                description={nft.description}
                provider={provider}
              />
            ))}
          </div>
          {/* <div className="ImgFlex">
              <img src={"assets/nftimg.png"} alt="" />
              <img src={"assets/nftimg.png"} alt="" />
              <img src={"assets/nftimg.png"} alt="" />
              <img src={"assets/nftimg.png"} alt="" />
              <img src={"assets/nftimg.png"} alt="" />
            </div> */}
        </Container>
      ) : (
        // ) : (
        //   <LoginSection login={login} />
        // )
        <Loader />
      )}
    </>
  );
};
export default Grifter;

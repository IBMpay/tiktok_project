import { Container, Modal, Popover } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  where,
  onSnapshot,
  serverTimestamp,
  setDoc,
  deleteDoc,
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
import {
  FacebookShareButton,
  FacebookIcon,
  WhatsappIcon,
  WhatsappShareButton,
  TwitterShareButton,
  TwitterIcon,
  EmailShareButton,
  EmailIcon,
  TelegramIcon,
  TelegramShareButton,
} from "react-share";
import { isMobile } from "../../../utils/string";
import { RWebShare } from "react-web-share";
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
  const [hashtags, setHashtags] = useState([]);
  const [ownerDisplayName, setOwnerDisplayName] = useState<string>("");
  const [influencerName, setInfluencerName] = useState<string>("");
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const [myUsername, setMyUsername] = useState<string>("");
  const handleClose = () => setOpen(false);
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [isMobileBrowser, setIsMobileBrowser] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [fullPath, setFullPath] = useState<string>("");

  const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setAnchorEl(null);
  };
  const shareOpen = Boolean(anchorEl);
  const elId = shareOpen ? "simple-popover" : undefined;
  // const router = useRouter();
  const { mintNft, listNft, delistNft, buyNft, transactionPending } =
    useMarket();
  useEffect(() => {
    const init = async () => {
      // if (!isConnected && !isConnecting) router.push("/login");
      if (influencerId && collectibleId && provider) {
        try {
          setIsMobileBrowser(isMobile());
          setFullPath(`${window.location.origin}${router.asPath}`);
          setPath(router.asPath);
          const influencerUsername = influencerId.toString();
          const user = await getUser();
          const username = user.email.split("@", 1)[0].replace(".", "");
          setUserName(username);
          // console.log("influencer")
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
          const transactionsQuery = query(
            transactionsRef,
            orderBy("timestamp", "desc")
          );
          const transactionsResponse = await getDocs(transactionsQuery);
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
          const influencerDisplayName = userData.name;
          setInfluencerName(influencerDisplayName);
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
          console.log("helooooooo");
          const relatedCollectiblesData = relatedCollectiblesResponse.docs.map(
            (doc) => ({
              ...doc.data(),
              id: doc.id,
            })
          );
          console.log("this post: ", relatedCollectiblesData);
          const relatedDocs = relatedCollectiblesData.filter(
            (item) => item.id !== collectibleId
          );
          setRelatedItems(relatedDocs);
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
            if (
              collectiblesData.hashtags &&
              collectiblesData.hashtags.length !== 0
            )
              setHashtags(collectiblesData.hashtags);

            if (collectiblesData.status !== "offchain") {
              setMintAddr(collectiblesData.mint);
              setOwner(collectiblesData.owner);
              if (collectiblesData.owner) {
                const ownerRef = doc(db, "users", collectiblesData.owner);
                const ownerSnap = await getDoc(ownerRef);
                setOwnerDisplayName(ownerSnap.data().name);
              }
              // setOwner(collectiblesData.owner);
            }
            console.log("the video is : ", collectiblesData.videoUrl);
            setMediaUrl(collectiblesData.videoUrl);
            setArtist(influencerId.toString());

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

            console.log("response sol", solResponse);
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

            console.log("response", response);

            const usdcBal =
              response.data[0].result.value.length !== 0
                ? +response.data[0].result.value[0].account.data.parsed.info
                    .tokenAmount.uiAmountString
                : 0;
            // setUsdcBalance(usdcBal);
            const solBal = +(
              solResponse.data[0].result.value / 1_000_000_000
            ).toFixed(3);
            setNotEnoughSol(solBal < 0.03);
            const nftPrice = +collectiblesData.price;
            console.log("the price is: ", nftPrice);
            switch (collectiblesData.status) {
              case "offchain":
                if (username !== influencerId && nftPrice >= usdcBal)
                  setNotEnoughUsdc(true);
                break;
              case "listed":
                if (collectiblesData.owner !== username && nftPrice >= usdcBal)
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
  }, [influencerId, collectibleId, provider]);

  useEffect(() => {
    if (influencerId && provider && userName) {
      onSnapshot(collection(db, "users", userName, "likes"), (snapshot) => {
        setLikes(snapshot.docs);
      });
    }
  }, [influencerId, db, userName, provider]);
  useEffect(
    () =>
      setHasLiked(
        likes.findIndex((follow) => follow.id === collectibleId.toString()) !==
          -1
      ),
    [likes]
  );

  const likeCollectible = async () => {
    try {
      const likesRef = doc(
        db,
        "users",
        userName,
        "likes",
        collectibleId.toString()
      );
      if (hasLiked) {
        await deleteDoc(likesRef);
      } else {
        await setDoc(likesRef, {
          nft: collectibleId.toString(),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
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
        setModalMessage("Your NFT has been listed successfully!");
        setOpen(true);
      }

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
        setModalMessage("Your NFT has been delisted successfully!");
        setOpen(true);
      }

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
        setModalMessage("Your NFT has been bought successfully!");
        setOpen(true);
      }

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
          <div className="md:flex  mt-32">
            <div className="md:w-2/4">
              {/* <img src={"/assets/MakeOfferImg.png"} className="rounded-xl" alt="" /> */}
              {mediaUrl && (
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
              )}
              <div className=" md:hidden">
                <h1 className="text-4xl font-bold">{title}</h1>
                <div className="flex py-4 border-b-2">
                  <div className="flex mr-6 items-center">
                    <img
                      src={"/assets/Ellips.png"}
                      className="h-8 w-8"
                      alt=""
                    />

                    <p className="ml-2 font-semibold">
                      Artist{" "}
                      <Link href={`/pages/${artist}`}>{influencerName}</Link>
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
                        Owner{" "}
                        <Link href={`/pages/${owner}`}>{ownerDisplayName}</Link>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden md:block">
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
                        {mintAddr ? (
                          <a
                            href={`https://explorer.solana.com/address/${mintAddr}/metadata?cluster=devnet`}
                          >
                            {truncate(mintAddr)}
                          </a>
                        ) : (
                          "Be the first to mint it!"
                        )}
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
            </div>

            <div className=" md:ml-20 md:w-2/4 mt-6 md:mt-0">
              <div className="flex gap-2 mb-3">
                {hasLiked ? (
                  <button
                    onClick={likeCollectible}
                    className="text-center text-white px-6 py-1 border border-1 bg-[#635BFF] border-gray-500 rounded-md  hover:text-white"
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    onClick={likeCollectible}
                    className="text-center text-gray-500 px-6 py-1 border border-1 hover:bg-[#635BFF] border-gray-500 rounded-md  hover:text-white"
                  >
                    Follow
                  </button>
                )}
                {isMobileBrowser ? (
                  <RWebShare
                    data={{
                      text: "Web Share - Ayoo",
                      url: fullPath,
                      title: "Ayoo",
                    }}
                    onClick={() => console.log("shared successfully!")}
                  >
                    <button className="text-center text-gray-500 px-6 py-1 border border-1 border-gray-500 rounded-md hover:bg-[#635BFF] hover:text-white">
                      Share
                    </button>
                  </RWebShare>
                ) : (
                  <>
                    <button
                      onClick={handleShareClick}
                      className="text-center text-gray-500 px-6 py-1 border border-1 border-gray-500 rounded-md hover:bg-[#635BFF] hover:text-white"
                    >
                      Share
                    </button>
                    <Popover
                      id={elId}
                      open={shareOpen}
                      anchorEl={anchorEl}
                      onClose={handleShareClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                    >
                      <div className="p-3">
                        <FacebookShareButton url={fullPath}>
                          <FacebookIcon className="h-8 w-8 mr-3 rounded-lg" />
                        </FacebookShareButton>
                        <WhatsappShareButton url={fullPath}>
                          <WhatsappIcon className="h-8 w-8 mr-3 rounded-lg" />
                        </WhatsappShareButton>
                        <TelegramShareButton url={fullPath}>
                          <TelegramIcon className="h-8 w-8 mr-3 rounded-lg" />
                        </TelegramShareButton>
                        <TwitterShareButton url={fullPath}>
                          <TwitterIcon className="h-8 w-8 mr-3 rounded-lg" />
                        </TwitterShareButton>
                        <EmailShareButton url={fullPath}>
                          <EmailIcon className="h-8 w-8 mr-3 rounded-lg" />
                        </EmailShareButton>
                      </div>
                    </Popover>
                  </>
                )}
              </div>
              <div>
                <div className="hidden md:block">
                  <h1 className="text-4xl font-bold">{title}</h1>
                  <div className="flex py-4 border-b-2">
                    <div className="flex mr-6 items-center">
                      <img
                        src={"/assets/Ellips.png"}
                        className="h-8 w-8"
                        alt=""
                      />

                      <p className="ml-2 font-semibold">
                        Artist{" "}
                        <Link href={`/pages/${artist}`}>{influencerName}</Link>
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
                          Owner{" "}
                          <Link href={`/pages/${owner}`}>
                            {ownerDisplayName}
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
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
                      {userName === influencerId.toString() ? (
                        <>
                          {isMobileBrowser ? (
                            <RWebShare
                              data={{
                                text: "Ayoo site",
                                url: fullPath,
                                title: "Ayoo",
                              }}
                              onClick={() =>
                                console.log("shared successfully!")
                              }
                            >
                              <button className="border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold">
                                Share with your fans
                              </button>
                            </RWebShare>
                          ) : (
                            <>
                              <button
                                onClick={handleShareClick}
                                className=" border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                              >
                                Share with your fans
                              </button>
                              <Popover
                                id={elId}
                                open={shareOpen}
                                anchorEl={anchorEl}
                                onClose={handleShareClose}
                                anchorOrigin={{
                                  vertical: "bottom",
                                  horizontal: "left",
                                }}
                              >
                                <div className="p-3">
                                  <FacebookShareButton url={fullPath}>
                                    <FacebookIcon className="h-8 w-8 mr-3 rounded-lg" />
                                  </FacebookShareButton>
                                  <WhatsappShareButton url={fullPath}>
                                    <WhatsappIcon className="h-8 w-8 mr-3 rounded-lg" />
                                  </WhatsappShareButton>
                                  <TelegramShareButton url={fullPath}>
                                    <TelegramIcon className="h-8 w-8 mr-3 rounded-lg" />
                                  </TelegramShareButton>
                                  <TwitterShareButton url={fullPath}>
                                    <TwitterIcon className="h-8 w-8 mr-3 rounded-lg" />
                                  </TwitterShareButton>
                                  <EmailShareButton url={fullPath}>
                                    <EmailIcon className="h-8 w-8 mr-3 rounded-lg" />
                                  </EmailShareButton>
                                </div>
                              </Popover>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {notEnoughUsdc || notEnoughSol ? (
                            <>
                              <button
                                disabled
                                className=" border-none flex justify-center text-white bg-[#b7b4f3]  px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                              >
                                <span className="flex">
                                  Buy now {price / 1_000_000}{" "}
                                  <img
                                    src="/assets/usdc.webp"
                                    className="h-4 w-4 mt-1 ml-1 opacity-60"
                                  />
                                </span>
                              </button>
                              <p className="text-sm my-4 text text-center font-semibold justify-center flex">
                                Please fund your wallet to be able to mint the
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
                              onClick={handleMint}
                              className=" border-none flex justify-center text-white bg-[#635BFF] hover:bg-[#8983fa]  px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                            >
                              <span className="flex">
                                Buy now ${price / 1_000_000}{" "}
                                <img
                                  src="/assets/usdc.webp"
                                  className="h-4 w-4 mt-1 ml-1"
                                />
                              </span>
                            </button>
                          )}
                        </>
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
                            className="border-none flex justify-center text-white bg-[#b7b4f3]  px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                            // onClick={handleBuy}
                          >
                            <span className="flex">
                              Buy now ${price / 1_000_000}{" "}
                              <img
                                src="/assets/usdc.webp"
                                className="h-4 w-4 mt-1 ml-1 opacity-80"
                              />
                            </span>
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
                          className="mt-1 border-none flex justify-center text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                          onClick={handleBuy}
                        >
                          <span className="flex">
                            Buy now ${price / 1_000_000}{" "}
                            <img
                              src="/assets/usdc.webp"
                              className="h-4 w-4 mt-1 ml-1"
                            />
                          </span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="md:hidden">
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
                        {mintAddr ? (
                          <a
                            href={`https://explorer.solana.com/address/${mintAddr}/metadata?cluster=devnet`}
                          >
                            {truncate(mintAddr)}
                          </a>
                        ) : (
                          "Be the first to mint it!"
                        )}
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
                            <p className="">
                              {transaction.from} listed the token for{" "}
                              {transaction.price}
                              <img
                                src="/assets/usdc.webp"
                                className="w-4 h-4 ml-1 inline-block"
                              />
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {dateFormat(
                                transaction.timestamp.toDate(),
                                "dddd, mmmm dS, yyyy, h:MM:ss TT"
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                      {transaction.type === "buy" && (
                        <div className="flex items-center mb-3" key={i}>
                          <div className="mr-4">
                            <img src="/assets/ellips.png" />
                          </div>
                          <div className=" text-md">
                            {transaction.to} boughts the token
                            {/*  for{" "}
                            {transaction.price}
                            usdc */}
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
              {hashtags.length !== 0 && (
                <div className="mt-6">
                  <h1 className="font-bold text-xl">Hashtags</h1>
                  <div className="flex mt-4">
                    {hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="py-0 px-3 rounded-full border-1 border-black border hover:bg-black hover:text-white cursor-pointer mr-2"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="my-5 ">
            <h1 className=" font-bold mb-6 text-2xl">How AYOO works</h1>
            <div className="grid gap-4 grid-rows-3 md:grid-rows-1 md:grid-cols-3">
              <div className="flex md:block">
                <div className="border-2 mt-3 md:mt-0 mr-4 md:mr-0 w-9 h-9 flex items-center justify-center border-black rounded-full">
                  <span className="font-bold text-lg">1</span>
                </div>
                <div className="flex-1">
                  <h1 className="font-bold mt-2 mb-3">
                    Support your favourite content creators with their NFT!
                  </h1>
                  <p>
                    Cheer on creators as they build communities around their
                    work. The best part? No crypto wallets necessary
                  </p>
                </div>
              </div>
              <div className="flex md:block">
                <div className="border-2 mt-3 md:mt-0 mr-4 md:mr-0 w-9 h-9 flex items-center justify-center border-black rounded-full">
                  <span className="font-bold text-lg">2</span>
                </div>
                <div className="flex-1">
                  <h1 className="font-bold mt-2 mb-3">Unlock VIP benefits</h1>
                  <p>
                    Create meaningful connections with content creators and
                    like-minded fans
                  </p>
                </div>
              </div>
              <div className="flex md:block">
                <div className="border-2 mt-3 md:mt-0 mr-4 md:mr-0 w-9 h-9 flex items-center justify-center border-black rounded-full">
                  <span className="font-bold text-lg">3</span>
                </div>
                <div className="flex-1">
                  <h1 className="font-bold mt-2 mb-3">
                    Buy and sell music NFTs effortlessly
                  </h1>
                  <p>Trade and earn profit on creator’s NFT</p>
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
            <div className="absolute top-1/2 h-80 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-white drop-shadow-xl rounded-3xl p-4">
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
                  {isMobileBrowser ? (
                    <RWebShare
                      data={{
                        text: "Web Share - Ayoo",
                        url: fullPath,
                        title: "Ayoo",
                      }}
                      onClick={() => console.log("shared successfully!")}
                    >
                      <button className="py-2 mt-2 rounded-full font-semibold text-[#635BFF] border-2 border-[#635BFF] hover:bg-[#635BFF] hover:text-white">
                        Share your NFT
                      </button>
                    </RWebShare>
                  ) : (
                    <>
                      <button
                        onClick={handleShareClick}
                        className="py-2 mt-2 rounded-full font-semibold text-[#635BFF] border-2 border-[#635BFF] hover:bg-[#635BFF] hover:text-white"
                      >
                        Share your NFT
                      </button>
                      <Popover
                        id={elId}
                        open={shareOpen}
                        anchorEl={anchorEl}
                        onClose={handleShareClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                      >
                        <div className="p-3">
                          <FacebookShareButton url={fullPath}>
                            <FacebookIcon className="h-8 w-8 mr-3 rounded-lg" />
                          </FacebookShareButton>
                          <WhatsappShareButton url={fullPath}>
                            <WhatsappIcon className="h-8 w-8 mr-3 rounded-lg" />
                          </WhatsappShareButton>
                          <TelegramShareButton url={fullPath}>
                            <TelegramIcon className="h-8 w-8 mr-3 rounded-lg" />
                          </TelegramShareButton>
                          <TwitterShareButton url={fullPath}>
                            <TwitterIcon className="h-8 w-8 mr-3 rounded-lg" />
                          </TwitterShareButton>
                          <EmailShareButton url={fullPath}>
                            <EmailIcon className="h-8 w-8 mr-3 rounded-lg" />
                          </EmailShareButton>
                        </div>
                      </Popover>
                    </>
                  )}
                </div>

                <div className="grid grid-rows-3 gap-2"></div>
              </div>
            </div>
          </Modal>
          <div className="mt-8">
            <h1 className="font-bold text-xl">More from {influencerName}</h1>
          </div>
          <div className="grid mt-8 md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6">
            {relatedItems.map((nft, i) => (
              <NFTPostItem
                key={i}
                id={nft.id}
                type={nft.mediaType}
                lastSalePrice={nft.lastSalePrice || null}
                baseLink={`/pages/${influencerId}`}
                video={nft.videoUrl}
                title={nft.title}
                price={nft.price}
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

import { Container, Modal, Popover } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import NFTGridItem from "../../../components/NFTGridItem";
import NFTPostItem from "../../../components/NFTPostItem";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "@firebase/firestore";
import { Web3Auth } from "@web3auth/web3auth";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { db } from "../../../firebase-config";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
  WALLET_ADAPTERS,
} from "@web3auth/base";
import { useWeb3Auth } from "../../../services/web3auth";
import LoginSection from "../../../components/loginSection";
import Loader from "../../../components/loader";
import { truncate } from "../../../utils/string";
import Header from "../../../components/Header";
import Link from "next/link";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
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
const Profile = () => {
  const router = useRouter();
  const { influencerId } = router.query;
  const { created } = router.query;
  console.log("the slug", router.query);
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
    signMessage,
    user,
    getUser,
    isConnected,
    isConnecting,
    signV4Message,
  } = useWeb3Auth();

  const { connection } = useConnection();
  const [username, setUsername] = useState<string>("");
  const [myUsername, setMyUsername] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [myFollowingCount, setMyFollowingCount] = useState<number>(0);
  const [collectibles, setCollectibles] = useState([]);
  const [collected, setCollected] = useState([]);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [isInfluencer, setIsInfluencer] = useState<boolean>(false);
  const [isPageOwner, setIsPageOwner] = useState<boolean>(false);
  const [path, setPath] = useState<string>("");
  const [showCollected, setShowCollected] = useState<boolean>(false);
  const [follows, setFollows] = useState([]);
  const [hasFollowed, setHasFollowed] = useState<boolean>(false);
  const [createdNft, setCreatedNft] = useState<string>("");
  const [createdNftMediaUrl, setCreatedNftMediaUrl] = useState<string>("");
  const [createdNftMediaType, setCreatedNftMediaType] = useState<string>("");
  const [isMobileBrowser, setIsMobileBrowser] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [fullPath, setFullPath] = useState<string>("");
  const [createdNftPath, setCreatedNftPath] = useState<string>("");

  const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setAnchorEl(null);
  };
  const shareOpen = Boolean(anchorEl);
  const elId = shareOpen ? "simple-popover" : undefined;
  console.log(influencerId);
  useEffect(() => {
    const init = async () => {
      // if (!isConnected && !isConnecting) router.push("/login");
      if (influencerId && provider) {
        try {
          setIsMobileBrowser(isMobile());
          setFullPath(`${window.location.origin}${router.asPath}`);

          setPath(`/pages/${influencerId}`);
          console.log("the pubki: ", connection);
          const influencerUsername = influencerId.toString();
          console.log(influencerUsername);
          const usersRef = collection(db, "users");
          const userRef = doc(usersRef, influencerUsername);

          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const user = await getUser();
            const myUName = user.email.split("@", 1)[0].replace(".", "");
            console.log("my uuname: ", myUName);
            setMyUsername(myUName);
            const collectiblesRef = collection(
              usersRef,
              influencerUsername,
              "collectibles"
            );
            const collectiblesSnap = await getDocs(collectiblesRef);
            const collectiblesData = collectiblesSnap.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));
            console.log(collectiblesData);
            setCollectibles(collectiblesData);

            const collectedRef = collection(
              usersRef,
              influencerUsername,
              "collected"
            );
            const collectedSnap = await getDocs(collectedRef);
            const collectedData = collectedSnap.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));
            console.log(collectedData);
            setCollected(collectedData);

            const userData = userSnap.data();
            console.log(userData);
            setUsername(influencerUsername);
            setDescription(userData.bioDescription);
            if (userData.followers) setFollowersCount(userData.followers);

            if (userData.followings) setFollowingCount(userData.followings);
            setAvatarUrl(userData.avatarUrl);
            setWalletAddress(userData.wallet);

            setFullName(userData.name);
            const userEmail = await getUser();
            setIsInfluencer(userEmail.email === userData.email);

            console.log("my username: ", myUsername);
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

  useEffect(() => {
    const init = async () => {
      if (influencerId && provider && created) {
        setCreatedNftPath(
          `${window.location.origin}pages/${influencerId}/${created}`
        );
        console.log(`/pages/${influencerId}/${created}`);
        try {
          const collectibleRef = doc(
            db,
            "users",
            influencerId.toString(),
            "collectibles",
            created.toString()
          );
          const collectibleSnapshot = await getDoc(collectibleRef);
          console.log("data: ", collectibleSnapshot.data());
          // if (collectibleSnapshot.exists()) {
          setCreatedNftMediaType(collectibleSnapshot.data().mediaType);
          setCreatedNftMediaUrl(collectibleSnapshot.data().videoUrl);
          setCreatedNft(created.toString());
          setModalOpen(true);
          // }
        } catch (error) {
          console.log(error);
        }
      }
    };
    init();
  }, [created, influencerId, provider]);
  useEffect(() => {
    if (influencerId && provider && myUsername) {
      console.log("my username: ", myUsername);
      onSnapshot(collection(db, "users", myUsername, "follows"), (snapshot) => {
        setFollows(snapshot.docs);
        console.log("snap:", snapshot.docs);
      });
    }
  }, [influencerId, db, myUsername, provider]);

  useEffect(() => {
    if (influencerId && provider) {
      console.log("new new new new ");
      onSnapshot(doc(db, "users", influencerId.toString()), (snapshot) => {
        // if (snapshot.data().followers)
        setFollowersCount(snapshot.data().followers);
        // if (snapshot.data().followings)
        setFollowingCount(snapshot.data().followings);
      });
    }
  }, [follows, influencerId]);

  useEffect(
    () =>
      setHasFollowed(
        follows.findIndex((follow) => follow.id === influencerId.toString()) !==
          -1
      ),
    [follows]
  );

  const followInfluencer = async () => {
    try {
      const followsRef = doc(
        db,
        "users",
        myUsername,
        "follows",
        influencerId.toString()
      );
      const userRef = doc(db, "users", myUsername);
      const influencerRef = doc(db, "users", influencerId.toString());
      const userSnap = await getDoc(userRef);
      const myFollowings = userSnap.data().followings;
      if (hasFollowed) {
        console.log({
          curFol: followersCount,
          curFolwngs: myFollowings,
          followers: followersCount - 1,
          followings: myFollowings - 1,
        });
        await updateDoc(influencerRef, {
          followers: followersCount - 1,
        });
        setFollowersCount(followersCount - 1);

        await updateDoc(userRef, {
          followings: myFollowings - 1,
        });

        await deleteDoc(followsRef);
      } else {
        console.log({
          curFol: followersCount,
          curFolwngs: myFollowings,
          followers: followersCount + 1,
          followings: myFollowings + 1,
        });
        await updateDoc(influencerRef, {
          followers: followersCount + 1,
        });

        await updateDoc(userRef, {
          followings: myFollowings + 1,
        });

        await setDoc(followsRef, {
          username: influencerId.toString(),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {!isConnecting && provider ? (
        <>
          <Container>
            <Header />
            <div className="md:flex mx-auto mt-32">
              <div className="w-full md:w-1/4 justify-center mr-0 md:mr-10 md:pr-16 pr-0 md:border-r md:border-gray-100">
                <div className="flex flex-col mb-8">
                  <div className="flex justify-center">
                    {/* <img
                      src={avatarUrl}
                      // width={96}
                      // height={96}
                      className="h-24 w-24 rounded-full mx-auto"
                    /> */}
                    <Image
                      src={avatarUrl}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-full mx-auto"
                    />
                  </div>
                  <div className=" text-center mt-4 ">
                    <p className="font-bold text-lg mb-2 capitalize">
                      {username}
                    </p>
                  </div>
                  <div className="text-center mb-2">
                    {/* <p className="text-sm text-gray-600">@{username}</p> */}
                    <p className="text-xs text-gray-400">
                      {truncate(walletAddress, 16)}
                    </p>
                    <p className="">{description}</p>
                  </div>
                  <div className="flex justify-between text-center">
                    <div>
                      <p className="font-bold">{followersCount}</p>
                      <p>Followers</p>
                    </div>

                    <div>
                      <p className="font-bold">{followingCount}</p>
                      <p>Following</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    {isInfluencer ? (
                      <Link href="/dashboard/profile">
                        <button className="text-center text-gray-500 px-6 border border-1 border-gray-500 rounded-md w-full hover:bg-[#635BFF] hover:text-white">
                          Edit Profile
                        </button>
                      </Link>
                    ) : (
                      <div className="flex gap-2">
                        {hasFollowed ? (
                          <button
                            onClick={followInfluencer}
                            className="text-center  px-6 border border-1 border-gray-500 rounded-md w-full bg-[#635BFF] text-white"
                          >
                            Unfollow
                          </button>
                        ) : (
                          <button
                            onClick={followInfluencer}
                            className="text-center text-gray-500 px-6 border border-1 border-gray-500 rounded-md w-full hover:bg-[#635BFF] hover:text-white"
                          >
                            Follow
                          </button>
                        )}
                        {isMobileBrowser ? (
                          <RWebShare
                            data={{
                              text: "Ayoo site",
                              url: fullPath,
                              title: "Ayoo",
                            }}
                            onClick={() => console.log("shared successfully!")}
                          >
                            <button className="text-center text-gray-500 px-6 border border-1 border-gray-500 rounded-md w-full hover:bg-[#635BFF] hover:text-white">
                              Share on Web
                            </button>
                          </RWebShare>
                        ) : (
                          <>
                            <button
                              onClick={handleShareClick}
                              className="text-center text-gray-500 px-6 border border-1 border-gray-500 rounded-md w-full hover:bg-[#635BFF] hover:text-white"
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
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full md:w-3/4 md:mb-6 md:ml-6">
                <div className=" mb-6">
                  <div className="flex justify-center">
                    <div className="flex">
                      <p className="px-4 py-2 font-bold border-b border-black">
                        Created
                      </p>
                      <Link href={`${path}/collected`}>
                        <p className="px-4 py-2 cursor-pointer">Collected</p>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
                  {isInfluencer && (
                    <Link href="/dashboard/create">
                      <div className=" rounded-xl overflow-hidden min-h-72 hover:border-[#635BFF] py-10 text-gray-600 drop-shadow-md cursor-pointer hover:scale-105 ease-in-out duration-300 h-full flex items-center justify-center bg-gray-200 border-2 border-gray-200">
                        <div className="flex flex-col justify-center items-center">
                          <PlusCircleIcon className="h-20 w-20" />
                          <p className="text-2xl font-bold">Create an NFT</p>
                        </div>
                      </div>
                    </Link>
                  )}
                  {collectibles.map((nft, i) => (
                    <NFTPostItem
                      key={i}
                      id={nft.id}
                      type={nft.mediaType}
                      lastSalePrice={nft.lastSalePrice || null}
                      baseLink={path}
                      video={nft.videoUrl}
                      title={nft.title}
                      price={nft.price}
                      description={nft.description}
                      provider={provider}
                    />
                  ))}
                </div>
              </div>
            </div>
            <Modal
              open={modalOpen}
              onClose={handleModalClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <div className="absolute top-1/2 h-80 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-white drop-shadow-xl rounded-3xl p-4">
                <div className="relative -top-12 px-8">
                  <div className="flex justify-center ">
                    {createdNftMediaType === "video/mp4" ? (
                      <div className="flex justify-center relative -top-6">
                        <video
                          width="128"
                          height="128"
                          className="h-32 w-32 rounded-xl justify-centers"
                        >
                          <source src={createdNftMediaUrl} type="video/mp4" />
                          sample
                        </video>
                      </div>
                    ) : (
                      <img
                        className="h-32 w-32 rounded-xl justify-centers"
                        src={createdNftMediaUrl}
                      />
                    )}
                  </div>

                  <div className="mt-4">
                    <h1 className="capitalize text-3xl font-bold text-center">
                      congratulations!
                    </h1>
                    <p className="text-center  mt-2">You created an NFT.</p>
                  </div>
                  <div className="grid grid-rows-1 mb-6 mt-2">
                    <Link href={`/pages/${influencerId}/${createdNft}`}>
                      <p className=" border-none text-white bg-[#635BFF] hover:bg-[#8983fa] cursor-pointer px-3 w-full pb-3 pt-3 rounded-full font-semibold text-center">
                        View NFT
                      </p>
                    </Link>
                    {isMobileBrowser ? (
                      <RWebShare
                        data={{
                          text: "Ayoo site",
                          url: createdNftPath,
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
                            <FacebookShareButton url={createdNftPath}>
                              <FacebookIcon className="h-8 w-8 mr-3 rounded-lg" />
                            </FacebookShareButton>
                            <WhatsappShareButton url={createdNftPath}>
                              <WhatsappIcon className="h-8 w-8 mr-3 rounded-lg" />
                            </WhatsappShareButton>
                            <TelegramShareButton url={createdNftPath}>
                              <TelegramIcon className="h-8 w-8 mr-3 rounded-lg" />
                            </TelegramShareButton>
                            <TwitterShareButton url={createdNftPath}>
                              <TwitterIcon className="h-8 w-8 mr-3 rounded-lg" />
                            </TwitterShareButton>
                            <EmailShareButton url={createdNftPath}>
                              <EmailIcon className="h-8 w-8 mr-3 rounded-lg" />
                            </EmailShareButton>
                          </div>
                        </Popover>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Modal>
          </Container>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};
export default Profile;

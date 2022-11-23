import { Container } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import NFTGridItem from "../../../components/NFTGridItem";
import NFTPostItem from "../../../components/NFTPostItem";
import { collection, doc, getDoc, getDocs } from "@firebase/firestore";
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

const Profile = () => {
  const router = useRouter();
  const { influencerId } = router.query;
  console.log("the slug", influencerId);
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
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [collectibles, setCollectibles] = useState([]);
  const [collected, setCollected] = useState([]);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [isInfluencer, setIsInfluencer] = useState<boolean>(false);
  const [isPageOwner, setIsPageOwner] = useState<boolean>(false);
  const [path, setPath] = useState<string>("");
  const [showCollected, setShowCollected] = useState<boolean>(false);

  console.log(influencerId);
  useEffect(() => {
    const init = async () => {
      // if (!isConnected && !isConnecting) router.push("/login");
      if (influencerId && provider) {
        try {
          setPath(router.asPath);
          console.log("the pubki: ", connection);
          const influencerUsername = influencerId.toString();
          console.log(influencerUsername);
          const usersRef = collection(db, "users");
          const userRef = doc(usersRef, influencerUsername);

          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
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
            if (userData.followerCount)
              setFollowersCount(userData.followerCount);

            if (userData.followingCount)
              setFollowingCount(userData.followingCount);
            setAvatarUrl(userData.avatarUrl);
            setWalletAddress(userData.wallet);
            setFullName(userData.name);
            const userEmail = await getUser();
            setIsInfluencer(userEmail.email === userData.email);
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

  return (
    <>
      {!isConnecting && provider ? (
        <Container>
          <Header />
          <div className="md:flex mx-auto mt-20">
            <div className="w-full md:w-1/4 justify-center mr-0 md:mr-10 md:pr-16 pr-0 md:border-r md:border-gray-100">
              <div className="flex flex-col mb-8">
                <div>
                  <img
                    src={avatarUrl}
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
                      <button className="text-center text-gray-500 px-6 border border-1 border-gray-500 rounded-md w-full hover:bg-[#635BFF] hover:text-white">
                        Follow
                      </button>
                      <button className="text-center text-gray-500 px-6 border border-1 border-gray-500 rounded-md w-full hover:bg-[#635BFF] hover:text-white">
                        Share
                      </button>
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
                    price={+nft.price}
                    description={nft.description}
                    provider={provider}
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      ) : (
        <Loader />
      )}
    </>
  );
};
export default Profile;

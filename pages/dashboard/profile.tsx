import { Container } from "@mui/material";
import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import { Web3Auth } from "@web3auth/web3auth";
import {
  WALLET_ADAPTERS,
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
} from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import NFTGridItem from "../../components/NFTGridItem";
import {
  addDoc,
  collection,
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "@firebase/firestore";
import { db, storage } from "../../firebase-config";
import { ref, uploadBytes, getDownloadURL } from "@firebase/storage";
import { v4 } from "uuid";
import { useWeb3Auth } from "../../services/web3auth";
import LoginSection from "../../components/loginSection";
import Loader from "../../components/loader";
import Link from "next/link";
import { truncate } from "../../utils/string";

const clientId =
  "BOjke_VdSeEjE5Gap8t4hfg_1QRymSFuTYxklhGttI-6H-ZJARwiLQunE9PYrl9xyxwNerQQT6u01uDP744_mM8";
interface UserData {
  aggregateVerifier: string;
  dappShare: string;
  email: string;
  idToken: string;
  name: string;
  oAuthAccessToken: string;
  oAuthIdToken: string;
  profileImage: string;
  typeOfLogin: string;
  verifier: string;
  verifierId: string;
}
const SetNftDetails = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isInfluencer, setIsInfluencer] = useState<boolean>(false);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [bioDescription, setBioDescription] = useState<string>("");
  const [myUserName, setMyUserName] = useState<string>("");
  const [myAddress, setMyAddress] = useState<string>("");
  // const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
  // null
  // );
  const {
    provider,
    login,
    // showWalletConnectScanner,
    showDapp,
    showTopup,
    // user,
    logout,
    getUserInfo,
    getAccounts,
    getUser,
    getBalance,
    isConnecting,
    getWallets,
    signMessage,
    signV4Message,
  } = useWeb3Auth();

  useEffect(() => {
    const init = async () => {
      if (provider) {
        const user = await getUser();
        const username = user.email.split("@", 1)[0];
        setMyUserName(username);
        const userRef = doc(db, "users", username);
        const address = await getWallets();
        console.log("add: ", address);
        setMyAddress(address[0]);
        const userResponse = await getDoc(userRef);
        const userData = userResponse.data();
        setFullName(userData.name);
        setAvatarUrl(userData.avatarUrl);
        setEmail(userData.email);
        setIsInfluencer(userData.isInfluencer);
        if (userData.isInfluencer) {
          setFollowerCount(userData.followerCount);
          setFollowingCount(userData.followingCount);
          setLikesCount(userData.likesCount);
          setBioDescription(userData.bioDescription);
        }
      }
    };
    init();
  }, [provider]);

  const updateUser = async () => {
    try {
      setLoading(true);
      const user = await getUser();
      const username = user.email.split("@", 1)[0];
      const userRef = doc(db, "users", username);
      if (isInfluencer) {
        await updateDoc(userRef, {
          name: fullName,
          email,
          followerCount,
          followingCount,
          isInfluencer: true,
          likesCount,
          bioDescription,
        });
      } else {
        await updateDoc(userRef, {
          name: fullName,
          email,
          isInfluencer: false,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {!isConnecting ? (
        provider ? (
          <Container>
            <div className="flex w-1/2 mx-auto flex-col mt-40 mb-5">
              <div className=" justify-center">
                {/* <p className="uppercase font-semibold text-md text-center">
                sell an nft
              </p> */}
                <h1 className="capitalize font-bold text-3xl text-center">
                  My Profile
                </h1>
              </div>

              <div className="mt-4 mb-6">
                <img className="mx-auto" src={avatarUrl} />
              </div>
              <div>
                <p className="text-lg text-gray-700 text-center">
                  @
                  <Link href={`http://localhost:3000/pages/${myUserName}`}>
                    {myUserName}
                  </Link>
                </p>
                <p className="text-xs text-gray-400 text-center mt-2">
                  {truncate(myAddress)}
                </p>
              </div>
              <div>
                {loading && (
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
                {/* <form> */}
                <div className="flex flex-col mt-4">
                  <div className="mb-4">
                    <label>
                      <p className="mb-2">
                        <span className="uppercase font-bold">full name</span>
                      </p>
                    </label>
                    <input
                      className="w-full rounded-full pl-5 py-2 bg-gray-100"
                      type="text"
                      placeholder="your Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label>
                      <p className="mb-2">
                        <span className="uppercase font-bold">email</span>
                      </p>
                    </label>
                    <input
                      className="w-full rounded-full pl-5 py-2 bg-gray-100"
                      type="email"
                      placeholder="your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {isInfluencer && (
                    <>
                      <div className="mb-4">
                        <label>
                          <p className="mb-2">
                            <span className="uppercase font-bold">
                              bio description
                            </span>
                          </p>
                        </label>
                        <input
                          className="w-full rounded-full pl-5 py-2 bg-gray-100"
                          type="text"
                          placeholder="your bio description"
                          value={bioDescription}
                          onChange={(e) => setBioDescription(e.target.value)}
                        />
                      </div>

                      <div className="mb-4">
                        <label>
                          <p className="mb-2">
                            <span className="uppercase font-bold">
                              follower Count
                            </span>
                          </p>
                        </label>
                        <input
                          className="w-full rounded-full pl-5 py-2 bg-gray-100"
                          type="text"
                          placeholder="your follower count"
                          value={followerCount}
                          onChange={(e) => setFollowerCount(+e.target.value)}
                        />
                      </div>

                      <div className="mb-4">
                        <label>
                          <p className="mb-2">
                            <span className="uppercase font-bold">
                              following Count
                            </span>
                          </p>
                        </label>
                        <input
                          className="w-full rounded-full pl-5 py-2 bg-gray-100"
                          type="text"
                          placeholder="your following count"
                          value={followingCount}
                          onChange={(e) => setFollowingCount(+e.target.value)}
                        />
                      </div>

                      <div className="mb-4">
                        <label>
                          <p className="mb-2">
                            <span className="uppercase font-bold">
                              likes Count
                            </span>
                          </p>
                        </label>
                        <input
                          className="w-full rounded-full pl-5 py-2 bg-gray-100"
                          type="text"
                          placeholder="your likes count"
                          value={likesCount}
                          onChange={(e) => setLikesCount(+e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {isInfluencer ? (
                    <button
                      onClick={() => setIsInfluencer(false)}
                      className="mt-1 border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                    >
                      I am a user
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsInfluencer(true)}
                      className="mt-1 border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                    >
                      I am an influencer
                    </button>
                  )}
                  <button
                    onClick={updateUser}
                    className="mt-1 border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                  >
                    Update
                  </button>
                </div>
                <div className="mt-4">
                  <button
                    onClick={showTopup}
                    className="mt-1 border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                  >
                    buy crypto
                  </button>
                </div>
                {/* </form> */}
              </div>
            </div>
          </Container>
        ) : (
          <LoginSection login={login} />
        )
      ) : (
        <Loader />
      )}
    </>
  );
};
export default SetNftDetails;

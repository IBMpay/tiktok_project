import { Container, Snackbar } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import Button from "../../components/Button";
import { Web3Auth } from "@web3auth/web3auth";
import {
  WALLET_ADAPTERS,
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
} from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import NFTGridItem from "../../components/NFTGridItem";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
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
import { ArrowLeftIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import Header from "../../components/Header";
import { useRouter } from "next/router";
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
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
const Profile = () => {
  const fileRef = useRef(null);
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
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [avatarUploaded, setAvatarUploaded] = useState<boolean>(false);
  const [snackbarMode, setSnackbarMode] = useState<AlertColor>("warning");
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  // const [loadedAvatar, setLoadedAvatar] = useState
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
    isConnected,
    signMessage,
    web3Auth,
    signV4Message,
  } = useWeb3Auth();
  const router = useRouter();
  useEffect(() => {
    const init = async () => {
      console.log("provider", web3Auth);

      if (provider) {
        try {
          const user = await getUser();
          const username = user.email.split("@", 1)[0].replace(".", "");
          setMyUserName(username);
          const userRef = doc(db, "users", username);
          const address = await getWallets();
          console.log("add: ", address);
          setMyAddress(address[0]);
          console.log(username);
          const userResponse = await getDoc(userRef);
          if (userResponse.exists()) {
            console.log("exists");
            const userData = userResponse.data();
            setFullName(userData.name);
            setAvatarUrl(userData.avatarUrl);
            setBioDescription(userData.bioDescription);
            setEmail(userData.email);
            // setIsInfluencer(userData.isInfluencer);
            // if (userData.isInfluencer) {
            //   setFollowerCount(userData.followerCount);
            //   setFollowingCount(userData.followingCount);
            //   setLikesCount(userData.likesCount);
            // }
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    init();
  }, [provider]);
  // useEffect(() => {
  //   const init = async () => {
  //     if (!isConnected && !isConnecting) router.push("/login");
  //   };
  //   init();
  // }, [provider, isConnected, isConnecting]);
  const updateUser = async () => {
    try {
      setLoading(true);
      const user = await getUser();
      const username = user.email.split("@", 1)[0].replace(".", "");
      const userRef = doc(db, "users", username);
      // if (isInfluencer) {
      await updateDoc(userRef, {
        name: fullName,
        email,
        avatarUrl,
        bioDescription,
      });
      setSnackbarMode("success");
      setSnackbarMessage("Your profile has been updated!");
      setOpen(true);
      // } else {
      //   await updateDoc(userRef, {
      //     name: fullName,
      //     email,
      //     isInfluencer: false,
      //   });
      // }
    } catch (error) {
      console.log(error);
      setSnackbarMessage("Something went wrong!");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };
  const handleFileUpload = async (e) => {
    try {
      console.log(e.target.files);
      const mediaFile = e.target.files[0];
      setUploadLoading(true);
      console.log("loading", uploadLoading);
      const mediaRef = ref(storage, `avatars/${mediaFile.name + v4()}`);
      const result = await uploadBytes(mediaRef, mediaFile);
      const url = await getDownloadURL(mediaRef);

      setAvatarUrl(url);
    } catch (error) {
      console.log(error);
    } finally {
      setUploadLoading(false);
      setAvatarUploaded(true);
    }
  };
  let inputRef;
  return (
    <>
      {!isConnecting && provider ? (
        <Container>
          <Header />
          <div className="flex lg:w-1/2 md:w-2/3 mx-auto flex-col mb-5 mt-24">
            <div className="mb-10">
              <Link href="/dashboard">
                <div className=" cursor-pointer p-3 hover:bg-gray-50 inline-block rounded-lg">
                  <ArrowLeftIcon className="h-6 w-6" />
                </div>
              </Link>
            </div>
            <div className=" justify-center">
              <p className="uppercase font-semibold text-md text-center">
                user profile
              </p>
              <h1 className="capitalize font-bold text-3xl text-center">
                Add Profile Details
              </h1>
            </div>

            <div className="mt-4 mb-6">
              <div
                className="h-72 w-72 bg-gray-100 mx-auto rounded-full flex items-center justify-center"
                style={{
                  backgroundImage: avatarUrl ? `url(${avatarUrl})` : "",
                  backgroundSize: "100%",
                }}
              >
                <div className="flex items-center justify-center bg-gray-100/80 rounded-full w-64 mx-auto h-64 my-10">
                  {uploadLoading ? (
                    <div>
                      <div className="lds-ellipsis colored">
                        <div className="bg-red-500"></div>
                        <div className="bg-red-500"></div>
                        <div className="bg-red-500"></div>
                        <div className="bg-red-500"></div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col w-full h-full justify-center"
                      onClick={() => inputRef.click()}
                    >
                      <p className="text-center">
                        Drag and Drop <br /> or
                      </p>
                      <div className="flex justify-center">
                        <button className="flex text-lg font-semibold bg-white mt-3 hover:bg-[#635BFF] transition-none hover:text-white rounded-md px-6 py-2">
                          <CloudArrowUpIcon className="h-5 w-5 mt-1 mr-2 transition-none" />
                          <span>upload</span>
                        </button>
                      </div>
                      <input
                        type="file"
                        onChangeCapture={handleFileUpload}
                        hidden={true}
                        ref={(refParam) => (inputRef = refParam)}
                      />
                      {avatarUploaded && (
                        <p className="text-center text-sm mt-4 text-green-700">
                          Your nft media has <br />
                          been uploaded!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <h1 className="text-center uppercase font-bold">profile image</h1>
            {/* <div>
                <p className="text-lg text-gray-700 text-center">
                  @
                  <Link href={`http://localhost:3000/pages/${myUserName}`}>
                    {myUserName}
                  </Link>
                </p>
                <p className="text-xs text-gray-400 text-center mt-2">
                  {myAddress}
                </p>
              </div> */}
            <div>
              {/* <form> */}
              <div className="flex flex-col mt-4">
                <div className="mb-4">
                  <label>
                    <p className="mb-2">
                      <span className="uppercase font-bold">display name</span>
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
                      <span className="uppercase font-bold">
                        bio description
                      </span>
                    </p>
                  </label>
                  <textarea
                    className="w-full rounded-xl pl-5 py-2 bg-gray-100"
                    placeholder="your bio description"
                    value={bioDescription}
                    onChange={(e) => setBioDescription(e.target.value)}
                  ></textarea>
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
                {/* {isInfluencer && (
                    <>
                      

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
                  )} */}

                {/* {isInfluencer ? (
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
                  )} */}
                <button
                  onClick={updateUser}
                  className="mt-1 border-none flex justify-center text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                >
                  {loading && (
                    <div className="pt-1 pr-2">
                      <div className="spinner-container">
                        <div className="loading-spinner"></div>
                      </div>
                    </div>
                  )}
                  Update
                </button>
              </div>
              <div className="mt-3">
                <Link href="/dashboard/create">
                  <button className="mt-3  text-[#635BFF] border-2 border-[#635BFF] hover:bg-[#635BFF] hover:text-white px-3 w-full pb-3 pt-3 rounded-full font-semibold">
                    I will do it later
                  </button>
                </Link>
              </div>
              {/* <div className="mt-4">
                  <button
                    onClick={showTopup}
                    className="mt-1 border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                  >
                    buy crypto
                  </button>
                </div> */}
              {/* </form> */}
            </div>
          </div>
          <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            <Alert
              onClose={handleClose}
              severity={snackbarMode}
              sx={{ width: "100%" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      ) : (
        <Loader />
      )}
    </>
  );
};
export default Profile;

import { Container, Modal, Snackbar } from "@mui/material";
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
import { addDoc, collection, setDoc, doc } from "@firebase/firestore";
import { db, storage } from "../../firebase-config";
import { ref, uploadBytes, getDownloadURL } from "@firebase/storage";
import { v4 } from "uuid";
import { useWeb3Auth } from "../../services/web3auth";
import LoginSection from "../../components/loginSection";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import Loader from "../../components/loader";
import Link from "next/link";
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
const Create = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [royalties, setRoyalties] = useState<string>("10");
  const [postUrl, setPostUrl] = useState<string>("");
  const [mediaUpload, setMediaUpload] = useState(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [mediaUploaded, setMediaUploaded] = useState<boolean>(false);
  const [creator, setCreator] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [reviewMode, setReviewMode] = useState<boolean>(false);
  const [mediaType, setMediaType] = useState<string>("video/mp4");
  const [snackbarMode, setSnackbarMode] = useState<AlertColor>("warning");
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [myUserName, setMyUserName] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [hashtags, setHashtags] = useState<string>("");
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
    isConnected,
    signMessage,
    getWallets,
    signV4Message,
  } = useWeb3Auth();
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [userData, setuserData] = useState<UserData>({
    aggregateVerifier: "",
    dappShare: "",
    email: "",
    idToken: "",
    name: "",
    oAuthAccessToken: "",
    oAuthIdToken: "",
    profileImage: "",
    typeOfLogin: "",
    verifier: "",
    verifierId: "",
  });
  const router = useRouter();
  const [createdCollectibleId, setCreatedCollectibleId] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);
  const uploadMedia = async () => {
    console.log("the media upload", mediaUpload);
    if (mediaUpload === null) return;
    try {
      console.log("hel");
      setUploadLoading(true);
      console.log("loading", uploadLoading);
      const mediaRef = ref(storage, `media/${mediaUpload.name + v4()}`);
      const result = await uploadBytes(mediaRef, mediaUpload);
      const url = await getDownloadURL(mediaRef);

      setVideoUrl(url);
      setMediaUploaded(true);
    } catch (error) {
      console.log(error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    try {
      console.log(e.target.files);
      const mediaFile = e.target.files[0];
      setMediaType(mediaFile.type);
      setUploadLoading(true);
      console.log("loading", uploadLoading);
      const mediaRef = ref(storage, `media/${mediaFile.name + v4()}`);
      const result = await uploadBytes(mediaRef, mediaFile);
      const url = await getDownloadURL(mediaRef);

      setVideoUrl(url);
      setMediaUploaded(true);
    } catch (error) {
      console.log(error);
    } finally {
      setUploadLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      // if (!isConnected && !isConnecting) router.push("/login");
      if (provider) {
        const address = await getWallets();
        console.log("add: ", address);
        setCreator(address[0]);
        const user = await getUser();
        const username = user.email.split("@", 1)[0];
        setMyUserName(username);
      }
    };
    init();
  }, [provider]);

  const uploadNft = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await getUser();
      const username = user.email.split("@", 1)[0];
      console.log("something to upload", {
        media_url: videoUrl,
        media_type: mediaType,
        external_url: "http://ayoo.site",
        title: title,
        royalties: royalties,
        owner: creator,
        description: description,
      });
      setMyUserName(username);
      const response = await fetch("https://ayoo-arweave.herokuapp.com/", {
        method: "POST",
        body: JSON.stringify({
          media_url: videoUrl,
          media_type: mediaType,
          external_url: "http://ayoo.site",
          title: title,
          royalties: royalties,
          owner: creator,
          description: description,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        const data = await response.json();
        console.log("the vid: ", username);
        console.log(data);
        console.log("the data", data);
        const seed = Math.floor(100000 + Math.random() * 900000);
        console.log(seed);
        console.log("something to upload: ", {
          title,
          description,
          videoUrl,
          mediaType,
          metadataUrl: data.metadata,
          price,
          royalties,
          status: "offchain",
        });
        const hashtagsArray = hashtags.replace(/ +/g, "").split(",");
        // console.log(mediaUpload.type);
        console.log(hashtagsArray);
        await setDoc(
          doc(db, "users", username, "collectibles", seed.toString()),
          {
            title,
            description,
            videoUrl,
            mediaType,
            hashtags: hashtagsArray,
            metadataUrl: data.metadata,
            price,
            royalties,
            status: "offchain",
          }
        );
        setCreatedCollectibleId(seed.toString());
        setModalOpen(true);
        // setOpen(true);
      } else {
        setSnackbarMessage("Please try again!");
        setOpen(true);
      }
    } catch (error) {
      console.log(error);
      setSnackbarMessage("Please try again!");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };
  let inputRef;
  return (
    <>
      {!isConnecting && provider ? (
        <Container>
          <Header />
          <div className="flex lg:w-1/2 md:w-2/3 mx-auto flex-col mt-24 mb-5">
            <div className="mb-10">
              <Link href="/dashboard">
                <div className=" cursor-pointer p-3 hover:bg-gray-50 inline-block rounded-lg">
                  <ArrowLeftIcon className="h-6 w-6" />
                </div>
              </Link>
            </div>
            <div className=" justify-center">
              <p className="uppercase font-semibold text-md text-center">
                sell an nft
              </p>
              <h1 className="capitalize font-bold text-3xl text-center">
                {reviewMode ? "review nft details" : "set nft details"}
              </h1>
              {reviewMode && (
                <p className="mt-2 text-center  text-sm text-gray-700">
                  Double check these details - there&apos;s no free way to edit
                  or <br />
                  delete and NFT once it&apos;s uploaded on-chain
                </p>
              )}
            </div>
            {reviewMode ? (
              <div className="mt-4 mb-6 px-8">
                <div className=" w-full h-[32rem] rounded-2xl my-10 border border-black">
                  {mediaType === "video/mp4" ? (
                    <div className="flex justify-center relative -top-6">
                      <video width="320" height="620" controls>
                        <source src={videoUrl} type="video/mp4" />
                        sample
                      </video>
                    </div>
                  ) : (
                    <img className="w-full h-full" src={videoUrl} />
                  )}
                </div>
              </div>
            ) : (
              // <div className="mt-4 mb-6">
              //   <img className="mx-auto" src="/assets/Rectangle228.png" />
              // </div>
              <div className="mt-4 mb-6 px-8">
                <div className="flex items-center justify-center w-2/3 mx-auto h-[18rem] rounded-2xl mb-4 mt-10 border border-black">
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
                      className="flex flex-col justify-center w-full h-full"
                      onClick={() => inputRef.click()}
                    >
                      <p className="text-center">
                        Click Anywhere in the box <br /> or
                      </p>
                      <div className="flex justify-center">
                        <button className="flex text-lg font-semibold bg-gray-100 mt-3 hover:bg-[#635BFF] transition-none hover:text-white rounded-md px-6 py-2">
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
                      {videoUrl !== "" && (
                        <p className="text-center text-sm mt-4 text-green-700">
                          Your nft media has <br />
                          been uploaded!
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <h1 className="text-center uppercase font-bold">
                  your nft media
                </h1>
              </div>
            )}

            <div>
              {/* <form> */}
              <div className="flex flex-col">
                <div className="mb-6">
                  <label>
                    <p className="mb-1">
                      <span className="uppercase font-bold">title</span>
                      <span className="text-gray-400 font-semibold ml-2">
                        (optional)
                      </span>
                    </p>
                  </label>
                  {reviewMode ? (
                    <p>{title}</p>
                  ) : (
                    <input
                      type="text"
                      placeholder="Name your NFT"
                      className="w-full rounded-full pl-5 py-2 bg-gray-100"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  )}
                </div>
                <div className="mb-6">
                  <label>
                    <p className="mb-1">
                      <span className="uppercase font-bold">description</span>
                    </p>
                  </label>
                  {reviewMode ? (
                    <p>{description}</p>
                  ) : (
                    <textarea
                      className="w-full rounded-xl pl-5 py-2 bg-gray-100"
                      placeholder="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  )}
                </div>
                <div className="mb-6">
                  <label>
                    <p className="mb-1">
                      <span className="uppercase font-bold">hashtags</span>
                      <span className="text-gray-400 font-semibold ml-2">
                        (optional)
                      </span>
                    </p>
                  </label>
                  {reviewMode ? (
                    <p className="text-blue-500">
                      {hashtags
                        .replace(/ +/g, "")
                        .split(",")
                        .map((hashtag, i) => (
                          <span
                            key={i}
                            className="mr-2 cursor-pointer text-[#00B2FF] font-semibold"
                          >
                            #{hashtag}
                          </span>
                        ))}
                    </p>
                  ) : (
                    <input
                      type="text"
                      placeholder="Name your NFT"
                      className="w-full rounded-full pl-5 py-2 bg-gray-100"
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                    />
                  )}
                </div>
                {/* <div className="mb-6">
                    <label>
                      <p className="mb-1">
                        <span className="uppercase font-bold">post URL</span>
                      </p>
                    </label>
                    {reviewMode ? (
                      <p>
                        <a href={postUrl}>go to post</a>
                      </p>
                    ) : (
                      <input
                        type="text"
                        placeholder="post URL"
                        className="w-full rounded-full pl-5 py-2 bg-gray-100"
                        value={postUrl}
                        onChange={(e) => setPostUrl(e.target.value)}
                      />
                    )}
                  </div> */}
                {/* <div className="mb-6">
                    <label>
                      <p className="mb-1">
                        <span className="uppercase font-bold">Media type</span>
                      </p>
                    </label>
                    {reviewMode ? (
                      <p>{mediaType}</p>
                    ) : (
                      <select
                        value={mediaType}
                        defaultValue="video/mp4"
                        onChange={(e) => setMediaType(e.target.value)}
                      >
                        <option value="video/mp4">MP4 video</option>
                        <option value="video/ogg">OGG video</option>
                        <option value="video/webm">WebM video</option>
                        <option value="image/jpeg">JPEG image</option>
                        <option value="image/png">PNG image</option>
                        <option value="image/gif">GIF image</option>
                        <option value="image/webp">Webp image</option>
                      </select>
                    )}
                  </div> */}

                <div className="mb-6">
                  <label>
                    <p className="mb-1">
                      <span className="uppercase font-bold">price</span>
                    </p>
                  </label>
                  {reviewMode ? (
                    <div className="flex">
                      <p className="font-semibold">${price}</p>
                      <img
                        src="/assets/usdc.webp"
                        className="h-4 w-4 mt-1 ml-1"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        className="w-full rounded-full pl-8 py-2 bg-gray-100"
                        type="text"
                        placeholder="Price your NFT"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                      <img
                        src="/assets/usdc.webp"
                        className="h-4 w-4 right-3 top-3 absolute"
                      />
                      <p className="absolute left-4 top-2 font-bold">$</p>
                      <span className="text-xs text-gray-600">
                        FYI, there&apos;s a 8% service fee for sales on AYOO NFT
                      </span>
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <label>
                    <p className="mb-1">
                      <span className="uppercase font-bold">royalties</span>
                    </p>
                  </label>
                  <>
                    {/* <input
                          className="w-full rounded-full pl-5 py-2 bg-gray-100"
                          type="text"
                          placeholder="Your royalties"
                          value={royalties}
                          onChange={(e) => setRoyalties(e.target.value)}
                        /> */}
                    <div className="flex justify-between">
                      <p>10%</p>
                      <p>of future sales</p>
                    </div>
                    <span className="text-xs text-gray-600">
                      Right now, AYOO NFT royalties are fixed at 10%
                    </span>
                  </>
                </div>
                {reviewMode && (
                  <div className="mb-6">
                    <label>
                      <p className="mb-1">
                        <span className="uppercase font-bold">Editions</span>
                      </p>
                    </label>

                    <p>1</p>
                  </div>
                )}
                {reviewMode && (
                  <div className="mb-6">
                    <label>
                      <p className="mb-1">
                        <span className="uppercase font-bold">
                          Creator wallet
                        </span>
                      </p>
                    </label>

                    <p>{creator}</p>
                  </div>
                )}

                {!reviewMode && (
                  <>
                    <button
                      onClick={() => setReviewMode(true)}
                      disabled={
                        title === "" || videoUrl === "" || royalties === ""
                      }
                      className="mt-1 border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                    >
                      Review
                    </button>
                    <div className="mt-3">
                      <Link href={`/pages/${myUserName}`}>
                        <button className="mt-3  text-[#635BFF] border-2 border-[#635BFF] hover:bg-[#635BFF] hover:text-white px-3 w-full pb-3 pt-3 rounded-full font-semibold">
                          I will do it later
                        </button>
                      </Link>
                    </div>
                  </>
                )}

                {reviewMode && (
                  <>
                    <button
                      onClick={uploadNft}
                      className="mt-1 border-none flex justify-center text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                    >
                      {loading && (
                        <div className="pt-1 pr-2">
                          <div className="spinner-container">
                            <div className="loading-spinner"></div>
                          </div>
                        </div>
                      )}
                      Create NFT
                    </button>
                    <button
                      onClick={() => setReviewMode(false)}
                      className="mt-3  text-[#635BFF] border-2 border-[#635BFF] hover:bg-[#635BFF] hover:text-white px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
              {/* </form> */}
            </div>
          </div>

          <Modal
            open={modalOpen}
            onClose={handleModalClose}
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
                        <source src={videoUrl} type="video/mp4" />
                        sample
                      </video>
                    </div>
                  ) : (
                    <img
                      className="h-32 w-32 rounded-xl justify-centers"
                      src={videoUrl}
                    />
                  )}
                </div>

                <div className="mt-4">
                  <h1 className="capitalize text-3xl font-bold text-center">
                    congratulations!
                  </h1>
                  <p className="text-center  mt-2">you created an NFT.</p>
                </div>
                <div className="grid grid-rows-1 mb-6 mt-2">
                  <a
                    href={`/pages/${myUserName}/${createdCollectibleId}`}
                    className=" border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold text-center"
                  >
                    View NFT
                  </a>
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
export default Create;

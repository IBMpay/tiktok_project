import { Container, Snackbar } from "@mui/material";
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
const SetNftDetails = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [royalties, setRoyalties] = useState<string>("");
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
  const [open, setOpen] = React.useState(false);

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

  useEffect(() => {
    const init = async () => {
      if (provider) {
        const address = await getWallets();
        console.log("add: ", address);
        setCreator(address[0]);
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
      const response = await fetch("https://ayoo-arweave.herokuapp.com/", {
        method: "POST",
        body: JSON.stringify({
          media_url: videoUrl,
          media_type: mediaType,
          external_url: postUrl,
          title: title,
          royalties: royalties,
          onwer: creator,
          price: price,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        const data = await response.json();
        console.log("the vid: ", username);
        console.log(data);
        // console.log("the data", data);
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
        await setDoc(
          doc(db, "users", username, "collectibles", seed.toString()),
          {
            title,
            description,
            videoUrl,
            mediaType,
            metadataUrl: data.metadata,
            price,
            royalties,
            status: "offchain",
          }
        );
        setSnackbarMode("success");
        setSnackbarMessage("Your NFT has been successfully created!");
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
  return (
    <>
      {!isConnecting ? (
        provider ? (
          <Container>
            <div className="flex w-1/2 mx-auto flex-col mt-40 mb-5">
              <div className=" justify-center">
                <p className="uppercase font-semibold text-md text-center">
                  sell an nft
                </p>
                <h1 className="capitalize font-bold text-3xl text-center">
                  {reviewMode ? "review nft details" : "set nft details"}
                </h1>
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
                <div className="mt-4 mb-6">
                  <img className="mx-auto" src="/assets/Rectangle228.png" />
                </div>
              )}

              <div>
                {/* <form> */}
                <div className="flex flex-col">
                  <div className="mb-4">
                    <label>
                      <p className="mb-2">
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
                  <div className="mb-4">
                    <label>
                      <p className="mb-2">
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
                  <div className="mb-4">
                    <label>
                      <p className="mb-2">
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
                  </div>
                  <div className="mb-4">
                    <label>
                      <p className="mb-2">
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
                  </div>
                  {!reviewMode && (
                    <div className="mb-4">
                      <label>
                        <p className="mb-2">
                          <span className="uppercase font-bold">
                            Media upload
                          </span>
                        </p>
                      </label>

                      <div className="flex">
                        <input
                          type="file"
                          className="w-full rounded-fullpy-2"
                          onChange={(e) => setMediaUpload(e.target.files[0])}
                        />
                        {mediaUploaded && <p>Media has been uploaded</p>}

                        <button
                          onClick={uploadMedia}
                          className="px-4 pb-2 pt-2 rounded-full font-semibold border-none text-black bg-gray-200 hover:bg-[#635BFF] hover:text-white"
                        >
                          <div className="flex justify-center">
                            {uploadLoading && (
                              <div className="pt-1 pr-2">
                                <div className="spinner-container">
                                  <div className="loading-spinner"></div>
                                </div>
                              </div>
                            )}
                            upload
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="mb-4">
                    <label>
                      <p className="mb-2">
                        <span className="uppercase font-bold">
                          Creator wallet
                        </span>
                      </p>
                    </label>
                    {reviewMode ? (
                      <p>{creator}</p>
                    ) : (
                      <input
                        className="w-full rounded-full pl-5 py-2 bg-gray-100"
                        type="text"
                        placeholder="Creator Wallet"
                        value={creator}
                        onChange={(e) => setCreator(e.target.value)}
                      />
                    )}
                  </div>
                  <div className="mb-4">
                    <label>
                      <p className="mb-2">
                        <span className="uppercase font-bold">price</span>
                      </p>
                    </label>
                    {reviewMode ? (
                      <p>{price}</p>
                    ) : (
                      <>
                        <input
                          className="w-full rounded-full pl-5 py-2 bg-gray-100"
                          type="text"
                          placeholder="Price your NFT"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                        <span className="text-xs text-gray-600">
                          FYI, there&apos;s a 8% service fee for sales on AYOO
                          NFT
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mb-4">
                    <label>
                      <p className="mb-2">
                        <span className="uppercase font-bold">royalties</span>
                      </p>
                    </label>
                    {reviewMode ? (
                      <p>{royalties}</p>
                    ) : (
                      <>
                        <input
                          className="w-full rounded-full pl-5 py-2 bg-gray-100"
                          type="text"
                          placeholder="Your royalties"
                          value={royalties}
                          onChange={(e) => setRoyalties(e.target.value)}
                        />
                        <span className="text-xs text-gray-600">
                          Right now, AYOO NFT royalties are fixed at 10%
                        </span>
                      </>
                    )}
                  </div>
                  {!reviewMode && (
                    <button
                      onClick={() => setReviewMode(true)}
                      disabled={
                        title === "" ||
                        videoUrl === "" ||
                        royalties === "" ||
                        postUrl === ""
                      }
                      className="mt-1 border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                    >
                      Next
                    </button>
                  )}

                  {reviewMode && (
                    <>
                      <button
                        onClick={uploadNft}
                        className="mt-1 border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                      >
                        {loading && (
                          <div className="pt-1 pr-2">
                            <div className="spinner-container">
                              <div className="loading-spinner"></div>
                            </div>
                          </div>
                        )}
                        Upload NFT
                      </button>
                      <button
                        onClick={() => setReviewMode(false)}
                        className="mt-1 border-none text-white bg-[#635BFF] hover:bg-[#8983fa] px-3 w-full pb-3 pt-3 rounded-full font-semibold"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
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
          <LoginSection login={login} />
        )
      ) : (
        <Loader />
      )}
    </>
  );
};
export default SetNftDetails;

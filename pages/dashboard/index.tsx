import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/web3auth";
import {
  WALLET_ADAPTERS,
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
} from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import RPC from "../../solanaRPC";
import { db } from "../../firebase-config";
import {
  getDocs,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "@firebase/firestore";
import { Container } from "@mui/system";
import { useRouter } from "next/router";
import Button from "../../components/Button";
import { useMarket } from "../../hooks/useMarket copy";
import { useWeb3Auth } from "../../services/web3auth";
import LoginSection from "../../components/loginSection";
const clientId =
  "BOjke_VdSeEjE5Gap8t4hfg_1QRymSFuTYxklhGttI-6H-ZJARwiLQunE9PYrl9xyxwNerQQT6u01uDP744_mM8"; // get from https://dashboard.web3auth.io
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

const LAMPORTS = 1_000_000_000;

function Dashboard() {
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
  const [userAddress, setUserAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);

  const router = useRouter();
  const {
    provider,
    login,
    // showWalletConnectScanner,
    showDapp,
    showTopup,
    logout,
    getUser,
    getUserInfo,
    getAccounts,
    getBalance,
    signMessage,
    signV4Message,
  } = useWeb3Auth();
  useEffect(() => {
    const getAddress = async () => {
      if (provider) {
        const address: any = getAccounts();
        const { usdcBalance, solBalance }: any = getBalance();
        console.log("the address: ", usdcBalance);
        console.log("the address: ", solBalance);
        setUserAddress(address[0]);
        console.log(balance);
        setBalance(+solBalance);
        setUsdcBalance(+usdcBalance);
      }
    };
    getAddress();
  }, [provider]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const username = userData.email.split("@", 1)[0];
        const usersRef = collection(db, "users");
        const userRef = doc(usersRef, username);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          console.log("Document data:", userSnap.data());
        } else {
          await setDoc(doc(db, "users", username), {
            name: userData.name,
            email: userData.email,
            avatarUrl: userData.profileImage,
            wallet: userAddress,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, [userData, userAddress]);

  const setInfluencer = async () => {
    try {
      const username = userData.email.split("@", 1)[0];
      const docRef = doc(db, "users", username);
      await updateDoc(docRef, {
        bioDescription: "lorem ipsum",
        followerCount: 1000,
        followingCount: 20,
        isVerified: true,
        likesCount: 100,
        isInfluencer: true,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {provider ? (
        <Container>
          <div className="flex md:w-1/2 lg:w-1/2 mx-auto flex-col mt-40">
            <div className=" justify-center">
              <div className="flex items-center">
                <img
                  className="inline-block h-24 w-24 rounded-full ring-2 ring-white"
                  src={userData.profileImage}
                />
                <div className=" ml-10">
                  <h1 className="capitalize font-bold text-3xl text-center">
                    {userData.name}
                  </h1>
                  <p>
                    {" "}
                    @<span>{userData.email.split("@", 1)[0]}</span>
                  </p>
                </div>
              </div>

              <table className="border-collapse table-auto w-full text-sm mt-10">
                <tbody className="bg-white dark:bg-slate-800">
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                      Wallet address
                    </td>
                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                      {userAddress}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                      email
                    </td>
                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                      {userData.email}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                      Balance (SOL)
                    </td>
                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                      {balance / LAMPORTS}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                      Balance (USDC)
                    </td>
                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                      {usdcBalance / 1_000_000}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-6">
                <button
                  className="pr-12 pl-12 pb-3 pt-3 rounded-full font-semibold border-none text-white bg-[#635BFF] hover:bg-[#8983fa]"
                  onClick={setInfluencer}
                >
                  I am influencer
                </button>
              </div>
            </div>
          </div>
        </Container>
      ) : (
        <LoginSection login={login} />
      )}
    </>
  );
}

export default Dashboard;

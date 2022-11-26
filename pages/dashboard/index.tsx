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
import Loader from "../../components/loader";
import axios from "axios";
import Header from "../../components/Header";
import Image from "next/image";
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
  const [userInfo, setUserInfo] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [usdcBalance, setUsdcBalance] = useState("");
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
    isConnected,
    getAccounts,
    getBalance,
    isConnecting,
    signMessage,
    signV4Message,
  } = useWeb3Auth();

  useEffect(() => {
    const getAddress = async () => {
      // if (!isConnected && !isConnecting) router.push("/login");
      if (provider) {
        const user = await getUser();
        const username = user.email.split("@", 1)[0].replace(".", "");
        const userRef = doc(db, "users", username);
        const userSnap = await getDoc(userRef);
        setUserInfo(userSnap.data());
        console.log(userSnap.data());
        const address: any = await provider.getAccounts();
        console.log("my address: ", address);
        const bal = await getBalance();
        console.log("balance: ", bal);
        const usdcBalance = "";
        const solBalance = "";
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
        console.log("sol res", solResponse);
        console.log("res", response);
        // console.log("balance 2:", solResponse.data[0].result.value);
        console.log(response.data[0].result.value.length);
        const usdcAmount =
          response.data[0].result.value.length !== 0
            ? response.data[0].result.value[0].account.data.parsed.info
                .tokenAmount.uiAmountString
            : "0";
        setUsdcBalance(usdcAmount);
        setUserAddress(address[0]);
        // console.log(balance);
        setBalance(
          (solResponse.data[0].result.value / LAMPORTS).toFixed(3).toString()
        );
        // setUsdcBalance(+usdcBalance);
      }
    };
    getAddress();
  }, [provider]);

  return (
    <>
      {!isConnecting && provider ? (
        <Container>
          <Header />
          <div className="flex md:w-1/2 lg:w-1/2 mx-auto flex-col mt-40">
            <div className=" justify-center">
              {userInfo && (
                <div className="flex items-center">
                  {/* <div className="flex justify-center"> */}
                  <Image
                    src={userInfo.avatarUrl}
                    width={96}
                    height={96}
                    className="inline-block h-24 w-24 rounded-full ring-2 ring-white"
                  />
                  {/* </div> */}
                  <div className=" ml-10">
                    <h1 className="capitalize font-bold text-3xl text-center">
                      {userInfo.name}
                    </h1>
                    <p>
                      {" "}
                      @
                      <span>
                        {userInfo.email.split("@", 1)[0].replace(".", "")}
                      </span>
                    </p>
                  </div>
                </div>
              )}

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
                      {userInfo && userInfo.email}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                      Balance (SOL)
                    </td>
                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                      {balance}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                      Balance (USDC)
                    </td>
                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                      {usdcBalance}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      ) : (
        <Loader />
      )}
    </>
  );
}

export default Dashboard;

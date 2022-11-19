import { ADAPTER_EVENTS, SafeEventEmitterProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { SolanaWalletConnectorPlugin } from "@web3auth/solana-wallet-connector-plugin";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CHAIN_CONFIG, CHAIN_CONFIG_TYPE } from "../config/chainConfig";
import { WEB3AUTH_NETWORK_TYPE } from "../config/web3AuthNetwork";
import { getWalletProvider, IWalletProvider } from "./walletProvider";
import { doc, getDoc, setDoc } from "@firebase/firestore";
import { db } from "../firebase-config";
export interface IWeb3AuthContext {
  web3Auth: Web3Auth | null;
  provider: IWalletProvider | null;
  isLoading: boolean;
  user: unknown;
  signV4Message: () => Promise<any>;
  login: () => Promise<void>;
  showDapp: (url: string) => Promise<void>;
  showTopup: () => Promise<void>;
  // showWalletConnectScanner: () => Promise<void>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<any>;
  signMessage: () => Promise<any>;
  getAccounts: () => Promise<any>;
  getBalance: () => Promise<any>;
  getUser: () => Promise<any>;
  getWallets: () => Promise<any>;
  torusPlugin: any;
  isConnecting: boolean;
}

export const Web3AuthContext = createContext<IWeb3AuthContext>({
  web3Auth: null,
  provider: null,
  isLoading: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  showDapp: async (url: string) => {},
  // showWalletConnectScanner: async () => {},
  showTopup: async () => {},
  getUserInfo: async () => {},
  signMessage: async () => {},
  signV4Message: async () => {},
  getAccounts: async () => {},
  getBalance: async () => {},
  getUser: async () => {},
  getWallets: async () => {},
  torusPlugin: null,
  isConnecting: true,
});

export function useWeb3Auth() {
  return useContext(Web3AuthContext);
}

interface IWeb3AuthState {
  web3AuthNetwork: WEB3AUTH_NETWORK_TYPE;
  chain: CHAIN_CONFIG_TYPE;
  children?: React.ReactNode;
}
interface IWeb3AuthProps {
  children?: ReactNode;
  web3AuthNetwork: WEB3AUTH_NETWORK_TYPE;
  chain: CHAIN_CONFIG_TYPE;
}

export const Web3AuthProvider: FunctionComponent<IWeb3AuthState> = ({
  children,
  web3AuthNetwork,
  chain,
}: IWeb3AuthProps) => {
  const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [torusPlugin, setTorusPlugin] = useState<any | null>(null);

  const [provider, setProvider] = useState<IWalletProvider | null>(null);
  const [user, setUser] = useState<unknown | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const setWalletProvider = useCallback(
    (web3authProvider: SafeEventEmitterProvider) => {
      const walletProvider = getWalletProvider(
        chain,
        web3authProvider,
        uiConsole
      );
      setProvider(walletProvider);
    },
    [chain]
  );

  useEffect(() => {
    const subscribeAuthEvents = (web3auth: Web3Auth, torusPlugin: any) => {
      // Can subscribe to all ADAPTER_EVENTS and LOGIN_MODAL_EVENTS
      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: unknown) => {
        console.log("Yeah!, you are successfully logged in", data);
        setUser(data);
        setIsConnecting(false);
        setWalletProvider(web3auth?.provider as SafeEventEmitterProvider);
      });

      web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
        console.log("connecting");
        setIsConnecting(true);
      });

      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log("disconnected");
        setUser(null);
      });

      web3auth.on(ADAPTER_EVENTS.ERRORED, (error: unknown) => {
        console.error("some error or user has cancelled login request", error);
      });
    };

    const currentChainConfig = CHAIN_CONFIG[chain];

    async function init() {
      try {
        setIsLoading(true);
        const clientId =
          "BOjke_VdSeEjE5Gap8t4hfg_1QRymSFuTYxklhGttI-6H-ZJARwiLQunE9PYrl9xyxwNerQQT6u01uDP744_mM8";
        const web3AuthInstance = new Web3Auth({
          chainConfig: currentChainConfig,
          // get your client id from https://dashboard.web3auth.io
          clientId,
          uiConfig: {
            theme: "light",
            loginMethodsOrder: ["google"],
            appLogo: "/assets/logo.png",
          },
        });
        // const {SolanaWalletConnectorPlugin} = await import()
        const { SolanaWalletConnectorPlugin } = await import(
          "@web3auth/solana-wallet-connector-plugin"
        );
        const torusPlugin = new SolanaWalletConnectorPlugin({
          torusWalletOpts: { modalZIndex: -1 },
          walletInitOptions: {
            /* 
            apiKey: clientId,
            whiteLabel: {
              name: "Whitelabel Demo",
              theme: { isDark: false, colors: { torusBrand1: "#3AA4E7" } },
              logoLight:
                "https://firebasestorage.googleapis.com/v0/b/tiktok-blockchain.appspot.com/o/logo-d.png?alt=media&token=cfe15772-dc17-476a-b7e4-76d1cb8d29ea",
              logoDark:
                "https://firebasestorage.googleapis.com/v0/b/tiktok-blockchain.appspot.com/o/logo-light.png?alt=media&token=5f3a4d66-ba64-4de6-ae80-0e3e530d7eb2",
              topupHide: true,
              defaultLanguage: "en",
            },
            enableLogging: true,
           */
          },
        });
        // const paym = await torusPlugin.torusWalletInstance.initiateTopup()
        await web3AuthInstance.addPlugin(torusPlugin);
        // torusPlugin.torusWalletInstance.
        setTorusPlugin(torusPlugin);

        const adapter = new OpenloginAdapter({
          chainConfig: currentChainConfig,
          adapterSettings: { network: web3AuthNetwork, clientId },
        });
        web3AuthInstance.configureAdapter(adapter);

        subscribeAuthEvents(web3AuthInstance, torusPlugin);
        setWeb3Auth(web3AuthInstance);
        await web3AuthInstance.initModal();
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
        setIsConnecting(false);
      }
    }
    init();
  }, [chain, web3AuthNetwork, setWalletProvider, ADAPTER_EVENTS]);

  useEffect(() => {
    const init = async () => {
      console.log("here 1");
      if (provider && web3Auth) {
        try {
          const user = await web3Auth.getUserInfo();
          console.log("here 2", user);
          const wallets = await provider.getAccounts();
          console.log("here 3");
          const username = user.email.split("@", 1)[0].replace(".", "");
          // console.log(username);
          const userRef = doc(db, "users", username);
          console.log("user ref: ", userRef);
          const userSnap = await getDoc(userRef);
          console.log(userSnap);

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              avatarUrl: user.profileImage,
              name: user.name,
              wallet: wallets[0],
              email: user.email,
            });
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    init();
  }, [provider, ADAPTER_EVENTS, web3Auth]);

  const login = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      uiConsole("web3auth not initialized yet");
      return;
    }
    const localProvider = await web3Auth.connect();

    setWalletProvider(localProvider as SafeEventEmitterProvider);
  };

  const logout = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3Auth.logout();
    setProvider(null);
  };

  const getUserInfo = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3Auth.getUserInfo();
    uiConsole(user);
  };

  const getUser = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3Auth.getUserInfo();
    return user;
  };

  const showTopup = async () => {
    if (!web3Auth || !provider) {
      console.log("web3auth not initialized yet");
      uiConsole("web3auth not initialized yet");
      return;
    }
    const accounts = await provider.getAccounts();
    const user = await torusPlugin?.initiateTopup("moonpay", {
      selectedAddress: accounts[0],
    });
    uiConsole(user);
  };
  // const showWalletConnectScanner = async () => {
  //   if (!web3Auth || !provider) {
  //     console.log("web3auth not initialized yet");
  //     uiConsole("web3auth not initialized yet");
  //     return;
  //   }
  //   const user = await torusPlugin?.showWalletConnectScanner();
  //   uiConsole(user);
  // };
  const showDapp = async (url: string) => {
    if (!web3Auth || !provider) {
      console.log("web3auth not initialized yet");
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = torusPlugin?.torusWalletInstance.showWallet("discover", {
      url,
    });
    uiConsole(user);
  };

  const getAccounts = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    provider.getAccounts();
  };

  const getWallets = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    return provider.getAccounts();
  };

  const getBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    provider.getBalance();
  };

  const signMessage = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    provider.signMessage();
  };

  const signV4Message = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    provider.signV4Message();
  };
  const uiConsole = (...args: unknown[]): void => {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  };

  const contextProvider = {
    web3Auth,
    provider,
    user,
    isLoading,
    login,
    logout,
    getUserInfo,
    getAccounts,
    getBalance,
    signMessage,
    signV4Message,
    showTopup,
    getUser,
    showDapp,
    getWallets,
    torusPlugin,
    isConnecting,
    // showWalletConnectScanner,
  };
  return (
    <Web3AuthContext.Provider value={contextProvider}>
      {children}
    </Web3AuthContext.Provider>
  );
};

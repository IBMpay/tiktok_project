import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Loader from "../components/loader";
import LoginSection from "../components/loginSection";
import { useWeb3Auth } from "../services/web3auth";

function login() {
  const { provider, isConnecting, login, isConnected } = useWeb3Auth();
  // useEffect(() => {
  //   if (provider) router.push("/dashboard/profile");
  // }, []);
  const router = useRouter();
  useEffect(() => {
    if (isConnected) router.push("/dashboard/profile/");
  }, [provider]);

  // return <LoginSection login={login} />;
  return <>{!isConnecting ? <LoginSection login={login} /> : <Loader />}</>;
}

export default login;

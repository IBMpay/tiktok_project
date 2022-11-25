import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useWeb3Auth } from "../services/web3auth";

function Loader() {
  const { provider } = useWeb3Auth();
  const router = useRouter();
  useEffect(() => {
    const interval = setInterval(() => {
      router.push("/login");
    }, 12000);
    return () => clearInterval(interval);
  }, [provider]);
  return (
    <div
      className="h-full min-h-screen w-screen bg-cover flex items-center justify-center"
      style={{ backgroundImage: "url(/assets/bg.png)" }}
    >
      <div className="pt-10">
        <div className="w-32 mx-auto">
          <img src="/assets/logo-white.png" />
        </div>
        <div className="w-1/3 rounded-2xl ml-6 pt-4 pb-1 text-center">
          <div>
            <div className="lds-ellipsis">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
        <p className="text-center text-white uppercase font-semibold text-xs">
          Connecting
        </p>
      </div>
    </div>
    // </div>
    // <div>
  );
}

export default Loader;

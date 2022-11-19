import React, { useEffect } from "react";
import { useWeb3Auth } from "../services/web3auth";
import Button from "./Button";

function LoginSection({ login }) {
  const { provider, web3Auth } = useWeb3Auth();
  useEffect(() => {
    const init = async () => {
      try {
        await web3Auth.connect();
      } catch (error) {
        console.log(error);
      }
    };
    init();
  }, [provider]);
  return (
    <div
      className="h-full min-h-screen w-screen bg-cover flex items-center justify-center"
      style={{ backgroundImage: "url(/assets/bg.png)" }}
    >
      {/* <div className="pt-10 w-1/3">
        <div className="w-32 mx-auto mb-8">
          <img src="/assets/logo-white.png" />
        </div>
        <div className="w-full bg-white rounded-2xl mx-auto py-8 px-12 text-center">
          <h6 className="uppercase font-semibold text-sm mb-6 text-gray-500">
            Authentication
          </h6>
          <h1 className="text-3xl font-bold mb-4">Join AYOO Today</h1>
          <div>
            <button
              onClick={login}
              className=" border-none w-full text-white bg-[#635BFF] hover:bg-[#8983fa] pb-3 pt-3 rounded-full font-semibold"
            >
              Authenticate
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default LoginSection;

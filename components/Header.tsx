import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useWeb3Auth } from "../services/web3auth";
import { doc, getDoc } from "@firebase/firestore";
import { db } from "../firebase-config";
import Image from "next/image";
import { Tooltip } from "@mui/material";

function Header() {
  const { logout, getUser, provider } = useWeb3Auth();
  const [userName, setUserName] = useState<string>();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const toggleOpen = () => {
    if (menuOpen) setMenuOpen(false);
    else setMenuOpen(true);
  };
  useEffect(() => {
    const init = async () => {
      const user = await getUser();
      const username = user.email.split("@", 1)[0].replace(".", "");
      const userRef = doc(db, "users", username);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setAvatarUrl(userSnap.data().avatarUrl);
      } else {
        setAvatarUrl("/assets/Rectangle.png");
      }
      setUserName(username);
    };
    init();
  }, [provider]);

  const router = useRouter();
  const handleMobileClick = (to: any) => {
    router.push(to);
    setMenuOpen(false);
  };
  return (
    <div className="mb-10">
      <div className=" fixed top-0 left-0 right-0 " style={{ zIndex: 1 }}>
        <div className="flex py-2 border-b  px-8  border-gray-200 bg-white justify-between">
          <div className="flex">
            <div className="cursor-pointer py-2">
              <a href="https//ayoo.site">
                <img src="/assets/logo.png" className="h-7" />
              </a>
            </div>
            {/* <div className="flex ml-4">
              <Link href="/dashboard">
                <p className="capitalize font-semibold ml-4 cursor-pointer hover:text-[#635BFF]">
                  dashboard
                </p>
              </Link>
              <Link href="/dashboard/profile">
                <p className="capitalize font-semibold ml-4 cursor-pointer hover:text-[#635BFF]">
                  profile
                </p>
              </Link>
              <Link href="/dashboard/create">
                <p className="capitalize font-semibold ml-4 cursor-pointer hover:text-[#635BFF]">
                  Create
                </p>
              </Link>
            </div> */}
          </div>
          <div className="flex">
            <Link href={`/dashboard/create`}>
              <button className="capitalize py-2 font-semibold mr-3 cursor-pointer hover:text-[#635BFF]">
                Create
              </button>
            </Link>
            <Link href={`/pages/${userName}`}>
              <Tooltip title="view page" placement="bottom">
                <div className=" mr-4  cursor-pointer ">
                  <Image
                    src={avatarUrl}
                    width={42}
                    height={42}
                    className="rounded-full border-2 hover:border-blue-500"
                  />
                </div>
              </Tooltip>
            </Link>

            <Link href={`/dashboard`}>
              <Tooltip title="View-wallet" placement="bottom">
                <button className="py-2">
                  <WalletIcon className="h-7 w-7 mr-4 cursor-pointer hover:text-[#635BFF]" />
                </button>
              </Tooltip>
            </Link>
            <Tooltip title="Logout" placement="bottom">
              <button className="py-2" onClick={logout}>
                <ArrowRightOnRectangleIcon className="h-7 w-7 mr-4 cursor-pointer hover:text-[#635BFF]" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
      {/* <div
        className=" fixed top-0 left-0 z-100 right-0 md:hidden"
        style={{ zIndex: 100000 }}
      >
        <div className="flex border-b px-8 z-100 border-gray-200 bg-white justify-between">
          <div className="flex">
            <div className=" py-4 cursor-pointer">
              <Link href="/dashboard">
                <img src="/assets/logo.png" className="h-6" />
              </Link>
            </div>
          </div>
          <div className="flex py-1">
            <button
              onClick={toggleOpen}
              className="p-3 rounded-lg hover:bg-gray-100 focus:bg-gray-100"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            {menuOpen && (
              <div>
                <div
                  className="absolute top-14 w-full flex border-t border-gray-200 flex-col bg-white p-10 items-center left-0"
                  style={{ height: "calc(100vh - 56px)" }}
                >
                  <button
                    className="capitalize font-semibold text-2xl my-2  py-3 rounded-lg w-full hover:bg-gray-50 text-center mr-4 cursor-pointer hover:text-[#635BFF]"
                    onClick={() => handleMobileClick("/dashboard")}
                  >
                    dashboard
                  </button>
                  <button
                    className="capitalize font-semibold text-2xl my-2  py-3 rounded-lg w-full hover:bg-gray-50 text-center mr-4 cursor-pointer hover:text-[#635BFF]"
                    onClick={() => handleMobileClick("/dashboard/profile")}
                  >
                    profile
                  </button>
                  <button
                    className="capitalize font-semibold text-2xl my-2  py-3 rounded-lg w-full hover:bg-gray-50 text-center mr-4 cursor-pointer hover:text-[#635BFF]"
                    onClick={() => handleMobileClick("/dashboard/create")}
                  >
                    Create
                  </button>
                  <button
                    className="capitalize font-semibold text-2xl my-2  py-3 rounded-lg w-full hover:bg-gray-50 text-center mr-4 cursor-pointer hover:text-[#635BFF]"
                    onClick={() => handleMobileClick(`/pages/${userName}`)}
                  >
                    Visit page
                  </button>
                  <button
                    onClick={logout}
                    className="capitalize font-semibold text-2xl my-2  py-3 rounded-lg hover:bg-gray-50 w-full text-center mr-3 cursor-pointer hover:text-[#635BFF]"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default Header;

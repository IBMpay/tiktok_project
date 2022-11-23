import Link from "next/link";
import React from "react";
import { useWeb3Auth } from "../services/web3auth";

function Header() {
  const { logout } = useWeb3Auth();
  return (
    <div>
      <div className="flex py-4 border-b border-gray-200 justify-between">
        <div className="flex">
          <div className="cursor-pointer">
            <Link href="/dashboard">
              <img src="/assets/logo.png" className="h-6" />
            </Link>
          </div>
          <div className="flex ml-4">
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
          </div>
        </div>
        <div className="flex">
          <Link href="/pages/promehdioh">
            <p className="capitalize font-semibold mr-3 cursor-pointer hover:text-[#635BFF]">
              Visit page
            </p>
          </Link>
          <p
            onClick={logout}
            className="capitalize font-semibold mr-3 cursor-pointer hover:text-[#635BFF]"
          >
            Logout
          </p>
        </div>
      </div>
    </div>
  );
}

export default Header;

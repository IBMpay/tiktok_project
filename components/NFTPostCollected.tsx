import Link from "next/link";
import React from "react";
import { useMarket } from "../hooks/useMarket";

function NFTPostCollected({
  video,
  title,
  baseLink,
  id,
  price,
  type,
  provider,
}) {
  return (
    <div className=" rounded-xl overflow-hidden drop-shadow-md cursor-pointer hover:scale-105 ease-in-out duration-300">
      <Link href={`${baseLink}/${id}`}>
        <div className="flex flex-col">
          <div>
            {/* <img src="assets/offerImg.png" /> */}
            {type !== "video/mp4" &&
            type !== "video/ogg" &&
            type !== "video/webm" ? (
              <img src={video} />
            ) : (
              <video width="620" height="620">
                <source src={video} type="video/mp4" />
              </video>
            )}
          </div>
          <div className="p-4 bg-white pb-6">
            <div>
              <h1 className="font-bold text-gray-800 text-xl">{title}</h1>
            </div>
            <div className="w-full - mt-2">
              <div className="">
                <p className="font-semibold  capitalize text-sm">price:</p>{" "}
                <p className="font-bold uppercase text-xl flex">
                  <span>${price}</span>{" "}
                  <img
                    className="w-5  h-5  mt-1 ml-1"
                    src="/assets/usdc.webp"
                  />
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default NFTPostCollected;

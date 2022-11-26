import Link from "next/link";
import React from "react";
import { useMarket } from "../hooks/useMarket";

function NFTPostItem({
  video,
  title,
  id,
  baseLink,
  price,
  type,
  lastSalePrice,
  description,
  provider,
}) {
  console.log("id=", id.toString());
  return (
    <div className=" rounded-xl overflow-hidden drop-shadow-md cursor-pointer hover:scale-105 ease-in-out duration-300">
      <a href={`${baseLink}/${id}`}>
        <div className="flex flex-col">
          {/* <p>{id}</p> */}
          <div>
            {/* <img src="assets/offerImg.png" /> */}
            {type !== "video/mp4" &&
            type !== "video/ogg" &&
            type !== "video/webm" ? (
              <img src={video} />
            ) : (
              <video width="620" height="620">
                <source src={video} type="video/mp4" />
                {description}
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
              {lastSalePrice && (
                <div className="mt-2">
                  <p className=" text-gray-600 text-xs flex">
                    <span className="text-gray-500">last sale:</span>
                    <span className="font-bold ml-1 text-black">
                      ${lastSalePrice}
                    </span>
                    <img className="w-4 h-4 ml-1" src="/assets/usdc.webp" />
                  </p>
                  {/* <p className="font-bold uppercase text-[#5453CF]">
                    ${lastSalePrice} usdc
                  </p> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}

export default NFTPostItem;

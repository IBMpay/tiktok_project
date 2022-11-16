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
  royalties,
  status,
  lastSalePrice,
  description,
  provider,
}) {
  const { mintNft } = useMarket();

  const handleMintNft = () => {
    const uri =
      "https://raw.githubusercontent.com/Coding-and-Crypto/Solana-NFT-Marketplace/master/assets/example.json";
    console.log(uri);
    console.log("some price", price);
    const newPrice = price * 1000000;
    mintNft(title, uri, newPrice);
  };
  return (
    <div className=" rounded-xl overflow-hidden drop-shadow-md cursor-pointer hover:scale-105 ease-in-out duration-300">
      <Link href={`${baseLink}/${id}`}>
        <div className="flex flex-col">
          <div>
            {/* <img src="assets/offerImg.png" /> */}
            {type !== "video/mp4" ? (
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
            <div className="w-full flex justify-between mt-2">
              <div className="">
                <p className="font-bold text-gray-600 text-xs ">price:</p>{" "}
                <p className="font-bold uppercase text-[#5453CF]">
                  ${price} usdc
                </p>
              </div>
              {lastSalePrice && (
                <div className="">
                  <p className="font-bold text-gray-600 text-xs ">last sale:</p>{" "}
                  <p className="font-bold uppercase text-[#5453CF]">
                    ${lastSalePrice} usdc
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default NFTPostItem;

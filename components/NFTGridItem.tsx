import React from "react";

function NFTGridItem() {
  return (
    <div className=" rounded-lg overflow-hidden drop-shadow-xl">
      <div className="flex flex-col">
        <div>
          <img src="assets/rectangle.png" />
        </div>
        <div className="p-4 bg-white">
          <div>
            <h1 className="font-bold text-gray-800 text-xl">
              Souls Escape #11
            </h1>
          </div>
          <div className="flex justify-between">
            <p>
              <span className="text-sm font-semibold">Price:</span>{" "}
              <span className="flex items-center font-semibold">
                $105
                <img src="assets/usdc.webp" className="h-4 w-4 ml-1" />
              </span>
            </p>
            <p>
              <span className="text-sm font-semibold">Last Sale:</span>{" "}
              <span className="flex items-center font-semibold">
                $105
                <img src="assets/usdc.webp" className="h-4 w-4 ml-1" />
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NFTGridItem;

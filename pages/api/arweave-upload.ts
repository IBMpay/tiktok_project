// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Arweave from "arweave";
import * as fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { URL } from "url";
import fetch from "node-fetch";
import https from "https";

type Data = {
  video: string;
  metadata: string;
};

type Error = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>
) {
  if (req.method === "POST") {
    try {
      const video_url = req.body.video_url;
      const title = req.body.title;
      const royalties = req.body.royalties;
      const external_url = req.body.external_url;
      const owner = req.body.owner;
      const media_type = req.body.media_type;

      const arweave = Arweave.init({
        host: "arweave.net",
        port: 443,
        protocol: "https",
        timeout: 20000,
        logging: false,
      });

      const wallet_response = await fetch(
        "https://firebasestorage.googleapis.com/v0/b/tiktok-blockchain.appspot.com/o/arweave-keypair.json?alt=media&token=5f0f4cf7-d52c-49e5-b845-e90011ba7ff8"
      );
      const wallet_buffer = await wallet_response.buffer();
      fs.writeFile(`./arweave.keypair.json`, wallet_buffer, () =>
        console.log("finished downloading wallet!")
      );

      const video_response = await fetch(video_url);
      const buffer = await video_response.buffer();

      let data;

      if (media_type === "video/mp4") {
        fs.writeFile(`./video.mp4`, buffer, () =>
          console.log("finished downloading!")
        );
        data = fs.readFileSync("./video.mp4");
      } else if (media_type === "image/jpeg") {
        fs.writeFile(`./image.jpg`, buffer, () =>
          console.log("finished downloading!")
        );
        data = fs.readFileSync("./image.jpg");
      } else if (media_type === "image/png") {
        fs.writeFile(`./image.png`, buffer, () =>
          console.log("finished downloading!")
        );
        data = fs.readFileSync("./image.png");
      } else {
        fs.writeFile(`./video.mp4`, buffer, () =>
          console.log("finished downloading!")
        );
        data = fs.readFileSync("./video.mp4");
      }

      // Upload image to Arweave

      // const videoURL = new URL(video_url);
      // console.log("the url: ", videoURL, video_url);
      // const data = fs.readFileSync("./video.mp4");

      const transaction = await arweave.createTransaction({
        data: data,
      });
      console.log("med");
      transaction.addTag("Content-Type", media_type);
      const wallet = JSON.parse(
        fs.readFileSync("arweave-keypair.json", "utf-8")
      );
      console.log(__dirname);
      await arweave.transactions.sign(transaction, wallet);

      const arResponse = await arweave.transactions.post(transaction);

      console.log(arResponse);

      const vidUrl = transaction.id
        ? `https://arweave.net/${transaction.id}`
        : undefined;

      console.log(vidUrl);
      // Upload metadata to Arweave
      const category =
        media_type === "image/png" || media_type === "image/jpeg"
          ? "image"
          : "video";
      const metadata = {
        name: title,
        symbol: null,
        description: "A description about my custom NFT #1",
        seller_fee_basis_points: royalties,
        external_url: external_url,
        properties: {
          files: [
            {
              uri: vidUrl,
              type: media_type,
            },
          ],
          category: category,
          maxSupply: 0,
          creators: [
            {
              address: owner,
              share: 100,
            },
          ],
        },
        video: vidUrl,
      };

      const metadataRequest = JSON.stringify(metadata);

      const metadataTransaction = await arweave.createTransaction({
        data: metadataRequest,
      });

      metadataTransaction.addTag("Content-Type", "application/json");

      await arweave.transactions.sign(metadataTransaction, wallet);

      await arweave.transactions.post(metadataTransaction);

      const metadataUrl = transaction.id
        ? `https://arweave.net/${metadataTransaction.id}`
        : undefined;
      console.log("metadata url: ", metadataUrl);

      res.status(200).json({ video: vidUrl, metadata: metadataUrl });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error });
    }
  }
}

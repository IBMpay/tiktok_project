import * as fs from "fs";
import Arweave from "arweave";

export const uploadMedia = async (post) => {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });

  // Upload image to Arweave
  const data = fs.readFileSync(post.video_url);

  const transaction = await arweave.createTransaction({
    data: data,
  });

  transaction.addTag("Content-Type", "video/mp4");
  const wallet = JSON.parse(fs.readFileSync("./arweave-keypair.json", "utf-8"));
  await arweave.transactions.sign(transaction, wallet);

  const response = await arweave.transactions.post(transaction);

  console.log(response);

  const imageUrl = transaction.id
    ? `https://arweave.net/${transaction.id}`
    : undefined;

  console.log(imageUrl);
  // Upload metadata to Arweave

  const metadata = {
    name: post.title,
    symbol: null,
    description: "A description about my custom NFT #1",
    seller_fee_basis_points: post.royalties,
    external_url: post.external_url,
    properties: {
      files: [
        {
          uri: imageUrl,
          type: "video/mp4",
        },
      ],
      category: "video",
      maxSupply: 0,
      creators: [
        {
          address: post.owner,
          share: 100,
        },
      ],
    },
    image: imageUrl,
  };

  const metadataRequest = JSON.stringify(metadata);

  const metadataTransaction = await arweave.createTransaction({
    data: metadataRequest,
  });

  metadataTransaction.addTag("Content-Type", "application/json");

  await arweave.transactions.sign(metadataTransaction, wallet);

  await arweave.transactions.post(metadataTransaction);

  const metadataUrl = transaction.id
    ? `https://arweave.net/${transaction.id}`
    : undefined;
  console.log("metadata url: ", metadataUrl);
};

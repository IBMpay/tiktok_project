export const authorFilter = (authorBase58PublicKey: any) => ({
  memcmp: {
    offset: 8,
    bytes: authorBase58PublicKey,
  },
});

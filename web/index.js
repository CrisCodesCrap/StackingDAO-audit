// index.ts
var walletTracker = async (event) => {
  if (!event.data)
    throw new Error("no block was passed");
  console.log(event.data);
};
export {
  walletTracker
};

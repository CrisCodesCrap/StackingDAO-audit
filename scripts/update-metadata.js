const fetch = require("node-fetch");

for (var i = 200; i >= 0; i--) {
  const body = `{"fullyQualifiedTokenIds":["SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-genesis-nft::stacking-dao-genesis:${i}"]}`;
  fetch("https://api.gamma.io/nft-data-service/v1/nftMetadataRefresh", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,es;q=0.7",
      "content-type": "application/json",
      "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    "referrer": "https://stacks.gamma.io/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": body,
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  }); 
}

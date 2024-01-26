const fs = require('node:fs');

const ogIds = [0, 99];
const goldIds = [100, 199];
const diamondId = 200;

for (var i = 0; i <= 16000; i++) {
  let type = 'Normal';
  let url = 'https://hcxv2vyi3luktk327viauzupdlqwxchpkhgb2j3pshneqifs67ya.arweave.net/OK9dVwja6Kmrev1QCmaPGuFriO9RzB0nb5HaSCCy9_A';
  if (i <= 99) {
    type = 'OG';
    url = 'https://i5udnkhocmn6sykqcunf7fupsentmeots235ucuhszlwb7biboeq.arweave.net/R2g2qO4TG-lhUBUaX5aPkRs2EdOWt9oKh5ZXYPwoC4k';
  } else if (i <= 199) {
    type = 'Gold';
    url = 'https://hlwdrd7kksu4hbhskac5rfjiagbxvs65sboi3uq2avlzwyzhehua.arweave.net/Ouw4j-pUqcOE8lAF2JUoAYN6y92QXI3SGgVXm2MnIeg';
  } else if (i === 200) {
    type = 'Diamond';
    url = 'https://vruyvmokf645hvjjvp2wbabcax5bss32mjwe7f4zskuuffztxqga.arweave.net/rGmKscovudPVKav1YIAiBfoZS3pibE-XmZKpQpczvAw';
  }

  const content = {
    "name": `Stacking DAO Genesis NFT #${i}`,
    "description": "Congrats you are an early adopter of liquid stacking on Stacks!",
    "image": url,
    "date": Date.now(),
    "attributes": [
      {
        "trait_type": "type",
        "value": type
      }
    ]
  };
  fs.writeFileSync(`metadata/${i}.json`, JSON.stringify(content));
}



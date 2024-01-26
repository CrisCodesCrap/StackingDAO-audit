//import { readJWKFile, arDriveFactory } from 'ardrive-core-js';
const core = require('ardrive-core-js');

// Read wallet from file
const myWallet = core.readJWKFile('wallet-arweave.json');

// Construct ArDrive class
const arDrive = core.arDriveFactory({ wallet: myWallet });

const upload = async () => {
  const wrappedEntity = core.wrapFileOrFolder('metadata/199.json');
  const destFolderId = core.EID('b3c1072c-61d9-463b-8b4e-0d36bec05a0c');
  console.log(wrappedEntity);

  const uploadFileResult = await arDrive.uploadAllEntities({
    entitiesToUpload: [{ wrappedEntity, destFolderId }]
  });

  console.log(uploadFileResult);
}

upload();

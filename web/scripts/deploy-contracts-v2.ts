// TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","target":"es2019"}' ts-node deploy-contracts.ts
import { readFile as readFileFn } from 'fs';
import { promisify } from 'util';
import { RPCClient } from '@stacks/rpc-client';
import {
  StacksMainnet
} from '@blockstack/stacks-transactions';
import {
  makeContractDeploy,
  broadcastTransaction,
  ClarityVersion,
  getAddressFromPrivateKey,
  TransactionVersion
} from '@stacks/transactions';
import BN from 'bn.js';
require('dotenv').config();

const readFile = promisify(readFileFn);

interface Contract {
  name: string;
  file?: string;
}

const contracts: Contract[] = [
  { name: 'stacking-delegate-chorus-one-1-1', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-chorus-one-1-2', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-chorus-one-1-3', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-chorus-one-1-4', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-chorus-one-1-5', file: 'version-2/stacking-delegate-1' },

  { name: 'stacking-delegate-restake-1-1', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-restake-1-2', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-restake-1-3', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-restake-1-4', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-restake-1-5', file: 'version-2/stacking-delegate-1' },

  { name: 'stacking-delegate-luganodes-1-1', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-luganodes-1-2', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-luganodes-1-3', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-luganodes-1-4', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-luganodes-1-5', file: 'version-2/stacking-delegate-1' },


  { name: 'stacking-delegate-blockdaemon-1-1', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-blockdaemon-1-2', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-blockdaemon-1-3', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-blockdaemon-1-4', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-blockdaemon-1-5', file: 'version-2/stacking-delegate-1' },

  { name: 'stacking-delegate-despread-1-1', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-despread-1-2', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-despread-1-3', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-despread-1-4', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-despread-1-5', file: 'version-2/stacking-delegate-1' },

  { name: 'stacking-pool-signer-chorus-one-v1', file: 'version-2/stacking-pool-signer-v1' },
  { name: 'stacking-pool-signer-luganodes-v1', file: 'version-2/stacking-pool-signer-v1' },
  { name: 'stacking-pool-signer-kiln-v1', file: 'version-2/stacking-pool-signer-v1' },
  { name: 'stacking-pool-signer-despread-v1', file: 'version-2/stacking-pool-signer-v1' },
];

const rpcClient = new RPCClient(process.env.API_SERVER || 'http://localhost:3999');
const privateKey = process.env.CONTRACT_PRIVATE_KEY;
if (!privateKey) {
  console.error('Provide a private key with `process.env.CONTRACT_PRIVATE_KEY`');
  process.exit(1);
}
const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Mainnet);

const network = new StacksMainnet();
network.coreApiUrl = rpcClient.url;

const run = async () => {
  const account = await rpcClient.fetchAccount(address);
  console.log(`Account balance: ${account.balance.toString()} mSTX`);
  console.log(`Account nonce: ${account.nonce}`);

  const txResults: string[] = [];
  let index = 0;
  for (const contract of contracts) {
    let exists: boolean;
    const contractId = `${address}.${contract.name}`;
    try {
      await rpcClient.fetchContractInterface({
        contractAddress: address,
        contractName: contract.name,
      });
      exists = true;
    } catch (error) {
      // console.error(error);
      exists = false;
    }
    if (exists) {
      console.log(`Contract ${contractId} already exists.`);
      continue;
    }

    console.log(`Deploying ${contractId}`);

    const source = await readFile(`../clarity/contracts/${contract.file || contract.name}.clar`);
    const tx = await makeContractDeploy({
      anchorMode: "onChainOnly",
      contractName: contract.name,
      codeBody: source.toString('utf8'),
      senderKey: privateKey,
      nonce: account.nonce + index,
      fee: 3000000,
      network: 'mainnet',
      clarityVersion: ClarityVersion.Clarity2
    });

    const broadcast_id = await broadcastTransaction(tx, 'mainnet');
    console.log(broadcast_id);
    index += 1;
    // const result = await rpcClient.broadcastTX(tx.serialize());

    // if (result.ok) {
    //   index += 1;

    //   const txId = (await result.text()).replace(/"/g, '');
    //   console.log(`${rpcClient.url}/extended/v1/tx/${txId}`);

    //   txResults.push(txId);
    // } else {
    //   const errorMsg = await result.text();
    //   throw new Error(errorMsg);
    // }
  }

  if (txResults.length > 0) console.log('Broadcasted transactions:');
  txResults.forEach(txId => {
    console.log(`${rpcClient.url}/extended/v1/tx/0x${txId}`);
  });
};

run()
  .then(() => {
    console.log('Finished successfully.');
    process.exit();
  })
  .catch(error => {
    console.error('Error while running:');
    console.error(error);
    process.exit(1);
  });
  
// TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","target":"es2019"}' ts-node deploy-contracts.ts
import { readFile as readFileFn } from 'fs';
import { promisify } from 'util';
import { RPCClient } from '@stacks/rpc-client';
import {
  StacksTestnet
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
  // Traits
  { name: 'sip-010-trait-ft-standard', file: 'helpers/sip-010-trait-ft-standard' },
  { name: 'nft-trait', file: 'helpers/nft-trait' },
  { name: 'commission-trait', file: 'helpers/commission-trait' },
  { name: 'reserve-trait-v1', file: 'version-1/reserve-trait-v1' },
  { name: 'staking-trait-v1', file: 'version-1/staking-trait-v1' },
  { name: 'commission-trait-v1', file: 'version-1/commission-trait-v1' },
  { name: 'direct-helpers-trait-v1', file: 'version-2/direct-helpers-trait-v1' }, // can deploy
  { name: 'rewards-trait-v1', file: 'version-2/rewards-trait-v1' }, // can deploy
  { name: 'stacking-delegate-trait-v1', file: 'version-2/stacking-delegate-trait-v1' }, // can deploy
  { name: 'protocol-trait-v1', file: 'version-2/protocol-trait-v1' }, // can deploy

  // Contracts
  // Only needed for testnet
  { name: 'pox-3-mock', file: 'tests/pox-3-mock' },
  { name: 'pox-4-mock', file: 'tests/pox-4-mock' },

  { name: 'dao', file: 'core/dao' },
  { name: 'commission-v2', file: 'version-2/commission-v2' }, // needs pox-4
  { name: 'ststx-token', file: 'core/ststx-token' },
  { name: 'ststx-withdraw-nft', file: 'core/ststx-withdraw-nft' },
  { name: 'staking-v0', file: 'version-1/staking-v0' },
  { name: 'reserve-v1', file: 'version-1/reserve-v1' },

  { name: 'stacking-dao-core-v1', file: 'version-1/stacking-dao-core-v1' },
  { name: 'data-core-v1', file: 'version-2/data-core-v1' }, // needs pox-4
  { name: 'stacking-dao-core-v2', file: 'version-2/stacking-dao-core-v2' }, // needs pox-4

  { name: 'data-direct-stacking-v1', file: 'version-2/data-direct-stacking-v1' }, // can deploy
  { name: 'direct-helpers-v1', file: 'version-2/direct-helpers-v1' }, // can deploy
  { name: 'data-pools-v1', file: 'version-2/data-pools-v1' }, // can deploy
  { name: 'stacking-pool-v1', file: 'version-2/stacking-pool-v1' }, // needs pox-4
  { name: 'rewards-v1', file: 'version-2/rewards-v1' }, // needs pox-4
  { name: 'delegates-handler-v1', file: 'version-2/delegates-handler-v1' }, // needs pox-4????
  { name: 'strategy-v2', file: 'version-2/strategy-v2' }, // needs pox-4

  // DO NOT DEPLOY YET
  // { name: 'strategy-v3-algo-v1', file: 'version-2/strategy-v3-algo-v1' },
  // { name: 'strategy-v3-delegates-v1', file: 'version-2/strategy-v3-delegates-v1' },
  // { name: 'strategy-v3-pools-v1', file: 'version-2/strategy-v3-pools-v1' },
  // { name: 'strategy-v3', file: 'version-2/strategy-v3' },

  { name: 'stacking-delegate-1-1', file: 'version-2/stacking-delegate-1' }, // needs pox-4
  { name: 'stacking-delegate-1-2', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-1-3', file: 'version-2/stacking-delegate-1' },

  { name: 'stacking-delegate-2-1', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-2-2', file: 'version-2/stacking-delegate-1' },
  { name: 'stacking-delegate-2-3', file: 'version-2/stacking-delegate-1' }
];

const rpcClient = new RPCClient(process.env.API_SERVER || 'http://localhost:3999');
const privateKey = process.env.CONTRACT_PRIVATE_KEY;
if (!privateKey) {
  console.error('Provide a private key with `process.env.CONTRACT_PRIVATE_KEY`');
  process.exit(1);
}
const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Testnet);

const network = new StacksTestnet();
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
      fee: 100000,
      network: 'testnet',
      clarityVersion: ClarityVersion.Clarity2
    });

    const broadcast_id = await broadcastTransaction(tx, 'testnet');
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
  
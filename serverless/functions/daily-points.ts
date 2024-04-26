import { BlocksApi, InfoApi } from '@stacks/blockchain-api-client';
import * as db from '../lib/db';
import { processBlockEvents, processBlockTransactions } from '../lib/stacks/blocks';
import { userInfoAtBlock } from '../lib/stacks/user_info';
import { NewPointsRecord } from '@web/db/models';

const info = new InfoApi();
const blocks = new BlocksApi();

// export async function track(event: SNSEvent, _: Context): Promise<void> {
export async function updateDailyPoints(start_block: number, end_block?: number): Promise<void> {
  if (!end_block) {
    const core = await info.getCoreApiInfo();
    end_block = core.stacks_tip_height;
  }

  for (let block_height = start_block; block_height < end_block; block_height++) {
    const block = await blocks.getBlockByHeight({ height: block_height });

    const result = await Promise.all([processBlockEvents(block), processBlockTransactions(block)]);
    const addresses = [...new Set(result.flat())];

    const points: NewPointsRecord[] = [];
    for (const address of addresses) {
      const balances = await userInfoAtBlock(address, block_height);

      if (balances.ststx_balance > 0)
        points.push({
          wallet: address,
          source: 'ststx',
          amount: balances.ststx_balance.toString(),
          block: block.hash,
          multiplier: 1,
        });

      if (balances.bitflow > 0)
        points.push({
          wallet: address,
          source: 'bitflow',
          amount: balances.bitflow.toString(),
          block: block.hash,
          multiplier: 2.5,
        });

      if (balances.arkadiko > 0)
        points.push({
          wallet: address,
          source: 'arkadiko',
          amount: balances.bitflow.toString(),
          block: block.hash,
          multiplier: 1.5,
        });

      if (balances.velar > 0)
        points.push({
          wallet: address,
          source: 'velar',
          amount: balances.bitflow.toString(),
          block: block.hash,
          multiplier: 1.5,
        });

      if (balances.hermetica > 0)
        points.push({
          wallet: address,
          source: 'hermetica',
          amount: balances.bitflow.toString(),
          block: block.hash,
          multiplier: 1.5,
        });
    }
  }
}

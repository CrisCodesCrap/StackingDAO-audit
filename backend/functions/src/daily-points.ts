import { BlocksApi, InfoApi } from '@stacks/blockchain-api-client';
import { processBlockEvents, processBlockTransactions } from '@repo/stacks/src/blocks';
import { userInfoAtBlock } from '@repo/stacks/src/user_info';
import { NewPointsRecord } from '@repo/database/src/models';

const info = new InfoApi();
const blocks = new BlocksApi();

// export async function track(event: SNSEvent, _: Context): Promise<void> {
export async function updateDailyPoints(start_block: number, end_block?: number): Promise<void> {
  if (!end_block) {
    const core = await info.getCoreApiInfo();
    end_block = core.stacks_tip_height;
  }

  // TODO: add fallback if block can't be found -> if no block ignore and continue

  for (let block_height = start_block; block_height < end_block; block_height++) {
    const block = await blocks.getBlockByHeight({ height: block_height });

    const result = await Promise.all([processBlockEvents(block), processBlockTransactions(block)]);
    const addresses = [...new Set(result.flat())];
  }

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
          amount: balances.arkadiko.toString(),
          block: block.hash,
          multiplier: 1.5,
        });

      if (balances.velar > 0)
        points.push({
          wallet: address,
          source: 'velar',
          amount: balances.velar.toString(),
          block: block.hash,
          multiplier: 1.5,
        });

      if (balances.hermetica > 0)
        points.push({
          wallet: address,
          source: 'hermetica',
          amount: balances.hermetica.toString(),
          block: block.hash,
          multiplier: 1.5,
        });
    }

    // TODO: add addresses that haven't performed an action between these two blocks to also be updated daily
    //       by looking at db for wallets with no points earned
}

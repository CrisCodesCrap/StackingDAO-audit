require('dotenv').config();
const wrappers = require('./wrappers');



async function run() {

  // 1. Deposits

  // 2. Run strategy

  const hasPreparedPools = await wrappers.strategyHasPreparedPools();
  console.log("hasPreparedPools", hasPreparedPools);

  // TODO: just check based on block height..
  const canPrepareResult = await wrappers.strategyCanPrepare();
  console.log("canPrepareResult", canPrepareResult);

  // 3. Prepare pool

  // 4. Check data

  // 5. Deposit + Run strategy + Prepare pool

  // 6. Check data

  // 7. Withdraw + Run strategy + Prepare pool

  // 8. Check data

}

run();
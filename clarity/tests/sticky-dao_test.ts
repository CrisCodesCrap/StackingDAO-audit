import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "./helpers/sticky-tests-utils.ts";

import { StickyDAO } from './helpers/sticky-dao-helpers.ts';
import { StickyReserve } from './helpers/sticky-reserve-helpers.ts';

//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "DAO: enable/disable contracts",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyDao = new StickyDAO(chain, deployer);
    let stickyReserve = new StickyReserve(chain, deployer);

    // Protocol is active
    let call = await stickyDao.getContractsEnabled();
    call.result.expectBool(true);

    let result = await stickyDao.checkIsEnabled(wallet_1);
    result.expectOk().expectBool(true);

    // Set protocol is inactive
    result = await stickyDao.setContractsEnabled(deployer, false);
    result.expectOk().expectBool(true);

    call = await stickyDao.getContractsEnabled();
    call.result.expectBool(false);

    result = await stickyDao.checkIsEnabled(wallet_1);
    result.expectErr().expectUint(20002);

    // Can not call method
    result = await stickyReserve.requestStxToStack(deployer, 10);
    result.expectErr().expectUint(20002);

    // Set protocol is active again
    result = await stickyDao.setContractsEnabled(deployer, true);
    result.expectOk().expectBool(true);

    call = await stickyDao.getContractsEnabled();
    call.result.expectBool(true);

    result = await stickyDao.checkIsEnabled(wallet_1);
    result.expectOk().expectBool(true);
  }
});

Clarinet.test({
  name: "DAO: add or update protocol contracts",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyDao = new StickyDAO(chain, deployer);

    // Check active contracts
    let call = await stickyDao.getContractActive(qualifiedName("sticky-reserve-v1"));
    call.result.expectBool(true);

    call = await stickyDao.getContractActive(qualifiedName("new-contract"));
    call.result.expectBool(false);

    let result = await stickyDao.checkIsProtocol(deployer, qualifiedName("sticky-reserve-v1"));
    result.expectOk().expectBool(true);

    result = await stickyDao.checkIsProtocol(deployer, qualifiedName("new-contract"));
    result.expectErr().expectUint(20003);

    // Deactivate contract
    result = await stickyDao.setContractActive(deployer, qualifiedName("sticky-reserve-v1"), false);
    result.expectOk().expectBool(true);

    // Activate contract
    result = await stickyDao.setContractActive(deployer, qualifiedName("new-contract"), true);
    result.expectOk().expectBool(true);

    // Check
    result = await stickyDao.checkIsProtocol(deployer, qualifiedName("sticky-reserve-v1"));
    result.expectErr().expectUint(20003);

    result = await stickyDao.checkIsProtocol(deployer, qualifiedName("new-contract"));
    result.expectOk().expectBool(true);
  }
});

Clarinet.test({
  name: "DAO: add or update protocol managers",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyDao = new StickyDAO(chain, deployer);

    // Check active guardian
    let call = await stickyDao.getContractActive(deployer.address);
    call.result.expectBool(true);

    call = await stickyDao.getContractActive(wallet_1.address);
    call.result.expectBool(false);

    let result = await stickyDao.checkIsProtocol(deployer, deployer.address);
    result.expectOk().expectBool(true);

    result = await stickyDao.checkIsProtocol(deployer, wallet_1.address);
    result.expectErr().expectUint(20003);

    // Activate new guardian
    result = await stickyDao.setContractActive(deployer, wallet_1.address, true);
    result.expectOk().expectBool(true);

    // Deactivate guardian
    result = await stickyDao.setContractActive(deployer, deployer.address, false);
    result.expectOk().expectBool(true);

    // Check
    result = await stickyDao.checkIsProtocol(deployer, deployer.address);
    result.expectErr().expectUint(20003);

    result = await stickyDao.checkIsProtocol(deployer, wallet_1.address);
    result.expectOk().expectBool(true);
  }
});

//-------------------------------------
// Access 
//-------------------------------------

Clarinet.test({
  name: "DAO: only protocol can enable/disable contracts",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyDao = new StickyDAO(chain, deployer);

    let result = await stickyDao.setContractsEnabled(wallet_1, false);
    result.expectErr().expectUint(20003);
  }
});

Clarinet.test({
  name: "DAO: only protocol can set contracts",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyDao = new StickyDAO(chain, deployer);

    let result = await stickyDao.setContractActive(wallet_1, wallet_1.address, true);
    result.expectErr().expectUint(20003);
  }
});

# StackingDAO Engagement

## General Information:

**Timeline:**

May 11th - June 5th, 2024

**Repository:**

[https://github.com/StackingDAO/StackingDAO](https://github.com/StackingDAO/StackingDAO)

**Past Audits:**

[StackingDAO Audit 03-2024 (1).pdf](StackingDAO%20Engagement%201fc7edb9be1248c29d487f0b3cb7209c/StackingDAO_Audit_03-2024_(1).pdf)

[StakingDao Strategy v3 Audit.pdf](StackingDAO%20Engagement%201fc7edb9be1248c29d487f0b3cb7209c/StakingDao_Strategy_v3_Audit.pdf)

**Remarks:**

Once a finding is in remediation, please mark it *In Remediation*, on the table *Status* column.

If you do not plan on fixing a certain finding, please mark it *Acknowledged*.

Please leave any remarks or clarifications on a specific finding as comments on the finding page.

Each finding should be fixed in a separate commit. 

Once remediated, please fill the *Fix Commit* column with the commit link.

## Scope

**Commit:** c0d8386409ec70dda694e79b279e23dd2a48b8c0

[https://github.com/StackingDAO/StackingDAO/tree/nf/coinfabrik-audit-2-fixes](https://github.com/StackingDAO/StackingDAO/tree/nf/coinfabrik-audit-2-fixes)

```markdown

----------------------------------------------------------------------------------
*lines*: 312

/core/dao ✅ 💅🏻
/core/ststx-token ✅ 🚧 🕵️ 💅🏻
/core/ststx-withdraw-nft ✅ 🚧 🕵️ 💅🏻 :REENTRANCY: :MEV:
----------------------------------------------------------------------------------

----------------------------------------------------------------------------------
*lines:* -
/version-1/commission-trait-v1 ✅
/version-1/reserve-trait-v1 ✅
/version-1/reserve-v1 ✅ 🚧 🕵️ 💅🏻
----------------------------------------------------------------------------------


/version-2/commission-v2
/version-2/data-core-v1
/version-2/data-direct-stacking-v1
/version-2/data-pools-v1
/version-2/delegates-handler-v1
/version-2/direct-helpers-trait-v1
/version-2/direct-helpers-v1
/version-2/protocol-arkadiko-v1
/version-2/rewards-trait-v1
/version-2/rewards-v1
/version-2/stacking-dao-core-v2
/version-2/stacking-delegate-1
/version-2/stacking-delegate-trait-v1
/version-2/stacking-pool-payout-v1
/version-2/stacking-pool-signer-v1
/version-2/stacking-pool-v1
/version-2/strategy-v2
/version-2/strategy-v3-algo-v1
/version-2/strategy-v3-delegates-v1
/version-2/strategy-v3-pools-v1
/version-2/strategy-v3

/version-3/sdao-token
/version-3/staking-v1

----------------------------------------------------------------------------------
Language                        files          blank        comment           code
----------------------------------------------------------------------------------
Clarity                            37            921            940           3549
```

## [Notion Page](https://kris-apostolov.notion.site/StackingDAO-Engagement-1fc7edb9be1248c29d487f0b3cb7209c)



### Glosary:

```markdown
DONE: ✅
NOT DONE: ❌
IN PROGRESS: 🚧
QA: 💅🏻
FINDINGS: 🐞
PoC: 🛠
LEADS: 🕵️
```

```markdown
:MEV:
:REENTRANCY:
:OVERFLOW:
:REQUIRE:
:PRECISION:
:AUTH:
:BUSINESS-LOGIC:
```
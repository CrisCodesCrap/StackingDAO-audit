

(use-trait commission-trait .commission-trait-v1.commission-trait)
(use-trait staking-trait .staking-trait-v1.staking-trait)

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_ADD_REWARDS u26001)

;;-------------------------------------
;; Getters
;;-------------------------------------

;; Can only add rewards in last X blocks of cycle
(define-public (can-add-rewards)
  (let (
    (current-cycle (contract-call? .pox-3-mock current-pox-reward-cycle))
    (start-block-current-cycle (contract-call? .pox-3-mock reward-cycle-to-burn-height current-cycle))
    (cycle-length (get reward-cycle-length (unwrap-panic (contract-call? .pox-3-mock get-pox-info))))
  )
    (if (> burn-block-height (- (+ start-block-current-cycle cycle-length) (contract-call? .stacking-dao-data-pools-v1 get-next-cycle-withdraw-blocks)))
      (ok true)
      (ok false)
    )
  )
)

;;-------------------------------------
;; Add rewards
;;-------------------------------------

;; Add rewards in STX for given cycle.
;; The stacking rewards will be swapped to STX and added via this method.
;; Stacking rewards management is a manual process.
(define-public (add-rewards 
  (commission-contract <commission-trait>) 
  (staking-contract <staking-trait>) 
  (reserve principal) 
  (stx-amount uint) 
)
  (let (
    (commission (contract-call? .stacking-dao-data-pools-v1 get-pool-commission tx-sender))
    (commission-amount (/ (* stx-amount commission) u10000))
    (rewards-left (- stx-amount commission-amount))
  )
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol reserve))
    (try! (contract-call? .dao check-is-protocol (contract-of commission-contract)))
    (try! (contract-call? .dao check-is-protocol (contract-of staking-contract)))
    (asserts! (unwrap-panic (can-add-rewards)) (err ERR_ADD_REWARDS))

    (try! (contract-call? .stacking-dao-data-core-v1 cycle-info-add-rewards stx-amount))
    (try! (contract-call? .stacking-dao-data-core-v1 cycle-info-add-commission commission-amount))

    (if (> commission-amount u0)
      (try! (contract-call? commission-contract add-commission staking-contract commission-amount))
      u0
    )
    (try! (stx-transfer? rewards-left tx-sender reserve))

    (ok stx-amount)
  )
)

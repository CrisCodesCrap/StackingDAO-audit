

(use-trait commission-trait .commission-trait-v1.commission-trait)
(use-trait staking-trait .staking-trait-v1.staking-trait)

;;-------------------------------------
;; Maps
;;-------------------------------------

;; TODO: pool just keeps commission?
;; TODO: commission depending on who adds rewards - keep map

(define-data-var commission uint u500) ;; 5% in basis points

;;-------------------------------------
;; Getters
;;-------------------------------------

;; TODO

;;-------------------------------------
;; Add rewards
;;-------------------------------------

;; TODO: can only add rewards in last X blocks of cycle
;; And in first X blocks of cycle? -> need to take this into account in core (withdrawals)

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
    ;; (current-cycle-info (get-cycle-info cycle-id))
    (commission-amount (/ (* stx-amount (var-get commission)) u10000))
    (rewards-left (- stx-amount commission-amount))
  )
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol reserve))
    (try! (contract-call? .dao check-is-protocol (contract-of commission-contract)))
    (try! (contract-call? .dao check-is-protocol (contract-of staking-contract)))

    ;; Update cycle info
    (try! (contract-call? .stacking-dao-data-v1 cycle-info-add-rewards stx-amount))

    (if (> commission-amount u0)
      (try! (contract-call? commission-contract add-commission staking-contract commission-amount))
      u0
    )
    (try! (stx-transfer? rewards-left tx-sender reserve))

    (ok stx-amount)
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

;; TODO

;;-------------------------------------
;; Init
;;-------------------------------------

;; TODO

;; @contract Stacking Strategy
;; @version 3
;;

(use-trait stacking-delegate-trait .stacking-delegate-trait-v1.stacking-delegate-trait)
(use-trait reserve-trait .reserve-trait-v1.reserve-trait)

    ;;  inflow: (>= (get inflow new-amounts) u0),
    ;;     outflow: (> (get outflow new-amounts) u0),
    ;;     amounts: target-reach
    ;;         { pool: pool, stacking-amount: stacking-amount }




(define-map prepare-pools-data
  principal
  {
    stacking-amount: uint,
    last-updated-burn-height: uint
  }
)

(define-map prepare-delegates-data
  principal
  {
    stacking-amount: uint,
    last-updated-burn-height: uint
  }
)


(define-read-only (get-prepare-pools-data (pool principal))
  (default-to
    {
      stacking-amount: u0,
      last-updated-burn-height: u0
    }
    (map-get? prepare-pools-data pool)
  )
)


(define-read-only (get-prepare-delegates-data (delegate principal))
  (default-to
    {
      stacking-amount: u0,
      last-updated-burn-height: u0
    }
    (map-get? prepare-delegates-data delegate)
  )
)




(define-public (prepare-pools)
  (let (
    (stacking-per-pool (contract-call? .strategy-v3-pools-v1 calculate-stacking-per-pool))
  )

    ;; TODO: check errors
    (map map-pool-stacking-amount stacking-per-pool)

    (ok true)
  )
)

(define-private (map-pool-stacking-amount (info { pool: principal, stacking-amount: uint }))
  ;; TODO: print info
  (map-set prepare-pools-data (get pool info) { stacking-amount: (get stacking-amount info), last-updated-burn-height: burn-block-height })
)





(define-public (prepare-delegates (pool principal))
  (let (
    (pool-info (get-prepare-pools-data pool))
    (stacking-per-delegate (contract-call? .strategy-v3-delegates-v1 calculate-stacking-per-delegate pool (get stacking-amount pool-info)))
  )
    ;; TODO: check errors
    (map map-delegate-stacking-amount stacking-per-delegate)

    (ok true)
  )
)

(define-private (map-delegate-stacking-amount (info { delegate: principal, stacking-amount: uint }))
  ;; TODO: print info
  (map-set prepare-delegates-data (get delegate info) { stacking-amount: (get stacking-amount info), last-updated-burn-height: burn-block-height })
)



;; 1) Save pool calculations
;; 2) For each pool, save delegate amoutns
;; 3) For each pool, execute


;;-------------------------------------
;; 3) Execute
;;-------------------------------------

(define-public (execute (pool principal) (delegates (list 30 <stacking-delegate-trait>)))
  (let (

    ;; TODO: check delegates correct (loop over both lists and check if same contract)

    (helper-result (map perform-pool-delegation-helper delegates (list-30-principal pool) (list-30-uint (get-next-cycle-start-burn-height))))
    (helper-errors (filter is-error helper-result))
    (helper-error (element-at? helper-errors u0))
  )
    (asserts! (is-eq helper-error none) (unwrap-panic helper-error))
    (ok true)
  )
)

(define-private (perform-pool-delegation-helper (delegate <stacking-delegate-trait>) (delegate-to principal) (until-burn-ht uint))
  (let (
    (delegate-info (get-prepare-delegates-data (contract-of delegate)))
    (amount (get stacking-amount delegate-info))
  )
    (if (is-eq amount u0)
      (contract-call? delegate revoke .reserve-v1)
      (contract-call? delegate revoke-and-delegate .reserve-v1 amount delegate-to until-burn-ht)
    )
  )
)


;;-------------------------------------
;; PoX info 
;;-------------------------------------

(define-read-only (get-pox-cycle)
  ;; TODO: update for mainnet
  (contract-call? .pox-4-mock current-pox-reward-cycle)
)

(define-read-only (get-next-cycle-start-burn-height)
  ;; TODO: update for mainnet
  (contract-call? .pox-4-mock reward-cycle-to-burn-height (+ (get-pox-cycle) u1))
)


;;-------------------------------------
;; Helpers
;;-------------------------------------

(define-read-only (is-error (response (response bool uint)))
  (is-err response)
)

(define-read-only (list-30-uint (item uint)) 
  (list item item item item item item item item item item item item item item item item item item item item item item item item item item item item item item)
)

(define-read-only (list-30-principal (item principal)) 
  (list item item item item item item item item item item item item item item item item item item item item item item item item item item item item item item)
)

;; @contract Stacking Strategy
;; @version 3
;;

(use-trait stacking-delegate-trait .stacking-delegate-trait-v1.stacking-delegate-trait)
(use-trait reserve-trait .reserve-trait-v1.reserve-trait)
(use-trait rewards-trait .rewards-trait-v1.rewards-trait)

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_WRONG_DELEGATE_TRAIT u31001)
(define-constant ERR_CAN_NOT_PREPARE u31002)
(define-constant ERR_NOT_PREPARED_YET u31003)
(define-constant ERR_HAS_ALREADY_PREPARED u31004)
(define-constant ERR_HAS_EXECUTED u31005)

;;-------------------------------------
;; Variables 
;;-------------------------------------

(define-data-var cycle-prepared-pools uint u0)

;;-------------------------------------
;; Maps
;;-------------------------------------

(define-map prepare-pools-data
  principal
  {
    stacking-amount: uint,

    cycle-prepared-pool: uint,
    cycle-prepared-delegates: uint,
    cycle-executed-pool: uint
  }
)

(define-map prepare-delegates-data
  principal
  {
    stacking-amount: uint,
  }
)

;;-------------------------------------
;; Getters
;;-------------------------------------

(define-read-only (get-cycle-prepared-pools)
  (var-get cycle-prepared-pools)
)

(define-read-only (get-prepare-pools-data (pool principal))
  (default-to
    {
      stacking-amount: u0,
      cycle-prepared-pool: u0,
      cycle-prepared-delegates: u0,
      cycle-executed-pool: u0
    }
    (map-get? prepare-pools-data pool)
  )
)

(define-read-only (get-prepare-delegates-data (delegate principal))
  (default-to
    {
      stacking-amount: u0,
    }
    (map-get? prepare-delegates-data delegate)
  )
)

(define-read-only (can-prepare) 
  (let (
    ;; TODO: update for mainnet
    (start-block-next-cycle (contract-call? .pox-4-mock reward-cycle-to-burn-height (+ (get-pox-cycle) u1)))
    (withdrawal-offset (contract-call? .data-core-v1 get-cycle-withdraw-offset))
  )
    (> burn-block-height (- start-block-next-cycle withdrawal-offset))
  )
)

(define-read-only (has-prepared-pools) 
  (>= (get-cycle-prepared-pools) (get-pox-cycle))
)

(define-read-only (has-prepared-delegates (pool principal)) 
  (>= (get cycle-prepared-delegates (get-prepare-pools-data pool)) (get-pox-cycle))
)

(define-read-only (has-executed-pool (pool principal)) 
  (>= (get cycle-executed-pool (get-prepare-pools-data pool)) (get-pox-cycle))
)


;;-------------------------------------
;; Step 1: prepare pools
;;-------------------------------------

(define-public (prepare-pools)
  (let (
    (stacking-per-pool (contract-call? .strategy-v3-pools-v1 calculate-stacking-per-pool))
  )
    (asserts! (can-prepare) (err ERR_CAN_NOT_PREPARE))
    (asserts! (not (has-prepared-pools)) (err ERR_HAS_ALREADY_PREPARED))

    (map map-pool-stacking-amount stacking-per-pool)

    (var-set cycle-prepared-pools (get-pox-cycle))

    (ok true)
  )
)

(define-private (map-pool-stacking-amount (info { pool: principal, stacking-amount: uint }))
  (begin
    (print { action: "map-pool-stacking-amount", pool: (get pool info), stacking-amount: (get stacking-amount info), prepare-burn-height: burn-block-height, block-height: block-height })
    (map-set prepare-pools-data (get pool info) (merge (get-prepare-pools-data (get pool info)) { stacking-amount: (get stacking-amount info), cycle-prepared-pool: (get-pox-cycle) }))
  )
)

;;-------------------------------------
;; Step 2: prepare pool delegates
;;-------------------------------------

(define-public (prepare-delegates (pool principal))
  (let (
    (pool-info (get-prepare-pools-data pool))
    (stacking-per-delegate (contract-call? .strategy-v3-delegates-v1 calculate-stacking-per-delegate pool (get stacking-amount pool-info)))
  )
    (asserts! (can-prepare) (err ERR_CAN_NOT_PREPARE))
    (asserts! (has-prepared-pools) (err ERR_NOT_PREPARED_YET))
    (asserts! (not (has-prepared-delegates pool)) (err ERR_HAS_ALREADY_PREPARED))

    (map map-delegate-stacking-amount stacking-per-delegate)

    (map-set prepare-pools-data pool (merge (get-prepare-pools-data pool) { cycle-prepared-delegates: (get-pox-cycle) }))

    (ok true)
  )
)

(define-private (map-delegate-stacking-amount (info { delegate: principal, stacking-amount: uint }))
  (begin
    (print { action: "map-delegate-stacking-amount", pool: (get delegate info), stacking-amount: (get stacking-amount info), block-height: block-height })
    (map-set prepare-delegates-data (get delegate info) { stacking-amount: (get stacking-amount info) })
  )
)

;;-------------------------------------
;; Step 3: execute stacking for  pool
;;-------------------------------------

(define-public (execute (pool principal) (delegates (list 30 <stacking-delegate-trait>)) (reserve <reserve-trait>) (rewards-contract <rewards-trait>))
  (let (
    (saved-delegates (contract-call? .data-pools-v1 get-pool-delegates pool))
    (compare-errors (filter not (map compare-delegates saved-delegates delegates)))

    (helper-result (map perform-pool-delegation-helper delegates (list-30-principal pool) (list-30-uint (get-next-cycle-start-burn-height)) (list-30-reserve-trait reserve) (list-30-rewards-trait rewards-contract)))
    (helper-errors (filter is-error helper-result))
    (helper-error (element-at? helper-errors u0))
  )
    (asserts! (can-prepare) (err ERR_CAN_NOT_PREPARE))
    (asserts! (has-prepared-delegates pool) (err ERR_NOT_PREPARED_YET))
    (asserts! (not (has-executed-pool pool)) (err ERR_HAS_EXECUTED))

    (asserts! (is-eq (len compare-errors) u0) (err ERR_WRONG_DELEGATE_TRAIT))
    (asserts! (is-eq helper-error none) (unwrap-panic helper-error))

    (map-set prepare-pools-data pool (merge (get-prepare-pools-data pool) { cycle-executed-pool: (get-pox-cycle) }))

    (ok true)
  )
)

(define-read-only (compare-delegates (saved-delegate principal) (delegate <stacking-delegate-trait>))
  (is-eq saved-delegate (contract-of delegate))
)

(define-private (perform-pool-delegation-helper (delegate <stacking-delegate-trait>) (delegate-to principal) (until-burn-ht uint) (reserve <reserve-trait>) (rewards-contract <rewards-trait>))
  (let (
    (delegate-info (get-prepare-delegates-data (contract-of delegate)))
    (amount (get stacking-amount delegate-info))
  )
    (print { action: "perform-pool-delegation-helper", pool: delegate-to, delegate: delegate, amount: amount, block-height: block-height })

    (if (is-eq amount u0)
      (contract-call? .stacking-delegates-v1 revoke delegate reserve rewards-contract)
      (contract-call? .stacking-delegates-v1 revoke-and-delegate delegate reserve rewards-contract amount delegate-to until-burn-ht)
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

(define-read-only (list-30-reserve-trait (item <reserve-trait>)) 
  (list item item item item item item item item item item item item item item item item item item item item item item item item item item item item item item)
)

(define-read-only (list-30-rewards-trait (item <rewards-trait>)) 
  (list item item item item item item item item item item item item item item item item item item item item item item item item item item item item item item)
)


;; @contract Strategy v2
;; @version 1

(use-trait stacking-delegate-trait .stacking-delegate-trait-v1.stacking-delegate-trait)

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_NO_OUTFLOW_DELEGATE u25001)
(define-constant ERR_DELEGATE_TRAIT u25002)

;;-------------------------------------
;; Variables
;;-------------------------------------

;; Temporary vars for outflow calculation
(define-data-var outflow-delegate (optional principal) none)
(define-data-var outflow-diff uint u0)

;;-------------------------------------
;; Maps
;;-------------------------------------

;; Temporary map for inflow calculation
(define-map inflow-delegate-amount principal uint)
(define-map inflow-delegate-pool principal principal)

;;-------------------------------------
;; Getters
;;-------------------------------------

(define-read-only (get-outflow-delegate)
  (var-get outflow-delegate)
)

(define-read-only (get-outflow-diff)
  (var-get outflow-diff)
)

(define-read-only (get-inflow-delegate-amount (delegate principal))
  (default-to
    u0
    (map-get? inflow-delegate-amount delegate)
  )
)

(define-read-only (get-inflow-delegate-pool (delegate principal))
  (map-get? inflow-delegate-pool delegate)
)

(define-read-only (get-stx-account (account principal))
  ;; TODO: update for mainnet
  (contract-call? .pox-3-mock stx-account-mock account)
  ;; (stx-account account)
)

;;-------------------------------------
;; Perform
;;-------------------------------------

;; TODO: needs to be called by keeper job
(define-public (perform (delegate-traits (list 900 <stacking-delegate-trait>)))
  (let (
    (outflow-inflow (get-outflow-inflow))
  )
    (if (>= (get inflow outflow-inflow) u0)
      (perform-inflow (get inflow outflow-inflow) delegate-traits)
      (perform-outflow (get outflow outflow-inflow) delegate-traits)
    )
  )
)

;; TODO: admin should be able to call private methods (in case something goes wrong)

;;-------------------------------------
;; Perform - Outflow
;;-------------------------------------

(define-read-only (is-outflow-delegate-trait (delegate-trait <stacking-delegate-trait>)) 
  (is-eq (unwrap-panic (get-outflow-delegate)) (contract-of delegate-trait))
)

;; TODO: what if outflow is > largest delegation balance?

(define-private (perform-outflow (outflow uint) (delegate-traits (list 900 <stacking-delegate-trait>)))
  (begin
    ;; Calculate first
    (unwrap-panic (calculate-outflow outflow))

    ;; Perform
    (if (is-none (get-outflow-delegate))
      (err ERR_NO_OUTFLOW_DELEGATE)

      (let (
        (outflow-delegate-traits (filter is-outflow-delegate-trait delegate-traits))
        (outflow-delegate-trait (unwrap! (element-at? outflow-delegate-traits u0) (err ERR_DELEGATE_TRAIT)))
      )
        (try! (contract-call? outflow-delegate-trait revoke-delegate-stx))

        (ok true)
      )
    )
  )
)


(define-public (calculate-outflow (outflow uint))
  (let (
    (outflow-list (list-30-uint outflow))
    (active-pools (contract-call? .stacking-dao-data-pools-v1 get-active-pools))
  )
    ;; TODO: only protocol can call this function

    ;; Reset temp vars
    (var-set outflow-diff (pow u2 u125))
    (var-set outflow-delegate none)

    ;; TODO: check for errors (see pool)
    (map calculate-outflow-pool active-pools outflow-list)

    (print { action: "calculate-outflow", data: { outflow-delegate: (get-outflow-delegate), outflow-diff: (get-outflow-delegate), block-height: block-height } })

    (ok true)
  )
)

(define-public (calculate-outflow-pool (pool principal) (outflow uint))
  (let (
    (pool-list (list-30-principal pool))
    (outflow-list (list-30-uint outflow))
    (delegates (contract-call? .stacking-dao-data-pools-v1 get-pool-delegates pool))
  )
    ;; TODO: only protocol can call this function

    ;; TODO: check for errors
    (map calculate-outflow-delegate pool-list delegates outflow-list)

    (ok true)
  )
)

(define-public (calculate-outflow-delegate (pool principal) (delegate principal) (outflow uint))
  (let (
    (delegation-info (contract-call? .pox-3-mock get-check-delegation delegate))
    (delegation-amount (if (is-none delegation-info)
      u0
      (unwrap-panic (get amount-ustx delegation-info))
    ))
  )
    ;; TODO: only protocol can call this function

    ;; TODO: only perform outflow on pool with most funds?
    (if (> delegation-amount outflow)
      (let (
        (diff (- delegation-amount outflow))
      )
        (if (< diff (var-get outflow-diff))
          (begin
            (var-set outflow-delegate (some delegate))
            (var-set outflow-diff diff)
          )
          false
        )
        false
      )
      false
    )
    (ok true)
  )
)

;;-------------------------------------
;; Perform - Inflow
;;-------------------------------------

(define-private (clear-inflow-delegate-maps (delegate <stacking-delegate-trait>))
  (begin
    (map-delete inflow-delegate-amount (contract-of delegate))
    (map-delete inflow-delegate-pool (contract-of delegate))
  )
)

(define-private (perform-inflow (inflow uint) (delegate-traits (list 900 <stacking-delegate-trait>)))
  (begin
    ;; Calculate first
    (unwrap-panic (calculate-inflow inflow))

    ;; Perform
    ;; TODO: check for errors
    (map perform-inflow-helper delegate-traits)

    (ok true)
  )
)

;; Loop over every trait
;; For each delegate, find the pool and amount
(define-private (perform-inflow-helper (delegate <stacking-delegate-trait>))
  (let (
    (amount (get-inflow-delegate-amount (contract-of delegate)))
    (pool (get-inflow-delegate-pool (contract-of delegate)))
  )
    (if (and (> amount u0) (is-some pool))
      (begin
        (try! (contract-call? delegate revoke-delegate-stx))
        (try! (contract-call? delegate delegate-stx .reserve-v1 amount (unwrap-panic pool)))
        (ok true)
      )
      (ok false)
    )
  )
)

(define-public (calculate-inflow (inflow uint))
  (let (
    (current-stx-stacking (unwrap-panic (contract-call? .reserve-v1 get-stx-stacking)))
    (new-stx-stacking (+ current-stx-stacking inflow))
    (new-stx-stacking-list (list-30-uint new-stx-stacking))
    (active-pools (contract-call? .stacking-dao-data-pools-v1 get-active-pools))
  )
    ;; TODO: only protocol can call this function

    ;; TODO: check for errors
    (map calculate-inflow-pool active-pools new-stx-stacking-list)

    (ok true)
  )
)

(define-public (calculate-inflow-pool (pool principal) (new-stx-stacking uint))
  (let (
    (pool-list (list-30-principal pool))
    (total-stx-for-pool (/ (* new-stx-stacking (contract-call? .stacking-dao-data-pools-v1 get-pool-share pool)) u10000))
    (total-stx-for-pool-list (list-30-uint total-stx-for-pool))
    (delegates (contract-call? .stacking-dao-data-pools-v1 get-pool-delegates pool))
  )
    ;; TODO: only protocol can call this function

    ;; TODO: check for errors
    (map calculate-inflow-delegate delegates pool-list total-stx-for-pool-list)

    (ok true)
  )
)

(define-public (calculate-inflow-delegate (delegate principal) (pool principal) (total-stx-for-pool uint))
  (let (
    (delegate-share (contract-call? .stacking-dao-data-pools-v1 get-delegate-share delegate))
    (total-stx-for-delegate (/ (* total-stx-for-pool delegate-share) u10000))
  )
    ;; TODO: only protocol can call this function

    (map-set inflow-delegate-amount delegate total-stx-for-delegate)
    (map-set inflow-delegate-pool delegate pool)

    (print { action: "calculate-inflow-delegate", data: { pool: pool, delegate: delegate, stx-for-delegate: total-stx-for-delegate, block-height: block-height } })

    (ok true)
  )
)

;;-------------------------------------
;; Helpers
;;-------------------------------------

(define-read-only (list-30-uint (item uint)) 
  (list item item item item item item item item item item item item item item item item item item item item item item item item item item item item item item)
)

(define-read-only (list-30-principal (item principal)) 
  (list item item item item item item item item item item item item item item item item item item item item item item item item item item item item item item)
)

(define-read-only (get-outflow-inflow)
  (let (
    (total-withdrawals (unwrap-panic (contract-call? .reserve-v1 get-stx-for-withdrawals)))
    (total-idle (unwrap-panic (contract-call? .reserve-v1 get-stx-balance)))

    (outflow 
      (if (> total-withdrawals total-idle)
        (- total-withdrawals total-idle)
        u0
      )
    )

    (inflow 
      (if (> total-idle total-withdrawals )
        (- total-idle total-withdrawals )
        u0
      )
    )
  )
    { outflow: outflow, inflow: inflow }
  )
)

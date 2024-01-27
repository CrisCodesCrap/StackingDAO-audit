;; @contract Strategy v2
;; @version 1

;;-------------------------------------
;; Variables
;;-------------------------------------

;; Temporary vars for outflow
(define-data-var stop-delegate principal tx-sender)
(define-data-var stop-diff uint u0)
(define-data-var stop-pool-total uint u0)

;;-------------------------------------
;; Getters
;;-------------------------------------

(define-read-only (get-stx-account (account principal))
  ;; TODO: update for mainnet
  (contract-call? .pox-3-mock stx-account-mock account)
  ;; (stx-account account)
)

;;-------------------------------------
;; Perform
;;-------------------------------------

(define-public (perform)
  ;; TODO: this can be called on every deposit?
  ;; Or at least by keepers?

  (let (
    (outflow-inflow (get-outflow-inflow))
  )
    (if (>= (get inflow outflow-inflow) u0)
      (perform-inflow (get inflow outflow-inflow))
      (perform-outflow (get outflow outflow-inflow))
    )
  )
)

;;-------------------------------------
;; Perform - Outflow
;;-------------------------------------

;; TODO: what if outflow is > largest delegation balance?
(define-private (perform-outflow (outflow uint))
  (let (
    (outflow-list (list-30-uint outflow))
  )
    ;; TODO: check for errors
    (map perform-outflow-pool (contract-call? .stacking-dao-data-pools-v1 get-active-pools) outflow-list)

    ;; Now that stop-delegate is set
    ;; TODO: STOP delegate
    ;; (try! (contract-call? .stacking-delegate-1 revoke-delegate-stx))

    (ok true)
  )
)

(define-private (perform-outflow-pool (pool principal) (outflow uint))
  (let (
    (pool-list (list-30-principal pool))
    (outflow-list (list-30-uint outflow))
  )
    ;; TODO: check for errors
    (map perform-outflow-delegate pool-list (contract-call? .stacking-dao-data-pools-v1 get-pool-delegates pool) outflow-list)

    (ok true)
  )
)

(define-private (perform-outflow-delegate (pool principal) (delegate principal) (outflow uint))
  (let (
    (locked (get locked (get-stx-account delegate)))
  )
    ;; TODO: only perform outflow on pool with most funds?
    (if (> locked outflow)
      (let (
        (diff (- locked outflow))
      )
        (if (< diff (var-get stop-diff))
          (begin
            (var-set stop-delegate delegate)
            (var-set stop-diff diff)
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

(define-private (perform-inflow (inflow uint))
  (let (
    (current-stx-stacking (unwrap-panic (contract-call? .reserve-v1 get-stx-stacking)))
    (new-stx-stacking (+ current-stx-stacking inflow))
    (new-stx-stacking-list (list-30-uint new-stx-stacking))
  )
    ;; TODO: check for errors
    (map perform-inflow-pool (contract-call? .stacking-dao-data-pools-v1 get-active-pools) new-stx-stacking-list)

    (ok true)
  )
)

(define-private (perform-inflow-pool (pool principal) (new-stx-stacking uint))
  (let (
    (pool-list (list-30-principal pool))
    (total-stx-for-pool (/ (* new-stx-stacking (contract-call? .stacking-dao-data-pools-v1 get-pool-share pool)) u10000))
    (total-stx-for-pool-list (list-30-uint total-stx-for-pool))

  )
    ;; TODO: check for errors
    (map perform-inflow-delegate (contract-call? .stacking-dao-data-pools-v1 get-pool-delegates pool) pool-list total-stx-for-pool-list)

    (ok true)
  )
)

(define-private (perform-inflow-delegate (delegate principal) (pool principal) (total-stx-for-pool uint))
  (let (
    (total-stx-for-delegate (/ (* total-stx-for-pool (contract-call? .stacking-dao-data-pools-v1 get-delegate-share delegate)) u10000))
  )
    ;; TODO: correct contract (need delegate trait)
    (try! (contract-call? .stacking-delegate-1 revoke-delegate-stx))
    (try! (contract-call? .stacking-delegate-1 delegate-stx .reserve-v1 total-stx-for-delegate pool))

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

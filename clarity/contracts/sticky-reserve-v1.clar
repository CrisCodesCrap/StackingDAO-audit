;; @contract Sticky Reserve
;; @version 1

(impl-trait .sticky-reserve-trait-v1.sticky-reserve-trait)

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_SHUTDOWN u17002)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var stx-in-use uint u0)
(define-data-var shutdown-enabled bool false)

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-stx-in-use)
  (ok (var-get stx-in-use))
)

(define-read-only (get-stx-idle)
  (ok (stx-get-balance (as-contract tx-sender)))
)

(define-read-only (get-total-stx)
  (ok (+ (unwrap-panic (get-stx-idle)) (unwrap-panic (get-stx-in-use))))
)

(define-read-only (get-shutdown-enabled)
  (var-get shutdown-enabled)
)

;;-------------------------------------
;; Get STX 
;;-------------------------------------

(define-public (request-stx (requested-stx uint) (receiver principal))
  (begin
    (try! (contract-call? .sticky-dao check-is-contract-active contract-caller))
    (try! (contract-call? .sticky-dao check-is-enabled))
    (asserts! (not (get-shutdown-enabled)) (err ERR_SHUTDOWN))

    (try! (as-contract (stx-transfer? requested-stx tx-sender receiver)))
    (ok requested-stx)
  )
)

;;-------------------------------------
;; Stacking 
;;-------------------------------------

(define-public (request-stx-to-stack (requested-stx uint))
  (begin
    (try! (contract-call? .sticky-dao check-is-contract-active contract-caller))
    (try! (contract-call? .sticky-dao check-is-enabled))
    (asserts! (not (get-shutdown-enabled)) (err ERR_SHUTDOWN))

    (var-set stx-in-use (+ (unwrap-panic (get-stx-in-use)) requested-stx))
    (try! (as-contract (stx-transfer? requested-stx tx-sender contract-caller)))
    (ok requested-stx)
  )
)

(define-public (return-stx-from-stacking (stx-amount uint))
  (begin
    (try! (contract-call? .sticky-dao check-is-contract-active contract-caller))
    (try! (contract-call? .sticky-dao check-is-enabled))
    (asserts! (not (get-shutdown-enabled)) (err ERR_SHUTDOWN))

    (var-set stx-in-use (- (unwrap-panic (get-stx-in-use)) stx-amount))
    (try! (stx-transfer? stx-amount tx-sender (as-contract tx-sender)))
    (ok stx-amount)
  )
)

;;-------------------------------------
;; Admin 
;;-------------------------------------

(define-public (set-shutdown-enabled (enabled bool))
  (begin
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))
    
    (var-set shutdown-enabled enabled)
    (ok true)
  )
)

(define-public (get-stx (amount uint) (receiver principal))
  (begin
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))

    (try! (as-contract (stx-transfer? amount tx-sender receiver)))
    (ok amount)
  )
)

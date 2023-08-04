;; @contract Sticky Reserve
;; @version 1

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var stx-in-use uint u0)

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-stx-in-use)
  (var-get stx-in-use)
)

(define-read-only (get-stx-idle)
  (stx-get-balance (as-contract tx-sender))
)

(define-read-only (get-total-stx)
  (+ (get-stx-idle) (get-stx-in-use))
)

;;-------------------------------------
;; Get STX 
;;-------------------------------------

(define-public (request-stx (requested-stx uint) (receiver principal))
  (begin
    (try! (contract-call? .sticky-dao check-is-contract-active contract-caller))

    (as-contract (stx-transfer? requested-stx tx-sender receiver))
  )
)

;;-------------------------------------
;; Stacking 
;;-------------------------------------

(define-public (request-stx-to-stack (requested-stx uint))
  (begin
    (try! (contract-call? .sticky-dao check-is-contract-active contract-caller))

    (var-set stx-in-use (+ (get-stx-in-use) requested-stx))
    (as-contract (stx-transfer? requested-stx tx-sender contract-caller))
  )
)

(define-public (return-stx-from-stacking (stx-amount uint))
  (begin
    (var-set stx-in-use (- (get-stx-in-use) stx-amount))
    (stx-transfer? stx-amount tx-sender (as-contract tx-sender))
  )
)

;;-------------------------------------
;; Admin 
;;-------------------------------------

(define-public (get-stx (amount uint) (receiver principal))
  (begin
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))

    (as-contract (stx-transfer? amount tx-sender receiver))
  )
)

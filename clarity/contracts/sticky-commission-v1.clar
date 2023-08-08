;; @contract Sticky Commission
;; @version 1

(impl-trait .sticky-commission-trait-v1.sticky-commission-trait)
(use-trait sticky-staking-trait .sticky-staking-trait-v1.sticky-staking-trait)

;;-------------------------------------
;; Variables 
;;-------------------------------------

(define-data-var staking-percentage uint u8000) ;; 80% in basis points

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-staking-percentage)
  (var-get staking-percentage)
)

;;-------------------------------------
;; Trait 
;;-------------------------------------

(define-public (add-commission (staking-trait <sticky-staking-trait>) (stx-amount uint))
  (let (
    (amount-for-staking (/ (* stx-amount (get-staking-percentage)) u10000))
    (amount-to-keep (- stx-amount amount-for-staking))
  )
    (try! (contract-call? .sticky-dao check-is-protocol (contract-of staking-trait)))

    ;; Send to stakers
    (try! (contract-call? staking-trait add-rewards amount-for-staking))

    ;; Keep in contract
    (try! (stx-transfer? amount-to-keep tx-sender (as-contract tx-sender)))

    (ok stx-amount)
  )
)

;;-------------------------------------
;; Get commission 
;;-------------------------------------

(define-public (withdraw-commission)
  (let (
    (receiver tx-sender)
    (amount (stx-get-balance (as-contract tx-sender)))
  )
    (try! (contract-call? .sticky-dao check-is-protocol tx-sender))

    (try! (as-contract (stx-transfer? amount tx-sender receiver)))

    (ok amount)
  )
)

;;-------------------------------------
;; Admin 
;;-------------------------------------

(define-public (set-staking-percentage (new-percentage uint))
  (begin
    (try! (contract-call? .sticky-dao check-is-protocol tx-sender))
    
    (var-set staking-percentage new-percentage)
    (ok true)
  )
)

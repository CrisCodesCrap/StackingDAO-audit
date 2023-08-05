;; @contract Sticky Commission
;; @version 1

(impl-trait .sticky-commission-trait-v1.sticky-commission-trait)

;;-------------------------------------
;; Trait 
;;-------------------------------------

(define-public (add-commission (stx-amount uint))
  (begin
    (try! (stx-transfer? stx-amount tx-sender (as-contract tx-sender)))
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
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))

    (try! (as-contract (stx-transfer? amount tx-sender receiver)))

    (ok amount)
  )
)

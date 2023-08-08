;; @contract Sticky Core
;; @version 1

;;-------------------------------------
;; Handle tax 
;;-------------------------------------

;; Need to be called by keeper
(define-public (handle-tax)
  (let (
    (tax-amount (contract-call? .sticky-token get-tax-balance))
  )
    (if (> tax-amount u0)
      (begin
        (try! (contract-call? .sticky-token withdraw-tax (as-contract tx-sender)))
        ;; TODO: handle tax
        true
      )
      false
    )
    (ok tax-amount)
  )
)

;;-------------------------------------
;; Admin 
;;-------------------------------------

(define-public (retreive-tokens)
  (let (
    (balance (unwrap-panic (as-contract (contract-call? .sticky-token get-balance tx-sender))))
    (receiver tx-sender)
  )
    (try! (contract-call? .sticky-dao check-is-protocol tx-sender))

    (try! (as-contract (contract-call? .sticky-token transfer balance tx-sender receiver none)))
    (ok balance)
  )
)

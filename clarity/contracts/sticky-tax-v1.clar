;; @contract Sticky Core
;; @version 1

;;-------------------------------------
;; Handle tax 
;;-------------------------------------

(define-public (handle-tax)
  (let (
    (tax-amount (contract-call? .sticky-token get-tax-balance))
  )
    (if (> tax-amount u0)
      (begin
        (try! (contract-call? .sticky-token withdraw-tax))
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
    (balance (unwrap-panic (contract-call? .sticky-token get-balance (as-contract tx-sender))))
    (receiver contract-caller)
  )
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))

    (try! (as-contract (contract-call? .sticky-token transfer balance tx-sender receiver none)))
    (ok balance)
  )
)

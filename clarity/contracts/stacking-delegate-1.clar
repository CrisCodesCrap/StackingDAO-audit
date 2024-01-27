;; @contract Stacking Delegate Contract
;; @version 1

(impl-trait .stacking-delegate-trait-v1.stacking-delegate-trait)
(use-trait reserve-trait .reserve-trait-v1.reserve-trait)

;;-------------------------------------
;; Delegation 
;;-------------------------------------

(define-public (delegate-stx
    (reserve-contract <reserve-trait>)
    (amount-ustx uint)
    (delegate-to principal)
  )
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol (contract-of reserve-contract)))

    ;; Get STX tokens from reserve
    (try! (as-contract (contract-call? reserve-contract request-stx-to-stack amount-ustx)))

    ;; TODO: update for mainnet
    (match (as-contract (contract-call? .pox-3-mock delegate-stx amount-ustx delegate-to none none))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (revoke-delegate-stx)
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))
    (try! (contract-call? .dao check-is-enabled))

    ;; TODO: update for mainnet
    (match (as-contract (contract-call? .pox-3-mock revoke-delegate-stx))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

;;-------------------------------------
;; Admin 
;;-------------------------------------

;; Return STX to the STX reserve
(define-public (return-stx (reserve-contract <reserve-trait>))
  (let (
    (stx-amount (stx-get-balance (as-contract tx-sender)))
  )
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol (contract-of reserve-contract)))

    (if (> stx-amount u0)
      (try! (as-contract (contract-call? reserve-contract return-stx-from-stacking stx-amount)))
      u0
    )
    (ok stx-amount)
  )
)

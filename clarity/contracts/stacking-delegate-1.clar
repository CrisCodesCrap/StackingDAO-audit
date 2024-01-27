;; @contract Stacking Delegate Contract
;; @version 1

(impl-trait .stacking-delegate-trait-v1.stacking-delegate-trait)
(use-trait reserve-trait .reserve-trait-v1.reserve-trait)

;;-------------------------------------
;; PoX Helpers 
;;-------------------------------------

(define-read-only (get-stx-account (account principal))
  ;; TODO: update for mainnet
  (contract-call? .pox-3-mock stx-account-mock account)
  ;; (stx-account account)
)

;;-------------------------------------
;; Delegation 
;;-------------------------------------

(define-public (delegate-stx
    (reserve-contract <reserve-trait>)
    (amount-ustx uint)
    (delegate-to principal)
  )
  (let (
    (locked-amount (get locked (get-stx-account (as-contract tx-sender))))
    (contract-amount (stx-get-balance (as-contract tx-sender)))
    (extra-amount (if (> amount-ustx (+ locked-amount contract-amount))
      (- amount-ustx (+ locked-amount contract-amount))
      u0
    ))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol (contract-of reserve-contract)))

    (if (> extra-amount u0)
      (begin
        ;; Get extra STX tokens from reserve
        (try! (as-contract (contract-call? reserve-contract request-stx-to-stack extra-amount)))
        true
      )
      false
    )
    
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
    (delegation-info (contract-call? .pox-3-mock get-check-delegation (as-contract tx-sender)))
    (delegation-amount (if (is-none delegation-info)
      u0
      (unwrap-panic (get amount-ustx delegation-info))
    ))

    (locked-amount (get locked (get-stx-account (as-contract tx-sender))))
    (contract-amount (stx-get-balance (as-contract tx-sender)))

    (return-amount (if (> (+ locked-amount contract-amount) delegation-amount)
      (- (+ locked-amount contract-amount) delegation-amount)
      u0
    ))
  )
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol (contract-of reserve-contract)))

    (if (> return-amount u0)
      (try! (as-contract (contract-call? reserve-contract return-stx-from-stacking return-amount)))
      u0
    )
    (ok return-amount)
  )
)

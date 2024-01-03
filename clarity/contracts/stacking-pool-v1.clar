;; @contract Stacking pool for different stackers
;; @version 1

;;-------------------------------------
;; Stacking helpers 
;;-------------------------------------

(define-public (stack-aggregation-commit-indexed 
  (pox-address (tuple (version (buff 1)) (hashbytes (buff 32))))
  (reward-cycle uint)
)
  (begin 
    (try! (contract-call? .dao check-is-protocol tx-sender))
    (try! (contract-call? .dao check-is-enabled))

    (match (as-contract (contract-call? .pox-3-mock stack-aggregation-commit-indexed pox-address reward-cycle))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (delegate-stx (amount-ustx uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))
    (try! (contract-call? .dao check-is-enabled))

    (match (contract-call? .pox-3-mock delegate-stx amount-ustx (as-contract tx-sender) none none)
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (delegate-stack-stx 
  (amount-ustx uint)
  (pox-address (tuple (version (buff 1)) (hashbytes (buff 32))))
  (start-burn-height uint)
  (lock-period uint)
)
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))
    (try! (contract-call? .dao check-is-enabled))

    (match (as-contract (contract-call? .pox-3-mock delegate-stack-stx contract-caller amount-ustx pox-address start-burn-height lock-period))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (delegate-stack-increase 
  (increase-by uint)
  (pox-address (tuple (version (buff 1)) (hashbytes (buff 32))))
)
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))
    (try! (contract-call? .dao check-is-enabled))

    (match (as-contract (contract-call? .pox-3-mock delegate-stack-increase contract-caller pox-address increase-by))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (delegate-stack-extend 
  (extend-count uint)
  (pox-address (tuple (version (buff 1)) (hashbytes (buff 32))))
)
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))
    (try! (contract-call? .dao check-is-enabled))

    (match (as-contract (contract-call? .pox-3-mock delegate-stack-extend contract-caller pox-address extend-count))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

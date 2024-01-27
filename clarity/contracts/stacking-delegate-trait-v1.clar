;; @contract Stacking Delegate Trait
;; @version 1

(use-trait reserve-trait .reserve-trait-v1.reserve-trait)

(define-trait stacking-delegate-trait
  (
    (delegate-stx (<reserve-trait> uint principal) (response bool uint))
    (revoke-delegate-stx () (response bool uint))
    (return-stx (<reserve-trait>) (response uint uint))
  )
)

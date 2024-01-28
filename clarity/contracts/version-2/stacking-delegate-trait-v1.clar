;; @contract Stacking Delegate Trait
;; @version 1

(use-trait reserve-trait .reserve-trait-v1.reserve-trait)

(define-trait stacking-delegate-trait
  (
    (revoke (<reserve-trait>) (response bool uint))
    (revoke-and-delegate (<reserve-trait> uint principal uint) (response bool uint))
    (handle-rewards (<reserve-trait>) (response uint uint))
    (handle-excess (<reserve-trait>) (response uint uint))
  )
)

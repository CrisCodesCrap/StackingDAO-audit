;; @contract Stacking Delegate Trait
;; @version 1

(use-trait reserve-trait .reserve-trait-v1.reserve-trait)

(define-trait stacking-delegate-trait
  (
    (delegate-stx (uint principal (optional uint)) (response bool uint))
    (revoke-delegate-stx () (response bool uint))

    (request-stx-to-stack (<reserve-trait> uint) (response uint uint))
    (return-stx-from-stacking (<reserve-trait> uint) (response uint uint))
  )
)

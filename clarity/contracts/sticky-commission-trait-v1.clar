;; @contract Sticky Commission Trait
;; @version 1

(use-trait sticky-staking-trait .sticky-staking-trait-v1.sticky-staking-trait)

(define-trait sticky-commission-trait
  (
    (add-commission (<sticky-staking-trait> uint) (response uint uint))
  )
)

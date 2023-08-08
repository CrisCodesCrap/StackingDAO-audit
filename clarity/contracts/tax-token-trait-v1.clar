;; @contract Tax Token Trait
;; @version 1

(define-trait tax-token-trait
  (
    (get-buy-tax () (response uint uint))
    (get-sell-tax () (response uint uint))
  )
)

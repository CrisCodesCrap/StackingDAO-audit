;; @contract Sticky Reserve Trait
;; @version 1

(define-trait sticky-reserve-trait
  (
    (get-stx-in-use () (response uint uint))
    (get-stx-idle () (response uint uint))
    (get-total-stx () (response uint uint))

    (request-stx (uint principal) (response uint uint))

    (request-stx-to-stack (uint) (response uint uint))
    (return-stx-from-stacking (uint) (response uint uint))
  )
)

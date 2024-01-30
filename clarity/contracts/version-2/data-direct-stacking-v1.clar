;; @contract Data Direct Stacking
;; @version 1

;;-------------------------------------
;; Init 
;;-------------------------------------

(begin
  ;; TODO: add Bitflow as supported protocol
  (var-set supported-protocols (list
    .protocol-arkadiko-v1
  ))
)

;;-------------------------------------
;; Directed Stacking
;;-------------------------------------

(define-data-var total-directed-stacking uint u0)

;; Map pool to amount used for direct stacking
(define-map direct-stacking-pool-amount principal uint)

;; User info
(define-map direct-stacking-user 
  principal 
  {
    pool: principal, 
    amount: uint,
  }
)

(define-read-only (get-total-directed-stacking)
  (var-get total-directed-stacking)
)

(define-read-only (get-direct-stacking-pool-amount (pool principal))
  (default-to
    u0
    (map-get? direct-stacking-pool-amount pool)
  )
)

(define-read-only (get-direct-stacking-user (user principal))
  (map-get? direct-stacking-user user)
)


(define-public (set-total-directed-stacking (amount uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (var-set total-directed-stacking amount)
    (ok true)
  )
)

(define-public (set-direct-stacking-pool-amount (pool principal) (amount uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-set direct-stacking-pool-amount pool amount)
    (ok true)
  )
)

(define-public (set-direct-stacking-user (user principal) (pool principal) (amount uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-set direct-stacking-user user { pool: pool, amount: amount })
    (ok true)
  )
)

(define-public (delete-direct-stacking-user (user principal))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-delete direct-stacking-user user)
    (ok true)
  )
)

;;-------------------------------------
;; Supported Protocols
;;-------------------------------------

(define-data-var supported-protocols (list 50 principal) (list))

(define-read-only (get-supported-protocols)
  (var-get supported-protocols)
)

(define-public (set-supported-protocols (protocols (list 50 principal)))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (var-set supported-protocols protocols)
    (ok true)
  )
)

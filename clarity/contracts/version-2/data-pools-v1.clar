;; @contract Data Pools
;; @version 1

;;-------------------------------------
;; Init 
;;-------------------------------------

(begin
  (var-set active-pools (list .stacking-pool-v1))

  (map-set pool-commission .stacking-pool-v1 u500)
  (map-set pool-share .stacking-pool-v1 u10000)

  ;; TODO: set up other delegates
  (map-set pool-delegates .stacking-pool-v1 (list .stacking-delegate-1))
  (map-set delegate-share .stacking-delegate-1 u10000)
)

;;-------------------------------------
;; Cycle Withdraw Offset
;;-------------------------------------

;; In the last X blocks of the cycle
(define-data-var cycle-withdraw-offset uint u288) ;; 2 days

(define-read-only (get-cycle-withdraw-offset)
  (var-get cycle-withdraw-offset)
)

(define-public (set-cycle-withdraw-offset (offset uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (var-set cycle-withdraw-offset offset)
    (ok true)
  )
)

;;-------------------------------------
;; Commission
;;-------------------------------------

;; If specific pool commission is not set
(define-data-var standard-commission uint u500) ;; 5% in bps

;; Map pool rewards STX address to commission
(define-map pool-commission principal uint)

(define-read-only (get-standard-commission)
  (var-get standard-commission)
)

(define-read-only (get-pool-commission (pool principal))
  (default-to
    (var-get standard-commission)
    (map-get? pool-commission pool)
  )
)

(define-public (set-standard-commission (commission uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (var-set standard-commission commission)
    (ok true)
  )
)

(define-public (set-pool-commission (pool principal) (commission uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-set pool-commission pool commission)
    (ok true)
  )
)

;;-------------------------------------
;; Pool and Delegates
;;-------------------------------------

;; List of active pools
(define-data-var active-pools (list 30 principal) (list))

;; Map pool address to share in bps
(define-map pool-share principal uint)

;; Map pool address to delegates
(define-map pool-delegates principal (list 30 principal))

;; Map deleget address to delegate share in bps
(define-map delegate-share principal uint)


(define-read-only (get-active-pools)
  (var-get active-pools)
)

(define-read-only (get-pool-share (pool principal))
  (default-to
    u0
    (map-get? pool-share pool)
  )
)

(define-read-only (get-pool-delegates (pool principal))
  (default-to
    (list)
    (map-get? pool-delegates pool)
  )
)

(define-read-only (get-delegate-share (delegate principal))
  (default-to
    u0
    (map-get? delegate-share delegate)
  )
)

(define-public (set-active-pools (pools (list 30 principal)))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (var-set active-pools pools)
    (ok true)
  )
)

(define-public (set-pool-share (pool principal) (share uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-set pool-share pool share)
    (ok true)
  )
)

(define-public (set-pool-delegates (pool principal) (delegates (list 30 principal)))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-set pool-delegates pool delegates)
    (ok true)
  )
)

(define-public (set-delegate-share (delegate principal) (share uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-set delegate-share delegate share)
    (ok true)
  )
)

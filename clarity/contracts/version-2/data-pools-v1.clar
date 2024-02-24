;; @contract Data Pools
;; @version 1
;;
;; Save which pools are active, their commission and stacking share.
;; Also set delegates per pool and the delegate share.

;;-------------------------------------
;; Init 
;;-------------------------------------

(begin
  (var-set active-pools (list .stacking-pool-v1 .pox-fast-pool-v2-mock))

  ;; Pool commission
  (map-set pool-commission .stacking-pool-v1 u500)
  (map-set pool-commission .pox-fast-pool-v2-mock u300)

  ;; Pool share
  (map-set pool-share .stacking-pool-v1 u7000)
  (map-set pool-share .pox-fast-pool-v2-mock u3000)

  ;; Pool delegates
  (map-set pool-delegates .stacking-pool-v1 (list .stacking-delegate-1-1 .stacking-delegate-1-2 .stacking-delegate-1-3))
  (if is-in-mainnet
    true
    (map-set pool-delegates .pox-fast-pool-v2-mock (list .stacking-delegate-2-1 .stacking-delegate-2-2 .stacking-delegate-2-3))
  )

  ;; Delegate share
  (map-set delegate-share .stacking-delegate-1-1 u5000)
  (map-set delegate-share .stacking-delegate-1-2 u3000)
  (map-set delegate-share .stacking-delegate-1-3 u2000)

  (map-set delegate-share .stacking-delegate-2-1 u5000)
  (map-set delegate-share .stacking-delegate-2-2 u3000)
  (map-set delegate-share .stacking-delegate-2-3 u2000)

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
    (try! (contract-call? .dao check-is-protocol contract-caller))

    (var-set standard-commission commission)
    (ok true)
  )
)

(define-public (set-pool-commission (pool principal) (commission uint))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))

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
    (try! (contract-call? .dao check-is-protocol contract-caller))

    (var-set active-pools pools)
    (ok true)
  )
)

(define-public (set-pool-share (pool principal) (share uint))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))

    (map-set pool-share pool share)
    (ok true)
  )
)

(define-public (set-pool-delegates (pool principal) (delegates (list 30 principal)))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))

    (map-set pool-delegates pool delegates)
    (ok true)
  )
)

(define-public (set-delegate-share (delegate principal) (share uint))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))

    (map-set delegate-share delegate share)
    (ok true)
  )
)

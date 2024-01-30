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

;; TODO: setters


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

;; TODO: setters

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

;; TODO: setters



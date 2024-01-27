;; @contract Pool data
;; @version 1

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var next-cycle-withdraw-blocks uint u288) ;; 2 days

(define-data-var active-pools (list 30 principal) (list))

(define-data-var standard-commission uint u500) ;; 5% in bps

;;-------------------------------------
;; Maps
;;-------------------------------------

;; Map pool rewards STX address to commission
(define-map pool-commission principal uint)

;; Map pool address to share in bps
(define-map pool-share principal uint)

;; Map pool address to delegates
(define-map pool-delegates principal (list 30 principal))

;; Map deleget address to delegate share in bps
(define-map delegate-share principal uint)

;;-------------------------------------
;; Getters
;;-------------------------------------

(define-read-only (get-next-cycle-withdraw-blocks)
  (var-get next-cycle-withdraw-blocks)
)

(define-read-only (get-active-pools)
  (var-get active-pools)
)

(define-read-only (get-standard-commission)
  (var-get standard-commission)
)

(define-read-only (get-pool-commission (pool principal))
  (default-to
    (var-get standard-commission)
    (map-get? pool-commission pool)
  )
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

;;-------------------------------------
;; Setters
;;-------------------------------------

;; TODO

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

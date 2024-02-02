;; @contract Strategy V3 Pools V1
;; @version 1
;;
;; 
;; First check if there is a net inflow or outflow. 
;;
;; Inflows:
;; 1.1) Get amount locked per pool
;; 1.2) Get target amounts per pool
;; 2.1) Calculate overlocked amounts (overlocked = locked - target)
;; 2.2) Calculate target inflow (inflow = target - locked)
;; 3.1) Calculate deviation (deviation = inflow / locked)
;; 3.2) Calculate deviation percentage (deviation-percentage = deviation / sum-deviations)
;; 4.1) Calculate actual inflow (actual-inflow = deviation-percentage * total-inflow)
;; 4.2) New stacking for pool = actual-inflow + locked
;;
;; Outflows:
;; 1.1) Get amount locked per pool
;; 1.2) Get target amounts per pool
;; 2.1) Calculate overlocked amounts (overlocked = locked - target)
;; 2.2) Select pool with highest overlocked amount

;;-------------------------------------
;; Core
;;-------------------------------------

(define-read-only (calculate-stacking-per-pool)
  (let (
    (new-amounts (calculate-new-amounts))
  )
    (if (>= (get inflow new-amounts) u0)
      (calculate-inflow new-amounts)
      (calculate-outflow new-amounts)
    )
  )
)

(define-read-only (calculate-new-amounts)
  (let (
    ;; Currently stacking
    (total-stacking (unwrap-panic (contract-call? .reserve-v1 get-stx-stacking)))

    ;; New total amount to stack
    (total-idle (unwrap-panic (contract-call? .reserve-v1 get-stx-balance)))
    (total-withdrawals (unwrap-panic (contract-call? .reserve-v1 get-stx-for-withdrawals)))
    (new-total-stacking (- (+ total-stacking total-idle) total-withdrawals))

    ;; New total amount to stack, for normal and direct
    (new-total-direct-stacking (contract-call? .data-direct-stacking-v1 get-total-directed-stacking))
    (new-total-normal-stacking (- (+ total-stacking total-idle) total-withdrawals new-total-direct-stacking))
  )
    { 
      new-total-direct-stacking: new-total-direct-stacking, 
      new-total-normal-stacking: new-total-normal-stacking, 
      inflow: (if (> new-total-stacking total-stacking)
        (- new-total-stacking total-stacking)
        u0
      ),
      outflow: (if (> total-stacking new-total-stacking)
        (- total-stacking new-total-stacking )
        u0
      ) 
    } 
  )
)

;;-------------------------------------
;; Inflow
;;-------------------------------------

(define-read-only (calculate-inflow (new-amounts { new-total-direct-stacking: uint, new-total-normal-stacking: uint, inflow: uint, outflow:uint  }))
  (let (
    (pools (contract-call? .data-pools-v1 get-active-pools))

    (new-total-normal-stacking-list (list-30-uint (get new-total-normal-stacking new-amounts)))
    (new-total-direct-stacking-list (list-30-uint (get new-total-direct-stacking new-amounts)))

    (targets (map calculate-stacking-target-for-pool pools new-total-normal-stacking-list new-total-direct-stacking-list))
    (locked (map calculate-locked-for-pool pools))
    (locked-sum (fold + locked u0))

    (overlocked (map calculate-overlocked locked targets))
    (target-inflow (map calculate-target-inflow locked targets))

    (deviations (map calculate-target-deviation (list-30-uint locked-sum) target-inflow))
    (deviations-sum (fold + deviations u0))
    (deviations-percentages (map calculate-target-deviation-percentage deviations (list-30-uint deviations-sum)))

  )
    (map calculate-new-stacking pools locked deviations-percentages (list-30-uint (get inflow new-amounts)))
  )
)

(define-read-only (calculate-target-inflow (locked uint) (target uint))
  (if (> target locked)
    (- target locked)
    u0
  )
)

(define-read-only (calculate-target-deviation (current-stacking uint) (target-inflow uint))
  (/ (* target-inflow u10000) current-stacking)
)

(define-read-only (calculate-target-deviation-percentage (deviation uint) (total-deviation uint))
  ;; TODO: devide by 10k?
  (/ (* deviation u10000) total-deviation)
)

(define-read-only (calculate-new-stacking (pool principal) (locked uint) (deviation-percentage uint) (total-inflow uint))
  (let (
    (inflow (/ (* total-inflow deviation-percentage) u10000))
  )
    { pool: pool, inflow: (+ locked inflow), outflow: u0 }
  )
)

;;-------------------------------------
;; Outflow
;;-------------------------------------

(define-read-only (calculate-outflow (new-amounts { new-total-direct-stacking: uint, new-total-normal-stacking: uint, inflow: uint, outflow:uint  }))
  (let (
    (pools (contract-call? .data-pools-v1 get-active-pools))

    (new-total-normal-stacking-list (list-30-uint (get new-total-normal-stacking new-amounts)))
    (new-total-direct-stacking-list (list-30-uint (get new-total-direct-stacking new-amounts)))

    (targets (map calculate-stacking-target-for-pool pools new-total-normal-stacking-list new-total-direct-stacking-list))
    (locked (map calculate-locked-for-pool pools))
    (locked-sum (fold + locked u0))

    (overlocked (map calculate-overlocked locked targets))

    (max-overlocked (fold max-of overlocked u0))
    (max-overlocked-index (unwrap-panic (index-of? overlocked max-overlocked)))
    (pool (unwrap-panic (element-at? pools max-overlocked-index)))
  )
    ;; TODO: other pools must also be in list with both vars set to 0
    ;; So that they do extend for next cycle

    (list { pool: pool, inflow: u0, outflow: (get outflow new-amounts) })
  )
)

;;-------------------------------------
;; Inflow & Outflow - Helpers
;;-------------------------------------

(define-read-only (calculate-stacking-target-for-pool (pool principal) (new-total-normal-stacking uint) (new-total-direct-stacking uint))
  (let (
    (direct-stacking (contract-call? .data-direct-stacking-v1 get-direct-stacking-pool-amount pool))
    (direct-stacking-share (if (is-eq new-total-direct-stacking u0)
      u0
      (/ (* direct-stacking u10000) new-total-direct-stacking)
    ))
    (pool-share (contract-call? .data-pools-v1 get-pool-share pool))
    
    (direct-dependence (if (is-eq new-total-direct-stacking u0)
      u0
      u2000 ;; TODO: add to pool data
    )) 
    (direct-dependence-rest (- u10000 direct-dependence))

    (total-normal-stacking (/ (* new-total-normal-stacking direct-dependence-rest) u10000))
    (total-normal-direct-stacking (/ (* new-total-normal-stacking direct-dependence) u10000))

    (normal-stacking (/ (* total-normal-stacking pool-share) u10000))
    (normal-direct-stacking (/ (* total-normal-stacking direct-stacking-share) u10000))
  )
    (+ direct-stacking normal-stacking normal-direct-stacking)
  )
)

(define-read-only (calculate-locked-for-pool (pool principal))
  (let (
    (delegates (contract-call? .data-pools-v1 get-pool-delegates pool))
  )
    (fold + (map get-locked-stx delegates) u0)
  )
)

(define-read-only (calculate-overlocked (locked uint) (target uint))
  (if (> locked target)
    (- locked target)
    u0
  )
)

;;-------------------------------------
;; Helpers
;;-------------------------------------

(define-read-only (list-30-uint (item uint)) 
  (list item item item item item item item item item item item item item item item item item item item item item item item item item item item item item item)
)

(define-read-only (max-of (a uint) (b uint))
  (if (>= a b) a b)
)

(define-read-only (get-locked-stx (account principal))
  (get locked (get-stx-account account))
)

(define-read-only (get-stx-account (account principal))
  ;; TODO: update for mainnet
  (contract-call? .pox-4-mock stx-account-mock account)
  ;; (stx-account account)
)

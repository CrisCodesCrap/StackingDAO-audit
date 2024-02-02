;; @contract Strategy V3 Pools V1
;; @version 1
;;
;; 
;; Based on direct stacking and pool shares, we can calculate the target amount to stack.
;; However, we can not directly use this target amount because tokens in some delegates are locked and the amount can not be decreased.
;; 
;; This algorithm always aims for the target amounts while taking into account the following rules:
;;  1) If there is a net inflow, never stop a delegate from stacking. 
;;  2) If there is a net outflow, each pool should reach the exact target. 
;;
;; Because of rule #1 we need to take the locked amounts into account and devide the remaining inflow across
;; all delegates proportionally to the target inflow.
;;
;; Because of rule #2 a pool must revoke one or more delegates to reach the target. As we can not decrease the amount of stacked
;; per delegate, this will always lead to some idle STX.
;;

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
    (target-inflow (map calculate-inflow-target locked targets))

    (deviations (map calculate-inflow-target-deviation (list-30-uint locked-sum) target-inflow))
    (deviations-sum (fold + deviations u0))
    (deviations-percentages (map calculate-inflow-target-deviation-percentage deviations (list-30-uint deviations-sum)))

  )
    (map calculate-inflow-new-stacking pools locked deviations-percentages (list-30-uint (get inflow new-amounts)))
  )
)

(define-read-only (calculate-inflow-target (locked uint) (target uint))
  (if (> target locked)
    (- target locked)
    u0
  )
)

(define-read-only (calculate-inflow-target-deviation (current-stacking uint) (target-inflow uint))
  (/ (* target-inflow u10000) current-stacking)
)

(define-read-only (calculate-inflow-target-deviation-percentage (deviation uint) (total-deviation uint))
  ;; TODO: devide by 10k?
  (/ (* deviation u10000) total-deviation)
)

(define-read-only (calculate-inflow-new-stacking (pool principal) (locked uint) (deviation-percentage uint) (total-inflow uint))
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


    ;; Update for outflow
    (target-outflow (map calculate-outflow-target locked targets))

    (deviations (map calculate-outflow-target-deviation (list-30-uint locked-sum) target-outflow))
    (deviations-sum (fold + deviations u0))
    (deviations-percentages (map calculate-outflow-target-deviation-percentage deviations (list-30-uint deviations-sum)))

  )
    (map calculate-outflow-new-stacking pools locked deviations-percentages (list-30-uint (get outflow new-amounts)))
  )
)

(define-read-only (calculate-outflow-target (locked uint) (target uint))
  (if (> locked target)
    (- locked target)
    u0
  )
)

(define-read-only (calculate-outflow-target-deviation (current-stacking uint) (target-outflow uint))
  (/ (* target-outflow u10000) current-stacking)
)

(define-read-only (calculate-outflow-target-deviation-percentage (deviation uint) (total-deviation uint))
  ;; TODO: devide by 10k?
  (/ (* deviation u10000) total-deviation)
)

(define-read-only (calculate-outflow-new-stacking (pool principal) (locked uint) (deviation-percentage uint) (total-outflow uint))
  (let (
    (outflow (/ (* total-outflow deviation-percentage) u10000))
  )
    { pool: pool, inflow: u0, outflow: outflow }
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

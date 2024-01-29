;; @contract Direct Stacking Helpers
;; @version 1

;;-------------------------------------
;; Direct Stacking Helpers  
;;-------------------------------------

;; Helper method without `pool` argument
;; Pool is chosen based on current direct stacking pool for user
(define-public (add-direct-stacking (user principal) (amount uint))
  (let (
    (current-direct-stacking (contract-call? .data-pools-v1 get-direct-stacking-user user))
    (current-direct-pool (if (is-some current-direct-stacking)
      (some (get pool (unwrap-panic current-direct-stacking)))
      none
    ))
  )
    (add-direct-stacking-pool user current-direct-pool amount)
  )
)

;; Handle direct stacking for user
;; 1 - If user is direct stacking in same pool, increase amounts
;; 2 - If user is direct stacking in other pool, move all to newly selected pool
;; 3 - If user is not direct stacking yet .... TODO
(define-public (add-direct-stacking-pool (user principal) (pool (optional principal)) (amount uint))
  (let (
    (current-direct-stacking (contract-call? .data-pools-v1 get-direct-stacking-user user))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (if (is-some current-direct-stacking)

      ;; 1) User is direct stacking
      (if (is-some pool)

        ;; 1.1) User has selected pool
        ;; Remove all from current pool, add to new pool
        (let (
          ;; Save values for current pool
          (current-direct-amount (get amount (unwrap-panic current-direct-stacking)))

          ;; Stop direct stacking for current pool
          (stop-result (try! (stop-direct-stacking user)))
          
          ;; New amounts after stop
          (selected-pool-amount (contract-call? .data-pools-v1 get-direct-stacking-pool-amount (unwrap-panic pool)))
          (total-amount (contract-call? .data-pools-v1 get-total-directed-stacking))
        )
          (try! (contract-call? .data-pools-v1 set-direct-stacking-user user (unwrap-panic pool) (+ current-direct-amount amount)))
          (try! (contract-call? .data-pools-v1 set-direct-stacking-pool-amount (unwrap-panic pool) (+ selected-pool-amount current-direct-amount amount)))            
          (try! (contract-call? .data-pools-v1 set-total-directed-stacking (+ total-amount current-direct-amount amount)))
          true
        )

        ;; 1.2) User has not selected pool
        ;; Stop direct stacking
        (begin
          (try! (stop-direct-stacking user))
          true
        )
      )

      ;; 2) User is not direct stacking
      (if (is-some pool)
        
        ;; 2.1) User has selected pool
        ;; Add new direct stacking data for selected pool
        (let (
          (selected-pool-amount (contract-call? .data-pools-v1 get-direct-stacking-pool-amount (unwrap-panic pool)))
          (total-amount (contract-call? .data-pools-v1 get-total-directed-stacking))
        )
          (try! (contract-call? .data-pools-v1 set-direct-stacking-user user (unwrap-panic pool) amount))
          (try! (contract-call? .data-pools-v1 set-direct-stacking-pool-amount (unwrap-panic pool) (+ selected-pool-amount amount)))            
          (try! (contract-call? .data-pools-v1 set-total-directed-stacking (+ total-amount amount)))
          true
        )

        ;; 2.2) User has not selected pool
        ;; Nothing to do here
        false
      )
    )
    (ok true)
  )
)

(define-public (subtract-direct-stacking (user principal) (amount uint))
  (let (
    (current-direct-stacking (contract-call? .data-pools-v1 get-direct-stacking-user user))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (if (is-some current-direct-stacking)
      (let (
        (current-direct-pool (get pool (unwrap-panic current-direct-stacking)))
        (current-direct-amount (get amount (unwrap-panic current-direct-stacking)))
        (current-pool-amount (contract-call? .data-pools-v1 get-direct-stacking-pool-amount current-direct-pool))
        (current-total-amount (contract-call? .data-pools-v1 get-total-directed-stacking))
      )
        (if (is-eq current-direct-amount amount)
          (begin
            (try! (stop-direct-stacking user))
            true
          )
          (begin
            (try! (contract-call? .data-pools-v1 set-direct-stacking-user user current-direct-pool (- current-direct-amount amount)))
            (try! (contract-call? .data-pools-v1 set-direct-stacking-pool-amount current-direct-pool (- current-pool-amount amount)))                    
            (try! (contract-call? .data-pools-v1 set-total-directed-stacking (- current-total-amount amount)))
            true
          )
        )
        true
      )
      false
    )
    (ok true)
  )
)

;; TODO: Better way for bot to stop direct stacking if needed.
(define-public (stop-direct-stacking (user principal))
 (let (
    (current-direct-stacking (contract-call? .data-pools-v1 get-direct-stacking-user user))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (if (is-some current-direct-stacking)
      (let (
        (current-direct-pool (get pool (unwrap-panic current-direct-stacking)))
        (current-direct-amount (get amount (unwrap-panic current-direct-stacking)))
        (current-pool-amount (contract-call? .data-pools-v1 get-direct-stacking-pool-amount current-direct-pool))
        (current-total-amount (contract-call? .data-pools-v1 get-total-directed-stacking))
      )
        ;; 1) User is direct stacking, remove current info
        (try! (contract-call? .data-pools-v1 delete-direct-stacking-user user))        
        (try! (contract-call? .data-pools-v1 set-direct-stacking-pool-amount current-direct-pool (- current-pool-amount current-direct-amount)))
        (try! (contract-call? .data-pools-v1 set-total-directed-stacking (- current-total-amount current-direct-amount)))
        true
      )
      false
    )
    (ok true)
  )
)

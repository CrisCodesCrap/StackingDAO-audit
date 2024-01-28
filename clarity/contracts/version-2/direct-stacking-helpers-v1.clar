;; @contract Direct Stacking Helpers
;; @version 1

;;-------------------------------------
;; Direct Stacking Helpers  
;;-------------------------------------

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
      (let (
        (current-direct-pool (get pool (unwrap-panic current-direct-stacking)))
        (current-direct-amount (get amount (unwrap-panic current-direct-stacking)))
        (current-pool-amount (contract-call? .data-pools-v1 get-direct-stacking-pool-amount current-direct-pool))
        (current-total-amount (contract-call? .data-pools-v1 get-total-directed-stacking))
      )
        ;; 1) User is direct stacking, remove current info
        (try! (stop-direct-stacking user))

        (if (is-some pool)
          ;; 2) User has selected pool, add all info to new pool
          (let (
            (selected-pool-amount (contract-call? .data-pools-v1 get-direct-stacking-pool-amount (unwrap-panic pool)))
            (new-total-amount (contract-call? .data-pools-v1 get-total-directed-stacking))
          )
            (try! (contract-call? .data-pools-v1 set-direct-stacking-user user (unwrap-panic pool) (+ current-direct-amount amount)))
            (try! (contract-call? .data-pools-v1 set-direct-stacking-pool-amount (unwrap-panic pool) (+ selected-pool-amount current-direct-amount amount)))            
            (try! (contract-call? .data-pools-v1 set-total-directed-stacking (+ new-total-amount current-direct-amount amount)))
          )

          ;; 3) User was direct stacking, but did not select a pool
          ;; His direct stacking info was removed
          false
        )
        true
      )

      ;; 4) User is not direct stacking yet
      ;; TODO
      ;; 
      

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

;; @contract Stacker contract for PoX
;; @version 1

(use-trait reserve-trait .reserve-trait-v1.reserve-trait)

;;-------------------------------------
;; Variables 
;;-------------------------------------

(define-data-var stacking-unlock-burn-height uint u0) ;; When is this cycle over
(define-data-var stacking-stx-stacked uint u0) ;; How many stx did we stack in this cycle

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-stacking-unlock-burn-height)
  (var-get stacking-unlock-burn-height)
)

;; Gets the variable info directly
;; However, when stacking stopped this var is not reset to 0
;; Use method `get-stx-stacked` to know how many STX stacked
(define-read-only (get-stacking-stx-stacked)
  (var-get stacking-stx-stacked)
)

(define-read-only (get-stx-stacked)
  (if (> burn-block-height (get-stacking-unlock-burn-height))
    u0
    (var-get stacking-stx-stacked)
  )
)

(define-read-only (get-stx-balance)
  (stx-get-balance (as-contract tx-sender))
)

;;-------------------------------------
;; Stacking 
;;-------------------------------------

;; Initiate stacking
;; Only to be called when not stacking yet
(define-public (initiate-stacking
    (reserve-contract <reserve-trait>)
    (pox-address (tuple (version (buff 1)) (hashbytes (buff 32))))
    (tokens-to-stack uint)
    (start-burn-height uint)
    (lock-period uint)
  )
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol (contract-of reserve-contract)))

    ;; Get STX tokens from reserve
    (try! (as-contract (contract-call? reserve-contract request-stx-to-stack tokens-to-stack)))

    ;; Allow pool to issue stacking
    (try! (contract-call? .stacking-pool-v1 delegate-stx tokens-to-stack))

    ;; Stack
    (let (
      (result (try! (contract-call? .stacking-pool-v1 delegate-stack-stx tokens-to-stack pox-address start-burn-height lock-period)))
    )
      (var-set stacking-unlock-burn-height (get unlock-burn-height result))
      (var-set stacking-stx-stacked (get lock-amount result))
    )

    (ok tokens-to-stack)
  )
)

;; Call when extra STX tokens need to be stacked. Call `stack-extend` afterwards.
(define-public (stack-increase 
  (reserve-contract <reserve-trait>) 
  (pox-address (tuple (version (buff 1)) (hashbytes (buff 32))))
  (additional-tokens-to-stack uint)
)
  (let (
    (stx-balance (get-stx-balance))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol (contract-of reserve-contract)))

    ;; Get extra STX tokens
    (try! (contract-call? reserve-contract request-stx-to-stack additional-tokens-to-stack))

    ;; Allow pool to issue stacking
    (try! (contract-call? .stacking-pool-v1 delegate-stx additional-tokens-to-stack))

    ;; Increase stacking
    (let (
      (result (try! (contract-call? .stacking-pool-v1 delegate-stack-increase additional-tokens-to-stack pox-address)))
    )
      (var-set stacking-stx-stacked (get total-locked result))
    )

    (ok additional-tokens-to-stack)
  )
)

;; Extend stacking cycle. Should be called after `stack-increase`.
(define-public (stack-extend 
  (extend-count uint) 
  (pox-address { version: (buff 1), hashbytes: (buff 32) })
)
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))
    (try! (contract-call? .dao check-is-enabled))

    ;; Extend stacking
    (let (
      (result (try! (contract-call? .stacking-pool-v1 delegate-stack-extend extend-count pox-address)))
    )
      (var-set stacking-unlock-burn-height (get unlock-burn-height result))
    )

    (ok extend-count)
  )
)

;;-------------------------------------
;; Admin 
;;-------------------------------------

;; Return STX to the STX reserve
(define-public (return-stx (reserve-contract <reserve-trait>))
  (let (
    (stx-amount (stx-get-balance (as-contract tx-sender)))
  )
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol (contract-of reserve-contract)))

    (if (> stx-amount u0)
      (try! (as-contract (contract-call? reserve-contract return-stx-from-stacking stx-amount)))
      u0
    )
    (ok stx-amount)
  )
)

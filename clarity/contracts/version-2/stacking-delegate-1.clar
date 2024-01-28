;; @contract Stacking Delegate Contract
;; @version 1

(impl-trait .stacking-delegate-trait-v1.stacking-delegate-trait)
(use-trait reserve-trait .reserve-trait-v1.reserve-trait)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var target-locked-amount uint u0)

(define-data-var last-locked-amount uint u0)
(define-data-var last-contract-amount uint u0)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-read-only (get-target-locked-amount)
  (var-get target-locked-amount)
)

(define-read-only (get-last-locked-amount)
  (var-get last-locked-amount)
)

(define-read-only (get-last-contract-amount)
  (var-get last-contract-amount)
)

;;-------------------------------------
;; PoX Helpers 
;;-------------------------------------

(define-read-only (get-stx-account (account principal))
  ;; TODO: update for mainnet
  (contract-call? .pox-3-mock stx-account-mock account)
  ;; (stx-account account)
)

(define-read-only (get-delegated-amount (account principal))
  (let (
    ;; TODO: update for mainnet
    (delegation-info (contract-call? .pox-3-mock get-check-delegation (as-contract tx-sender)))
    (delegation-amount (if (is-none delegation-info)
      u0
      (unwrap-panic (get amount-ustx delegation-info))
    ))
  )
    delegation-amount
  )
)

;;-------------------------------------
;; Pox Wrappers 
;;-------------------------------------

(define-public (delegate-stx (amount-ustx uint) (delegate-to principal) (until-burn-ht (optional uint)))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))

    ;; TODO: update for mainnet
    (match (as-contract (contract-call? .pox-3-mock delegate-stx amount-ustx delegate-to none none))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (revoke-delegate-stx)
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))

    ;; TODO: update for mainnet
    (match (as-contract (contract-call? .pox-3-mock revoke-delegate-stx))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

;;-------------------------------------
;; Reserve Wrappers
;;-------------------------------------

(define-private (request-stx-to-stack (reserve-contract <reserve-trait>) (amount uint))
  (begin
    (try! (as-contract (contract-call? reserve-contract request-stx-to-stack amount)))

    (var-set last-locked-amount (get locked (get-stx-account (as-contract tx-sender))))
    ;; Need to subtract and not set to current amount, as rewards must still be calculated correctly
    (var-set last-contract-amount (+ (get-last-contract-amount) amount))

    (ok true)
  )
)

(define-private (return-stx-from-stacking (reserve-contract <reserve-trait>) (amount uint))
  (begin
    (try! (as-contract (contract-call? reserve-contract return-stx-from-stacking amount)))

    (var-set last-locked-amount (get locked (get-stx-account (as-contract tx-sender))))
    ;; Need to subtract and not set to current amount, as rewards must still be calculated correctly
    (var-set last-contract-amount (- (get-last-contract-amount) amount))

    (ok true)
  )
)

;;-------------------------------------
;; Handle rewards
;;-------------------------------------

(define-read-only (calculate-rewards) 
  (let (
    (last-locked (get-last-locked-amount))
    (last-contract (get-last-contract-amount))

    (locked-amount (get locked (get-stx-account (as-contract tx-sender))))
    (contract-amount (stx-get-balance (as-contract tx-sender)))

    ;; Extra STX must be rewards
    (rewards (if (> (+ locked-amount contract-amount) (+ last-locked last-contract))
      (- (+ locked-amount contract-amount) (+ last-locked last-contract))
      u0
    ))
  )
    rewards
  )
)

;; Detect amount changes and act.
;; Additional STX are rewards.
;; Based on target-lock, return excess STX
(define-public (handle-rewards (reserve-contract <reserve-trait>))
  (let (
    (rewards (calculate-rewards))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    ;; TODO: save cycle info

    ;; Rewards to reserve
    (if (> rewards u0)
      (try! (as-contract (return-stx-from-stacking reserve-contract rewards)))
      true
    )

    (ok rewards)
  )
)

;;-------------------------------------
;; Handle excess amount
;;-------------------------------------

(define-read-only (calculate-excess) 
  (let (
    (locked-amount (get locked (get-stx-account (as-contract tx-sender))))
    (contract-amount (stx-get-balance (as-contract tx-sender)))
    (rewards-amount (calculate-rewards))

    ;; TODO: this can be < 0, need if/else to check
    (total-amount (- (+ locked-amount contract-amount) rewards-amount))

    (target-amount (get-target-locked-amount))

    (excess-amount (if (> total-amount target-amount)
      (- total-amount target-amount)
      u0
    ))

  )
    (if (> excess-amount u0)
      (if (> contract-amount excess-amount)
        (- contract-amount excess-amount)
        contract-amount
      )
      u0
    )
  )
)

(define-public (handle-excess (reserve-contract <reserve-trait>))
  (let (
    (excess (calculate-excess))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    ;; Not needed STX to reserve
    (if (> excess u0)
      (try! (as-contract (return-stx-from-stacking reserve-contract excess)))
      true
    )

    (ok excess)
  )
)

;;-------------------------------------
;; Delegation 
;;-------------------------------------

(define-public (revoke (reserve-contract <reserve-trait>))
  (begin 
    ;; Need to be done first
    (try! (handle-rewards reserve-contract))

    (try! (contract-call? .dao check-is-protocol tx-sender))

    (let (
      (contract-amount (stx-get-balance (as-contract tx-sender)))
    )
      ;; Revoke
      (try! (revoke-delegate-stx))

      ;; Return STX
      (if (> contract-amount u0)
        (try! (as-contract (return-stx-from-stacking reserve-contract contract-amount)))
        true
      )

      ;; Set target
      (var-set target-locked-amount u0)

      (ok true)
    )
  )
)

(define-public (revoke-and-delegate (reserve-contract <reserve-trait>) (amount-ustx uint) (delegate-to principal) (until-burn-ht uint))
  (begin
    ;; Need to be done first
    (try! (handle-rewards reserve-contract))

    ;; Revoke
    (try! (revoke-delegate-stx))

    (try! (contract-call? .dao check-is-protocol tx-sender))

    (let (
      (locked-amount (get locked (get-stx-account (as-contract tx-sender))))
      (contract-amount (stx-get-balance (as-contract tx-sender)))
    )
      ;; TODO: can we delegate an amount < locked amount? -> can not be returned  yet..
      ;; This is also needed for the strategy to work (as 20% based on direct stacking) so can go down -> solve in strategy?
      ;; Assumed for now, otherwise fix in strategy and throw error here and do not handle excess at end of method

      ;; Request STX from reserve if needed
      (if (> amount-ustx (+ contract-amount locked-amount))
        (try! (as-contract (request-stx-to-stack reserve-contract (- amount-ustx (+ contract-amount locked-amount)))))
        true
      )

      ;; Delegate STX
      (try! (delegate-stx amount-ustx delegate-to (some until-burn-ht)))

      ;; Set target
      (var-set target-locked-amount amount-ustx)

      ;; Handle excess
      (try! (handle-excess reserve-contract))

      (ok true)
    )
  )
)


;;-------------------------------------
;; Admin
;;-------------------------------------

;; TODO: return & update amounts?

;; Return all STX to the reserve
(define-public (return-stx (reserve-contract <reserve-trait>))
  (let (
    (return-amount (stx-get-balance (as-contract tx-sender)))
  )
    (try! (contract-call? .dao check-is-protocol contract-caller))
    (try! (contract-call? .dao check-is-protocol (contract-of reserve-contract)))

    (if (> return-amount u0)
      (try! (as-contract (contract-call? reserve-contract return-stx-from-stacking return-amount)))
      u0
    )
    (ok return-amount)
  )
)

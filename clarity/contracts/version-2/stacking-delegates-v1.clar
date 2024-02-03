;; @contract Stacking Delegates
;; @version 1

(use-trait reserve-trait .reserve-trait-v1.reserve-trait)
(use-trait stacking-delegate-trait .stacking-delegate-trait-v1.stacking-delegate-trait)

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_DELEGATE_AMOUNT_LOCKED u41001)

;;-------------------------------------
;; Maps
;;-------------------------------------

;; TODO: move to data contract

;; Delegate to last selected pool
(define-map last-selected-pool principal principal)

;; Delegate to target locked amount
(define-map target-locked-amount principal uint)

(define-map last-locked-amount principal uint)

(define-map last-contract-amount principal uint)


;;-------------------------------------
;; Getters
;;-------------------------------------


(define-read-only (get-last-selected-pool (delegate principal))
  (default-to
    .stacking-pool-v1
    (map-get? last-selected-pool delegate)
  )
)

(define-read-only (get-target-locked-amount (delegate principal))
  (default-to
    u0
    (map-get? target-locked-amount delegate)
  )
)

(define-read-only (get-last-locked-amount (delegate principal))
  (default-to
    u0
    (map-get? last-locked-amount delegate)
  )
)

(define-read-only (get-last-contract-amount (delegate principal))
  (default-to
    u0
    (map-get? last-contract-amount delegate)
  )
)

;;-------------------------------------
;; PoX Helpers 
;;-------------------------------------

(define-read-only (get-stx-account (account principal))
  ;; TODO: update for mainnet
  (contract-call? .pox-4-mock stx-account-mock account)
  ;; (stx-account account)
)

;;-------------------------------------
;; Reserve Wrappers
;;-------------------------------------

(define-private (request-stx-to-stack (delegate <stacking-delegate-trait>) (reserve <reserve-trait>) (amount uint))
  (begin
    (try! (contract-call? .dao check-is-protocol (contract-of reserve)))

    (try! (as-contract (contract-call? delegate request-stx-to-stack reserve amount)))

    (map-set last-locked-amount (contract-of delegate) (get locked (get-stx-account (contract-of delegate))))
    ;; Need to subtract and not set to current amount, as rewards must still be calculated correctly
    (map-set last-contract-amount (contract-of delegate) (+ (get-last-contract-amount (contract-of delegate)) amount))

    (ok true)
  )
)

(define-private (return-stx-from-stacking (delegate  <stacking-delegate-trait>) (reserve <reserve-trait>) (amount uint))
  (begin
    (try! (contract-call? .dao check-is-protocol (contract-of reserve)))

    (try! (as-contract (contract-call? delegate return-stx-from-stacking reserve amount)))

    (map-set last-locked-amount (contract-of delegate) (get locked (get-stx-account (contract-of delegate))))
    ;; Need to subtract and not set to current amount, as rewards must still be calculated correctly
    (map-set last-contract-amount (contract-of delegate) (- (get-last-contract-amount (contract-of delegate)) amount))

    (ok true)
  )
)


;;-------------------------------------
;; Handle rewards
;;-------------------------------------

(define-read-only (calculate-rewards (delegate principal)) 
  (let (
    (last-locked (get-last-locked-amount delegate))
    (last-contract (get-last-contract-amount delegate))

    (locked-amount (get locked (get-stx-account delegate)))
    (contract-amount (get unlocked (get-stx-account delegate)))

    ;; Extra STX must be rewards
    (rewards (if (> (+ locked-amount contract-amount) (+ last-locked last-contract))
      (- (+ locked-amount contract-amount) (+ last-locked last-contract))
      u0
    ))
  )
    rewards
  )
)

;; If extra STX in (contract + locked) it means rewards were added
(define-public (handle-rewards (delegate principal) (reserve <reserve-trait>))
  (let (
    (rewards (calculate-rewards delegate))
  )
    (try! (contract-call? .dao check-is-protocol (contract-of reserve)))

    (if (> rewards u0)
      ;; TODO: should not be hardcoded, create trait
      (try! (as-contract (contract-call? .rewards-v1 add-rewards (get-last-selected-pool delegate) rewards)))
      true
    )
    (ok rewards)
  )
)

;;-------------------------------------
;; Handle excess amount
;;-------------------------------------

(define-read-only (calculate-excess (delegate principal)) 
  (let (
    (locked-amount (get locked (get-stx-account delegate)))
    (contract-amount (get unlocked (get-stx-account delegate)))
    (rewards-amount (calculate-rewards delegate))

    (target-amount (get-target-locked-amount delegate))
    (total-amount (if (> (+ locked-amount contract-amount) rewards-amount)
      (- (+ locked-amount contract-amount) rewards-amount)
      u0
    ))
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

;; If target amount is lower than (contract + locked)
;; we can return the STX held by the contract
(define-public (handle-excess (delegate <stacking-delegate-trait>) (reserve <reserve-trait>))
  (let (
    (excess (calculate-excess (contract-of delegate)))
  )
    (try! (contract-call? .dao check-is-protocol (contract-of reserve)))

    ;; Not needed STX to reserve
    (if (> excess u0)
      (try! (as-contract (return-stx-from-stacking delegate reserve excess)))
      true
    )
    (ok excess)
  )
)


;;-------------------------------------
;; Delegation 
;;-------------------------------------

(define-public (revoke (delegate <stacking-delegate-trait>) (reserve <reserve-trait>))
  (begin 
    (try! (contract-call? .dao check-is-protocol (contract-of reserve)))

    ;; Need to be done first
    (try! (handle-rewards (contract-of delegate) reserve))

    (try! (contract-call? .dao check-is-protocol contract-caller))

    (let (
      (contract-amount (get unlocked (get-stx-account (contract-of delegate))))
    )
      ;; Revoke
      (try! (contract-call? delegate revoke-delegate-stx))

      ;; Return STX
      (if (> contract-amount u0)
        (try! (as-contract (return-stx-from-stacking delegate reserve contract-amount)))
        true
      )

      ;; Set target
      (map-set target-locked-amount (contract-of delegate) u0)

      ;; TODO: print info

      (ok true)
    )
  )
)

(define-public (revoke-and-delegate (delegate <stacking-delegate-trait>) (reserve <reserve-trait>) (amount-ustx uint) (delegate-to principal) (until-burn-ht uint))
  (begin
    (try! (contract-call? .dao check-is-protocol (contract-of reserve)))

    ;; Need to be done first
    (try! (handle-rewards (contract-of delegate) reserve))

    ;; Revoke
    (try! (contract-call? delegate revoke-delegate-stx))

    (try! (contract-call? .dao check-is-protocol contract-caller))

    (let (
      (locked-amount (get locked (get-stx-account (contract-of delegate))))
      (contract-amount (get unlocked (get-stx-account (contract-of delegate))))
    )
      (asserts! (>= amount-ustx locked-amount) (err ERR_DELEGATE_AMOUNT_LOCKED))

      ;; Request STX from reserve if needed
      (if (> amount-ustx (+ contract-amount locked-amount))
        (try! (as-contract (request-stx-to-stack delegate reserve (- amount-ustx (+ contract-amount locked-amount)))))
        true
      )

      ;; Delegate STX
      (try! (contract-call? delegate delegate-stx amount-ustx delegate-to (some until-burn-ht)))

      ;; Set target
      (map-set target-locked-amount (contract-of delegate) amount-ustx)
      (map-set last-selected-pool (contract-of delegate) delegate-to)

      ;; Handle excess
      (try! (handle-excess delegate reserve))

      ;; TODO: print info

      (ok true)
    )
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

;; In case something goes wrong
(define-public (update-amounts (delegate principal) (target-locked uint) (last-locked uint) (last-contract uint))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))

    (map-set target-locked-amount delegate target-locked)
    (map-set last-locked-amount delegate last-locked)
    (map-set last-contract-amount delegate last-contract)
    (ok true)
  )
)

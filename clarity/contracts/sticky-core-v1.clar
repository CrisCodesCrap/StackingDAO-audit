;; @contract Sticky Core
;; @version 1

(use-trait sticky-reserve-trait .sticky-reserve-trait-v1.sticky-reserve-trait)

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_NOT_AUTHORIZED u19401)
(define-constant ERR_WRONG_CYCLE_ID u19001)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var withdrawal-treshold-per-cycle uint u500) ;; 5% in basis points
(define-data-var commission uint u500) ;; 5% in basis points
(define-data-var commission-accrued uint u0) ;; keeps track of commission

;; TODO: only shutdown deposits
(define-data-var shutdown-activated bool false)

;;-------------------------------------
;; Maps 
;;-------------------------------------

(define-map cycle-info
  { 
    cycle-id: uint 
  }
  {
    deposited: uint,        ;; STX
    withdraw-init: uint,    ;; stSTX
    withdraw-in: uint,      ;; stSTX
    withdraw-out: uint,     ;; STX
    rewards: uint,          ;; STX
    commission: uint        ;; STX
  }
)

(define-map withdrawals-by-address
  { 
    address: principal,
    cycle-id: uint 
  }
  {
    ststx-amount: uint      ;; stSTX
  }
)

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-withdrawal-treshold-per-cycle)
  (var-get withdrawal-treshold-per-cycle)
)

(define-read-only (get-commission)
  (var-get commission)
)

(define-read-only (get-commission-accrued)
  (var-get commission-accrued)
)

(define-read-only (get-shutdown-activated)
  (var-get shutdown-activated)
)

(define-read-only (get-cycle-info (cycle-id uint))
  (default-to
    {
      deposited: u0,
      withdraw-init: u0,
      withdraw-in: u0,
      withdraw-out: u0,
      rewards: u0,
      commission: u0
    }
    (map-get? cycle-info { cycle-id: cycle-id })
  )
)

(define-read-only (get-withdrawals-by-address (address principal) (cycle-id uint))
  (default-to
    {
      ststx-amount: u0
    }
    (map-get? withdrawals-by-address { address: address, cycle-id: cycle-id })
  )
)

(define-read-only (get-burn-height)
  burn-block-height
)

(define-read-only (get-pox-cycle)
  ;; TODO: update for mainnet
  (contract-call? 'ST000000000000000000002AMW42H.pox-2 burn-height-to-reward-cycle burn-block-height)
)

(define-public (get-stx-per-ststx (reserve-trait <sticky-reserve-trait>))
  (let (
    (stx-amount (unwrap-panic (contract-call? reserve-trait get-total-stx)))
  )
    (try! (contract-call? .sticky-dao check-is-contract-name (contract-of reserve-trait) "reserve"))
    (ok (get-stx-per-ststx-helper stx-amount))
  )
)

(define-read-only (get-stx-per-ststx-helper (stx-amount uint))
  (let (
    (ststx-supply (unwrap-panic (contract-call? .ststx-token get-total-supply)))
  )
    (if (is-eq ststx-supply u0)
      u1000000
      (/ (* stx-amount u1000000) ststx-supply)
    )
  )
)

(define-read-only (get-stx-balance (address principal))
  (stx-get-balance address)
)

;;-------------------------------------
;; User  
;;-------------------------------------

;; 
(define-public (deposit (reserve-trait <sticky-reserve-trait>) (stx-amount uint))
  (let (
    (cycle-id (get-pox-cycle))
    (current-cycle-info (get-cycle-info cycle-id))

    (stx-ststx (unwrap-panic (get-stx-per-ststx reserve-trait)))
    (ststx-to-receive (/ (* stx-amount u1000000) stx-ststx))
  )
    (try! (contract-call? .sticky-dao check-is-enabled))
    (try! (contract-call? .sticky-dao check-is-contract-name (contract-of reserve-trait) "reserve"))

    (map-set cycle-info { cycle-id: cycle-id } (merge current-cycle-info { deposited: (+ (get deposited current-cycle-info) stx-amount) }))

    (try! (stx-transfer? stx-amount tx-sender (contract-of reserve-trait)))
    (try! (contract-call? .ststx-token mint-for-sticky ststx-to-receive tx-sender))

    (ok ststx-to-receive)
  )
)

;; Initiate withdrawal, given stSTX amount and cycle
;; Can update amount as long as cycle not started
(define-public (init-withdraw (ststx-amount uint) (withdrawal-cycle uint))
  (let (
    (cycle-id (get-pox-cycle))
    (current-cycle-info (get-cycle-info withdrawal-cycle))
    (withdrawal-entry (get-withdrawals-by-address tx-sender withdrawal-cycle))

    (new-withdraw-init (+ (- (get withdraw-init current-cycle-info) (get ststx-amount withdrawal-entry)) ststx-amount))
  )
    (try! (contract-call? .sticky-dao check-is-enabled))
    (asserts! (> withdrawal-cycle cycle-id) (err ERR_WRONG_CYCLE_ID))
    ;; TODO: check the amount of withdrawals already pending
    ;; if > 5% of stacking, no withdrawal is possible in next cycle (do one after?)

    ;; Update maps
    (map-set withdrawals-by-address { address: tx-sender, cycle-id: withdrawal-cycle } { ststx-amount: ststx-amount })
    (map-set cycle-info { cycle-id: withdrawal-cycle } (merge current-cycle-info { withdraw-init: new-withdraw-init }))

    ;; Transfer stSTX token to contract, only burn on actual withdraw
    (try! (contract-call? .ststx-token transfer ststx-amount tx-sender (as-contract tx-sender) none))

    (ok ststx-amount)
  )
)

;; Actual withdrawal for given cycle
(define-public (withdraw (reserve-trait <sticky-reserve-trait>) (withdrawal-cycle uint))
  (let (
    (cycle-id (get-pox-cycle))
    (current-cycle-info (get-cycle-info withdrawal-cycle))
    (withdrawal-entry (get-withdrawals-by-address tx-sender withdrawal-cycle))

    (receiver tx-sender)
    (stx-ststx (unwrap-panic (get-stx-per-ststx reserve-trait)))
    (stx-to-receive (/ (* (get ststx-amount withdrawal-entry) stx-ststx) u1000000))
  )
    (try! (contract-call? .sticky-dao check-is-enabled))
    (try! (contract-call? .sticky-dao check-is-contract-name (contract-of reserve-trait) "reserve"))
    (asserts! (>= cycle-id withdrawal-cycle) (err ERR_WRONG_CYCLE_ID))

    ;; Update withdrawals maps so user can not withdraw again
    (map-set withdrawals-by-address { address: tx-sender, cycle-id: withdrawal-cycle } { ststx-amount: u0 })
    (map-set cycle-info { cycle-id: withdrawal-cycle } (merge current-cycle-info { 
      withdraw-in: (+ (get withdraw-in current-cycle-info) (get ststx-amount withdrawal-entry)),
      withdraw-out: (+ (get withdraw-out current-cycle-info) stx-to-receive),
    }))

    ;; STX to user, burn stSTX
    (try! (as-contract (contract-call? reserve-trait request-stx stx-to-receive receiver)))
    (try! (contract-call? .ststx-token burn-for-sticky (get ststx-amount withdrawal-entry) (as-contract tx-sender)))

    (ok stx-to-receive)
  )
)

;; Add rewards in STX for given cycle
(define-public (add-rewards (reserve principal) (stx-amount uint) (cycle-id uint))
  (let (
    (current-cycle-info (get-cycle-info cycle-id))
    (commission-amount (/ (* stx-amount (var-get commission)) u10000))
    (rewards-left (- stx-amount commission-amount))
  )
    (try! (contract-call? .sticky-dao check-is-enabled))
    (try! (contract-call? .sticky-dao check-is-contract-name reserve "reserve"))

    (var-set commission-accrued (+ commission-amount (var-get commission-accrued)))
    (map-set cycle-info { cycle-id: cycle-id } (merge current-cycle-info { 
      rewards: (+ (get rewards current-cycle-info) rewards-left),
      commission: (+ (get commission current-cycle-info) commission-amount)
    }))

    (if (> commission-amount u0)
      (try! (stx-transfer? commission-amount tx-sender (as-contract tx-sender)))
      true
    )
    (try! (stx-transfer? rewards-left tx-sender reserve))

    (ok stx-amount)
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

(define-public (set-withdrawal-treshold (new-treshold uint))
  (begin
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))

    (var-set withdrawal-treshold-per-cycle new-treshold)
    (ok true)
  )
)

(define-public (set-commission (new-commission uint))
  (begin
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))

    (var-set commission new-commission)
    (ok true)
  )
)

(define-public (toggle-shutdown)
  (begin
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))

    (ok (var-set shutdown-activated (not (var-get shutdown-activated))))
  )
)

(define-public (withdraw-commission)
  (let (
    (commission-amount (get-commission-accrued))
  )
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))

    (var-set commission-accrued u0)

    (try! (stx-transfer? commission-amount (as-contract tx-sender) tx-sender))

    (ok commission-amount)
  )
)

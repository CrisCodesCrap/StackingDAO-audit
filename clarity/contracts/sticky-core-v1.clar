;; @contract Sticky Core
;; @version 1

(use-trait sticky-reserve-trait .sticky-reserve-trait-v1.sticky-reserve-trait)
(use-trait sticky-commission-trait .sticky-commission-trait-v1.sticky-commission-trait)
(use-trait sticky-staking-trait .sticky-staking-trait-v1.sticky-staking-trait)

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_WRONG_CYCLE_ID u19001)
(define-constant ERR_SHUTDOWN u19002)
(define-constant ERR_WITHDRAW_EXCEEDED u19003)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var withdrawal-treshold-per-cycle uint u500) ;; 5% in basis points
(define-data-var commission uint u500) ;; 5% in basis points

(define-data-var shutdown-deposits bool false)
(define-data-var shutdown-withdrawals bool false)

;;-------------------------------------
;; Maps 
;;-------------------------------------

(define-map cycle-info
  { 
    cycle-id: uint 
  }
  {
    deposited: uint,        ;; STX
    withdraw-init: uint,    ;; STX
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
    stx-amount: uint,
    ststx-amount: uint
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

(define-read-only (get-shutdown-deposits)
  (var-get shutdown-deposits)
)

(define-read-only (get-shutdown-withdrawals)
  (var-get shutdown-withdrawals)
)

(define-read-only (get-cycle-info (cycle-id uint))
  (default-to
    {
      deposited: u0,
      withdraw-init: u0,
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
      stx-amount: u0,
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
  (contract-call? .pox-3-mock current-pox-reward-cycle)
)

(define-read-only (get-stx-balance (address principal))
  (stx-get-balance address)
)

;; Get first cycle in which user can withdraw
;; It's the current cycle if prepare phase not started, otherwise the next cycle
(define-read-only (get-next-withdraw-cycle)
  (let (
    (current-cycle (get-pox-cycle))
    (prepare-length (get prepare-cycle-length (unwrap-panic (contract-call? .pox-3-mock get-pox-info))))
    (start-block-next-cycle (contract-call? .pox-3-mock reward-cycle-to-burn-height (+ current-cycle u1)))
  )
    (if (> burn-block-height (- start-block-next-cycle prepare-length))
      ;; Prepare phase
      (+ current-cycle u2)
      ;; Normal
      (+ current-cycle u1)
    )
  )
)

;;-------------------------------------
;; STX per stSTX  
;;-------------------------------------

(define-public (get-stx-per-ststx (reserve-trait <sticky-reserve-trait>))
  (let (
    (stx-amount (unwrap-panic (contract-call? reserve-trait get-total-stx)))
  )
    (try! (contract-call? .sticky-dao check-is-protocol (contract-of reserve-trait)))
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
    (try! (contract-call? .sticky-dao check-is-protocol (contract-of reserve-trait)))
    (asserts! (not (get-shutdown-deposits)) (err ERR_SHUTDOWN))

    (map-set cycle-info { cycle-id: cycle-id } (merge current-cycle-info { deposited: (+ (get deposited current-cycle-info) stx-amount) }))

    (try! (stx-transfer? stx-amount tx-sender (contract-of reserve-trait)))
    (try! (contract-call? .ststx-token mint-for-sticky ststx-to-receive tx-sender))

    (ok ststx-to-receive)
  )
)

;; Initiate withdrawal, given stSTX amount and cycle
;; Can update amount as long as cycle not started
(define-public (init-withdraw (reserve-trait <sticky-reserve-trait>) (ststx-amount uint) (withdrawal-cycle uint))
  (let (
    (cycle-id (get-pox-cycle))
    (current-cycle-info (get-cycle-info withdrawal-cycle))

    (stx-ststx (unwrap-panic (get-stx-per-ststx reserve-trait)))
    (stx-to-receive (/ (* ststx-amount stx-ststx) u1000000))
    (total-stx (unwrap-panic (contract-call? reserve-trait get-total-stx)))

    (withdrawal-entry (get-withdrawals-by-address tx-sender withdrawal-cycle))
    (new-withdraw-init (+ (- (get withdraw-init current-cycle-info) (get stx-amount withdrawal-entry)) stx-to-receive))
  )
    (try! (contract-call? .sticky-dao check-is-enabled))
    (try! (contract-call? .sticky-dao check-is-protocol (contract-of reserve-trait)))
    (asserts! (not (get-shutdown-withdrawals)) (err ERR_SHUTDOWN))
    (asserts! (>= withdrawal-cycle (get-next-withdraw-cycle)) (err ERR_WRONG_CYCLE_ID))
    (asserts! (<= new-withdraw-init (/ (* (get-withdrawal-treshold-per-cycle) total-stx) u10000)) (err ERR_WITHDRAW_EXCEEDED))

    ;; Update maps
    (map-set withdrawals-by-address { address: tx-sender, cycle-id: withdrawal-cycle } { stx-amount: stx-to-receive, ststx-amount: ststx-amount })
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
    (stx-to-receive (get stx-amount withdrawal-entry))
  )
    (try! (contract-call? .sticky-dao check-is-enabled))
    (try! (contract-call? .sticky-dao check-is-protocol (contract-of reserve-trait)))
    (asserts! (not (get-shutdown-withdrawals)) (err ERR_SHUTDOWN))
    (asserts! (>= cycle-id withdrawal-cycle) (err ERR_WRONG_CYCLE_ID))

    ;; Update withdrawals maps so user can not withdraw again
    (map-set withdrawals-by-address { address: tx-sender, cycle-id: withdrawal-cycle } { stx-amount: u0, ststx-amount: u0 })
    (map-set cycle-info { cycle-id: withdrawal-cycle } (merge current-cycle-info { 
      withdraw-out: (+ (get withdraw-out current-cycle-info) stx-to-receive),
    }))

    ;; STX to user, burn stSTX
    (try! (as-contract (contract-call? reserve-trait request-stx stx-to-receive receiver)))
    (try! (contract-call? .ststx-token burn-for-sticky (get ststx-amount withdrawal-entry) (as-contract tx-sender)))

    (ok stx-to-receive)
  )
)

;; Add rewards in STX for given cycle
(define-public (add-rewards 
  (commission-trait <sticky-commission-trait>) 
  (staking-trait <sticky-staking-trait>) 
  (reserve principal) 
  (stx-amount uint) 
  (cycle-id uint)
)
  (let (
    (current-cycle-info (get-cycle-info cycle-id))
    (commission-amount (/ (* stx-amount (var-get commission)) u10000))
    (rewards-left (- stx-amount commission-amount))
  )
    (try! (contract-call? .sticky-dao check-is-enabled))
    (try! (contract-call? .sticky-dao check-is-protocol reserve))
    (try! (contract-call? .sticky-dao check-is-protocol (contract-of commission-trait)))
    (try! (contract-call? .sticky-dao check-is-protocol (contract-of staking-trait)))

    (map-set cycle-info { cycle-id: cycle-id } (merge current-cycle-info { 
      rewards: (+ (get rewards current-cycle-info) rewards-left),
      commission: (+ (get commission current-cycle-info) commission-amount)
    }))

    (if (> commission-amount u0)
      (try! (contract-call? commission-trait add-commission staking-trait commission-amount))
      u0
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
    (try! (contract-call? .sticky-dao check-is-protocol tx-sender))

    (var-set withdrawal-treshold-per-cycle new-treshold)
    (ok true)
  )
)

(define-public (set-commission (new-commission uint))
  (begin
    (try! (contract-call? .sticky-dao check-is-protocol tx-sender))

    (var-set commission new-commission)
    (ok true)
  )
)

(define-public (set-shutdown-deposits (shutdown bool))
  (begin
    (try! (contract-call? .sticky-dao check-is-protocol tx-sender))
    
    (var-set shutdown-deposits shutdown)
    (ok true)
  )
)

(define-public (set-shutdown-withdrawals (shutdown bool))
  (begin
    (try! (contract-call? .sticky-dao check-is-protocol tx-sender))

    (var-set shutdown-withdrawals shutdown)
    (ok true)
  )
)

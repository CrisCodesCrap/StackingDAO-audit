;; Sticky Core
;;

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR-NOT-AUTHORIZED u19401)
(define-constant ERR-WRONG-CYCLE-ID u19001)

;;-------------------------------------
;; Variables
;;-------------------------------------

;; TODO: create governance contract
(define-constant CONTRACT-OWNER tx-sender)
(define-data-var guardian-address principal tx-sender)
(define-data-var withdrawal-treshold-per-cycle uint u500) ;; 5% in basis points
(define-data-var commission uint u500) ;; 5% in basis points
(define-data-var commission-accrued uint u0) ;; keeps track of commission

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


(define-map contracts
  { 
    name: (string-ascii 256) 
  }
  {
    address: principal, ;; e.g. 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
    qualified-name: principal ;; e.g. 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-core
  }
)

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-guardian-address)
  (var-get guardian-address)
)

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

(define-read-only (get-stx-per-ststx)
  (let (
    (ststx-supply (unwrap-panic (contract-call? .ststx-token get-total-supply)))
    (stx-supply (- (stx-get-balance (as-contract tx-sender)) (var-get commission-accrued)))
  )
    (if (is-eq ststx-supply u0)
      u1000000
      (/ (* stx-supply u1000000) ststx-supply)
    )
  )
)

(define-read-only (get-stx-balance (address principal))
  (stx-get-balance address)
)

;; TODO: move to DAO contract
(define-read-only (get-qualified-name-by-name (name (string-ascii 256)))
  (get qualified-name (map-get? contracts { name: name }))
)

;;-------------------------------------
;; Helpers 
;;-------------------------------------

(define-public (request-stx-to-stack (requested-ustx uint))
  (begin
    (asserts!
      (or
       (is-eq contract-caller (unwrap-panic (get-qualified-name-by-name "stacker-1")))
       (is-eq contract-caller (unwrap-panic (get-qualified-name-by-name "stacker-2")))
       (is-eq contract-caller (unwrap-panic (get-qualified-name-by-name "stacker-3")))
       (is-eq contract-caller (unwrap-panic (get-qualified-name-by-name "stacker-4")))
       (is-eq contract-caller (unwrap-panic (get-qualified-name-by-name "stacker-5")))
       (is-eq contract-caller (unwrap-panic (get-qualified-name-by-name "stacker-6")))
       (is-eq contract-caller (unwrap-panic (get-qualified-name-by-name "stacker-7")))
       (is-eq contract-caller (unwrap-panic (get-qualified-name-by-name "stacker-8")))
       (is-eq contract-caller (unwrap-panic (get-qualified-name-by-name "stacker-9")))
       (is-eq contract-caller (unwrap-panic (get-qualified-name-by-name "stacker-10")))
      )
      (err ERR-NOT-AUTHORIZED)
    )

    (as-contract (stx-transfer? requested-ustx tx-sender contract-caller))
  )
)

;;-------------------------------------
;; User  
;;-------------------------------------

;; 
(define-public (deposit (stx-amount uint))
  (let (
    (cycle-id (get-pox-cycle))
    (current-cycle-info (get-cycle-info cycle-id))

    (stx-ststx (get-stx-per-ststx))
    (ststx-to-receive (/ (* stx-amount u1000000) stx-ststx))
  )
    (map-set cycle-info { cycle-id: cycle-id } (merge current-cycle-info { deposited: (+ (get deposited current-cycle-info) stx-amount) }))

    ;; TODO: keep STX in other contract
    (try! (stx-transfer? stx-amount tx-sender (as-contract tx-sender)))
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
    (asserts! (> withdrawal-cycle cycle-id) (err ERR-WRONG-CYCLE-ID))
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
(define-public (withdraw (withdrawal-cycle uint))
  (let (
    (cycle-id (get-pox-cycle))
    (current-cycle-info (get-cycle-info withdrawal-cycle))
    (withdrawal-entry (get-withdrawals-by-address tx-sender withdrawal-cycle))

    (receiver tx-sender)
    (stx-ststx (get-stx-per-ststx))
    (stx-to-receive (/ (* (get ststx-amount withdrawal-entry) stx-ststx) u1000000))
  )
    (asserts! (>= cycle-id withdrawal-cycle) (err ERR-WRONG-CYCLE-ID))

    ;; Update withdrawals maps so user can not withdraw again
    (map-set withdrawals-by-address { address: tx-sender, cycle-id: withdrawal-cycle } { ststx-amount: u0 })
    (map-set cycle-info { cycle-id: withdrawal-cycle } (merge current-cycle-info { 
      withdraw-in: (+ (get withdraw-in current-cycle-info) (get ststx-amount withdrawal-entry)),
      withdraw-out: (+ (get withdraw-out current-cycle-info) stx-to-receive),
    }))

    ;; STX to user, burn stSTX
    (try! (as-contract (stx-transfer? stx-to-receive tx-sender receiver)))
    (try! (contract-call? .ststx-token burn-for-sticky (get ststx-amount withdrawal-entry) (as-contract tx-sender)))

    (ok stx-to-receive)
  )
)

;; Add rewards in STX for given cycle
(define-public (add-rewards (stx-amount uint) (cycle-id uint))
  (let (
    (current-cycle-info (get-cycle-info cycle-id))
    (commission-amount (/ (* stx-amount (var-get commission)) u10000))
    (rewards-left (- stx-amount commission-amount))
  )
    (var-set commission-accrued (+ commission-amount (var-get commission-accrued)))
    (map-set cycle-info { cycle-id: cycle-id } (merge current-cycle-info { 
      rewards: (+ (get rewards current-cycle-info) rewards-left),
      commission: (+ (get commission current-cycle-info) commission-amount)
    }))

    (try! (stx-transfer? stx-amount tx-sender (as-contract tx-sender)))

    (ok stx-amount)
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

(define-public (set-withdrawal-treshold (new-treshold uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

    (var-set withdrawal-treshold-per-cycle new-treshold)
    (ok true)
  )
)

(define-public (set-guardian-address (new-guardian principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

    (var-set guardian-address new-guardian)
    (ok true)
  )
)

(define-public (set-commission (new-commission uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

    (var-set commission new-commission)
    (ok true)
  )
)

(define-public (toggle-shutdown)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

    (ok (var-set shutdown-activated (not (var-get shutdown-activated))))
  )
)

(define-public (withdraw-commission)
  (let (
    (commission-amount (get-commission-accrued))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

    (var-set commission-accrued u0)

    (try! (stx-transfer? commission-amount (as-contract tx-sender) tx-sender))

    (ok commission-amount)
  )
)

;; TODO: update for mainnet
(begin
  (map-set contracts
    { name: "stacker-1" }
    {
      address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
      qualified-name: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-1
    }
  )
  (map-set contracts
    { name: "stacker-2" }
    {
      address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
      qualified-name: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-2
    }
  )
  (map-set contracts
    { name: "stacker-3" }
    {
      address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
      qualified-name: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-3
    }
  )
  (map-set contracts
    { name: "stacker-4" }
    {
      address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
      qualified-name: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-4
    }
  )
  (map-set contracts
    { name: "stacker-5" }
    {
      address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
      qualified-name: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-5
    }
  )
  (map-set contracts
    { name: "stacker-6" }
    {
      address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
      qualified-name: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-6
    }
  )
  (map-set contracts
    { name: "stacker-7" }
    {
      address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
      qualified-name: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-7
    }
  )
  (map-set contracts
    { name: "stacker-8" }
    {
      address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
      qualified-name: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-8
    }
  )
  (map-set contracts
    { name: "stacker-9" }
    {
      address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
      qualified-name: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-9
    }
  )
  (map-set contracts
    { name: "stacker-10" }
    {
      address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
      qualified-name: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-10
    }
  )
)

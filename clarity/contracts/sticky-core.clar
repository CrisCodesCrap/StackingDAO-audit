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
;; TODO: set/get commission
(define-data-var commission uint u500) ;; 5% in basis points
(define-data-var commission-accrued uint u0) ;; keeps track of commission

(define-data-var shutdown-activated bool false)

;;-------------------------------------
;; Maps 
;;-------------------------------------

(define-map cycle-info
  { cycle-id: uint }
  {
    deposited: uint,
    withdrawn: uint,
    rewards: uint
  }
)

;; TODO: should be able to withdraw multiple times, in different cycles
(define-map withdrawals-by-address
  { address: principal }
  {
    minimum-cycle-id: uint,
    amount: uint
  }
)


(define-map contracts
  { name: (string-ascii 256) }
  {
    address: principal, ;; e.g. 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
    qualified-name: principal ;; e.g. 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-core
  }
)

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-shutdown-activated)
  (var-get shutdown-activated)
)

(define-read-only (get-guardian-address)
  (var-get guardian-address)
)

(define-read-only (get-cycle-info (cycle-id uint))
  (default-to
    {
      deposited: u0,
      withdrawn: u0,
      rewards: u0
    }
    (map-get? cycle-info { cycle-id: cycle-id })
  )
)

(define-read-only (get-withdrawals-by-address (address principal))
  (default-to
    {
      minimum-cycle-id: u999999999999999,
      amount: u0
    }
    (map-get? withdrawals-by-address { address: address })
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
    (stx-supply (stx-get-balance (as-contract tx-sender)))
  )
    (if (is-eq ststx-supply u0)
      ;; TODO: more decimals?
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

;; #[allow(unchecked_params)]
(define-public (deposit (amount uint))
  (let (
    (cycle-id (get-pox-cycle))
    (current-cycle-info (get-cycle-info cycle-id))

    (stx-ststx (get-stx-per-ststx))
    (ststx-to-receive (/ (* amount u1000000) stx-ststx))
  )
    (map-set cycle-info { cycle-id: cycle-id } (merge current-cycle-info { deposited: (+ (get deposited current-cycle-info) amount) }))

    ;; TODO: keep STX in other contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (try! (contract-call? .ststx-token mint-for-sticky ststx-to-receive tx-sender))

    (ok ststx-to-receive)
  )
)

;; #[allow(unchecked_params)]
;; TODO: amount = stSTX amount
(define-public (init-withdraw (amount uint) (withdrawal-cycle uint))
  (let (
    (cycle-id (get-pox-cycle))
    (current-cycle-info (get-cycle-info cycle-id))
  )
    (asserts! (> withdrawal-cycle cycle-id) (err ERR-WRONG-CYCLE-ID))
    ;; TODO: check the amount of withdrawals already pending
    ;; if > 5% of stacking, no withdrawal is possible in next cycle (do one after?)

    (map-set cycle-info { cycle-id: withdrawal-cycle } (merge current-cycle-info { withdrawn: (+ (get withdrawn current-cycle-info) amount) }))

    (map-set withdrawals-by-address { address: tx-sender } {
      minimum-cycle-id: withdrawal-cycle,
      amount: amount, ;; TODO: add current pending amount? 
    })

    ;; Transfer token to contract, only burn on actual withdraw
    (try! (contract-call? .ststx-token transfer amount tx-sender (as-contract tx-sender) none))

    (ok true)
  )
)

;; #[allow(unchecked_params)]
(define-public (withdraw)
  (let (
    (cycle-id (get-pox-cycle))
    (withdrawal-entry (get-withdrawals-by-address tx-sender))

    (receiver tx-sender)
    (stx-ststx (get-stx-per-ststx))
    (stx-to-receive (/ (* (get amount withdrawal-entry) stx-ststx) u1000000))
  )
    (asserts! (>= cycle-id (get minimum-cycle-id withdrawal-entry)) (err ERR-WRONG-CYCLE-ID))
    (try! (as-contract (stx-transfer? stx-to-receive tx-sender receiver)))

    ;; TODO: update withdraw entry so can not withdraw again.

    (try! (contract-call? .ststx-token burn-for-sticky (get amount withdrawal-entry) (as-contract tx-sender)))

    (ok stx-to-receive)
  )
)

;; add rewards in STX
;; amount is in micro STX
(define-public (add-rewards (amount uint))
  (let (
    (cycle-id (get-pox-cycle)) ;; TODO: convert to param for flexibility
    (current-cycle-info (get-cycle-info cycle-id))
    (commission-amount (/ (* amount (var-get commission)) u10000))
  )

    ;; TODO: need to track commission and take into account in stSTX/STX ratio
    ;; Just send comission to address immediately? Can be contract (need trait)

    (var-set commission-accrued (+ commission-amount (var-get commission-accrued)))
    (map-set cycle-info { cycle-id: cycle-id } (merge current-cycle-info { rewards: (+ (get rewards current-cycle-info) amount) }))

    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))

    (ok amount)
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

(define-public (set-withdrawal-treshold (treshold uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

    (var-set withdrawal-treshold-per-cycle treshold)
    (ok true)
  )
)

(define-public (set-guardian-address (guardian principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

    (var-set guardian-address guardian)
    (ok true)
  )
)

(define-public (toggle-shutdown)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

    (ok (var-set shutdown-activated (not (var-get shutdown-activated))))
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

;; Sticky Core

(define-constant ERR-NOT-AUTHORIZED u19401)
(define-constant ERR-WRONG-CYCLE-ID u19001)

(define-constant CONTRACT-OWNER tx-sender)
(define-data-var guardian-address principal tx-sender)
(define-data-var withdrawal-treshold-per-cycle uint u500) ;; 5% in basis points
(define-data-var commission uint u500) ;; 5% in basis points
(define-data-var commission-accrued uint u0) ;; keeps track of commission
(define-data-var total-deposits uint u0)
(define-data-var total-rewards uint u0)
(define-data-var shutdown-activated bool false)

(define-map deposits
  { cycle-id: uint }
  {
    amount: uint
  }
)

(define-map withdrawals
  { cycle-id: uint }
  {
    amount: uint
  }
)

(define-map withdrawals-by-address
  { address: principal }
  {
    minimum-cycle-id: uint,
    amount: uint
  }
)

(define-map stx-ratios
  { cycle-id: uint }
  { ratio: uint }
)

(define-map tokens-to-stack
  { stacker-name: (string-ascii 256) }
  {
    amount: uint
  }
)

(define-read-only (get-shutdown-activated)
  (var-get shutdown-activated)
)

(define-read-only (get-guardian-address)
  (var-get guardian-address)
)

(define-read-only (get-deposits-by-cycle (cycle-id uint))
  (default-to
    {
      amount: u0
    }
    (map-get? deposits { cycle-id: cycle-id })
  )
)

(define-read-only (get-withdrawals-by-cycle (cycle-id uint))
  (default-to
    {
      amount: u0
    }
    (map-get? withdrawals { cycle-id: cycle-id })
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

(define-read-only (get-stx-balance (address principal))
  (stx-get-balance address)
)

(define-read-only (get-burn-height)
  burn-block-height
)

(define-read-only (get-total-rewards)
  (var-get total-rewards)
)

(define-read-only (get-pox-cycle)
  (contract-call? 'ST000000000000000000002AMW42H.pox-2 burn-height-to-reward-cycle burn-block-height)
)

;;(define-read-only (ststx-per-stx)
;;  (let (
;;    (cycle-id (contract-call? 'ST000000000000000000002AMW42H.pox-2 burn-height-to-reward-cycle burn-block-height))
;;    (deposit-entry (get-deposits-by-cycle cycle-id))
;;    (deposit-amount
;;      (if (> (var-get total-deposits) (get amount deposit-entry))
;;        (- (var-get total-deposits) (get amount deposit-entry))
;;        (var-get total-deposits)
;;      )
;;    )
;;  )
;;    (print deposit-entry)
;;    (print deposit-amount)
;;    (print (var-get total-rewards))
;;    (* u1000000 (/ (+ (var-get total-rewards) deposit-amount) deposit-amount))
;;  )
;;)

(define-read-only (stx-per-ststx)
  (let (
    (deposit-amount (var-get total-deposits))
    (num (* u1000000 (+ (var-get total-rewards) deposit-amount)))
  )
    (if (> deposit-amount u0)
      (/ num deposit-amount)
      u1000000
    )
  )
)

;;;;;;;;;;;;;;;;;;;;;;
;; Public Functions ;;
;;;;;;;;;;;;;;;;;;;;;;

(define-public (request-stx-to-stack (name (string-ascii 256)) (requested-ustx uint))
  (let (
    (stacker (unwrap-panic (map-get? tokens-to-stack { stacker-name: name })))
  )
    ;; TODO: authorization
    ;; (asserts!
    ;;   (or
    ;;     (is-eq contract-caller (unwrap-panic (contract-call? .sticky-core get-qualified-name-by-name "stacker")))
    ;;     (is-eq contract-caller (unwrap-panic (contract-call? .sticky-core get-qualified-name-by-name "stacker-2")))
    ;;     (is-eq contract-caller (unwrap-panic (contract-call? .sticky-core get-qualified-name-by-name "stacker-3")))
    ;;     (is-eq contract-caller (unwrap-panic (contract-call? .sticky-core get-qualified-name-by-name "stacker-4")))
    ;;   )
    ;;   (err ERR-NOT-AUTHORIZED)
    ;; )
    (asserts! (<= requested-ustx (get amount stacker)) (err ERR-NOT-AUTHORIZED))

    (as-contract
      (stx-transfer? requested-ustx tx-sender .sticky-stacker-1) ;; TODO: make dynamic
    )
  )
)

(define-public (set-withdrawal-treshold (treshold uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

    (var-set withdrawal-treshold-per-cycle treshold)
    (ok true)
  )
)

(define-public (set-guardian-address (guardian principal))
  (begin
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

;; #[allow(unchecked_params)]
(define-public (deposit (amount uint))
  (let (
    (cycle-id (get-pox-cycle))
    (deposit-entry (get-deposits-by-cycle cycle-id))
  )
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set deposits { cycle-id: cycle-id } { amount: (+ (get amount deposit-entry) amount) })
    (var-set total-deposits (+ amount (var-get total-deposits)))
    (print (stx-per-ststx))
    (try! (contract-call? .ststx-token mint-for-sticky (/ (* u1000000 amount) (stx-per-ststx)) tx-sender))

    (ok true)
  )
)

;; #[allow(unchecked_params)]
(define-public (init-withdraw (amount uint) (withdrawal-cycle uint))
  (let (
    (cycle-id (get-pox-cycle))
    (withdrawal-entry (get-withdrawals-by-cycle (+ cycle-id u1)))
  )
    (asserts! (> withdrawal-cycle cycle-id) (err ERR-WRONG-CYCLE-ID))
    ;; TODO: check the amount of withdrawals already pending
    ;; if > 5% of stacking, no withdrawal is possible in next cycle (do one after?)

    (map-set withdrawals { cycle-id: withdrawal-cycle } { amount: (+ (get amount withdrawal-entry) amount) })
    (map-set withdrawals-by-address { address: tx-sender } {
      minimum-cycle-id: withdrawal-cycle,
      ;; #[allow(unchecked_data)]
      amount: amount, ;; TODO: add current pending amount? or only allow 1 withdrawal per cycle?
    })
    (try! (contract-call? .ststx-token burn-for-sticky amount tx-sender))
    (ok true)
  )
)

;; #[allow(unchecked_params)]
(define-public (withdraw)
  (let (
    (cycle-id (get-pox-cycle))
    (withdrawal-entry (get-withdrawals-by-address tx-sender))
    (multiplier (stx-per-ststx))
    (receiver tx-sender)
  )
    (asserts! (>= cycle-id (get minimum-cycle-id withdrawal-entry)) (err ERR-NOT-AUTHORIZED))
    (print multiplier)
    (try! (as-contract (stx-transfer? (/ (* multiplier (get amount withdrawal-entry)) u1000000) tx-sender receiver)))

    (ok true)
  )
)

;; add rewards in STX
;; amount is in micro STX
(define-public (add-rewards (amount uint))
  (let (
    (rewards (var-get total-rewards))
    (cycle-id (get-pox-cycle)) ;; TODO: convert to param for flexibility
    (commission-amount (/ (* amount (var-get commission)) u10000))
  )
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (var-set total-rewards (+ rewards (- amount commission-amount)))
    (map-set stx-ratios { cycle-id: cycle-id } { ratio: (stx-per-ststx) })
    (var-set commission-accrued (+ commission-amount (var-get commission-accrued)))

    (ok true)
  )
)


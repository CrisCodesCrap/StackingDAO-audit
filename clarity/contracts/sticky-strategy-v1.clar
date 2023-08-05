;; @contract Sticky Stacking Strategy
;; @version 1

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant stacker-ids (list u1 u2 u3 u4 u5))

;;-------------------------------------
;; Stackers info
;;-------------------------------------

(define-map stacker-info
  { 
    id: uint
  }
  {
    percentage: uint,
    pox-address: { version: (buff 1), hashbytes: (buff 32) }
  }
)

(define-read-only (get-stacker-info (id uint))
  (unwrap-panic (map-get? stacker-info { id: id }))
)

;;-------------------------------------
;; Temporary storage for calculations
;;-------------------------------------

(define-data-var total-stacked-new uint u0)

(define-read-only (get-total-stacked-new)
  (var-get total-stacked-new)
)

;;
;; Inflow
;;

(define-data-var inflow-to-assign uint u0)

(define-read-only (get-inflow-to-assign)
  (var-get inflow-to-assign)
)

(define-map stacker-inflow { id: uint } { extra: uint })

(define-read-only (get-stacker-inflow (id uint))
  (unwrap-panic (map-get? stacker-inflow { id: id }))
)

;;
;; Outflow
;;

(define-data-var total-outflow uint u0)

(define-read-only (get-total-outflow)
  (var-get total-outflow)
)

(define-data-var minimum-leftover uint u0)

(define-read-only (get-minimum-leftover)
  (var-get minimum-leftover)
)

(define-data-var stackers-to-stop (list 3 uint) (list ))

(define-read-only (get-stackers-to-stop)
  (var-get stackers-to-stop)
)


;;-------------------------------------
;; PoX info 
;;-------------------------------------

(define-read-only (get-pox-cycle)
  ;; TODO: update for mainnet
  (contract-call? 'ST000000000000000000002AMW42H.pox-2 current-pox-reward-cycle)
)

;;-------------------------------------
;; Inflow/outflow info 
;;-------------------------------------

(define-read-only (get-total-stacking)
  (unwrap-panic (contract-call? .sticky-reserve-v1 get-stx-in-use))
)

(define-read-only (get-outflow-inflow)
  (let (
    (next-cycle-info (contract-call? .sticky-core-v1 get-cycle-info (+ (get-pox-cycle) u1)))
    (total-withdrawals (get withdraw-init next-cycle-info))
    (total-idle (unwrap-panic (contract-call? .sticky-reserve-v1 get-stx-idle)))

    (outflow 
      (if (> total-withdrawals total-idle)
        (- total-withdrawals total-idle)
        u0
      )
    )

    (inflow 
      (if (> total-idle total-withdrawals )
        (- total-idle total-withdrawals )
        u0
      )
    )
  )
    { outflow: outflow, inflow: inflow }
  )
)

;;-------------------------------------
;; Perform 
;;-------------------------------------

(define-public (perform-stacking)
  (let (
    ;; Need to return all idle STX from stackers to reserve first
    ;; So all reserve info is up to date
    (result-return (map stackers-return-stx stacker-ids))

    ;; Calculate outflow/inflow
    (outflow-inflow (get-outflow-inflow))
    (outflow (get outflow outflow-inflow))
    (inflow (get inflow outflow-inflow))
  )
    ;; TOOD: should only be able to perform once at end of cycle
    (if (> outflow u0)
      (perform-stacking-outflow outflow)
      (perform-stacking-inflow inflow)
    )
  )
)

;;-------------------------------------
;; Perform outflow 
;;-------------------------------------

(define-public (calculate-stacking-outflow (outflow uint))
  (begin
    (var-set total-outflow outflow)
    (var-set total-stacked-new (- (get-total-stacking) outflow))
    (var-set minimum-leftover (get-total-stacking))
    (var-set stackers-to-stop (list ))

    ;; Try different combinations, find most efficient one
    ;; Outflow per cycle can be max 5%, so stopping one or two stackers should always be sufficient
    (unwrap-panic (calculate-and-set-minimum-leftover (list u1) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u2) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u3) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u4) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u5) outflow))

    (unwrap-panic (calculate-and-set-minimum-leftover (list u1 u2) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u2 u3) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u3 u4) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u4 u5) outflow))

    (ok true)
  )
)

(define-private (perform-stacking-outflow (outflow uint))
  (let (
    (result-calculate (calculate-stacking-outflow outflow))
    (result-perform (map perform-stacking-outflow-for-stacker stacker-ids))
  )
    (ok true)
  )
)

(define-private (perform-stacking-outflow-for-stacker (stacker-id uint))
  (let (
    (info (get-stacker-info stacker-id))
  )
    (if (is-eq (index-of (var-get stackers-to-stop) stacker-id) none)
      (try! (stackers-stack-extend stacker-id (get pox-address info)))
      u0
    )
    (ok true)
  )
)

(define-public (calculate-and-set-minimum-leftover (ids (list 3 uint)) (outflow uint))
  (let (
    (stacking-amounts (map stackers-get-total-stacking ids))
    (stacking-amount (fold + stacking-amounts u0))
  )
    ;; Total stacking amount more than outflow
    (if (> stacking-amount outflow)
      (let (
        (leftover (- stacking-amount outflow))
      )
        ;; Set minimum-leftover if leftover is smallest
        (if (< leftover (var-get minimum-leftover))
          (begin
            (var-set stackers-to-stop ids)
            (var-set minimum-leftover leftover)
          )
          false
        )
      )
      false
    )
    (ok true)
  )
)

;;-------------------------------------
;; Perform inflow
;;-------------------------------------

(define-public (calculate-stacking-inflow (inflow uint))
  (begin
    (var-set total-stacked-new (+ (get-total-stacking) inflow))
    (var-set inflow-to-assign inflow)
    
    (let (
      (result-calculate (map calculate-stacking-inflow-for-stacker stacker-ids))
    )
      (ok true)
    )
  )
)

(define-private (perform-stacking-inflow (inflow uint))
  (let (
    (result-calculate (calculate-stacking-inflow inflow))
    (result-perform (map perform-stacking-inflow-for-stacker stacker-ids))
  )
    (ok true)
  )
)

;; Calculate amount of extra tokens to stack for stacker and save
(define-private (calculate-stacking-inflow-for-stacker (stacker-id uint))
  (let (
    (inflow-assign (var-get inflow-to-assign))
    (info (get-stacker-info stacker-id))
    (stacking-amount (stackers-get-total-stacking stacker-id))
    (should-stack-amount (/ (* (get percentage info) (var-get total-stacked-new)) u10000))
  )
    ;; Check if already stacking enough based on percentage for stacker
    (if (> should-stack-amount stacking-amount)
      (let (
        (difference (- should-stack-amount stacking-amount))
      )
        ;; Check if extra needed does not exceed amount still to be assigned
        ;; Can happen because of rounding errors
        (if (> inflow-assign difference)
          (begin
            (var-set inflow-to-assign (- inflow-assign difference))
            (map-set stacker-inflow { id: stacker-id } { extra: difference })
          )
          (begin
            (var-set inflow-to-assign u0)
            (map-set stacker-inflow { id: stacker-id } { extra: inflow-assign })
          )
        )
      )

      ;; Already stacking enough, do not add extra
      (map-set stacker-inflow { id: stacker-id } { extra: u0 })
    )
    (ok true)
  )
)

(define-private (perform-stacking-inflow-for-stacker (stacker-id uint))
  (let (
    (info (get-stacker-info stacker-id))
    (inflow (get-stacker-inflow stacker-id))
    (stacking-amount (stackers-get-total-stacking stacker-id))
  )
    (if (is-eq stacking-amount u0)
      ;; If stacker is not stacking, initiate
      ;; TODO: need to set burn height
      (try! (stackers-initiate-stacking stacker-id (get pox-address info) (get extra inflow) u0))

      (if (> (get extra inflow) u0)
        ;; Extra inflow, so increase and extend
        (begin
          (try! (stackers-stack-increase stacker-id (get extra inflow)))
          (try! (stackers-stack-extend stacker-id (get pox-address info)))
        )
        ;; No extra inflow, just extend
        (try! (stackers-stack-extend stacker-id (get pox-address info)))
      )
    )
    (ok true)
  )
)

;;-------------------------------------
;; Stacker Actions 
;;-------------------------------------

;; TODO: update stacker contracts
(define-read-only (stackers-get-total-stacking (stacker-id uint))
  (if (is-eq stacker-id u1) (contract-call? .sticky-stacker-1 get-stx-stacked)
  (if (is-eq stacker-id u2) (contract-call? .sticky-stacker-1 get-stx-stacked)
  (if (is-eq stacker-id u3) (contract-call? .sticky-stacker-1 get-stx-stacked)
  (if (is-eq stacker-id u4) (contract-call? .sticky-stacker-1 get-stx-stacked)
  (if (is-eq stacker-id u5) (contract-call? .sticky-stacker-1 get-stx-stacked)
   u0
  )))))
)

;; TODO: update stacker contracts
(define-public (stackers-return-stx (stacker-id uint))
  (if (is-eq stacker-id u1) (contract-call? .sticky-stacker-1 return-stx .sticky-reserve-v1)
  (if (is-eq stacker-id u2) (contract-call? .sticky-stacker-1 return-stx .sticky-reserve-v1)
  (if (is-eq stacker-id u3) (contract-call? .sticky-stacker-1 return-stx .sticky-reserve-v1)
  (if (is-eq stacker-id u4) (contract-call? .sticky-stacker-1 return-stx .sticky-reserve-v1)
  (if (is-eq stacker-id u5) (contract-call? .sticky-stacker-1 return-stx .sticky-reserve-v1)
    (ok u0)
  )))))
)

;; TODO: update stacker contracts
;; TODO: what should start-burn-height be??
(define-public (stackers-initiate-stacking (stacker-id uint) (pox-address { version: (buff 1), hashbytes: (buff 32) }) (amount uint) (start-burn-height uint))
  (if (is-eq stacker-id u1) (contract-call? .sticky-stacker-1 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
  (if (is-eq stacker-id u2) (contract-call? .sticky-stacker-1 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
  (if (is-eq stacker-id u3) (contract-call? .sticky-stacker-1 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
  (if (is-eq stacker-id u4) (contract-call? .sticky-stacker-1 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
  (if (is-eq stacker-id u5) (contract-call? .sticky-stacker-1 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
   (ok u0)
  )))))
)

;; TODO: update stacker contracts
(define-public (stackers-stack-increase (stacker-id uint) (additional-amount uint))
  (if (is-eq stacker-id u1) (contract-call? .sticky-stacker-1 stack-increase .sticky-reserve-v1 additional-amount)
  (if (is-eq stacker-id u2) (contract-call? .sticky-stacker-1 stack-increase .sticky-reserve-v1 additional-amount)
  (if (is-eq stacker-id u3) (contract-call? .sticky-stacker-1 stack-increase .sticky-reserve-v1 additional-amount)
  (if (is-eq stacker-id u4) (contract-call? .sticky-stacker-1 stack-increase .sticky-reserve-v1 additional-amount)
  (if (is-eq stacker-id u5) (contract-call? .sticky-stacker-1 stack-increase .sticky-reserve-v1 additional-amount)
   (ok u0)
  )))))
)

;; TODO: update stacker contracts
(define-public (stackers-stack-extend (stacker-id uint) (pox-address { version: (buff 1), hashbytes: (buff 32) }))
  (if (is-eq stacker-id u1) (contract-call? .sticky-stacker-1 stack-extend u1 pox-address)
  (if (is-eq stacker-id u2) (contract-call? .sticky-stacker-1 stack-extend u1 pox-address)
  (if (is-eq stacker-id u3) (contract-call? .sticky-stacker-1 stack-extend u1 pox-address)
  (if (is-eq stacker-id u4) (contract-call? .sticky-stacker-1 stack-extend u1 pox-address)
  (if (is-eq stacker-id u5) (contract-call? .sticky-stacker-1 stack-extend u1 pox-address)
   (ok u0)
  )))))
)

;;-------------------------------------
;; Init
;;-------------------------------------

(begin
  (map-set stacker-info { id: u1 } { percentage: u5000, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
  (map-set stacker-info { id: u2 } { percentage: u2500, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
  (map-set stacker-info { id: u3 } { percentage: u1500, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
  (map-set stacker-info { id: u4 } { percentage: u500, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
  (map-set stacker-info { id: u5 } { percentage: u500, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
)

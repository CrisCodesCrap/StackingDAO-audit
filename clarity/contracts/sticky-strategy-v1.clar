;; @contract Sticky Stacking Strategy
;; @version 1

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_CAN_NOT_PREPARE_YET u14001)

;;-------------------------------------
;; Stackers info
;;-------------------------------------

(define-data-var last-cycle-prepared uint u0)

(define-read-only (get-last-cycle-prepared)
  (var-get last-cycle-prepared)
)

(define-read-only (can-prepare-next-cycle)
  (and
    ;; Check if not prepared yet
    (> (get-pox-cycle) (var-get last-cycle-prepared))
    ;; Check if prepare blocks started
    (> burn-block-height (- (get-next-cycle-start-burn-height) (get-prepare-cycle-length)))
  )
)

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

;; Inflow to assign, after substracting inflow to cover idle stackers with minimum
(define-data-var inflow-to-assign-extra uint u0)

(define-read-only (get-inflow-to-assign-extra)
  (var-get inflow-to-assign-extra)
)

;; Inflow to assign to idle stackers
(define-data-var inflow-to-assign-idle uint u0)

(define-read-only (get-inflow-to-assign-idle)
  (var-get inflow-to-assign-idle)
)

(define-map stacker-inflow { id: uint } { extra: uint })

(define-read-only (get-stacker-inflow (id uint))
  (get extra (unwrap-panic (map-get? stacker-inflow { id: id })))
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

(define-read-only (get-stacking-minimum)
  ;; TODO: update for mainnet
  (contract-call? .pox-3-mock get-stacking-minimum)
)

(define-read-only (get-prepare-cycle-length)
  ;; TODO: update for mainnet
  (get prepare-cycle-length (unwrap-panic (contract-call? .pox-3-mock get-pox-info)))
)

(define-read-only (get-pox-cycle)
  ;; TODO: update for mainnet
  (contract-call? .pox-3-mock current-pox-reward-cycle)
)

(define-read-only (get-next-cycle-start-burn-height)
  ;; TODO: update for mainnet
  (contract-call? .pox-3-mock reward-cycle-to-burn-height (get-pox-cycle))
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
    (result-return (try! (stackers-return-stx)))

    ;; Calculate outflow/inflow
    (outflow-inflow (get-outflow-inflow))
    (outflow (get outflow outflow-inflow))
    (inflow (get inflow outflow-inflow))
  )
    (try! (contract-call? .sticky-dao check-is-enabled))
    (asserts! (can-prepare-next-cycle) (err ERR_CAN_NOT_PREPARE_YET))

    (var-set last-cycle-prepared (get-pox-cycle))

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

    (print { total: (var-get total-outflow), new: (var-get total-stacked-new), min-over: (var-get minimum-leftover) })

    ;; Try different combinations, find most efficient one
    ;; Outflow per cycle can be max 5%, so stopping one or two stackers should always be sufficient
    ;; TODO: do not take stackers into account that are not stacking

    (unwrap-panic (calculate-and-set-minimum-leftover (list u1) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u2) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u3) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u4) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u5) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u6) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u7) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u8) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u9) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u10) outflow))

    (unwrap-panic (calculate-and-set-minimum-leftover (list u1 u2) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u2 u3) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u3 u4) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u4 u5) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u5 u6) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u6 u7) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u7 u8) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u8 u9) outflow))
    (unwrap-panic (calculate-and-set-minimum-leftover (list u9 u10) outflow))

    ;; TODO: combination of 3?

    (ok true)
  )
)

(define-private (perform-stacking-outflow (outflow uint))
  (let (
    (result-calculate (calculate-stacking-outflow outflow))
  )
    (try! (perform-stacking-outflow-for-stacker u1))
    (try! (perform-stacking-outflow-for-stacker u2))
    (try! (perform-stacking-outflow-for-stacker u3))
    (try! (perform-stacking-outflow-for-stacker u4))
    (try! (perform-stacking-outflow-for-stacker u5))
    (try! (perform-stacking-outflow-for-stacker u6))
    (try! (perform-stacking-outflow-for-stacker u7))
    (try! (perform-stacking-outflow-for-stacker u8))
    (try! (perform-stacking-outflow-for-stacker u9))
    (try! (perform-stacking-outflow-for-stacker u10))
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
    ;; TODO: stopped stackers should not be taken into account

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

(define-read-only (is-zero (number uint)) 
  (is-eq number u0)
)

(define-public (calculate-stacking-inflow (inflow uint))
  (let (
    ;; Check how many stackers are not stacking yet
    ;; Keep inflow for idle stackers
    (idle-stackers (len (filter is-zero (map stackers-get-total-stacking (list u1 u2 u3 u4 u5 u6 u7 u8 u9 u10)))))
    (needed-for-idle-stackers (* idle-stackers (get-stacking-minimum)))
  )
    (var-set total-stacked-new (+ (get-total-stacking) inflow))

    (if (> needed-for-idle-stackers inflow)
      (begin
        ;; Assign all inflow to idle stackers
        (var-set inflow-to-assign-idle inflow)
        (var-set inflow-to-assign-extra u0)
      )
      (begin
        ;; Assign inflow to cover all idle stackers, rest as extra
        (var-set inflow-to-assign-idle needed-for-idle-stackers)
        (var-set inflow-to-assign-extra (- inflow needed-for-idle-stackers))
      )
    )

    (unwrap-panic (calculate-stacking-inflow-for-stacker u10))
    (unwrap-panic (calculate-stacking-inflow-for-stacker u9))
    (unwrap-panic (calculate-stacking-inflow-for-stacker u8))
    (unwrap-panic (calculate-stacking-inflow-for-stacker u7))
    (unwrap-panic (calculate-stacking-inflow-for-stacker u6))
    (unwrap-panic (calculate-stacking-inflow-for-stacker u5))
    (unwrap-panic (calculate-stacking-inflow-for-stacker u4))
    (unwrap-panic (calculate-stacking-inflow-for-stacker u3))
    (unwrap-panic (calculate-stacking-inflow-for-stacker u2))
    (unwrap-panic (calculate-stacking-inflow-for-stacker u1))
    (ok true)
  )
)

(define-private (perform-stacking-inflow (inflow uint))
  (begin
    (unwrap-panic (calculate-stacking-inflow inflow))

    (try! (perform-stacking-inflow-for-stacker u1))
    (try! (perform-stacking-inflow-for-stacker u2))
    (try! (perform-stacking-inflow-for-stacker u3))
    (try! (perform-stacking-inflow-for-stacker u4))
    (try! (perform-stacking-inflow-for-stacker u5))
    (try! (perform-stacking-inflow-for-stacker u6))
    (try! (perform-stacking-inflow-for-stacker u7))
    (try! (perform-stacking-inflow-for-stacker u8))
    (try! (perform-stacking-inflow-for-stacker u9))
    (try! (perform-stacking-inflow-for-stacker u10))
    (ok true)
  )
)

;; Calculate amount of extra tokens to stack for stacker and save
(define-public (calculate-stacking-inflow-for-stacker (stacker-id uint))
  (let (
    (inflow-assign-idle (var-get inflow-to-assign-idle))
    (inflow-assign-extra (var-get inflow-to-assign-extra))

    (info (get-stacker-info stacker-id))
    (stacking-amount (stackers-get-total-stacking stacker-id))

    (min-amount (get-stacking-minimum))
    (target-stack-amount (/ (* (get percentage info) (var-get total-stacked-new)) u10000))

    ;; Need to make sure target-stack-amount reaches min-amount
    (should-stack-amount 
      (if (> target-stack-amount min-amount)
        target-stack-amount
        min-amount
      )
    )
  )
    ;; Reset first
    (map-set stacker-inflow { id: stacker-id } { extra: u0 })

    ;; Check if already stacking enough based on percentage for stacker
    (asserts! (> should-stack-amount stacking-amount) (ok false))
    
    ;; If already stacking but no extra inflow left, nothing to do
    ;; If not stacking yet, and no idle inflow left, nothing to do
    (asserts! (or (> inflow-assign-extra u0) (and (> inflow-assign-idle u0) (is-eq stacking-amount u0))) (ok false))

    (let (
      ;; If not stacking, get min-amount from idle
      (amount-from-idle 
        (if (and (is-eq stacking-amount u0) (> inflow-assign-idle u0))
          min-amount
          u0
        )
      )

      ;; Check how much extra stacker wants to meet percentage
      (extra-wanted (- should-stack-amount stacking-amount amount-from-idle))

      ;; Amount to get from extra inflow
      (amount-from-extra 
        (if (> inflow-assign-extra extra-wanted)
          (if (> (- inflow-assign-extra extra-wanted) (get-stacking-minimum))
            extra-wanted
            inflow-assign-extra
          )
          inflow-assign-extra
        )
      )

    )    
      (var-set inflow-to-assign-idle (- inflow-assign-idle amount-from-idle))
      (var-set inflow-to-assign-extra (- inflow-assign-extra amount-from-extra))
      (map-set stacker-inflow { id: stacker-id } { extra: (+ amount-from-idle amount-from-extra) })
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
      ;; If stacker is not stacking, initiate if needed
      (if (is-eq inflow u0)
        u0
        (try! (stackers-initiate-stacking stacker-id (get pox-address info) inflow (get-next-cycle-start-burn-height)))
      )

      (if (> inflow u0)
        ;; Extra inflow, so increase and extend
        (begin
          (try! (stackers-stack-increase stacker-id inflow))
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

(define-read-only (stackers-get-total-stacking (stacker-id uint))
  (if (is-eq stacker-id u1) (contract-call? .sticky-stacker-1 get-stx-stacked)
  (if (is-eq stacker-id u2) (contract-call? .sticky-stacker-2 get-stx-stacked)
  (if (is-eq stacker-id u3) (contract-call? .sticky-stacker-3 get-stx-stacked)
  (if (is-eq stacker-id u4) (contract-call? .sticky-stacker-4 get-stx-stacked)
  (if (is-eq stacker-id u5) (contract-call? .sticky-stacker-5 get-stx-stacked)
  (if (is-eq stacker-id u6) (contract-call? .sticky-stacker-6 get-stx-stacked)
  (if (is-eq stacker-id u7) (contract-call? .sticky-stacker-7 get-stx-stacked)
  (if (is-eq stacker-id u8) (contract-call? .sticky-stacker-8 get-stx-stacked)
  (if (is-eq stacker-id u9) (contract-call? .sticky-stacker-9 get-stx-stacked)
  (if (is-eq stacker-id u10) (contract-call? .sticky-stacker-10 get-stx-stacked)
   u0
  ))))))))))
)

(define-public (stackers-return-stx)
  (begin
    (try! (contract-call? .sticky-stacker-1 return-stx .sticky-reserve-v1))
    (try! (contract-call? .sticky-stacker-2 return-stx .sticky-reserve-v1))
    (try! (contract-call? .sticky-stacker-3 return-stx .sticky-reserve-v1))
    (try! (contract-call? .sticky-stacker-4 return-stx .sticky-reserve-v1))
    (try! (contract-call? .sticky-stacker-5 return-stx .sticky-reserve-v1))
    (try! (contract-call? .sticky-stacker-6 return-stx .sticky-reserve-v1))
    (try! (contract-call? .sticky-stacker-7 return-stx .sticky-reserve-v1))
    (try! (contract-call? .sticky-stacker-8 return-stx .sticky-reserve-v1))
    (try! (contract-call? .sticky-stacker-9 return-stx .sticky-reserve-v1))
    (try! (contract-call? .sticky-stacker-10 return-stx .sticky-reserve-v1))
    (ok true)
  )
)

(define-private (stackers-initiate-stacking (stacker-id uint) (pox-address { version: (buff 1), hashbytes: (buff 32) }) (amount uint) (start-burn-height uint))
  (if (is-eq stacker-id u1) (contract-call? .sticky-stacker-1 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
  (if (is-eq stacker-id u2) (contract-call? .sticky-stacker-2 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
  (if (is-eq stacker-id u3) (contract-call? .sticky-stacker-3 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
  (if (is-eq stacker-id u4) (contract-call? .sticky-stacker-4 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
  (if (is-eq stacker-id u5) (contract-call? .sticky-stacker-5 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
  (if (is-eq stacker-id u6) (contract-call? .sticky-stacker-6 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
  (if (is-eq stacker-id u7) (contract-call? .sticky-stacker-7 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
  (if (is-eq stacker-id u8) (contract-call? .sticky-stacker-8 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
  (if (is-eq stacker-id u9) (contract-call? .sticky-stacker-9 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
  (if (is-eq stacker-id u10) (contract-call? .sticky-stacker-10 initiate-stacking .sticky-reserve-v1 pox-address amount start-burn-height u1)
    (ok u0)
  ))))))))))
)

(define-private (stackers-stack-increase (stacker-id uint) (additional-amount uint))
  (if (is-eq stacker-id u1) (contract-call? .sticky-stacker-1 stack-increase .sticky-reserve-v1 additional-amount)
  (if (is-eq stacker-id u2) (contract-call? .sticky-stacker-2 stack-increase .sticky-reserve-v1 additional-amount)
  (if (is-eq stacker-id u3) (contract-call? .sticky-stacker-3 stack-increase .sticky-reserve-v1 additional-amount)
  (if (is-eq stacker-id u4) (contract-call? .sticky-stacker-4 stack-increase .sticky-reserve-v1 additional-amount)
  (if (is-eq stacker-id u5) (contract-call? .sticky-stacker-5 stack-increase .sticky-reserve-v1 additional-amount)
  (if (is-eq stacker-id u6) (contract-call? .sticky-stacker-6 stack-increase .sticky-reserve-v1 additional-amount)
  (if (is-eq stacker-id u7) (contract-call? .sticky-stacker-7 stack-increase .sticky-reserve-v1 additional-amount)
  (if (is-eq stacker-id u8) (contract-call? .sticky-stacker-8 stack-increase .sticky-reserve-v1 additional-amount)
  (if (is-eq stacker-id u9) (contract-call? .sticky-stacker-9 stack-increase .sticky-reserve-v1 additional-amount)
  (if (is-eq stacker-id u10) (contract-call? .sticky-stacker-10 stack-increase .sticky-reserve-v1 additional-amount)
   (ok u0)
  ))))))))))
)

(define-private (stackers-stack-extend (stacker-id uint) (pox-address { version: (buff 1), hashbytes: (buff 32) }))
  (if (is-eq stacker-id u1) (contract-call? .sticky-stacker-1 stack-extend u1 pox-address)
  (if (is-eq stacker-id u2) (contract-call? .sticky-stacker-2 stack-extend u1 pox-address)
  (if (is-eq stacker-id u3) (contract-call? .sticky-stacker-3 stack-extend u1 pox-address)
  (if (is-eq stacker-id u4) (contract-call? .sticky-stacker-4 stack-extend u1 pox-address)
  (if (is-eq stacker-id u5) (contract-call? .sticky-stacker-5 stack-extend u1 pox-address)
  (if (is-eq stacker-id u6) (contract-call? .sticky-stacker-6 stack-extend u1 pox-address)
  (if (is-eq stacker-id u7) (contract-call? .sticky-stacker-7 stack-extend u1 pox-address)
  (if (is-eq stacker-id u8) (contract-call? .sticky-stacker-8 stack-extend u1 pox-address)
  (if (is-eq stacker-id u9) (contract-call? .sticky-stacker-9 stack-extend u1 pox-address)
  (if (is-eq stacker-id u10) (contract-call? .sticky-stacker-10 stack-extend u1 pox-address)
   (ok u0)
  ))))))))))
)

;;-------------------------------------
;; Init
;;-------------------------------------

(begin
  (map-set stacker-info { id: u1 } { percentage: u2000, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
  (map-set stacker-info { id: u2 } { percentage: u2000, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
  (map-set stacker-info { id: u3 } { percentage: u1500, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
  (map-set stacker-info { id: u4 } { percentage: u1000, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
  (map-set stacker-info { id: u5 } { percentage: u1000, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
  (map-set stacker-info { id: u6 } { percentage: u500, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
  (map-set stacker-info { id: u7 } { percentage: u500, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
  (map-set stacker-info { id: u8 } { percentage: u500, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
  (map-set stacker-info { id: u9 } { percentage: u500, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
  (map-set stacker-info { id: u10 } { percentage: u500, pox-address: { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac } })
)

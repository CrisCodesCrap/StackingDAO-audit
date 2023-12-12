;; @contract Commission
;; @version 1
;;
;; Part of the stacking rewards are captured as commission.
;; The commission is split between the protocol and stakers.

(impl-trait .commission-trait-v1.commission-trait)
(use-trait staking-trait .staking-trait-v1.staking-trait)

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_MIN_STAKING_BASISPOINTS u29001)

(define-constant MIN_STAKING_BASISPOINTS u7000) ;; 70% in basis points

;;-------------------------------------
;; Variables 
;;-------------------------------------

(define-data-var staking-basispoints uint u0) ;; 0% in basis points, set later

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-staking-basispoints)
  (var-get staking-basispoints)
)

;;-------------------------------------
;; Trait 
;;-------------------------------------

;; Used by core contract
;; Commission is split between stakers and protocol
(define-public (add-commission (staking-contract <staking-trait>) (stx-amount uint))
  (let (
    (amount-for-staking (/ (* stx-amount (get-staking-basispoints)) u10000))
    (amount-to-keep (- stx-amount amount-for-staking))
  )
    (try! (contract-call? .dao check-is-protocol (contract-of staking-contract)))

    ;; Send to stakers
    (if (> amount-for-staking u0)
      (try! (contract-call? staking-contract add-rewards amount-for-staking))
      u0    
    )

    ;; Keep in contract
    (if (> amount-to-keep u0)
      (try! (stx-transfer? amount-to-keep tx-sender (as-contract tx-sender)))
      false
    )

    (ok stx-amount)
  )
)

;;-------------------------------------
;; Get commission 
;;-------------------------------------

(define-public (withdraw-commission)
  (let (
    (receiver tx-sender)
    (amount (stx-get-balance (as-contract tx-sender)))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (try! (as-contract (stx-transfer? amount tx-sender receiver)))

    (ok amount)
  )
)

;;-------------------------------------
;; Admin 
;;-------------------------------------

(define-public (set-staking-basispoints (new-basispoints uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))
    (asserts! (>= new-basispoints MIN_STAKING_BASISPOINTS) (err ERR_MIN_STAKING_BASISPOINTS))

    (var-set staking-basispoints new-basispoints)
    (ok true)
  )
)

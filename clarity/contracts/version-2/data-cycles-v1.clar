;; @contract Data Cycles
;; @version 1

;;-------------------------------------
;; Cycle info 
;;-------------------------------------

;; All values in STX
(define-map cycle-info
  { 
    cycle-id: uint 
  }
  {
    deposited: uint,
    withdraw-init: uint,
    withdraw-cancel: uint,
    withdraw: uint,
    rewards: uint,
    commission: uint
  }
)

(define-read-only (get-cycle-info (cycle-id uint))
  ;; TODO: get prev info from core v1

  (default-to
    {
      deposited: u0,
      withdraw-init: u0,
      withdraw-cancel: u0,
      withdraw: u0,
      rewards: u0,
      commission: u0
    }
    (map-get? cycle-info { cycle-id: cycle-id })
  )
)

;; TODO: setter to override

(define-public (cycle-add-deposit (stx-amount uint))
  (let (
    ;; TODO: Update for mainnet
    (cycle-id (contract-call? .pox-3-mock current-pox-reward-cycle))
    (current-cycle-info (get-cycle-info cycle-id))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-set cycle-info { cycle-id: cycle-id } (merge current-cycle-info { deposited: (+ (get deposited current-cycle-info) stx-amount) }))
    (ok true)
  )
)

(define-public (cycle-add-init-withdraw (stx-amount uint))
  (let (
    ;; TODO: Update for mainnet
    (cycle-id (contract-call? .pox-3-mock current-pox-reward-cycle))
    (current-cycle-info (get-cycle-info cycle-id))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-set cycle-info { cycle-id: cycle-id } (merge current-cycle-info { withdraw-init: (+ (get withdraw-init current-cycle-info) stx-amount) }))
    (ok true)
  )
)

(define-public (cycle-add-cancel-withdraw (stx-amount uint))
  (let (
    ;; TODO: Update for mainnet
    (cycle-id (contract-call? .pox-3-mock current-pox-reward-cycle))
    (current-cycle-info (get-cycle-info cycle-id))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-set cycle-info { cycle-id: cycle-id } (merge current-cycle-info { withdraw-cancel: (+ (get withdraw-cancel current-cycle-info) stx-amount) }))
    (ok true)
  )
)

(define-public (cycle-add-withdraw (stx-amount uint))
  (let (
    ;; TODO: Update for mainnet
    (cycle-id (contract-call? .pox-3-mock current-pox-reward-cycle))
    (current-cycle-info (get-cycle-info cycle-id))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-set cycle-info { cycle-id: cycle-id } (merge current-cycle-info { withdraw: (+ (get withdraw current-cycle-info) stx-amount) }))
    (ok true)
  )
)

(define-public (cycle-add-rewards (stx-amount uint))
  (let (
    ;; TODO: Update for mainnet
    (cycle-id (contract-call? .pox-3-mock current-pox-reward-cycle))
    (current-cycle-info (get-cycle-info cycle-id))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-set cycle-info { cycle-id: cycle-id } (merge current-cycle-info { rewards: (+ (get rewards current-cycle-info) stx-amount) }))
    (ok true)
  )
)

(define-public (cycle-add-commission (stx-amount uint))
  (let (
    ;; TODO: Update for mainnet
    (cycle-id (contract-call? .pox-3-mock current-pox-reward-cycle))
    (current-cycle-info (get-cycle-info cycle-id))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-set cycle-info { cycle-id: cycle-id } (merge current-cycle-info { commission: (+ (get commission current-cycle-info) stx-amount) }))
    (ok true)
  )
)

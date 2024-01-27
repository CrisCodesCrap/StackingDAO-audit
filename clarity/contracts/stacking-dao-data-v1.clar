;; @contract Data
;; @version 1

(use-trait reserve-trait .reserve-trait-v1.reserve-trait)

;;-------------------------------------
;; STX per stSTX  
;;-------------------------------------

(define-public (get-stx-per-ststx (reserve-contract <reserve-trait>))
  (let (
    (stx-amount (unwrap-panic (contract-call? reserve-contract get-total-stx)))
  )
    (try! (contract-call? .dao check-is-protocol (contract-of reserve-contract)))
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
;; Cycle info 
;;-------------------------------------

(define-map cycle-info
  { 
    cycle-id: uint 
  }
  {
    deposited: uint,        ;; STX
    withdraw-init: uint,    ;; STX
    withdraw-cancel: uint,  ;; STX
    withdraw: uint,         ;; STX
    rewards: uint,          ;; STX
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
    }
    (map-get? cycle-info { cycle-id: cycle-id })
  )
)

(define-public (cycle-info-add-deposit (stx-amount uint))
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

(define-public (cycle-info-add-init-withdraw (stx-amount uint))
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

(define-public (cycle-info-add-cancel-withdraw (stx-amount uint))
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

(define-public (cycle-info-add-withdraw (stx-amount uint))
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

(define-public (cycle-info-add-rewards (stx-amount uint))
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

;;-------------------------------------
;; Withdrawal NFT 
;;-------------------------------------

(define-map withdrawals-by-nft
  { 
    nft-id: uint
  }
  {
    unlock-burn-height: uint, 
    stx-amount: uint,
    ststx-amount: uint
  }
)

(define-read-only (get-withdrawals-by-nft (nft-id uint))
  ;; TODO: get prev info from core v1

  (default-to
    {
      unlock-burn-height: u0,
      stx-amount: u0,
      ststx-amount: u0
    }
    (map-get? withdrawals-by-nft { nft-id: nft-id })
  )
)

(define-public (set-withdrawals-by-nft (nft-id uint) (stx-amount uint) (ststx-amount uint) (unlock-burn-height uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-set withdrawals-by-nft { nft-id: nft-id } { stx-amount: stx-amount, ststx-amount: ststx-amount, unlock-burn-height: unlock-burn-height })
    (ok true)
  )
)

(define-public (delete-withdrawals-by-nft (nft-id uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (map-delete withdrawals-by-nft { nft-id: nft-id })
    (ok true)
  )
)

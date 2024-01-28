;; @contract Data Core
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

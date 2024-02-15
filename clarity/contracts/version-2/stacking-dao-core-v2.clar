;; @contract Core
;; @version 2

(use-trait reserve-trait .reserve-trait-v1.reserve-trait)
(use-trait direct-helpers-trait .direct-helpers-trait-v1.direct-helpers-trait)

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_WITHDRAW_LOCKED u19001)
(define-constant ERR_SHUTDOWN u19002)
(define-constant ERR_WITHDRAW_NOT_NFT_OWNER u19004)
(define-constant ERR_WITHDRAW_NFT_DOES_NOT_EXIST u19005)
(define-constant ERR_GET_OWNER u19006)
(define-constant ERR_WITHDRAW_CANCEL u19007)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var shutdown-deposits bool false)

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-shutdown-deposits)
  (var-get shutdown-deposits)
)

(define-read-only (get-withdraw-unlock-burn-height)
  (let (
    (current-cycle (contract-call? .pox-4-mock current-pox-reward-cycle))
    (start-block-current-cycle (contract-call? .pox-4-mock reward-cycle-to-burn-height current-cycle))
    (cycle-length (get reward-cycle-length (unwrap-panic (contract-call? .pox-4-mock get-pox-info))))
  )
    (if (< burn-block-height (- (+ start-block-current-cycle cycle-length) (contract-call? .data-core-v1 get-cycle-withdraw-offset)))
      ;; Can withdraw next cycle
      (ok (+ start-block-current-cycle cycle-length))

      ;; Withdraw cycle after next
      (ok (+ start-block-current-cycle cycle-length cycle-length))
    )
  )
)

;;-------------------------------------
;; User  
;;-------------------------------------

;; Deposit STX for stSTX
(define-public (deposit 
  (reserve <reserve-trait>) 
  (direct-helpers <direct-helpers-trait>)
  (stx-amount uint)
  (referrer (optional principal)) 
  (pool (optional principal))
)
  (let (
    (stx-ststx (try! (contract-call? .data-core-v1 get-stx-per-ststx reserve)))
    (ststx-amount (/ (* stx-amount u1000000) stx-ststx))
  )
    (try! (contract-call? .dao check-is-enabled))
    (asserts! (not (get-shutdown-deposits)) (err ERR_SHUTDOWN))

    (try! (contract-call? direct-helpers add-direct-stacking tx-sender pool stx-amount))

    (try! (stx-transfer? stx-amount tx-sender (contract-of reserve)))
    (try! (contract-call? .ststx-token mint-for-protocol ststx-amount tx-sender))

    (print { action: "deposit", data: { stacker: tx-sender, amount: ststx-amount, referrer: referrer, pool: pool, block-height: block-height } })

    (ok ststx-amount)
  )
)

;; Initiate withdrawal, given stSTX amount. Can update amount as long as cycle not started.
;; The stSTX tokens are transferred to this contract, and are burned on the actual withdrawal.
;; An NFT is minted for the user as a token representation of the withdrawal.
(define-public (init-withdraw 
  (reserve <reserve-trait>) 
  (direct-helpers <direct-helpers-trait>)
  (ststx-amount uint)
)
  (let (
    (sender tx-sender)
    (unlock-burn-height (unwrap-panic (get-withdraw-unlock-burn-height)))

    (stx-ststx (try! (contract-call? .data-core-v1 get-stx-per-ststx reserve)))
    (stx-amount (/ (* ststx-amount stx-ststx) u1000000))
    (total-stx (unwrap-panic (contract-call? reserve get-total-stx)))

    (nft-id (unwrap-panic (contract-call? .ststx-withdraw-nft get-last-token-id)))
  )
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol (contract-of reserve)))

    (try! (contract-call? .data-core-v1 set-withdrawals-by-nft nft-id stx-amount ststx-amount unlock-burn-height))
    
    (try! (contract-call? direct-helpers subtract-direct-stacking tx-sender stx-amount))

    ;; Transfer stSTX token to contract, only burn on actual withdraw
    (try! (as-contract (contract-call? reserve lock-stx-for-withdrawal stx-amount)))
    (try! (contract-call? .ststx-token transfer ststx-amount tx-sender (as-contract tx-sender) none))
    (try! (as-contract (contract-call? .ststx-withdraw-nft mint-for-protocol sender)))

    (print { action: "init-withdraw", data: { stacker: tx-sender, ststx-amount: ststx-amount, stx-amount: stx-amount, block-height: block-height } })

    (ok nft-id)
  )
)

;; Cancel init withdrawal for given NFT. 
;; The NFT will be burned, and the user will receive back the STX tokens.
(define-public (cancel-withdraw 
  (reserve <reserve-trait>) 
  (direct-helpers <direct-helpers-trait>)
  (nft-id uint)
  (pool (optional principal))
)
  (let (
    (receiver tx-sender)

    (withdrawal-entry (contract-call? .data-core-v1 get-withdrawals-by-nft nft-id))
    (unlock-burn-height (get unlock-burn-height withdrawal-entry))
    (stx-amount (get stx-amount withdrawal-entry))
    (ststx-amount (get ststx-amount withdrawal-entry))

    (nft-owner (unwrap! (contract-call? .ststx-withdraw-nft get-owner nft-id) (err ERR_GET_OWNER)))
  )
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol (contract-of reserve)))
    (asserts! (is-some nft-owner) (err ERR_WITHDRAW_NFT_DOES_NOT_EXIST))
    (asserts! (is-eq (unwrap! nft-owner (err ERR_GET_OWNER)) tx-sender) (err ERR_WITHDRAW_NOT_NFT_OWNER))
    (asserts! (< burn-block-height unlock-burn-height) (err ERR_WITHDRAW_CANCEL))

    (try! (contract-call? .data-core-v1 delete-withdrawals-by-nft nft-id))
    
    (try! (contract-call? direct-helpers add-direct-stacking tx-sender pool stx-amount))

    ;; Burn NFT, send back stSTX
    (try! (as-contract (contract-call? .ststx-withdraw-nft burn-for-protocol nft-id)))
    (try! (as-contract (contract-call? .ststx-token transfer ststx-amount tx-sender receiver none)))
    ;; Only way to decrease the `stx-for-withdrawals` is by calling `request-stx-for-withdrawal`
    ;; However, this will also transfer STX so we need to transfer it back
    (try! (as-contract (contract-call? reserve request-stx-for-withdrawal stx-amount tx-sender)))
    (try! (as-contract (stx-transfer? stx-amount tx-sender (contract-of reserve))))

    (print { action: "cancel-withdraw", data: { stacker: tx-sender, ststx-amount: ststx-amount, stx-amount: stx-amount, block-height: block-height } })

    (ok stx-amount)
  )
)

;; Actual withdrawal for given NFT. 
;; The NFT and stSTX tokens will be burned and the user will receive STX tokens.
(define-public (withdraw (reserve <reserve-trait>) (nft-id uint))
  (let (
    (receiver tx-sender)

    (withdrawal-entry (contract-call? .data-core-v1 get-withdrawals-by-nft nft-id))
    (unlock-burn-height (get unlock-burn-height withdrawal-entry))
    (stx-amount (get stx-amount withdrawal-entry))
    (ststx-amount (get ststx-amount withdrawal-entry))

    (nft-owner (unwrap! (contract-call? .ststx-withdraw-nft get-owner nft-id) (err ERR_GET_OWNER)))
  )
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol (contract-of reserve)))
    (asserts! (is-some nft-owner) (err ERR_WITHDRAW_NFT_DOES_NOT_EXIST))
    (asserts! (is-eq (unwrap! nft-owner (err ERR_GET_OWNER)) tx-sender) (err ERR_WITHDRAW_NOT_NFT_OWNER))
    (asserts! (> burn-block-height unlock-burn-height) (err ERR_WITHDRAW_LOCKED))

    (try! (contract-call? .data-core-v1 delete-withdrawals-by-nft nft-id))

    ;; STX to user, burn stSTX
    (try! (as-contract (contract-call? reserve request-stx-for-withdrawal stx-amount receiver)))
    (try! (contract-call? .ststx-token burn-for-protocol (get ststx-amount withdrawal-entry) (as-contract tx-sender)))
    (try! (as-contract (contract-call? .ststx-withdraw-nft burn-for-protocol nft-id)))

    (print { action: "withdraw", data: { stacker: tx-sender, ststx-amount: ststx-amount, stx-amount: stx-amount, block-height: block-height } })

    (ok stx-amount)
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

(define-public (set-shutdown-deposits (shutdown bool))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))
    
    (var-set shutdown-deposits shutdown)
    (ok true)
  )
)

;; @contract Core
;; @version 2

(use-trait reserve-trait .reserve-trait-v1.reserve-trait)

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_WITHDRAW_LOCKED u19001)
(define-constant ERR_SHUTDOWN u19002)
(define-constant ERR_WITHDRAW_NOT_NFT_OWNER u19004)
(define-constant ERR_WITHDRAW_NFT_DOES_NOT_EXIST u19005)
(define-constant ERR_GET_OWNER u19006)

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

(define-public (get-withdraw-unlock-burn-height)
  (let (
    (current-cycle (contract-call? .pox-3-mock current-pox-reward-cycle))
    (start-block-current-cycle (contract-call? .pox-3-mock reward-cycle-to-burn-height current-cycle))
    (cycle-length (get reward-cycle-length (unwrap-panic (contract-call? .pox-3-mock get-pox-info))))
  )
    (if (< burn-block-height (- (+ start-block-current-cycle cycle-length) (contract-call? .data-pools-v1 get-cycle-withdraw-offset)))
      ;; Can withdraw next cycle
      (ok (+ start-block-current-cycle u1))

      ;; Withdraw cycle after next
      (ok (+ start-block-current-cycle u2))
    )
  )
)

;;-------------------------------------
;; User  
;;-------------------------------------

;; Deposit STX for stSTX
(define-public (deposit (reserve-contract <reserve-trait>) (stx-amount uint) (referrer (optional principal)) (pool (optional principal)))
  (let (
    (stx-ststx (try! (contract-call? .data-core-v1 get-stx-per-ststx reserve-contract)))
    (ststx-amount (/ (* stx-amount u1000000) stx-ststx))
  )
    (try! (contract-call? .dao check-is-enabled))
    (asserts! (not (get-shutdown-deposits)) (err ERR_SHUTDOWN))

    (try! (contract-call? .data-core-v1 cycle-info-add-deposit stx-amount))
    
    (try! (add-direct-stacking-pool tx-sender pool stx-amount))

    (print { action: "deposit", data: { stacker: tx-sender, referrer: referrer, amount: ststx-amount, block-height: block-height } })

    (try! (stx-transfer? stx-amount tx-sender (contract-of reserve-contract)))
    (try! (contract-call? .ststx-token mint-for-protocol ststx-amount tx-sender))

    (ok ststx-amount)
  )
)

;; Initiate withdrawal, given stSTX amount. Can update amount as long as cycle not started.
;; The stSTX tokens are transferred to this contract, and are burned on the actual withdrawal.
;; An NFT is minted for the user as a token representation of the withdrawal.
(define-public (init-withdraw (reserve-contract <reserve-trait>) (ststx-amount uint))
  (let (
    (sender tx-sender)
    (unlock-burn-height (unwrap-panic (get-withdraw-unlock-burn-height)))

    (stx-ststx (try! (contract-call? .data-core-v1 get-stx-per-ststx reserve-contract)))
    (stx-amount (/ (* ststx-amount stx-ststx) u1000000))
    (total-stx (unwrap-panic (contract-call? reserve-contract get-total-stx)))

    (nft-id (unwrap-panic (contract-call? .ststx-withdraw-nft get-last-token-id)))
  )
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol (contract-of reserve-contract)))

    (try! (contract-call? .data-core-v1 cycle-info-add-init-withdraw stx-amount))
    (try! (contract-call? .data-core-v1 set-withdrawals-by-nft nft-id stx-amount ststx-amount unlock-burn-height))
    
    (try! (subtract-direct-stacking tx-sender stx-amount))

    ;; Transfer stSTX token to contract, only burn on actual withdraw
    (try! (as-contract (contract-call? reserve-contract lock-stx-for-withdrawal stx-amount)))
    (try! (contract-call? .ststx-token transfer ststx-amount tx-sender (as-contract tx-sender) none))
    (try! (as-contract (contract-call? .ststx-withdraw-nft mint-for-protocol sender)))

    (print { action: "init-withdraw", data: { stacker: tx-sender, amount: stx-amount, block-height: block-height } })

    (ok nft-id)
  )
)

;; Cancel init withdrawal for given NFT. 
;; The NFT will be burned, and the user will receive back the STX tokens.
(define-public (cancel-withdraw (reserve-contract <reserve-trait>) (nft-id uint))
  (let (
    (receiver tx-sender)

    (withdrawal-entry (contract-call? .data-core-v1 get-withdrawals-by-nft nft-id))
    (stx-amount (get stx-amount withdrawal-entry))
    (ststx-amount (get ststx-amount withdrawal-entry))

    (nft-owner (unwrap! (contract-call? .ststx-withdraw-nft get-owner nft-id) (err ERR_GET_OWNER)))
  )
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol (contract-of reserve-contract)))
    (asserts! (is-some nft-owner) (err ERR_WITHDRAW_NFT_DOES_NOT_EXIST))
    (asserts! (is-eq (unwrap! nft-owner (err ERR_GET_OWNER)) tx-sender) (err ERR_WITHDRAW_NOT_NFT_OWNER))

    (try! (contract-call? .data-core-v1 cycle-info-add-cancel-withdraw stx-amount))
    (try! (contract-call? .data-core-v1 delete-withdrawals-by-nft nft-id))
    
    (try! (add-direct-stacking tx-sender stx-amount))

    ;; Burn NFT, send back stSTX
    (try! (as-contract (contract-call? .ststx-withdraw-nft burn-for-protocol nft-id)))
    (try! (as-contract (contract-call? .ststx-token transfer ststx-amount tx-sender receiver none)))

    ;; Only way to decrease the `stx-for-withdrawals` is by calling `request-stx-for-withdrawal`
    ;; However, this will also transfer STX so we need to transfer it back
    (try! (as-contract (contract-call? reserve-contract request-stx-for-withdrawal stx-amount tx-sender)))
    (try! (as-contract (stx-transfer? stx-amount tx-sender (contract-of reserve-contract))))

    (print { action: "cancel-withdraw", data: { stacker: tx-sender, amount: stx-amount, block-height: block-height } })

    (ok stx-amount)
  )
)

;; Actual withdrawal for given NFT. 
;; The NFT and stSTX tokens will be burned and the user will receive STX tokens.
(define-public (withdraw (reserve-contract <reserve-trait>) (nft-id uint))
  (let (
    (receiver tx-sender)

    (withdrawal-entry (contract-call? .data-core-v1 get-withdrawals-by-nft nft-id))
    (unlock-burn-height (get unlock-burn-height withdrawal-entry))
    (stx-amount (get stx-amount withdrawal-entry))

    (nft-owner (unwrap! (contract-call? .ststx-withdraw-nft get-owner nft-id) (err ERR_GET_OWNER)))
  )
    (try! (contract-call? .dao check-is-enabled))
    (try! (contract-call? .dao check-is-protocol (contract-of reserve-contract)))
    (asserts! (is-some nft-owner) (err ERR_WITHDRAW_NFT_DOES_NOT_EXIST))
    (asserts! (is-eq (unwrap! nft-owner (err ERR_GET_OWNER)) tx-sender) (err ERR_WITHDRAW_NOT_NFT_OWNER))
    (asserts! (> burn-block-height unlock-burn-height) (err ERR_WITHDRAW_LOCKED))

    (try! (contract-call? .data-core-v1 cycle-info-add-init-withdraw stx-amount))
    (try! (contract-call? .data-core-v1 delete-withdrawals-by-nft nft-id))

    ;; STX to user, burn stSTX
    (try! (as-contract (contract-call? reserve-contract request-stx-for-withdrawal stx-amount receiver)))
    (try! (contract-call? .ststx-token burn-for-protocol (get ststx-amount withdrawal-entry) (as-contract tx-sender)))
    (try! (as-contract (contract-call? .ststx-withdraw-nft burn-for-protocol nft-id)))

    (print { action: "withdraw", data: { stacker: tx-sender, amount: stx-amount, block-height: block-height } })

    (ok stx-amount)
  )
)

;;-------------------------------------
;; Direct Stacking Helpers  
;;-------------------------------------

;; TODO: move to separate contract

(define-public (add-direct-stacking (user principal) (amount uint))
  (let (
    (current-direct-stacking (contract-call? .data-pools-v1 get-direct-stacking-user user))
    (current-direct-pool (if (is-some current-direct-stacking)
      (some (get pool (unwrap-panic current-direct-stacking)))
      none
    ))
  )
    (add-direct-stacking-pool user current-direct-pool amount)
  )
)

(define-public (add-direct-stacking-pool (user principal) (pool (optional principal)) (amount uint))
  (let (
    (current-direct-stacking (contract-call? .data-pools-v1 get-direct-stacking-user user))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (if (is-some current-direct-stacking)
      (let (
        (current-direct-pool (get pool (unwrap-panic current-direct-stacking)))
        (current-direct-amount (get amount (unwrap-panic current-direct-stacking)))
        (current-pool-amount (contract-call? .data-pools-v1 get-direct-stacking-pool-amount current-direct-pool))
        (current-total-amount (contract-call? .data-pools-v1 get-total-directed-stacking))
      )
        ;; 1) User is direct stacking, remove current info
        (try! (stop-direct-stacking user))

        (if (is-some pool)
          ;; 2) User has selected pool, add all info to new pool
          (let (
            (selected-pool-amount (contract-call? .data-pools-v1 get-direct-stacking-pool-amount (unwrap-panic pool)))
            (new-total-amount (contract-call? .data-pools-v1 get-total-directed-stacking))
          )
            (try! (contract-call? .data-pools-v1 set-direct-stacking-user user (unwrap-panic pool) (+ current-direct-amount amount)))
            (try! (contract-call? .data-pools-v1 set-direct-stacking-pool-amount (unwrap-panic pool) (+ selected-pool-amount current-direct-amount amount)))            
            (try! (contract-call? .data-pools-v1 set-total-directed-stacking (+ new-total-amount current-direct-amount amount)))
          )

          ;; 3) User was direct stacking, but did not select a pool
          ;; His direct stacking info was removed
          false
        )
        true
      )

      ;; 4) User is not direct stacking yet
      ;; TODO
      ;; 
      

      false
    )
    (ok true)
  )
)

;; TODO: 
(define-public (stop-direct-stacking (user principal))
 (let (
    (current-direct-stacking (contract-call? .data-pools-v1 get-direct-stacking-user user))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (if (is-some current-direct-stacking)
      (let (
        (current-direct-pool (get pool (unwrap-panic current-direct-stacking)))
        (current-direct-amount (get amount (unwrap-panic current-direct-stacking)))
        (current-pool-amount (contract-call? .data-pools-v1 get-direct-stacking-pool-amount current-direct-pool))
        (current-total-amount (contract-call? .data-pools-v1 get-total-directed-stacking))
      )
        ;; 1) User is direct stacking, remove current info
        (try! (contract-call? .data-pools-v1 delete-direct-stacking-user user))        
        (try! (contract-call? .data-pools-v1 set-direct-stacking-pool-amount current-direct-pool (- current-pool-amount current-direct-amount)))
        (try! (contract-call? .data-pools-v1 set-total-directed-stacking (- current-total-amount current-direct-amount)))
        true
      )
      false
    )
    (ok true)
  )
)

(define-public (subtract-direct-stacking (user principal) (amount uint))
  (let (
    (current-direct-stacking (contract-call? .data-pools-v1 get-direct-stacking-user user))
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (if (is-some current-direct-stacking)
      (let (
        (current-direct-pool (get pool (unwrap-panic current-direct-stacking)))
        (current-direct-amount (get amount (unwrap-panic current-direct-stacking)))
        (current-pool-amount (contract-call? .data-pools-v1 get-direct-stacking-pool-amount current-direct-pool))
        (current-total-amount (contract-call? .data-pools-v1 get-total-directed-stacking))
      )
        (if (is-eq current-direct-amount amount)
          (begin
            (try! (stop-direct-stacking user))
            true
          )
          (begin
            (try! (contract-call? .data-pools-v1 set-direct-stacking-user user current-direct-pool (- current-direct-amount amount)))
            (try! (contract-call? .data-pools-v1 set-direct-stacking-pool-amount current-direct-pool (- current-pool-amount amount)))                    
            (try! (contract-call? .data-pools-v1 set-total-directed-stacking (- current-total-amount amount)))
            true
          )
        )
        true
      )
      false
    )
    (ok true)
  )
)


;;-------------------------------------
;; Admin
;;-------------------------------------

(define-public (set-shutdown-deposits (shutdown bool))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))
    
    (var-set shutdown-deposits shutdown)
    (ok true)
  )
)

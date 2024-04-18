;; @contract Stacking Pool
;; @version 1
;;
;; Stacking DAO stacking pool
;; One of the pools that will be used by the StackingDAO protocol.
;; Others can also delegate to this pool directly.

;; Stacking delegation
;;
;; 1) User needs to set correct amount to delegate
;;    `revoke-delegate-stx` and `delegate-stx` to (re)set amount to delegate
;;
;; 2) Pool must perform user delegation
;;    `delegate-stack-stx` for first time user to start stacking
;;    `delegate-stack-extend` once for next cycle
;;    `delegate-stack-increase` if need to stack more
;;
;; 3) Pool must commit aggregation result
;;    `stack-aggregation-commit-indexed` to commit to a reward cycle and get reward index, only done once per cycle
;;    `stack-aggregation-increase` with index from previous commit to increase amount stacked
;;

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_CAN_NOT_PREPARE u205001)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var pox-reward-address { version: (buff 1), hashbytes: (buff 32) } { version: 0x04, hashbytes: 0x2fffa9a09bb7fa7dced44834d77ee81c49c5f0cc })
(define-data-var pox-signer-key (buff 33) 0x0390a5cac7c33fda49f70bc1b0866fa0ba7a9440d9de647fecb8132ceb76a94dfa)
(define-data-var last-auth-id uint u0)

;;-------------------------------------
;; Maps
;;-------------------------------------

;; Map cycle to signer signature
(define-map cycle-to-signer-signature uint (buff 65))

;; Map cycle to reward index
(define-map cycle-to-index uint uint)

;;-------------------------------------
;; Getters
;;-------------------------------------

(define-read-only (get-pox-reward-address)
  (var-get pox-reward-address)
)

(define-read-only (get-pox-signer-key)
  (var-get pox-signer-key)
)

(define-read-only (get-last-auth-id)
  (var-get last-auth-id)
)

(define-read-only (get-cycle-to-signer-signature (cycle uint))
  (map-get? cycle-to-signer-signature cycle)
)

(define-read-only (get-cycle-to-index (cycle uint))
  (map-get? cycle-to-index cycle)
)

;;-------------------------------------
;; Helpers
;;-------------------------------------

(define-read-only (is-error (response (response bool uint)))
  (is-err response)
)

;; TODO - why do we need this check?
(define-read-only (can-prepare)
  (let (
    (current-cycle (current-pox-reward-cycle))
    (start-block-next-cycle (reward-cycle-to-burn-height (+ current-cycle u1)))
    (withdraw-offset (contract-call? .data-core-v1 get-cycle-withdraw-offset))
  )
    (> burn-block-height (- start-block-next-cycle withdraw-offset))
  )
)

;;-------------------------------------
;; Public - StackingDAO Delegates
;;-------------------------------------

(define-public (prepare-stacking-dao)
  (let (
    (delegates (contract-call? .data-pools-v1 get-pool-delegates (as-contract tx-sender)))
  )
    (prepare-delegate-many delegates)
  )
)

;;-------------------------------------
;; Public - Delegates
;;-------------------------------------

(define-public (delegate-stx (amount-ustx uint) (until-burn-ht (optional uint)))
  (begin
    (print { action: "delegate-stx", data: { tx-sender: tx-sender, amount-ustx: amount-ustx, block-height: block-height } })

    (match (pox-delegate-stx amount-ustx (as-contract tx-sender) until-burn-ht)
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (revoke-delegate-stx)
  (begin
    (print { action: "revoke-delegate-stx", data: { tx-sender: tx-sender, block-height: block-height } })

    (match (pox-revoke-delegate-stx)
      result (ok result)
      error (err error)
    )
  )
)

(define-public (prepare-delegate (delegate principal))
  (begin
    (asserts! (can-prepare) (err ERR_CAN_NOT_PREPARE))

    ;; 1. Delegate
    (try! (delegation delegate))

    ;; 2. Aggregate - ignore error ERR_STACKING_THRESHOLD_NOT_MET
    (match (aggregation)
      success true
      error (begin
        (asserts! (is-eq error u11) (err error))
        true
      )
    )

    (print { action: "prepare-delegate", data: { delegate: delegate, block-height: block-height } })
    (ok true)
  )
)

(define-public (prepare-delegate-many (delegates (list 50 principal)))
  (let (
    ;; 1. Delegate
    (delegation-errors (filter is-error (map delegation delegates)))
    (delegation-error (element-at? delegation-errors u0))
  )
    (asserts! (can-prepare) (err ERR_CAN_NOT_PREPARE))
    (asserts! (is-eq delegation-error none) (unwrap-panic delegation-error))

    ;; 2. Aggregate - ignore error ERR_STACKING_THRESHOLD_NOT_MET
    (match (aggregation)
      success true
      error (begin
        (asserts! (is-eq error u11) (err error))
        true
      )
    )

    (print { action: "prepare-delegate-many", data: { block-height: block-height } })
    (ok true)
  )
)

;;-------------------------------------
;; Helpers 
;;-------------------------------------

(define-private (delegation (delegate principal))
  (let (
    (delegation-info (get-check-delegation delegate))
    (delegation-amount (if (is-none delegation-info)
      u0
      (unwrap-panic (get amount-ustx delegation-info))
    ))
  )
    (if (is-eq delegation-amount u0)
      ;; No delegation, do nothing
      false

      (if (is-none (get-stacker-info delegate))
        ;; Not stacking yet
        (begin 
          (try! (as-contract (delegate-stack-stx delegate delegation-amount)))
          true
        )

        ;; Already stacking
        (begin
          ;; Extend for next cycle if not extended yet
          (if (unwrap-panic (not-extended-next-cycle delegate))
            (begin
              (try! (as-contract (delegate-stack-extend delegate)))
              true
            )
            true
          )

          ;; Increase if needed
          (let (
            (locked-amount (get locked (get-stx-account delegate)))
          )
            (if (> delegation-amount locked-amount)
              (begin
                (try! (as-contract (delegate-stack-increase delegate (- delegation-amount locked-amount))))
                true
              )
              true
            )
          )
        )
      )
    )
    (ok true)
  )
)

(define-private (aggregation)
  (let (
    (next-cycle (+ (current-pox-reward-cycle) u1))
    (index (map-get? cycle-to-index next-cycle))
  )
    (if (is-none index)
      ;; No index yet, commit
      (let (
        (reward-index (try! (as-contract (stack-aggregation-commit-indexed next-cycle))))
      )
        (print { action: "aggregation", data: { reward-index: reward-index, block-height: block-height } })
        (map-set cycle-to-index next-cycle reward-index)
        true
      )

      ;; Already have an index for cycle
      (begin
        (print { action: "aggregation", data: { reward-index: (unwrap-panic index), block-height: block-height } })
        (try! (as-contract (stack-aggregation-increase next-cycle (unwrap-panic index))))
        true
      )
    )
    (ok true)
  )
)

;;-------------------------------------
;; Helpers
;;-------------------------------------

(define-read-only (not-extended-next-cycle (delegate principal))
  (let (
    (current-cycle (current-pox-reward-cycle))
    (next-cycle-height (reward-cycle-to-burn-height (+ current-cycle u1)))
    (unlock-height (get unlock-height (get-stx-account delegate)))
  )
    (ok (<= unlock-height next-cycle-height))
  )
)

;;-------------------------------------
;; PoX Wrappers
;;-------------------------------------

(define-public (delegate-stack-stx (stacker principal) (amount-ustx uint))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))
    (print { action: "delegate-stack-stx", data: { stacker: stacker, amount: amount-ustx, block-height: block-height } })
    
    (match (as-contract (pox-delegate-stack-stx stacker amount-ustx (get-pox-reward-address) burn-block-height))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (delegate-stack-extend (stacker principal))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))
    (print { action: "delegate-stack-extend", data: { stacker: stacker, block-height: block-height } })

    (match (as-contract (pox-delegate-stack-extend stacker (get-pox-reward-address)))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (delegate-stack-increase (stacker principal) (increase-by uint))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))
    (print { action: "delegate-stack-increase", data: { stacker: stacker, increase-by: increase-by, block-height: block-height } })

    (match (as-contract (pox-delegate-stack-increase stacker (get-pox-reward-address) increase-by))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (stack-aggregation-commit-indexed (reward-cycle uint))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))
    (print { action: "stack-aggregation-commit-indexed", data: { reward-cycle: reward-cycle, block-height: block-height } })

    (var-set last-auth-id (+ (get-last-auth-id) u1))
    (match (as-contract (pox-stack-aggregation-commit-indexed (get-pox-reward-address) reward-cycle))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (stack-aggregation-increase (reward-cycle uint) (reward-cycle-index uint))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))
    (print { action: "stack-aggregation-increase", data: { reward-cycle: reward-cycle, reward-cycle-index: reward-cycle-index, block-height: block-height } })

    (match (as-contract (pox-stack-aggregation-increase (get-pox-reward-address) reward-cycle reward-cycle-index))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

(define-public (set-pox-reward-address (new-address { version: (buff 1), hashbytes: (buff 32) }))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))

    (var-set pox-reward-address new-address)
    (ok true)
  )
)

(define-public (set-pox-signer-key (new-signer-key (buff 33)))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))

    (var-set pox-signer-key new-signer-key)
    (ok true)
  )
)

(define-public (set-cycle-to-signer-signature (cycle uint) (signature (buff 65)))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))

    (map-set cycle-to-signer-signature cycle signature)
    (ok true)
  )
)


;;-------------------------------------
;; PoX Helpers
;;-------------------------------------

(define-read-only (get-stx-account (account principal))
  (if is-in-mainnet
    (stx-account account)
    (contract-call? .pox-4-mock stx-account-mock account)
  )
)

(define-read-only (get-check-delegation (delegate principal))
  (if is-in-mainnet
    ;; TODO: Update to pox-4
    (contract-call? 'SP000000000000000000002Q6VF78.pox-3 get-check-delegation delegate)
    (contract-call? .pox-4-mock get-check-delegation delegate)
  )
)

(define-read-only (current-pox-reward-cycle) 
  (if is-in-mainnet
    ;; TODO: Update to pox-4
    (contract-call? 'SP000000000000000000002Q6VF78.pox-3 current-pox-reward-cycle)
    (contract-call? .pox-4-mock current-pox-reward-cycle)
  )
)

(define-read-only (reward-cycle-to-burn-height (cycle-id uint)) 
  (if is-in-mainnet
    ;; TODO: Update to pox-4
    (contract-call? 'SP000000000000000000002Q6VF78.pox-3 reward-cycle-to-burn-height cycle-id)
    (contract-call? .pox-4-mock reward-cycle-to-burn-height cycle-id)
  )
)

(define-private (pox-delegate-stx (amount-ustx uint) (delegate-to principal) (until-burn-ht (optional uint))) 
  (if is-in-mainnet
    ;; TODO: Update to pox-4
    (contract-call? 'SP000000000000000000002Q6VF78.pox-3 delegate-stx amount-ustx delegate-to until-burn-ht none)
    (contract-call? .pox-4-mock delegate-stx amount-ustx delegate-to until-burn-ht none)
  )
)

(define-private (pox-revoke-delegate-stx) 
  (if is-in-mainnet
    ;; TODO: Update to pox-4
    (match (contract-call? 'SP000000000000000000002Q6VF78.pox-3 revoke-delegate-stx)
      result (ok result)
      error (if (is-eq error 34) (ok true) (err (to-uint error)))
    )
    (match (contract-call? .pox-4-mock revoke-delegate-stx)
      result (ok true)
      error (if (is-eq error 34) (ok true) (err (to-uint error)))
    )
  )
)

(define-read-only (get-stacker-info (delegate principal)) 
  (if is-in-mainnet
    ;; TODO: Update to pox-4
    (contract-call? 'SP000000000000000000002Q6VF78.pox-3 get-stacker-info delegate)
    (contract-call? .pox-4-mock get-stacker-info delegate)
  )
)   

(define-private (pox-delegate-stack-stx 
  (stacker principal)
  (amount-ustx uint)
  (pox-addr { version: (buff 1), hashbytes: (buff 32) })
  (start-burn-ht uint)
) 
  (if is-in-mainnet
    ;; TODO: Update to pox-4
    (contract-call? 'SP000000000000000000002Q6VF78.pox-3 delegate-stack-stx stacker amount-ustx pox-addr start-burn-ht u1)
    (contract-call? .pox-4-mock delegate-stack-stx stacker amount-ustx pox-addr start-burn-ht u1)
  )
)

(define-private (pox-delegate-stack-extend (stacker principal) (pox-addr { version: (buff 1), hashbytes: (buff 32) })) 
  (if is-in-mainnet
    ;; TODO: Update to pox-4
    (contract-call? 'SP000000000000000000002Q6VF78.pox-3 delegate-stack-extend stacker pox-addr u1)
    (contract-call? .pox-4-mock delegate-stack-extend stacker pox-addr u1)
  )
)

(define-private (pox-delegate-stack-increase (stacker principal) (pox-addr { version: (buff 1), hashbytes: (buff 32) }) (increase-by uint)) 
  (if is-in-mainnet
    ;; TODO: Update to pox-4
    (contract-call? 'SP000000000000000000002Q6VF78.pox-3 delegate-stack-increase stacker pox-addr increase-by)
    (contract-call? .pox-4-mock delegate-stack-increase stacker pox-addr increase-by)
  )
)

(define-private (pox-stack-aggregation-commit-indexed (pox-addr { version: (buff 1), hashbytes: (buff 32) }) (reward-cycle uint)) 
  (if is-in-mainnet
    ;; TODO: Update to pox-4
    (contract-call? 'SP000000000000000000002Q6VF78.pox-3 stack-aggregation-commit-indexed pox-addr reward-cycle)
    (contract-call? .pox-4-mock stack-aggregation-commit-indexed pox-addr reward-cycle (get-cycle-to-signer-signature reward-cycle) (var-get pox-signer-key) u999999999000000 (get-last-auth-id))
  )
)

(define-private (pox-stack-aggregation-increase (pox-addr { version: (buff 1), hashbytes: (buff 32) }) (reward-cycle uint) (cycle-reward-index uint)) 
  (if is-in-mainnet
    ;; TODO: Update to pox-4
    (contract-call? 'SP000000000000000000002Q6VF78.pox-3 stack-aggregation-increase pox-addr reward-cycle cycle-reward-index)
    (contract-call? .pox-4-mock stack-aggregation-increase pox-addr reward-cycle cycle-reward-index)
  )
)

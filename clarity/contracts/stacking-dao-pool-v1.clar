;; @contract Stacking Pool
;; @version 1

;; As user: `revoke-delegate-stx` and `delegate-stx` to (re)set amount to delegate
;; As pool: `delegate-stack-stx` for first time user, otherwise `delegate-stack-extend` once and `delegate-stack-increase` if needed
;; As pool: `stack-aggregation-commit-indexed` to commit to a reward cycle and get reward index, only done once per cycle
;; As pool: `stack-aggregation-increase` with index from previous commit

;;-------------------------------------
;; Maps
;;-------------------------------------

;; TODO: update for mainnet
(define-data-var pox-reward-address { version: (buff 1), hashbytes: (buff 32) } { version: 0x00, hashbytes: 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac })

;;-------------------------------------
;; Maps
;;-------------------------------------

;; Map cycle to reward index
(define-map cycle-to-index uint uint)

;;-------------------------------------
;; Getters
;;-------------------------------------

(define-read-only (get-pox-reward-address)
  (var-get pox-reward-address)
)

(define-read-only (get-cycle-to-index (cycle uint))
  (map-get? cycle-to-index cycle)
)

;;-------------------------------------
;; Public 
;;-------------------------------------

(define-public (prepare)
  (let (
    ;; TODO: dependency on strategy?
    (delegates (contract-call? .strategy-v2 get-pool-delegates (as-contract tx-sender)))
  )
    ;; TODO: check errors
    (map delegation delegates)

    ;; TODO: check errors
    (try! (aggregation))

    (ok true)
  )
)

;;-------------------------------------
;; Helpers 
;;-------------------------------------

(define-private (delegation (delegate principal))
  (let (
    ;; TODO: update for mainnet
    (delegation-info (unwrap-panic (contract-call? .pox-3-mock get-check-delegation delegate)))
    (delegation-amount (get amount-ustx delegation-info))
  )
    ;; TODO: IF DELEGATION-AMOUNT IS 0

    ;; TODO: update for mainnet
    (if (is-none (contract-call? .pox-3-mock get-stacker-info delegate))
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
    (ok true)
  )
)

(define-private (aggregation)
  (let (
    (next-cycle (+ (contract-call? .pox-3-mock current-pox-reward-cycle) u1))
    (index (map-get? cycle-to-index next-cycle))
  )
    (if (is-none index)
      ;; No index yet, commit
      (let (
        (reward-index (try! (as-contract (stack-aggregation-commit-indexed next-cycle))))
      )
        (map-set cycle-to-index next-cycle reward-index)
        true
      )

      ;; Already have an index for cycle
      (begin
        (try! (as-contract (stack-aggregation-increase next-cycle (unwrap-panic index))))
        true
      )
    )
    (ok true)
  )
)

;;-------------------------------------
;; PoX Helpers
;;-------------------------------------

(define-read-only (get-stx-account (account principal))
  ;; TODO: update for mainnet
  (contract-call? .pox-3-mock stx-account-mock account)
  ;; (stx-account account)
)

(define-public (not-extended-next-cycle (delegate principal))
  (let (
    ;; TODO: update for mainnet
    (current-cycle (contract-call? .pox-3-mock current-pox-reward-cycle))
    (next-cycle-height (contract-call? .pox-3-mock reward-cycle-to-burn-height (+ current-cycle u1)))
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
    
    ;; TODO: update for mainnet
    (match (as-contract (contract-call? .pox-3-mock delegate-stack-stx stacker amount-ustx (get-pox-reward-address) burn-block-height u1))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (delegate-stack-extend (stacker principal))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))

    ;; TODO: update for mainnet
    (match (as-contract (contract-call? .pox-3-mock delegate-stack-extend stacker (get-pox-reward-address) u1))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (delegate-stack-increase (stacker principal) (increase-by uint))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))

    ;; TODO: update for mainnet
    (match (as-contract (contract-call? .pox-3-mock delegate-stack-increase stacker (get-pox-reward-address) increase-by))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (stack-aggregation-commit-indexed (reward-cycle uint))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))

    ;; TODO: update for mainnet
    (match (as-contract (contract-call? .pox-3-mock stack-aggregation-commit-indexed (get-pox-reward-address) reward-cycle))
      result (ok result)
      error (err (to-uint error))
    )
  )
)

(define-public (stack-aggregation-increase (reward-cycle uint) (reward-cycle-index uint))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))

    ;; TODO: update for mainnet
    (match (as-contract (contract-call? .pox-3-mock stack-aggregation-increase (get-pox-reward-address) reward-cycle reward-cycle-index))
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
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (var-set pox-reward-address new-address)
    (ok true)
  )
)

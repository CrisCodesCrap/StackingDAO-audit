;; @contract Sticky Stacker Contract
;; @version 1
;; Stacker can initiate stacking for the STX reserve
;; The amount to stack is kept as a data var in the stx reserve
;; Stacks the STX tokens in PoX-2
;; mainnet pox contract: SP000000000000000000002Q6VF78.pox-2 TODO: update
;; https://github.com/stacks-network/stacks-blockchain/blob/next/src/chainstate/stacks/boot/pox-2.clar
;; random addr to use for hashbytes testing
;; 0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac
;; 0x00

(use-trait sticky-core-trait .sticky-core-trait-v1.sticky-core-trait)

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_NOT_AUTHORIZED u19401)
(define-constant ERR_EMERGENCY_SHUTDOWN_ACTIVATED u195)

;;-------------------------------------
;; Variables 
;;-------------------------------------

(define-data-var stacking-unlock-burn-height uint u0) ;; when is this cycle over
(define-data-var stacking-stx-stacked uint u0) ;; how many stx did we stack in this cycle

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-stacking-unlock-burn-height)
  (ok (var-get stacking-unlock-burn-height))
)

(define-read-only (get-stacking-stx-stacked)
  (ok (var-get stacking-stx-stacked))
)

(define-read-only (get-stx-balance)
  (stx-get-balance (as-contract tx-sender))
)

;;-------------------------------------
;; Stacking 
;;-------------------------------------

;; this should be called only once in Stacks 2.1
;; additional calls should be made with `stack-extend` and `stack-increase` in this contract
;; lock-period should be u1 and when it runs out, `stack-extend` should be called to extend with 1 period
(define-public (initiate-stacking 
    (sticky-core <sticky-core-trait>)
    (pox-addr (tuple (version (buff 1)) (hashbytes (buff 32))))
    (tokens-to-stack uint)
    (start-burn-ht uint)
    (lock-period uint)
  )
  ;; 1. check `get-stacking-minimum` or `can-stack-stx` to see if we have > minimum tokens
  ;; 2. call `stack-stx` for `lock-period` periods
  (let (
    (stx-balance (get-stx-balance))
  )
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))
    (try! (contract-call? .sticky-dao check-is-enabled))
    (try! (contract-call? .sticky-dao check-is-contract-name (contract-of sticky-core) "core"))

    ;; check if we can stack - if not, then probably cause we have not reached the minimum with tokens-to-stack
    (match (as-contract (contract-call? 'ST000000000000000000002AMW42H.pox-2 can-stack-stx pox-addr tokens-to-stack start-burn-ht lock-period))
      success (begin
        (if (> tokens-to-stack stx-balance)
          (try! (contract-call? sticky-core request-stx-to-stack (- tokens-to-stack stx-balance)))
          true
        )
        (match (as-contract (contract-call? 'ST000000000000000000002AMW42H.pox-2 stack-stx tokens-to-stack pox-addr start-burn-ht lock-period))
          result (begin
            (print result)
            (var-set stacking-unlock-burn-height (get unlock-burn-height result))
            (var-set stacking-stx-stacked (get lock-amount result))
            (ok (get lock-amount result))
          )
          error (begin
            (print (err (to-uint error)))
          )
        )
      )
      failure (print (err (to-uint failure)))
    )
  )
)

;; should be called to add additional STX tokens stacking
;; if there is net outflow of STX between two cycles, does not need to be called
;; before calling this, consolidate the new amount of tokens to stack in PoX in stx-reserve `set-tokens-to-stack`
;; then call this first, before a new cycle starts (every 2100 blocks)
;; after calling this, call `stack-extend`
(define-public (stack-increase (sticky-core <sticky-core-trait>) (additional-tokens-to-stack uint))
  (let (
    (stx-balance (get-stx-balance))
  )
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))
    (try! (contract-call? .sticky-dao check-is-enabled))
    (try! (contract-call? .sticky-dao check-is-contract-name (contract-of sticky-core) "core"))

    (try! (contract-call? sticky-core request-stx-to-stack additional-tokens-to-stack))
    (match (as-contract (contract-call? 'ST000000000000000000002AMW42H.pox-2 stack-increase additional-tokens-to-stack))
      result (begin
        (print result)
        (var-set stacking-stx-stacked (get total-locked result))
        (ok (get total-locked result))
      )
      error (begin
        (print (get-stx-balance))
        (print (err (to-uint error)))
      )
    )
  )
)

;; this should be called just before a new cycle starts to extend with another cycle
;; `extend-count` should always be 1 (if all is well)
;; we can extend by 1 cycle each 2100 blocks, that way everyone can always unstack if they want (after a cycle ends)
(define-public (stack-extend (extend-count uint) (pox-addr { version: (buff 1), hashbytes: (buff 32) }))
  (begin
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))
    (try! (contract-call? .sticky-dao check-is-enabled))

    (match (as-contract (contract-call? 'ST000000000000000000002AMW42H.pox-2 stack-extend extend-count pox-addr))
      result (begin
        (print result)
        (var-set stacking-unlock-burn-height (get unlock-burn-height result))
        (ok (get unlock-burn-height result))
      )
      error (begin
        (print (err (to-uint error)))
      )
    )
  )
)

;;-------------------------------------
;; Admin 
;;-------------------------------------

;; return STX to the STX reserve
;; can be used when deprecating this stacker logic
(define-public (return-stx (stx-amount uint) (receiver principal) )
  (begin
    (try! (contract-call? .sticky-dao check-is-enabled))
    ;; TODO: move to pool instead of core?
    (try! (contract-call? .sticky-dao check-is-contract-name receiver "core"))
    (as-contract (stx-transfer? stx-amount tx-sender receiver))
  )
)

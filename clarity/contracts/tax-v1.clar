;; @contract Tax
;; @version 1

(impl-trait 'SP3C0TCQS0C0YY8E0V3EJ7V4X9571885D44M8EFWF.arkadiko-automation-trait-v1.automation-trait)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-constant ERR_SHOULD_NOT_HANDLE u2101)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var min-balance-to-handle uint u100000000) ;; 100
(define-data-var percentage-to-swap uint u4000) ;; bps

;;-------------------------------------
;; Getters
;;-------------------------------------

(define-read-only (get-min-balance-to-handle)
  (var-get min-balance-to-handle)
)

(define-read-only (get-percentage-to-swap)
  (var-get percentage-to-swap)
)

;;-------------------------------------
;; Arkadiko Keeper functions
;;-------------------------------------

(define-public (initialize)
  (ok true)
)

(define-read-only (check-job)
  (ok (should-handle-tax))
)

(define-public (run-job)
  (handle-tax)
)

;;-------------------------------------
;; Handle tax 
;;-------------------------------------

(define-read-only (should-handle-tax)
  (let (
    (tax-amount (contract-call? .stdao-token get-tax-balance))
  )
    (if (> tax-amount  (get-min-balance-to-handle))
      true
      false
    )
  )
)

;; Need to be called by keeper
(define-public (handle-tax)
  (begin
    (asserts! (should-handle-tax) (err ERR_SHOULD_NOT_HANDLE))

    ;; Get tax from contract
    (try! (contract-call? .stdao-token withdraw-tax (as-contract tx-sender)))

    (let (
      (balance (unwrap-panic (as-contract (contract-call? .stdao-token get-balance tx-sender))))
      (to-swap (/ (* balance (var-get percentage-to-swap)) u10000))
    )
      ;; Swap STDAO for STX
      ;; TODO
      ;; (try! (contract-call? 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.amm-swap-pool-v1-1 swap-helper 
      ;;   'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wstdao 
      ;;   'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wstx 
      ;;   u100000000 
      ;;   to-swap 
      ;;   (some u0)
      ;; ))

      ;; Add liquidity
      ;; TODO
      ;; (try! (contract-call? 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.amm-swap-pool-v1-1 add-to-position 
      ;;   'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wstdao 
      ;;   'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wstx 
      ;;   u100000000 
      ;;   (unwrap-panic (as-contract (contract-call? .stdao-token get-balance tx-sender)))
      ;;   (some u0)
      ;; ))

      (ok true)
    )
  )
)

;;-------------------------------------
;; Admin 
;;-------------------------------------

(define-public (retreive-tokens)
  (let (
    (balance (unwrap-panic (as-contract (contract-call? .stdao-token get-balance tx-sender))))
    (receiver tx-sender)
  )
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (try! (as-contract (contract-call? .stdao-token transfer balance tx-sender receiver none)))
    (ok balance)
  )
)

(define-public (set-min-balance-to-handle (min-balance uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (var-set min-balance-to-handle min-balance)
    (ok true)
  )
)

(define-public (set-percentage-to-swap (new-percentage uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (var-set percentage-to-swap new-percentage)
    (ok true)
  )
)

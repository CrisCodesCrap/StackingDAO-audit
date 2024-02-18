;; @contract Supported Protocol - Arkadiko
;; @version 1

(impl-trait .protocol-trait-v1.protocol-trait)

;;-------------------------------------
;; Arkadiko 
;;-------------------------------------

;; Public method in case we can not use read-only
(define-public (get-balance (user principal))

  ;; TODO: get position in Arkadiko V2
  ;; (let (
  ;;   (vault (contract-call? 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-vaults-data-v1-1 get-vault user .ststx.token))
  ;; )
  ;;   ;; Check status
  ;;   (if (is-eq (get status vault) u101)
  ;;     (ok (get collateral vault))
  ;;     (ok u0)
  ;;   )
  ;; )
  (ok (get-user-balance user))
)

;;-------------------------------------
;; For testing only 
;;-------------------------------------
;; TODO: update for mainnet

(define-map user-balance principal uint)

(define-read-only (get-user-balance (user principal))
  (default-to
    u0
    (map-get? user-balance user)
  )
)

(define-public (add-user-balance (balance uint))
  (begin
    (try! (contract-call? .ststx-token transfer balance tx-sender (as-contract tx-sender) none))

    (map-set user-balance tx-sender balance)
    (ok true)
  )
)

(define-public (remove-user-balance (balance uint))
  (let (
    (user tx-sender)
  )
    (try! (as-contract (contract-call? .ststx-token transfer balance tx-sender user none)))

    (map-set user-balance user balance)
    (ok true)
  )
)

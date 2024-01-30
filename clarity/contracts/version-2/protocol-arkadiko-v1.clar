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
  (ok u0)
)

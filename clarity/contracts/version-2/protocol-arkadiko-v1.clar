;; @contract Supported Protocol - Arkadiko
;; @version 1

(impl-trait .supported-protocol-trait-v1.supported-protocol-trait)

;;-------------------------------------
;; Arkadiko 
;;-------------------------------------

;; Public method in case we can not use read-only
(define-public (get-balance (user principal))

  ;; TODO: get position in Arkadiko V2
  ;; (let (
  ;;   (vault (contract-call? 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-vaults-data-v1-1 get-vault user .ststx.token))
  ;; )
  ;;   (ok (get collateral vault))
  ;; )
  (ok u0)
)

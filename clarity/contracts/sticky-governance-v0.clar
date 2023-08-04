;; @contract Sticky Governance V0
;; @version 0

;;-------------------------------------
;; Set 
;;-------------------------------------

(define-public (set-contract-active (address principal) (active bool) (name (string-ascii 256)))
  (contract-call? .sticky-dao set-contract-active address active name)
)

;; @contract Sticky DAO
;; @version 1

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_NOT_AUTHORIZED u20401)
(define-constant ERR_CONTRACTS_DISABLED u20001)
(define-constant ERR_INACTIVE_CONTRACT u20002)

;;-------------------------------------
;; Variables 
;;-------------------------------------

;; TODO: need to be able to turn off guardian (move to full governance)
(define-data-var active-guardian principal tx-sender)

(define-data-var contracts-enabled bool true)

;;-------------------------------------
;; Maps 
;;-------------------------------------

(define-map contracts
  { 
    address: principal 
  }
  {
    active: bool,
    name: (string-ascii 256)
  }
)

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-active-guardian)
  (var-get active-guardian)
)

(define-read-only (get-contracts-enabled)
  (var-get contracts-enabled)
)

(define-read-only (get-contract-active (address principal))
  (get active 
    (default-to 
      { active: false, name: "" }
      (map-get? contracts { address: address })
    )
  )
)

(define-read-only (get-contract-name (address principal))
  (get name 
    (default-to 
      { active: false, name: "" }
      (map-get? contracts { address: address })
    )
  )
)

;;-------------------------------------
;; Checks 
;;-------------------------------------

(define-public (check-is-admin (sender principal))
  (begin
    (asserts! (or (is-eq (get-contract-name sender) "governance") (is-eq sender (var-get active-guardian))) (err ERR_NOT_AUTHORIZED))
    (ok true)
  )
)

(define-public (check-is-enabled)
  (begin
    (asserts! (var-get contracts-enabled) (err ERR_CONTRACTS_DISABLED))
    (ok true)
  )
)

(define-public (check-is-contract-active (contract principal))
  (begin
    (asserts! (get-contract-active contract) (err ERR_INACTIVE_CONTRACT))
    (ok true)
  )
)

(define-public (check-is-contract-name (contract principal) (name (string-ascii 256)))
  (begin
    (asserts! (is-eq (get-contract-name contract) name) (err ERR_INACTIVE_CONTRACT))
    (ok true)
  )
)

;;-------------------------------------
;; Set 
;;-------------------------------------

(define-public (set-active-guardian (guardian principal))
  (begin
    (try! (check-is-admin tx-sender))
    (var-set active-guardian guardian)
    (ok true)
  )
)

(define-public (set-contracts-enabled (enabled bool))
  (begin
    (try! (check-is-admin tx-sender))
    (var-set contracts-enabled enabled)
    (ok true)
  )
)

(define-public (set-contract-active (address principal) (active bool) (name (string-ascii 256)))
  (begin
    (try! (check-is-admin tx-sender))
    (map-set contracts { address: address } { active: active, name: name }
  )
    (ok true)
  )
)

;;-------------------------------------
;; Init 
;;-------------------------------------

;; TODO: update for mainnet
(begin
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-core-v1 } { active: true, name: "core" })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-governance-v0 } { active: true, name: "governance" })

  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-1 } { active: true, name: "stacker-1" })
  ;; TODO: add other stackers
)

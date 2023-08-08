;; @contract Sticky DAO
;; @version 1

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_NOT_ADMIN u20001)
(define-constant ERR_CONTRACTS_DISABLED u20002)
(define-constant ERR_INACTIVE_CONTRACT u20003)

;;-------------------------------------
;; Variables 
;;-------------------------------------

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
  }
)

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-contracts-enabled)
  (var-get contracts-enabled)
)

(define-read-only (get-contract-active (address principal))
  (get active 
    (default-to 
      { active: false }
      (map-get? contracts { address: address })
    )
  )
)

;;-------------------------------------
;; Checks 
;;-------------------------------------

(define-public (check-is-enabled)
  (begin
    (asserts! (var-get contracts-enabled) (err ERR_CONTRACTS_DISABLED))
    (ok true)
  )
)

(define-public (check-is-protocol (contract principal))
  (begin
    (asserts! (get-contract-active contract) (err ERR_INACTIVE_CONTRACT))
    (ok true)
  )
)

;;-------------------------------------
;; Set 
;;-------------------------------------

(define-public (set-contracts-enabled (enabled bool))
  (begin
    (try! (check-is-protocol tx-sender))
    (var-set contracts-enabled enabled)
    (ok true)
  )
)

(define-public (set-contract-active (address principal) (active bool))
  (begin
    (try! (check-is-protocol tx-sender))
    (map-set contracts { address: address } { active: active }
  )
    (ok true)
  )
)

;;-------------------------------------
;; Init 
;;-------------------------------------

;; TODO: update for mainnet
(begin
  (map-set contracts { address: tx-sender } { active: true })

  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-core-v1 } { active: true })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-governance-v0 } { active: true })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-reserve-v1 } { active: true })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-commission-v1 } { active: true })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-tax-v1 } { active: true })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-staking-v1 } { active: true })

  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-1 } { active: true })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-2 } { active: true })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-3 } { active: true })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-4 } { active: true })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-5 } { active: true })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-6 } { active: true })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-7 } { active: true })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-8 } { active: true })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-9 } { active: true })
  (map-set contracts { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sticky-stacker-10 } { active: true })

)

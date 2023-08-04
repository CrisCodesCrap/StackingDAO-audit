(impl-trait .sip-010-trait-ft-standard.sip-010-trait)

;; Defines the Sticky token according to the SIP010 Standard
(define-fungible-token sticky)

(define-constant ERR_NOT_AUTHORIZED u1401)

(define-data-var token-uri (string-utf8 256) u"")

;;-------------------------------------
;; SIP-10 
;;-------------------------------------

(define-read-only (get-total-supply)
  (ok (ft-get-supply sticky))
)

(define-read-only (get-name)
  (ok "Sticky Token")
)

(define-read-only (get-symbol)
  (ok "STICKY")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance sticky account))
)

(define-public (set-token-uri (value (string-utf8 256)))
  (begin
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))
    (ok (var-set token-uri value))
  )
)

(define-read-only (get-token-uri)
  (ok (some (var-get token-uri)))
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) (err ERR_NOT_AUTHORIZED))

    (match (ft-transfer? sticky amount sender recipient)
      response (begin
        (print memo)
        (ok response)
      )
      error (err error)
    )
  )
)

;;-------------------------------------
;; Mint / Burn
;;-------------------------------------

;; Mint method
(define-public (mint-for-sticky (amount uint) (recipient principal))
  (begin
    (try! (contract-call? .sticky-dao check-is-contract-active contract-caller))
    (ft-mint? sticky amount recipient)
  )
)

;; Burn method
(define-public (burn-for-sticky (amount uint) (sender principal))
  (begin
    (try! (contract-call? .sticky-dao check-is-contract-active contract-caller))
    (ft-burn? sticky amount sender)
  )
)

;; Burn external
(define-public (burn (amount uint) (sender principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err ERR_NOT_AUTHORIZED))
    (ft-burn? sticky amount sender)
  )
)

;; Test environments
(begin
  ;; TODO: do not do this on testnet or mainnet
  (try! (ft-mint? sticky u890000000000 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM))
)

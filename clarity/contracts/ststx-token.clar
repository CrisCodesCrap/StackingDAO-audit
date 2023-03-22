(impl-trait .sip-010-trait-ft-standard.sip-010-trait)

;; Defines the Sticky Stacked STX according to the SIP010 Standard
(define-fungible-token ststx)

(define-data-var token-uri (string-utf8 256) u"")
(define-data-var contract-owner principal tx-sender)

;; errors
(define-constant ERR-NOT-AUTHORIZED u1401)

(define-public (set-contract-owner (owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))

    (ok (var-set contract-owner owner))
  )
)

;; ---------------------------------------------------------
;; SIP-10 Functions
;; ---------------------------------------------------------

(define-read-only (get-total-supply)
  (ok (ft-get-supply ststx))
)

(define-read-only (get-name)
  (ok "Stacked STX Token")
)

(define-read-only (get-symbol)
  (ok "stSTX")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance ststx account))
)

(define-public (set-token-uri (value (string-utf8 256)))
  (if (is-eq tx-sender (var-get contract-owner))
    (ok (var-set token-uri value))
    (err ERR-NOT-AUTHORIZED)
  )
)

(define-read-only (get-token-uri)
  (ok (some (var-get token-uri)))
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) (err ERR-NOT-AUTHORIZED))

    (match (ft-transfer? ststx amount sender recipient)
      response (begin
        (print memo)
        (ok response)
      )
      error (err error)
    )
  )
)

;; Mint method
(define-public (mint-for-sticky (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq contract-caller .sticky-core) (err ERR-NOT-AUTHORIZED))
    (ft-mint? ststx amount recipient)
  )
)

;; Burn method
(define-public (burn-for-sticky (amount uint) (sender principal))
  (begin
    (asserts! (is-eq contract-caller .sticky-core) (err ERR-NOT-AUTHORIZED))
    (ft-burn? ststx amount sender)
  )
)

;; Burn external
(define-public (burn (amount uint) (sender principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err ERR-NOT-AUTHORIZED))
    (ft-burn? ststx amount sender)
  )
)

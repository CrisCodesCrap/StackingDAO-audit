(impl-trait .sip-010-trait-ft-standard.sip-010-trait)

;; Defines the Sticky token according to the SIP010 Standard
(define-fungible-token sticky)

(define-constant ERR_NOT_AUTHORIZED u1401)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var token-uri (string-utf8 256) u"")

(define-data-var amm-addresses (list 5 principal) (list ))
(define-data-var buy-tax uint u400) ;; 4% in basis points
(define-data-var sell-tax uint u400) ;; 4% in basis points

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
  (let (
    (sender-is-amm (is-amm-address sender))
    (recipient-is-amm (is-amm-address recipient))

    (tax-amount
      (if (is-amm-address sender)
        (/ (* amount (var-get buy-tax)) u10000)
        (if (is-amm-address recipient)
          (/ (* amount (var-get sell-tax)) u10000)
          u0
        )
      )
    )
  )
    (asserts! (is-eq tx-sender sender) (err ERR_NOT_AUTHORIZED))

    (if (> tax-amount u0)
      (try! (ft-transfer? sticky tax-amount sender (as-contract tx-sender)))
      true
    )
    (try! (ft-transfer? sticky (- amount tax-amount) sender recipient))

    (ok true)
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

;;-------------------------------------
;; Tax
;;-------------------------------------

(define-read-only (is-amm-address (address principal))
  (is-some (index-of (var-get amm-addresses) address))
)

(define-public (set-amm-addresses (addresses (list 5 principal)))
  (begin
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))

    (var-set amm-addresses addresses)
    (ok true)
  )
)

(define-read-only (get-buy-tax)
  (var-get buy-tax)
)

(define-read-only (get-sell-tax)
  (var-get sell-tax)
)

(define-public (set-tax (new-buy-tax uint) (new-sell-tax uint))
  (begin
    (try! (contract-call? .sticky-dao check-is-admin tx-sender))

    (var-set buy-tax new-buy-tax)
    (var-set sell-tax new-sell-tax)
    (ok true)
  )
)

(define-read-only (get-tax-balance)
  (unwrap-panic (get-balance (as-contract tx-sender)))
)

(define-public (withdraw-tax)
  (let (
    (amount (get-tax-balance))
    (receiver contract-caller)
  )
    (try! (contract-call? .sticky-dao check-is-contract-name contract-caller "tax"))
    
    (try! (as-contract (transfer amount tx-sender receiver none)))
    (ok amount)
  )
)



;; Test environments
(begin
  ;; TODO: do not do this on testnet or mainnet
  (try! (ft-mint? sticky u890000000000 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM))
)

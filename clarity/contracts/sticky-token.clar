(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)
(impl-trait .tax-token-trait-v1.tax-token-trait)

;; Defines the Sticky token according to the SIP010 Standard
(define-fungible-token sticky)

(define-constant ERR_NOT_AUTHORIZED u1401)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var token-uri (string-utf8 256) u"")

(define-data-var amm-addresses (list 5 principal) (list ))
(define-data-var exclude-from-fees (list 5 principal) (list ))
(define-data-var buy-tax uint u300) ;; 3% in basis points
(define-data-var sell-tax uint u400) ;; 4% in basis points

;;-------------------------------------
;; SIP-010 
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

(define-read-only (get-token-uri)
  (ok (some (var-get token-uri)))
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (let (
    (sender-is-amm (is-amm-address sender))
    (recipient-is-amm (is-amm-address recipient))

    (tax-amount
      (if (or (is-excluded-from-fees sender) (is-excluded-from-fees recipient))
        u0
        (if (is-amm-address sender)
          (/ (* amount (var-get buy-tax)) u10000)
          (if (is-amm-address recipient)
            (/ (* amount (var-get sell-tax)) u10000)
            u0
          )
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
;; Admin
;;-------------------------------------

(define-public (set-token-uri (value (string-utf8 256)))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))
    (ok (var-set token-uri value))
  )
)

;;-------------------------------------
;; Mint / Burn
;;-------------------------------------

;; Mint method
(define-public (mint-for-protocol (amount uint) (recipient principal))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))
    (ft-mint? sticky amount recipient)
  )
)

;; Burn method
(define-public (burn-for-protocol (amount uint) (sender principal))
  (begin
    (try! (contract-call? .dao check-is-protocol contract-caller))
    (ft-burn? sticky amount sender)
  )
)

;; Burn external
(define-public (burn (amount uint))
  (begin
    (ft-burn? sticky amount tx-sender)
  )
)

;;-------------------------------------
;; Tax
;;-------------------------------------

(define-read-only (get-buy-tax)
  (ok (var-get buy-tax))
)

(define-read-only (get-sell-tax)
  (ok (var-get sell-tax))
)

(define-public (set-tax (new-buy-tax uint) (new-sell-tax uint))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (var-set buy-tax new-buy-tax)
    (var-set sell-tax new-sell-tax)
    (ok true)
  )
)

(define-read-only (is-amm-address (address principal))
  (is-some (index-of (var-get amm-addresses) address))
)

(define-public (set-amm-addresses (addresses (list 5 principal)))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (var-set amm-addresses addresses)
    (ok true)
  )
)

(define-read-only (is-excluded-from-fees (address principal))
  (is-some (index-of (var-get exclude-from-fees) address))
)

(define-public (set-exclude-from-fees (addresses (list 5 principal)))
  (begin
    (try! (contract-call? .dao check-is-protocol tx-sender))

    (var-set exclude-from-fees addresses)
    (ok true)
  )
)

(define-read-only (get-tax-balance)
  (unwrap-panic (get-balance (as-contract tx-sender)))
)

(define-public (withdraw-tax (receiver principal))
  (let (
    (amount (get-tax-balance))
  )
    (try! (contract-call? .dao check-is-protocol receiver))
    
    (try! (as-contract (transfer amount tx-sender receiver none)))
    (ok amount)
  )
)



;; Test environments
(begin
  ;; TODO: do not do this on testnet or mainnet
  (try! (ft-mint? sticky u890000000000 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM))
  (try! (ft-mint? sticky u10000000000 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5))
  (try! (ft-mint? sticky u10000000000 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG))
  (try! (ft-mint? sticky u10000000000 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC))
)

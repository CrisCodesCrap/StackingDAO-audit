
;; Verify the next step of a Merkle proof.
;; This hashes cur-hash against the ctr-th hash in proof-hashes, and uses that as the next cur-hash.
;; The path is a bitfield describing the walk from the txid up to the merkle root:
;; * if the ith bit is 0, then cur-hash is hashed before the next proof-hash (cur-hash is "left").
;; * if the ith bit is 1, then the next proof-hash is hashed before cur-hash (cur-hash is "right").
;; The proof verifies if cur-hash is equal to root-hash, and we're out of proof-hashes to check.
(define-read-only (inner-merkle-proof-verify (ctr uint) (state { path: uint, root-hash: (buff 32), proof-hashes: (list 12 (buff 32)), tree-depth: uint, cur-hash: (buff 32), verified: bool }))
  (if (get verified state)
    state
    (if (>= ctr (get tree-depth state))
      (begin
        (print "ctr exceeds proof length or tree depth")
        (print ctr)
        (print (get tree-depth state))
        (print (len (get proof-hashes state)))
        (merge state { verified: false })
      )
      (let (
        (path (get path state))
        (is-left (is-bit-set path ctr))
        (proof-hashes (get proof-hashes state))
        (cur-hash (get cur-hash state))
        (root-hash (get root-hash state))

        (h1 (if is-left (unwrap-panic (element-at proof-hashes ctr)) cur-hash))
        (h2 (if is-left cur-hash (unwrap-panic (element-at proof-hashes ctr))))
        (next-hash (sha256 (sha256 (concat h1 h2))))
        (is-verified (and (is-eq (+ u1 ctr) (len proof-hashes)) (is-eq next-hash root-hash)))
      )
        (begin
          (print "cur-hash")
          (print cur-hash)
          (print "next-hash")
          (print h1)
          (print h2)
          (print next-hash)
          (merge state { cur-hash: next-hash, verified: is-verified })
        )
      )
    )
  )
)

;; Verify a Merkle proof, given the _reversed_ txid of a transaction, the merkle root of its block, and a proof consisting of:
;; * The index in the block where the transaction can be found (starting from 0),
;; * The list of hashes that link the txid to the merkle root,
;; * The depth of the block's merkle tree (required because Bitcoin does not identify merkle tree nodes as being leaves or intermediates).
;; The _reversed_ txid is required because that's the order (big-endian) processes them in.
;; The tx-index is required because it tells us the left/right traversals we'd make if we were walking down the tree from root to transaction,
;; and is thus used to deduce the order in which to hash the intermediate hashes with one another to link the txid to the merkle root.
;; Returns (ok true) if the proof is valid.
;; Returns (ok false) if the proof is invalid.
;; Returns (err ERR-PROOF-TOO-SHORT) if the proof's hashes aren't long enough to link the txid to the merkle root.
(define-read-only (verify-merkle-proof (reversed-txid (buff 32)) (merkle-root (buff 32)) (proof { tx-index: uint, hashes: (list 12 (buff 32)), tree-depth: uint }))
  (if (> (get tree-depth proof) (len (get hashes proof)))
    (err ERR-PROOF-TOO-SHORT)
    (ok
      (get verified
        (fold inner-merkle-proof-verify
          (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11)
          { path: (+ (pow u2 (get tree-depth proof)) (get tx-index proof)), root-hash: merkle-root, proof-hashes: (get hashes proof), cur-hash: reversed-txid, tree-depth: (get tree-depth proof), verified: false }
        )
      )
    )
  )
)

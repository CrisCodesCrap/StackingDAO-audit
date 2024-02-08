;; @contract Strategy V3 Algo V1
;; @version 1
;;

;;-------------------------------------
;; Reach target
;;
;; Try to reach target for each element, but take into account locked.
;;
;;-------------------------------------

(define-read-only (calculate-reach-target (target (list 30 uint)) (locked (list 30 uint)))
  (let (
    (total-target (fold + target u0))
    (total-locked (fold + locked u0))

    (target-change (if (> total-target total-locked)
      (map calculate-inflow-target locked target)
      (map calculate-outflow-target locked target)
    ))

    (deviations (map calculate-target-deviation target-change (list-30-uint total-target)))
    (deviations-sum (fold + deviations u0))
    (deviations-percentages (map calculate-target-deviation-percentage deviations (list-30-uint deviations-sum)))
  )
    (if (> total-target total-locked)
      (map calculate-inflow-new-stacking locked deviations-percentages (list-30-uint (- total-target total-locked)))
      (map calculate-outflow-new-stacking locked deviations-percentages (list-30-uint (- total-locked total-target)))
    )
  )
)

(define-read-only (calculate-inflow-target (locked uint) (target uint))
  (if (> target locked)
    (- target locked)
    u0
  )
)

(define-read-only (calculate-outflow-target (locked uint) (target uint))
  (if (> locked target)
    (- locked target)
    u0
  )
)

(define-read-only (calculate-target-deviation (target-change uint) (new-total-target uint))
  (/ (* target-change u100000000) new-total-target)
)

(define-read-only (calculate-target-deviation-percentage (deviation uint) (total-deviation uint))
  (/ (* deviation u100000000) total-deviation)
)

(define-read-only (calculate-inflow-new-stacking (locked uint) (deviation-percentage uint) (total-change uint))
  (let (
    (actual-change (/ (* total-change deviation-percentage) u100000000))
  )
    (+ locked actual-change)
  )
)

(define-read-only (calculate-outflow-new-stacking (locked uint) (deviation-percentage uint) (total-change uint))
  (let (
    (actual-change (/ (* total-change deviation-percentage) u100000000))
  )
    (- locked actual-change)
  )
)

;;-------------------------------------
;; Lowest Combination
;;
;; Find a combination of the locked list items, so that it's sum is larger than the given outflow.
;; And the difference as low as possible.
;;
;;-------------------------------------

(define-read-only (calculate-lowest-combination (outflow uint) (locked (list 30 uint)))
  (let (
    (combination-one (calculate-lowest-combination-one outflow locked))
    (combination-many-start (calculate-lowest-combination-many-start outflow locked))
    (combination-many-end (calculate-lowest-combination-many-end outflow locked))

    (overunlocked-one (get overunlocked combination-one))
    (overunlocked-many-start (get overunlocked combination-many-start))
    (overunlocked-many-end (get overunlocked combination-many-end))

    (best-combination 
      (if (and (< overunlocked-one overunlocked-many-start) (< overunlocked-one overunlocked-many-end))
        combination-one
        (if (and (< overunlocked-many-start overunlocked-one) (< overunlocked-many-start overunlocked-many-end))
          combination-many-start
          combination-many-end
        )
      )
    )

    (indices (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19 u20 u21 u22 u23 u24 u25 u26 u27 u28 u29))
    (indices-sliced (unwrap-panic (slice? indices u0 (len locked))))
  )
    (map map-index-locked indices-sliced (list-30-list (get indices best-combination)) locked)
  )
)

(define-read-only (map-index-locked (index uint) (unlock-indices (list 30 uint)) (locked uint))
  (if (is-some (index-of? unlock-indices index))
    u0
    locked
  )
)

;;-------------------------------------
;; Lowest Combination - Helpers
;;-------------------------------------

(define-read-only (calculate-overunlocked (outflow uint) (start-index uint) (end-index uint) (locked (list 30 uint)))
  (let (
    (locked-sliced (unwrap-panic (slice? locked start-index end-index)))
    (locked-sliced-total (fold + locked-sliced u0))
  )
    (if (> locked-sliced-total outflow)
      (- locked-sliced-total outflow)
      u99999999999999
    )
  )
)

(define-read-only (calculate-lowest-combination-one (outflow uint) (locked (list 30 uint)))
  (let (
    (indices-start (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19 u20 u21 u22 u23 u24 u25 u26 u27 u28 u29))
    (indices-end (list u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19 u20 u21 u22 u23 u24 u25 u26 u27 u28 u29 u30))

    (indices-start-sliced (unwrap-panic (slice? indices-start u0 (len locked))))
    (indices-end-sliced (unwrap-panic (slice? indices-end u0 (len locked))))

    ;; Totals overunlocked
    (totals (map calculate-overunlocked (list-30-uint outflow) indices-start-sliced indices-end-sliced (list-30-list locked)))

    ;; Min of total overunlocked
    (min-total (fold get-min-of totals u99999999999999))
    (min-total-index (unwrap-panic (index-of? totals min-total)))
  )
    {
      indices: (list (unwrap-panic (element-at? indices-start min-total-index))),
      overunlocked: min-total
    }
  )
)

(define-read-only (calculate-lowest-combination-many-start (outflow uint) (locked (list 30 uint)))
  (let (
    (indices-start (list-30-uint u0))
    (indices-end (list u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19 u20 u21 u22 u23 u24 u25 u26 u27 u28 u29 u30))
    
    (indices (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19 u20 u21 u22 u23 u24 u25 u26 u27 u28 u29))

    (indices-start-sliced (unwrap-panic (slice? indices-start u0 (len locked))))
    (indices-end-sliced (unwrap-panic (slice? indices-end u0 (len locked))))

    ;; Totals overunlocked
    (totals (map calculate-overunlocked (list-30-uint outflow) indices-start-sliced indices-end-sliced (list-30-list locked)))

    ;; Min of total overunlocked
    (min-total (fold get-min-of totals u99999999999999))
    (min-total-index (unwrap-panic (index-of? totals min-total)))
  )
    {
      indices: (unwrap-panic (slice? indices u0 (+ min-total-index u1))),
      overunlocked: min-total
    }
  )
)

(define-read-only (calculate-lowest-combination-many-end (outflow uint) (locked (list 30 uint)))
  (let (
    (indices-start (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19 u20 u21 u22 u23 u24 u25 u26 u27 u28 u29))
    (indices-end (list-30-uint (len locked)))
    
    (indices-start-sliced (unwrap-panic (slice? indices-start u0 (len locked))))
    (indices-end-sliced (unwrap-panic (slice? indices-end u0 (len locked))))

    ;; Totals overunlocked
    (totals (map calculate-overunlocked (list-30-uint outflow) indices-start-sliced indices-end-sliced (list-30-list locked)))

    ;; Min of total overunlocked
    (min-total (fold get-min-of totals u99999999999999))
    (min-total-index (unwrap-panic (index-of? totals min-total)))
  )
    {
      indices: (unwrap-panic (slice? indices-start min-total-index (len locked))),
      overunlocked: min-total
    }
  )
)

;;-------------------------------------
;; Helpers
;;-------------------------------------


(define-read-only (get-min-of (a uint) (b uint))
  (if (< a b) a b)
)

(define-read-only (list-30-uint (item uint)) 
  (list item item item item item item item item item item item item item item item item item item item item item item item item item item item item item item)
)

(define-read-only (list-30-list (item (list 30 uint))) 
  (list item item item item item item item item item item item item item item item item item item item item item item item item item item item item item item)
)


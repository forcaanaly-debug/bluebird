# Monetization rollout (mixed model)

## Phase 1 — pilot (manual)

- **Commission:** agree % with anchor drivers; collect via manual invoicing or in-app reference + reconciliation.
- **Goal:** prove completion rate and NPS before automating payouts.

## Phase 2 — public MVP

### 1) Commission on completed bookings

- Define: commission applies to **completed** trips only (not requested/rejected).
- Edge cases: partial seat cancellation — document rule (MVP: no partial; cancel whole booking).

### 2) Driver subscription tiers

| Tier | Benefits | Billing |
|------|----------|---------|
| Free | Standard listing | — |
| Pro | Priority placement in search | Monthly manual or in-app payment link |
| Fleet | Multiple vehicles under one org | B2B invoice (later) |

### 3) Featured listings

- Time-boxed slots (e.g. Eid week): fixed fee per route window.
- Cap slots to avoid spam and maintain trust.

## Implementation order (technical)

1. Add `commission_rate`, `subscription_tier` columns / tables (future migration).
2. Admin report: gross booking value and expected commission per period.
3. Integrate PSP / wallet payout automation (post-MVP per plan P1).

## Ethics & trust

- Disclose commission to riders in fare breakdown (when in-app payments exist).
- Do not dark-pattern hide surcharges.

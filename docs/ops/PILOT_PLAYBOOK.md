# Pilot playbook — Islamabad ↔ Gilgit

## Objective

Validate **trust**, **booking completion**, and **support load** with a controlled cohort before public listing.

## Preconditions

- [ ] `CORRIDOR_ISB_GILGIT_ONLY=true` in staging/prod API
- [ ] 20–30 drivers: CNIC + vehicle docs **approved** in admin
- [ ] Support WhatsApp/phone roster published to cohort
- [ ] Cancellation policy link live (in-app + PDF/web)

## Cohort

- **Drivers:** invite-only; anchor operators first.
- **Riders:** 150–300 from partner communities (students, operators’ networks).

## Week 1 — daily ops

| Day | Actions |
|-----|---------|
| D1 | Morning: verify trip posts for next 48h; evening: clear booking queue |
| D2–D7 | Twice daily: dispute triage; fraud spot-check (duplicate phones, fare outliers) |
| Daily | Log incidents: no-show, payment proof delay, route cancellation |

## Support SLAs (pilot)

- Booking request → driver first response: **target < 2h** (not contractual in pilot, track metric).
- Dispute opened → human response: **< 4h** during active windows.

## Exit criteria (go / no-go for public MVP)

See [KPI_CHECKLIST.md](./KPI_CHECKLIST.md). If **no-go**, run one remedial week (supply incentives + UX fixes) before widening.

## Rollback

- Flip `CORRIDOR_ISB_GILGIT_ONLY` + disable new bookings via feature flag (future) or maintenance message in app.
- Honor existing confirmed bookings.

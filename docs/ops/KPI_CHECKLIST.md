# KPI checklist (pilot → public MVP)

Capture weekly in a spreadsheet or Notion DB.

## Supply

| KPI | Target (pilot) | How to measure |
|-----|----------------|----------------|
| Active verified drivers | ≥ 20 | Count `driver_profiles` approved with ≥1 trip in window |
| Posted trips / day | ≥ X (set per season) | `trips` created per day |
| Driver accept time (p50) | < 2h | `booking.updatedAt - booking.createdAt` on accept |

## Demand & funnel

| KPI | Target | How to measure |
|-----|--------|----------------|
| Search → trip view | Track | App analytics event |
| Trip view → booking request | Track | App analytics event |
| Request → confirmed | ≥ 40% | Server bookings by status transition |
| Confirmed → completed | ≥ 70% | Bookings completed / confirmed |

## Trust & risk

| KPI | Target | Notes |
|-----|--------|--------|
| Disputed bookings | < 5% of completed | Manual tag + `support_tickets` (when live) |
| Fraud flags resolved | 100% within 72h | Admin queue |

## Unit economics (rough)

| KPI | Notes |
|-----|--------|
| Gross booking value | sum(fare × seats) for completed |
| Take rate | commission % actually collected (manual early) |

## Public MVP gate (from plan)

All required:

- [ ] ≥ 70% confirmed → completed over **14 consecutive days**
- [ ] < 5% disputes unresolved **> 72h**
- [ ] Median driver response **< 2h** for booking requests

Then enable broader marketing (still corridor-flagged until expansion).

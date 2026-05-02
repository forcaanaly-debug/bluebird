# BlueBird P0 Scope (Launch Must-Haves)

**Version:** 1.0  
**Corridor v1:** Islamabad ↔ Gilgit only (see `CORRIDOR_LAUNCH.md`).

## Goals

- Riders can discover verified-driver trips, request seats, and see booking status.
- Drivers can onboard (with verification), post trips, accept/reject booking requests.
- Ops can verify drivers, moderate disputes, and suspend accounts via admin tools.
- Payments: cash + manual digital transfer confirmation with reference capture (no full PSP automation in P0).

## In Scope (P0)

| Area | Deliverable |
|------|-------------|
| Auth | Phone OTP (or dev bypass in staging), JWT sessions, refresh strategy |
| Users | Rider profile; driver profile linked to user |
| Driver verification | CNIC + vehicle docs upload; admin approve/reject |
| Trips | CRUD for driver-owned trips; search/filter by route + date |
| Bookings | Request → driver accept/reject → confirmed; state machine; seat decrement |
| Payments | Booking fee intent; cash; upload proof + reference; admin mark received |
| Messaging | Trip-scoped thread (polling or basic REST; real-time P1) |
| Notifications | Push hooks (FCM wiring P0 minimal: token register + test send) |
| Admin | Web panel: verification queue, flagged bookings, user suspend |
| Mobile | Client/Driver menus; integrate API; offline-friendly error states |
| Legal/UX | Terms, privacy, cancellation policy links in-app |

## Out of Scope (P0)

- Lahore/Karachi/Hunza/Skardu live inventory (flags only until Phase 2 corridor).
- Automated JazzCash/EasyPaisa settlement (abstract interface; manual P0).
- Dynamic pricing, parcel/cargo, B2B contracts.
- In-app voice/video.

## Success Criteria (Launch Gate)

- 20+ verified drivers onboarded for Islamabad–Gilgit window.
- Booking completion rate ≥ 70% among confirmed bookings in pilot cohort.
- P95 API latency < 500ms on core read paths under pilot load.
- Zero P0 security blockers (RBAC, rate limits, audit for admin).

## Assumptions

- Single currency PKR.
- One seat = one booking line item (MVP).
- Founder-led support during pilot hours.

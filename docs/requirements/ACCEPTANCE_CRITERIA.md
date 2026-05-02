# P0 Acceptance Criteria (Testable)

Each story is **done** when all bullets pass in **staging** and **prod checklist** (where applicable).

## AUTH-01 Phone OTP

- [ ] User enters valid E.164 phone; receives OTP in non-prod via mock/log; prod via provider.
- [ ] Invalid OTP returns 401 with generic message (no user enumeration).
- [ ] Valid OTP issues access + refresh tokens; refresh rotates correctly.
- [ ] Rate limit: max N attempts per phone per hour (configurable).

## USER-01 Profile

- [ ] Authenticated user can GET/PATCH own profile (name, locale).
- [ ] Cannot read or modify another user’s profile.

## DRV-01 Driver onboarding

- [ ] User with role `driver` can create `driver_profile` with vehicle metadata.
- [ ] User can upload document metadata + presigned URL flow (or multipart to bounded size).
- [ ] Until `verification_status === approved`, driver cannot post trips (403).

## ADM-01 Driver verification

- [ ] Admin can list pending documents.
- [ ] Admin can approve/reject with reason; driver notified (in-app + push stub).
- [ ] All admin actions written to `audit_logs`.

## TRIP-01 Trip CRUD

- [ ] Approved driver can POST trip with: from, to, date, time, seats, fare, vehicle type.
- [ ] Driver can PATCH own trip until departure; cancel sets status `cancelled`.
- [ ] Rider search returns only `published` trips for allowed corridor + date window.

## BOOK-01 Booking lifecycle

- [ ] Rider requests booking: creates `requested` booking; seats not decremented until accept.
- [ ] Driver accepts: status `confirmed`; `trip.seats_available` decremented atomically (transaction + row lock).
- [ ] Driver rejects: status `rejected`; no seat change.
- [ ] Double-accept race: only one booking wins; other gets 409 or graceful failure.
- [ ] Rider can cancel per policy window (config); driver can cancel trip (cascade rules documented).

## PAY-01 Payment capture

- [ ] Booking in `confirmed` shows payment method and instructions.
- [ ] Rider can POST payment proof (reference, optional image URL).
- [ ] Admin can mark `payment_received`; booking can move to `completed` only after rules satisfied.

## MSG-01 Trip messages

- [ ] Messages scoped to `trip_id`; only participants (rider on booking + driver) can read/write.
- [ ] Pagination works; empty thread returns [].

## ADM-02 Moderation

- [ ] Admin can flag/suspend user; suspended user cannot auth or gets 403 on all protected routes.

## MOB-01 App integration

- [ ] App uses env-based API URL; staging and prod builds differ.
- [ ] Critical screens handle offline: clear error, retry, no silent data loss on form submit.

## OBS-01 Ops readiness

- [ ] Health endpoint `/health` returns DB + Redis connectivity.
- [ ] Structured logs include `requestId`, `userId` (when present).

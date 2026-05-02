# High-Level UX Flows (P0)

Wireframe order per plan: rider funnel → driver post/requests → verification → support.

## Rider booking funnel

```mermaid
flowchart TD
  A[OpenApp] --> B[ClientMenu_Discover]
  B --> C[SearchRouteAndDate]
  C --> D[TripList]
  D --> E[TripDetail]
  E --> F[EnterNameSeats]
  F --> G[RequestBooking]
  G --> H{DriverAccepts}
  H -->|Yes| I[Confirmed_PaymentInstructions]
  H -->|No| J[Rejected_TryAnother]
  I --> K[Messages]
  I --> L[MyBookings_Status]
```

## Driver lifecycle

```mermaid
flowchart TD
  A[OpenApp] --> B[DriverMenu]
  B --> C{Verified}
  C -->|No| D[Onboarding_UploadDocs]
  D --> E[PendingAdmin]
  E --> F{Approved}
  F -->|No| G[Rejected_Resubmit]
  F -->|Yes| H[PostTrip]
  C -->|Yes| H
  H --> I[Requests_Inbox]
  I --> J[AcceptOrReject]
  J --> K[MessagesWithRider]
```

## Trust and support (surfaces)

- **Verification gate:** block trip post until `driver_profiles.verification_status === approved`.
- **Support:** from booking detail → “Problem with trip?” → ticket id (P0 REST stub acceptable).

## Offline / weak network

- Discover and booking submit: show non-blocking banner; retry button.
- Do not clear form on network error.

## Localization

- P0: English strings in app; Urdu copy deck in `docs/design/COPY_UR.md` (optional follow-up).

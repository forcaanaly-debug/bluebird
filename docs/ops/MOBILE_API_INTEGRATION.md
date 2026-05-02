# Mobile ↔ API integration

The Expo app currently uses [`src/context/AppContext.tsx`](../../src/context/AppContext.tsx) with **mock data**. To connect to the Nest API:

## 1) Environment

Add to app root (Expo):

```bash
# .env or app.config — use EXPO_PUBLIC_ prefix for client-visible vars
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

Use your machine LAN IP for physical device testing (not `localhost`).

## 2) Auth flow

1. `POST /api/auth/otp/request` with `{ "phone": "+92..." }`
2. `POST /api/auth/otp/verify` with `{ "phone": "+92...", "code": "<sms-code>" }` — in local dev you can use `DEV_OTP` from the API `.env` when `NODE_ENV` is not `production`; production requires Twilio or `OTP_WEBHOOK_URL` on the server
3. Store `access_token` securely (e.g. `expo-secure-store`)
4. Send `Authorization: Bearer <token>` on subsequent calls

## 3) Replace mock calls

| Current (mock) | API |
|----------------|-----|
| In-memory trips | `GET /trips/search?from=&to=&date=` |
| Post trip | `POST /trips` |
| Book | `POST /bookings` |
| Cancel booking | `PATCH /bookings/:id/cancel` |
| List bookings | `GET /bookings/as-rider`, `GET /bookings/driver-requests` |
| Chat | `GET/POST /trips/:tripId/messages` |

## 4) Driver verification

1. `POST /drivers/register`
2. `POST /drivers/documents` with presigned URLs (upload pipeline TBD)
3. Admin approves via `PATCH /admin/drivers/:profileId/verification`

## 5) Corridor

When `CORRIDOR_ISB_GILGIT_ONLY=true`, only Islamabad↔Gilgit pairs succeed for trip creation; search results are filtered server-side.

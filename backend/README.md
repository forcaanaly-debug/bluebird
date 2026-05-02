# BlueBird API (NestJS + Prisma)

## Quick start (local)

1. Start Postgres + Redis (repo root):

```bash
cd ..
docker compose up -d
```

2. Configure env:

```bash
cp .env.example .env
```

3. Migrate + seed admin user:

```bash
npx prisma migrate deploy
npx prisma db seed
```

4. Run API:

```bash
npm run start:dev
```

- Health: `GET http://localhost:3000/api/health`
- Auth: `POST /api/auth/otp/request` then `POST /api/auth/otp/verify` (`DEV_OTP` only when `NODE_ENV` ≠ `production`)
- Operator UI: `GET /operator` (admin JWT) — pending drivers + verify actions

## Main routes

| Area | Method | Path |
|------|--------|------|
| Auth | POST | `/api/auth/otp/request`, `/api/auth/otp/verify` |
| Auth | POST | `/api/auth/social` (Google/Apple ID token) |
| User | GET/PATCH | `/api/users/me` |
| Driver | POST | `/api/drivers/register`, `/api/drivers/documents` |
| Trips | GET | `/api/trips/search` |
| Trips | POST | `/api/trips` (verified driver) |
| Bookings | POST | `/api/bookings` |
| Bookings | GET | `/api/bookings/as-rider`, `/api/bookings/driver-requests` |
| Bookings | PATCH | `/api/bookings/:id/accept`, `reject` |
| Bookings | POST | `/api/bookings/:id/payment-proof` |
| Messages | GET/POST | `/api/trips/:tripId/messages` |
| Admin | GET/PATCH | `/api/admin/drivers/pending`, `/api/admin/drivers/:profileId/verification` |
| Operator UI | GET | `/operator` (HTML, same host as API) |

Admin JWT: log in as seeded admin phone after OTP verify.

## Production notes

- `DEV_OTP` is ignored when `NODE_ENV=production`. Configure **Twilio** (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`) or **OTP_WEBHOOK_URL** (optional `OTP_WEBHOOK_SECRET` bearer) to deliver codes.
- Set strong `JWT_SECRET`; use managed Postgres/Redis (see `docs/infra/`).
- Configure social verification audiences in backend env:
  - `GOOGLE_AUTH_AUDIENCES` (comma-separated Google client IDs)
  - `APPLE_AUTH_AUDIENCES` (bundle/service IDs)

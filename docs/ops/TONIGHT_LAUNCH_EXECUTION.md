# Tonight launch execution checklist

Use this runbook in order. Replace placeholders before running.

## 1) Backend migrate, seed, start

```bash
cd /Users/furqanali/BlueBirds
docker compose up -d
cd backend
cp .env.example .env  # first run only
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

Expected:
- API boot log includes `BlueBird API http://localhost:3000/api`
- Seed prints `Seed: admin user ...`

## 2) Health check

```bash
curl -sS http://localhost:3000/api/health
```

Expected JSON:
- `status` is `ok` or `degraded`
- `db` is `true`

## 3) OTP request + verify (non-destructive)

Use a test phone in E.164 format.

```bash
export API_URL="http://localhost:3000/api"
export TEST_PHONE="+923001234568"

curl -sS -X POST "$API_URL/auth/otp/request" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$TEST_PHONE\"}"

# For local default .env.example:
export OTP_CODE="000000"

curl -sS -X POST "$API_URL/auth/otp/verify" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$TEST_PHONE\",\"code\":\"$OTP_CODE\",\"name\":\"Launch Tester\"}"
```

Expected:
- Request returns `{ "ok": true }`
- Verify returns `access_token` and `user`

## 4) Admin/operator verify flow (read-only checks)

### 4a) Admin token via seeded phone

```bash
export ADMIN_PHONE="+923001234567"
export ADMIN_OTP_CODE="000000"  # local default DEV_OTP

curl -sS -X POST "$API_URL/auth/otp/request" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$ADMIN_PHONE\"}"

export ADMIN_JWT="$(curl -sS -X POST "$API_URL/auth/otp/verify" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$ADMIN_PHONE\",\"code\":\"$ADMIN_OTP_CODE\"}" \
  | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>console.log(JSON.parse(s).access_token||''));")"
```

### 4b) Protected pending-list check (no mutation)

```bash
curl -sS "$API_URL/admin/drivers/pending" \
  -H "Authorization: Bearer $ADMIN_JWT"
```

### 4c) Operator page reachability

```bash
curl -sSI http://localhost:3000/operator | head -n 1
```

Expected:
- Pending list returns `[]` or a JSON array
- Operator endpoint responds `HTTP/1.1 200`

## 5) Preview build trigger

From repo root:

```bash
cd /Users/furqanali/BlueBirds
npm run eas:build:preview:android
```

Expected:
- EAS CLI prints a build URL and queued build id

## 6) Safe endpoint probe report

From repo root:

```bash
npm run probe:api -- --base-url "$API_URL" --phone "$TEST_PHONE" --otp-code "$OTP_CODE"
```

For deployed URL:

```bash
npm run probe:api -- --base-url "https://your-api-host/api" --phone "+923001234568"
```

Notes:
- Probe never sends admin approval/rejection mutations.
- OTP verify step is skipped unless `--otp-code` is provided.

## Manual tasks requiring dashboard access

Complete these outside CLI:
- Hosting secrets in provider dashboard: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, social audience vars, OTP provider vars.
- Uptime monitor setup and alert channel for `GET /api/health`.
- Sentry project creation, DSN wiring, and alert routing.
- Expo/EAS environment variables per profile (`development`, `preview`, `production`), including `EXPO_PUBLIC_API_URL` and mobile auth IDs.

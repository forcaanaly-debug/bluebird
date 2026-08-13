# BlueBird — collaborator handoff

**Audience:** a technical friend joining the project.  
**Snapshot date:** 14 August 2026.  
**Last git commit:** 3 May 2026 (`1120525`). Launch/EAS/Railway work after that is mostly **uncommitted**.

This is the index + narrative. Detailed runbooks stay in `docs/ops/` and `backend/README.md` — do not treat this file as a replacement for those.

**Do not copy secrets** (Twilio tokens, JWT secrets, database URLs with passwords, `.env` values) into git, chat, or this document.

---

## 1. What BlueBird is

BlueBird is a two-sided **mountain transport marketplace** for Gilgit-Baltistan corridors: Islamabad / Lahore / Karachi ↔ Gilgit / Hunza / Skardu.

| Side | Who | What they do |
|------|-----|----------------|
| Rider (“Client Mode”) | Passengers | Search trips, request seats, see booking status, message |
| Driver | Vehicle operators | Onboard + KYC, post trips, accept/reject booking requests |
| Admin / operator | Founder / ops | Verify drivers (approve/reject) |

**Pilot corridor (v1):** Islamabad ↔ Gilgit only. Hunza, Skardu, Lahore, Karachi are product destinations but **not live inventory** until KPI gates. Server flag: `CORRIDOR_ISB_GILGIT_ONLY`. See [`docs/requirements/CORRIDOR_LAUNCH.md`](./requirements/CORRIDOR_LAUNCH.md).

**Payments (P0):** cash + manual digital-transfer proof (reference + URL). No JazzCash/EasyPaisa automation. Currency: PKR.

**Brand / UX:** Japandi (warm paper, moss green, clay). Tokens: [`src/theme/tokens.ts`](../src/theme/tokens.ts), [`docs/design/DESIGN_TOKENS.md`](./design/DESIGN_TOKENS.md).

---

## 2. Current status

Honest snapshot as of 14 August 2026.

| Layer | Status | Notes |
|-------|--------|--------|
| **Local API** | Works | NestJS + Docker Postgres/Redis. Local probe (health, OTP, admin guard, `/operator`) passed during the launch session. |
| **Local mobile** | Works via Expo | `npm start`. Auth hits the API. Trips/bookings hydrate from API when a JWT exists, else **mock data**. Driver “post trip” and chat are still local-only. |
| **GitHub** | **No remote** | `git remote -v` is empty. A friend cannot `git clone` this until Furqan creates a remote **and commits**. |
| **EAS / Expo** | Project exists | Org `furqanalis-organization`, slug `bluebird`. Android preview APKs were built. |
| **Latest APK** | Built; **crash not confirmed fixed** | [`cdxDjRj8shhu6mEBnN8Cqb.apk`](https://expo.dev/artifacts/eas/cdxDjRj8shhu6mEBnN8Cqb.apk). Last known behavior: silent crash / home-screen kick. Also seen via Expo Orbit emulator. |
| **Railway API** | **Not live now** | Was healthy at `https://bluebird-api-production.up.railway.app` during the launch session. **This host returns Railway `404 Application not found` as of 14 Aug 2026.** Treat hosting as needs restore/redeploy. |
| **Production SMS** | **Not done** | Twilio / `OTP_WEBHOOK_URL` were never confirmed on the host. A **DEV_OTP demo bypass** was temporarily enabled on the deployed API (see §8). Must not ship publicly. |
| **iOS** | **Skipped** | Zero iOS EAS builds. Apple Developer Program not enrolled. |
| **Sentry / uptime / stores** | Not started | See [`docs/ops/LAUNCH_CHECKLIST.md`](./ops/LAUNCH_CHECKLIST.md). |
| **Working tree** | **Dirty** | Launch scripts, EAS docs, `expo-linking`, RN 0.79.6, this handoff — **uncommitted**. Cloning `main` as it sits in git misses them. |

**One-liner:** working **local** prototype (real Nest API + Japandi Expo app). Cloud Android builds exist but the last APK was crashing. The previously deployed Railway hostname is **down**. A lot of launch-night work never landed in git.

---

## 3. Stack

Versions from `package.json` / `backend/package.json` / compose (working tree, 14 Aug 2026).

| Piece | Choice | Version / notes |
|-------|--------|-----------------|
| Mobile | Expo React Native | Expo **^53.0.10**, React **19.0.0**, RN **0.79.6** (uncommitted bump from **0.79.2**) |
| Native extras | expo-apple-authentication, expo-auth-session, expo-constants, expo-linking, expo-updates, expo-web-browser, react-native-svg | Linking + updates are uncommitted vs `main` |
| API | NestJS | **^11** (`@nestjs/common`, `core`, `jwt`, `passport`, `throttler`, `config`) |
| ORM | Prisma | **^6** (lockfile was ~6.19.x locally) |
| DB | PostgreSQL | Docker `postgres:16-alpine` |
| Cache | Redis | Docker `redis:7-alpine`, `ioredis` |
| Auth | JWT + OTP + Google/Apple ID tokens | `passport-jwt`, `google-auth-library`, `jose` |
| SMS | Twilio REST or generic webhook | Optional; not required locally |
| Builds | EAS | `eas.json` profiles `development` / `preview` / `production`; Android preview = APK, internal |
| Containers | docker-compose + `backend/Dockerfile` | Image: `node:20-alpine`; CI uses **Node 22** |
| UI | Japandi tokens, no extra RN navigation lib | Tab state in `App.tsx` |
| CI | GitHub Actions | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — unused until a GitHub remote exists |

---

## 4. Repo map

Monorepo: **Expo app at repo root**, API in **`backend/`**. Docs already live under `docs/{requirements,design,infra,ops}/`.

```
BlueBirds/
├── App.tsx                 # Root UI: auth gate, Client/Driver mode, tabs
├── app.json                # Expo name, slug, bundle IDs, EAS projectId
├── eas.json                # EAS build profiles
├── package.json            # Mobile scripts (start, probe, EAS)
├── .env.example            # Mobile env names (no secrets)
├── docker-compose.yml      # Local Postgres 16 + Redis 7
├── api-probe.mjs           # Non-destructive API probe (uncommitted)
├── scripts/eas-preflight.sh
├── .github/workflows/ci.yml
├── src/
│   ├── screens/            # Auth, Rider, Driver, Bookings, Chat
│   ├── context/AppContext.tsx
│   ├── lib/api.ts
│   ├── data/mockData.ts
│   ├── theme/              # Japandi tokens
│   ├── components/
│   └── assets/             # Logo PNG + SVG xml
├── backend/
│   ├── Dockerfile
│   ├── prisma/             # schema, init migration, seed
│   ├── src/                # Nest modules (auth, trips, bookings, …)
│   ├── scripts/api-smoke-check.js
│   └── .env.example
└── docs/
    ├── COLLABORATOR_HANDOFF.md   # this file
    ├── requirements/  design/  infra/  ops/
```

---

## 5. Key files index

| Path | Purpose |
|------|---------|
| [`App.tsx`](../App.tsx) | Auth gate, Client vs Driver menus |
| [`src/screens/AuthScreen.tsx`](../src/screens/AuthScreen.tsx) | Phone OTP + Google + Apple |
| [`src/lib/api.ts`](../src/lib/api.ts) | Fetch client; LAN rewrite of `localhost` for Expo Go |
| [`src/context/AppContext.tsx`](../src/context/AppContext.tsx) | State; API hydrate with mock fallback |
| [`src/data/mockData.ts`](../src/data/mockData.ts) | Cities + seed trips/bookings/messages |
| [`src/theme/tokens.ts`](../src/theme/tokens.ts) | Japandi design tokens |
| [`backend/src/main.ts`](../backend/src/main.ts) | Nest bootstrap, `/api` prefix, `/operator` excluded |
| [`backend/src/app.module.ts`](../backend/src/app.module.ts) | Module graph + throttling |
| [`backend/src/auth/auth.service.ts`](../backend/src/auth/auth.service.ts) | OTP, JWT, social; `DEV_OTP` only when not production |
| [`backend/src/auth/otp-delivery.service.ts`](../backend/src/auth/otp-delivery.service.ts) | Twilio or `OTP_WEBHOOK_URL` |
| [`backend/src/operator/operator.html`](../backend/src/operator/operator.html) | Built-in driver-verification UI |
| [`backend/src/admin/admin.controller.ts`](../backend/src/admin/admin.controller.ts) | Pending drivers + verify |
| [`backend/src/common/corridor.ts`](../backend/src/common/corridor.ts) | Islamabad↔Gilgit pair check |
| [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma) | Data model |
| [`backend/prisma/seed.ts`](../backend/prisma/seed.ts) | Seeded admin user |
| [`backend/Dockerfile`](../backend/Dockerfile) | `prisma migrate deploy` then `node dist/main` |
| [`eas.json`](../eas.json) | EAS profiles |
| [`app.json`](../app.json) | Expo + EAS project id |
| [`docker-compose.yml`](../docker-compose.yml) | Local Postgres + Redis |
| [`api-probe.mjs`](../api-probe.mjs) | Safe endpoint probe (uncommitted) |
| [`scripts/eas-preflight.sh`](../scripts/eas-preflight.sh) | Local `EXPO_PUBLIC_*` check (uncommitted) |
| [`docs/ops/TONIGHT_LAUNCH_EXECUTION.md`](./ops/TONIGHT_LAUNCH_EXECUTION.md) | Copy-paste launch runbook |
| [`docs/ops/MOBILE_EAS_SETUP.md`](./ops/MOBILE_EAS_SETUP.md) | EAS env + Android preview |
| [`backend/README.md`](../backend/README.md) | API routes |

---

## 6. All links

Status: **confirmed** = seen working in repo config or a prior session; **stale** = worked then, fails now; **placeholder** = example only; **needs login** = dashboard behind Furqan’s account.

### Expo / EAS (confirmed)

| What | URL |
|------|-----|
| Expo project | https://expo.dev/accounts/furqanalis-organization/projects/bluebird |
| EAS project id | `fab6efa7-cedf-4335-9887-d2ff939150b1` (in `app.json`) |
| EAS Updates | https://u.expo.dev/fab6efa7-cedf-4335-9887-d2ff939150b1 |
| OAuth redirect (org) | https://auth.expo.io/@furqanalis-organization/bluebird |
| EAS env docs | https://docs.expo.dev/build-reference/variables/ |
| Expo site | https://expo.dev |

Older redirect pattern `https://auth.expo.io/@furqanali/bluebird` (no `-s-organization`) is **wrong** for current `app.json` owner.

### Android APK artifacts

| Build | Artifact | Notes |
|-------|----------|--------|
| **#4 latest** `5ad4f396-e023-45c3-a3fa-704fc9762462` | https://expo.dev/artifacts/eas/cdxDjRj8shhu6mEBnN8Cqb.apk | RN 0.79.6. Crash **not confirmed fixed**. |
| #3 `b68a3b15-37c7-4117-8f5f-6f04f59f78fe` | https://expo.dev/artifacts/eas/oxni6N5gwK453owMRegmt9.apk | Added `expo-linking` |
| #2 `8ac62322-5641-4c1b-914a-ae0592cb6cec` | https://expo.dev/artifacts/eas/i8URDoXfLbcvZYQKvEVe7U.apk | API URL baked in |
| #1 `eb43f078-666d-44d1-b202-eadb49fed87f` | (do not use) | `EXPO_PUBLIC_API_URL` was EAS **SECRET** → omitted from JS bundle |

Build logs (needs Expo login):  
https://expo.dev/accounts/furqanalis-organization/projects/bluebird/builds/5ad4f396-e023-45c3-a3fa-704fc9762462

### Railway

| What | URL | Status |
|------|-----|--------|
| Project dashboard | https://railway.com/project/74729802-5b18-4733-8624-4c001d74a3cb | **Needs login.** Nickname was `thorough-sparkle`; service `bluebird-api`. Confirm it still exists. |
| Public API (old) | https://bluebird-api-production.up.railway.app | **Stale — 404 Application not found** on 14 Aug 2026 |
| Health (old) | https://bluebird-api-production.up.railway.app/api/health | Same 404 |
| Operator (old) | https://bluebird-api-production.up.railway.app/operator | Same 404 |
| New-project helper | https://railway.app/new | Placeholder / create flow |

Guessed hosts that **never** resolved (`Application not found` even during launch):  
`bluebird-backend-preview.up.railway.app`, `bluebird-backend.up.railway.app`, `bluebird.up.railway.app`, `bluebirds.up.railway.app`, `api-preview.bluebirds.app`.

There is **no** `railway.json` in the repo. Railway CLI was **logged out** (`invalid_grant` / unauthorized) during discovery; vars were later set in a session that had access. Current CLI login state is unknown.

### Local (confirmed when stack is running)

| What | URL |
|------|-----|
| API | http://localhost:3000/api |
| Health | http://localhost:3000/api/health |
| Operator UI | http://localhost:3000/operator |
| Expo Metro | http://localhost:8081 |

Physical device: use `http://<LAN-IP>:3000/api`, not `localhost`.

### Google / Apple / Twilio dashboards (need Furqan’s accounts)

| What | URL |
|------|-----|
| Google OAuth credentials | https://console.cloud.google.com/apis/credentials |
| OAuth consent | https://console.cloud.google.com/apis/credentials/consent |
| Google Cloud project number (from launch session) | `628865150225` — confirm in console |
| Apple Developer enroll | https://developer.apple.com/register/ |
| Apple Developer account | https://developer.apple.com/account |
| Apple JWKS (API uses this) | https://appleid.apple.com/auth/keys |
| Twilio signup | https://www.twilio.com/try-twilio |
| Twilio console | https://console.twilio.com/ |
| Twilio buy number | https://console.twilio.com/us1/develop/phone-numbers/manage/search |
| Twilio verified caller IDs | https://console.twilio.com/us1/develop/phone-numbers/manage/verified |

Android EAS preview keystore SHA-1 was registered in Google Cloud during the May 2026 launch. Re-read it with `npx eas credentials -p android` (do not commit the fingerprint). Package name: `com.bluebird.app`.

### Placeholders in docs (do not treat as live)

- `https://api-preview.example.com/api`
- `https://api.example.com/api`
- `https://auth.expo.io/@your-expo-username/bluebird`
- `https://your-api-host/api`

### Not found

No Figma, Notion, Sentry, Play Console, App Store Connect, or GitHub repo URL in the repo or transcripts.

---

## 7. What’s been built

### Backend (Nest + Prisma) — P0 API surface is largely there

| Feature | Status |
|---------|--------|
| Phone OTP request/verify + JWT | Yes. Throttled. Redis-backed codes. |
| Google ID-token + `/api/auth/google` web redirect | Yes (needs audiences / web client secret on host) |
| Apple ID-token verify | Yes (no IPA yet) |
| `GET/PATCH /users/me` | Yes |
| Driver register, document **URL** metadata, `GET /drivers/me` | Yes. File **upload/storage not implemented**. |
| Trip search / create / mine / cancel | Yes. Create requires **approved** driver. Corridor flag on create. |
| Bookings request / accept / reject / cancel / payment-proof | Yes |
| Trip messages GET/POST | Yes |
| Admin pending + approve/reject + audit log | Yes (verified locally) |
| Operator HTML at `GET /operator` | Yes |
| Health (db + redis) | Yes |
| Rate limiting | Yes |
| Docker Compose + Dockerfile | Yes |
| CI workflow | File exists; never run on GitHub |

Full route table: [`backend/README.md`](../backend/README.md).

### Mobile

| Feature | Status |
|---------|--------|
| Japandi UI, logo, Client/Driver mode | Yes |
| Auth: phone OTP, Google (browser), Apple (iOS) | Yes |
| Discover / bookings / chat / post-trip screens | Yes (UI) |
| Live API: OTP, social, trip search, rider bookings, create/cancel booking | Partial — `src/lib/api.ts` + `AppContext` |
| Post trip → `POST /trips` | **Not wired** (`addTrip` is in-memory) |
| Chat → messages API | **Not wired** |
| Driver KYC upload UI | **Not built** |
| Persist JWT (SecureStore) | **Not done** — token is React state; lost on restart |
| Legal / FCM / push | **Not done** |

### Docs

Requirements, design, infra, pilot, KPIs, launch checklist, monetization, mobile API + EAS, tonight runbook — all under [`docs/`](./).

---

## 8. What’s unfinished / blockers

1. **Android APK crash**  
   Symptom: icon launches then **immediately returns to home** (silent crash). Also seen on **Expo Orbit** (Orbit is an installer; the emulator ABI / stale AVD can contribute).  
   Fixes in the **working tree** (uncommitted): `expo-linking` as a direct dep; RN **0.79.6** (was 0.79.2 vs SDK 53). Latest APK is build #4. **No confirmed successful device run after that build.** Next: uninstall old APK, test on a **real phone**, `adb logcat` if it still dies.  
   `app.json` has **no `scheme`** — Google `Linking.createURL("auth")` can fail even if the app boots. Phone OTP does not need a scheme.

2. **EAS `EXPO_PUBLIC_*` visibility**  
   Vars marked **SECRET** are **not** injected into the JS bundle. They must be **plaintext or sensitive**. Build #1 was broken for this reason. Preview/production were later updated in EAS; re-check after any env edit.

3. **Railway / hosted API**  
   Hostname above is **404 now**. CLI was logged out during discovery. Redeploy from `backend/Dockerfile` or restore the Railway project. Preview EAS pointed at that single “production” host (no separate staging API).

4. **OTP / SMS**  
   Production path needs Twilio **or** `OTP_WEBHOOK_URL`. During launch, the host was flipped to non-production `NODE_ENV` plus `DEV_OTP` so testers could log in without SMS. **Anyone who knows the demo code can impersonate any phone.** Do not share APKs publicly in that config. Revert to `NODE_ENV=production`, remove `DEV_OTP` on the host, and wire real SMS before a public launch.

5. **iOS**  
   Apple: “You are not registered as an Apple Developer.” No IPA. Expo Go on iPhone is a JS-only workaround (Apple Sign-In will not work there).

6. **Git sharing**  
   No remote. Uncommitted launch work. Friend must get the **working tree**, not a clone of current `main`.

7. **P0 product gaps** (from [`docs/requirements/`](./requirements/))  
   JWT refresh; KYC file upload; admin suspend / flagged bookings; FCM; admin “mark payment received”; in-app Terms/Privacy; mobile fully replacing mocks; Sentry; uptime; backups drill.

---

## 9. How to run locally

Follow existing docs rather than inventing a second procedure.

**Primary runbook:** [`docs/ops/TONIGHT_LAUNCH_EXECUTION.md`](./ops/TONIGHT_LAUNCH_EXECUTION.md)  
**Short version:** root [`README.md`](../README.md) + [`backend/README.md`](../backend/README.md)  
**EAS:** [`docs/ops/MOBILE_EAS_SETUP.md`](./ops/MOBILE_EAS_SETUP.md)  
**Mobile ↔ API:** [`docs/ops/MOBILE_API_INTEGRATION.md`](./ops/MOBILE_API_INTEGRATION.md)

### 9.1 API

```bash
cd /path/to/BlueBirds
docker compose up -d
cd backend
cp .env.example .env          # first run only — never commit .env
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

Expect: `BlueBird API http://localhost:3000/api`  
Health: `GET http://localhost:3000/api/health`  
Operator: http://localhost:3000/operator

### 9.2 Mobile

```bash
cd /path/to/BlueBirds
npm install
cp .env.example .env
npm run start                 # a = Android, i = iOS simulator
```

On a physical device, do not use `localhost` for the API (or rely on the LAN rewrite in `src/lib/api.ts`).

### 9.3 Local OTP

When `NODE_ENV` is **not** `production` and `DEV_OTP` is set (see `backend/.env.example`), the API accepts that fixed code. Codes are also logged if no SMS provider is configured. **Do not enable this on a public API.**

Seeded admin phone comes from `SEED_ADMIN_PHONE` (default documented in `backend/.env.example`).

### 9.4 Probe (uncommitted scripts)

```bash
npm run probe:api -- --base-url "http://localhost:3000/api" --phone "+923001234568" --otp-code "<DEV_OTP from backend/.env>"
```

### 9.5 Android preview APK

```bash
npx eas whoami
npm run eas:preflight
npm run eas:build:preview:android
```

Cloud builds use **EAS Environment Variables**, not local `.env`. Keep `EXPO_PUBLIC_*` as plaintext or sensitive.

---

## 10. Environment variables (names only)

**Never commit real values.** Templates:

- Mobile: [`.env.example`](../.env.example)
- API local: [`backend/.env.example`](../backend/.env.example)
- API host: `backend/.env.production.example` — **file exists on disk but is gitignored** by `backend/.gitignore` pattern `.env.*`. A clone will not get it unless that ignore rule is fixed (`!.env.production.example`). Contents are the production key names listed in `backend/README.md`.

### Mobile (root `.env` + EAS)

| Name | Who |
|------|-----|
| `EXPO_PUBLIC_API_URL` | Expo app / EAS |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Expo / EAS |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Expo / EAS |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Expo / EAS |
| `EXPO_PUBLIC_GOOGLE_REDIRECT_URI` | Expo / EAS |

### API

| Name | Who |
|------|-----|
| `NODE_ENV`, `PORT` | API |
| `DATABASE_URL` | Prisma |
| `REDIS_URL` | OTP store |
| `JWT_SECRET`, `JWT_EXPIRES_DAYS` | Auth |
| `CORRIDOR_ISB_GILGIT_ONLY` | Trip create/search |
| `DEV_OTP` | Local/demo **only**; ignored when `NODE_ENV=production` |
| `OTP_TTL_SECONDS` | OTP |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | SMS (optional) |
| `OTP_WEBHOOK_URL`, `OTP_WEBHOOK_SECRET` | SMS alternative |
| `GOOGLE_AUTH_AUDIENCES`, `APPLE_AUTH_AUDIENCES` | Social token `aud` |
| `GOOGLE_WEB_CLIENT_ID`, `GOOGLE_CALLBACK_URI`, `GOOGLE_CLIENT_SECRET` | Optional server-side Google redirect |
| `SEED_ADMIN_PHONE` | `prisma db seed` |

Host minimum (from production example): `NODE_ENV`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `OTP_TTL_SECONDS`, `GOOGLE_AUTH_AUDIENCES`, `APPLE_AUTH_AUDIENCES`, plus a real OTP provider. **Do not set `DEV_OTP` on a public production API.**

---

## 11. Accounts / access the friend will need

Ask Furqan to **invite** you. Dashboards cannot be used from this zip/doc alone.

| Account | Why | Without invite you cannot |
|---------|-----|---------------------------|
| **GitHub** | Source of truth once a remote exists | Clone, PRs, CI. **There is no remote today.** |
| **Expo org `furqanalis-organization`** | EAS builds, env vars, APKs | Trigger builds, read EAS env, download artifacts if they are org-private |
| **Railway** | API + Postgres + Redis | See project `74729802-…`, redeploy, set vars |
| **Google Cloud** (project `628865150225` — confirm) | OAuth clients + SHA-1 | Change Android OAuth / SHA-1 |
| **Twilio** (or PK SMS gateway) | Production OTP | Send real SMS. Not confirmed configured. |
| **Apple Developer Program** | iOS IPA / TestFlight | **Not enrolled** — iOS skipped |
| **Sentry / uptime** | Prod observability | Not created |

Local `.env` files on Furqan’s machine are gitignored. Copy names from the example files; copy **values** only from Furqan or the host dashboards, never from this doc.

---

## 12. Git / sharing reality

**Critical:** a friend cannot get this project via `git clone` until Furqan (1) adds a GitHub remote, (2) **commits** the working tree (no `.env`), and (3) invites them. Until then, share a **zip of the folder** (excluding `node_modules`, `.env`, `backend/.env`, `.expo`) plus this handoff.

| Fact | Value |
|------|--------|
| Branch | `main` @ `1120525` — `fix: convert logo asset from JPEG to valid PNG` (3 May 2026) |
| Prior commit | `f3643eb` — `Initial commit for EAS build` (2 May 2026) |
| Remote | **none** (`git remote -v` empty; `.git/config` has no `origin`) |
| Uncommitted | Yes — launch tooling + crash-fix deps |

**Modified (not staged):**

- `.github/workflows/ci.yml` — `npm test -- --passWithNoTests`
- `README.md` — EAS / runbook / handoff pointers
- `app.json` — iOS encryption flag, `runtimeVersion`, EAS updates URL
- `backend/.env.example` — optional Google web OAuth vars
- `backend/README.md` — health + smoke
- `backend/package.json` — `smoke:api`
- `docs/ops/README.md` — new ops docs
- `package.json` / `package-lock.json` — `expo-linking`, `expo-updates`, RN 0.79.6, probe/EAS scripts

**Untracked:**

- `api-probe.mjs`
- `backend/.dockerignore`, `backend/.gitignore`
- `backend/scripts/api-smoke-check.js`
- `docs/ops/MOBILE_EAS_SETUP.md`
- `docs/ops/TONIGHT_LAUNCH_EXECUTION.md`
- `scripts/eas-preflight.sh`
- `docs/COLLABORATOR_HANDOFF.md` (this file, until committed)

EAS already uploaded the **working tree** for APKs #3/#4, so artifacts include `expo-linking` + RN 0.79.6 even though git `main` does not.

This handoff does **not** commit anything. Furqan still needs to commit/push or zip.

---

## 13. Decision log

From product/tech work in the repo and prior sessions (not a chat dump):

- **Name:** BlueBird. Two-sided marketplace (riders + drivers + admin), not a single-fleet operator app.
- **Pilot corridor:** Islamabad ↔ Gilgit only (`CORRIDOR_ISB_GILGIT_ONLY`). Other cities are UI destinations / later phases.
- **Stack:** Expo RN (SDK 53) + NestJS + Prisma + Postgres + Redis. Japandi UI.
- **Payments P0:** cash + manual proof URLs, not a PSP.
- **OTP:** server-issued codes; Twilio or webhook in production; `DEV_OTP` for local/demo only and ignored when `NODE_ENV=production`.
- **Operator UI:** built-in HTML at `GET /operator` instead of Retool for MVP.
- **iOS:** skip signed builds until Apple Developer Program enrollment; Expo Go is a temporary iPhone test path.
- **Android distribution:** EAS `preview` internal APK, not Play Store yet.
- **Hosting:** Railway for the API (`backend/Dockerfile`); one “production” service was reused as the preview API target (no separate staging host).
- **EAS env:** `EXPO_PUBLIC_*` must be plaintext/sensitive, never SECRET, or the APK has no API URL.
- **Demo bypass:** hosted API was temporarily set to non-production `NODE_ENV` + `DEV_OTP` so friends-and-family could log in without SMS. Explicitly **not** a launch config.
- **Crash investigation:** missing `expo-linking` native autolink, then RN 0.79.2 vs SDK 53’s 0.79.6; Orbit emulator is a possible false negative vs real devices.
- **No GitHub remote yet** — collaboration is folder-share until that exists.

---

## 14. Suggested next steps for the collaborator

1. Get the **full working tree** (zip or a commit) plus Expo org + Railway (or a new host) invites.
2. Run locally (§9) and `npm run probe:api` against localhost. Try `/operator` with a test driver.
3. **Redeploy the API**; confirm `GET /api/health`. Do **not** turn `DEV_OTP` on a public host.
4. Confirm the Android crash on a **physical** phone with the latest APK; `adb logcat` if it still dies. Add `"scheme": "bluebird"` before relying on Google login. Point EAS `EXPO_PUBLIC_API_URL` at the new host and rebuild.
5. Wire remaining mobile calls (`POST /trips`, messages, SecureStore JWT); drop mock fallback on staging builds.
6. Production OTP (Twilio or PK gateway via webhook), then `NODE_ENV=production` and no `DEV_OTP`.
7. iOS only after Apple enrollment.
8. Pilot extras: KYC upload, Sentry, uptime, legal URLs — [`docs/ops/PILOT_PLAYBOOK.md`](./ops/PILOT_PLAYBOOK.md).

---

## Fill in (Furqan still needs to provide)

- GitHub repo URL + collaborator invite (remote does not exist).
- Whether the Railway project `74729802-5b18-4733-8624-4c001d74a3cb` still exists, and the **current** public API URL.
- Expo org invite for `furqanalis-organization`.
- Google Cloud project access (confirm `628865150225`).
- Twilio (or SMS gateway) account status.
- Apple Developer enrollment if iOS is in scope.
- Whether hosted `DEV_OTP` / non-production `NODE_ENV` is still set anywhere (hostname is 404 as of this snapshot).

---

*This file is the onboarding index. Copy-paste commands for a launch night live in [`docs/ops/TONIGHT_LAUNCH_EXECUTION.md`](./ops/TONIGHT_LAUNCH_EXECUTION.md).*

# BlueBird

Mountain transport marketplace (Gilgit-Baltistan corridors): **Expo mobile app** + **NestJS API** + **ops docs** aligned to the prototype-to-launch plan.

## Repo layout

| Path | Description |
|------|-------------|
| [`App.tsx`](App.tsx), [`src/`](src/) | Expo React Native client (Japandi UI, client/driver menus) |
| [`backend/`](backend/) | NestJS + Prisma + PostgreSQL API |
| [`docs/requirements/`](docs/requirements/) | P0 scope, acceptance criteria, corridor sequence |
| [`docs/design/`](docs/design/) | Design tokens + UX flow diagrams |
| [`docs/infra/`](docs/infra/) | Environments, secrets, CI/CD, monitoring, backups |
| [`docs/ops/`](docs/ops/) | Pilot playbook, KPIs, public launch checklist |
| [`docker-compose.yml`](docker-compose.yml) | Local Postgres + Redis |

## Mobile — quick start

```bash
npm install
cp .env.example .env
npm run start
```

Use Expo for Android (`a`) or iOS (`i`). Configure `EXPO_PUBLIC_API_URL` and Google client IDs in `.env` (see [`docs/ops/MOBILE_API_INTEGRATION.md`](docs/ops/MOBILE_API_INTEGRATION.md)).

## API — quick start

```bash
docker compose up -d
cd backend && cp .env.example .env
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

- Health: `GET http://localhost:3000/api/health`
- API reference: [`backend/README.md`](backend/README.md)
- For real Google/Apple verification, set `GOOGLE_AUTH_AUDIENCES` and `APPLE_AUTH_AUDIENCES` in `backend/.env`.

## Plan execution

Implementation artifacts for the attached roadmap:

1. Requirements lock — [`docs/requirements/`](docs/requirements/)
2. Design system — [`src/theme/tokens.ts`](src/theme/tokens.ts), [`docs/design/`](docs/design/)
3. Backend foundation — [`backend/`](backend/)
4. Infra & security — [`docs/infra/`](docs/infra/), [`docker-compose.yml`](docker-compose.yml), [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
5. Pilot & launch — [`docs/ops/`](docs/ops/)

## Next steps (product)

- Set **EAS Environment Variables** for each profile (`EXPO_PUBLIC_API_URL`, Google client IDs) before cloud builds; profiles are in [`eas.json`](eas.json) (`development`, `preview`, `production`).
- Configure **Twilio** or **OTP_WEBHOOK_URL** on the API for production (`NODE_ENV=production`); `DEV_OTP` is ignored in production.
- Optional: replace the built-in **operator** page at `GET /operator` with Retool or an internal tool.

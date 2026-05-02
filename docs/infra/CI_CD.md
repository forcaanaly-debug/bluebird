# CI/CD

## Goals

- Every merge to `main` runs lint + tests + `nest build` + `prisma validate`.
- Staging deploy on green `main` (optional auto).
- Production deploy manual approval after checklist.

## GitHub Actions

Workflow: [.github/workflows/ci.yml](../../.github/workflows/ci.yml)

### Jobs

1. **backend** — `cd backend && npm ci && npx prisma validate && npm run build`
2. **mobile** — `npm ci && npm run typecheck` (Expo app at repo root)

### Future jobs

- `prisma migrate diff` against shadow DB in CI
- E2E smoke against ephemeral Postgres
- Container image build + push to registry

## Release tags

- Tag `v0.x.x` for store builds; attach release notes and migration steps.

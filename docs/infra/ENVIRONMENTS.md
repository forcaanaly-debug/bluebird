# Environments

| Env | API URL | Database | Purpose |
|-----|---------|----------|---------|
| `dev` | localhost:3000 | Docker Compose or local Postgres | Daily dev |
| `staging` | e.g. `api-staging.bluebird.example` | Managed Postgres (small tier) | QA + pilot builds |
| `prod` | e.g. `api.bluebird.example` | Managed Postgres (HA when ready) | Live users |

## Naming

- Use separate DB instances per environment (never share prod credentials with staging).
- Mobile app: `EXPO_PUBLIC_API_URL` (or app config) points to staging vs prod per build profile.

## Corridor flags

- `CORRIDOR_ISB_GILGIT_ONLY=true` in staging and prod until expansion gate is met (see `docs/requirements/CORRIDOR_LAUNCH.md`).

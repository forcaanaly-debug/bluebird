# Monitoring & observability

## Minimum viable (MVP launch)

| Layer | Tool | What to capture |
|-------|------|------------------|
| Errors | Sentry (or similar) | Stack traces, release, `userId`, `requestId` |
| Uptime | Better Uptime / UptimeRobot | `GET /api/health` every 60s |
| Logs | Platform logs (Render/Fly) | JSON logs, retention 7–30 days |

## Health contract

`GET /api/health` returns:

- `status`: `ok` | `degraded`
- `db`: boolean
- `redis`: `ok` | `down` | `skipped`

Alert when `status !== ok` for > 5 minutes in prod.

## Metrics (post-pilot)

- Request rate, p95 latency on `POST /bookings`, `PATCH .../accept`
- OTP failure ratio
- Booking funnel counts (emit from app + server events)

## Request IDs

- Add reverse-proxy request id or generate in middleware (future enhancement) and log on every line.

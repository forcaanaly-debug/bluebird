# Public MVP launch checklist

## Product & engineering

- [ ] Production API on managed Postgres + Redis
- [ ] `JWT_SECRET`, `DATABASE_URL`, `REDIS_URL` in secret manager only
- [ ] Production OTP: `NODE_ENV=production`, Twilio or `OTP_WEBHOOK_URL` configured (`DEV_OTP` is ignored in production but should still be unset for clarity)
- [ ] `GET /api/health` monitored (uptime + alert)
- [ ] Error tracking (e.g. Sentry) DSN in prod
- [ ] Mobile staging + prod builds (EAS) with correct API base URLs
- [ ] Crash-free sessions threshold met from pilot build

## Legal & policy

- [ ] Terms of Service + Privacy Policy URLs live
- [ ] Cancellation & refund rules published
- [ ] Support email / phone on website + in-app
- [ ] Data retention statement (KYC docs)

## App stores

- [ ] Play Console + App Store Connect listings (screenshots, description, age rating)
- [ ] Export compliance / encryption questionnaires completed
- [ ] Content moderation contact (Apple)

## Business readiness

- [ ] Commission table agreed + communicated to drivers
- [ ] Subscription / featured listing SKUs defined (even if manual billing at first)
- [ ] Payment reconciliation process (daily CSV from bank/JazzCash ledger)

## Launch day

- [ ] Freeze non-critical deploys 24h before
- [ ] War room chat for engineering + ops
- [ ] Rollback plan: disable new bookings + show maintenance banner

## Post-launch (first 72h)

- [ ] Hourly health check
- [ ] Daily cohort summary: new users, completed trips, top errors

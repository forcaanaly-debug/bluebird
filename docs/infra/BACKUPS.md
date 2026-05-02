# Backups & recovery

## PostgreSQL (managed)

- Enable **automated daily backups** (provider default).
- Retention: minimum 7 days; increase before high-traffic seasons.

## Weekly restore drill (15 min)

1. Restore latest backup to a **throwaway** database instance.
2. Run `npx prisma migrate status` against restored DB.
3. Spot-check: admin user exists, sample trip row present.
4. Document result + date in ops log.

## Redis

- OTP keys are ephemeral — no backup required for OTP.
- If you later store sessions only in Redis, document session loss on failover.

## Incident

1. Stop writes (maintenance page / feature flag).
2. Restore DB to last clean backup.
3. Replay or manually reconcile bookings created after backup timestamp.
4. Post-mortem within 48h.

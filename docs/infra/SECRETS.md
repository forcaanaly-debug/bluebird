# Secrets

## Required secrets (production)

| Key | Used by | Notes |
|-----|---------|--------|
| `DATABASE_URL` | API / Prisma | Rotate on incident; least-privilege DB user |
| `REDIS_URL` | API | OTP rate-limit storage; optional but recommended prod |
| `JWT_SECRET` | API | Long random string; rotate invalidates all sessions |
| `SEED_ADMIN_PHONE` | one-time seed | Only for initial admin; then manage via DB |

## Storage

- **Local:** `.env` (gitignored) — never commit.
- **Staging/Prod:** platform secret manager (Render/Fly/Railway/AWS Parameter Store).
- CI: inject via encrypted repo secrets for deploy jobs only.

## Rotation checklist

1. Generate new secret value.
2. Deploy API with dual-read window if applicable (JWT cannot dual-sign easily — plan maintenance window).
3. Invalidate old tokens (users re-login).
4. Audit admin accounts after rotation.

## Anti-patterns

- Reusing `JWT_SECRET` across environments.
- Logging OTP codes or JWTs in production.

# Corridor Launch Sequence

## Phase A — Pilot (Weeks 1–2 post-backend ready)

| Order | Corridor | Direction | Notes |
|-------|----------|-----------|--------|
| 1 | Islamabad | → Gilgit | Primary demand; seed supply first |
| 2 | Gilgit | → Islamabad | Return leg; match driver incentives |

**Feature flags**

- `CORRIDOR_ISB_GILGIT_ONLY=true`: API rejects trip create/search outside allowed city pairs.
- Mobile hides Lahore/Karachi/Hunza/Skardu as *coming soon* or disabled pickers.

**Allowed city pairs (pilot)**

- `(Islamabad, Gilgit)`
- `(Gilgit, Islamabad)`

## Phase B — Expansion (after KPI gate)

**Gate criteria (all required)**

- ≥ 70% booking completion (confirmed → completed) over 14 days.
- < 5% disputed bookings unresolved > 72h.
- Median driver response time < 2h for booking requests.

| Order | Add | Rationale |
|-------|-----|------------|
| 3 | Hunza (Gilgit–Hunza as sub-route or Gilgit hub) | Short extension; reuse supply |
| 4 | Skardu | Longer leg; separate pricing guidance |
| 5 | Lahore / Karachi | Demand scale; ops + supply depth |

## Rollback

- Disable corridor via flag without deploy (config service or env).
- Existing bookings honored; no new trips in disabled corridor.

# Rebalancing Log

This directory contains quarterly rebalancing check records.

## How to Use

1. Run `rebalance check` in Copilot CLI (or use `scripts/rebalance-check.py`)
2. Copy the output into a new file: `YYYY-MM-DD.md`
3. Each log records: current allocation, drift, actions taken, tax impact

## File Naming

```
YYYY-MM-DD.md       — Quarterly check log
YYYY-MM-DD-event.md — Event-triggered check (e.g., market crash)
```

## Schedule

| Check | Target Date | Status |
|-------|-------------|--------|
| Q3 2026 | Aug 2026 | Pending — first check after migration starts |
| Q4 2026 | Nov 2026 | Pending |
| Q1 2027 | Feb 2027 | Pending — migration should be complete |
| Q2 2027 | May 2027 | Pending — first full portfolio check |

## Log Template

See `_template.md` for the copy-paste template.

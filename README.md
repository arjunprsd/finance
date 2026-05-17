# Financial Plan — Arjun Prasad

> **Age:** 27 | **NW:** ₹38.45L | **Monthly SIP:** ₹1,00,000 | **Target Retirement:** Age 42

---

## Quick Numbers

```
Monthly Income:     ₹2,00,000 (post-EPF)
Monthly SIP:        ₹1,00,000 across 6 funds (all on 1st)
EPF Auto-Invest:    ₹27,000/month @ 8.25%
Total Deployment:   ₹1,27,000/month
Savings Rate:       63% (incl. EPF)
```

### Target Allocation

| Fund | SIP | % | Type |
|------|-----|---|------|
| UTI Nifty 50 Index | ₹35,000 | 35% | Index |
| Parag Parikh Flexi Cap | ₹28,000 | 28% | Active |
| Motilal Nifty Midcap 150 Index | ₹17,000 | 17% | Index |
| Bandhan Small Cap | ₹10,000 | 10% | Active |
| SBI Gold FoF | ₹5,000 | 5% | Commodity |
| Nippon Silver ETF FoF | ₹5,000 | 5% | Commodity |

---

## Repository Structure

### `plan/` — The Plan & Operations

| File | Purpose | Status |
|------|---------|--------|
| [final-investment-plan.md](plan/final-investment-plan.md) | **THE master plan** — 6-fund allocation, migration timeline, projections, tax strategy | ★ Primary |
| [rebalancing-sop.md](plan/rebalancing-sop.md) | Rebalancing triggers, execution hierarchy, pre-sell checklist, log template | ★ Active SOP |
| [action-plan.md](plan/action-plan.md) | Step-by-step migration todo list | v1 (being updated) |

### `analysis/` — Research & Data

| File | Purpose | Status |
|------|---------|--------|
| [sip-recommendation.md](analysis/sip-recommendation.md) | SIP date analysis — 6 benchmarks × 7 periods, why all on 1st | ★ Reference |
| [portfolio-performance-report.md](analysis/portfolio-performance-report.md) | Pre-migration XIRR, grading, benchmark comparison | Historical |
| [portfolio-analytics.md](analysis/portfolio-analytics.md) | Sector/geography/overlap deep-dive (pre-migration 14-fund portfolio) | Historical |
| [reallocation-plan.md](analysis/reallocation-plan.md) | 12 strategies compared — why Core-Satellite won | Decision archive |

### `reference/` — Quick-Lookup Guides

| File | Purpose | Status |
|------|---------|--------|
| [tax-rules-reference.md](reference/tax-rules-reference.md) | LTCG/STCG rules, tax slabs, harvesting calendar | ★ Reference |
| [risk-management.md](reference/risk-management.md) | Emergency fund, insurance, crash playbook, job loss plan | ★ Reference |
| [market-conditions-may2026.md](reference/market-conditions-may2026.md) | Point-in-time market snapshot (May 2026) | Archive |

### `context/` — Personal Financial Data

| File | Purpose | Status |
|------|---------|--------|
| [net-worth-snapshot.md](context/net-worth-snapshot.md) | Profile, income, NW breakdown, ratios, holdings | ★ Update quarterly |

### `logs/` — History & Tracking

| Directory | Purpose |
|-----------|---------|
| [logs/rebalancing/](logs/rebalancing/) | Quarterly rebalancing check records (template + logs) |
| [logs/snapshots/](logs/snapshots/) | NW growth tracking over time |

### `archive/` — Superseded Documents

| File | Purpose | Why Archived |
|------|---------|--------------|
| [my-investment-strategy.md](archive/my-investment-strategy.md) | First-person narrative reasoning (v1) | Superseded by final-investment-plan.md |
| [future-projections.md](archive/future-projections.md) | Retirement projections (v1) | Merged into final plan |

### `scripts/` — Tools & Charts

| File | Purpose |
|------|---------|
| [rebalance-check.py](scripts/rebalance-check.py) | Standalone Python rebalancing calculator |
| `sip-behaviour-*.png` | SIP date analysis charts (6 funds × 7 periods) |
| `sip-date-*.png` | Combined heatmap, stability, profit diff charts |

### `.github/instructions/` — Copilot CLI Skills

| File | Trigger |
|------|---------|
| [rebalancing-check.instructions.md](.github/instructions/rebalancing-check.instructions.md) | Say "rebalance check" for automated portfolio drift analysis |

---

## Key Dates & Schedule

| What | When | Notes |
|------|------|-------|
| All SIPs execute | 1st of every month | Data-backed: Day 1 is #1 across all benchmarks |
| LTCG tax harvest | Every January | Book ₹1.25L gains → save ₹15,625/year |
| Quarterly rebalance check | Feb / May / Aug / Nov | Run `rebalance check` → log in `logs/rebalancing/` |
| Annual deep review | Every May | Review strategy, step-up SIPs, update projections |
| Emergency fund target | ₹6L (currently ₹2L) | Priority: build before optimizing investments |

---

## Migration Status (Jun 2026 → Feb 2027)

Migrating from 14 scattered MFs to the 6-fund target portfolio via STPs:

- **KEEP:** Parag Parikh Flexi Cap, Bandhan Small Cap
- **NEW:** UTI Nifty 50 Index, Motilal Midcap 150 Index, SBI Gold FoF, Nippon Silver FoF
- **STP-OUT:** HDFC Flexi, Nippon Large, ICICI Large, PGIM Midcap, Motilal Midcap, SBI Tech, BOI Small Cap
- **ELSS (locked):** 5 funds — rolling unlock till Aug 2028, no action needed

See [plan/final-investment-plan.md](plan/final-investment-plan.md) for full migration timeline.

---

*Built with data from Zerodha Kite, NSE India, and a lot of analysis. All SIP recommendations are backed by 5.5 years of historical price data across 6 benchmarks.*

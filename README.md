# Personal Finance — Arjun Prasad

> **Purpose:** Complete investment management system — plan, execute, track, rebalance.
> Readable by any human financial advisor or AI agent managing this portfolio.

---

## Quick Numbers

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT STATE (May 2026)         TARGETS
────────────────────────         ──────────────────────
Net Worth:    ₹38.45 Lakhs      FIRE:     ₹5.8 Crore
Age:          27                 FIRE Age: 38 (Month 133)
Monthly SIP:  ₹1,00,000         Terminal: ₹11 Crore (Age 42)
EPF Auto:     ₹27,000/month     ₹1 Crore: Age 29.6
Savings Rate: 63% (incl EPF)    Step-Up:  10% every April
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Target Allocation (6-Fund Core)

| Fund | SIP | % | Type | Style |
|------|-----|---|------|-------|
| UTI Nifty 50 Index | ₹35,000 | 35% | Large Cap | Passive Index |
| Parag Parikh Flexi Cap | ₹28,000 | 28% | Multi Cap + Intl | Active |
| Motilal Nifty Midcap 150 Index | ₹17,000 | 17% | Mid Cap | Passive Index |
| Bandhan Small Cap | ₹10,000 | 10% | Small Cap | Active |
| SBI Gold ETF FoF | ₹7,000 | 7% | Gold | Commodity Hedge |
| Nippon Silver ETF FoF | ₹3,000 | 3% | Silver | Commodity Growth |

**Satellites (no SIP, hold & quarterly review):** SBI Tech ₹1.30L | BOI Small Cap ₹1.79L

---

## Repository Structure

```
finance/
├── PROFILE.md                    ← Who is this for? (read FIRST)
├── README.md                     ← You are here
│
├── plan/                         ← WHAT TO DO
│   ├── investment-plan.md        ← THE master blueprint (allocation, migration, projections)
│   ├── action-plan.md            ← Step-by-step execution (phases 1-7)
│   └── rebalancing-sop.md        ← Quarterly rebalancing operations manual
│
├── analytics/                    ← WHAT THE DATA SHOWS
│   ├── portfolio-snapshot.md     ← Current holdings & ratios (update quarterly)
│   ├── projections.md            ← 15-year month-by-month movement tables
│   ├── sip-date-analysis.md      ← Why all SIPs on 1st (5.5Y NSE data proof)
│   └── charts/                   ← 14 comprehensive visual charts
│       └── README.md             ← Chart index with descriptions
│
├── reference/                    ← LOOKUP GUIDES (stable, rarely change)
│   ├── tax-rules.md              ← LTCG/STCG/slab rates, harvesting calendar
│   └── risk-management.md        ← Emergency fund, insurance, crash playbook
│
├── data/                         ← RAW DATA (machine-readable)
│   ├── monthly_holdings.json     ← 180-month simulation (181 data points)
│   └── *_raw.json                ← NSE price data (5.5 years)
│
├── scripts/                      ← CODE
│   ├── generate-all-charts.py    ← Regenerate all 14 charts
│   ├── rebalance.py              ← Rebalancing calculator (buy/sell orders + LTCG cap)
│   └── rebalance-check.py        ← Legacy standalone checker
│
├── logs/                         ← HISTORY (append-only)
│   ├── rebalancing/              ← Quarterly check logs (template + records)
│   └── snapshots/                ← NW tracking over time
│
├── archive/                      ← SUPERSEDED (decision history, not active)
│   └── README.md                 ← Why each file was archived
│
└── .github/instructions/         ← AI AUTOMATION
    └── rebalancing-check.instructions.md  ← Copilot CLI skill
```

---

## Visual Analytics (13 Charts)

| Category | Charts | Key Insight |
|----------|--------|-------------|
| **Current State** | [01-Current Allocation](analytics/charts/01-current-allocation.png), [02-Target Allocation](analytics/charts/02-target-allocation.png) | 62.7% equity, 27.5% debt (EPF), migrating to 6 focused funds |
| **Exposure** | [03-Market Cap](analytics/charts/03-market-cap-exposure.png), [04-Sector Heatmap](analytics/charts/04-sector-exposure.png) | 55% large, 25% mid, 20% small; no dangerous sector concentration |
| **Projections** | [05-15 Year Trajectory](analytics/charts/05-future-projections.png), [06-Migration Waterfall](analytics/charts/06-migration-waterfall.png) | ₹1Cr at 29.6, FIRE at 38.1, legacy funds drain by Month 7 |
| **Risk** | [07-Crash Simulation](analytics/charts/07-risk-drawdown.png), [08-Gold vs Silver](analytics/charts/08-gold-silver-analysis.png) | Max effective drawdown -35% (not -53%) thanks to EPF+Gold hedge |
| **Growth Drivers** | [09-Step-Up Impact](analytics/charts/09-sip-stepup-impact.png), [10-FIRE Progress](analytics/charts/10-fire-progress.png) | 10% step-up adds ₹350L+ extra; on track for FIRE at 38 |
| **Diversification** | [11-Correlation Matrix](analytics/charts/11-correlation-matrix.png) | Gold negatively correlated with equity — ideal hedge |
| **Tax & Timing** | [12-Tax Calendar](analytics/charts/12-tax-harvest-calendar.png), [13-SIP Date Heatmap](analytics/charts/13-sip-date-heatmap.png) | Harvest LTCG in Jan, all SIPs on 1st (data-proven) |

→ Full chart descriptions: [`analytics/charts/README.md`](analytics/charts/README.md)

---

## Key Schedule

| Action | When | Automated? |
|--------|------|-----------|
| All SIPs execute | 1st of every month | Yes (Zerodha auto-debit) |
| Quarterly rebalance check | Feb / May / Aug / Nov | Semi (say `rebalance check`) |
| LTCG tax harvest | Every January | Manual (book ₹1.25L gains) |
| SIP step-up (10%) | Every April | Manual (increase amounts) |
| Annual deep review | Every May | Manual (update projections) |

---

## Migration Status (Jun 2026 → Feb 2027)

```
KEEP:     Parag Parikh Flexi Cap, Bandhan Small Cap
NEW:      UTI Nifty 50, Motilal Mid150, Gold FoF, Silver FoF
STP-OUT:  HDFC Flexi, Nippon Large, ICICI Large, PGIM Mid, Motilal Mid
HOLD:     SBI Tech (satellite), BOI Small (satellite)
LOCKED:   5 ELSS funds (rolling unlock till Aug 2028)
```

See [`plan/action-plan.md`](plan/action-plan.md) for execution steps.

---

## For AI Agents

If you're an AI managing this portfolio:
1. Read [`PROFILE.md`](PROFILE.md) for investor context and constraints
2. Read [`plan/investment-plan.md`](plan/investment-plan.md) for the strategy
3. Read [`plan/rebalancing-sop.md`](plan/rebalancing-sop.md) for operational rules
4. Use `rebalance check` trigger for automated quarterly analysis
5. Log all actions in `logs/`
6. Never recommend stocks, F&O, or sector bets (except existing SBI Tech satellite)

---

*Built with: Zerodha Kite MCP (live data), NSE India (5.5Y historical), 180-month Python simulation.*
*All analysis is data-backed and reproducible via `scripts/generate-all-charts.py`.*

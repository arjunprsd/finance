---
applyTo: "**"
---

# Skill: Portfolio Rebalancing Check

When the user says "rebalance check", "check portfolio drift", "run rebalancing", or "portfolio health check", execute the following automated procedure WITHOUT asking for clarification:

## Target Allocation (Hardcoded)

| Fund | Target % |
|------|----------|
| UTI Nifty 50 Index | 35% |
| Parag Parikh Flexi Cap | 28% |
| Motilal Nifty Midcap 150 Index | 17% |
| Bandhan Small Cap | 10% |
| SBI Gold FoF | 7% |
| Nippon Silver ETF FoF | 3% |

Tolerance band: ±5 percentage points per fund.

### Satellite Holdings (tracked separately, NOT in drift calculation)
- **SBI Tech Opportunities**: Hold. Exit if underperforms Nifty IT for 2 quarters.
- **BOI Small Cap**: Hold. Exit if underperforms Smallcap 250 for 2 quarters.

## Execution Steps

### Step 1: Fetch Live Holdings
- Use `kite-get_mf_holdings` to fetch current mutual fund portfolio from Zerodha
- If login required, prompt user to login first, then retry

### Step 2: Identify Target Funds
- From the holdings data, identify the 6 target funds by name matching
- For funds not yet in portfolio (during migration), note them as ₹0

### Step 3: Calculate Drift
For each of the 6 target funds:
```
current_value = last_price × quantity
total_target_portfolio = sum of all 6 target fund values
current_% = (current_value / total_target_portfolio) × 100
drift = current_% - target_%
```

### Step 4: Generate Drift Report
Output a table:
```
Fund                        Current ₹    Current %    Target %    Drift    Status
─────────────────────────────────────────────────────────────────────────────────
[fund name]                 [value]      [%]          [%]         [±X%]    [OK/WATCH/ACTION]
```

Status rules:
- **OK**: drift < 2%
- **WATCH**: drift 2-5%
- **ACTION NEEDED**: drift ≥ 5%

### Step 5: Recommend Actions
Based on the SOP in `plan/rebalancing-sop.md`:
- If all OK → "Portfolio is balanced. No action needed. Next check: [date + 3 months]"
- If WATCH → "Recommend adjusting SIPs for 2 months: increase [underweight] by ₹X, decrease [overweight] by ₹X"
- If ACTION → "Threshold breach detected. Execute rebalancing hierarchy: [specific recommendation]"

### Step 6: Tax Impact Warning
If any sell is recommended:
- Check if we're in Nov-Mar (FY boundary consideration)
- Remind: "Ensure units are held >12 months before selling (LTCG 12.5% vs STCG 20%)"
- Calculate approximate tax: gains × 12.5% (after ₹1.25L exemption)

### Step 7: Output Summary
End with:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REBALANCING VERDICT: [BALANCED / NEEDS ATTENTION / ACTION REQUIRED]
Max Drift: [X%] on [fund name]
Next Scheduled Check: [current date + 3 months]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 8: Log Results to Repo (MANDATORY — Detailed Analytical Log)

After generating the report, ALWAYS save a comprehensive log file:

1. Create a new file: `logs/rebalancing/YYYY-MM-DD.md` (using current date)
2. The log MUST include ALL of the following sections (reference `logs/rebalancing/2026-05-17.md` as the gold standard):
   - **Section 1: Portfolio Overview** — Total invested, current, P&L, full NW breakdown
   - **Section 2: Fund-by-Fund Analysis** — EVERY fund with NAV, units, return %, and WHY keep/STP/hold
   - **Section 2B: Performance Deep-Dive (XIRR/CAGR)** — Calculate XIRR and CAGR for every fund. Include: fund-level table (holding period, invested, current, abs return, CAGR, XIRR, grade A+/A/B+/B/C/D), portfolio-level metrics vs benchmarks, category performance table, "What's Working Well" list, "What Could Be Better" list with specific fix actions. Also regenerate `analytics/charts/14-performance-report.png` chart.
   - **Section 3: Drift Table** — Target allocation vs current with interpretation
   - **Section 4: Tax Impact** — Complete LTCG/STCG analysis per fund, exemption utilization
   - **Section 5: Risk Assessment** — Current risk profile vs post-action risk profile
   - **Section 6: Migration Status** — Progress tracker (if still in migration phase)
   - **Section 7: Verdict** — Clear status with root cause and resolution
   - **Section 8: Trackable Action Plan** — MUST use `- [ ]` checkbox format (GitHub-compatible). Every single action must be individually trackable. Organize by priority (🔴 Critical → 🟡 Important → 🟢 Verify → ⏭️ Future). Include specific fund names, amounts, dates, and "how to do it" context.
   - **Section 9: Next Check** — Date, expected state, triggers to watch
3. Git add, commit with message: `log: rebalancing check YYYY-MM-DD [VERDICT]`
4. Push to origin

**Section 8 format (MANDATORY):**
```markdown
## Section 8: Trackable Action Plan

> Mark each item as complete `[x]` when done.

### 🔴 Critical — By [deadline]
- [ ] [Specific action with fund name, amount, and how-to]
- [ ] [Another specific action]

### 🟡 Important — By [deadline]
- [ ] [Action]

### 🟢 Verify — Post-execution
- [ ] [Date]: [What to check]

### ⏭️ Future (no action now)
- [ ] [Month]: [Deferred action]
```

This step is NON-OPTIONAL. Every rebalancing check must be persisted as a detailed historical record with trackable actions for self-study and audit trail.

## Additional Context

- EPF (₹27K/month) is excluded from rebalancing — it's locked debt.
- SGBs are excluded — hold to maturity.
- Direct stocks (49) are excluded — legacy, no action.
- ELSS funds are excluded — locked, rolling unlock till Aug 2028.
- During migration phase (Jun 2026 - Feb 2027), old funds being STP'd out are NOT part of target allocation calculation.
- Reference SOP: `/Users/arjun.prasad/finance/plan/rebalancing-sop.md`
- Reference plan: `/Users/arjun.prasad/finance/plan/investment-plan.md`
- Rebalancing logs: `/Users/arjun.prasad/finance/logs/rebalancing/`
- Portfolio snapshot: `/Users/arjun.prasad/finance/analytics/portfolio-snapshot.md`
- Charts: `/Users/arjun.prasad/finance/analytics/charts/`

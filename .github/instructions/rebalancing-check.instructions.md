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
| SBI Gold FoF | 5% |
| Nippon Silver ETF FoF | 5% |

Tolerance band: ±5 percentage points per fund.

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

### Step 8: Log Results to Repo (MANDATORY)

After generating the report, ALWAYS save a log file:

1. Create a new file: `logs/rebalancing/YYYY-MM-DD.md` (using current date)
2. Use the template from `logs/rebalancing/_template.md`
3. Fill in ALL fields with live data from this check
4. Git add, commit with message: `log: rebalancing check YYYY-MM-DD [VERDICT]`
5. Push to origin

This step is NON-OPTIONAL. Every rebalancing check must be persisted in the repo as a historical record.

## Additional Context

- EPF (₹27K/month) is excluded from rebalancing — it's locked debt.
- SGBs are excluded — hold to maturity.
- Direct stocks (49) are excluded — legacy, no action.
- ELSS funds are excluded — locked, rolling unlock till Aug 2028.
- During migration phase (Jun 2026 - Feb 2027), old funds being STP'd out are NOT part of target allocation calculation.
- Reference SOP: `/Users/arjun.prasad/finance/plan/rebalancing-sop.md`
- Reference plan: `/Users/arjun.prasad/finance/plan/final-investment-plan.md`
- Rebalancing logs: `/Users/arjun.prasad/finance/logs/rebalancing/`

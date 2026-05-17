# Investor Profile — Arjun Prasad

> This file provides context for any human or AI agent managing this portfolio.
> Read this FIRST before making any decisions.

---

## Identity

| Field | Value                               |
|-------|-------------------------------------|
| Name | Arjun Prasad                        |
| Age | 27 (born 25/11/1998)                |
| Location | India                               |
| Marital Status | Single                              |
| Dependents | Parents (minimal financial support) |
| Tax Regime | New Tax Regime (FY 2025-26 onwards) |
| Risk Tolerance | Medium-High                         |
| Investment Horizon | 15+ years (targeting FIRE at 38-42) |

---

## Income & Expenses

```
MONTHLY CASH FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFLOWS                          OUTFLOWS
────────────────                 ────────────────────
Take-Home Salary    ₹2,00,000   Home Loan EMI        ₹45,000
EPF (auto from CTC) ₹27,000    Rent/Food/Living     ₹30,000
                                 Travel/Misc          ₹20,000
                                 Term Insurance       ₹2,400/mo
                                 ─────────────────────
                                 Total Expenses       ~₹1,00,000

                                 Available for SIPs   ₹1,00,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Savings Rate: 50% of take-home | 63% including EPF
Total Monthly Deployment: ₹1,27,000 (SIPs + EPF)
```

---

## Financial Goals

| Goal | Target | Timeline | Strategy |
|------|--------|----------|----------|
| FIRE (Financial Independence) | ₹5.8 Crore | Age 38 (Month 133) | 6-fund SIP + 10% annual step-up |
| Emergency Fund | ₹6 Lakhs (6 months) | Build over first year | Currently ₹2L → needs ₹4L more |
| Home Loan Closure | Pay off early if rate stays >9% | Evaluate at Year 5 | Lump sum from LTCG harvesting |

---

## Tax Regime & Implications

| Parameter | Value |
|-----------|-------|
| Regime | **New Tax Regime** (FY 2025-26 onwards) |
| Standard Deduction | ₹75,000 |
| ELSS Benefit (80C) | ❌ NOT available in new regime |
| HRA Exemption | ❌ NOT available |
| Home Loan Interest (24b) | ❌ NOT available |

**Investment Tax Rules (applicable regardless of regime):**

| Income Type | Tax Rate | Exemption | Notes |
|-------------|----------|-----------|-------|
| Equity LTCG (>12 months) | 12.5% | ₹1.25L/year | Harvest annually in Jan |
| Equity STCG (<12 months) | 20% | None | Avoid selling before 12 months |
| Debt fund gains (any period) | Slab rate | None | Taxed at marginal slab |
| Gold/Silver FoF (>24 months) | 12.5% | ₹1.25L shared with equity | Long-term after 2 years |
| EPF interest | Tax-free up to ₹2.5L/yr | Full | No action needed |
| SGB maturity | Tax-free | Full | Hold to maturity |

**Key Decision:** Since 80C has no benefit in new regime, ELSS funds have zero tax advantage. Redeem as they unlock and move to target allocation.

---

| Type | Status | Details |
|------|--------|---------|
| Term Life Insurance | ✅ Active | ₹29,000/year premium |
| Health Insurance | ✅ Corporate | Employer-provided (no personal backup) |
| Emergency Fund | 🚨 Gap | ₹2L exists, need ₹6L |

---

## Liabilities

| Liability | Outstanding | EMI | Rate | Remaining |
|-----------|-------------|-----|------|-----------|
| Home Loan | ~₹50-55L | ₹45,000/mo | ~8.5% floating | ~15 years |

> Property value ~₹70-80L → Net home equity: ₹15-25L (not counted in investment NW)

---

## Investment Philosophy

1. **Time is the edge.** At 27, every ₹1K at 12% CAGR → ₹30K by age 57.
2. **Automate everything.** SIPs on 1st, zero manual decisions month-to-month.
3. **Don't trade.** No stocks, no F&O, no timing. SIP through every crash.
4. **Index-heavy.** 52% in passive index funds (UTI N50 + Motilal Mid150).
5. **Crash protocol: DO NOTHING.** Continue SIPs regardless of market conditions.
6. **Annual review only.** Step-up SIPs in April, harvest LTCG in January, rebalance quarterly.

---

## Key Constraints (for any AI agent)

- **No direct stock recommendations** — investor explicitly doesn't trade
- **No F&O / derivatives** — completely excluded
- **No sectoral bets** — except existing SBI Tech satellite (legacy, with exit rules)
- **EPF is locked** — can't touch till resignation or age 58
- **SGBs held to maturity** — tax-free at maturity, don't sell early
- **ELSS locked** — 3-year lock-in, rolling unlock till Aug 2028
- **Home loan EMI is fixed** — ₹45K/month non-negotiable

---

## Quarterly Review Triggers

Run `rebalance check` (Copilot CLI skill) every Feb/May/Aug/Nov. This:
1. Fetches live holdings from Zerodha Kite
2. Calculates drift from target allocation
3. Generates detailed log in `logs/rebalancing/`
4. Recommends actions if drift exceeds tolerance bands

---

*Last updated: May 2026 | Update annually or on major life changes*

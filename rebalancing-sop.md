# SYSTEMATIC PORTFOLIO REBALANCING — Standard Operating Procedure

**Owner:** Arjun Prasad | **Version:** 1.0 | **Created:** May 17, 2026  
**Applies to:** 6-fund SIP portfolio + EPF + SGBs  
**Review Cadence:** Annually (January) + on threshold breach

---

## 1. TARGET ALLOCATION (Baseline Reference)

```
COMPONENT              TARGET %    TOLERANCE BAND    HARD FLOOR / CEILING
─────────────────────────────────────────────────────────────────────────
UTI Nifty 50 Index      35%        30% – 40%        Never below 25%
Parag Parikh Flexi      28%        23% – 33%        Never below 20%
Motilal Midcap 150 Idx  17%        12% – 22%        Never above 25%
Bandhan Small Cap       10%         7% – 13%        Never above 15%
SBI Gold FoF             5%         3% –  8%        Never below 2%
Nippon Silver ETF FoF    5%         3% –  8%        Never above 10%
─────────────────────────────────────────────────────────────────────────
EPF (excluded from rebalancing — auto-pilot, locked asset)
SGBs (excluded — hold to maturity, no action required)
Direct Stocks (excluded — legacy, no additions, no sells)
```

**Drift** = |Current % − Target %| for any single component.

---

## 2. REBALANCING TRIGGERS

### Trigger A: Time-Based (Mandatory)

| Parameter | Rule |
|-----------|------|
| **Date** | **First Saturday of January, every year** |
| **Action** | Full portfolio review regardless of drift |
| **Combined with** | Annual LTCG tax harvesting (book ₹1.25L gains) |
| **Calendar reminder** | Set recurring event: "Portfolio Rebalance + Tax Harvest" |

### Trigger B: Threshold-Based (Conditional)

| Parameter | Rule |
|-----------|------|
| **Single-asset drift** | Any component drifts **≥5 percentage points** from target |
| **Example** | Midcap at 22%+ (target 17%) OR Gold at 10%+ (target 5%) |
| **Check frequency** | **Quarterly** (1st of Jan, Apr, Jul, Oct) — 5-minute check |
| **How to check** | Zerodha Coin → Holdings → Export → Calculate % manually |

### Trigger C: Life-Event (Override)

Rebalance immediately (within 30 days) if:
- Marriage / child expected → reduce equity to 60%, add debt
- Job loss → freeze SIPs, do NOT sell
- Windfall (bonus >₹5L) → deploy per target % (not all into one fund)
- Market crash >30% → **DO NOTHING** (this IS the rule)

---

## 3. EXECUTION HIERARCHY (Tax-Efficiency Order)

**ALWAYS execute in this order. Stop at the step that resolves the drift.**

### Step 1: REDIRECT FRESH SIP (Zero tax, zero cost)

```
WHEN TO USE:  Drift is 2–5% and you have time (1–3 months to correct).
HOW:          Temporarily increase SIP to underweight fund, decrease overweight.
TAX IMPACT:   ₹0
EXAMPLE:      Midcap drifted to 22% (target 17%).
              → Pause Midcap SIP for 2 months.
              → Route that ₹17K to Nifty 50 (underweight).
              → Resume normal SIPs once drift corrects.
RULE:         Never pause any SIP for more than 3 months.
```

### Step 2: REDIRECT BONUS / VARIABLE PAY (Zero tax)

```
WHEN TO USE:  Drift is 3–5% and you receive a lumpsum (bonus, incentive).
HOW:          Deploy entire lumpsum into underweight asset ONLY.
TAX IMPACT:   ₹0
EXAMPLE:      Received ₹3L bonus. Gold is underweight at 3% (target 5%).
              → Lumpsum ₹1.5L into Gold FoF, ₹1.5L into Nifty 50.
              → Do NOT put bonus into already-overweight assets.
```

### Step 3: SELL OVERWEIGHT + BUY UNDERWEIGHT (Tax applies)

```
WHEN TO USE:  Drift ≥5% AND Step 1–2 cannot fix within 3 months.
HOW:          Redeem units from overweight fund → invest in underweight fund.
TAX IMPACT:   LTCG 12.5% (after ₹1.25L exemption) or STCG 20%.
RULE:         Execute PRE-SELL CHECKLIST (Section 4) before ANY redemption.
EXAMPLE:      Small cap at 16% (target 10%, drift = 6 points).
              → Sell ₹X from Bandhan Small Cap (LTCG-eligible units ONLY).
              → Deploy proceeds into UTI Nifty 50.
              → Limit total LTCG realization to ₹1.25L in that FY.
```

### Step 4: STP (Systematic Transfer Plan) — For Large Corrections

```
WHEN TO USE:  Overweight amount exceeds ₹2L (selling all at once = tax bomb).
HOW:          Set STP from overweight → underweight over 3–6 months.
TAX IMPACT:   Each STP installment is a sell event. LTCG/STCG applies per unit.
RULE:         Only STP units held >12 months. Leave younger units untouched.
EXAMPLE:      Midcap balloons to ₹8L (should be ₹5L).
              → STP ₹50K/month × 6 months from Midcap → Nifty 50.
              → Spread across 2 FYs if gains exceed ₹1.25L.
```

---

## 4. PRE-SELL CHECKLIST

**Do NOT click "Redeem" until every box is checked:**

### Tax Rules

- [ ] **Holding period**: Are the units I'm selling held >12 months?
  - YES → LTCG @ 12.5% (with ₹1.25L annual exemption)
  - NO → STCG @ 20% — **strongly prefer waiting till they qualify**
- [ ] **Exemption headroom**: How much of my ₹1.25L LTCG exemption is already used this FY?
  - Remaining exemption = ₹1,25,000 − (gains already booked in this FY)
  - **Do not exceed remaining exemption unless drift is critical**
- [ ] **Gold/Silver FoF special rule**: Held >24 months?
  - YES → LTCG @ 12.5%
  - NO → Taxed at income slab rate (up to 30%) — **avoid selling if <24 months**
- [ ] **Financial year boundary**: Is it November–March?
  - If gains will exceed ₹1.25L, **split the sell across FY boundary** (sell some before March 31, rest after April 1)

### Exit Load Rules

- [ ] **Equity MFs (Nifty 50, PPFAS, Midcap, Bandhan)**: Exit load = **1% if redeemed within 1 year** of purchase. After 1 year = NIL.
- [ ] **Gold/Silver FoF**: Check specific scheme — typically **0.5–1% within 6 months**, NIL after.
- [ ] **FIFO rule**: Zerodha sells OLDEST units first (First-In-First-Out). Verify that oldest units are >12 months to avoid both exit load AND STCG.

### Sanity Checks

- [ ] **Amount check**: Am I selling more than needed? Calculate EXACT amount to restore target %.
- [ ] **Market timing check**: Am I selling because of panic? If YES → STOP. Come back in 7 days.
- [ ] **Emergency fund check**: After this transaction, do I still have ₹6L liquid? If NO → do not sell.

---

## 5. QUARTERLY CHECK PROCEDURE (15 minutes max)

```
STEP 1: Open Zerodha Coin → Console → Holdings
STEP 2: Note current value of each of the 6 funds
STEP 3: Calculate total MF value = sum of all 6
STEP 4: Calculate current % = (fund value / total) × 100
STEP 5: Calculate drift = |current % − target %|
STEP 6: Decision matrix:

  ┌─────────────────────────────────────────────────────────┐
  │  MAX DRIFT < 2%  →  DO NOTHING. Log and close.          │
  │  MAX DRIFT 2–5%  →  Adjust SIPs next month (Step 1).    │
  │  MAX DRIFT ≥ 5%  →  Execute Step 1–4 hierarchy.         │
  └─────────────────────────────────────────────────────────┘

STEP 7: Log in Execution Log (Section 6 template)
```

---

## 6. EXECUTION LOG TEMPLATE

Copy this template into your journal/notion for each rebalancing event:

```markdown
---
## Rebalancing Log — [DATE: YYYY-MM-DD]

**Trigger:** [ ] Annual (January)  [ ] Threshold breach  [ ] Life event: ___________

### Current vs Target Allocation

| Fund                     | Current ₹ | Current % | Target % | Drift |
|--------------------------|-----------|-----------|----------|-------|
| UTI Nifty 50 Index       |           |           | 35%      |       |
| Parag Parikh Flexi Cap   |           |           | 28%      |       |
| Motilal Midcap 150 Index |           |           | 17%      |       |
| Bandhan Small Cap        |           |           | 10%      |       |
| SBI Gold FoF             |           |           |  5%      |       |
| Nippon Silver ETF FoF    |           |           |  5%      |       |
| **TOTAL**                |           | 100%      | 100%     |       |

### Actions Taken

| # | Action Type             | From Fund       | To Fund         | Amount  | Tax Impact |
|---|-------------------------|-----------------|-----------------|---------|------------|
| 1 | SIP redirect / Sell+Buy |                 |                 |         |            |
| 2 |                         |                 |                 |         |            |

### Tax Summary

- Total gains booked this FY (prior to today): ₹_________
- Gains booked today: ₹_________
- FY exemption remaining after today: ₹_________ (of ₹1,25,000)
- Tax payable on today's action: ₹_________
- All units sold held >12 months? [ ] Yes  [ ] No — explain: ________

### Notes / Deviations
_Why did I deviate from the SOP, if at all?_

---
```

---

## 7. ANNUAL REBALANCE + TAX HARVEST COMBINED WORKFLOW (January)

```
WEEK 1 OF JANUARY — Execute in this exact order:

1. CALCULATE current allocation (same as quarterly check)

2. IDENTIFY gains to harvest:
   → Open Zerodha Console → Tax P&L → Unrealized gains
   → Find units with gains that have crossed 12-month holding
   → Target: Book exactly ₹1,25,000 in LTCG (use the exemption fully)

3. SELL for tax harvest:
   → Sell units worth ₹1.25L GAINS (not value — gains)
   → This resets cost basis, saving ₹15,625 in future tax
   → Choose units from the OVERWEIGHT fund (solves 2 problems at once)

4. RE-INVEST proceeds:
   → Wait 1 business day (settlement)
   → Buy into UNDERWEIGHT fund
   → If no fund is underweight, buy back the SAME fund (cost-basis reset only)

5. ADJUST SIPs if needed:
   → If drift 2–5% after tax harvest, redirect SIPs for 2–3 months
   → If drift resolved by the sell+buy above, no SIP change needed

6. LOG in execution template above

7. SET STEP-UP:
   → Increase all SIPs by 10% (Year 1–5) or 7% (Year 6–10) or 5% (Year 11+)
   → New total SIP = current × 1.10
   → Maintain same % distribution across 6 funds

8. VERIFY emergency fund:
   → Savings account balance ≥ ₹6L?
   → If no, route surplus to savings until restored before SIP increase
```

---

## 8. HARD RULES (NON-NEGOTIABLE)

| # | Rule | Consequence of Breaking |
|---|------|------------------------|
| 1 | **Never sell during a crash (>20% drawdown)** | Locks in permanent loss. SIP into the crash instead. |
| 2 | **Never sell units held <12 months** (unless emergency) | 20% STCG vs 12.5% LTCG = 7.5% penalty per transaction |
| 3 | **Never exceed ₹1.25L LTCG in a single FY** without planning | Every ₹1 above exemption taxed at 12.5% unnecessarily |
| 4 | **Never rebalance more than 2x per year** | Over-trading destroys compounding + creates tax drag |
| 5 | **Never put rebalance proceeds into a NEW fund** | Rebalance within existing 6 funds only. New funds = separate decision. |
| 6 | **Gold/Silver: Never sell before 24 months** | Taxed at slab (up to 30%) instead of 12.5% LTCG |
| 7 | **EPF/SGBs: Never touch** | EPF is locked. SGBs earn 2.5% + tax-free maturity. Let them be. |

---

## 9. EDGE CASES & FAQ

**Q: What if one fund doubles and becomes 40% of portfolio?**  
A: This means markets are euphoric. Sell overweight systematically (STP over 3 months). Do NOT sell all at once. Spread gains across FY boundary if >₹1.25L.

**Q: What if a crash makes small cap drop to 4% (target 10%)?**  
A: Redirect ALL surplus SIP into small cap temporarily (max 3 months). Do NOT sell other funds to buy small cap — fresh cash only.

**Q: What if I miss the January rebalance?**  
A: Do it in February. Missing by 1 month is fine. Missing entirely means you rely on threshold triggers only (still safe).

**Q: What if my salary increases significantly?**  
A: Increase SIPs maintaining the SAME percentage distribution (35/28/17/10/5/5). Do not change allocation % just because you have more money.

**Q: What if Bandhan Small Cap starts underperforming the Smallcap 250 index for 2 consecutive years?**  
A: Switch to Nippon Nifty Smallcap 250 Index Fund. Stop Bandhan SIP → Start new SIP → STP old corpus over 6 months (12-month holding check applies).

---

## 10. MONITORING DASHBOARD (What to Track)

```
CHECK QUARTERLY (5 min):
  □ Current allocation % of each fund
  □ Max drift from target

CHECK ANNUALLY (January, 30 min):
  □ Total portfolio value vs last year
  □ LTCG exemption usage plan for the year
  □ SIP step-up applied?
  □ Emergency fund at ₹6L+?
  □ Any fund underperforming benchmark for 2 years?
  □ Any life event upcoming (marriage, child, job change)?

IGNORE ALWAYS:
  ✗ Daily NAV movements
  ✗ Monthly fund rankings
  ✗ News about "best funds to buy now"
  ✗ What others are investing in
  ✗ Short-term market predictions
```

---

*This SOP is a living document. Update target allocation only during the annual January review, never mid-year on impulse.*

#!/usr/bin/env python3
"""
Portfolio Rebalancing Check — Quick CLI Tool
Usage: python3 scripts/rebalance-check.py

Reads current values (manual input or from exported CSV) and compares
against target allocation. Outputs drift report and recommendations.

For automated version: Use Copilot CLI → "rebalance check" (uses Kite MCP)
"""

import sys
from datetime import datetime, timedelta

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TARGET ALLOCATION (update only during annual January review)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TARGETS = {
    "Navi Nifty 50 Index":           {"target_pct": 35, "sip": 35000},
    "Parag Parikh Flexi Cap":       {"target_pct": 28, "sip": 28000},
    "Edelweiss Mid Cap":            {"target_pct": 17, "sip": 17000},
    "Bandhan Small Cap":            {"target_pct": 10, "sip": 10000},
    "SBI Gold FoF":                 {"target_pct":  7, "sip":  7000},
    "Nippon Silver ETF FoF":        {"target_pct":  3, "sip":  3000},
}

THRESHOLD_WATCH = 2.0    # % drift to flag as WATCH
THRESHOLD_ACTION = 5.0   # % drift to flag as ACTION NEEDED

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def get_current_values():
    """Prompt user for current values or read from args."""
    print("\n📊 PORTFOLIO REBALANCING CHECK")
    print("━" * 50)
    print("\nEnter current value (₹) for each fund:")
    print("(Get from: Zerodha Coin → Holdings → Current Value)\n")

    values = {}
    for fund in TARGETS:
        while True:
            try:
                val = input(f"  {fund}: ₹")
                val = val.replace(",", "").replace("₹", "").strip()
                values[fund] = float(val)
                break
            except ValueError:
                print("    ❌ Enter a number (e.g., 350000 or 3,50,000)")
    return values


def calculate_drift(current_values):
    """Calculate drift from target allocation."""
    total = sum(current_values.values())
    if total == 0:
        print("❌ Total portfolio value is 0. Cannot calculate.")
        sys.exit(1)

    results = []
    for fund, config in TARGETS.items():
        current_val = current_values.get(fund, 0)
        current_pct = (current_val / total) * 100
        target_pct = config["target_pct"]
        drift = current_pct - target_pct
        abs_drift = abs(drift)

        if abs_drift >= THRESHOLD_ACTION:
            status = "🔴 ACTION"
        elif abs_drift >= THRESHOLD_WATCH:
            status = "🟡 WATCH"
        else:
            status = "🟢 OK"

        results.append({
            "fund": fund,
            "current_val": current_val,
            "current_pct": current_pct,
            "target_pct": target_pct,
            "drift": drift,
            "abs_drift": abs_drift,
            "status": status,
        })

    return results, total


def print_report(results, total):
    """Print formatted drift report."""
    print("\n")
    print("╔══════════════════════════════════════════════════════════════════════════╗")
    print("║                    PORTFOLIO DRIFT REPORT                               ║")
    print(f"║                    Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}                            ║")
    print("╠══════════════════════════════════════════════════════════════════════════╣")
    print(f"║  Total Portfolio Value: ₹{total:,.0f}                              ║")
    print("╚══════════════════════════════════════════════════════════════════════════╝")
    print()

    # Header
    print(f"{'Fund':<30} {'Current ₹':>12} {'Cur%':>6} {'Tgt%':>6} {'Drift':>7} {'Status':<12}")
    print("─" * 80)

    max_drift_fund = ""
    max_drift_val = 0

    for r in results:
        drift_str = f"{r['drift']:+.1f}%"
        print(f"{r['fund']:<30} {r['current_val']:>12,.0f} {r['current_pct']:>5.1f}% {r['target_pct']:>5.0f}% {drift_str:>7} {r['status']:<12}")
        if r["abs_drift"] > max_drift_val:
            max_drift_val = r["abs_drift"]
            max_drift_fund = r["fund"]

    print("─" * 80)
    print(f"{'TOTAL':<30} {total:>12,.0f} {'100.0%':>6} {'100%':>6}")
    print()

    # Verdict
    action_items = [r for r in results if "ACTION" in r["status"]]
    watch_items = [r for r in results if "WATCH" in r["status"]]

    if action_items:
        verdict = "🔴 ACTION REQUIRED"
    elif watch_items:
        verdict = "🟡 NEEDS ATTENTION"
    else:
        verdict = "🟢 BALANCED"

    print("━" * 50)
    print(f"  VERDICT: {verdict}")
    print(f"  Max Drift: {max_drift_val:.1f}% on {max_drift_fund}")
    next_check = datetime.now() + timedelta(days=90)
    print(f"  Next Check: {next_check.strftime('%Y-%m-%d')}")
    print("━" * 50)

    # Recommendations
    if action_items or watch_items:
        print("\n📋 RECOMMENDATIONS (ordered by tax-efficiency):")
        print()

        overweight = [r for r in results if r["drift"] > THRESHOLD_WATCH]
        underweight = [r for r in results if r["drift"] < -THRESHOLD_WATCH]

        if overweight and underweight:
            print("  Step 1 — REDIRECT SIPs (₹0 tax):")
            for ow in overweight:
                for uw in underweight:
                    redirect_amt = min(
                        TARGETS[ow["fund"]]["sip"],
                        abs(int((ow["drift"] / 100) * total / 3))
                    )
                    print(f"    → Reduce {ow['fund']} SIP by ₹{redirect_amt:,}")
                    print(f"    → Increase {uw['fund']} SIP by ₹{redirect_amt:,}")
                    print(f"    → Duration: 2-3 months, then revert to normal")
                    break
                break

            if any(r["abs_drift"] >= THRESHOLD_ACTION for r in results):
                print()
                print("  Step 2 — SELL + BUY (if SIP redirect insufficient):")
                for ow in overweight:
                    if ow["abs_drift"] >= THRESHOLD_ACTION:
                        sell_amt = int((ow["drift"] / 100) * total)
                        print(f"    → Sell ₹{sell_amt:,} from {ow['fund']}")
                        print(f"    → ⚠️  CHECK: Units held >12 months? (LTCG vs STCG)")
                        print(f"    → ⚠️  CHECK: FY LTCG exemption remaining?")
    else:
        print("\n✅ All funds within tolerance band. No action needed.")
        print("   Continue SIPs as-is. See you next quarter!")


def main():
    current_values = get_current_values()
    results, total = calculate_drift(current_values)
    print_report(results, total)

    # Offer to generate log entry
    print("\n" + "─" * 50)
    log = input("Generate execution log entry? (y/n): ").strip().lower()
    if log == "y":
        print("\n```markdown")
        print(f"## Rebalancing Log — {datetime.now().strftime('%Y-%m-%d')}")
        print()
        print(f"**Trigger:** Quarterly check")
        print()
        print("| Fund | Current ₹ | Current % | Target % | Drift |")
        print("|------|-----------|-----------|----------|-------|")
        for r in results:
            print(f"| {r['fund']} | ₹{r['current_val']:,.0f} | {r['current_pct']:.1f}% | {r['target_pct']:.0f}% | {r['drift']:+.1f}% |")
        print()
        print("**Actions Taken:** [Fill after action]")
        print("**Tax Impact:** [Fill after action]")
        print("```")


if __name__ == "__main__":
    main()

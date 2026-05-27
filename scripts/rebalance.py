#!/usr/bin/env python3
"""
Portfolio Rebalancer — Generates exact buy/sell orders to hit target allocation.
Keeps sells under ₹1.25L LTCG annual exemption.

Usage:
  python3 scripts/rebalance.py                    # Uses sample data
  python3 scripts/rebalance.py --holdings data.json  # Uses Kite export

Output: Prioritized list of actions (SIP adjust / buy / sell) with exact amounts.
"""

import argparse
import json
import sys
from datetime import datetime

# ─── TARGET ALLOCATION ─────────────────────────────────────────────
TARGET = {
    "Navi Nifty 50 Index":           0.35,
    "Parag Parikh Flexi Cap":        0.28,
    "Edelweiss Mid Cap":             0.17,
    "Bandhan Small Cap":             0.10,
    "SBI Gold FoF":                  0.07,
    "Nippon Silver ETF FoF":         0.03,
}

TOLERANCE = 0.05  # ±5 percentage points
LTCG_EXEMPTION = 125000  # ₹1.25L annual
LTCG_RATE = 0.125
STCG_RATE = 0.20

# ─── FUND NAME MATCHING ────────────────────────────────────────────
FUND_MAP = {
    "NAVI NIFTY 50 INDEX": "Navi Nifty 50 Index",
    "NAVI NIFTY 50": "Navi Nifty 50 Index",
    "NAVI NIFTY": "Navi Nifty 50 Index",
    "PARAG PARIKH": "Parag Parikh Flexi Cap",
    "PPFAS": "Parag Parikh Flexi Cap",
    "EDELWEISS MID CAP": "Edelweiss Mid Cap",
    "EDELWEISS MIDCAP": "Edelweiss Mid Cap",
    "BANDHAN SMALL CAP": "Bandhan Small Cap",
    "SBI GOLD": "SBI Gold FoF",
    "NIPPON INDIA SILVER": "Nippon Silver ETF FoF",
    "NIPPON SILVER": "Nippon Silver ETF FoF",
}

def match_fund(name):
    """Match a Kite fund name to target fund."""
    upper = name.upper()
    for key, target in FUND_MAP.items():
        if key in upper:
            return target
    return None

def parse_holdings(data):
    """Parse Kite MF holdings JSON into fund-value dict."""
    funds = {}
    for h in data:
        name = h.get("fund", h.get("name", ""))
        nav = h.get("last_price", h.get("nav", 0))
        qty = h.get("quantity", h.get("qty", 0))
        avg = h.get("average_price", h.get("avg", 0))
        value = nav * qty
        invested = avg * qty
        gain = value - invested
        
        target = match_fund(name)
        if target:
            if target in funds:
                funds[target]["value"] += value
                funds[target]["invested"] += invested
                funds[target]["gain"] += gain
            else:
                funds[target] = {"value": value, "invested": invested, "gain": gain}
    
    # Add missing target funds as zero
    for t in TARGET:
        if t not in funds:
            funds[t] = {"value": 0, "invested": 0, "gain": 0}
    
    return funds

def calculate_rebalance(funds, ltcg_used=0):
    """Calculate buy/sell orders to reach target allocation."""
    total = sum(f["value"] for f in funds.values())
    if total == 0:
        print("⚠️  All target funds at ₹0. Start SIPs first, nothing to rebalance.")
        return []
    
    ltcg_remaining = LTCG_EXEMPTION - ltcg_used
    orders = []
    
    print(f"\n{'='*70}")
    print(f"REBALANCING CALCULATOR")
    print(f"{'='*70}")
    print(f"  Total target portfolio: ₹{total:,.0f}")
    print(f"  LTCG exemption remaining: ₹{ltcg_remaining:,.0f}")
    print(f"  Date: {datetime.now().strftime('%d %b %Y')}")
    
    # Calculate drift
    print(f"\n  {'Fund':<35} {'Current':>10} {'Cur%':>6} {'Tgt%':>6} {'Drift':>7} {'Action':>10}")
    print(f"  {'-'*35} {'-'*10} {'-'*6} {'-'*6} {'-'*7} {'-'*10}")
    
    for fund, target_pct in TARGET.items():
        cur_val = funds[fund]["value"]
        cur_pct = cur_val / total
        target_val = total * target_pct
        drift = cur_pct - target_pct
        diff = cur_val - target_val
        
        if abs(drift) < TOLERANCE:
            status = "OK"
        elif drift > 0:
            status = f"SELL ₹{abs(diff):,.0f}"
        else:
            status = f"BUY ₹{abs(diff):,.0f}"
        
        print(f"  {fund:<35} ₹{cur_val:>8,.0f} {cur_pct*100:>5.1f}% {target_pct*100:>5.1f}% {drift*100:>+6.1f}% {status:>10}")
        
        if abs(drift) >= TOLERANCE:
            orders.append({
                "fund": fund,
                "action": "SELL" if drift > 0 else "BUY",
                "amount": abs(diff),
                "drift": drift,
                "gain_if_sell": funds[fund]["gain"] * (abs(diff) / cur_val) if cur_val > 0 and drift > 0 else 0,
            })
    
    if not orders:
        print(f"\n  ✅ Portfolio is balanced! All funds within ±{TOLERANCE*100:.0f}% tolerance.")
        return orders
    
    # Generate prioritized action plan
    print(f"\n{'='*70}")
    print(f"RECOMMENDED ACTIONS (Prioritized)")
    print(f"{'='*70}")
    
    # Priority 1: SIP adjustments (no tax impact)
    sells = [o for o in orders if o["action"] == "SELL"]
    buys = [o for o in orders if o["action"] == "BUY"]
    
    if sells and buys:
        print(f"\n  📋 PRIORITY 1: Adjust SIPs for 2-3 months (tax-free method)")
        print(f"  ─────────────────────────────────────────────────────")
        total_sell = sum(o["amount"] for o in sells)
        total_buy = sum(o["amount"] for o in buys)
        rebalance_via_sip = min(total_sell, total_buy) / 3  # spread over 3 months
        
        for o in sells:
            sip_reduce = (o["amount"] / total_sell) * rebalance_via_sip
            print(f"  ↓ Reduce {o['fund']} SIP by ₹{sip_reduce:,.0f}/month for 3 months")
        for o in buys:
            sip_increase = (o["amount"] / total_buy) * rebalance_via_sip
            print(f"  ↑ Increase {o['fund']} SIP by ₹{sip_increase:,.0f}/month for 3 months")
    
    # Priority 2: Sell overweight (if drift > tolerance + 2%)
    big_sells = [o for o in sells if abs(o["drift"]) > TOLERANCE + 0.02]
    if big_sells:
        print(f"\n  📋 PRIORITY 2: Sell overweight funds (check LTCG limit)")
        print(f"  ─────────────────────────────────────────────────────")
        cumulative_gain = 0
        for o in sorted(big_sells, key=lambda x: x["gain_if_sell"]):
            gain = o["gain_if_sell"]
            if cumulative_gain + gain <= ltcg_remaining:
                tax = 0
                tax_note = "within exemption"
            else:
                taxable = cumulative_gain + gain - ltcg_remaining
                tax = taxable * LTCG_RATE
                tax_note = f"tax ₹{tax:,.0f}"
            
            # Cap sell amount to keep gains within exemption
            if gain > 0 and cumulative_gain + gain > ltcg_remaining:
                safe_fraction = max(0, (ltcg_remaining - cumulative_gain) / gain)
                safe_amount = o["amount"] * safe_fraction
                print(f"  ⚠️  SELL {o['fund']}: ₹{safe_amount:,.0f} (capped to stay under LTCG limit)")
                print(f"      Full sell would be ₹{o['amount']:,.0f} but gains ₹{gain:,.0f} exceed remaining exemption")
            else:
                print(f"  ✅ SELL {o['fund']}: ₹{o['amount']:,.0f} (est. gain ₹{gain:,.0f}, {tax_note})")
            
            cumulative_gain += gain
        
        print(f"\n  Total estimated gains from sells: ₹{cumulative_gain:,.0f}")
        if cumulative_gain <= ltcg_remaining:
            print(f"  ✅ Within ₹{ltcg_remaining:,.0f} exemption — TAX: ₹0")
        else:
            excess = cumulative_gain - ltcg_remaining
            print(f"  ⚠️  Exceeds exemption by ₹{excess:,.0f} — TAX: ₹{excess * LTCG_RATE:,.0f}")
            print(f"  💡 Split sells across FY boundary (Jan-Mar vs Apr+) to use 2x exemption")
    
    # Priority 3: Buy underweight
    if buys:
        print(f"\n  📋 PRIORITY 3: Buy underweight funds")
        print(f"  ─────────────────────────────────────────────────────")
        for o in sorted(buys, key=lambda x: x["amount"], reverse=True):
            print(f"  🟢 BUY {o['fund']}: ₹{o['amount']:,.0f} (lump sum or increase SIP)")
    
    return orders


def main():
    parser = argparse.ArgumentParser(description="Portfolio Rebalancer")
    parser.add_argument("--holdings", type=str, help="Path to Kite MF holdings JSON")
    parser.add_argument("--ltcg-used", type=float, default=0, help="LTCG already booked this FY (₹)")
    args = parser.parse_args()
    
    if args.holdings:
        with open(args.holdings) as f:
            data = json.load(f)
    else:
        # Sample data — replace with actual Kite export
        print("ℹ️  No holdings file provided. Using sample data.")
        print("   Run with: python3 scripts/rebalance.py --holdings <kite_export.json>")
        data = [
            {"fund": "PARAG PARIKH FLEXI CAP FUND - DIRECT PLAN", "last_price": 89.76, "quantity": 2495.74, "average_price": 83.81},
            {"fund": "BANDHAN SMALL CAP FUND - DIRECT PLAN", "last_price": 52.31, "quantity": 3794.95, "average_price": 47.07},
        ]
    
    funds = parse_holdings(data)
    orders = calculate_rebalance(funds, ltcg_used=args.ltcg_used)
    
    print(f"\n{'='*70}")
    print(f"Tax reference: reference/tax-rules.md")
    print(f"SOP: plan/rebalancing-sop.md")
    print(f"{'='*70}")


if __name__ == "__main__":
    main()

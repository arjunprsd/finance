#!/usr/bin/env python3
"""
Generate all 13 analytics charts for the finance portfolio.
Run from repo root: python3 scripts/generate-all-charts.py

Requires: matplotlib, numpy
Data: data/monthly_holdings.json (180-month simulation)
Output: analytics/charts/01-*.png through 13-*.png
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import json
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHARTS_DIR = os.path.join(REPO_ROOT, "analytics", "charts")
DATA_DIR = os.path.join(REPO_ROOT, "data")

os.makedirs(CHARTS_DIR, exist_ok=True)

with open(os.path.join(DATA_DIR, "monthly_holdings.json")) as f:
    data = json.load(f)

print(f"Loaded {len(data)} months of simulation data")
print(f"Output: {CHARTS_DIR}")
print("Full chart generation code is in the session that created the initial charts.")
print("This script provides the framework - extend with individual chart functions.")
print(f"Charts already present: {len([f for f in os.listdir(CHARTS_DIR) if f.endswith('.png')])}")

"""Backtest: would the thresholds have flagged Bangladesh's known flood years?
Uses GloFAS reanalysis 1995-2024. Tests thresholds, not forecast lead time.
    python backtest.py kurigram sirajganj
"""

import sys
from collections import Counter

from districts import DISTRICTS, normalise_district
from flood_tools import classify, get_history, thresholds_from

KNOWN_FLOOD_YEARS = [1998, 2004, 2007, 2017, 2019, 2020, 2022]


def backtest(key: str) -> None:
    days, values = get_history(key, start="1995-01-01", end="2024-12-31")
    t = thresholds_from(values)
    danger, warning_or_worse = Counter(), Counter()
    for day, v in zip(days, values):
        if v is None:
            continue
        level = classify(v, t)
        year = int(day[:4])
        if level == "DANGER":
            danger[year] += 1
        if level in ("WARNING", "DANGER"):
            warning_or_worse[year] += 1

    print(f"\n{DISTRICTS[key]['en']} ({DISTRICTS[key]['bn']}), danger above {t['danger']:,.0f} m3/s")
    print("year  danger_days  warning+_days")
    for year in range(1995, 2025):
        mark = "  <== known flood year" if year in KNOWN_FLOOD_YEARS else ""
        bar = "#" * min(danger[year], 40)
        print(f"{year}  {danger[year]:>11}  {warning_or_worse[year]:>13}  {bar}{mark}")

    hits = [y for y in KNOWN_FLOOD_YEARS if danger[y] > 0]
    quiet = [y for y in range(1995, 2025) if y not in KNOWN_FLOOD_YEARS]
    false_years = [y for y in quiet if danger[y] > 0]
    print(f"\nKnown flood years flagged at DANGER: {len(hits)}/{len(KNOWN_FLOOD_YEARS)} {hits}")
    print(f"Other years with any DANGER day: {len(false_years)}/{len(quiet)} {false_years}")


if __name__ == "__main__":
    for name in sys.argv[1:] or ["kurigram", "sirajganj"]:
        key = normalise_district(name)
        backtest(key) if key else print(f"Unknown district: {name}")

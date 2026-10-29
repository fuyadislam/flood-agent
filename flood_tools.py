"""River-flood forecasts for all 64 districts of Bangladesh.

Data: Open-Meteo Global Flood API (GloFAS v4 simulated river discharge, free).
Each district's risk is judged against that river's own 30-year history
(1995-2024): WATCH = top 10% of days, WARNING = top 3%, DANGER = top 1%.

Run `python build_thresholds.py` once to save the thresholds to thresholds.json.

Testing: FLOOD_SIMULATE=WARNING forces every district to that level, and
FLOOD_SIMULATE=kurigram:DANGER forces just one district. Simulations are labelled.
"""

import json
import os
import statistics
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests
from strands import tool

from districts import DISTRICTS, normalise_district

FLOOD_API = "https://flood-api.open-meteo.com/v1/flood"
LEVELS = ["NORMAL", "WATCH", "WARNING", "DANGER"]
THRESHOLD_FILE = Path(__file__).with_name("thresholds.json")
HISTORY = ("2015-01-01", "2024-12-31")  # 10 years: fits the free API limit
MIN_RIVER_DANGER = 300  # m3/s: below this the monitored point is a small stream

_thresholds: dict[str, dict] = {}
if THRESHOLD_FILE.exists():
    _thresholds = json.loads(THRESHOLD_FILE.read_text())


def _get_daily(params: dict) -> tuple[list[str], dict]:
    resp = requests.get(FLOOD_API, params=params, timeout=60)
    resp.raise_for_status()
    daily = resp.json()["daily"]
    return daily["time"], daily


def point_for(key: str) -> tuple[float, float]:
    """The river point monitored for a district: the largest river near its
    headquarters (chosen by build_thresholds.py), else the headquarters itself."""
    saved = _thresholds.get(key, {})
    if "lat" in saved:
        return saved["lat"], saved["lon"]
    return DISTRICTS[key]["lat"], DISTRICTS[key]["lon"]


def get_history(key: str, lat: float | None = None, lon: float | None = None,
                start: str = HISTORY[0], end: str = HISTORY[1]):
    if lat is None:
        lat, lon = point_for(key)
    days, daily = _get_daily({"latitude": lat, "longitude": lon,
                              "daily": "river_discharge",
                              "start_date": start, "end_date": end})
    return days, daily["river_discharge"]


def thresholds_from(values: list[float | None]) -> dict:
    clean = [v for v in values if v is not None]
    cuts = statistics.quantiles(clean, n=100)
    return {"watch": cuts[89], "warning": cuts[96], "danger": cuts[98]}


def get_thresholds(key: str) -> dict:
    if "danger" not in _thresholds.get(key, {}):
        _thresholds.setdefault(key, {}).update(thresholds_from(get_history(key)[1]))
    return _thresholds[key]


def classify(discharge: float, t: dict) -> str:
    if discharge >= t["danger"]:
        return "DANGER"
    if discharge >= t["warning"]:
        return "WARNING"
    if discharge >= t["watch"]:
        return "WATCH"
    return "NORMAL"


def _simulated_level(key: str) -> str | None:
    sim = os.environ.get("FLOOD_SIMULATE", "").strip()
    if not sim:
        return None
    if ":" in sim:
        target, level = sim.split(":", 1)
        return level.upper() if target.strip().lower() == key and level.upper() in LEVELS else None
    return sim.upper() if sim.upper() in LEVELS else None


def assess_risk(district: str) -> dict:
    """16-day risk assessment for one district. Raises ValueError if unknown."""
    key = district if district in DISTRICTS else normalise_district(district)
    if key is None:
        raise ValueError(f"Unknown district '{district}'.")

    t = get_thresholds(key)
    lat, lon = point_for(key)
    days, daily = _get_daily({"latitude": lat, "longitude": lon,
                              "daily": "river_discharge,river_discharge_max",
                              "forecast_days": 16})
    small_river = t["danger"] < MIN_RIVER_DANGER
    rows = []
    level, peak_day, peak_value = "NORMAL", None, 0.0
    for day, mid, high in zip(days, daily["river_discharge"], daily["river_discharge_max"]):
        if mid is None:
            continue
        worst = high if high is not None else mid
        # The main forecast sets the level. The worst ensemble member can raise it by
        # one step only: cautious, but one wild ensemble member can't trigger DANGER.
        main_idx = LEVELS.index(classify(mid, t))
        worst_idx = LEVELS.index(classify(worst, t))
        day_level = LEVELS[main_idx if small_river else max(main_idx, min(worst_idx, main_idx + 1))]
        rows.append((day, mid, worst, day_level))
        if LEVELS.index(day_level) > LEVELS.index(level) or (day_level == level and worst > peak_value):
            level, peak_day, peak_value = day_level, day, worst

    # Tiny streams swing wildly in relative terms and are not what floods districts.
    if small_river and LEVELS.index(level) > LEVELS.index("WATCH"):
        level = "WATCH"

    simulated = False
    forced = _simulated_level(key)
    if forced:
        level, simulated = forced, True
        peak_day = rows[min(3, len(rows) - 1)][0] if rows else None

    return {"key": key, "level": level, "peak_day": peak_day, "peak_value": peak_value,
            "thresholds": t, "rows": rows, "simulated": simulated, "small_river": small_river}


def scan_country(max_workers: int = 4) -> list[dict]:
    """Assess every district. Returns results sorted by severity (worst first)."""
    def safe(key):
        try:
            return assess_risk(key)
        except requests.RequestException:
            return {"key": key, "level": "UNKNOWN", "peak_day": None, "simulated": False}

    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        results = list(pool.map(safe, DISTRICTS))
    order = {lvl: i for i, lvl in enumerate(LEVELS)}
    return sorted(results, key=lambda r: (-order.get(r["level"], -1), r["peak_day"] or ""))


def flood_risk_report(district: str) -> str:
    try:
        r = assess_risk(district)
    except ValueError as e:
        return str(e)
    d, t = DISTRICTS[r["key"]], r["thresholds"]
    header = (("SIMULATION (test mode, not a real forecast)\n" if r["simulated"] else "")
              + f"River outlook for {d['en']} ({d['division']} division), next 16 days.\n"
              f"Overall: {r['level']}" + (f", peaking around {r['peak_day']}." if r["peak_day"] else ".")
              + f"\nThresholds: watch {t['watch']:,.0f}, warning {t['warning']:,.0f}, "
              f"danger {t['danger']:,.0f} m3/s."
              + ("\nNote: the monitored point is a small stream, so alerts are capped at WATCH."
                 if r.get("small_river") else ""))
    lines = [f"{day}: {m:,.0f} m3/s (worst case {v:,.0f}) -> {lvl}" for day, m, v, lvl in r["rows"]]
    return header + "\n\nDaily forecast:\n" + "\n".join(lines)


@tool
def check_flood_risk(district: str) -> str:
    """Get the detailed technical river forecast (numbers, day by day) for a district
    of Bangladesh. Use only when someone asks for numbers or details. For "am I at
    risk" or "what should I do", use get_flood_guidance instead.

    Args:
        district: Any of the 64 districts, in English or Bengali, e.g. "Kurigram"
    """
    try:
        return flood_risk_report(district)
    except requests.RequestException as e:
        return f"The flood forecast service is unavailable ({e}). Do not guess the risk."


if __name__ == "__main__":
    import sys
    print(flood_risk_report(sys.argv[1] if len(sys.argv) > 1 else "kurigram"))

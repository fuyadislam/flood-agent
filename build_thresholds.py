"""Choose a river point and compute flood thresholds for all 64 districts of
Bangladesh, saving them to thresholds.json. Checks a 3x3 grid (~11 km apart)
around each headquarters and monitors the biggest river. Goes slowly to respect
the free API limit and saves after every district; rerun to retry failures.
"""

import json
import time

import requests

from districts import DISTRICTS
from flood_tools import FLOOD_API, THRESHOLD_FILE, get_history, thresholds_from

OFFSETS = (-0.1, 0.0, 0.1)
saved = json.loads(THRESHOLD_FILE.read_text()) if THRESHOLD_FILE.exists() else {}


def request_with_backoff(params):
    for wait in (0, 30, 60, 120):
        if wait:
            print(f"    rate limited, waiting {wait}s...")
            time.sleep(wait)
        resp = requests.get(FLOOD_API, params=params, timeout=60)
        if resp.status_code != 429:
            resp.raise_for_status()
            return resp.json()
    resp.raise_for_status()


def biggest_river_point(lat, lon):
    best = (lat, lon, -1.0)
    for dlat in OFFSETS:
        for dlon in OFFSETS:
            p_lat, p_lon = round(lat + dlat, 2), round(lon + dlon, 2)
            data = request_with_backoff({"latitude": p_lat, "longitude": p_lon,
                                         "daily": "river_discharge", "forecast_days": 7})
            values = [v for v in data["daily"]["river_discharge"] if v is not None]
            mean = sum(values) / len(values) if values else -1.0
            if mean > best[2]:
                best = (p_lat, p_lon, mean)
            time.sleep(0.3)
    return best


def history_with_backoff(key, lat, lon):
    for wait in (0, 30, 60, 120):
        if wait:
            print(f"    rate limited, waiting {wait}s...")
            time.sleep(wait)
        try:
            return get_history(key, lat, lon)[1]
        except requests.HTTPError as e:
            if e.response is None or e.response.status_code != 429:
                raise
    raise RuntimeError("still rate limited")


failed = []
for i, (key, d) in enumerate(DISTRICTS.items(), 1):
    if "danger" in saved.get(key, {}) and "lat" in saved[key]:
        print(f"[{i}/64] {d['en']}: already done")
        continue
    try:
        lat, lon, mean = biggest_river_point(d["lat"], d["lon"])
        twin = next((v for v in saved.values() if v.get("lat") == lat and v.get("lon") == lon), None)
        t = {k: twin[k] for k in ("watch", "warning", "danger")} if twin else thresholds_from(history_with_backoff(key, lat, lon))
        saved[key] = {"lat": lat, "lon": lon, **t}
        THRESHOLD_FILE.write_text(json.dumps(saved, indent=1))
        print(f"[{i}/64] {d['en']}: river point {lat},{lon}, "
              f"danger above {saved[key]['danger']:,.0f} m3/s")
    except Exception as e:
        failed.append(d["en"])
        print(f"[{i}/64] {d['en']}: FAILED ({e})")
        if "rate limited" in str(e) or "429" in str(e):
            print("The free API limit is used up for now. Run this script again in about an hour; finished districts are kept.")
            break
    time.sleep(10)

print(f"\nSaved {len(saved)} of 64 districts to {THRESHOLD_FILE.name}")
if failed:
    print("Failed: " + ", ".join(failed) + ". Run this script again to retry them.")

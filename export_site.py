"""Write docs/status.json for the BonnaSathi project website from a live scan of
all 64 districts of Bangladesh. Run after build_thresholds.py, then push to GitHub:
    python export_site.py
"""

import json
from datetime import datetime, timezone
from pathlib import Path

from flood_tools import scan_country

results = scan_country()
data = {
    "generated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    "districts": {r["key"]: {"level": r["level"], "peak_day": r.get("peak_day"),
                             "simulated": r.get("simulated", False)} for r in results},
}
Path("docs").mkdir(exist_ok=True)
Path("docs/status.json").write_text(json.dumps(data, indent=1, ensure_ascii=False))

counts = {}
for r in results:
    counts[r["level"]] = counts.get(r["level"], 0) + 1
print("Saved docs/status.json:", ", ".join(f"{k} {v}" for k, v in sorted(counts.items())))

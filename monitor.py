"""Proactive early warning: scan all 64 districts of Bangladesh and write alerts.
    python monitor.py
    FLOOD_SIMULATE=kurigram:DANGER python monitor.py
Output: alerts/<date>.md
"""

from datetime import date
from pathlib import Path

from districts import DISTRICTS
from flood_tools import scan_country
from guidance import ANNOUNCEMENT, format_date, build_national_summary

results = scan_country()
today = date.today().isoformat()
out = [f"# BonnaSathi flood alerts, {today}", ""]

for lang in ("bn", "en"):
    out += [build_national_summary(lang, results), ""]

for r in results:
    if r["level"] not in ANNOUNCEMENT:
        continue
    d = DISTRICTS[r["key"]]
    out.append(f"## {d['en']} / {d['bn']}: {r['level']}" + (" (SIMULATION)" if r["simulated"] else ""))
    for lang in ("bn", "en"):
        fill = {"district": d[lang], "peak_date": format_date(r["peak_day"], lang)}
        out += ["", ANNOUNCEMENT[r["level"]][lang].format(**fill)]
    out.append("")

Path("alerts").mkdir(exist_ok=True)
path = Path("alerts") / f"{today}.md"
path.write_text("\n".join(out))

alerting = [r for r in results if r["level"] in ANNOUNCEMENT]
print("\n".join(out))
print(f"\n{len(alerting)} district(s) need announcements. Saved to {path}")

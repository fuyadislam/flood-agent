"""Build district_shapes.json: simplified outlines of the 64 districts of Bangladesh.
Downloads the open bd-geojson package (geoBoundaries data, CC BY 4.0), checks its
fingerprint, merges upazilas into districts and simplifies them."""

import hashlib
import io
import json
import tarfile
import urllib.request

from shapely.geometry import shape
from shapely.ops import unary_union

from districts import DISTRICTS

URL = "https://registry.npmjs.org/bd-geojson/-/bd-geojson-1.0.5.tgz"
SHA256 = "cc69252600d7006e0cda768f92c75877b0c2015e36d4deedd1822dd53917f3d8"

raw = urllib.request.urlopen(URL, timeout=60).read()
if hashlib.sha256(raw).hexdigest() != SHA256:
    raise SystemExit("Download fingerprint does not match; refusing to use it.")
with tarfile.open(fileobj=io.BytesIO(raw)) as tar:
    geo = json.load(tar.extractfile("package/src/data/bangladesh.geojson"))

names = {}
for key, d in DISTRICTS.items():
    names[d["en"].lower()] = key
    for alias in d["aliases"]:
        names[alias] = key
names.update({"chittagong": "chattogram", "comilla": "cumilla", "jessore": "jashore", "bogra": "bogura",
              "barisal": "barishal", "cox's bazar": "coxsbazar", "netrakona": "netrokona",
              "jhalokati": "jhalokathi", "maulvibazar": "moulvibazar", "sirajgonj": "sirajganj"})

groups = {key: [] for key in DISTRICTS}
for feature in geo["features"]:
    geom = shape(feature["geometry"]).buffer(0)
    key = names.get((feature["properties"].get("district_name") or "").lower())
    if not key:
        p = geom.representative_point()
        key = min(DISTRICTS, key=lambda k: (DISTRICTS[k]["lat"] - p.y) ** 2 + ((DISTRICTS[k]["lon"] - p.x) * 0.92) ** 2)
    groups[key].append(geom)


def encode(ring):
    xs = [round(x * 100) for x, _ in ring]
    ys = [round(y * 100) for _, y in ring]
    out = [xs[0] - 8800, ys[0] - 2000]
    for i in range(1, len(ring)):
        out += [xs[i] - xs[i - 1], ys[i] - ys[i - 1]]
    return " ".join(map(str, out))


shapes = {}
for key, geoms in groups.items():
    merged = unary_union(geoms).buffer(0.003).buffer(-0.003).simplify(0.012, preserve_topology=True)
    polys = [merged] if merged.geom_type == "Polygon" else list(merged.geoms)
    rings = [[(round(x, 2), round(y, 2)) for x, y in p.exterior.coords] for p in polys if p.area > 0.0015]
    shapes[key] = "|".join(encode(r) for r in rings)

open("district_shapes.json", "w").write(json.dumps(shapes, separators=(",", ":")))
print(f"Saved district_shapes.json with {len(shapes)} districts")

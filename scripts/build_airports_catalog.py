#!/usr/bin/env python3
"""Import every OurAirports airport record and build static browser-friendly data.
Raw CSV retains every original field. Search JSON retains one row per valid location.
No route, schedule, timezone or immigration decision is inferred.
"""
from __future__ import annotations

import csv
import hashlib
import io
import json
import math
import os
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

BASE = "https://davidmegginson.github.io/ourairports-data/"
ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "ourairports" / "raw"
OUTPUT = ROOT / "data" / "airports-global"
FILES = ("airports.csv", "countries.csv", "regions.csv")
FIELDS = ("id", "ident", "type", "name", "latitude_deg", "longitude_deg",
          "iso_country", "municipality", "iata_code", "icao_code",
          "scheduled_service", "elevation_ft", "iso_region")
MIN_ROWS = 50000

def fetch_csv(name: str) -> bytes:
    if name not in FILES:
        raise ValueError("Unapproved upstream file")
    request = Request(BASE + name, headers={"User-Agent": "SojournNexus-AirportImport/1.0"})
    with urlopen(request, timeout=90) as response:
        data = response.read()
    if not data or b"," not in data[:400]:
        raise ValueError(f"Unexpected upstream CSV: {name}")
    return data

def rows_from_bytes(raw: bytes, name: str):
    text = raw.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    if name == "airports.csv" and not set(FIELDS).issubset(reader.fieldnames or []):
        raise ValueError("Upstream airport schema is missing required fields")
    return list(reader), reader.fieldnames

def clean_float(value: str, low: float, high: float):
    try:
        result = float(value)
    except (TypeError, ValueError):
        return None
    return round(result, 5) if math.isfinite(result) and low <= result <= high else None

def dump(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as file:
        json.dump(data, file, ensure_ascii=False, separators=(",", ":"))
        file.write("\n")

def build(source: dict[str, bytes]):
    all_rows, headers = rows_from_bytes(source["airports.csv"], "airports.csv")
    countries, _ = rows_from_bytes(source["countries.csv"], "countries.csv")
    regions, _ = rows_from_bytes(source["regions.csv"], "regions.csv")
    if len(all_rows) < MIN_ROWS:
        raise ValueError(f"Suspiciously small dataset: {len(all_rows)}")
    by_id, entries, bad_coordinates, types = set(), [], 0, Counter()
    for row in all_rows:
        key = row["id"].strip()
        if not key or key in by_id:
            raise ValueError(f"Missing or duplicate OurAirports ID: {key}")
        by_id.add(key)
        types[row["type"]] += 1
        lat = clean_float(row["latitude_deg"], -90, 90)
        lon = clean_float(row["longitude_deg"], -180, 180)
        if lat is None or lon is None:
            bad_coordinates += 1
            continue
        entries.append([
            int(key), row["ident"], row["type"], row["name"], lat, lon,
            row["iso_country"], row["municipality"], row["iata_code"],
            row["icao_code"], 1 if row["scheduled_service"].strip().lower() == "yes" else 0,
            row["elevation_ft"], row["iso_region"]
        ])
    # Prioritize scheduled-service airports for general browsing.
    entries.sort(key=lambda x: (-x[10], 0 if x[2] == "large_airport" else 1, x[3].casefold(), x[0]))
    clusters = defaultdict(lambda: [0, 0, 0, 0, 0])
    for entry in entries:
        typ, lat, lon, scheduled = entry[2], entry[4], entry[5], entry[10]
        # 4-degree grid: every valid geolocated record contributes exactly once.
        row = math.floor((lat + 90) / 4)
        col = math.floor((lon + 180) / 4)
        cell = clusters[(row, col)]
        cell[0] += 1
        cell[1] += scheduled
        cell[2] += int(typ in ("large_airport", "medium_airport"))
        cell[3] += lat
        cell[4] += lon
    cluster_rows = [[round(v[3] / v[0], 3), round(v[4] / v[0], 3), v[0], v[1], v[2]]
                    for _, v in sorted(clusters.items())]
    metadata = {
        "source": "OurAirports", "source_url": BASE + "airports.csv",
        "license": "Public domain", "generated_utc": datetime.now(timezone.utc).isoformat(),
        "total_source_airports": len(all_rows), "geolocated_airports": len(entries),
        "invalid_coordinate_rows": bad_coordinates,
        "scheduled_service_rows": sum(x[10] for x in entries),
        "country_rows": len(countries), "region_rows": len(regions),
        "types": dict(sorted(types.items())), "index_fields": list(FIELDS),
        "sources_sha256": {name: hashlib.sha256(raw).hexdigest() for name, raw in source.items()},
        "notes": "All raw airport records and fields preserved in CSV. Search index includes every record with valid coordinates. Scheduled service flag is not live route availability. Airport and country lists do not supply timezone, visa or ETA eligibility."
    }
    return entries, cluster_rows, metadata

def main():
    source = {name: fetch_csv(name) for name in FILES}
    entries, clusters, meta = build(source)
    RAW.mkdir(parents=True, exist_ok=True)
    for name, content in source.items():
        (RAW / name).write_bytes(content)
    dump(OUTPUT / "index.json", {"fields": list(FIELDS), "rows": entries})
    dump(OUTPUT / "clusters.json", {"fields": ["lat", "lon", "count", "scheduled", "large_or_medium"], "rows": clusters})
    dump(OUTPUT / "meta.json", meta)
    print(f"Imported {meta['total_source_airports']} raw airport rows; {len(entries)} geolocated; {len(clusters)} globe clusters.")
    print(f"Scheduled-service flag: {meta['scheduled_service_rows']}; source countries: {len(source['countries.csv'])} bytes")

if __name__ == "__main__":
    main()

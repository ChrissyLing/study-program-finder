#!/usr/bin/env python3
"""Add US News (National Universities) ranking for US universities.

Source:
- College Kickstart 2026 National Universities table (top ~50)
- Indiana Daily Student (IU Bloomington rank)
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "programs.json"

LAST_VERIFIED = "2026-06-02"
SYSTEM = "U.S. News Best Colleges — National Universities"

SOURCE_KICKSTART = "https://www.collegekickstart.com/blog/item/u-s-news-world-report-posts-2026-college-rankings"
SOURCE_IU = "https://www.idsnews.com/article/2025/09/iu-2026-college-rankings"

# Ranks are 2026 National Universities, including ties.
RANKS_2026 = {
    "Massachusetts Institute of Technology (MIT)": 2,
    "Harvard University": 3,
    "Stanford University": 4,
    "Yale University": 4,
    "Duke University": 7,
    "Johns Hopkins University": 7,
    "Northwestern University": 7,
    "University of Pennsylvania": 7,
    "Cornell University": 12,
    "Columbia University": 15,
    "University of California, Berkeley": 15,
    "University of California, Los Angeles (UCLA)": 17,
    "Carnegie Mellon University": 20,
    "Carnegie Mellon University (CMU)": 20,
    "University of Michigan": 20,
    "University of Michigan-Ann Arbor": 20,
    "Emory University": 24,
    "Georgetown University": 24,
    "University of Virginia": 26,
    "University of Southern California": 28,
    "University of Southern California (USC)": 28,
    "The University of Texas at Austin": 30,
    "Georgia Institute of Technology": 32,
    "New York University (NYU)": 32,
    "Boston College": 36,
    "University of Wisconsin-Madison": 36,
    "University of Washington": 42,
    # IU Bloomington is outside top-50 list; sourced separately.
    "Indiana University Bloomington": 73,
}


def choose_source(uni_en: str) -> str:
    if uni_en == "Indiana University Bloomington":
        return SOURCE_IU
    return SOURCE_KICKSTART


def normalize_name(name: str) -> str:
    return " ".join((name or "").strip().split())


def main() -> None:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    updated = 0
    missing = set()

    for program in data.get("programs", []):
        if program.get("region") != "US":
            continue

        uni = program.get("university") or {}
        uni_en = normalize_name(uni.get("name_en", ""))
        rank = RANKS_2026.get(uni_en)
        if rank is None:
            missing.add(uni_en)
            continue

        uni["us_rank"] = {
            "system": SYSTEM,
            "year": 2026,
            "rank": rank,
            "source_url": choose_source(uni_en),
            "last_verified": LAST_VERIFIED,
        }
        program["university"] = uni
        updated += 1

    data.setdefault("meta", {})["last_built_at"] = LAST_VERIFIED

    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Updated US rank for {updated} US programs")
    if missing:
        print("Missing ranks for:")
        for name in sorted(missing):
            if name:
                print("-", name)


if __name__ == "__main__":
    main()


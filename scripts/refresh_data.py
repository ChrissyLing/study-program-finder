#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Phase 1 Demo 数据刷新脚本（手动执行）

目标：
- 不做后端、不做定时任务
- 尽量自动刷新可变字段；遇到反爬/权限/结构变化：明确失败原因，不写入不可信数据

当前 Phase 1 仅实现：
- best-effort 刷新 QS 排名（从 topuniversities.com 的大学 profile 页抓取“QS World University Rankings”名次）

用法：
  python3 scripts/refresh_data.py --check-only
  python3 scripts/refresh_data.py --refresh-qs

注意：
- 该脚本不会“编造数据”。抓不到就跳过，并在终端输出原因。
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "programs.json"


@dataclass
class RefreshResult:
    program_id: str
    ok: bool
    message: str


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def today() -> str:
    return dt.date.today().isoformat()


def fetch_text(url: str, timeout: int = 25) -> str:
    # 延迟导入：避免在用户只做 check 时强依赖 requests
    import requests

    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; AimePhase1Demo/1.0; +https://aime)"
    }
    resp = requests.get(url, headers=headers, timeout=timeout)
    resp.raise_for_status()
    return resp.text


QS_RANK_RE = re.compile(r"#\s*(?:=)?\s*(\d+)\s*QS\s*World\s*University\s*Rankings", re.IGNORECASE)


def parse_qs_rank_from_topuniversities(html: str) -> int | None:
    # 经验：页面中会出现形如 “# 8QS World University Rankings” 或 “# =38QS World University Rankings”
    m = QS_RANK_RE.search(html)
    if not m:
        return None
    try:
        return int(m.group(1))
    except Exception:
        return None


def refresh_qs(data: dict) -> tuple[dict, list[RefreshResult]]:
    results: list[RefreshResult] = []

    for p in data.get("programs", []):
        pid = p.get("id", "<no-id>")
        qs = p.get("qs") or {}
        url = qs.get("source_url")

        if not url:
            results.append(RefreshResult(pid, False, "跳过：无 qs.source_url"))
            continue

        if "topuniversities.com" not in url:
            results.append(RefreshResult(pid, False, f"跳过：目前仅支持 topuniversities.com，当前={url}"))
            continue

        try:
            html = fetch_text(url)
        except Exception as e:
            results.append(RefreshResult(pid, False, f"抓取失败：{e}"))
            continue

        rank = parse_qs_rank_from_topuniversities(html)
        if rank is None:
            results.append(RefreshResult(pid, False, "解析失败：未找到 QS WUR 名次（页面结构可能变化）"))
            continue

        old = qs.get("rank")
        qs["rank"] = rank
        qs["last_verified"] = today()
        p["qs"] = qs

        if old == rank:
            results.append(RefreshResult(pid, True, f"QS 未变化：#{rank}"))
        else:
            results.append(RefreshResult(pid, True, f"QS 更新：{old} -> {rank}"))

    return data, results


def check_schema(data: dict) -> list[str]:
    errs: list[str] = []

    if "programs" not in data or not isinstance(data["programs"], list):
        errs.append("根字段 programs 缺失或不是 list")
        return errs

    must_program_keys = ["id", "region", "country", "city", "university", "program", "qs", "tuition", "duration", "website"]

    for i, p in enumerate(data["programs"]):
        for k in must_program_keys:
            if k not in p:
                errs.append(f"programs[{i}] 缺少字段：{k}")

        # minimal nested checks
        if isinstance(p.get("university"), dict):
            if not (p["university"].get("name_zh") or p["university"].get("name_en")):
                errs.append(f"programs[{i}] university.name_zh/name_en 均为空")
        else:
            errs.append(f"programs[{i}] university 不是对象")

        if isinstance(p.get("program"), dict):
            if not (p["program"].get("name_zh") or p["program"].get("name_en")):
                errs.append(f"programs[{i}] program.name_zh/name_en 均为空")
        else:
            errs.append(f"programs[{i}] program 不是对象")

        if isinstance(p.get("website"), dict):
            if not p["website"].get("program_url"):
                errs.append(f"programs[{i}] website.program_url 为空")
        else:
            errs.append(f"programs[{i}] website 不是对象")

    return errs


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-only", action="store_true", help="只做结构校验，不写回文件")
    parser.add_argument("--refresh-qs", action="store_true", help="刷新 QS 排名（best-effort）")

    args = parser.parse_args()

    if not DATA_PATH.exists():
        print(f"找不到数据文件：{DATA_PATH}", file=sys.stderr)
        return 2

    data = load_json(DATA_PATH)

    errs = check_schema(data)
    if errs:
        print("结构校验未通过：")
        for e in errs:
            print(f"- {e}")
        if args.check_only and not args.refresh_qs:
            return 1
        print("\n（仍将继续执行刷新步骤；但建议先修正结构问题）\n")

    if args.refresh_qs:
        data, results = refresh_qs(data)
        print("QS 刷新结果：")
        for r in results:
            status = "OK" if r.ok else "SKIP/FAIL"
            print(f"- [{status}] {r.program_id}: {r.message}")

    if args.check_only:
        print("\ncheck-only：不写回文件。")
        return 0

    # 默认行为：如果用户没有指定任何动作，就只提示
    if not args.refresh_qs:
        print("未指定动作。你可以用：--check-only 或 --refresh-qs")
        return 0

    save_json(DATA_PATH, data)
    print(f"\n已写回：{DATA_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

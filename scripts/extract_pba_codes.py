#!/usr/bin/env python3
"""Extract IRS Form 1120 Principal Business Activity codes into JSON."""

from __future__ import annotations

import datetime as dt
import json
import re
import subprocess
import tempfile
from pathlib import Path

import fitz


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "src" / "lib" / "irsCodes"
SOURCES = {
    2023: "https://www.irs.gov/pub/irs-prior/i1120--2023.pdf",
    2024: "https://www.irs.gov/pub/irs-prior/i1120--2024.pdf",
    2025: "https://www.irs.gov/pub/irs-pdf/i1120.pdf",
}
CODE_RE = re.compile(r"^\d{6}$")


def normalize_text(value: str) -> str:
    replacements = {
        "\u00a0": " ",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2013": "-",
        "\u2014": "-",
    }
    for before, after in replacements.items():
        value = value.replace(before, after)
    return re.sub(r"\s+", " ", value).strip()


def download_pdf(url: str) -> bytes:
    result = subprocess.run(
        ["curl", "-fsSL", url],
        check=True,
        capture_output=True,
    )
    return result.stdout


def revision_from(doc: fitz.Document) -> str:
    first_page = doc[0].get_text("text")
    match = re.search(r"\b(20\d{2})\s+Instructions for Form 1120\b", first_page)
    if not match:
        raise RuntimeError("Could not find printed Form 1120 instructions revision")
    return f"{match.group(1)} Instructions for Form 1120"


def pba_page_range(doc: fitz.Document) -> range:
    start: int | None = None
    end: int | None = None
    for index, page in enumerate(doc):
        text = page.get_text("text")
        if start is None and "Principal Business Activity Codes" in text and "associated codes" in text:
            start = index
        if "999000" in text and "Unclassified Establishments" in text:
            end = index
    if start is None or end is None or end < start:
        raise RuntimeError("Could not identify Principal Business Activity Codes appendix pages")
    return range(start, end + 1)


def page_lines(page: fitz.Page) -> list[dict[str, object]]:
    lines: list[dict[str, object]] = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            spans = line.get("spans", [])
            text = normalize_text("".join(span["text"] for span in spans))
            if not text:
                continue
            is_bold = any("Bold" in span.get("font", "") or span.get("flags", 0) & 16 for span in spans)
            lines.append(
                {
                    "text": text,
                    "x": float(line["bbox"][0]),
                    "y": float(line["bbox"][1]),
                    "bold": is_bold,
                },
            )
    return lines


def extract_codes(doc: fitz.Document) -> list[dict[str, str]]:
    codes: list[dict[str, str]] = []
    for page_index in pba_page_range(doc):
        lines = page_lines(doc[page_index])
        code_lines = [line for line in lines if CODE_RE.fullmatch(str(line["text"]))]
        column_xs = sorted({round(float(line["x"]), 1) for line in code_lines})

        for column_index, column_x in enumerate(column_xs):
            next_column_x = column_xs[column_index + 1] if column_index + 1 < len(column_xs) else 9999.0
            column_codes = sorted(
                [line for line in code_lines if abs(round(float(line["x"]), 1) - column_x) < 0.2],
                key=lambda line: float(line["y"]),
            )
            description_lines = [
                line
                for line in lines
                if not line["bold"]
                and not CODE_RE.fullmatch(str(line["text"]))
                and float(line["x"]) > column_x + 20
                and float(line["x"]) < next_column_x - 5
                and float(line["y"]) < 750
            ]
            for index, code_line in enumerate(column_codes):
                next_y = float(column_codes[index + 1]["y"]) if index + 1 < len(column_codes) else 750.0
                parts = [
                    str(line["text"])
                    for line in sorted(description_lines, key=lambda line: float(line["y"]))
                    if float(line["y"]) >= float(code_line["y"]) - 1 and float(line["y"]) < next_y - 0.5
                ]
                description = normalize_text(" ".join(parts))
                if not description:
                    raise RuntimeError(f"Could not extract description for {code_line['text']}")
                codes.append({"code": str(code_line["text"]), "description": description})

    seen: set[str] = set()
    for item in codes:
        if item["code"] in seen:
            raise RuntimeError(f"Duplicate PBA code extracted: {item['code']}")
        seen.add(item["code"])
    return codes


def extract_year(tax_year: int, source: str, retrieved_at: str) -> dict[str, object]:
    with tempfile.NamedTemporaryFile(suffix=".pdf") as temp:
        temp.write(download_pdf(source))
        temp.flush()
        doc = fitz.open(temp.name)
        revision = revision_from(doc)
        if not revision.startswith(str(tax_year)):
            raise RuntimeError(f"{source} printed revision {revision!r}, expected {tax_year}")
        return {
            "source": source,
            "revision": revision,
            "retrievedAt": retrieved_at,
            "codes": extract_codes(doc),
        }


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    retrieved_at = dt.datetime.now(dt.timezone.utc).date().isoformat()
    for tax_year, source in sorted(SOURCES.items()):
        payload = extract_year(tax_year, source, retrieved_at)
        out_path = OUT_DIR / f"pba-{tax_year}.json"
        out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n")
        print(f"{tax_year}: extracted {len(payload['codes'])} codes from {payload['revision']}")


if __name__ == "__main__":
    main()

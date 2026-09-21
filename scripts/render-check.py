#!/usr/bin/env python3
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path


def read_dpi() -> int:
    config = Path("src/config/filingPackage.ts").read_text(encoding="utf-8")
    match = re.search(r"FAX_RENDER_DPI\s*=\s*(\d+)", config)
    if not match:
        raise SystemExit("Could not read FAX_RENDER_DPI from src/config/filingPackage.ts")
    return int(match.group(1))


def fitz_text(doc):
    return [page.get_text("text") for page in doc]


def second_engine_text(pdf_path: Path):
    pdftotext = shutil.which("pdftotext")
    if pdftotext:
        pages = []
        for page_num in range(1, page_count(pdf_path) + 1):
            proc = subprocess.run(
                [pdftotext, "-f", str(page_num), "-l", str(page_num), str(pdf_path), "-"],
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            if proc.returncode != 0:
                raise SystemExit(f"pdftotext failed on page {page_num}: {proc.stderr.strip()}")
            pages.append(proc.stdout)
        return "pdftotext", pages

    try:
        from pypdf import PdfReader

        reader = PdfReader(str(pdf_path))
        return "pypdf", [(page.extract_text() or "") for page in reader.pages]
    except ImportError:
        pass

    try:
        from pdfminer.high_level import extract_text

        return "pdfminer", extract_text(str(pdf_path)).split("\f")
    except ImportError:
        raise SystemExit("No second text engine available: install pdftotext, pypdf, or pdfminer.")


def page_count(pdf_path: Path) -> int:
    import fitz

    with fitz.open(pdf_path) as doc:
        return doc.page_count


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def check_text(expectations, engines):
    for item in expectations:
        page_index = int(item["page"]) - 1
        value = normalize(str(item["value"]))
        label = item.get("label", value)
        for engine_name, pages in engines.items():
            if page_index < 0 or page_index >= len(pages):
                raise SystemExit(f"{label}: page {page_index + 1} missing in {engine_name}")
            haystack = normalize(pages[page_index])
            if value not in haystack:
                raise SystemExit(f"{label}: expected text not found on page {page_index + 1} using {engine_name}: {value}")


def dark_ratio(pix, rect):
    x, y, w, h = [int(round(v)) for v in rect]
    x = max(0, min(x, pix.width - 1))
    y = max(0, min(y, pix.height - 1))
    w = max(1, min(w, pix.width - x))
    h = max(1, min(h, pix.height - y))
    samples = 0
    dark = 0
    components = pix.n
    data = pix.samples
    for yy in range(y, y + h):
        row = yy * pix.stride
        for xx in range(x, x + w):
            offset = row + xx * components
            r = data[offset]
            g = data[offset + 1]
            b = data[offset + 2]
            if (r + g + b) / 3 < 120:
                dark += 1
            samples += 1
    return dark / samples


def check_checkboxes(doc, expectations, dpi):
    pixmaps = {}
    for item in expectations:
        page = int(item["page"])
        if page not in pixmaps:
            pixmaps[page] = doc[page - 1].get_pixmap(dpi=dpi, alpha=False)
        ratio = dark_ratio(pixmaps[page], item["rect"])
        checked = bool(item["checked"])
        threshold = float(item.get("threshold", 0.02))
        label = item.get("label", "checkbox")
        if checked and ratio <= threshold:
            raise SystemExit(f"{label}: expected checked on page {page}, dark ratio {ratio:.4f} <= {threshold:.4f}")
        if not checked and ratio >= threshold:
            raise SystemExit(f"{label}: expected empty on page {page}, dark ratio {ratio:.4f} >= {threshold:.4f}")


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: render-check.py GENERATED.pdf EXPECTED.json")

    try:
        import fitz
    except ImportError:
        raise SystemExit("PyMuPDF (fitz) is required for render-check.py")

    pdf_path = Path(sys.argv[1])
    expected_path = Path(sys.argv[2])
    expected = json.loads(expected_path.read_text(encoding="utf-8"))
    dpi = read_dpi()

    with fitz.open(pdf_path) as doc:
        engines = {"fitz": fitz_text(doc)}
        second_name, second_pages = second_engine_text(pdf_path)
        engines[second_name] = second_pages
        check_text(expected.get("text", []), engines)
        check_checkboxes(doc, expected.get("checkboxes", []), dpi)
        print(f"render-check ok: {pdf_path} ({doc.page_count} pages, dpi={dpi}, second={second_name})")


if __name__ == "__main__":
    main()

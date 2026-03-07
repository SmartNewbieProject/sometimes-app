#!/usr/bin/env python3
"""SVG quality checker for SmartNewbie icon pipeline.

Validates SVG files against brand rules and returns a JSON report.

Usage:
    python3 quality-check.py icon.svg --config brand-config.json

Output:
    {"pass": true, "score": 85, "issues": [], "warnings": ["path count: 5/8"]}
"""

import argparse
import json
import os
import re
import sys
import xml.etree.ElementTree as ET


def load_config(path: str) -> dict:
    with open(path) as f:
        return json.load(f)


def strip_ns(tag: str) -> str:
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


def collect_elements(root: ET.Element) -> list:
    """Collect all elements recursively."""
    elements = []
    for child in root:
        elements.append(child)
        elements.extend(collect_elements(child))
    return elements


def check_quality(svg_path: str, config: dict) -> dict:
    issues = []
    warnings = []
    score = 100
    rules = config.get("rules", {})

    # Read file
    with open(svg_path) as f:
        svg_text = f.read()

    # File size check
    file_size = os.path.getsize(svg_path)
    max_size = rules.get("maxFileSize", 2048)
    if file_size > max_size:
        issues.append(f"file size {file_size}B exceeds max {max_size}B")
        score -= 20
    elif file_size > max_size * 0.8:
        warnings.append(f"file size {file_size}B approaching limit {max_size}B")
        score -= 5

    # Parse SVG
    try:
        root = ET.fromstring(svg_text)
    except ET.ParseError as e:
        return {"pass": False, "score": 0, "issues": [f"invalid SVG: {e}"], "warnings": []}

    # Root tag check
    if strip_ns(root.tag) != "svg":
        return {"pass": False, "score": 0, "issues": ["root element is not <svg>"], "warnings": []}

    all_elements = collect_elements(root)

    # Required attributes
    for attr in rules.get("requiredAttributes", []):
        if attr == "xmlns":
            has_xmlns = (
                "xmlns" in root.attrib
                or root.tag.startswith("{http://www.w3.org/2000/svg}")
            )
            if not has_xmlns:
                issues.append("missing xmlns attribute")
                score -= 15
        elif attr not in root.attrib:
            issues.append(f"missing required attribute: {attr}")
            score -= 15

    # ViewBox format check
    view_box = root.get("viewBox", "")
    expected_vb = config.get("viewBox", "0 0 64 64")
    if view_box != expected_vb:
        warnings.append(f"viewBox '{view_box}' differs from expected '{expected_vb}'")
        score -= 5

    # Forbidden elements
    forbidden_elements = set(rules.get("forbiddenElements", []))
    for elem in all_elements:
        tag = strip_ns(elem.tag)
        if tag in forbidden_elements:
            issues.append(f"forbidden element: <{tag}>")
            score -= 15

    # Forbidden attributes
    forbidden_attrs = rules.get("forbiddenAttributes", [])
    for elem in [root] + all_elements:
        for attr in elem.attrib:
            attr_local = strip_ns(attr)
            for fa in forbidden_attrs:
                if fa.endswith("*"):
                    if attr_local.startswith(fa[:-1]):
                        warnings.append(f"forbidden attribute: {attr_local} on <{strip_ns(elem.tag)}>")
                        score -= 3
                elif attr_local == fa:
                    warnings.append(f"forbidden attribute: {attr_local} on <{strip_ns(elem.tag)}>")
                    score -= 3

    # Path count
    max_paths = rules.get("maxPaths", 8)
    paths = [e for e in all_elements if strip_ns(e.tag) == "path"]
    path_count = len(paths)
    if path_count > max_paths:
        issues.append(f"path count {path_count} exceeds max {max_paths}")
        score -= 10
    elif path_count > max_paths * 0.6:
        warnings.append(f"path count: {path_count}/{max_paths}")

    # Background rect detection
    for elem in all_elements:
        tag = strip_ns(elem.tag)
        if tag == "rect":
            x = elem.get("x", "0")
            y = elem.get("y", "0")
            w = elem.get("width", "0")
            h = elem.get("height", "0")
            fill = elem.get("fill", "")
            # Detect full-size background rect
            if x == "0" and y == "0" and fill and fill.lower() != "none":
                try:
                    vb_parts = view_box.split()
                    vb_w, vb_h = vb_parts[2], vb_parts[3]
                    if w == vb_w and h == vb_h:
                        issues.append("background rect detected (should be transparent)")
                        score -= 15
                except (IndexError, ValueError):
                    pass

    # Path complexity (d attribute length)
    total_d_length = 0
    for path in paths:
        d = path.get("d", "")
        total_d_length += len(d)

    if total_d_length > 3000:
        warnings.append(f"high path complexity: {total_d_length} chars total")
        score -= 5
    elif total_d_length > 5000:
        issues.append(f"excessive path complexity: {total_d_length} chars total")
        score -= 15

    # Width/height on root (should use viewBox only)
    if "width" in root.attrib or "height" in root.attrib:
        warnings.append("width/height attributes present (prefer viewBox only)")
        score -= 3

    # Stroke attributes (filled style should have none)
    for elem in [root] + all_elements:
        if elem.get("stroke") and elem.get("stroke") != "none":
            warnings.append(f"stroke attribute on <{strip_ns(elem.tag)}> (filled style)")
            score -= 3

    # Clamp score
    score = max(0, min(100, score))

    return {
        "pass": len(issues) == 0 and score >= 70,
        "score": score,
        "issues": issues,
        "warnings": warnings,
    }


def main():
    parser = argparse.ArgumentParser(description="Check SVG icon quality")
    parser.add_argument("input", help="SVG file to check")
    parser.add_argument("--config", required=True, help="Brand config JSON path")

    args = parser.parse_args()
    config = load_config(args.config)
    result = check_quality(args.input, config)

    print(json.dumps(result, indent=2, ensure_ascii=False))

    sys.exit(0 if result["pass"] else 1)


if __name__ == "__main__":
    main()

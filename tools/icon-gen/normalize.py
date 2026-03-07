#!/usr/bin/env python3
"""SVG normalizer for SmartNewbie icon pipeline.

Normalizes SVG files to match brand standards:
- Unified viewBox
- currentColor fill
- Removal of forbidden elements/attributes
- Clean formatting

Usage:
    python3 normalize.py input.svg --config brand-config.json --output output.svg
    echo "<svg>...</svg>" | python3 normalize.py --stdin --config brand-config.json
"""

import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET

SVG_NS = "http://www.w3.org/2000/svg"
XLINK_NS = "http://www.w3.org/1999/xlink"


def load_config(path: str) -> dict:
    with open(path) as f:
        return json.load(f)


def strip_ns_prefix(tag: str) -> str:
    """Remove namespace URI prefix from tag name."""
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


def normalize_svg(svg_text: str, config: dict) -> str:
    # Register namespaces to avoid ns0: prefixes
    ET.register_namespace("", SVG_NS)
    ET.register_namespace("xlink", XLINK_NS)

    # Parse SVG
    try:
        root = ET.fromstring(svg_text.strip())
    except ET.ParseError as e:
        print(f"Error: Invalid SVG - {e}", file=sys.stderr)
        sys.exit(1)

    # Ensure root is <svg>
    if strip_ns_prefix(root.tag) != "svg":
        print("Error: Root element is not <svg>", file=sys.stderr)
        sys.exit(1)

    # 1. Set viewBox
    view_box = config.get("viewBox", "0 0 64 64")
    root.set("viewBox", view_box)

    # 2. Set xmlns
    root.set("xmlns", SVG_NS)

    # 3. Remove width/height (use viewBox only)
    for attr in ["width", "height"]:
        if attr in root.attrib:
            del root.attrib[attr]

    # 4. Build forbidden sets from config
    rules = config.get("rules", {})
    forbidden_elements = set(rules.get("forbiddenElements", []))
    forbidden_attr_patterns = []
    for attr in rules.get("forbiddenAttributes", []):
        if attr.endswith("*"):
            forbidden_attr_patterns.append(attr[:-1])
        else:
            forbidden_attr_patterns.append(attr)

    # 5. Remove forbidden elements recursively
    remove_elements = forbidden_elements | {"metadata", "title", "desc"}
    _remove_elements_recursive(root, remove_elements)

    # Remove empty <defs>
    for defs in root.findall(f"{{{SVG_NS}}}defs"):
        if len(defs) == 0 and not defs.text:
            root.remove(defs)
    for defs in root.findall("defs"):
        if len(defs) == 0 and not defs.text:
            root.remove(defs)

    # 6. Clean attributes on all elements
    fill_value = config.get("fill", "currentColor")
    _clean_attributes_recursive(root, forbidden_attr_patterns, fill_value)

    # 7. Serialize with clean formatting
    output = _serialize_svg(root)

    return output


def _remove_elements_recursive(parent: ET.Element, forbidden: set):
    """Remove forbidden child elements recursively."""
    to_remove = []
    for child in parent:
        tag = strip_ns_prefix(child.tag)
        if tag in forbidden:
            to_remove.append(child)
        else:
            _remove_elements_recursive(child, forbidden)
    for child in to_remove:
        parent.remove(child)


def _clean_attributes_recursive(elem: ET.Element, forbidden_patterns: list, fill_value: str):
    """Clean forbidden attributes and normalize fill on all elements."""
    tag = strip_ns_prefix(elem.tag)

    # Remove forbidden attributes
    to_remove = []
    for attr in elem.attrib:
        attr_local = strip_ns_prefix(attr)
        for pattern in forbidden_patterns:
            if pattern.endswith("-"):
                if attr_local.startswith(pattern):
                    to_remove.append(attr)
            elif attr_local == pattern:
                to_remove.append(attr)
        # Also remove inline style
        if attr_local == "style":
            to_remove.append(attr)
    for attr in to_remove:
        del elem.attrib[attr]

    # Normalize fill on path/circle/rect/polygon/ellipse elements
    shape_tags = {"path", "circle", "rect", "polygon", "ellipse", "g"}
    if tag in shape_tags:
        current_fill = elem.get("fill", "")
        # Don't override "none" fill (used for compound paths)
        if current_fill != "none":
            # Replace specific colors with currentColor
            if current_fill and current_fill.lower() not in ("currentcolor", "none"):
                elem.set("fill", fill_value)

    # Remove stroke attributes for filled style
    for attr in ["stroke", "stroke-width", "stroke-linecap", "stroke-linejoin",
                 "stroke-dasharray", "stroke-dashoffset", "stroke-opacity"]:
        if attr in elem.attrib:
            # Keep stroke="none" or remove all stroke attrs
            del elem.attrib[attr]

    # Recurse into children
    for child in elem:
        _clean_attributes_recursive(child, forbidden_patterns, fill_value)


def _serialize_svg(root: ET.Element) -> str:
    """Serialize SVG element to clean string."""
    raw = ET.tostring(root, encoding="unicode")

    # Clean up namespace declarations that ET may add
    raw = re.sub(r'\s+xmlns:ns\d+="[^"]*"', "", raw)
    raw = re.sub(r'ns\d+:', "", raw)

    # Ensure proper xmlns on root
    if 'xmlns="http://www.w3.org/2000/svg"' not in raw:
        raw = raw.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ', 1)

    # Remove duplicate xmlns
    parts = raw.split('xmlns="http://www.w3.org/2000/svg"')
    if len(parts) > 2:
        raw = parts[0] + 'xmlns="http://www.w3.org/2000/svg"' + "".join(parts[1:]).replace('xmlns="http://www.w3.org/2000/svg"', "")

    # Simple indent formatting
    raw = raw.replace("><", ">\n<")
    lines = raw.split("\n")
    formatted = []
    indent = 0
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line.startswith("</"):
            indent = max(0, indent - 1)
            formatted.append("  " * indent + line)
        elif line.startswith("<") and not line.startswith("<?") and "/>" not in line and "</" not in line:
            formatted.append("  " * indent + line)
            indent += 1
        else:
            formatted.append("  " * indent + line)
            if "/>" in line:
                pass  # self-closing, no indent change

    return "\n".join(formatted) + "\n"


def main():
    parser = argparse.ArgumentParser(description="Normalize SVG icons to brand standards")
    parser.add_argument("input", nargs="?", help="Input SVG file path")
    parser.add_argument("--stdin", action="store_true", help="Read SVG from stdin")
    parser.add_argument("--config", required=True, help="Brand config JSON path")
    parser.add_argument("--output", "-o", help="Output file path (default: stdout)")

    args = parser.parse_args()

    config = load_config(args.config)

    if args.stdin:
        svg_text = sys.stdin.read()
    elif args.input:
        with open(args.input) as f:
            svg_text = f.read()
    else:
        parser.error("Either provide input file or use --stdin")

    result = normalize_svg(svg_text, config)

    if args.output:
        with open(args.output, "w") as f:
            f.write(result)
        print(f"Normalized SVG written to {args.output}", file=sys.stderr)
    else:
        print(result, end="")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Gemini API image generator for SmartNewbie icon pipeline.

Generates soft 3D render style icon images with style-matched reference images,
then removes background.

Usage:
    python3 generate-image.py --name heart --desc "A puffy 3D heart" --output /tmp/heart.png
    python3 generate-image.py --name heart --desc "A puffy 3D heart" --no-ref
    python3 generate-image.py --name heart --desc "A puffy 3D heart" --no-bg-remove

Environment:
    GEMINI_API_KEY - Required. Google AI API key.
"""

import argparse
import base64
import json
import mimetypes
import os
import subprocess
import sys
import urllib.request
import urllib.error

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
DEFAULT_MODEL = "gemini-2.0-flash-exp-image-generation"
FALLBACK_MODELS = [
    "gemini-2.5-flash-image",
    "gemini-3.1-flash-image-preview",
    "gemini-3-pro-image-preview",
]

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
DEFAULT_TEMPLATE = os.path.join(SCRIPT_DIR, "image-prompt-template.txt")

# Fixed reference image set — representative app assets for style matching
REFERENCE_IMAGES = [
    os.path.join(PROJECT_ROOT, "assets/images/heart-arrow.png"),
    os.path.join(PROJECT_ROOT, "assets/images/drink.png"),
]

NEGATIVE_PROMPT = (
    "Do NOT include: text, labels, watermarks, signatures, "
    "realistic photographic style, sharp harsh edges, dark moody lighting, "
    "grungy noisy texture, low quality, blurry, multiple objects, "
    "busy background, UI elements, outlines or wireframes, "
    "saturated/vivid purple, neon colors."
)

REFERENCE_INSTRUCTION = (
    "IMPORTANT: Match the EXACT visual style of the reference images above. "
    "Specifically match their: smooth porcelain/marshmallow surface texture, "
    "soft diffused lighting direction, very pale lavender-white color tone, "
    "gentle glossy highlight placement, and minimal shadow style. "
    "The new icon must look like it belongs in the same icon set."
)


def load_prompt_template(path: str) -> str:
    with open(path) as f:
        return f.read().strip()


def build_prompt(template: str, name: str, description: str) -> str:
    prompt = template.replace("{icon_name}", name).replace("{description}", description)
    return f"{prompt}\n\n{REFERENCE_INSTRUCTION}\n\n{NEGATIVE_PROMPT}"


def encode_image(path: str) -> tuple[str, str]:
    """Read and base64-encode an image file. Returns (base64_data, mime_type)."""
    mime, _ = mimetypes.guess_type(path)
    if not mime:
        ext = os.path.splitext(path)[1].lower()
        mime = {"png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}.get(ext, "image/png")
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode()
    return data, mime


def build_request_parts(prompt: str, ref_images: list[str]) -> list[dict]:
    """Build multimodal request parts: reference images + text prompt."""
    parts = []

    for img_path in ref_images:
        if os.path.exists(img_path):
            data, mime = encode_image(img_path)
            parts.append({"inlineData": {"mimeType": mime, "data": data}})
        else:
            print(f"Warning: reference image not found: {img_path}", file=sys.stderr)

    parts.append({"text": prompt})
    return parts


def generate_image(prompt: str, api_key: str, ref_images: list[str], model: str = DEFAULT_MODEL) -> bytes | None:
    """Call Gemini API with reference images + text prompt. Returns PNG bytes or None."""
    url = API_URL.format(model=model, key=api_key)

    parts = build_request_parts(prompt, ref_images)

    payload = json.dumps({
        "contents": [{"parts": parts}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
    }).encode()

    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            err = json.loads(body)
            msg = err.get("error", {}).get("message", body[:200])
        except json.JSONDecodeError:
            msg = body[:200]
        print(f"API error ({e.code}): {msg}", file=sys.stderr)
        return None
    except urllib.error.URLError as e:
        print(f"Network error: {e}", file=sys.stderr)
        return None

    parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    for part in parts:
        if "inlineData" in part:
            return base64.b64decode(part["inlineData"]["data"])

    text_parts = [p["text"] for p in parts if "text" in p]
    if text_parts:
        print(f"No image generated. Model response: {text_parts[0][:300]}", file=sys.stderr)
    return None


def remove_background(input_path: str, output_path: str) -> bool:
    """Remove background using rembg CLI. Returns True on success."""
    try:
        result = subprocess.run(
            ["rembg", "i", input_path, output_path],
            capture_output=True, text=True, timeout=120,
        )
        if result.returncode == 0:
            return True
        print(f"rembg error: {result.stderr[:200]}", file=sys.stderr)
        return False
    except FileNotFoundError:
        print("rembg not found. Install: pipx install rembg[cli] && pipx inject rembg onnxruntime", file=sys.stderr)
        return False
    except subprocess.TimeoutExpired:
        print("rembg timeout (120s)", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(description="Generate icon image via Gemini API")
    parser.add_argument("--name", required=True, help="Icon name")
    parser.add_argument("--desc", required=True, help="Icon description")
    parser.add_argument("--output", "-o", default="/tmp/icon-generated.png", help="Output PNG path")
    parser.add_argument("--prompt-template", default=DEFAULT_TEMPLATE, help="Prompt template file path")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Gemini model name")
    parser.add_argument("--retries", type=int, default=2, help="Max retry count")
    parser.add_argument("--no-bg-remove", action="store_true", help="Skip background removal")
    parser.add_argument("--no-ref", action="store_true", help="Skip reference images (text-only prompt)")

    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable is required", file=sys.stderr)
        sys.exit(1)

    template = load_prompt_template(args.prompt_template)
    prompt = build_prompt(template, args.name, args.desc)

    ref_images = [] if args.no_ref else REFERENCE_IMAGES
    ref_count = sum(1 for r in ref_images if os.path.exists(r))
    if ref_images:
        print(f"Using {ref_count} reference image(s) for style matching", file=sys.stderr)

    # Generate with retries and fallback models
    models_to_try = [args.model] + [m for m in FALLBACK_MODELS if m != args.model]
    img_bytes = None
    used_model = None

    for model in models_to_try:
        for attempt in range(args.retries + 1):
            label = f"[{model}] attempt {attempt + 1}/{args.retries + 1}"
            print(f"{label}: generating...", file=sys.stderr)
            img_bytes = generate_image(prompt, api_key, ref_images, model)
            if img_bytes:
                used_model = model
                break
        if img_bytes:
            break
        print(f"Model {model} failed, trying next...", file=sys.stderr)

    if not img_bytes:
        print("Error: All models failed to generate image", file=sys.stderr)
        sys.exit(1)

    # Save raw image
    raw_path = args.output.replace(".png", "-raw.png") if not args.no_bg_remove else args.output
    with open(raw_path, "wb") as f:
        f.write(img_bytes)

    # Background removal
    bg_removed = False
    if not args.no_bg_remove:
        print("Removing background...", file=sys.stderr)
        bg_removed = remove_background(raw_path, args.output)
        if not bg_removed:
            print("Background removal failed, using raw image", file=sys.stderr)
            with open(args.output, "wb") as f:
                f.write(img_bytes)

    final_size = os.path.getsize(args.output)
    print(json.dumps({
        "path": args.output,
        "size": final_size,
        "size_human": f"{final_size / 1024:.1f}KB",
        "model": used_model,
        "bg_removed": bg_removed,
        "ref_images_used": ref_count,
    }))


if __name__ == "__main__":
    main()

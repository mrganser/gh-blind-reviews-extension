#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ON_SVG="$ROOT_DIR/design/icons/on.svg"
OFF_SVG="$ROOT_DIR/design/icons/off.svg"

if ! command -v rsvg-convert >/dev/null 2>&1; then
  echo "Error: rsvg-convert is required. Install librsvg (e.g. 'brew install librsvg')." >&2
  exit 1
fi

if [ ! -f "$ON_SVG" ] || [ ! -f "$OFF_SVG" ]; then
  echo "Error: Missing source SVG files in $ROOT_DIR/design/icons." >&2
  exit 1
fi

mkdir -p "$ROOT_DIR/public/icons/off"

for size in 16 48 128; do
  rsvg-convert -w "$size" -h "$size" "$ON_SVG" -o "$ROOT_DIR/public/icons/icon${size}.png"
  rsvg-convert -w "$size" -h "$size" "$OFF_SVG" -o "$ROOT_DIR/public/icons/off/icon${size}.png"
done

echo "Generated ON icons in public/icons/icon*.png and OFF icons in public/icons/off/"

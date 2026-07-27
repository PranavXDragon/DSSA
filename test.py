import sys
import os
from PIL import Image, ImageDraw, ImageFont

font_path = sys.argv[1] if len(sys.argv) > 1 else os.getenv("FONT_PATH", "C:/Windows/Fonts/bahnschrift.ttf" if os.name == "nt" else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
try:
    fnt = ImageFont.truetype(font_path, 22)
except Exception as e:
    try:
        fnt = ImageFont.load_default()
        print(f"Warning: Could not load {font_path} ({e}), using default font.")
    except Exception as e2:
        raise RuntimeError(f"Failed to load font from {font_path} and default fallback failed: {e2}")

print(fnt.getlength('Niyatee Pandurang Mohadikar'))

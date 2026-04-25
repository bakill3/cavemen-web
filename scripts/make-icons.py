#!/usr/bin/env python3
"""Rasterize assets/icon.svg into 16/32/48/128 PNGs.

Prefers ImageMagick (`convert`) for proper anti-aliasing. Falls back to a
pure-stdlib placeholder generator (no Pillow dependency) when convert is
absent - useful for CI containers that don't have ImageMagick installed.
"""
import os
import shutil
import struct
import subprocess
import sys
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
SVG = os.path.join(ROOT, "assets", "icon.svg")
OUT_DIR = os.path.join(ROOT, "assets")
SIZES = (16, 32, 48, 128)


def rasterize_with_convert():
    convert = shutil.which("convert") or shutil.which("magick")
    if not convert:
        return False
    if not os.path.exists(SVG):
        print(f"[icons] missing {SVG}", file=sys.stderr)
        return False
    for s in SIZES:
        out = os.path.join(OUT_DIR, f"icon{s}.png")
        cmd = [
            convert,
            "-background", "none",
            "-density", "384",
            "-resize", f"{s}x{s}",
            "-depth", "8",
            SVG,
            f"PNG32:{out}",
        ]
        subprocess.check_call(cmd)
        print(f"[icons] wrote {out}")
    return True


# ---------- pure-stdlib fallback (flat disc, no SVG required) ----------
BG = (40, 34, 28, 255)
RING = (90, 74, 54, 255)
FG = (243, 217, 154, 255)
TRANSPARENT = (0, 0, 0, 0)


def write_png(path, pixels, w, h):
    raw = b""
    for y in range(h):
        raw += b"\x00"
        for x in range(w):
            r, g, b, a = pixels[y * w + x]
            raw += bytes((r, g, b, a))
    compressor = zlib.compressobj(9)
    idat = compressor.compress(raw) + compressor.flush()

    def chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    out = sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(out)


def make_disc(size):
    px = [TRANSPARENT] * (size * size)
    cx = cy = (size - 1) / 2.0
    r_outer = size / 2.0 - 0.5
    r_inner = r_outer - max(1.0, size * 0.08)
    for y in range(size):
        for x in range(size):
            dx, dy = x - cx, y - cy
            d = (dx * dx + dy * dy) ** 0.5
            if d <= r_inner:
                px[y * size + x] = BG
            elif d <= r_outer:
                px[y * size + x] = RING
    if size >= 16:
        stroke = max(2.0, size * 0.16)
        r_mid = r_inner - max(1.5, size * 0.14)
        r_lo = r_mid - stroke
        for y in range(size):
            for x in range(size):
                dx, dy = x - cx, y - cy
                d = (dx * dx + dy * dy) ** 0.5
                if r_lo <= d <= r_mid and not (dx > 0 and abs(dy) < stroke):
                    px[y * size + x] = FG
    return px


def fallback():
    os.makedirs(OUT_DIR, exist_ok=True)
    for size in SIZES:
        out = os.path.join(OUT_DIR, f"icon{size}.png")
        write_png(out, make_disc(size), size, size)
        print(f"[icons:fallback] wrote {out}")


def main():
    if not rasterize_with_convert():
        print("[icons] convert not found - using pure-Python fallback", file=sys.stderr)
        fallback()


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw

def create_svg():
    return """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="rareGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="50%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#CA8A04" />
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181A20" />
      <stop offset="100%" stop-color="#090A0D" />
    </linearGradient>
    <linearGradient id="cardMat" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E2029" />
      <stop offset="100%" stop-color="#121318" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#EAB308" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Base Obsidian Squircle -->
  <rect x="2" y="2" width="60" height="60" rx="15" fill="url(#bgGrad)" stroke="#262833" stroke-width="1.5" />

  <!-- Collectible Card Silhouette (2:3 Aspect Ratio) with Golden Edge -->
  <rect x="11.5" y="8" width="41" height="48" rx="5" fill="url(#cardMat)" stroke="url(#rareGold)" stroke-width="2" filter="url(#glow)" />

  <!-- Precision Card Inner Inset Line -->
  <rect x="14.5" y="11" width="35" height="42" rx="3.5" fill="none" stroke="#2D303E" stroke-width="0.8" opacity="0.8" />

  <!-- Bold Modern 'R' Emblem -->
  <!-- Vertical Pillar -->
  <rect x="22" y="19" width="4.5" height="26" rx="1" fill="#FFFFFF" />

  <!-- Upper Bowl of 'R' -->
  <path d="M 22 19 L 34 19 C 38.5 19 41.5 22 41.5 26.5 C 41.5 31 38.5 34 34 34 L 22 34 Z M 26.5 23.5 L 33.5 23.5 C 35.8 23.5 37 24.8 37 26.5 C 37 28.2 35.8 29.5 33.5 29.5 L 26.5 29.5 Z" fill="#FFFFFF" />

  <!-- Golden Holographic Kick Leg -->
  <path d="M 31 33.5 L 40.5 45 L 35 45 L 26.5 34.5 Z" fill="url(#rareGold)" />

  <!-- Collectible Holo Sparkle / 4-Point Star in Top Right -->
  <path d="M 43 12.5 Q 43 15 45.5 15 Q 43 15 43 17.5 Q 43 15 40.5 15 Q 43 15 43 12.5 Z" fill="#FDE047" />
</svg>
"""

def render_highres_image(size=512):
    scale = size / 64.0
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Base squircle
    bg_color = (13, 14, 18, 255)
    border_color = (38, 40, 51, 255)
    r = int(15 * scale)
    draw.rounded_rectangle([int(2 * scale), int(2 * scale), int(62 * scale), int(62 * scale)], radius=r, fill=bg_color, outline=border_color, width=max(1, int(1.5 * scale)))

    # 2. Golden card silhouette
    card_mat = (22, 24, 30, 255)
    gold_color = (234, 179, 8, 255)
    gold_light = (253, 224, 71, 255)
    card_r = int(5 * scale)
    draw.rounded_rectangle([int(11.5 * scale), int(8 * scale), int(52.5 * scale), int(56 * scale)], radius=card_r, fill=card_mat, outline=gold_color, width=max(1, int(2 * scale)))

    # 3. Inner line
    inner_r = int(3.5 * scale)
    draw.rounded_rectangle([int(14.5 * scale), int(11 * scale), int(49.5 * scale), int(53 * scale)], radius=inner_r, outline=(45, 48, 62, 200), width=max(1, int(0.8 * scale)))

    # 4. Bold 'R' - Vertical Stem
    draw.rounded_rectangle([int(22 * scale), int(19 * scale), int(26.5 * scale), int(45 * scale)], radius=max(1, int(1 * scale)), fill=(255, 255, 255, 255))

    # 5. Bold 'R' - Upper Bowl
    # Outer arc
    outer_bbox = [int(22 * scale), int(19 * scale), int(41.5 * scale), int(34 * scale)]
    draw.rounded_rectangle(outer_bbox, radius=int(7.5 * scale), fill=(255, 255, 255, 255))
    # Inner cutout of bowl
    inner_bbox = [int(26.5 * scale), int(23.5 * scale), int(37 * scale), int(29.5 * scale)]
    draw.rounded_rectangle(inner_bbox, radius=int(3 * scale), fill=card_mat)

    # 6. Golden Kick
    kick_pts = [
        (int(31 * scale), int(33.5 * scale)),
        (int(40.5 * scale), int(45 * scale)),
        (int(35 * scale), int(45 * scale)),
        (int(26.5 * scale), int(34.5 * scale))
    ]
    draw.polygon(kick_pts, fill=gold_color)

    # 7. Star sparkle in top right
    cx = int(43 * scale)
    cy = int(15 * scale)
    slen = int(2.8 * scale)
    star_pts = [
        (cx, cy - slen),
        (cx + int(slen * 0.3), cy - int(slen * 0.3)),
        (cx + slen, cy),
        (cx + int(slen * 0.3), cy + int(slen * 0.3)),
        (cx, cy + slen),
        (cx - int(slen * 0.3), cy + int(slen * 0.3)),
        (cx - slen, cy),
        (cx - int(slen * 0.3), cy - int(slen * 0.3))
    ]
    draw.polygon(star_pts, fill=gold_light)

    return img

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(base_dir, "public")
    assets_dir = os.path.join(base_dir, "assets")

    os.makedirs(public_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)

    # 1. Write SVG
    svg_content = create_svg()
    svg_path = os.path.join(public_dir, "favicon.svg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Created {svg_path}")

    # Also copy SVG to assets
    assets_svg = os.path.join(assets_dir, "favicon.svg")
    with open(assets_svg, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Created {assets_svg}")

    # 2. Render highres master 512x512
    master = render_highres_image(512)

    # 3. Export PNG sizes
    sizes = [
        (32, os.path.join(public_dir, "favicon.png")),
        (48, os.path.join(public_dir, "favicon-48x48.png")),
        (48, os.path.join(assets_dir, "favicon.png")),
        (180, os.path.join(public_dir, "apple-touch-icon.png")),
        (512, os.path.join(public_dir, "icon-512.png")),
    ]

    for sz, path in sizes:
        resized = master.resize((sz, sz), Image.Resampling.LANCZOS)
        resized.save(path, "PNG")
        print(f"Created {path} ({sz}x{sz})")

    # 4. Export multi-res .ico for legacy browsers
    ico_path = os.path.join(public_dir, "favicon.ico")
    master.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Created {ico_path}")

if __name__ == "__main__":
    main()

"""アイコン・Faviconの生成スクリプト。

`public/icon.svg` のデザインを元に、Favicon（ICO）・PWA用PNG・
Apple Touch Iconを書き出します。デザインを変えたときは次を実行します。

    pip install cairosvg pillow
    python3 scripts/generate-icons.py
"""
from io import BytesIO
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'

# 左の3本のバーが部品行、右の2列のドットがPL列。使用部品を `●` で示す
# マトリックス部品表そのものを図案化している。1列目は「選択中のPL」として
# 白のピルで強調する。
ROWS = (18, 32, 46)
DOTS = [
    # (列x, 行y, 不透明度)
    (36, 18, 1.00), (36, 32, 1.00), (36, 46, 1.00),
    (50.5, 18, 0.45), (50.5, 32, 0.92), (50.5, 46, 0.45),
]


def mark(scale: float = 1.0) -> str:
    """アイコンの図柄部分（背景を除く）を返す。scaleで安全領域へ縮小できる。"""
    bars = '\n    '.join(
        f'<rect x="10.5" y="{y - 2.5}" width="14" height="5" rx="2.5" fill="#fff" fill-opacity=".55"/>'
        for y in ROWS
    )
    dots = '\n    '.join(
        f'<circle cx="{x}" cy="{y}" r="5.4" fill="#fff" fill-opacity="{o}"/>'
        for x, y, o in DOTS
    )
    return (
        f'<g transform="translate({32 * (1 - scale):.3f} {32 * (1 - scale):.3f}) scale({scale})">\n'
        f'    {bars}\n'
        f'    <rect x="28.2" y="8.4" width="15.6" height="47.2" rx="7.8" fill="#fff" fill-opacity=".2"/>\n'
        f'    {dots}\n'
        f'  </g>'
    )


def compact_mark() -> str:
    """16px前後でも潰れないよう、行を2本に減らし要素を大きくした簡略版。"""
    rows = (20.5, 43.5)
    bars = '\n  '.join(
        f'<rect x="8" y="{y - 3.5}" width="17" height="7" rx="3.5" fill="#fff" fill-opacity=".62"/>'
        for y in rows
    )
    dots = '\n  '.join(
        f'<circle cx="{x}" cy="{y}" r="7" fill="#fff" fill-opacity="{o}"/>'
        for x, y, o in ((37, 20.5, 1), (37, 43.5, 1), (54, 20.5, 0.45), (54, 43.5, 0.92))
    )
    return f'{bars}\n  {dots}'


def svg(
    *,
    rounded: bool = True,
    scale: float = 1.0,
    compact: bool = False,
    title: str = 'Matrix Parts List',
) -> str:
    rx = (13 if compact else 15) if rounded else 0
    hairline = (
        f'\n  <rect x=".5" y=".5" width="63" height="63" rx="{rx - 0.5}" fill="none" '
        'stroke="#fff" stroke-opacity=".16"/>'
        if rounded else ''
    )
    sheen = '' if compact else f'\n  <rect width="64" height="64" rx="{rx}" fill="url(#mpl-sheen)"/>'
    sheen_def = '' if compact else '''
    <linearGradient id="mpl-sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".22"/>
      <stop offset=".62" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>'''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="{title}">
  <defs>
    <linearGradient id="mpl-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6a74f4"/>
      <stop offset=".52" stop-color="#5a66e8"/>
      <stop offset="1" stop-color="#8a54d6"/>
    </linearGradient>{sheen_def}
  </defs>
  <rect width="64" height="64" rx="{rx}" fill="url(#mpl-bg)"/>{sheen}{hairline}
  {compact_mark() if compact else mark(scale)}
</svg>
'''


def png(source: str, size: int) -> Image.Image:
    data = cairosvg.svg2png(bytestring=source.encode(), output_width=size, output_height=size)
    return Image.open(BytesIO(data)).convert('RGBA')


def main() -> None:
    PUBLIC.mkdir(exist_ok=True)
    icon = svg()
    favicon = svg(compact=True)
    (PUBLIC / 'icon.svg').write_text(icon, encoding='utf-8')
    (PUBLIC / 'favicon.svg').write_text(favicon, encoding='utf-8')

    # マスカブル（Android等の切り抜き）用は安全領域に収まるよう縮小し、背景を全面に敷く。
    maskable = svg(rounded=False, scale=0.72)
    (PUBLIC / 'icon-maskable.svg').write_text(maskable, encoding='utf-8')

    for size in (192, 512):
        png(icon, size).save(PUBLIC / f'icon-{size}.png')
        png(maskable, size).save(PUBLIC / f'icon-maskable-{size}.png')

    # Apple Touch Iconは透過を持たせず、iOS側の角丸に任せる。
    square = png(svg(rounded=False), 180)
    apple = Image.new('RGB', (180, 180), '#5a66e8')
    apple.paste(square, (0, 0), square)
    apple.save(PUBLIC / 'apple-touch-icon.png')

    # ICOは全フレームを簡略版から作り、タブでの視認性を優先する。
    png(favicon, 32).save(
        PUBLIC / 'favicon.ico',
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[png(favicon, 16), png(favicon, 48)],
    )
    print('generated:', ', '.join(sorted(p.name for p in PUBLIC.iterdir())))


if __name__ == '__main__':
    main()

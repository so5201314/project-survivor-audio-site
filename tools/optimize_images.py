"""Build lightweight web-only derivatives; retain the approved PNG originals."""
from pathlib import Path
from PIL import Image
import base64
import io

root = Path(__file__).resolve().parents[1]
assets = root / 'web' / 'assets'
for name, widths in [('qinglan-valley', (960, 1672)), ('qingfeng-swordsman', (640, 960))]:
    with Image.open(assets / f'{name}.png') as original:
        for width in widths:
            height = round(original.height * width / original.width)
            image = original.resize((width, height), Image.Resampling.LANCZOS)
            target = assets / f'{name}-{width}.webp'
            image.save(target, 'WEBP', quality=85, method=6)
            print(target.name, target.stat().st_size)

with Image.open(assets / 'qinglan-valley.png') as original:
    thumbnail = original.convert('RGB')
    thumbnail.thumbnail((40, 24), Image.Resampling.LANCZOS)
    stream = io.BytesIO()
    thumbnail.save(stream, 'JPEG', quality=65)
    placeholder = base64.b64encode(stream.getvalue()).decode('ascii')
css = '.showcase-hero,.detail-hero,.cover-wrap{background-color:#193a33;background-image:url("data:image/jpeg;base64,' + placeholder + '");background-size:cover;background-position:62% 50%}\n'
(root / 'web' / 'image-loading.css').write_text(css, encoding='utf-8')

#!/usr/bin/env python3
"""Original linocut field-guide plates for the science app. No third-party art."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "images"
INK = "#241c12"
PAPER = "#f4ead4"
MOSS = "#3d5a3a"
OCHRE = "#b5682a"
CLAY = "#8c4a32"
SKY = "#6e8ea3"
CREAM = "#f7f1e1"
GOLD = "#c9a24a"
NIGHT = "#1b2830"
BONE = "#e6d8b8"


def svg(w, h, inner, paper=PAPER):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img">
<defs>
  <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse">
    <path d="M0 6 L6 0" stroke="{INK}" stroke-width="0.45" opacity="0.18"/>
  </pattern>
  <pattern id="grain" width="48" height="48" patternUnits="userSpaceOnUse">
    <circle cx="3" cy="7" r="0.6" fill="{INK}" opacity="0.08"/>
    <circle cx="22" cy="18" r="0.5" fill="{INK}" opacity="0.07"/>
    <circle cx="37" cy="9" r="0.7" fill="{INK}" opacity="0.06"/>
    <circle cx="11" cy="33" r="0.5" fill="{INK}" opacity="0.07"/>
    <circle cx="41" cy="39" r="0.6" fill="{INK}" opacity="0.08"/>
  </pattern>
  <pattern id="rule" width="100" height="28" patternUnits="userSpaceOnUse">
    <path d="M0 27 H100" stroke="{INK}" stroke-width="0.4" opacity="0.12"/>
  </pattern>
</defs>
<rect width="{w}" height="{h}" fill="{paper}"/>
<rect width="{w}" height="{h}" fill="url(#grain)"/>
{inner}
<rect x="8" y="8" width="{w-16}" height="{h-16}" fill="none" stroke="{INK}" stroke-width="2.2"/>
<rect x="14" y="14" width="{w-28}" height="{h-28}" fill="none" stroke="{INK}" stroke-width="0.6" opacity="0.5"/>
</svg>
'''


def plate_label(x, y, text, small=False):
    size = 11 if small else 15
    return f'<text x="{x}" y="{y}" font-family="Georgia, serif" font-size="{size}" letter-spacing="2.4" fill="{INK}">{text}</text>'


def save(rel, content):
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(path.relative_to(ROOT.parent))


def habitat_forest():
    trees = []
    coords = [(70, 210, 38), (130, 200, 52), (210, 190, 70), (300, 205, 46), (380, 198, 58), (455, 212, 40)]
    for x, y, r in coords:
        trees.append(f'<polygon points="{x},{y-r*1.6} {x-r*0.7},{y} {x+r*0.7},{y}" fill="{MOSS}" opacity="0.9"/>')
        trees.append(f'<polygon points="{x},{y-r*1.15} {x-r*0.5},{y-18} {x+r*0.5},{y-18}" fill="{MOSS}"/>')
        trees.append(f'<rect x="{x-6}" y="{y}" width="12" height="48" fill="{INK}"/>')
    creek = f'<path d="M40 300 C 140 280, 220 320, 340 300 S 520 290, 560 310" fill="none" stroke="{SKY}" stroke-width="16" stroke-linecap="round"/>'
    creek2 = f'<path d="M40 300 C 140 280, 220 320, 340 300 S 520 290, 560 310" fill="none" stroke="{INK}" stroke-width="2" opacity="0.4"/>'
    ferns = []
    for x in range(40, 560, 28):
        ferns.append(f'<path d="M{x} 340 q 8 -22 0 -36 q 12 10 4 28" fill="none" stroke="{MOSS}" stroke-width="2"/>')
    inner = f'''
    <rect x="24" y="44" width="552" height="250" fill="{SKY}" opacity="0.25"/>
    <path d="M24 200 C 180 160, 300 210, 576 170 L 576 294 L 24 294 Z" fill="{MOSS}" opacity="0.35"/>
    {creek}{creek2}
    {''.join(trees)}
    {''.join(ferns)}
    <circle cx="500" cy="78" r="22" fill="{GOLD}" opacity="0.7"/>
    {plate_label(28, 38, "PLATE I  ·  WOODLAND")}
    {plate_label(28, 372, "Creek terrace · mixed hardwoods", True)}
    '''
    save("habitats/forest.svg", svg(600, 400, inner))


def habitat_meadow():
    grasses = []
    for i, x in enumerate(range(30, 570, 10)):
        h = 40 + (i * 13) % 34
        grasses.append(f'<path d="M{x} 330 l 3 -{h} l 3 {h}" fill="none" stroke="{MOSS}" stroke-width="1.4"/>')
    blooms = []
    for x, y, c in [(120, 240, OCHRE), (210, 220, CLAY), (340, 235, GOLD), (430, 215, OCHRE), (500, 250, CLAY)]:
        blooms.append(f'<circle cx="{x}" cy="{y}" r="11" fill="{c}"/>')
        blooms.append(f'<circle cx="{x}" cy="{y}" r="3" fill="{INK}"/>')
    inner = f'''
    <rect x="24" y="44" width="552" height="200" fill="{SKY}" opacity="0.28"/>
    <ellipse cx="300" cy="250" rx="250" ry="70" fill="{MOSS}" opacity="0.28"/>
    {''.join(grasses)}
    {''.join(blooms)}
    <path d="M80 180 q 40 -50 90 -20" fill="none" stroke="{INK}" stroke-width="1.5"/>
    <ellipse cx="170" cy="150" rx="18" ry="7" fill="{INK}"/>
    {plate_label(28, 38, "PLATE II  ·  MEADOW")}
    {plate_label(28, 372, "Open grass · wild bloom · swallow", True)}
    '''
    save("habitats/meadow.svg", svg(600, 400, inner))


def habitat_pond():
    inner = f'''
    <rect x="24" y="44" width="552" height="160" fill="{SKY}" opacity="0.22"/>
    <ellipse cx="300" cy="250" rx="230" ry="80" fill="{SKY}" opacity="0.55"/>
    <ellipse cx="300" cy="250" rx="210" ry="66" fill="#4d6f6a"/>
    <path d="M160 250 q 40 20 80 0 q 40 -18 90 6" fill="none" stroke="{CREAM}" stroke-width="1.4" opacity="0.7"/>
    <ellipse cx="140" cy="250" rx="28" ry="8" fill="{MOSS}"/>
    <path d="M140 250 q 0 -40 18 -70 q -30 12 -18 70" fill="{MOSS}"/>
    <ellipse cx="430" cy="268" rx="50" ry="10" fill="{MOSS}" opacity="0.8"/>
    <circle cx="250" cy="232" r="7" fill="{GOLD}"/>
    <circle cx="268" cy="240" r="5" fill="{GOLD}" opacity="0.7"/>
    <path d="M80 320 C 140 300, 200 340, 260 320" fill="none" stroke="{INK}" stroke-width="1.5"/>
    {plate_label(28, 38, "PLATE III  ·  POND")}
    {plate_label(28, 372, "Still water · lily pad · skimmer", True)}
    '''
    save("habitats/pond.svg", svg(600, 400, inner))


def habitat_garden():
    inner = f'''
    <rect x="80" y="90" width="180" height="130" fill="none" stroke="{INK}" stroke-width="3"/>
    <path d="M80 90 L170 40 L260 90" fill="none" stroke="{INK}" stroke-width="3"/>
    <rect x="145" y="150" width="36" height="70" fill="{CLAY}"/>
    <rect x="320" y="200" width="200" height="90" fill="none" stroke="{INK}" stroke-width="2"/>
    <path d="M340 200 v90 M380 200 v90 M420 200 v90 M460 200 v90 M500 200 v90" stroke="{MOSS}" stroke-width="8"/>
    <circle cx="360" cy="170" r="8" fill="{CLAY}"/>
    <circle cx="400" cy="160" r="8" fill="{OCHRE}"/>
    <circle cx="440" cy="172" r="8" fill="{GOLD}"/>
    <circle cx="480" cy="158" r="8" fill="{CLAY}"/>
    <rect x="40" y="250" width="70" height="50" fill="{MOSS}" opacity="0.5"/>
    {plate_label(28, 38, "PLATE IV  ·  GARDEN")}
    {plate_label(28, 372, "Beds · bean poles · kitchen path", True)}
    '''
    save("habitats/garden.svg", svg(600, 400, inner))


def habitat_shore():
    inner = f'''
    <rect x="24" y="44" width="552" height="150" fill="{SKY}" opacity="0.35"/>
    <path d="M24 190 C 140 210, 260 160, 400 200 S 560 210, 576 180 L 576 320 L 24 320 Z" fill="{SKY}" opacity="0.55"/>
    <path d="M24 250 C 160 230, 280 280, 576 240 L 576 360 L 24 360 Z" fill="{GOLD}" opacity="0.55"/>
    <ellipse cx="120" cy="300" rx="18" ry="10" fill="{INK}" opacity="0.45"/>
    <ellipse cx="210" cy="310" rx="12" ry="7" fill="{INK}" opacity="0.35"/>
    <path d="M400 140 l 40 10 l -10 6 l -30 -8 z" fill="{INK}"/>
    <path d="M80 140 l 50 0 l -8 12 l -34 0 z" fill="{INK}" opacity="0.7"/>
    {plate_label(28, 38, "PLATE V  ·  SHORE")}
    {plate_label(28, 372, "Tide line · shells · gull", True)}
    '''
    save("habitats/shore.svg", svg(600, 400, inner))


def habitat_desert():
    inner = f'''
    <rect x="24" y="44" width="552" height="180" fill="{GOLD}" opacity="0.28"/>
    <circle cx="470" cy="90" r="28" fill="{OCHRE}" opacity="0.8"/>
    <path d="M24 260 C 120 200, 220 280, 340 220 S 520 250, 576 210 L 576 360 L 24 360 Z" fill="{GOLD}" opacity="0.55"/>
    <path d="M160 250 v-70 h8 v20 h16 v-34 h8 v34 h16 v-20 h8 v70 z" fill="{MOSS}"/>
    <path d="M380 280 v-50 h7 v14 h12 v-24 h7 v24 h12 v-14 h7 v50 z" fill="{MOSS}" opacity="0.85"/>
    <ellipse cx="250" cy="300" rx="22" ry="8" fill="{CLAY}"/>
    {plate_label(28, 38, "PLATE VI  ·  DESERT")}
    {plate_label(28, 372, "Dry wash · cactus · heat haze", True)}
    '''
    save("habitats/desert.svg", svg(600, 400, inner))


def habitat_mountain():
    inner = f'''
    <rect x="24" y="44" width="552" height="200" fill="{SKY}" opacity="0.3"/>
    <polygon points="80,300 200,90 320,300" fill="{INK}" opacity="0.55"/>
    <polygon points="220,300 360,70 520,300" fill="{INK}" opacity="0.72"/>
    <polygon points="360,300 470,130 576,300" fill="{INK}" opacity="0.45"/>
    <polygon points="330,140 360,70 390,140" fill="{CREAM}"/>
    <path d="M24 300 L576 300" stroke="{MOSS}" stroke-width="18"/>
    {plate_label(28, 38, "PLATE VII  ·  HIGH COUNTRY")}
    {plate_label(28, 372, "Ridges · snow line · thin air", True)}
    '''
    save("habitats/mountain.svg", svg(600, 400, inner))


def habitat_sky():
    inner = f'''
    <rect x="24" y="44" width="552" height="320" fill="#9bb8c9"/>
    <circle cx="120" cy="110" r="32" fill="{GOLD}"/>
    <ellipse cx="280" cy="150" rx="70" ry="22" fill="{CREAM}"/>
    <ellipse cx="320" cy="150" rx="50" ry="18" fill="{CREAM}"/>
    <ellipse cx="430" cy="200" rx="90" ry="24" fill="{CREAM}" opacity="0.85"/>
    <path d="M200 250 q 30 -20 60 0" fill="none" stroke="{INK}" stroke-width="2"/>
    <path d="M210 258 q 24 -14 48 0" fill="none" stroke="{INK}" stroke-width="1.5"/>
    {plate_label(28, 38, "PLATE VIII  ·  OPEN SKY")}
    {plate_label(28, 372, "Sun · cumulus · swallow stoop", True)}
    '''
    save("habitats/sky.svg", svg(600, 400, inner, paper="#d7e4ea"))


def habitat_stream():
    inner = f'''
    <path d="M24 80 C 80 140, 80 220, 40 340" fill="none" stroke="{SKY}" stroke-width="70"/>
    <path d="M24 80 C 80 140, 80 220, 40 340" fill="none" stroke="{INK}" stroke-width="2" opacity="0.35"/>
    <path d="M90 120 l 40 -10 l 8 18 l -40 12 z" fill="{INK}" opacity="0.5"/>
    <circle cx="200" cy="250" r="16" fill="{INK}" opacity="0.4"/>
    <path d="M280 200 v120 M310 210 v100 M250 220 v90" stroke="{MOSS}" stroke-width="6"/>
    <ellipse cx="400" cy="280" rx="90" ry="30" fill="{MOSS}" opacity="0.4"/>
    {plate_label(28, 38, "PLATE IX  ·  STREAM")}
    {plate_label(28, 372, "Riffle · stone · alder shade", True)}
    '''
    save("habitats/stream.svg", svg(600, 400, inner))


def habitat_backyard():
    inner = f'''
    <rect x="60" y="80" width="220" height="140" fill="{CREAM}" stroke="{INK}" stroke-width="3"/>
    <rect x="140" y="140" width="50" height="80" fill="{CLAY}"/>
    <rect x="80" y="110" width="40" height="30" fill="{SKY}" opacity="0.5" stroke="{INK}"/>
    <rect x="190" y="110" width="40" height="30" fill="{SKY}" opacity="0.5" stroke="{INK}"/>
    <circle cx="400" cy="160" r="70" fill="{MOSS}"/>
    <rect x="392" y="200" width="16" height="70" fill="{INK}"/>
    <rect x="320" y="250" width="90" height="40" fill="none" stroke="{INK}" stroke-width="2"/>
    <circle cx="500" cy="260" r="18" fill="{OCHRE}"/>
    <rect x="496" y="276" width="8" height="40" fill="{INK}"/>
    {plate_label(28, 38, "PLATE X  ·  YARD")}
    {plate_label(28, 372, "Doorstep · shade tree · feeder", True)}
    '''
    save("habitats/yard.svg", svg(600, 400, inner))


def spec_oak():
    inner = f'''
    <path d="M300 80 C 220 120, 190 220, 250 300 C 200 280, 210 200, 260 150 C 240 240, 280 320, 300 340 C 320 320, 360 240, 340 150 C 390 200, 400 280, 350 300 C 410 220, 380 120, 300 80 Z" fill="{MOSS}"/>
    <path d="M300 140 v210" stroke="{INK}" stroke-width="5"/>
    <path d="M300 210 l 40 20 M300 250 l -36 24 M300 180 l 28 -10" stroke="{INK}" stroke-width="3"/>
    <ellipse cx="160" cy="200" rx="36" ry="22" fill="{MOSS}" transform="rotate(-30 160 200)"/>
    <path d="M160 200 l 50 70" stroke="{INK}" stroke-width="2"/>
    <ellipse cx="170" cy="290" rx="10" ry="16" fill="{OCHRE}"/>
    {plate_label(28, 38, "QUERCUS  ·  OAK LEAF")}
    {plate_label(28, 372, "Lobed margin · acorn cup", True)}
    '''
    save("specimens/oak-leaf.svg", svg(600, 400, inner))


def spec_maple():
    inner = f'''
    <path d="M300 90 l 40 70 l 90 10 l -70 50 l 22 90 l -82 -48 l -82 48 l 22 -90 l -70 -50 l 90 -10 z" fill="{CLAY}"/>
    <path d="M300 160 v190" stroke="{INK}" stroke-width="4"/>
    {plate_label(28, 38, "ACER  ·  MAPLE")}
    {plate_label(28, 372, "Palmate veins · five lobes", True)}
    '''
    save("specimens/maple-leaf.svg", svg(600, 400, inner))


def spec_pine():
    inner = f'''
    <path d="M300 70 l 70 90 h -30 l 60 90 h -34 l 70 110 h -272 l 70 -110 h -34 l 60 -90 h -30 z" fill="{MOSS}"/>
    <rect x="292" y="300" width="16" height="50" fill="{INK}"/>
    <path d="M430 160 l 40 8 m -8 -12 l 16 28" stroke="{INK}" stroke-width="2"/>
    <ellipse cx="450" cy="200" rx="8" ry="18" fill="{OCHRE}"/>
    {plate_label(28, 38, "PINUS  ·  PINE")}
    {plate_label(28, 372, "Needles in bundles · cone", True)}
    '''
    save("specimens/pine.svg", svg(600, 400, inner))


def spec_dandelion():
    inner = f'''
    <circle cx="300" cy="150" r="70" fill="none" stroke="{GOLD}" stroke-width="3"/>
    <g stroke="{GOLD}" stroke-width="2">
      {''.join(f'<line x1="300" y1="150" x2="{300 + 80 * __import__("math").cos(i*0.26)}" y2="{150 + 80 * __import__("math").sin(i*0.26)}"/>' for i in range(24))}
    </g>
    <circle cx="300" cy="150" r="12" fill="{OCHRE}"/>
    <path d="M300 220 C 310 280, 280 340, 300 360" fill="none" stroke="{MOSS}" stroke-width="4"/>
    <path d="M300 260 C 250 250, 230 280, 240 300" fill="{MOSS}"/>
    {plate_label(28, 38, "TARAXACUM  ·  DANDELION")}
    {plate_label(28, 372, "Composite head · toothed leaf", True)}
    '''
    save("specimens/dandelion.svg", svg(600, 400, inner))


def spec_fern():
    fronds = []
    for i, ang in enumerate(range(-60, 70, 14)):
        fronds.append(
            f'<g transform="translate(300,80) rotate({ang})"><path d="M0 0 q 12 40 0 90" fill="none" stroke="{MOSS}" stroke-width="3"/>'
            + "".join(f'<ellipse cx="8" cy="{y}" rx="10" ry="5" fill="{MOSS}"/>' for y in range(12, 90, 12))
            + "".join(f'<ellipse cx="-8" cy="{y}" rx="10" ry="5" fill="{MOSS}"/>' for y in range(18, 90, 12))
            + "</g>"
        )
    inner = f'''
    {''.join(fronds)}
    {plate_label(28, 38, "PTERIDOPHYTA  ·  FERN")}
    {plate_label(28, 372, "Frond · pinnae · no flowers", True)}
    '''
    save("specimens/fern.svg", svg(600, 400, inner))


def spec_robin():
    inner = f'''
    <ellipse cx="300" cy="210" rx="90" ry="55" fill="{INK}"/>
    <ellipse cx="300" cy="225" rx="60" ry="35" fill="{CLAY}"/>
    <ellipse cx="380" cy="190" rx="28" ry="22" fill="{INK}"/>
    <circle cx="392" cy="186" r="3" fill="{CREAM}"/>
    <path d="M408 190 l 18 4 l -18 6 z" fill="{OCHRE}"/>
    <path d="M220 200 q -50 -10 -70 20" fill="none" stroke="{INK}" stroke-width="8"/>
    <path d="M270 260 l -6 40 M330 260 l 6 40" stroke="{INK}" stroke-width="3"/>
    <path d="M264 300 h -16 M336 300 h 16" stroke="{INK}" stroke-width="3"/>
    {plate_label(28, 38, "TURDUS  ·  ROBIN")}
    {plate_label(28, 372, "Warm breast · thin bill · yard bird", True)}
    '''
    save("specimens/robin.svg", svg(600, 400, inner))


def spec_frog():
    inner = f'''
    <ellipse cx="310" cy="220" rx="100" ry="55" fill="{MOSS}"/>
    <circle cx="230" cy="180" r="22" fill="{MOSS}"/>
    <circle cx="230" cy="180" r="8" fill="{INK}"/>
    <circle cx="226" cy="176" r="3" fill="{CREAM}"/>
    <path d="M210 240 q -50 20 -40 50 q 30 0 50 -20" fill="{MOSS}"/>
    <path d="M400 230 q 60 10 70 50 q -40 10 -70 -10" fill="{MOSS}"/>
    <ellipse cx="280" cy="230" rx="16" ry="10" fill="{INK}" opacity="0.3"/>
    {plate_label(28, 38, "RANA  ·  FROG")}
    {plate_label(28, 372, "Moist skin · hind leap · pond edge", True)}
    '''
    save("specimens/frog.svg", svg(600, 400, inner))


def spec_butterfly():
    inner = f'''
    <ellipse cx="230" cy="180" rx="70" ry="90" fill="{OCHRE}"/>
    <ellipse cx="370" cy="180" rx="70" ry="90" fill="{OCHRE}"/>
    <ellipse cx="240" cy="280" rx="50" ry="40" fill="{GOLD}"/>
    <ellipse cx="360" cy="280" rx="50" ry="40" fill="{GOLD}"/>
    <rect x="294" y="150" width="12" height="160" fill="{INK}"/>
    <circle cx="300" cy="150" r="8" fill="{INK}"/>
    <path d="M300 150 q -20 -40 -40 -44 M300 150 q 20 -40 40 -44" fill="none" stroke="{INK}" stroke-width="2"/>
    <circle cx="210" cy="160" r="10" fill="{INK}" opacity="0.25"/>
    {plate_label(28, 38, "LEPIDOPTERA  ·  BUTTERFLY")}
    {plate_label(28, 372, "Scale wings · coiled siphon", True)}
    '''
    save("specimens/butterfly.svg", svg(600, 400, inner))


def spec_fish():
    inner = f'''
    <ellipse cx="300" cy="210" rx="130" ry="55" fill="{SKY}"/>
    <path d="M170 210 l -50 -40 v80 z" fill="{SKY}"/>
    <path d="M300 155 l 20 -40 l 20 40" fill="{MOSS}"/>
    <path d="M300 265 l 16 36 l 16 -36" fill="{MOSS}"/>
    <circle cx="390" cy="200" r="7" fill="{INK}"/>
    <path d="M250 190 q 30 0 40 10 M250 220 q 30 0 40 -8" fill="none" stroke="{INK}" stroke-width="1.5"/>
    {plate_label(28, 38, "PISCES  ·  FISH")}
    {plate_label(28, 372, "Fins · gills · water kind", True)}
    '''
    save("specimens/fish.svg", svg(600, 400, inner))


def spec_bee():
    inner = f'''
    <ellipse cx="300" cy="220" rx="70" ry="40" fill="{GOLD}"/>
    <path d="M250 200 v40 M275 198 v44 M300 196 v48 M325 198 v44 M350 200 v40" stroke="{INK}" stroke-width="6"/>
    <circle cx="370" cy="210" r="18" fill="{INK}"/>
    <ellipse cx="230" cy="180" rx="40" ry="22" fill="{CREAM}" opacity="0.8" stroke="{INK}"/>
    <ellipse cx="250" cy="170" rx="36" ry="20" fill="{CREAM}" opacity="0.7" stroke="{INK}"/>
    <path d="M388 200 q 20 -20 28 -6" fill="none" stroke="{INK}" stroke-width="2"/>
    {plate_label(28, 38, "APIS  ·  HONEYBEE")}
    {plate_label(28, 372, "Pollen baskets · flower work", True)}
    '''
    save("specimens/bee.svg", svg(600, 400, inner))


def spec_earthworm():
    inner = f'''
    <path d="M80 220 C 160 160, 220 280, 300 200 S 430 140, 520 230" fill="none" stroke="{CLAY}" stroke-width="22" stroke-linecap="round"/>
    <path d="M80 220 C 160 160, 220 280, 300 200 S 430 140, 520 230" fill="none" stroke="{INK}" stroke-width="1.2" opacity="0.5"/>
    <path d="M200 198 h 18" stroke="{CREAM}" stroke-width="6"/>
    {plate_label(28, 38, "LUMBRICUS  ·  EARTHWORM")}
    {plate_label(28, 372, "Segments · soil tiller", True)}
    '''
    save("specimens/earthworm.svg", svg(600, 400, inner))


def spec_seed():
    inner = f'''
    <ellipse cx="220" cy="210" rx="50" ry="28" fill="{OCHRE}"/>
    <path d="M190 210 q 30 -10 60 0" fill="none" stroke="{INK}" stroke-width="1.5"/>
    <rect x="320" y="120" width="8" height="160" fill="{MOSS}"/>
    <ellipse cx="324" cy="200" rx="70" ry="16" fill="{MOSS}"/>
    <ellipse cx="324" cy="230" rx="50" ry="12" fill="{MOSS}"/>
    <circle cx="460" cy="140" r="40" fill="{MOSS}" opacity="0.4"/>
    {plate_label(28, 38, "SEED  ·  BEAN")}
    {plate_label(28, 372, "Coat · stored food · baby plant", True)}
    '''
    save("specimens/bean-seed.svg", svg(600, 400, inner))


def spec_feather():
    inner = f'''
    <path d="M180 300 L420 80" stroke="{INK}" stroke-width="4"/>
    <g stroke="{INK}" stroke-width="1.6">
      {''.join(f'<line x1="{180+i*12}" y1="{300-i*11}" x2="{160+i*12}" y2="{270-i*11}"/>' for i in range(18))}
      {''.join(f'<line x1="{180+i*12}" y1="{300-i*11}" x2="{210+i*12}" y2="{280-i*11}"/>' for i in range(18))}
    </g>
    {plate_label(28, 38, "REMX  ·  FEATHER")}
    {plate_label(28, 372, "Shaft · vanes · light flight", True)}
    '''
    save("specimens/feather.svg", svg(600, 400, inner))


def spec_shell():
    inner = f'''
    <path d="M300 80 C 420 100, 480 220, 300 340 C 120 220, 180 100, 300 80 Z" fill="{CREAM}" stroke="{INK}" stroke-width="3"/>
    <path d="M300 120 C 380 140, 400 220, 300 300" fill="none" stroke="{INK}" stroke-width="2"/>
    <path d="M300 150 C 350 165, 360 220, 300 270" fill="none" stroke="{INK}" stroke-width="2"/>
    <circle cx="300" cy="210" r="16" fill="{INK}" opacity="0.2"/>
    {plate_label(28, 38, "GASTROPODA  ·  SHELL")}
    {plate_label(28, 372, "Spiral house · shore find", True)}
    '''
    save("specimens/shell.svg", svg(600, 400, inner))


def spec_moss():
    inner = f'''
    <ellipse cx="300" cy="260" rx="180" ry="50" fill="{MOSS}" opacity="0.35"/>
    {''.join(f'<path d="M{x} 260 q 6 -{40+(x%17)} 0 -{70+(x%23)} q 8 10 2 30" fill="none" stroke="{MOSS}" stroke-width="2"/>' for x in range(140, 460, 12))}
    {plate_label(28, 38, "BRYOPHYTA  ·  MOSS")}
    {plate_label(28, 372, "No true roots · damp stone", True)}
    '''
    save("specimens/moss.svg", svg(600, 400, inner))


def tool_magnify():
    inner = f'''
    <circle cx="260" cy="190" r="110" fill="none" stroke="{INK}" stroke-width="18"/>
    <circle cx="260" cy="190" r="88" fill="{SKY}" opacity="0.15"/>
    <path d="M340 270 L 500 340" stroke="{INK}" stroke-width="22" stroke-linecap="round"/>
    <path d="M210 150 q 30 -20 50 6" fill="none" stroke="{CREAM}" stroke-width="6" opacity="0.7"/>
    {plate_label(28, 38, "HAND LENS")}
    {plate_label(28, 372, "Hold close · let the light in", True)}
    '''
    save("tools/magnifier.svg", svg(600, 400, inner))


def tool_journal():
    inner = f'''
    <rect x="140" y="60" width="280" height="300" fill="{CLAY}"/>
    <rect x="160" y="70" width="250" height="280" fill="{CREAM}"/>
    <path d="M180 110 h 210 M180 140 h 210 M180 170 h 170 M180 200 h 210" stroke="{INK}" stroke-width="1.2" opacity="0.5"/>
    <rect x="140" y="60" width="22" height="300" fill="{INK}" opacity="0.35"/>
    <circle cx="151" cy="110" r="4" fill="{CREAM}"/>
    <circle cx="151" cy="210" r="4" fill="{CREAM}"/>
    <circle cx="151" cy="310" r="4" fill="{CREAM}"/>
    {plate_label(28, 38, "FIELD JOURNAL")}
    {plate_label(28, 372, "Date · place · what you saw", True)}
    '''
    save("tools/journal.svg", svg(600, 400, inner))


def tool_tin():
    inner = f'''
    <rect x="130" y="120" width="340" height="180" rx="8" fill="{GOLD}" stroke="{INK}" stroke-width="3"/>
    <rect x="150" y="140" width="300" height="140" fill="{CREAM}" stroke="{INK}"/>
    <rect x="170" y="160" width="80" height="100" fill="{MOSS}" opacity="0.4" stroke="{INK}"/>
    <rect x="260" y="160" width="80" height="100" fill="{OCHRE}" opacity="0.4" stroke="{INK}"/>
    <rect x="350" y="160" width="80" height="100" fill="{SKY}" opacity="0.4" stroke="{INK}"/>
    {plate_label(28, 38, "SPECIMEN TIN")}
    {plate_label(28, 372, "Dry finds only · leave live things", True)}
    '''
    save("tools/tin.svg", svg(600, 400, inner))


def tool_compass():
    inner = f'''
    <circle cx="300" cy="210" r="110" fill="{CREAM}" stroke="{INK}" stroke-width="8"/>
    <circle cx="300" cy="210" r="88" fill="none" stroke="{INK}" stroke-width="1"/>
    <polygon points="300,120 318,210 300,200 282,210" fill="{CLAY}"/>
    <polygon points="300,300 318,210 300,220 282,210" fill="{INK}"/>
    <text x="300" y="108" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="{INK}">N</text>
    {plate_label(28, 38, "COMPASS")}
    {plate_label(28, 372, "North is a gift of order", True)}
    '''
    save("tools/compass.svg", svg(600, 400, inner))


def body_skeleton():
    inner = f'''
    <ellipse cx="300" cy="90" rx="32" ry="38" fill="{BONE}" stroke="{INK}"/>
    <rect x="292" y="128" width="16" height="28" fill="{BONE}" stroke="{INK}"/>
    <path d="M250 170 q 50 20 100 0" fill="none" stroke="{INK}" stroke-width="6"/>
    {''.join(f'<path d="M260 {190+i*10} q 40 6 80 0" fill="none" stroke="{INK}" stroke-width="3"/>' for i in range(8))}
    <rect x="294" y="180" width="12" height="120" fill="{BONE}" stroke="{INK}"/>
    <path d="M300 300 L 260 370 M300 300 L 340 370" stroke="{INK}" stroke-width="7"/>
    <path d="M250 175 L 210 250 M350 175 L 390 250" stroke="{INK}" stroke-width="6"/>
    {plate_label(28, 38, "AXIAL FRAME")}
    {plate_label(28, 372, "Skull · spine · ribs · sternum", True)}
    '''
    save("body/axial-skeleton.svg", svg(600, 400, inner))


def body_heart():
    inner = f'''
    <path d="M300 140 C 240 90, 170 140, 180 200 C 190 270, 300 330, 300 330 C 300 330, 410 270, 420 200 C 430 140, 360 90, 300 140 Z" fill="{CLAY}"/>
    <path d="M300 180 v90 M260 210 h80" stroke="{CREAM}" stroke-width="3" opacity="0.6"/>
    <path d="M250 120 q -20 -40 -50 -20" fill="none" stroke="{CLAY}" stroke-width="8"/>
    <path d="M350 120 q 20 -40 50 -20" fill="none" stroke="{CLAY}" stroke-width="8"/>
    {plate_label(28, 38, "HEART")}
    {plate_label(28, 372, "A pump with four rooms", True)}
    '''
    save("body/heart.svg", svg(600, 400, inner))


def body_lungs():
    inner = f'''
    <path d="M300 90 v40" stroke="{INK}" stroke-width="8"/>
    <path d="M300 130 l -20 20 M300 130 l 20 20" stroke="{INK}" stroke-width="6"/>
    <ellipse cx="240" cy="230" rx="70" ry="110" fill="{SKY}"/>
    <ellipse cx="360" cy="230" rx="70" ry="110" fill="{SKY}"/>
    <path d="M240 160 q 40 30 0 70 q 40 20 0 60" fill="none" stroke="{INK}" stroke-width="1.5" opacity="0.4"/>
    <path d="M360 160 q -40 30 0 70 q -40 20 0 60" fill="none" stroke="{INK}" stroke-width="1.5" opacity="0.4"/>
    {plate_label(28, 38, "LUNGS")}
    {plate_label(28, 372, "Bronchial tree · air sacs", True)}
    '''
    save("body/lungs.svg", svg(600, 400, inner))


def body_senses():
    inner = f'''
    <circle cx="140" cy="160" r="50" fill="{CREAM}" stroke="{INK}" stroke-width="3"/>
    <circle cx="140" cy="160" r="18" fill="{MOSS}"/>
    <circle cx="140" cy="160" r="7" fill="{INK}"/>
    <path d="M250 140 q 40 -20 80 10 q -10 50 -50 54 q -40 -10 -30 -44 z" fill="{GOLD}" stroke="{INK}"/>
    <ellipse cx="420" cy="160" rx="34" ry="50" fill="{CREAM}" stroke="{INK}" stroke-width="3"/>
    <path d="M420 160 q 40 0 50 -20" fill="none" stroke="{INK}" stroke-width="2"/>
    <path d="M160 280 q 40 30 80 0 q 20 40 -10 50 h -60 q -30 -10 -10 -50" fill="{CLAY}"/>
    <rect x="400" y="270" width="70" height="50" rx="12" fill="{BONE}" stroke="{INK}"/>
    {plate_label(28, 38, "FIVE SENSES")}
    {plate_label(28, 372, "See · hear · smell · taste · touch", True)}
    '''
    save("body/senses.svg", svg(600, 400, inner))


def body_digest():
    inner = f'''
    <ellipse cx="300" cy="90" rx="28" ry="16" fill="{CREAM}" stroke="{INK}"/>
    <rect x="292" y="106" width="16" height="50" fill="{GOLD}" stroke="{INK}"/>
    <ellipse cx="300" cy="190" rx="50" ry="36" fill="{CLAY}"/>
    <path d="M300 226 C 240 250, 240 330, 300 340 C 360 330, 360 250, 300 226" fill="none" stroke="{OCHRE}" stroke-width="14"/>
    <path d="M260 340 h 80" stroke="{INK}" stroke-width="10" stroke-linecap="round"/>
    {plate_label(28, 38, "DIGESTIVE PATH")}
    {plate_label(28, 372, "Mouth to stomach to intestine", True)}
    '''
    save("body/digestive.svg", svg(600, 400, inner))


def body_atom():
    inner = f'''
    <circle cx="300" cy="210" r="18" fill="{CLAY}"/>
    <circle cx="292" cy="206" r="6" fill="{OCHRE}"/>
    <circle cx="310" cy="214" r="6" fill="{GOLD}"/>
    <ellipse cx="300" cy="210" rx="160" ry="50" fill="none" stroke="{INK}" stroke-width="2"/>
    <ellipse cx="300" cy="210" rx="160" ry="50" fill="none" stroke="{INK}" stroke-width="2" transform="rotate(60 300 210)"/>
    <ellipse cx="300" cy="210" rx="160" ry="50" fill="none" stroke="{INK}" stroke-width="2" transform="rotate(120 300 210)"/>
    <circle cx="460" cy="210" r="8" fill="{SKY}"/>
    <circle cx="220" cy="90" r="8" fill="{SKY}"/>
    <circle cx="250" cy="320" r="8" fill="{SKY}"/>
    {plate_label(28, 38, "ATOM")}
    {plate_label(28, 372, "Nucleus · proton · neutron · electron", True)}
    '''
    save("body/atom.svg", svg(600, 400, inner))


def machines():
    plates = {
        "lever": (
            "LEVER",
            f'<rect x="80" y="220" width="440" height="16" fill="{INK}"/>'
            f'<polygon points="300,236 270,300 330,300" fill="{CLAY}"/>'
            f'<circle cx="140" cy="210" r="22" fill="{MOSS}"/>'
            f'<rect x="430" y="160" width="18" height="60" fill="{OCHRE}"/>',
            "Bar + fulcrum · load vs effort",
        ),
        "wheel": (
            "WHEEL AND AXLE",
            f'<circle cx="300" cy="210" r="90" fill="none" stroke="{INK}" stroke-width="14"/>'
            f'<circle cx="300" cy="210" r="16" fill="{CLAY}"/>'
            f'<path d="M300 120 v180 M210 210 h180" stroke="{INK}" stroke-width="3"/>',
            "Wheel turns · axle turns with it",
        ),
        "pulley": (
            "PULLEY",
            f'<rect x="292" y="50" width="16" height="80" fill="{INK}"/>'
            f'<circle cx="300" cy="150" r="40" fill="none" stroke="{INK}" stroke-width="12"/>'
            f'<path d="M260 150 V 300 H 200" fill="none" stroke="{GOLD}" stroke-width="6"/>'
            f'<rect x="180" y="300" width="40" height="40" fill="{CLAY}"/>',
            "A wheel that holds a rope",
        ),
        "ramp": (
            "INCLINED PLANE",
            f'<polygon points="80,320 520,320 520,100" fill="{MOSS}" opacity="0.5" stroke="{INK}" stroke-width="3"/>'
            f'<rect x="200" y="230" width="50" height="36" fill="{OCHRE}"/>',
            "A slope that spreads the work",
        ),
        "wedge": (
            "WEDGE",
            f'<polygon points="300,80 140,320 460,320" fill="{GOLD}" stroke="{INK}" stroke-width="3"/>'
            f'<path d="M300 80 V 320" stroke="{INK}" stroke-width="2"/>',
            "Two ramps back to back",
        ),
        "screw": (
            "SCREW",
            f'<rect x="270" y="70" width="60" height="40" fill="{CLAY}"/>'
            f'<path d="M280 110 v210" stroke="{INK}" stroke-width="18"/>'
            f'<path d="M271 130 h18 M271 160 h18 M271 190 h18 M271 220 h18 M271 250 h18 M271 280 h18" stroke="{GOLD}" stroke-width="6"/>',
            "An inclined plane wrapped around",
        ),
    }
    for key, (title, art, cap) in plates.items():
        inner = f'''
        {art}
        {plate_label(28, 38, title)}
        {plate_label(28, 372, cap, True)}
        '''
        save(f"machines/{key}.svg", svg(600, 400, inner))


def weather():
    items = {
        "sun": (
            "SUN",
            f'<circle cx="300" cy="200" r="70" fill="{GOLD}"/>'
            + "".join(
                f'<line x1="300" y1="200" x2="{300+140*(1 if i%2==0 else 0.85)*__import__("math").cos(i*0.52)}" y2="{200+140*(1 if i%2==0 else 0.85)*__import__("math").sin(i*0.52)}" stroke="{GOLD}" stroke-width="6"/>'
                for i in range(12)
            ),
            "Light and warmth from above",
        ),
        "rain": (
            "RAIN",
            f'<ellipse cx="300" cy="140" rx="120" ry="40" fill="{INK}" opacity="0.45"/>'
            + "".join(f'<line x1="{x}" y1="180" x2="{x-8}" y2="320" stroke="{SKY}" stroke-width="4"/>' for x in range(200, 420, 28)),
            "Clouds too heavy to hold water",
        ),
        "snow": (
            "SNOW",
            "".join(
                f'<text x="{x}" y="{y}" font-size="28" fill="{SKY}">*</text>'
                for x, y in [(160, 120), (260, 90), (360, 140), (220, 200), (320, 210), (420, 180), (180, 280), (300, 300), (400, 260)]
            ),
            "Ice crystals, each with six arms",
        ),
        "wind": (
            "WIND",
            f'<path d="M80 160 q 80 -40 160 0 t 160 0 t 120 10" fill="none" stroke="{INK}" stroke-width="6"/>'
            f'<path d="M80 220 q 80 -30 160 0 t 160 0" fill="none" stroke="{INK}" stroke-width="4"/>'
            f'<path d="M80 270 q 90 -20 170 8" fill="none" stroke="{INK}" stroke-width="3"/>',
            "Air that moves because God set it turning",
        ),
        "cycle": (
            "WATER CYCLE",
            f'<ellipse cx="180" cy="280" rx="80" ry="28" fill="{SKY}"/>'
            f'<path d="M180 252 q 40 -90 120 -90" fill="none" stroke="{SKY}" stroke-width="6" marker-end=""/>'
            f'<ellipse cx="360" cy="140" rx="70" ry="28" fill="{INK}" opacity="0.35"/>'
            f'<path d="M400 170 l 20 80" stroke="{SKY}" stroke-width="4"/>'
            f'<path d="M430 170 l 16 70" stroke="{SKY}" stroke-width="4"/>'
            f'<polygon points="460,250 520,310 400,310" fill="{MOSS}" opacity="0.4"/>',
            "Evaporate · travel · fall · run",
        ),
        "cloud-cumulus": (
            "CUMULUS",
            f'<ellipse cx="260" cy="210" rx="70" ry="36" fill="{CREAM}" stroke="{INK}"/>'
            f'<ellipse cx="320" cy="190" rx="60" ry="40" fill="{CREAM}" stroke="{INK}"/>'
            f'<ellipse cx="370" cy="215" rx="55" ry="30" fill="{CREAM}" stroke="{INK}"/>',
            "Heaped fair-weather pile",
        ),
        "cloud-stratus": (
            "STRATUS",
            f'<rect x="80" y="160" width="440" height="36" rx="16" fill="{INK}" opacity="0.25"/>'
            f'<rect x="110" y="200" width="400" height="28" rx="14" fill="{INK}" opacity="0.2"/>',
            "A low gray sheet",
        ),
        "cloud-cirrus": (
            "CIRRUS",
            f'<path d="M80 160 q 80 -40 140 -10 q 40 20 90 -10" fill="none" stroke="{INK}" stroke-width="3"/>'
            f'<path d="M140 200 q 90 -30 160 0" fill="none" stroke="{INK}" stroke-width="2"/>'
            f'<path d="M260 230 q 70 -24 140 6" fill="none" stroke="{INK}" stroke-width="2"/>',
            "High ice threads",
        ),
    }
    for key, (title, art, cap) in items.items():
        inner = f'''
        {art}
        {plate_label(28, 38, title)}
        {plate_label(28, 372, cap, True)}
        '''
        save(f"weather/{key}.svg", svg(600, 400, inner))


def creation():
    inner = f'''
    <rect x="24" y="44" width="552" height="320" fill="{NIGHT}"/>
    {''.join(f'<circle cx="{40+(i*97)%520}" cy="{70+(i*53)%260}" r="{(i%3)+1.2}" fill="{CREAM}"/>' for i in range(40))}
    <ellipse cx="300" cy="210" rx="70" ry="18" fill="none" stroke="{GOLD}" stroke-width="2" opacity="0.7"/>
    {plate_label(28, 38, "THE HEAVENS")}
    <text x="28" y="372" font-family="Georgia, serif" font-size="11" letter-spacing="1.2" fill="{CREAM}">Psalm 19:1  ·  The heavens declare the glory of God</text>
    '''
    save("creation/heavens.svg", svg(600, 400, inner, paper=NIGHT))

    inner = f'''
    <ellipse cx="180" cy="220" rx="70" ry="40" fill="{MOSS}"/>
    <circle cx="180" cy="188" r="22" fill="{MOSS}"/>
    <path d="M300 250 q 40 -80 90 -90 q 20 60 -10 110 z" fill="{SKY}"/>
    <path d="M430 160 l 40 20 l -10 70 l -50 -10 z" fill="{GOLD}"/>
    <path d="M430 160 q 20 -40 50 -20" fill="none" stroke="{INK}" stroke-width="3"/>
    {plate_label(28, 38, "AFTER THEIR KIND")}
    {plate_label(28, 372, "Beast · fish · bird — each bringing forth its own", True)}
    '''
    save("creation/kinds.svg", svg(600, 400, inner))

    inner = f'''
    <rect x="200" y="80" width="200" height="250" fill="{INK}" opacity="0.15" stroke="{INK}"/>
    <path d="M220 140 h 160 M220 180 h 120 M220 220 h 150 M220 260 h 90" stroke="{INK}" stroke-width="6"/>
    <ellipse cx="300" cy="200" rx="24" ry="40" fill="{MOSS}" opacity="0.5"/>
    {plate_label(28, 38, "RECORDS IN STONE")}
    {plate_label(28, 372, "Fossils · layers · buried life", True)}
    '''
    save("creation/fossil.svg", svg(600, 400, inner))

    inner = f'''
    <circle cx="300" cy="200" r="90" fill="{CREAM}" stroke="{INK}" stroke-width="10"/>
    <circle cx="300" cy="200" r="34" fill="{MOSS}"/>
    <circle cx="300" cy="200" r="14" fill="{INK}"/>
    <path d="M210 140 q 40 20 30 60" fill="none" stroke="{INK}" stroke-width="3"/>
    {plate_label(28, 38, "THE EYE")}
    {plate_label(28, 372, "Parts fitted for seeing", True)}
    '''
    save("creation/eye.svg", svg(600, 400, inner))


def ui():
    inner = f'''
    <circle cx="300" cy="200" r="120" fill="{CLAY}"/>
    <circle cx="300" cy="200" r="100" fill="{CREAM}"/>
    <path d="M300 110 v20 M300 270 v20 M210 200 h20 M370 200 h20" stroke="{INK}" stroke-width="4"/>
    <polygon points="300,130 312,200 300,192 288,200" fill="{CLAY}"/>
    <text x="300" y="355" text-anchor="middle" font-family="Georgia, serif" font-size="22" letter-spacing="4" fill="{INK}">FIELD EXPEDITION</text>
    '''
    save("ui/mark.svg", svg(600, 400, inner))

    inner = f'''
    <rect x="80" y="80" width="440" height="240" fill="{CLAY}"/>
    <rect x="110" y="100" width="380" height="200" fill="{CREAM}"/>
    <text x="300" y="180" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="{INK}">FIELD STAMP</text>
    <text x="300" y="230" text-anchor="middle" font-family="Courier New, monospace" font-size="16" fill="{INK}">SPECIMEN LOGGED</text>
    <circle cx="160" cy="160" r="18" fill="{MOSS}"/>
    '''
    save("ui/stamp.svg", svg(600, 400, inner))

    inner = f'''
    <rect width="600" height="400" fill="{PAPER}"/>
    <path d="M40 40 L560 40 L560 360 L40 360 Z" fill="none" stroke="{INK}" stroke-width="4"/>
    <path d="M80 80 h440 M80 120 h440 M80 160 h300" stroke="{INK}" opacity="0.25"/>
    <text x="80" y="320" font-family="Georgia, serif" font-size="18" fill="{INK}">Image plate reserved</text>
    '''
    save("ui/placeholder.svg", svg(600, 400, inner))

    # high-contrast baby plates
    for name, shape in [
        ("leaf", f'<path d="M300 70 C 180 160, 180 280, 300 340 C 420 280, 420 160, 300 70 Z" fill="{INK}"/><path d="M300 90 v230" stroke="{PAPER}" stroke-width="6"/>'),
        ("sun", f'<circle cx="300" cy="200" r="80" fill="{INK}"/>' + "".join(f'<rect x="292" y="40" width="16" height="40" fill="{INK}" transform="rotate({i*45} 300 200)"/>' for i in range(8))),
        ("rain", "".join(f'<ellipse cx="{x}" cy="{140+(x%40)}" rx="12" ry="22" fill="{INK}"/>' for x in range(160, 460, 50))),
        ("bird", f'<ellipse cx="300" cy="210" rx="90" ry="40" fill="{INK}"/><path d="M220 200 q -60 -40 -80 -10" stroke="{INK}" stroke-width="16" fill="none"/><circle cx="370" cy="198" r="6" fill="{PAPER}"/>'),
        ("fish", f'<ellipse cx="310" cy="210" rx="110" ry="50" fill="{INK}"/><polygon points="200,210 120,160 120,260" fill="{INK}"/><circle cx="390" cy="200" r="8" fill="{PAPER}"/>'),
    ]:
        inner = f'''
        {shape}
        '''
        save(f"ui/baby-{name}.svg", svg(600, 400, inner, paper=CREAM))


def main():
    habitat_forest()
    habitat_meadow()
    habitat_pond()
    habitat_garden()
    habitat_shore()
    habitat_desert()
    habitat_mountain()
    habitat_sky()
    habitat_stream()
    habitat_backyard()
    spec_oak()
    spec_maple()
    spec_pine()
    spec_dandelion()
    spec_fern()
    spec_robin()
    spec_frog()
    spec_butterfly()
    spec_fish()
    spec_bee()
    spec_earthworm()
    spec_seed()
    spec_feather()
    spec_shell()
    spec_moss()
    tool_magnify()
    tool_journal()
    tool_tin()
    tool_compass()
    body_skeleton()
    body_heart()
    body_lungs()
    body_senses()
    body_digest()
    body_atom()
    machines()
    weather()
    creation()
    ui()
    print("plates written")


if __name__ == "__main__":
    main()

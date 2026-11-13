#!/usr/bin/env python3
"""Original expedition-chart SVG (schematic, not a survey plat)."""
from pathlib import Path

# Approximate centroids on a 1100x720 navigator chart. Original layout.
STATES = [
    ("WA", "Washington", "Olympia", 118, 78, 1, "pacific"),
    ("OR", "Oregon", "Salem", 118, 148, 1, "pacific"),
    ("CA", "California", "Sacramento", 108, 268, 1, "pacific"),
    ("NV", "Nevada", "Carson City", 168, 228, 1, "mountain"),
    ("ID", "Idaho", "Boise", 188, 128, 1, "mountain"),
    ("MT", "Montana", "Helena", 278, 78, 1, "mountain"),
    ("WY", "Wyoming", "Cheyenne", 288, 168, 1, "mountain"),
    ("UT", "Utah", "Salt Lake City", 228, 228, 1, "mountain"),
    ("AZ", "Arizona", "Phoenix", 208, 318, 1, "southwest"),
    ("CO", "Colorado", "Denver", 318, 248, 1, "mountain"),
    ("NM", "New Mexico", "Santa Fe", 288, 328, 1, "southwest"),
    ("ND", "North Dakota", "Bismarck", 398, 78, 1, "plains"),
    ("SD", "South Dakota", "Pierre", 398, 148, 1, "plains"),
    ("NE", "Nebraska", "Lincoln", 408, 208, 1, "plains"),
    ("KS", "Kansas", "Topeka", 428, 268, 1, "plains"),
    ("OK", "Oklahoma", "Oklahoma City", 448, 328, 1, "south-central"),
    ("TX", "Texas", "Austin", 398, 408, 1, "south-central"),
    ("MN", "Minnesota", "St. Paul", 498, 98, 1, "midwest"),
    ("IA", "Iowa", "Des Moines", 498, 188, 1, "midwest"),
    ("MO", "Missouri", "Jefferson City", 508, 268, 1, "midwest"),
    ("AR", "Arkansas", "Little Rock", 518, 348, 1, "south-central"),
    ("LA", "Louisiana", "Baton Rouge", 518, 428, 1, "south-central"),
    ("WI", "Wisconsin", "Madison", 558, 128, 1, "midwest"),
    ("IL", "Illinois", "Springfield", 568, 228, 1, "midwest"),
    ("MS", "Mississippi", "Jackson", 568, 398, 1, "southeast"),
    ("MI", "Michigan", "Lansing", 628, 128, 1, "midwest"),
    ("IN", "Indiana", "Indianapolis", 628, 218, 1, "midwest"),
    ("KY", "Kentucky", "Frankfort", 658, 278, 1, "ohio-valley"),
    ("TN", "Tennessee", "Nashville", 638, 328, 1, "southeast"),
    ("AL", "Alabama", "Montgomery", 628, 398, 1, "southeast"),
    ("OH", "Ohio", "Columbus", 688, 218, 1, "ohio-valley"),
    ("GA", "Georgia", "Atlanta", 688, 398, 1, "southeast"),
    ("FL", "Florida", "Tallahassee", 748, 478, 1, "southeast"),
    ("WV", "West Virginia", "Charleston", 728, 268, 1, "appalachia"),
    ("VA", "Virginia", "Richmond", 778, 288, 1, "mid-atlantic"),
    ("NC", "North Carolina", "Raleigh", 778, 348, 1, "southeast"),
    ("SC", "South Carolina", "Columbia", 748, 388, 1, "southeast"),
    ("PA", "Pennsylvania", "Harrisburg", 748, 208, 1, "mid-atlantic"),
    ("NY", "New York", "Albany", 798, 148, 1, "mid-atlantic"),
    ("VT", "Vermont", "Montpelier", 848, 108, 1, "new-england"),
    ("NH", "New Hampshire", "Concord", 878, 118, 1, "new-england"),
    ("ME", "Maine", "Augusta", 918, 78, 1, "new-england"),
    ("MA", "Massachusetts", "Boston", 888, 158, 1, "new-england"),
    ("RI", "Rhode Island", "Providence", 908, 178, 1, "new-england"),
    ("CT", "Connecticut", "Hartford", 868, 178, 1, "new-england"),
    ("NJ", "New Jersey", "Trenton", 828, 208, 1, "mid-atlantic"),
    ("DE", "Delaware", "Dover", 818, 238, 1, "mid-atlantic"),
    ("MD", "Maryland", "Annapolis", 798, 248, 1, "mid-atlantic"),
    ("DC", "Washington, D.C.", "Washington", 788, 268, 1, "mid-atlantic"),
    ("AK", "Alaska", "Juneau", 158, 548, 1, "pacific"),
    ("HI", "Hawaii", "Honolulu", 318, 578, 1, "pacific"),
]

# Wider hit targets for small states.
RX = {
    "RI": 28, "DE": 28, "DC": 30, "CT": 32, "NJ": 32, "NH": 32, "VT": 32,
    "MD": 34, "MA": 36, "HI": 40, "AK": 52, "TX": 58, "CA": 50, "MT": 48,
    "FL": 46, "AK": 54,
}
RY = {
    "RI": 18, "DE": 18, "DC": 18, "FL": 28, "TX": 40, "CA": 48, "AK": 32,
    "HI": 22, "TN": 18, "KY": 18,
}


def main():
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 720" role="img" aria-label="United States expedition chart">',
        '<defs>',
        '<pattern id="parch" width="8" height="8" patternUnits="userSpaceOnUse">',
        '<rect width="8" height="8" fill="#efe4c6"/>',
        '<path d="M0 8L8 0" stroke="#e4d6ae" stroke-width="0.6"/>',
        '</pattern>',
        '<filter id="paper" x="-2%" y="-2%" width="104%" height="104%">',
        '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="n"/>',
        '<feColorMatrix in="n" type="saturate" values="0"/>',
        '<feComponentTransfer><feFuncA type="table" tableValues="0 0.07"/></feComponentTransfer>',
        '</filter>',
        '</defs>',
        '<rect width="1100" height="720" fill="url(#parch)"/>',
        '<rect width="1100" height="720" filter="url(#paper)"/>',
        # continental shelf wash
        '<path fill="#d7ecf2" stroke="#7aa3b0" stroke-width="1.2" d="M70 40 C 90 20 980 10 1020 90 C 1040 160 1000 500 920 560 C 820 620 520 640 360 600 C 240 570 80 420 70 260 Z"/>',
        # land mass wash (original silhouette, schematic)
        '<path fill="#cbb98a" stroke="#6a5a38" stroke-width="2" d="M130 70 L 210 55 L 360 48 L 520 58 L 640 70 L 760 90 L 860 70 L 930 50 L 970 90 L 955 130 L 900 150 L 880 175 L 895 200 L 860 230 L 850 255 L 800 250 L 790 300 L 820 330 L 800 370 L 760 390 L 780 430 L 820 500 L 760 530 L 700 470 L 640 500 L 600 470 L 560 500 L 500 470 L 470 520 L 420 500 L 360 470 L 300 430 L 250 380 L 200 360 L 170 300 L 150 230 L 125 170 L 130 110 Z"/>',
        # Alaska inset land
        '<path fill="#cbb98a" stroke="#6a5a38" stroke-width="1.6" d="M70 500 L 150 490 L 230 510 L 250 560 L 200 610 L 90 600 L 60 540 Z"/>',
        # Hawaii inset islands
        '<ellipse cx="300" cy="560" rx="18" ry="10" fill="#cbb98a" stroke="#6a5a38"/>',
        '<ellipse cx="328" cy="572" rx="22" ry="12" fill="#cbb98a" stroke="#6a5a38"/>',
        '<ellipse cx="358" cy="586" rx="14" ry="8" fill="#cbb98a" stroke="#6a5a38"/>',
        '<ellipse cx="378" cy="598" rx="10" ry="6" fill="#cbb98a" stroke="#6a5a38"/>',
        '<text x="70" y="488" font-size="11" fill="#5c4a2a" font-family="Trebuchet MS, sans-serif">Alaska inset</text>',
        '<text x="250" y="540" font-size="11" fill="#5c4a2a" font-family="Trebuchet MS, sans-serif">Hawaii inset</text>',
        # Great Lakes wash
        '<ellipse cx="640" cy="150" rx="34" ry="18" fill="#8fb9c9" stroke="#4d7a8a"/>',
        '<ellipse cx="690" cy="158" rx="22" ry="14" fill="#8fb9c9" stroke="#4d7a8a"/>',
        '<ellipse cx="600" cy="168" rx="28" ry="12" fill="#8fb9c9" stroke="#4d7a8a"/>',
        '<ellipse cx="720" cy="175" rx="18" ry="10" fill="#8fb9c9" stroke="#4d7a8a"/>',
        '<ellipse cx="670" cy="188" rx="20" ry="9" fill="#8fb9c9" stroke="#4d7a8a"/>',
        # rivers
        '<g fill="none" stroke="#3d6d82" stroke-width="3" stroke-linecap="round" opacity="0.85">',
        '<path id="river-mississippi" data-feature="mississippi" d="M500 90 C 505 160 510 240 515 300 C 518 360 525 410 520 455"/>',
        '<path id="river-missouri" data-feature="missouri" d="M280 90 C 340 140 400 200 508 268"/>',
        '<path id="river-ohio" data-feature="ohio" d="M748 210 C 700 250 660 280 520 300"/>',
        '<path id="river-arkansas" data-feature="arkansas-river" d="M318 248 C 380 280 450 320 518 348"/>',
        '<path id="river-stlawrence" data-feature="st-lawrence" d="M690 150 C 760 130 840 120 920 90"/>',
        '<path id="river-colorado" data-feature="colorado" d="M228 228 C 210 270 200 310 190 350"/>',
        '<path id="river-rio-grande" data-feature="rio-grande" d="M288 328 C 320 380 350 430 370 470"/>',
        '<path id="river-columbia" data-feature="columbia" d="M118 78 C 140 100 160 120 118 148"/>',
        '<path id="river-red" data-feature="red" d="M398 408 C 450 380 500 360 518 348"/>',
        '</g>',
        '<ellipse id="feat-great-salt-lake" data-feature="great-salt-lake" cx="228" cy="210" rx="16" ry="10" fill="#9ec3c8" stroke="#4d7a8a"/>',
        # mountains as marks
        '<g fill="#5c4a2a" stroke="#3a2e1c" stroke-width="1">',
        '<path id="mtn-white" data-feature="white-mountains" d="M878 100 l12 -22 12 22 z"/>',
        '<path id="mtn-green" data-feature="green-mountains" d="M848 90 l11 -20 11 20 z"/>',
        '<path id="mtn-adirondack" data-feature="adirondack" d="M798 120 l12 -22 12 22 z"/>',
        '<path id="mtn-allegheny" data-feature="allegheny" d="M728 190 l12 -20 12 20 z"/>',
        '<path id="mtn-blue-ridge" data-feature="blue-ridge" d="M748 330 l14 -24 14 24 z"/>',
        '<path id="mtn-smoky" data-feature="great-smoky" d="M678 340 l14 -24 14 24 z"/>',
        '<path id="mtn-mitchell" data-feature="mt-mitchell" d="M758 320 l10 -26 10 26 z"/>',
        '<path id="mtn-cumberland" data-feature="cumberland" d="M658 310 l12 -18 12 18 z"/>',
        '<path id="mtn-rockies" data-feature="rockies" d="M278 70 l18 -34 18 34 z"/>',
        '<path id="mtn-pikes" data-feature="pikes-peak" d="M318 220 l12 -28 12 28 z"/>',
        '<path id="mtn-elbert" data-feature="mt-elbert" d="M300 210 l12 -30 12 30 z"/>',
        '<path id="mtn-sierra" data-feature="sierra-nevada" d="M130 230 l16 -32 16 32 z"/>',
        '<path id="mtn-whitney" data-feature="mt-whitney" d="M118 250 l10 -28 10 28 z"/>',
        '<path id="mtn-cascades" data-feature="cascades" d="M118 90 l14 -30 14 30 z"/>',
        '<path id="mtn-rainier" data-feature="mt-rainier" d="M130 70 l10 -26 10 26 z"/>',
        '<path id="mtn-sthelens" data-feature="mt-st-helens" d="M125 100 l10 -22 10 22 z"/>',
        '<path id="mtn-denali" data-feature="denali" d="M150 520 l16 -36 16 36 z"/>',
        '</g>',
        # deserts
        '<g fill="#d2a46a" fill-opacity="0.45" stroke="#8a6230" stroke-dasharray="3 2">',
        '<ellipse id="desert-mojave" data-feature="mojave" cx="150" cy="300" rx="28" ry="16"/>',
        '<ellipse id="desert-sonoran" data-feature="sonoran" cx="190" cy="340" rx="30" ry="16"/>',
        '<ellipse id="desert-colorado" data-feature="colorado-desert" cx="160" cy="330" rx="18" ry="12"/>',
        '<ellipse id="desert-painted" data-feature="painted-desert" cx="220" cy="300" rx="22" ry="12"/>',
        '<ellipse id="desert-gsl" data-feature="great-salt-lake-desert" cx="200" cy="210" rx="24" ry="12"/>',
        '</g>',
        # compass
        '<g transform="translate(1020,80)">',
        '<circle r="36" fill="#f7edd0" stroke="#8a6230" stroke-width="2"/>',
        '<path d="M0 -28 L8 0 L0 10 L-8 0 Z" fill="#b33a3a"/>',
        '<path d="M0 28 L8 0 L0 -10 L-8 0 Z" fill="#2f5d50"/>',
        '<text y="-40" text-anchor="middle" font-size="12" fill="#5c4a2a" font-family="Trebuchet MS, sans-serif">N</text>',
        '</g>',
        '<text x="40" y="36" font-size="18" fill="#5c4a2a" font-family="Palatino, serif" font-weight="700">Expedition Chart of the United States</text>',
        '<text x="40" y="56" font-size="12" fill="#7a6848" font-family="Trebuchet MS, sans-serif">Schematic navigator chart — original drawing, not a survey map</text>',
    ]

    for abbr, name, capital, x, y, _w, region in STATES:
        rx = RX.get(abbr, 36)
        ry = RY.get(abbr, 22)
        sid = abbr.lower()
        parts.append(
            f'<g class="state" id="state-{sid}" data-abbr="{abbr}" data-name="{name}" data-capital="{capital}" data-region="{region}" transform="translate({x},{y})">'
        )
        parts.append(
            f'<ellipse class="state-hit" cx="0" cy="0" rx="{rx}" ry="{ry}" fill="#f3e6c4" fill-opacity="0.35" stroke="#6a5a38" stroke-width="1.4"/>'
        )
        parts.append(
            f'<text text-anchor="middle" dy="4" font-size="11" font-family="Trebuchet MS, sans-serif" fill="#3a2e1c" font-weight="700">{abbr}</text>'
        )
        parts.append("</g>")

    # feature pins for later JS
    features = [
        ("grand-canyon", 200, 300, "Grand Canyon"),
        ("black-hills", 398, 130, "Black Hills"),
        ("ozark", 508, 310, "Ozark Highlands"),
        ("okefenokee", 708, 430, "Okefenokee"),
        ("olympic", 100, 70, "Olympic"),
        ("niagara", 760, 150, "Niagara Falls"),
        ("ms-delta", 518, 455, "Mississippi Delta"),
        ("mammoth-cave", 648, 300, "Mammoth Cave"),
        ("san-andreas", 108, 300, "San Andreas"),
        ("gulf", 470, 500, "Gulf of Mexico"),
        ("death-valley", 140, 280, "Death Valley"),
        ("chesapeake", 808, 268, "Chesapeake Bay"),
        ("hudson-bay-ny", 808, 160, "Hudson"),
        ("sf-bay", 90, 250, "San Francisco Bay"),
        ("puget", 118, 60, "Puget Sound"),
        ("pamlico", 808, 360, "Pamlico Sound"),
    ]
    parts.append('<g id="feature-dots" fill="#b33a3a">')
    for fid, x, y, label in features:
        parts.append(
            f'<g id="feat-{fid}" data-feature="{fid}" data-label="{label}" transform="translate({x},{y})">'
            f'<circle r="5"/><circle r="9" fill="none" stroke="#b33a3a" stroke-width="1"/>'
            f"</g>"
        )
    parts.append("</g>")
    parts.append("</svg>")
    out = Path(__file__).with_name("us-chart.svg")
    out.write_text("\n".join(parts), encoding="utf-8")
    print("wrote", out, "bytes", out.stat().st_size)


if __name__ == "__main__":
    main()

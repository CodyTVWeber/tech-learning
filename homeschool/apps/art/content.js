/* Harbor Studio — original art lessons. Masterpieces are public-domain museum images. */
window.HSArt = {
  subject: "art",
  theme: "Harbor Studio",
  tagline: "Look, mix, then draw it on paper.",
  bands: [
    { id: "baby", label: "Baby", blurb: "Big color, high contrast, gentle looking." },
    { id: "toddler", label: "Toddler", blurb: "Colors, fat-brush paint, simple shapes." },
    { id: "preschool", label: "Preschool", blurb: "Shapes, mixing, first drawing lessons, then paper." },
    { id: "early", label: "Early", blurb: "Step drawings, color wheel, close looking." },
    { id: "primary", label: "Primary", blurb: "Perspective start, artists, studio challenges." },
    { id: "upper", label: "Upper", blurb: "Value, composition, master copy on paper." }
  ],
  activities: [
    { id: "colors", title: "Color Dock", kicker: "Name and match", bands: ["baby", "toddler", "preschool", "early"], img: "images/color-boats.jpg", alt: "Red, yellow, and blue toy boats" },
    { id: "shapes", title: "Shape Harbor", kicker: "Circle, square, triangle", bands: ["toddler", "preschool", "early"], img: "images/harbor-shapes.jpg", alt: "Wooden shape blocks on sailcloth" },
    { id: "mix", title: "Mix Pan", kicker: "Two colors make a third", bands: ["preschool", "early", "primary"], img: "images/harbor-palette.jpg", alt: "Worn painter palette with oil paints" },
    { id: "lesson", title: "Pier Lessons", kicker: "Watch the steps, then paper", bands: ["preschool", "early", "primary", "upper"], img: "images/harbor-easel.jpg", alt: "Field easel on a harbor pier" },
    { id: "canvas", title: "Open Canvas", kicker: "Paint in the studio", bands: ["baby", "toddler", "preschool", "early", "primary", "upper"], img: "images/harbor-palette.jpg", alt: "Studio palette and brush" },
    { id: "looking", title: "Looking Wall", kicker: "Public-domain masterpieces", bands: ["toddler", "preschool", "early", "primary", "upper"], img: "images/harbor-looking-wall.jpg", alt: "Framed studies on a studio wall" },
    { id: "artists", title: "Artist Cards", kicker: "Who made this?", bands: ["early", "primary", "upper"], img: "images/harbor-still-life.jpg", alt: "Studio still life on a pine table" },
    { id: "studio", title: "Studio Challenges", kicker: "Mirror, upside-down, perspective", bands: ["early", "primary", "upper"], img: "images/harbor-easel.jpg", alt: "Easel on the pier" },
    { id: "collection", title: "Postcard Rack", kicker: "Stamps and postcards", bands: ["baby", "toddler", "preschool", "early", "primary", "upper"], img: "images/harbor-looking-wall.jpg", alt: "Looking wall of frames" }
  ],
  colors: [
    { id: "red", name: "Red", hex: "#b33a2b", say: "Red, like a harbor buoy." },
    { id: "yellow", name: "Yellow", hex: "#d4a017", say: "Yellow, like a slicker." },
    { id: "blue", name: "Blue", hex: "#2f5f8a", say: "Blue, like deep harbor water." },
    { id: "orange", name: "Orange", hex: "#c56a21", say: "Orange, like a life ring." },
    { id: "green", name: "Green", hex: "#3d6b63", say: "Green, like copper on a roof." },
    { id: "purple", name: "Purple", hex: "#5b3d6b", say: "Purple, like evening fog." },
    { id: "white", name: "White", hex: "#f4efe4", say: "White, like sailcloth." },
    { id: "black", name: "Black", hex: "#1c1814", say: "Black, like wet pilings." }
  ],
  mixes: [
    { a: "red", b: "yellow", out: "orange" },
    { a: "blue", b: "yellow", out: "green" },
    { a: "red", b: "blue", out: "purple" }
  ],
  shapes: [
    { id: "circle", name: "Circle", say: "A circle is round like a porthole.", d: "M32 8a24 24 0 100 48 24 24 0 000-48z" },
    { id: "square", name: "Square", say: "A square has four even sides, like a crate.", d: "M12 12h40v40H12z" },
    { id: "triangle", name: "Triangle", say: "A triangle has three sides, like a sail.", d: "M32 10L54 52H10z" },
    { id: "rectangle", name: "Rectangle", say: "A rectangle is a stretched square, like a pier plank.", d: "M8 20h48v24H8z" },
    { id: "oval", name: "Oval", say: "An oval is a stretched circle, like a pebble.", d: "M8 32a24 16 0 1048 0 24 16 0 10-48 0z" }
  ],
  postcards: [
    { id: "buoy", name: "Red buoy" },
    { id: "sail", name: "White sail" },
    { id: "bridge", name: "Harbor bridge" },
    { id: "shell", name: "Shell study" },
    { id: "starry", name: "Night postcard" },
    { id: "wave", name: "Wave print" }
  ],
  stamps: [
    { id: "palette", name: "Palette" },
    { id: "easel", name: "Easel" },
    { id: "looking", name: "Looking glass" },
    { id: "paper", name: "Paper finish" },
    { id: "mix", name: "Mix pan" },
    { id: "master", name: "Master copy" }
  ],
  lessons: [
    {
      id: "sun",
      title: "Harbor sun",
      bands: ["preschool", "early"],
      paper: "Now draw a sun on paper: a circle, then short rays. Keep it light so the paper does not fill in.",
      steps: [
        { say: "Draw a circle for the sun.", ops: [{ op: "circle", x: 160, y: 90, r: 40 }] },
        { say: "Add short rays around it.", ops: [{ op: "rays", x: 160, y: 90, r1: 50, r2: 72, n: 8 }] },
        { say: "A water line under the sun.", ops: [{ op: "line", x1: 20, y1: 170, x2: 300, y2: 170 }] }
      ]
    },
    {
      id: "sailboat",
      title: "One sailboat",
      bands: ["preschool", "early"],
      paper: "Now draw a sailboat on paper. Water, hull, mast, one triangle sail.",
      steps: [
        { say: "A calm water line.", ops: [{ op: "line", x1: 16, y1: 150, x2: 304, y2: 150 }] },
        { say: "A hull like a shallow bowl.", ops: [{ op: "path", d: "M70 150 L250 150 L230 178 L90 178 Z" }] },
        { say: "A tall mast.", ops: [{ op: "line", x1: 160, y1: 150, x2: 160, y2: 36 }] },
        { say: "A triangle sail.", ops: [{ op: "path", d: "M164 40 L164 140 L250 140 Z" }] }
      ]
    },
    {
      id: "fish",
      title: "Pier fish",
      bands: ["preschool", "early"],
      paper: "Now draw a fish on paper: oval body, triangle tail, one eye.",
      steps: [
        { say: "An oval body.", ops: [{ op: "ellipse", x: 150, y: 110, rx: 70, ry: 36 }] },
        { say: "A triangle tail.", ops: [{ op: "path", d: "M80 110 L40 80 L40 140 Z" }] },
        { say: "A dot for the eye.", ops: [{ op: "circle", x: 190, y: 100, r: 6 }] }
      ]
    },
    {
      id: "house",
      title: "Boathouse",
      bands: ["preschool", "early"],
      paper: "Now draw a boathouse: square, triangle roof, door, water line.",
      steps: [
        { say: "A square wall.", ops: [{ op: "rect", x: 90, y: 90, w: 140, h: 90 }] },
        { say: "A triangle roof.", ops: [{ op: "path", d: "M80 90 L160 30 L240 90 Z" }] },
        { say: "A door.", ops: [{ op: "rect", x: 140, y: 120, w: 40, h: 60 }] },
        { say: "Water under the piles.", ops: [{ op: "line", x1: 20, y1: 190, x2: 300, y2: 190 }] }
      ]
    },
    {
      id: "flower",
      title: "Dock flower",
      bands: ["preschool"],
      paper: "Now draw a flower on paper: circle center, petals, a stem.",
      steps: [
        { say: "A stem.", ops: [{ op: "line", x1: 160, y1: 80, x2: 160, y2: 190 }] },
        { say: "A circle center.", ops: [{ op: "circle", x: 160, y: 70, r: 18 }] },
        { say: "Petals around the center.", ops: [{ op: "petals", x: 160, y: 70, r: 34, n: 6 }] }
      ]
    },
    {
      id: "cat",
      title: "Studio cat",
      bands: ["preschool", "early"],
      paper: "Now draw a sitting cat: circle head, triangle ears, oval body.",
      steps: [
        { say: "An oval body.", ops: [{ op: "ellipse", x: 160, y: 140, rx: 50, ry: 40 }] },
        { say: "A circle head.", ops: [{ op: "circle", x: 160, y: 80, r: 32 }] },
        { say: "Two triangle ears.", ops: [{ op: "path", d: "M132 64 L140 36 L156 60 Z M164 60 L180 36 L188 64 Z" }] },
        { say: "A tail curve.", ops: [{ op: "path", d: "M210 150 Q250 120 230 80" }] }
      ]
    },
    {
      id: "face",
      title: "Quiet face",
      bands: ["early", "primary"],
      paper: "Now draw a face on paper. Oval, eye line halfway, nose halfway down from there, mouth below.",
      steps: [
        { say: "An oval for the head.", ops: [{ op: "ellipse", x: 160, y: 110, rx: 70, ry: 90 }] },
        { say: "A light eye line across the middle.", ops: [{ op: "line", x1: 100, y1: 110, x2: 220, y2: 110 }] },
        { say: "Two eyes on that line.", ops: [{ op: "circle", x: 132, y: 110, r: 8 }, { op: "circle", x: 188, y: 110, r: 8 }] },
        { say: "A short nose.", ops: [{ op: "line", x1: 160, y1: 110, x2: 160, y2: 140 }] },
        { say: "A small mouth.", ops: [{ op: "path", d: "M140 158 Q160 170 180 158" }] }
      ]
    },
    {
      id: "tree",
      title: "Shore tree",
      bands: ["early"],
      paper: "Now draw a tree on paper: trunk wider at the base, crown as a cloud of loops.",
      steps: [
        { say: "A trunk, wider at the ground.", ops: [{ op: "path", d: "M145 200 L155 90 L165 90 L175 200 Z" }] },
        { say: "A crown of overlapping ovals.", ops: [{ op: "ellipse", x: 160, y: 70, rx: 60, ry: 40 }, { op: "ellipse", x: 120, y: 90, rx: 36, ry: 28 }, { op: "ellipse", x: 200, y: 90, rx: 36, ry: 28 }] }
      ]
    },
    {
      id: "apple",
      title: "Apple still life",
      bands: ["early", "primary"],
      paper: "Set one apple on a napkin. Draw what you see — contour first, then a shadow oval. Finish on paper.",
      steps: [
        { say: "A table line.", ops: [{ op: "line", x1: 20, y1: 170, x2: 300, y2: 170 }] },
        { say: "The apple’s round body.", ops: [{ op: "ellipse", x: 160, y: 120, rx: 48, ry: 44 }] },
        { say: "A stem and a leaf.", ops: [{ op: "line", x1: 160, y1: 76, x2: 160, y2: 58 }, { op: "path", d: "M160 62 Q190 50 186 78" }] },
        { say: "A soft shadow on the table.", ops: [{ op: "ellipse", x: 170, y: 172, rx: 50, ry: 10 }] }
      ]
    },
    {
      id: "butterfly",
      title: "Mirror butterfly",
      bands: ["early"],
      paper: "Fold paper down the middle. Draw one wing, then match the other. This is a mirror drawing.",
      steps: [
        { say: "A center fold line.", ops: [{ op: "line", x1: 160, y1: 20, x2: 160, y2: 200 }] },
        { say: "Body on the fold.", ops: [{ op: "ellipse", x: 160, y: 110, rx: 8, ry: 40 }] },
        { say: "Left wing.", ops: [{ op: "ellipse", x: 110, y: 100, rx: 40, ry: 50 }] },
        { say: "Right wing, same size.", ops: [{ op: "ellipse", x: 210, y: 100, rx: 40, ry: 50 }] }
      ]
    },
    {
      id: "vase-upside",
      title: "Upside-down vase",
      bands: ["early", "primary"],
      paper: "Turn a simple vase picture upside down and copy the edges, not the ‘idea’ of a vase. Then draw it right-way-up on paper.",
      steps: [
        { say: "Turn the page in your mind. Copy this edge.", ops: [{ op: "path", d: "M160 30 L200 70 L190 160 L130 160 L120 70 Z" }] },
        { say: "The opening is a shallow oval.", ops: [{ op: "ellipse", x: 160, y: 40, rx: 28, ry: 10 }] },
        { say: "Ignore the name. Chase the lines.", ops: [{ op: "line", x1: 130, y1: 90, x2: 190, y2: 90 }] }
      ]
    },
    {
      id: "pier-1pt",
      title: "One-point pier",
      bands: ["primary", "upper"],
      paper: "On paper, put a vanishing point on the horizon. Draw the pier planks running toward it. The app shows the idea; the page is the work.",
      steps: [
        { say: "Horizon line.", ops: [{ op: "line", x1: 10, y1: 70, x2: 310, y2: 70 }] },
        { say: "Vanishing point on the horizon.", ops: [{ op: "circle", x: 160, y: 70, r: 4 }] },
        { say: "Pier edges run to that point.", ops: [{ op: "line", x1: 40, y1: 200, x2: 160, y2: 70 }, { op: "line", x1: 280, y1: 200, x2: 160, y2: 70 }] },
        { say: "Planks as lines that get closer.", ops: [{ op: "line", x1: 70, y1: 170, x2: 250, y2: 170 }, { op: "line", x1: 95, y1: 140, x2: 225, y2: 140 }, { op: "line", x1: 118, y1: 110, x2: 202, y2: 110 }] }
      ]
    },
    {
      id: "cup-value",
      title: "Cup and value",
      bands: ["primary", "upper"],
      paper: "Draw a cup on paper. Shade a five-step value strip in the margin, then match the cup’s shadow to a step.",
      steps: [
        { say: "Cylinder sides.", ops: [{ op: "line", x1: 120, y1: 60, x2: 120, y2: 160 }, { op: "line", x1: 200, y1: 60, x2: 200, y2: 160 }] },
        { say: "Ellipses for rim and base.", ops: [{ op: "ellipse", x: 160, y: 60, rx: 40, ry: 14 }, { op: "ellipse", x: 160, y: 160, rx: 40, ry: 14 }] },
        { say: "A handle.", ops: [{ op: "path", d: "M200 90 Q240 110 200 140" }] },
        { say: "A value strip from light to dark.", ops: [{ op: "value", x: 20, y: 190, w: 280, n: 5 }] }
      ]
    },
    {
      id: "crate-2pt",
      title: "Two-point crate",
      bands: ["upper"],
      paper: "On paper, two vanishing points on the horizon. Draw a crate: verticals stay vertical. Finish the construction on paper.",
      steps: [
        { say: "Horizon with two vanishing points.", ops: [{ op: "line", x1: 10, y1: 80, x2: 310, y2: 80 }, { op: "circle", x: 30, y: 80, r: 4 }, { op: "circle", x: 290, y: 80, r: 4 }] },
        { say: "Nearest vertical edge.", ops: [{ op: "line", x1: 160, y1: 70, x2: 160, y2: 170 }] },
        { say: "Top edges run to each point.", ops: [{ op: "line", x1: 160, y1: 70, x2: 30, y2: 80 }, { op: "line", x1: 160, y1: 70, x2: 290, y2: 80 }] },
        { say: "Bottom edges too.", ops: [{ op: "line", x1: 160, y1: 170, x2: 30, y2: 80 }, { op: "line", x1: 160, y1: 170, x2: 290, y2: 80 }] }
      ]
    },
    {
      id: "gesture",
      title: "Gesture of a stander",
      bands: ["upper"],
      paper: "On paper, 30-second gesture: one line for the spine, simple marks for head, hips, feet. No details.",
      steps: [
        { say: "A head oval.", ops: [{ op: "ellipse", x: 160, y: 40, rx: 16, ry: 20 }] },
        { say: "Spine line.", ops: [{ op: "line", x1: 160, y1: 60, x2: 168, y2: 140 }] },
        { say: "Hips and legs as sticks.", ops: [{ op: "line", x1: 140, y1: 140, x2: 196, y2: 140 }, { op: "line", x1: 150, y1: 140, x2: 140, y2: 200 }, { op: "line", x1: 186, y1: 140, x2: 200, y2: 200 }] }
      ]
    },
    {
      id: "master-wave",
      title: "Line copy: Great Wave",
      bands: ["upper"],
      paper: "Look at Hokusai’s wave on the Looking Wall. On paper, copy only the biggest claw of foam with three or four lines. Do not trace the screen.",
      steps: [
        { say: "A long rising swell.", ops: [{ op: "path", d: "M20 160 Q80 140 140 80 Q180 50 250 70" }] },
        { say: "The claw curling over.", ops: [{ op: "path", d: "M250 70 Q280 40 230 30 Q200 50 220 80" }] },
        { say: "A small boat under it — a simple hull.", ops: [{ op: "path", d: "M90 170 L150 160 L140 175 Z" }] }
      ]
    }
  ],
  challenges: [
    {
      id: "mirror",
      title: "Mirror dock",
      bands: ["early", "primary", "upper"],
      say: "Draw on the fold. The pad copies the other side.",
      paper: "Second step: fold real paper and match a boat the same way."
    },
    {
      id: "upside",
      title: "Upside-down lines",
      bands: ["early", "primary", "upper"],
      say: "Copy the flipped edges on the pad. Do not name the object.",
      paper: "Second step: copy an upside-down picture on paper, then turn it."
    },
    {
      id: "abstract",
      title: "Abstract from still life",
      bands: ["primary", "upper"],
      say: "Dab the still life's biggest colors on the pad. No apple outline.",
      paper: "Second step: three shapes and three colors on paper."
    },
    {
      id: "perspective",
      title: "Pier perspective",
      bands: ["primary", "upper"],
      say: "Tap the pad. Each plank runs to the point on the horizon.",
      paper: "Second step: draw a one-point pier on paper."
    },
    {
      id: "value",
      title: "Five values",
      bands: ["upper"],
      say: "Tap the boxes so the strip runs dark to light.",
      paper: "Second step: shade a dark-to-light strip and a sphere on paper."
    },
    {
      id: "thirds",
      title: "Harbor thirds",
      bands: ["upper"],
      say: "Tap a crossing on the grid. The center box does not count.",
      paper: "Second step: thumbnail the harbor on paper with the boat off center."
    }
  ],
  artists: [
    { id: "vangogh", name: "Vincent van Gogh", years: "1853–1890", place: "Netherlands and France", fact: "He used thick paint and spinning night skies. Many pictures are now public domain because he died in 1890.", works: ["starry-night", "sunflowers", "bedroom-arles"] },
    { id: "monet", name: "Claude Monet", years: "1840–1926", place: "France", fact: "He painted the same harbor and garden in different light. Impression, Sunrise gave Impressionism its name.", works: ["impression-sunrise", "woman-parasol", "monet-japanese-bridge"] },
    { id: "rembrandt", name: "Rembrandt van Rijn", years: "1606–1669", place: "Dutch Republic", fact: "He studied faces with warm light and deep brown shadow.", works: ["night-watch", "rembrandt-self"] },
    { id: "vermeer", name: "Johannes Vermeer", years: "1632–1675", place: "Delft", fact: "Quiet rooms, pearl light, and careful cloth. Few paintings survive.", works: ["pearl-earring"] },
    { id: "homer", name: "Winslow Homer", years: "1836–1910", place: "United States", fact: "He painted working boats, weather, and the American shore.", works: ["breezing-up", "fog-warning"] },
    { id: "turner", name: "J. M. W. Turner", years: "1775–1851", place: "England", fact: "Steam, mist, and sun — ships dissolving into light.", works: ["fighting-temeraire"] },
    { id: "hokusai", name: "Katsushika Hokusai", years: "1760–1849", place: "Japan", fact: "Woodblock prints of waves and mountains, made to be printed many times.", works: ["great-wave"] },
    { id: "constable", name: "John Constable", years: "1776–1837", place: "England", fact: "He painted skies from weather he actually watched.", works: ["hay-wain"] },
    { id: "seurat", name: "Georges Seurat", years: "1859–1891", place: "France", fact: "He built pictures from many small dots of color.", works: ["grande-jatte"] },
    { id: "cassatt", name: "Mary Cassatt", years: "1844–1926", place: "United States and France", fact: "She painted everyday care — baths, reading, quiet rooms — with pastel and oil.", works: ["childs-bath"] },
    { id: "degas", name: "Edgar Degas", years: "1834–1917", place: "France", fact: "He drew dancers at rest and at the barre, often from odd angles.", works: ["dance-class"] },
    { id: "canaletto", name: "Canaletto", years: "1697–1768", place: "Venice", fact: "He painted harbor cities with ruler-straight canals and busy water.", works: ["canaletto-grand-canal"] },
    { id: "bruegel", name: "Pieter Bruegel the Elder", years: "c. 1525–1569", place: "Low Countries", fact: "He filled a town square with children’s games — a whole looking-page of play.", works: ["childrens-games"] },
    { id: "whistler", name: "James McNeill Whistler", years: "1834–1903", place: "United States and England", fact: "He treated a portrait like a quiet arrangement of grey and black.", works: ["whistlers-mother"] },
    { id: "fragonard", name: "Jean-Honoré Fragonard", years: "1732–1806", place: "France", fact: "A girl reading in a yellow dress — light on a book, not a battle.", works: ["girl-reading"] },
    { id: "sargent", name: "John Singer Sargent", years: "1856–1925", place: "United States and England", fact: "He painted lantern light in a garden at dusk.", works: ["sargent-carnation"] }
  ],
  artworks: [
    { id: "starry-night", file: "images/masters/starry-night.jpg", title: "The Starry Night", artist: "Vincent van Gogh", year: "1889", museum: "Museum of Modern Art, New York", credit: "Wikimedia Commons, public domain", look: ["What is the darkest dark?", "Which way do the swirls turn?", "Where is the quiet town?"], bands: ["toddler", "preschool", "early", "primary", "upper"], palette: ["#1c2a5a", "#d4c45a", "#3a4a2a"] },
    { id: "impression-sunrise", file: "images/masters/impression-sunrise.jpg", title: "Impression, Sunrise", artist: "Claude Monet", year: "1872", museum: "Musée Marmottan Monet, Paris", credit: "Wikimedia Commons, public domain", look: ["Find the orange sun.", "Are the boats sharp or soft?", "What color is the water, really?"], bands: ["preschool", "early", "primary", "upper"], palette: ["#6a8aa0", "#d45a2a", "#c8c0a8"] },
    { id: "pearl-earring", file: "images/masters/pearl-earring.jpg", title: "Girl with a Pearl Earring", artist: "Johannes Vermeer", year: "c. 1665", museum: "Mauritshuis, The Hague", credit: "Wikimedia Commons, public domain", look: ["Where does the light hit the face?", "What is the cloth on her head doing?", "Is the background busy or still?"], bands: ["early", "primary", "upper"], palette: ["#1a1a14", "#c45a2a", "#e8dcc0"] },
    { id: "night-watch", file: "images/masters/night-watch.jpg", title: "The Night Watch", artist: "Rembrandt van Rijn", year: "1642", museum: "Rijksmuseum, Amsterdam", credit: "Wikimedia Commons, public domain", look: ["Who steps into the light?", "Find a spear or a flag.", "Where is the deepest brown?"], bands: ["primary", "upper"], palette: ["#2a1a10", "#d4a05a", "#5a2a14"] },
    { id: "breezing-up", file: "images/masters/breezing-up.jpg", title: "Breezing Up (A Fair Wind)", artist: "Winslow Homer", year: "1873–76", museum: "National Gallery of Art, Washington", credit: "NGA open access / Wikimedia Commons, public domain", look: ["How many people in the boat?", "Which way is the wind?", "What is closest to us?"], bands: ["toddler", "preschool", "early", "primary", "upper"], palette: ["#6a8a9a", "#c4a06a", "#2a3a4a"] },
    { id: "fighting-temeraire", file: "images/masters/fighting-temeraire.jpg", title: "The Fighting Temeraire", artist: "J. M. W. Turner", year: "1839", museum: "National Gallery, London", credit: "Wikimedia Commons, public domain", look: ["Which ship is ghost-pale?", "Where is the sun?", "Steam or sail — which looks heavier?"], bands: ["early", "primary", "upper"], palette: ["#d49a5a", "#3a4a6a", "#c8b090"] },
    { id: "great-wave", file: "images/masters/great-wave.jpg", title: "The Great Wave off Kanagawa", artist: "Katsushika Hokusai", year: "c. 1831", museum: "Many impressions; British Museum and others", credit: "Wikimedia Commons, public domain", look: ["Find the boats.", "Where is the mountain?", "How does foam look like claws?"], bands: ["toddler", "preschool", "early", "primary", "upper"], palette: ["#2a4a7a", "#d8d0c4", "#1a1a14"] },
    { id: "hay-wain", file: "images/masters/hay-wain.jpg", title: "The Hay Wain", artist: "John Constable", year: "1821", museum: "National Gallery, London", credit: "Wikimedia Commons, public domain", look: ["Find the wagon in the water.", "What is the weather?", "Left bank or right bank — which is busier?"], bands: ["preschool", "early", "primary"], palette: ["#6a8a4a", "#c8d4e0", "#8a6a3a"] },
    { id: "woman-parasol", file: "images/masters/woman-parasol.jpg", title: "Woman with a Parasol", artist: "Claude Monet", year: "1875", museum: "National Gallery of Art, Washington", credit: "NGA open access / Wikimedia Commons, public domain", look: ["We look up — from where?", "What color is the shadow on her dress?", "Find the wind."], bands: ["early", "primary", "upper"], palette: ["#7aa0d0", "#d8d0c0", "#3a5a2a"] },
    { id: "sunflowers", file: "images/masters/sunflowers.jpg", title: "Sunflowers", artist: "Vincent van Gogh", year: "1888", museum: "Van Gogh Museum, Amsterdam", credit: "Wikimedia Commons, public domain", look: ["Count the blooms you can see.", "Which flower is drooping?", "Yellow on yellow — how does he separate them?"], bands: ["toddler", "preschool", "early", "primary"], palette: ["#d4a020", "#5a3a10", "#e8d080"] },
    { id: "bedroom-arles", file: "images/masters/bedroom-arles.jpg", title: "The Bedroom", artist: "Vincent van Gogh", year: "1889", museum: "Art Institute of Chicago", credit: "Wikimedia Commons, public domain", look: ["Are the walls square?", "What objects repeat in pairs?", "Where would you sit?"], bands: ["early", "primary", "upper"], palette: ["#3a6aaa", "#c45a4a", "#e8d080"] },
    { id: "grande-jatte", file: "images/masters/grande-jatte.jpg", title: "A Sunday on La Grande Jatte", artist: "Georges Seurat", year: "1884–86", museum: "Art Institute of Chicago", credit: "Wikimedia Commons, public domain", look: ["People are still — like a freeze.", "Find umbrellas.", "Dots of color mix in your eye, not on a pan."], bands: ["primary", "upper"], palette: ["#3a6a8a", "#d8c070", "#2a4a3a"] },
    { id: "childs-bath", file: "images/masters/childs-bath.jpg", title: "The Child’s Bath", artist: "Mary Cassatt", year: "1893", museum: "Art Institute of Chicago", credit: "Wikimedia Commons, public domain", look: ["Who is caring for whom?", "Look down — where is the painter sitting?", "Find the stripes."], bands: ["preschool", "early", "primary"], palette: ["#c45a4a", "#e8d0b0", "#3a5a4a"] },
    { id: "dance-class", file: "images/masters/dance-class.jpg", title: "The Dance Class", artist: "Edgar Degas", year: "c. 1874", museum: "Musée d’Orsay, Paris", credit: "Wikimedia Commons, public domain", look: ["Not everyone is dancing.", "Find the violin.", "Where does the floor go?"], bands: ["early", "primary", "upper"], palette: ["#c8b090", "#3a5aaa", "#e8e0d0"] },
    { id: "fog-warning", file: "images/masters/fog-warning.jpg", title: "The Fog Warning", artist: "Winslow Homer", year: "1885", museum: "Museum of Fine Arts, Boston", credit: "Wikimedia Commons, public domain", look: ["One man, one boat, a lot of water.", "Where is the weather coming from?", "What is he looking at?"], bands: ["primary", "upper"], palette: ["#4a6a7a", "#c8b090", "#2a3a44"] },
    { id: "rembrandt-self", file: "images/masters/rembrandt-self.jpg", title: "Self-Portrait", artist: "Rembrandt van Rijn", year: "c. 1665", museum: "Kenwood House / public-domain photograph", credit: "Wikimedia Commons, public domain", look: ["Light on the face, dark around it.", "What do the circles in the back do?", "How old does the painter seem?"], bands: ["primary", "upper"], palette: ["#2a1a10", "#d4b07a", "#5a3a20"] },
    { id: "canaletto-grand-canal", file: "images/masters/canaletto-grand-canal.jpg", title: "The Entrance to the Grand Canal, Venice", artist: "Canaletto", year: "c. 1730", museum: "Museum of Fine Arts, Houston / Google Art Project", credit: "Wikimedia Commons, public domain", look: ["Count the boats.", "Find the church dome.", "Which lines go far away?"], bands: ["preschool", "early", "primary", "upper"], palette: ["#6a8aaa", "#d8c8a0", "#3a4a5a"] },
    { id: "monet-japanese-bridge", file: "images/masters/monet-japanese-bridge.jpg", title: "The Japanese Footbridge", artist: "Claude Monet", year: "1899", museum: "National Gallery of Art, Washington", credit: "NGA open access / Wikimedia Commons, public domain", look: ["Find the arch.", "Water or leaves — which takes more space?", "Green on green: how many greens?"], bands: ["early", "primary", "upper"], palette: ["#3a6a3a", "#8ab05a", "#2a4a6a"] },
    { id: "childrens-games", file: "images/masters/childrens-games.jpg", title: "Children’s Games", artist: "Pieter Bruegel the Elder", year: "1560", museum: "Kunsthistorisches Museum, Vienna", credit: "Wikimedia Commons, public domain", look: ["Find a hoop, a pull, a pile-on.", "This is a looking game: pick one child and tell the story.", "Busy or empty streets?"], bands: ["early", "primary", "upper"], palette: ["#8a6a3a", "#c45a3a", "#6a8a5a"] },
    { id: "whistlers-mother", file: "images/masters/whistlers-mother.jpg", title: "Arrangement in Grey and Black No. 1", artist: "James McNeill Whistler", year: "1871", museum: "Musée d’Orsay, Paris", credit: "Wikimedia Commons, public domain", look: ["Grey, black, a little white. Why still interesting?", "Side view — what does that do?", "Find the curtain and the picture on the wall."], bands: ["primary", "upper"], palette: ["#4a4a4a", "#c8c0b0", "#1a1a14"] },
    { id: "girl-reading", file: "images/masters/girl-reading.jpg", title: "Young Girl Reading", artist: "Jean-Honoré Fragonard", year: "c. 1769", museum: "National Gallery of Art, Washington", credit: "NGA open access / Wikimedia Commons, public domain", look: ["What is she holding?", "Find the warmest color.", "Is she posing for us, or busy?"], bands: ["preschool", "early", "primary"], palette: ["#d4a028", "#c45a3a", "#e8dcc4"] },
    { id: "sargent-carnation", file: "images/masters/sargent-carnation.jpg", title: "Carnation, Lily, Lily, Rose", artist: "John Singer Sargent", year: "1885–86", museum: "Tate Britain, London", credit: "Wikimedia Commons, public domain", look: ["When is it? Morning or lantern-dusk?", "Find the paper lanterns.", "Flowers as tall as the children — why?"], bands: ["primary", "upper"], palette: ["#6a8a4a", "#d4a05a", "#e8d8c0"] }
  ],
  parentNotes: {
    baby: "High-contrast color and looking. Grown-up holds the session. Paint is a fat-finger smear on screen; real paint stays on a tray you control.",
    toddler: "Name colors and shapes out loud. Short canvas time. Masterpieces are for pointing, not quizzing.",
    preschool: "Watch a drawing lesson, then the child draws on paper. The screen is the demo.",
    early: "Lessons end on paper. Looking Wall asks what you see, not who is ‘best’.",
    primary: "Technique in the studio, work in the sketchbook. Perspective is a tool, not a test.",
    upper: "Master copy means a few honest lines on paper, not a printout trace."
  }
};

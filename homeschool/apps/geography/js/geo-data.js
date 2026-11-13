window.HS_BANDS = [
  { id: "baby", label: "Baby", blurb: "Sky, land, water, and a bouncing balloon." },
  { id: "toddler", label: "Toddler", blurb: "Tap big places. Stick a pin." },
  { id: "preschool", label: "Preschool", blurb: "Regions, oceans, and easy capitals." },
  { id: "early", label: "Early", blurb: "State groups and drag-and-drop pins." },
  { id: "primary", label: "Primary", blurb: "Capitals, rivers, mountains, trails." },
  { id: "upper", label: "Upper", blurb: "Full chart: 50 capitals and named features." }
];

window.HS_BAND_ORDER = ["baby", "toddler", "preschool", "early", "primary", "upper"];
window.hsBandAtLeast = function (band, min) {
  var o = window.HS_BAND_ORDER;
  return o.indexOf(band) >= o.indexOf(min || "baby");
};

window.HS_STATES = [
  { abbr: "ME", name: "Maine", capital: "Augusta", week: 1, region: "new-england" },
  { abbr: "NH", name: "New Hampshire", capital: "Concord", week: 1, region: "new-england" },
  { abbr: "MA", name: "Massachusetts", capital: "Boston", week: 1, region: "new-england" },
  { abbr: "RI", name: "Rhode Island", capital: "Providence", week: 1, region: "new-england" },
  { abbr: "CT", name: "Connecticut", capital: "Hartford", week: 1, region: "new-england" },
  { abbr: "VT", name: "Vermont", capital: "Montpelier", week: 2, region: "new-england" },
  { abbr: "NY", name: "New York", capital: "Albany", week: 2, region: "mid-atlantic" },
  { abbr: "NJ", name: "New Jersey", capital: "Trenton", week: 2, region: "mid-atlantic" },
  { abbr: "PA", name: "Pennsylvania", capital: "Harrisburg", week: 2, region: "mid-atlantic" },
  { abbr: "DE", name: "Delaware", capital: "Dover", week: 2, region: "mid-atlantic" },
  { abbr: "MD", name: "Maryland", capital: "Annapolis", week: 3, region: "mid-atlantic" },
  { abbr: "VA", name: "Virginia", capital: "Richmond", week: 3, region: "mid-atlantic" },
  { abbr: "WV", name: "West Virginia", capital: "Charleston", week: 3, region: "appalachia" },
  { abbr: "NC", name: "North Carolina", capital: "Raleigh", week: 3, region: "southeast" },
  { abbr: "SC", name: "South Carolina", capital: "Columbia", week: 3, region: "southeast" },
  { abbr: "DC", name: "Washington, D.C.", capital: "Washington", week: 3, region: "mid-atlantic" },
  { abbr: "GA", name: "Georgia", capital: "Atlanta", week: 4, region: "southeast" },
  { abbr: "FL", name: "Florida", capital: "Tallahassee", week: 4, region: "southeast" },
  { abbr: "AL", name: "Alabama", capital: "Montgomery", week: 4, region: "southeast" },
  { abbr: "MS", name: "Mississippi", capital: "Jackson", week: 4, region: "southeast" },
  { abbr: "LA", name: "Louisiana", capital: "Baton Rouge", week: 4, region: "south-central" },
  { abbr: "MI", name: "Michigan", capital: "Lansing", week: 5, region: "midwest" },
  { abbr: "OH", name: "Ohio", capital: "Columbus", week: 5, region: "ohio-valley" },
  { abbr: "IN", name: "Indiana", capital: "Indianapolis", week: 5, region: "midwest" },
  { abbr: "KY", name: "Kentucky", capital: "Frankfort", week: 5, region: "ohio-valley" },
  { abbr: "TN", name: "Tennessee", capital: "Nashville", week: 5, region: "southeast" },
  { abbr: "WI", name: "Wisconsin", capital: "Madison", week: 6, region: "midwest" },
  { abbr: "IL", name: "Illinois", capital: "Springfield", week: 6, region: "midwest" },
  { abbr: "IA", name: "Iowa", capital: "Des Moines", week: 6, region: "midwest" },
  { abbr: "MO", name: "Missouri", capital: "Jefferson City", week: 6, region: "midwest" },
  { abbr: "AR", name: "Arkansas", capital: "Little Rock", week: 6, region: "south-central" },
  { abbr: "MN", name: "Minnesota", capital: "St. Paul", week: 7, region: "midwest" },
  { abbr: "ND", name: "North Dakota", capital: "Bismarck", week: 7, region: "plains" },
  { abbr: "SD", name: "South Dakota", capital: "Pierre", week: 7, region: "plains" },
  { abbr: "WY", name: "Wyoming", capital: "Cheyenne", week: 7, region: "mountain" },
  { abbr: "NE", name: "Nebraska", capital: "Lincoln", week: 7, region: "plains" },
  { abbr: "KS", name: "Kansas", capital: "Topeka", week: 8, region: "plains" },
  { abbr: "OK", name: "Oklahoma", capital: "Oklahoma City", week: 8, region: "south-central" },
  { abbr: "TX", name: "Texas", capital: "Austin", week: 8, region: "south-central" },
  { abbr: "CO", name: "Colorado", capital: "Denver", week: 8, region: "mountain" },
  { abbr: "NM", name: "New Mexico", capital: "Santa Fe", week: 8, region: "southwest" },
  { abbr: "UT", name: "Utah", capital: "Salt Lake City", week: 9, region: "mountain" },
  { abbr: "AZ", name: "Arizona", capital: "Phoenix", week: 9, region: "southwest" },
  { abbr: "NV", name: "Nevada", capital: "Carson City", week: 9, region: "mountain" },
  { abbr: "CA", name: "California", capital: "Sacramento", week: 9, region: "pacific" },
  { abbr: "HI", name: "Hawaii", capital: "Honolulu", week: 9, region: "pacific" },
  { abbr: "MT", name: "Montana", capital: "Helena", week: 10, region: "mountain" },
  { abbr: "ID", name: "Idaho", capital: "Boise", week: 10, region: "mountain" },
  { abbr: "WA", name: "Washington", capital: "Olympia", week: 10, region: "pacific" },
  { abbr: "OR", name: "Oregon", capital: "Salem", week: 10, region: "pacific" },
  { abbr: "AK", name: "Alaska", capital: "Juneau", week: 10, region: "pacific" }
];

window.HS_FLIGHTS = [
  { id: "new-england", week: 1, title: "New England coast", type: "capitals", min: "toddler",
    states: ["ME", "NH", "MA", "RI", "CT"],
    fact: "Maine, New Hampshire, Massachusetts, Rhode Island, and Connecticut sit in New England. Capitals: Augusta, Concord, Boston, Providence, Hartford." },
  { id: "mid-north", week: 2, title: "Vermont to Delaware", type: "capitals", min: "toddler",
    states: ["VT", "NY", "NJ", "PA", "DE"],
    fact: "Vermont’s capital is Montpelier. New York’s is Albany. New Jersey’s is Trenton. Pennsylvania’s is Harrisburg. Delaware’s is Dover." },
  { id: "mid-south", week: 3, title: "Chesapeake to Carolina", type: "capitals", min: "preschool",
    states: ["MD", "VA", "WV", "NC", "SC", "DC"],
    fact: "Maryland–Annapolis, Virginia–Richmond, West Virginia–Charleston, North Carolina–Raleigh, South Carolina–Columbia, and Washington, D.C." },
  { id: "gulf-east", week: 4, title: "Southeast gulf edge", type: "capitals", min: "preschool",
    states: ["GA", "FL", "AL", "MS", "LA"],
    fact: "Georgia–Atlanta, Florida–Tallahassee, Alabama–Montgomery, Mississippi–Jackson, Louisiana–Baton Rouge." },
  { id: "ohio-valley", week: 5, title: "Lakes and bluegrass", type: "capitals", min: "preschool",
    states: ["MI", "OH", "IN", "KY", "TN"],
    fact: "Michigan–Lansing, Ohio–Columbus, Indiana–Indianapolis, Kentucky–Frankfort, Tennessee–Nashville." },
  { id: "midwest", week: 6, title: "Prairie capitals", type: "capitals", min: "early",
    states: ["WI", "IL", "IA", "MO", "AR"],
    fact: "Wisconsin–Madison, Illinois–Springfield, Iowa–Des Moines, Missouri–Jefferson City, Arkansas–Little Rock." },
  { id: "north-plains", week: 7, title: "Northern plains", type: "capitals", min: "early",
    states: ["MN", "ND", "SD", "WY", "NE"],
    fact: "Minnesota–St. Paul, North Dakota–Bismarck, South Dakota–Pierre, Wyoming–Cheyenne, Nebraska–Lincoln." },
  { id: "south-central", week: 8, title: "Southern plains and Rockies edge", type: "capitals", min: "early",
    states: ["KS", "OK", "TX", "CO", "NM"],
    fact: "Kansas–Topeka, Oklahoma–Oklahoma City, Texas–Austin, Colorado–Denver, New Mexico–Santa Fe." },
  { id: "far-west", week: 9, title: "Desert west and islands", type: "capitals", min: "early",
    states: ["UT", "AZ", "NV", "CA", "HI"],
    fact: "Utah–Salt Lake City, Arizona–Phoenix, Nevada–Carson City, California–Sacramento, Hawaii–Honolulu." },
  { id: "northwest", week: 10, title: "Northwest and Alaska", type: "capitals", min: "early",
    states: ["MT", "ID", "WA", "OR", "AK"],
    fact: "Montana–Helena, Idaho–Boise, Washington–Olympia, Oregon–Salem, Alaska–Juneau." },
  { id: "n-appalachians", week: 11, title: "Northern Appalachians", type: "features", min: "primary",
    features: [
      { id: "white-mountains", name: "White Mountains", hint: "New Hampshire" },
      { id: "green-mountains", name: "Green Mountains", hint: "Vermont" },
      { id: "adirondack", name: "Adirondack Mountains", hint: "New York" },
      { id: "allegheny", name: "Allegheny Mountains", hint: "Pennsylvania and south" }
    ],
    fact: "Four northern Appalachian names on this chart: White, Green, Adirondack, and Allegheny Mountains." },
  { id: "s-appalachians", week: 12, title: "Southern Appalachians", type: "features", min: "primary",
    features: [
      { id: "great-valley", name: "The Great Valley", hint: "through Virginia" },
      { id: "blue-ridge", name: "Blue Ridge", hint: "Virginia to Georgia" },
      { id: "great-smoky", name: "Great Smoky Mountains", hint: "Tennessee / North Carolina" },
      { id: "cumberland", name: "Cumberland Mountains", hint: "Kentucky / Tennessee" },
      { id: "mt-mitchell", name: "Mount Mitchell", hint: "highest peak in the East" }
    ],
    fact: "Southern Appalachian names: the Great Valley, Blue Ridge, Great Smoky Mountains, Cumberland Mountains, and Mount Mitchell." },
  { id: "west-mtns", week: 13, title: "Western mountains", type: "features", min: "primary",
    features: [
      { id: "rockies", name: "Rocky Mountains", hint: "spine of the west" },
      { id: "pikes-peak", name: "Pikes Peak", hint: "Colorado" },
      { id: "mt-elbert", name: "Mount Elbert", hint: "Colorado, highest Rockies summit in the 48" },
      { id: "sierra-nevada", name: "Sierra Nevada", hint: "California" },
      { id: "mt-whitney", name: "Mount Whitney", hint: "highest in the 48 states" }
    ],
    fact: "Western names: Rocky Mountains, Pikes Peak, Mount Elbert, Sierra Nevada, Mount Whitney." },
  { id: "nw-mtns", week: 14, title: "Northwest mountains", type: "features", min: "primary",
    features: [
      { id: "cascades", name: "Cascade Range", hint: "Washington to California" },
      { id: "mt-rainier", name: "Mount Rainier", hint: "Washington" },
      { id: "mt-st-helens", name: "Mount St. Helens", hint: "Washington volcano" },
      { id: "denali", name: "Denali", hint: "Alaska, highest in North America" }
    ],
    fact: "Northwest names: Cascades, Mount Rainier, Mount St. Helens, and Denali." },
  { id: "great-lakes", week: 15, title: "Five Great Lakes", type: "lakes", min: "preschool",
    lakes: ["Huron", "Ontario", "Michigan", "Erie", "Superior"],
    fact: "The five Great Lakes are Huron, Ontario, Michigan, Erie, and Superior. HOMES is a memory trick you may invent yourself — this app just names the lakes." },
  { id: "bays", week: 16, title: "Five bays", type: "features", min: "primary",
    features: [
      { id: "chesapeake", name: "Chesapeake Bay", hint: "Maryland / Virginia" },
      { id: "hudson-bay-ny", name: "Hudson (New York harbor/estuary)", hint: "New York" },
      { id: "sf-bay", name: "San Francisco Bay", hint: "California" },
      { id: "puget", name: "Puget Sound", hint: "Washington" },
      { id: "pamlico", name: "Pamlico Sound", hint: "North Carolina" }
    ],
    fact: "Five waters on this chart: Chesapeake Bay, the Hudson, San Francisco Bay, Puget Sound, and Pamlico Sound." },
  { id: "rivers-east", week: 17, title: "Eastern rivers", type: "rivers", min: "early",
    rivers: [
      { id: "st-lawrence", name: "St. Lawrence River" },
      { id: "ohio", name: "Ohio River" },
      { id: "mississippi", name: "Mississippi River" },
      { id: "missouri", name: "Missouri River" },
      { id: "arkansas-river", name: "Arkansas River" }
    ],
    fact: "East-side names: St. Lawrence, Ohio, Mississippi, Missouri, and Arkansas Rivers." },
  { id: "rivers-west", week: 18, title: "Western waters", type: "rivers", min: "early",
    rivers: [
      { id: "colorado", name: "Colorado River" },
      { id: "red", name: "Red River" },
      { id: "rio-grande", name: "Rio Grande" },
      { id: "columbia", name: "Columbia River" },
      { id: "great-salt-lake", name: "Great Salt Lake" }
    ],
    fact: "West-side names: Colorado River, Red River, Rio Grande, Columbia River, and Great Salt Lake." },
  { id: "trails", week: 19, title: "Seven historic trails", type: "quiz", min: "primary",
    trails: ["Cumberland Road", "Santa Fe Trail", "Mormon Trail", "Gila Trail", "Old Spanish Trail", "California Trail", "Oregon Trail"],
    fact: "Seven historic routes: Cumberland Road, Santa Fe, Mormon, Gila, Old Spanish, California, and Oregon Trails." },
  { id: "canals", week: 20, title: "Five canals", type: "quiz", min: "primary",
    canals: ["Erie Canal", "Pennsylvania Canal", "Chesapeake and Ohio Canal", "Ohio and Erie Canal", "Miami and Erie Canal"],
    fact: "Five canal names: Erie; Pennsylvania; Chesapeake and Ohio; Ohio and Erie; Miami and Erie." },
  { id: "native-regions", week: 21, title: "Seven Native regions", type: "quiz", min: "primary",
    regions: ["Eastern Woodlands", "Plains", "Plateau", "Northwest Coast", "California", "Great Basin", "Southwest"],
    fact: "Seven culture-area names used by geographers: Eastern Woodlands, Plains, Plateau, Northwest Coast, California, Great Basin, and Southwest. These are place-group names, not a single nation’s story." },
  { id: "deserts", week: 22, title: "Five deserts", type: "features", min: "primary",
    features: [
      { id: "mojave", name: "Mojave Desert", hint: "California" },
      { id: "sonoran", name: "Sonoran Desert", hint: "Arizona / Mexico" },
      { id: "colorado-desert", name: "Colorado Desert", hint: "southern California" },
      { id: "painted-desert", name: "Painted Desert", hint: "Arizona" },
      { id: "great-salt-lake-desert", name: "Great Salt Lake Desert", hint: "Utah" }
    ],
    fact: "Five desert names: Mojave, Sonoran, Colorado, Painted, and Great Salt Lake Desert." },
  { id: "features-a", week: 23, title: "Six famous features", type: "features", min: "early",
    features: [
      { id: "grand-canyon", name: "Grand Canyon", hint: "Arizona" },
      { id: "black-hills", name: "Black Hills", hint: "South Dakota" },
      { id: "ozark", name: "Ozark Highlands", hint: "Missouri / Arkansas" },
      { id: "okefenokee", name: "Okefenokee Swamp", hint: "Georgia / Florida" },
      { id: "olympic", name: "Olympic rain forests", hint: "Washington" },
      { id: "niagara", name: "Niagara Falls", hint: "New York / Canada" }
    ],
    fact: "Grand Canyon, Black Hills, Ozark Highlands, Okefenokee Swamp, Olympic rain forests, Niagara Falls." },
  { id: "features-b", week: 24, title: "Five more features", type: "features", min: "early",
    features: [
      { id: "ms-delta", name: "Mississippi River Delta", hint: "Louisiana" },
      { id: "mammoth-cave", name: "Mammoth Cave", hint: "Kentucky" },
      { id: "san-andreas", name: "San Andreas Fault", hint: "California" },
      { id: "gulf", name: "Gulf of Mexico", hint: "south of the U.S. coast" },
      { id: "death-valley", name: "Death Valley", hint: "California" }
    ],
    fact: "Mississippi River Delta, Mammoth Cave, San Andreas Fault, Gulf of Mexico, Death Valley." }
];

window.HS_GEO_SONGS = [
  {
    id: "theme",
    title: "Basket and Burner",
    min: "baby",
    lyrics: "Basket and burner, up we go.\nRivers like ribbons, mountains below.\nPin on the capital, name every state.\nThe map is our playground, the sky is the gate.",
    melody: [
      { f: 392, d: 0.3 }, { f: 440, d: 0.3 }, { f: 494, d: 0.4 },
      { f: 523, d: 0.3 }, { f: 494, d: 0.3 }, { f: 392, d: 0.5 },
      { f: 330, d: 0.3 }, { f: 392, d: 0.3 }, { f: 440, d: 0.55 }
    ]
  },
  {
    id: "homes",
    title: "Five Lakes Aloft",
    min: "preschool",
    lyrics: "Huron rolling, Ontario wide.\nMichigan shining on the western side.\nErie is shallow, Superior deep —\nFive freshwater giants the balloon can sweep.",
    melody: [
      { f: 349, d: 0.3 }, { f: 392, d: 0.3 }, { f: 440, d: 0.4 },
      { f: 392, d: 0.3 }, { f: 330, d: 0.3 }, { f: 294, d: 0.5 }
    ]
  },
  {
    id: "capitals",
    title: "Pin the Capital",
    min: "early",
    lyrics: "Augusta in Maine, and Boston by the bay.\nAustin in Texas, then Sacramento way.\nEvery capital city is a pin in the chart —\nDrop it true and the balloon can depart.",
    melody: [
      { f: 440, d: 0.25 }, { f: 494, d: 0.25 }, { f: 523, d: 0.25 }, { f: 587, d: 0.45 },
      { f: 523, d: 0.3 }, { f: 440, d: 0.3 }, { f: 392, d: 0.5 }
    ]
  }
];

window.HS_BABY_GEO = [
  { id: "balloon", label: "Balloon", sound: "burner", talk: "The balloon goes up." },
  { id: "cloud", label: "Cloud", sound: "wind", talk: "Soft cloud." },
  { id: "water", label: "Water", sound: "wind", talk: "Blue water." },
  { id: "land", label: "Land", sound: "pinDrop", talk: "Brown land." },
  { id: "mountain", label: "Mountain", sound: "whoosh", talk: "A high mountain." },
  { id: "river", label: "River", sound: "wind", talk: "A long river." }
];

window.HSScienceData = (function () {
  const ALL = ["baby", "toddler", "preschool", "early", "primary", "upper"];
  const KID = ["toddler", "preschool", "early", "primary", "upper"];
  const SCHOOL = ["early", "primary", "upper"];
  const MID = ["primary", "upper"];
  const UP = ["upper"];

  const bands = [
    { id: "baby", label: "Nest", map: "Soft light, big shapes, quiet taps.", img: "images/ui/baby-leaf.svg" },
    { id: "toddler", label: "Meadow", map: "Tap, match, and stamp living things.", img: "images/habitats/meadow.svg" },
    { id: "preschool", label: "Garden Path", map: "Habitats, plant parts, and weather walks.", img: "images/habitats/garden.svg" },
    { id: "early", label: "Creek Trail", map: "Senses, simple machines, and first body notes.", img: "images/habitats/stream.svg" },
    { id: "primary", label: "Ridge", map: "Body systems and field chemistry beginnings.", img: "images/habitats/mountain.svg" },
    { id: "upper", label: "Summit Lab", map: "Anatomy, elements, and creation field notes.", img: "images/creation/heavens.svg" }
  ];

  const habitats = [
    { id: "forest", name: "Woodland", img: "images/habitats/forest.svg", bands: KID, blurb: "Layered trees, a creek terrace, and shade-loving plants. God packed a forest with stacked homes.", finds: ["oak-leaf", "fern", "robin", "moss", "earthworm"], read: "A woodland is a living stack. Birds take the high rooms. Ferns and moss take the damp floor. A creek cuts a cool path." },
    { id: "meadow", name: "Meadow", img: "images/habitats/meadow.svg", bands: KID, blurb: "Open grass, wild bloom, and swallows.", finds: ["dandelion", "bee", "butterfly", "feather"], read: "A meadow is sunlight on stems. Bees work the flowers. Grass hides seeds and small mammals." },
    { id: "pond", name: "Pond", img: "images/habitats/pond.svg", bands: KID, blurb: "Still water, lily pads, and a frog's leap.", finds: ["frog", "fish"], read: "A pond holds still water. Frogs start as tadpoles. Fish take oxygen from water with gills." },
    { id: "garden", name: "Garden", img: "images/habitats/garden.svg", bands: KID, blurb: "Beds, bean poles, and kitchen paths.", finds: ["bean-seed", "bee", "earthworm"], read: "A garden is a partnership. We plant. God designed the seed to know the plant it should become." },
    { id: "shore", name: "Shore", img: "images/habitats/shore.svg", bands: KID, blurb: "Tide line, shells, and gulls.", finds: ["shell", "feather", "fish"], read: "The shore is where land and water trade places. Shells are houses left behind." },
    { id: "desert", name: "Desert", img: "images/habitats/desert.svg", bands: SCHOOL, blurb: "Dry wash, cactus, stored water.", finds: ["pine"], read: "A desert is not empty. Plants here store water and rest in the heat. Design fits the place." },
    { id: "mountain", name: "High country", img: "images/habitats/mountain.svg", bands: SCHOOL, blurb: "Ridges, thin air, snow line.", finds: ["pine", "moss"], read: "Mountains change as you climb: trees shorten, air cools, snow may stay." },
    { id: "sky", name: "Open sky", img: "images/habitats/sky.svg", bands: KID, blurb: "Sun, heaped cloud, a swallow stoop.", finds: ["feather"], read: "The sky is a weather workshop. The same sun that warms a meadow also drives the water cycle." },
    { id: "stream", name: "Stream", img: "images/habitats/stream.svg", bands: KID, blurb: "Riffles, stones, alder shade.", finds: ["fish", "moss", "fern"], read: "Moving water carries grit and cools the banks. Some animals are built for current." },
    { id: "yard", name: "Yard", img: "images/habitats/yard.svg", bands: KID, blurb: "Doorstep, shade tree, feeder.", finds: ["robin", "oak-leaf", "dandelion", "earthworm"], read: "A yard is a small expedition. Look down. Look up. Write what repeats." }
  ];

  const specimens = [
    { id: "oak-leaf", name: "Oak leaf", latin: "Quercus", img: "images/specimens/oak-leaf.svg", kind: "plant", habitat: "forest", bands: KID, fact: "Oak leaves have deep lobes. The tree holds acorns, each a seed with food packed around a baby oak.", design: "A leaf is a solar panel and a rain hat at once." },
    { id: "maple-leaf", name: "Maple leaf", latin: "Acer", img: "images/specimens/maple-leaf.svg", kind: "plant", habitat: "yard", bands: KID, fact: "Maple leaves show palmate veins, like fingers from a palm. In fall the green fades and other colors show.", design: "Veins are roads for water and sugar." },
    { id: "pine", name: "Pine", latin: "Pinus", img: "images/specimens/pine.svg", kind: "plant", habitat: "mountain", bands: KID, fact: "Pines keep needle leaves all year. Needles lose less water than broad leaves.", design: "Winter green is not a trick; it is a design for poor, cold soils and thin air." },
    { id: "dandelion", name: "Dandelion", latin: "Taraxacum", img: "images/specimens/dandelion.svg", kind: "plant", habitat: "meadow", bands: KID, fact: "The yellow head is many tiny flowers packed together. The seed rides a plume of down.", design: "One plant can feed a bee and later sail a seed on the wind." },
    { id: "fern", name: "Fern", latin: "Pteridophyta", img: "images/specimens/fern.svg", kind: "plant", habitat: "forest", bands: SCHOOL, fact: "Ferns make no flowers. They raise dust-like spores on the undersides of fronds.", design: "Even plants without petals follow an orderly life cycle." },
    { id: "moss", name: "Moss", latin: "Bryophyta", img: "images/specimens/moss.svg", kind: "plant", habitat: "forest", bands: SCHOOL, fact: "Moss drinks through its body. It has no true roots or tubes like a tree.", design: "A green cushion on a stone is a whole tiny forest." },
    { id: "bean-seed", name: "Bean seed", latin: "Seed", img: "images/specimens/bean-seed.svg", kind: "plant", habitat: "garden", bands: KID, fact: "Inside a bean: a baby plant and a lunch. Warmth and water wake it.", design: "A seed carries a plan. The plan does not write itself." },
    { id: "robin", name: "Robin", latin: "Turdus", img: "images/specimens/robin.svg", kind: "bird", habitat: "yard", bands: KID, fact: "Robins hop on grass and tug worms. A thin bill fits that work.", design: "Bill, breast, and song each fit a yard life." },
    { id: "frog", name: "Frog", latin: "Rana", img: "images/specimens/frog.svg", kind: "beast", habitat: "pond", bands: KID, fact: "A frog begins in water with gills, then grows lungs and legs.", design: "Two rooms of life, one body plan: water then land." },
    { id: "butterfly", name: "Butterfly", latin: "Lepidoptera", img: "images/specimens/butterfly.svg", kind: "creeping", habitat: "meadow", bands: KID, fact: "Wings are tiled with tiny scales. A coiled mouth sips nectar.", design: "Caterpillar and butterfly are one creature in two work clothes." },
    { id: "fish", name: "Fish", latin: "Pisces", img: "images/specimens/fish.svg", kind: "fish", habitat: "pond", bands: KID, fact: "Gills take oxygen from water. Fins write the turns.", design: "A fish is a water kind, complete in its place." },
    { id: "bee", name: "Honeybee", latin: "Apis", img: "images/specimens/bee.svg", kind: "creeping", habitat: "garden", bands: KID, fact: "Bees pack pollen on their legs and carry it from flower to flower. Many fruits begin with that visit.", design: "Flower and bee fit like lock and key." },
    { id: "earthworm", name: "Earthworm", latin: "Lumbricus", img: "images/specimens/earthworm.svg", kind: "creeping", habitat: "garden", bands: KID, fact: "Worms swallow soil, grind it, and leave it richer. Tunnels let rain in.", design: "A gardener with no hands." },
    { id: "feather", name: "Feather", latin: "Remex", img: "images/specimens/feather.svg", kind: "bird", habitat: "sky", bands: KID, fact: "A shaft holds vanes of barbs that zip together. Light, strong, and replaceable.", design: "Flight is engineering in keratin." },
    { id: "shell", name: "Shell", latin: "Gastropoda", img: "images/specimens/shell.svg", kind: "creeping", habitat: "shore", bands: KID, fact: "A snail grows its house from the mantle. The spiral is a growing room.", design: "A portable home built from seawater minerals." }
  ];

  const machines = [
    { id: "lever", name: "Lever", img: "images/machines/lever.svg", bands: ["preschool"].concat(SCHOOL), fact: "A lever is a bar that turns on a fulcrum. A crowbar, a bottle opener, and a see-saw are levers.", body: "Your jaw is a lever. Teeth are the load." },
    { id: "wheel", name: "Wheel and axle", img: "images/machines/wheel.svg", bands: ["preschool"].concat(SCHOOL), fact: "When a wheel turns, its axle turns with it. A doorknob is a small wheel and axle.", body: "A rolling log was an early axle idea people noticed in God's world of round things." },
    { id: "pulley", name: "Pulley", img: "images/machines/pulley.svg", bands: SCHOOL, fact: "A pulley is a wheel that holds a rope. It can change the direction of a pull.", body: "A flagpole uses a pulley so you pull down to raise the flag." },
    { id: "ramp", name: "Inclined plane", img: "images/machines/ramp.svg", bands: ["preschool"].concat(SCHOOL), fact: "A ramp spreads lifting work over a longer path. A slide and a driveway are ramps.", body: "A hillside path is a ramp the land already made." },
    { id: "wedge", name: "Wedge", img: "images/machines/wedge.svg", bands: SCHOOL, fact: "A wedge is two ramps back to back. An axe head and a doorstop are wedges.", body: "A front tooth is a wedge for cutting food." },
    { id: "screw", name: "Screw", img: "images/machines/screw.svg", bands: SCHOOL, fact: "A screw is an inclined plane wrapped around a post. It holds tight and can lift a jar lid.", body: "A spiral shell shows the same wrapped-plane idea in a living house." }
  ];

  const weather = [
    { id: "sun", name: "Sun", img: "images/weather/sun.svg", bands: KID, fact: "The sun is a great light God set to rule the day. It warms land and lifts water as vapor." },
    { id: "rain", name: "Rain", img: "images/weather/rain.svg", bands: KID, fact: "Rain falls when cloud drops grow too heavy. It waters roots and fills creeks." },
    { id: "snow", name: "Snow", img: "images/weather/snow.svg", bands: KID, fact: "Snow is ice grown in six-armed crystals. Cold air keeps the pattern until it melts." },
    { id: "wind", name: "Wind", img: "images/weather/wind.svg", bands: KID, fact: "Wind is moving air. Uneven heat makes air rise, slide, and rush." },
    { id: "cycle", name: "Water cycle", img: "images/weather/cycle.svg", bands: SCHOOL, fact: "Water evaporates, travels as vapor, condenses into cloud, falls, and runs home to river and sea." },
    { id: "cloud-cumulus", name: "Cumulus", img: "images/weather/cloud-cumulus.svg", bands: SCHOOL, fact: "Cumulus clouds are heaped piles with flat bases. Fair weather often wears them." },
    { id: "cloud-stratus", name: "Stratus", img: "images/weather/cloud-stratus.svg", bands: SCHOOL, fact: "Stratus is a low gray sheet that can drizzle for hours." },
    { id: "cloud-cirrus", name: "Cirrus", img: "images/weather/cloud-cirrus.svg", bands: SCHOOL, fact: "Cirrus are high ice threads. They can mean a change is coming." }
  ];

  const senses = [
    { id: "sight", name: "Sight", organ: "eyes", img: "images/creation/eye.svg", bands: KID, fact: "Eyes gather light. Lenses bend it so a picture lands on the back wall, the retina." },
    { id: "hearing", name: "Hearing", organ: "ears", img: "images/body/senses.svg", bands: KID, fact: "Ears catch sound waves. Tiny bones pass the shake to a coiled inner ear." },
    { id: "smell", name: "Smell", organ: "nose", img: "images/body/senses.svg", bands: KID, fact: "The nose reads chemicals in air. Smell and taste work as partners." },
    { id: "taste", name: "Taste", organ: "tongue", img: "images/body/senses.svg", bands: KID, fact: "Taste buds notice sweet, sour, salty, bitter, and savory. The rest is smell." },
    { id: "touch", name: "Touch", organ: "skin", img: "images/body/senses.svg", bands: KID, fact: "Skin is a covering full of sensors for pressure, pain, and temperature." }
  ];

  const topics = [
    { id: "tissue", marker: 1, title: "Four types of tissue", bands: MID, img: "images/body/senses.svg", notes: "The body is built of four tissue kinds: covering tissue (epithelial), supporting tissue (connective), moving tissue (muscle), and signaling tissue (nervous). A tissue is a team of similar cells with one job.", quiz: [
      { q: "What is a tissue?", a: ["A team of similar cells with one job", "A whole organ", "A kind of bone only", "A drop of blood"], ok: 0 },
      { q: "Which tissue covers and lines?", a: ["Epithelial", "Muscle", "Nervous", "Blood only"], ok: 0 },
      { q: "Which tissue is built to contract and move?", a: ["Muscle", "Epithelial", "Fat only", "Enamel"], ok: 0 },
      { q: "Which tissue carries messages?", a: ["Nervous", "Connective only", "Skin oil", "Marrow"], ok: 0 }
    ]},
    { id: "axial", marker: 2, title: "Axial skeleton", bands: MID, img: "images/body/axial-skeleton.svg", notes: "The axial skeleton is the body's midline frame: skull, backbone (vertebrae), ribs, and breastbone (sternum). It guards brain, spinal cord, and chest organs. Arms and legs belong to the appendicular skeleton.", quiz: [
      { q: "The axial skeleton is the bones of the…", a: ["Head and trunk", "Hands only", "Feet only", "Ears"], ok: 0 },
      { q: "Which set belongs to the axial skeleton?", a: ["Skull, spine, ribs, sternum", "Femur and tibia", "Clavicle and scapula only", "Finger bones"], ok: 0 },
      { q: "The backbone is a stack of bones called…", a: ["Vertebrae", "Tarsals", "Phalanges", "Carpals"], ok: 0 },
      { q: "The sternum is the…", a: ["Breastbone", "Kneecap", "Jaw hinge", "Heel"], ok: 0 }
    ]},
    { id: "muscle", marker: 3, title: "Three kinds of muscle", bands: MID, img: "images/body/heart.svg", notes: "Skeletal muscle moves bones when you choose. Smooth muscle lives in organs and works without a thought. Cardiac muscle is the heart's own never-resting muscle.", quiz: [
      { q: "Which muscle kind do you use to pick up a rock?", a: ["Skeletal", "Cardiac", "Smooth only", "None"], ok: 0 },
      { q: "Which muscle kind is only in the heart?", a: ["Cardiac", "Skeletal", "Smooth", "Epithelial"], ok: 0 },
      { q: "Stomach walls use…", a: ["Smooth muscle", "Skeletal muscle", "Cardiac muscle", "Cartilage"], ok: 0 },
      { q: "A mark of cardiac muscle is that it…", a: ["Keeps a beat without you asking", "Only works in fingers", "Turns to bone", "Tastes food"], ok: 0 }
    ]},
    { id: "nervous", marker: 4, title: "Three parts of the nervous system", bands: MID, img: "images/body/axial-skeleton.svg", notes: "A simple field split: the brain, the spinal cord, and the nerves that branch into the body. Brain and spinal cord are the central desk. Nerves are the message roads.", quiz: [
      { q: "The three parts we map here are…", a: ["Brain, spinal cord, and nerves", "Heart, lung, and liver", "Skin, hair, and nails", "Bone, fat, and tooth"], ok: 0 },
      { q: "The spinal cord is…", a: ["A cable of nerves guarded by vertebrae", "A muscle in the arm", "A kind of blood", "A sense of smell"], ok: 0 },
      { q: "Nerves that run out into arms and legs belong to the…", a: ["Body's message roads", "Stomach acid", "Tooth enamel", "Tear ducts only"], ok: 0 },
      { q: "The brain's job in this picture is to…", a: ["Receive, decide, and send", "Pump blood", "Filter urine", "Store bile"], ok: 0 }
    ]},
    { id: "senses", marker: 5, title: "Five senses", bands: ["preschool", "early", "primary", "upper"], img: "images/body/senses.svg", notes: "Sight, hearing, smell, taste, and touch. Each sense is a designed doorway so a living body can know the world God made.", quiz: [
      { q: "How many senses do we map on this trail?", a: ["Five", "Two", "Twelve", "Zero"], ok: 0 },
      { q: "The organ of sight is the…", a: ["Eye", "Elbow", "Lung", "Shin"], ok: 0 },
      { q: "Taste and smell often work…", a: ["Together", "Only at night", "Only in water", "Never"], ok: 0 },
      { q: "Touch sensors live mostly in the…", a: ["Skin", "Hair only", "Teeth only", "Nails only"], ok: 0 }
    ]},
    { id: "digestive", marker: 6, title: "Digestive system parts", bands: MID, img: "images/body/digestive.svg", notes: "Food's path: mouth, esophagus, stomach, small intestine, large intestine. Helpers: liver, pancreas, gallbladder. The design is a long workshop that takes a meal apart into useful pieces.", quiz: [
      { q: "The tube that carries swallowed food to the stomach is the…", a: ["Esophagus", "Trachea", "Ureter", "Aorta"], ok: 0 },
      { q: "Most nutrient soaking happens in the…", a: ["Small intestine", "Teeth", "Hair", "Nails"], ok: 0 },
      { q: "The stomach's job is to…", a: ["Churn and start breaking food", "Pump blood", "Store urine", "Make tears"], ok: 0 },
      { q: "The liver, among other jobs, helps with…", a: ["Handling food chemicals", "Hearing", "Balance only", "Growing hair"], ok: 0 }
    ]},
    { id: "excretory", marker: 7, title: "Excretory system", bands: MID, img: "images/body/digestive.svg", notes: "Four parts of the urinary trail: kidneys, ureters, bladder, urethra. Kidneys filter blood. Ureters are the pipes down. The bladder is a holding room. The urethra is the exit path.", quiz: [
      { q: "Which organs filter blood and make urine?", a: ["Kidneys", "Lungs only", "Ears", "Eyelids"], ok: 0 },
      { q: "Ureters carry urine from kidneys to the…", a: ["Bladder", "Heart", "Brain", "Stomach"], ok: 0 },
      { q: "The bladder is mainly a…", a: ["Holding room", "Pump", "Lens", "Feather"], ok: 0 },
      { q: "The urethra is the…", a: ["Exit path", "Voice box", "Collarbone", "Eardrum"], ok: 0 }
    ]},
    { id: "circulatory", marker: 8, title: "Circulatory system", bands: MID, img: "images/body/heart.svg", notes: "Six field parts: heart, arteries, veins, capillaries, blood, and valves. The heart pumps. Arteries go out. Veins return. Capillaries are the thin meeting rooms. Valves keep one-way flow.", quiz: [
      { q: "The pump of the circulatory system is the…", a: ["Heart", "Kidney", "Skin", "Tooth"], ok: 0 },
      { q: "Vessels that carry blood away from the heart are…", a: ["Arteries", "Veins only", "Tendons", "Ligaments"], ok: 0 },
      { q: "The tiniest vessels, where goods are traded, are…", a: ["Capillaries", "Bones", "Nails", "Horns"], ok: 0 },
      { q: "Valves are there to…", a: ["Keep blood from flowing backward", "Taste food", "Bend light", "Store fat only"], ok: 0 }
    ]},
    { id: "lymph", marker: 9, title: "Lymph system", bands: MID, img: "images/body/heart.svg", notes: "Four parts: lymph fluid, lymph vessels, lymph nodes, and the spleen. This quiet system returns fluid, filters it, and helps the body notice germs.", quiz: [
      { q: "Lymph is mostly…", a: ["Clear fluid from around cells", "Solid bone", "Tooth enamel", "Hair oil only"], ok: 0 },
      { q: "Lymph nodes are like…", a: ["Filter stations", "Pumps like the heart", "Lenses", "Eardrums"], ok: 0 },
      { q: "The spleen, among other jobs, helps with…", a: ["Blood and germ watch", "Hearing high notes", "Growing nails", "Blinking"], ok: 0 },
      { q: "Lymph vessels are…", a: ["Tubes that carry lymph", "Bones of the face", "Parts of a feather", "Cloud types"], ok: 0 }
    ]},
    { id: "respiratory", marker: 10, title: "Respiratory system parts", bands: MID, img: "images/body/lungs.svg", notes: "Air's path: nose (or mouth), throat, voice box, windpipe (trachea), bronchi, lungs. The diaphragm is the muscle floor that helps you breathe.", quiz: [
      { q: "The windpipe's other name is the…", a: ["Trachea", "Esophagus", "Ureter", "Aorta"], ok: 0 },
      { q: "Bronchi are tubes that lead into the…", a: ["Lungs", "Kidneys", "Ears", "Toes"], ok: 0 },
      { q: "The diaphragm is a…", a: ["Breathing muscle under the lungs", "Tiny bone in the ear", "Taste bud", "Eyelash"], ok: 0 },
      { q: "Lungs are packed with tiny air sacs so that…", a: ["Gases can trade with blood", "Food can be stored", "Sound can be tasted", "Hair can grow"], ok: 0 }
    ]},
    { id: "endocrine", marker: 11, title: "Endocrine system", bands: MID, img: "images/body/heart.svg", notes: "Glands send chemical messengers called hormones through the blood. The pituitary in the head is a chief messenger gland. Other glands help with growth, sugar use, and the body's pace.", quiz: [
      { q: "Hormones are…", a: ["Chemical messengers in the blood", "Tiny bones", "Kinds of teeth", "Clouds"], ok: 0 },
      { q: "The endocrine system works mainly by…", a: ["Glands", "Feathers", "Bark", "Pollen"], ok: 0 },
      { q: "The pituitary gland sits in the…", a: ["Head", "Heel", "Thumb", "Earlobe only"], ok: 0 },
      { q: "Compared with a nerve zap, a hormone message is often…", a: ["Slower and longer lasting", "A sound you hear", "A color you see", "A kind of rock"], ok: 0 }
    ]},
    { id: "blood", marker: 12, title: "Major purposes of blood", bands: MID, img: "images/body/heart.svg", notes: "Blood carries oxygen, carries food bits, hauls wastes, helps fight germs, helps seal cuts, and spreads heat. One river, many jobs.", quiz: [
      { q: "Blood carries oxygen mainly with the help of…", a: ["Red cells", "Hair", "Nails", "Enamel"], ok: 0 },
      { q: "A purpose of blood is to…", a: ["Carry wastes away from cells", "Write memories in stone", "Make thunder", "Hold up a tree"], ok: 0 },
      { q: "When you cut a finger, blood helps by…", a: ["Clotting to seal the cut", "Turning into bone", "Becoming lymph nodes", "Tasting the air"], ok: 0 },
      { q: "Blood also helps the body…", a: ["Share heat", "Grow feathers", "Make pine cones", "Form clouds"], ok: 0 }
    ]},
    { id: "atomic-number", marker: 13, title: "Atomic number", bands: UP, img: "images/body/atom.svg", notes: "Atomic number is the count of protons in an atom's nucleus. That count names the element. Hydrogen is 1. Carbon is 6. Oxygen is 8.", quiz: [
      { q: "Atomic number counts…", a: ["Protons in the nucleus", "Leaves on a tree", "Bones in a foot", "Clouds in a week"], ok: 0 },
      { q: "If an atom has 8 protons, it is…", a: ["Oxygen", "Gold", "Helium", "Sodium"], ok: 0 },
      { q: "Changing the proton count would mean…", a: ["A different element", "The same element always", "A kind of weather", "A muscle type"], ok: 0 },
      { q: "Hydrogen's atomic number is…", a: ["1", "12", "26", "79"], ok: 0 }
    ]},
    { id: "element", marker: 14, title: "What is an element", bands: UP, img: "images/body/atom.svg", notes: "An element is a substance made of only one kind of atom. Gold is gold atoms. Oxygen gas is oxygen atoms. Elements are the alphabet of materials.", quiz: [
      { q: "An element is made of…", a: ["Only one kind of atom", "Many kinds of plants", "Only water", "Only light"], ok: 0 },
      { q: "Water is not an element because it is…", a: ["Hydrogen and oxygen joined", "A single atom type", "A muscle", "A cloud type"], ok: 0 },
      { q: "The chart that lists elements is the…", a: ["Periodic table", "Water cycle", "Food chain", "Skeleton"], ok: 0 },
      { q: "Carbon as an element means…", a: ["Atoms with 6 protons", "Any black rock", "A kind of bird", "A simple machine"], ok: 0 }
    ]},
    { id: "atom-parts", marker: 15, title: "Parts of an atom", bands: UP, img: "images/body/atom.svg", notes: "Nucleus in the middle: protons (plus charge) and neutrons (no charge). Electrons (minus charge) move in the outer space. Almost all the mass sits in the tiny nucleus.", quiz: [
      { q: "Protons live in the…", a: ["Nucleus", "Cloud of rain", "Stomach", "Leaf vein"], ok: 0 },
      { q: "Electrons have a…", a: ["Minus charge", "Plus charge", "No mass ever", "Green color always"], ok: 0 },
      { q: "Neutrons have…", a: ["No electric charge", "A minus charge", "A plus charge", "Wings"], ok: 0 },
      { q: "Most of an atom's mass is in the…", a: ["Nucleus", "Empty outer space", "Skin of a fruit", "Feather vane"], ok: 0 }
    ]},
    { id: "elements-1-4", marker: 16, title: "Elements 1–4", bands: UP, img: "images/body/atom.svg", notes: "1 Hydrogen H, about 1.008. 2 Helium He, about 4.003. 3 Lithium Li, about 6.94. 4 Beryllium Be, about 9.012. Number, name, symbol, mass — public table facts.", quiz: [
      { q: "Element 1 is…", a: ["Hydrogen, H", "Helium, He", "Carbon, C", "Oxygen, O"], ok: 0 },
      { q: "Helium's symbol is…", a: ["He", "H", "Li", "Be"], ok: 0 },
      { q: "Lithium's atomic number is…", a: ["3", "1", "8", "11"], ok: 0 },
      { q: "Beryllium's symbol is…", a: ["Be", "B", "Br", "Ba"], ok: 0 }
    ]},
    { id: "elements-5-8", marker: 17, title: "Elements 5–8", bands: UP, img: "images/body/atom.svg", notes: "5 Boron B, about 10.81. 6 Carbon C, about 12.011. 7 Nitrogen N, about 14.007. 8 Oxygen O, about 15.999. Carbon is the skeleton of living chemistry. Oxygen is the breath gas.", quiz: [
      { q: "Carbon's symbol is…", a: ["C", "Ca", "Co", "Cl"], ok: 0 },
      { q: "Oxygen's atomic number is…", a: ["8", "1", "2", "6"], ok: 0 },
      { q: "Nitrogen's symbol is…", a: ["N", "Ni", "Na", "Ne"], ok: 0 },
      { q: "Boron is element…", a: ["5", "15", "50", "2"], ok: 0 }
    ]},
    { id: "elements-9-12", marker: 18, title: "Elements 9–12", bands: UP, img: "images/body/atom.svg", notes: "9 Fluorine F, about 18.998. 10 Neon Ne, about 20.180. 11 Sodium Na, about 22.990. 12 Magnesium Mg, about 24.305. Sodium's symbol Na remembers an older name, natrium.", quiz: [
      { q: "Sodium's symbol is…", a: ["Na", "S", "So", "Sd"], ok: 0 },
      { q: "Neon is element…", a: ["10", "2", "7", "18"], ok: 0 },
      { q: "Magnesium's symbol is…", a: ["Mg", "Mn", "Ma", "M"], ok: 0 },
      { q: "Fluorine's symbol is…", a: ["F", "Fl", "Fn", "Fe"], ok: 0 }
    ]},
    { id: "acid-base", marker: 19, title: "Acid vs base", bands: UP, img: "images/body/atom.svg", notes: "Acids donate hydrogen ions and often taste sour (lemon). Bases accept them and often feel slippery (soap). pH 7 is near water. Below 7 leans acid. Above 7 leans base. Never taste lab chemicals — food-safe demos only, with a grown-up.", quiz: [
      { q: "Lemon juice is a household…", a: ["Acid", "Base", "Element 10", "Bone"], ok: 0 },
      { q: "Soap water is a household…", a: ["Base", "Acid", "Noble gas", "Tendon"], ok: 0 },
      { q: "pH near 7 is…", a: ["Close to water", "The hottest fire", "A kind of muscle", "A cloud"], ok: 0 },
      { q: "A vinegar and baking-soda fizz is…", a: ["Acid meeting a base", "A pulley at work", "A fossil forming", "A nerve firing"], ok: 0 }
    ]},
    { id: "heavens", marker: 20, title: "The heavens declare", bands: ["early", "primary", "upper"], img: "images/creation/heavens.svg", notes: "Psalm 19:1 (KJV): \"The heavens declare the glory of God; and the firmament sheweth his handywork.\" Night sky, sun path, and ordered lights are a public witness. We add no extra commentary from any class script — the verse stands, and we look up.", quiz: [
      { q: "Psalm 19 says the heavens declare the…", a: ["Glory of God", "Names of clouds only", "Types of muscle", "Periodic table"], ok: 0 },
      { q: "\"Firmament\" in this verse points us to the…", a: ["Sky God spread out", "Stomach", "Inner ear", "Acorn cup"], ok: 0 },
      { q: "A field use of this verse is to…", a: ["Look up and give thanks", "Skip the stars", "Taste chemicals", "Name a bone"], ok: 0 },
      { q: "Handywork here means…", a: ["What God has made", "A human factory only", "A pulley", "A lymph node"], ok: 0 }
    ]},
    { id: "evolution-relies", marker: 21, title: "What the theory of evolution relies on", bands: UP, img: "images/creation/kinds.svg", notes: "As a story of origins, the theory of evolution relies on the idea that living things arose and changed into new kinds by natural steps alone, without a designer. We do observe variation, and we do observe that some traits help a creature live. Those field facts are not the same as proving that all life made itself. Our journal keeps the observations, and it also keeps the confession that God made living things.", quiz: [
      { q: "Origins-evolution, as a story, relies on…", a: ["Unguided natural steps without a designer", "Only the five senses", "Only levers", "Only weather"], ok: 0 },
      { q: "A thing we truly observe in the field is…", a: ["Living things vary", "Rocks singing", "Leaves writing books", "Stars tasting salt"], ok: 0 },
      { q: "Observing variation is…", a: ["Not the same as proving life made itself", "Proof that God is absent", "A kind of bone", "An element symbol"], ok: 0 },
      { q: "This expedition's framing is that…", a: ["God made living things", "Nothing was made", "Machines invented plants", "Rain invented eyes"], ok: 0 }
    ]},
    { id: "design", marker: 22, title: "Intelligent design", bands: UP, img: "images/creation/eye.svg", notes: "Living things have parts fitted to a purpose: an eye for seeing, a wing for flying, information in a seed for becoming a plant. Intelligent design is the claim that this kind of order points to a mind. Our field journal names that mind: God, the Maker.", quiz: [
      { q: "An eye is a clue of design because its parts…", a: ["Fit a purpose: seeing", "Are random junk", "Are clouds", "Are levers only"], ok: 0 },
      { q: "A seed carries…", a: ["Information for a plant", "A tiny pulley only", "A storm", "A planet"], ok: 0 },
      { q: "Intelligent design, in these notes, points to…", a: ["A mind — God the Maker", "A cloud type", "Element 2", "A hinge only"], ok: 0 },
      { q: "Purpose in living parts is…", a: ["What we mean by design", "A kind of rain", "A lymph fluid", "A pH number"], ok: 0 }
    ]},
    { id: "records", marker: 23, title: "Ways earth's history is preserved", bands: UP, img: "images/creation/fossil.svg", notes: "The world keeps records: fossils in stone, rings in trees, layers of ice, stacked rock, and words people wrote. Fossils show that real plants and animals were buried. Christians study the records with care and read them alongside Scripture. Timescale debates are real; the records themselves are gifts to look at.", quiz: [
      { q: "A fossil is often…", a: ["A buried leftover of life in stone", "A living bee", "A cloud", "A doorknob"], ok: 0 },
      { q: "Tree rings can preserve a record of…", a: ["Seasons of growth", "The periodic table", "Muscle kinds", "pH of soap"], ok: 0 },
      { q: "Ice layers can trap…", a: ["Old air and dust", "Living oak trees", "Pumping hearts", "Taste buds"], ok: 0 },
      { q: "Written history is also a…", a: ["Record people kept", "Kind of atom", "Simple machine", "Tissue type"], ok: 0 }
    ]},
    { id: "selection", marker: 24, title: "Natural selection", bands: UP, img: "images/creation/kinds.svg", notes: "Natural selection describes how, in a place, creatures with traits that fit that place may live and have more babies. The trait was already in the kind. Selection can shift a flock toward darker shells; it does not write a new kind from scratch. Adaptation within a kind is part of the living world's built-in bounce.", quiz: [
      { q: "Natural selection works on traits that are…", a: ["Already in the kind", "Invented by rain", "Brought by the moon", "Made of clouds"], ok: 0 },
      { q: "A fair field example is…", a: ["Beetles with better camouflage leaving more young", "A fish becoming an oak", "A rock becoming a robin", "A star becoming a kidney"], ok: 0 },
      { q: "Selection by itself does not…", a: ["Write a brand-new kind from scratch", "Ever change a flock's mix of traits", "Happen in real places", "Matter to farmers"], ok: 0 },
      { q: "In these notes, living things were first…", a: ["Made by God, able to vary within their kinds", "Made by machines", "Made by weather only", "Not made"], ok: 0 }
    ]}
  ];

  const experiments = [
    { id: "leaf-lens", title: "Leaf under a lens", bands: KID, need: "A fallen leaf, a hand lens or a drop of water on clear plastic, paper, pencil.", safety: "Use a found fallen leaf. Do not peel living bark. Adult nearby for little hands.", img: "images/tools/magnifier.svg", steps: ["Sit at a table with good light.", "Lay the leaf flat in your journal.", "Look with a lens (or a water-drop lens) at the edge and a vein.", "Draw one small square of what you truly see, not what you guess.", "Stamp the date."] },
    { id: "celery-dye", title: "Celery color climb", bands: ["preschool", "early", "primary", "upper"], need: "A pale celery stick, water, food dye, a jar, a grown-up.", safety: "Food dye stains. Wear a smock. Do not drink the dye water.", img: "images/specimens/fern.svg", steps: ["Ask a grown-up to pour water and a few drops of dye into a jar.", "Stand a cut celery stick in the jar.", "Wait hours, then overnight.", "Split the stalk and look for colored tubes.", "Those tubes are how a plant drinks. Log it."] },
    { id: "bag-seed", title: "Seed in a bag", bands: ["preschool", "early", "primary"], need: "A dry bean, a zip bag, a damp paper towel, tape, a window.", safety: "Damp, not soaking. If it molds, throw it out and wash hands.", img: "images/specimens/bean-seed.svg", steps: ["Dampen a towel. It should feel like a wrung sponge.", "Tuck in a bean. Seal the bag.", "Tape it to a bright window.", "Each day, sketch: coat, root, shoot.", "The seed already held the plan. Water and warmth woke it."] },
    { id: "bag-cycle", title: "Water cycle in a bag", bands: SCHOOL, need: "Zip bag, a spoon of water, tape, a sunny window.", safety: "Wipe drips so no one slips.", img: "images/weather/cycle.svg", steps: ["Spoon a little water into a bag and seal it.", "Tape it to a sunny window.", "Watch beads form at the top and run down.", "Name the steps: evaporate, condense, fall.", "Write which side of the bag is the 'cloud'."] },
    { id: "fizz", title: "Fizz jar (acid meets base)", bands: MID, need: "Baking soda, vinegar, a jar, a tray, a grown-up.", safety: "Do this with a grown-up. Do not taste. Keep it on a tray. No sealed bottles — gas needs a way out.", img: "images/body/atom.svg", steps: ["Put the jar on a tray.", "Add a spoon of baking soda (a base).", "Pour a little vinegar (an acid).", "Watch the fizz. That gas is carbon dioxide.", "Rinse. Log: acid + base can make a salt, water, and a gas."] },
    { id: "pulse", title: "Pulse after a walk", bands: SCHOOL, need: "A quiet sit, a clock or a grown-up counting, shoes for a walk.", safety: "Walk, do not sprint to dizziness. Sit to count. This is curiosity, not a medical test.", img: "images/body/heart.svg", steps: ["Sit still. Find the pulse at your wrist or neck with two fingers, not a thumb.", "Count beats while a grown-up marks 15 seconds. Multiply by 4.", "Walk the hall or yard for two minutes.", "Sit and count again.", "The heart is a pump that matches the work. No grades — just a note."] },
    { id: "sink-float", title: "Sink and float", bands: ["toddler", "preschool", "early"], need: "A bowl of water, a spoon, a pebble, a twig, a berry, a towel.", safety: "Wipe spills. No small objects for mouths.", img: "images/habitats/pond.svg", steps: ["Fill a bowl.", "Guess: sink or float?", "Place one object at a time.", "Sort them on a towel into two piles.", "Shape and trapped air matter, not just 'heavy'."] },
    { id: "shadow-stick", title: "Shadow stick", bands: SCHOOL, need: "A stick, open ground, pebbles, sun, a grown-up if you go outside.", safety: "Do not stare at the sun. Hats on hot days.", img: "images/weather/sun.svg", steps: ["Stand a stick in soil.", "Mark the shadow tip with a pebble.", "Wait. Mark again.", "The sun's path writes the shadow's swing.", "Psalm 19 is allowed reading while you wait."] },
    { id: "sound-walk", title: "Sound sit", bands: KID, need: "A chair or a porch step, your journal, one quiet minute.", safety: "Stay where a grown-up can see you.", img: "images/body/senses.svg", steps: ["Close your eyes.", "Hold up a finger for each new sound.", "Open and list them: bird, motor, leaf, voice.", "Ears catch waves. The world is noisy on purpose.", "Thank God for one sound you like."] },
    { id: "spool-pulley", title: "Spool pulley", bands: SCHOOL, need: "A thread spool, string, a small cup, a chair, a grown-up.", safety: "No necks in string. Adult ties the high end.", img: "images/machines/pulley.svg", steps: ["Ask a grown-up to hang a spool so it turns.", "Run string over the groove.", "Tie a cup to one end.", "Pull the other end. The cup rises as you pull down.", "You changed the direction of work."] },
    { id: "cabbage-maybe", title: "Kitchen pH (optional)", bands: UP, need: "Red cabbage or a grown-up's pH papers, lemon, baking-soda water, jars.", safety: "Kitchen only. Adult handles knives and hot water. Do not taste test jars.", img: "images/body/atom.svg", steps: ["If you have cabbage, a grown-up can steep purple water.", "Pour a little into two cups.", "Add lemon to one, soda water to the other.", "Color shift hints acid vs base.", "Skip this lab if you lack the cabbage — the fizz jar already taught the meeting."] },
    { id: "cloud-watch", title: "Cloud watch", bands: KID, need: "Sky you can see, journal, this app's cloud plates.", safety: "Look at clouds, never at the sun. Stay inside if lightning.", img: "images/weather/cloud-cumulus.svg", steps: ["Step to a window.", "Match heaps, sheets, or threads to the plates.", "Note wind and color.", "Write one weather sentence.", "Sky is a field too."] }
  ];

  const journalPrompts = [
    { id: "saw", bands: KID, text: "Date, place (yard / window / trail), and three things you saw." },
    { id: "kind", bands: KID, text: "Name one living thing and the kind it belongs to: bird, fish, beast, creeping thing, or plant." },
    { id: "sense", bands: KID, text: "Pick one sense. What did it tell you in the last hour?" },
    { id: "machine", bands: SCHOOL, text: "Find a simple machine in the house. Name it and the job it does." },
    { id: "weather", bands: KID, text: "Sky: sun, cloud type, wind, wet or dry. One sentence." },
    { id: "thanks", bands: ALL, text: "Write one line of thanks for something in God's design you noticed." },
    { id: "question", bands: SCHOOL, text: "A question you still have. Good journals keep questions." },
    { id: "element", bands: UP, text: "Name an element you used today without thinking (oxygen you breathed, iron in a pan, sodium in salt)." }
  ];

  const babyPlates = [
    { id: "leaf", name: "Leaf", img: "images/ui/baby-leaf.svg", sound: "leaf", read: "Leaf." },
    { id: "sun", name: "Sun", img: "images/ui/baby-sun.svg", sound: "chirp", read: "Sun." },
    { id: "rain", name: "Rain", img: "images/ui/baby-rain.svg", sound: "drop", read: "Rain." },
    { id: "bird", name: "Bird", img: "images/ui/baby-bird.svg", sound: "chirp", read: "Bird." },
    { id: "fish", name: "Fish", img: "images/ui/baby-fish.svg", sound: "drop", read: "Fish." }
  ];

  const sorts = [
    { id: "kind-sort", title: "After their kind", bands: ["preschool", "early", "primary"], prompt: "God made living things to bring forth after their kind. Sort these field finds.", bins: [
      { id: "bird", name: "Bird" }, { id: "fish", name: "Fish" }, { id: "plant", name: "Plant" }, { id: "creeping", name: "Creeping" }
    ], items: [
      { id: "robin", name: "Robin", bin: "bird" },
      { id: "fish", name: "Fish", bin: "fish" },
      { id: "oak-leaf", name: "Oak", bin: "plant" },
      { id: "butterfly", name: "Butterfly", bin: "creeping" },
      { id: "bee", name: "Bee", bin: "creeping" },
      { id: "pine", name: "Pine", bin: "plant" },
      { id: "feather", name: "Feather", bin: "bird" }
    ]},
    { id: "sink-sort", title: "Sink or float", bands: ["toddler", "preschool", "early"], prompt: "Guess as a naturalist, then sort.", bins: [
      { id: "sink", name: "Sinks" }, { id: "float", name: "Floats" }
    ], items: [
      { id: "pebble", name: "Pebble", bin: "sink" },
      { id: "twig", name: "Twig", bin: "float" },
      { id: "shell", name: "Thick shell", bin: "sink" },
      { id: "feather", name: "Feather", bin: "float" },
      { id: "apple", name: "Whole apple", bin: "float" }
    ]},
    { id: "acid-sort", title: "Acid or base", bands: UP, prompt: "Household clues only. Never taste a lab jar.", bins: [
      { id: "acid", name: "Acid" }, { id: "base", name: "Base" }
    ], items: [
      { id: "lemon", name: "Lemon juice", bin: "acid" },
      { id: "vinegar", name: "Vinegar", bin: "acid" },
      { id: "soap", name: "Soap water", bin: "base" },
      { id: "soda", name: "Baking soda in water", bin: "base" }
    ]},
    { id: "plant-parts", title: "Plant parts", bands: ["preschool", "early", "primary"], prompt: "Match the part to its job.", bins: [
      { id: "root", name: "Root" }, { id: "leaf", name: "Leaf" }, { id: "flower", name: "Flower" }, { id: "seed", name: "Seed" }
    ], items: [
      { id: "drink", name: "Drinks from soil", bin: "root" },
      { id: "sun", name: "Catches light", bin: "leaf" },
      { id: "bee", name: "Invites a bee", bin: "flower" },
      { id: "baby", name: "Holds a baby plant", bin: "seed" }
    ]}
  ];

  const matches = [
    { id: "machine-match", title: "Machine to job", bands: SCHOOL, pairs: [
      { l: "Lever", r: "Lift a lid with a bar" },
      { l: "Ramp", r: "Walk a load up a slope" },
      { l: "Pulley", r: "Pull down to lift a flag" },
      { l: "Wedge", r: "Split with a point" },
      { l: "Screw", r: "Hold wood with a twist" },
      { l: "Wheel", r: "Roll a load" }
    ]},
    { id: "sense-match", title: "Sense to organ", bands: ["toddler", "preschool", "early", "primary"], pairs: [
      { l: "Sight", r: "Eyes" },
      { l: "Hearing", r: "Ears" },
      { l: "Smell", r: "Nose" },
      { l: "Taste", r: "Tongue" },
      { l: "Touch", r: "Skin" }
    ]}
  ];

  const posts = [
    { id: "habitats", label: "Habitats", view: "habitats", bands: KID, img: "images/habitats/forest.svg", blurb: "Walk a place. Collect its plates." },
    { id: "tin", label: "Specimen tin", view: "tin", bands: KID, img: "images/tools/tin.svg", blurb: "Cards you have stamped." },
    { id: "magnify", label: "Hand lens", view: "magnify", bands: KID, img: "images/tools/magnifier.svg", blurb: "Look closer." },
    { id: "lab", label: "Lab tent", view: "lab", bands: KID, img: "images/tools/journal.svg", blurb: "Safe home experiments." },
    { id: "body", label: "Body station", view: "body", bands: KID, img: "images/body/senses.svg", blurb: "Senses and inner workings." },
    { id: "machines", label: "Machine shed", view: "machines", bands: ["preschool", "early", "primary", "upper"], img: "images/machines/lever.svg", blurb: "Six simple machines." },
    { id: "weather", label: "Weather hill", view: "weather", bands: KID, img: "images/weather/cycle.svg", blurb: "Sky, water, wind." },
    { id: "creation", label: "Lookout", view: "creation", bands: ["early", "primary", "upper"], img: "images/creation/heavens.svg", blurb: "Heavens, kinds, records, design." },
    { id: "trails", label: "Topic trails", view: "trails", bands: MID, img: "images/body/atom.svg", blurb: "Anatomy and chemistry markers." },
    { id: "journal", label: "Journal", view: "journal", bands: ALL, img: "images/tools/journal.svg", blurb: "Date, place, what you saw." },
    { id: "sorts", label: "Sort table", view: "sorts", bands: KID, img: "images/creation/kinds.svg", blurb: "Kinds, parts, sink or float." }
  ];

  const scripture = [
    { ref: "Psalm 19:1 (KJV)", text: "The heavens declare the glory of God; and the firmament sheweth his handywork." },
    { ref: "Genesis 1:21 (KJV)", text: "And God created great whales, and every living creature that moveth, which the waters brought forth abundantly, after their kind, and every winged fowl after his kind: and God saw that it was good." },
    { ref: "Job 12:7-9 (KJV)", text: "But ask now the beasts, and they shall teach thee; and the fowls of the air, and they shall tell thee: Or speak to the earth, and it shall teach thee: and the fishes of the sea shall declare unto thee. Who knoweth not in all these that the hand of the LORD hath wrought this?" }
  ];

  const creditsShort = "Original field plates drawn for this expedition. Scripture: King James Version, public domain.";

  return {
    subject: "science",
    theme: "Naturalist's Field Expedition",
    bands: bands,
    habitats: habitats,
    specimens: specimens,
    machines: machines,
    weather: weather,
    senses: senses,
    topics: topics,
    experiments: experiments,
    journalPrompts: journalPrompts,
    babyPlates: babyPlates,
    sorts: sorts,
    matches: matches,
    posts: posts,
    scripture: scripture,
    creditsShort: creditsShort,
    inBand: function (item, band) {
      return !item.bands || item.bands.indexOf(band) !== -1;
    }
  };
})();

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
    { id: "desert", name: "Desert", img: "images/habitats/desert.svg", bands: SCHOOL, blurb: "Dry wash, cactus, stored water.", finds: ["cactus"], read: "A desert is not empty. Plants here store water and rest in the heat. Design fits the place." },
    { id: "mountain", name: "High country", img: "images/habitats/mountain.svg", bands: SCHOOL, blurb: "Ridges, thin air, snow line.", finds: ["pine", "moss"], read: "Mountains change as you climb: trees shorten, air cools, snow may stay." },
    { id: "sky", name: "Open sky", img: "images/habitats/sky.svg", bands: KID, blurb: "Sun, heaped cloud, a swallow stoop.", finds: ["feather"], read: "The sky is a weather workshop. The same sun that warms a meadow also drives the water cycle." },
    { id: "stream", name: "Stream", img: "images/habitats/stream.svg", bands: KID, blurb: "Riffles, stones, alder shade.", finds: ["fish", "moss", "fern"], read: "Moving water carries grit and cools the banks. Some animals are built for current." },
    { id: "yard", name: "Yard", img: "images/habitats/yard.svg", bands: KID, blurb: "Doorstep, shade tree, feeder.", finds: ["robin", "oak-leaf", "dandelion", "earthworm"], read: "A yard is a small expedition. Look down. Look up. Write what repeats." }
  ];

  const specimens = [
    { id: "oak-leaf", name: "Oak leaf", latin: "Quercus", img: "images/specimens/oak-leaf.svg", kind: "plant", habitat: "forest", bands: KID, fact: "Oak leaves have deep lobes. The tree holds acorns, each a seed with food packed around a baby oak.", design: "A leaf is a solar panel and a rain hat at once." },
    { id: "maple-leaf", name: "Maple leaf", latin: "Acer", img: "images/specimens/maple-leaf.svg", kind: "plant", habitat: "yard", bands: KID, fact: "Maple leaves show palmate veins, like fingers from a palm. In fall the green fades and other colors show.", design: "Veins are roads for water and sugar." },
    { id: "pine", name: "Pine", latin: "Pinus", img: "images/specimens/pine.svg", kind: "plant", habitat: "mountain", bands: KID, fact: "Pines keep needle leaves all year. Needles lose less water than broad leaves.", design: "Winter green is not a trick; it is a design for poor, cold soils and thin air." },
    { id: "cactus", name: "Cactus", latin: "Cactaceae", img: "images/specimens/cactus.svg", kind: "plant", habitat: "desert", bands: SCHOOL, fact: "A cactus stores water in thick stems and wears spines instead of broad leaves.", design: "The shape fits a dry wash: hold water, spend little, rest in the heat." },
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
    { id: "hearing", name: "Hearing", organ: "ears", img: "images/body/ear.svg", bands: KID, fact: "Ears catch sound waves. Tiny bones pass the shake to a coiled inner ear." },
    { id: "smell", name: "Smell", organ: "nose", img: "images/body/nose.svg", bands: KID, fact: "The nose reads chemicals in air. Smell and taste work as partners." },
    { id: "taste", name: "Taste", organ: "tongue", img: "images/body/tongue.svg", bands: KID, fact: "Taste buds notice sweet, sour, salty, bitter, and savory. The rest is smell." },
    { id: "touch", name: "Touch", organ: "skin", img: "images/body/skin.svg", bands: KID, fact: "Skin is a covering full of sensors for pressure, pain, and temperature." }
  ];

  const topics = [
    { id: "tissue", marker: 1, title: "Four types of tissue", bands: MID, img: "images/body/tissue.svg", notes: "The body is built of four tissue kinds: covering tissue (epithelial), supporting tissue (connective), moving tissue (muscle), and signaling tissue (nervous). A tissue is a team of similar cells with one job.", quiz: [
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
    { id: "muscle", marker: 3, title: "Three kinds of muscle", bands: MID, img: "images/body/muscle.svg", notes: "Skeletal muscle moves bones when you choose. Smooth muscle lives in organs and works without a thought. Cardiac muscle is the heart's own never-resting muscle.", quiz: [
      { q: "Which muscle kind do you use to pick up a rock?", a: ["Skeletal", "Cardiac", "Smooth only", "None"], ok: 0 },
      { q: "Which muscle kind is only in the heart?", a: ["Cardiac", "Skeletal", "Smooth", "Epithelial"], ok: 0 },
      { q: "Stomach walls use…", a: ["Smooth muscle", "Skeletal muscle", "Cardiac muscle", "Cartilage"], ok: 0 },
      { q: "A mark of cardiac muscle is that it…", a: ["Keeps a beat without you asking", "Only works in fingers", "Turns to bone", "Tastes food"], ok: 0 }
    ]},
    { id: "nervous", marker: 4, title: "Three parts of the nervous system", bands: MID, img: "images/body/nerves.svg", notes: "A simple field split: the brain, the spinal cord, and the nerves that branch into the body. Brain and spinal cord are the central desk. Nerves are the message roads.", quiz: [
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
    { id: "excretory", marker: 7, title: "Excretory system", bands: MID, img: "images/body/kidneys.svg", notes: "Four parts of the urinary trail: kidneys, ureters, bladder, urethra. Kidneys filter blood. Ureters are the pipes down. The bladder is a holding room. The urethra is the exit path.", quiz: [
      { q: "Which organs filter blood and make urine?", a: ["Kidneys", "Lungs only", "Ears", "Eyelids"], ok: 0 },
      { q: "Ureters carry urine from kidneys to the…", a: ["Bladder", "Heart", "Brain", "Stomach"], ok: 0 },
      { q: "The bladder is mainly a…", a: ["Holding room", "Pump", "Lens", "Filter"], ok: 0 },
      { q: "The urethra is the…", a: ["Exit path", "Voice box", "Collarbone", "Eardrum"], ok: 0 }
    ]},
    { id: "circulatory", marker: 8, title: "Circulatory system", bands: MID, img: "images/body/heart.svg", notes: "Six field parts: heart, arteries, veins, capillaries, blood, and valves. The heart pumps. Arteries go out. Veins return. Capillaries are the thin meeting rooms. Valves keep one-way flow.", quiz: [
      { q: "The pump of the circulatory system is the…", a: ["Heart", "Kidney", "Skin", "Tooth"], ok: 0 },
      { q: "Vessels that carry blood away from the heart are…", a: ["Arteries", "Veins only", "Tendons", "Ligaments"], ok: 0 },
      { q: "The tiniest vessels, where goods are traded, are…", a: ["Capillaries", "Bones", "Nails", "Horns"], ok: 0 },
      { q: "Valves are there to…", a: ["Keep blood from flowing backward", "Taste food", "Bend light", "Store fat only"], ok: 0 }
    ]},
    { id: "lymph", marker: 9, title: "Lymph system", bands: MID, img: "images/body/lymph.svg", notes: "Four parts: lymph fluid, lymph vessels, lymph nodes, and the spleen. This quiet system returns fluid, filters it, and helps the body notice germs.", quiz: [
      { q: "Lymph is mostly…", a: ["Clear fluid from around cells", "Solid bone", "Tooth enamel", "Hair oil only"], ok: 0 },
      { q: "Lymph nodes are like…", a: ["Filter stations", "Pumps like the heart", "Lenses", "Eardrums"], ok: 0 },
      { q: "The spleen, among other jobs, helps with…", a: ["Blood and germ watch", "Hearing high notes", "Growing nails", "Blinking"], ok: 0 },
      { q: "Lymph vessels are…", a: ["Tubes that carry lymph", "Bones of the face", "Air sacs in the lung", "Chambers of the heart"], ok: 0 }
    ]},
    { id: "respiratory", marker: 10, title: "Respiratory system parts", bands: MID, img: "images/body/lungs.svg", notes: "Air's path: nose (or mouth), throat, voice box, windpipe (trachea), bronchi, lungs. The diaphragm is the muscle floor that helps you breathe.", quiz: [
      { q: "The windpipe's other name is the…", a: ["Trachea", "Esophagus", "Ureter", "Aorta"], ok: 0 },
      { q: "Bronchi are tubes that lead into the…", a: ["Lungs", "Kidneys", "Ears", "Toes"], ok: 0 },
      { q: "The diaphragm is a…", a: ["Breathing muscle under the lungs", "Tiny bone in the ear", "Taste bud", "Eyelash"], ok: 0 },
      { q: "Lungs are packed with tiny air sacs so that…", a: ["Gases can trade with blood", "Food can be stored", "Sound can be tasted", "Hair can grow"], ok: 0 }
    ]},
    { id: "endocrine", marker: 11, title: "Endocrine system", bands: MID, img: "images/body/glands.svg", notes: "Glands send chemical messengers called hormones through the blood. The pituitary in the head is a chief messenger gland. Other glands help with growth, sugar use, and the body's pace.", quiz: [
      { q: "Hormones are…", a: ["Chemical messengers in the blood", "Tiny bones", "Kinds of teeth", "Air sacs"], ok: 0 },
      { q: "The endocrine system works mainly by…", a: ["Glands", "Air tubes", "Bones of the skull only", "Taste buds"], ok: 0 },
      { q: "The pituitary gland sits in the…", a: ["Head", "Heel", "Thumb", "Earlobe only"], ok: 0 },
      { q: "Compared with a nerve zap, a hormone message is often…", a: ["Slower and longer lasting", "A sound you hear", "A color you see", "A kind of rock"], ok: 0 }
    ]},
    { id: "blood", marker: 12, title: "Major purposes of blood", bands: MID, img: "images/body/blood.svg", notes: "Blood carries oxygen, carries food bits, hauls wastes, helps fight germs, helps seal cuts, and spreads heat. One river, many jobs.", quiz: [
      { q: "Blood carries oxygen mainly with the help of…", a: ["Red cells", "Hair", "Nails", "Enamel"], ok: 0 },
      { q: "A purpose of blood is to…", a: ["Carry wastes away from cells", "Store long-term memories", "Digest starch in the stomach", "Hold the skeleton upright"], ok: 0 },
      { q: "When you cut a finger, blood helps by…", a: ["Clotting to seal the cut", "Turning into bone", "Becoming lymph nodes", "Filtering the air"], ok: 0 },
      { q: "Blood also helps the body…", a: ["Share heat", "Replace the skeleton", "Make digestive enzymes only", "Filter urine"], ok: 0 }
    ]},
    { id: "matter", warmUp: true, title: "States of matter", bands: MID, img: "images/body/matter.svg", notes: "Warm-up, not a week number. Ridge chemistry begins in the field: stuff is solid, liquid, or gas. Ice keeps its shape. Liquid water takes the cup. Steam fills the space above. Heat can melt ice. Cold can freeze a puddle.", quiz: [
      { q: "A solid keeps its…", a: ["Shape", "Container only", "Whatever space it enters", "No volume"], ok: 0 },
      { q: "A liquid takes the shape of its…", a: ["Container", "Own rigid edges", "Crystal lattice", "Atomic number"], ok: 0 },
      { q: "A gas spreads to fill…", a: ["The space it is in", "Only the bottom of a cup", "A fixed cube", "A single droplet"], ok: 0 },
      { q: "Ice, water, and steam are the same substance in different…", a: ["States", "Elements", "Atomic numbers", "Tissues"], ok: 0 }
    ]},
    { id: "atomic-number", marker: 13, title: "Atomic number", bands: MID, img: "images/body/atom.svg", notes: "Atomic number is the count of protons in an atom's nucleus. That count names the element. Hydrogen is 1. Carbon is 6. Oxygen is 8.", quiz: [
      { q: "Atomic number counts…", a: ["Protons in the nucleus", "Electrons only", "Neutrons only", "Bonds in a molecule"], ok: 0 },
      { q: "If an atom has 8 protons, it is…", a: ["Oxygen", "Gold", "Helium", "Sodium"], ok: 0 },
      { q: "Changing the proton count would mean…", a: ["A different element", "The same element always", "Only a new ion", "Only a new isotope"], ok: 0 },
      { q: "Hydrogen's atomic number is…", a: ["1", "12", "26", "79"], ok: 0 }
    ]},
    { id: "element", marker: 14, title: "What is an element", bands: MID, img: "images/body/atom.svg", notes: "An element is a substance made of only one kind of atom. Gold is gold atoms. Oxygen gas is oxygen atoms. Elements are the alphabet of materials.", quiz: [
      { q: "An element is made of…", a: ["Only one kind of atom", "Many kinds of plants", "Only water", "Only light"], ok: 0 },
      { q: "Water is not an element because it is…", a: ["Hydrogen and oxygen joined", "A single atom type", "A pure metal", "One kind of nucleus"], ok: 0 },
      { q: "The chart that lists elements is the…", a: ["Periodic table", "Water cycle", "Food chain", "Skeleton"], ok: 0 },
      { q: "Carbon as an element means…", a: ["Atoms with 6 protons", "Any black rock", "A kind of bird", "A simple machine"], ok: 0 }
    ]},
    { id: "atom-parts", marker: 15, title: "Parts of an atom", bands: MID, img: "images/body/atom.svg", notes: "Nucleus in the middle: protons (plus charge) and neutrons (no charge). Electrons (minus charge) move in the outer space. Almost all the mass sits in the tiny nucleus.", quiz: [
      { q: "Protons live in the…", a: ["Nucleus", "Electron shells", "The space between atoms", "A molecule's bond only"], ok: 0 },
      { q: "Electrons have a…", a: ["Minus charge", "Plus charge", "No mass ever", "Green color always"], ok: 0 },
      { q: "Neutrons have…", a: ["No electric charge", "A minus charge", "A plus charge", "A charge that flips every second"], ok: 0 },
      { q: "Most of an atom's mass is in the…", a: ["Nucleus", "Empty outer space", "The electron shells", "The bonds around it"], ok: 0 }
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
      { q: "pH near 7 is…", a: ["Close to water", "A strong acid", "A strong base", "A dry solid"], ok: 0 },
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
      { q: "A thing we truly observe in the field is…", a: ["Living things vary", "No creature differs from its parents", "Only fossils can vary", "Traits cannot be inherited"], ok: 0 },
      { q: "Observing variation is…", a: ["Not the same as proving life made itself", "Proof that God is absent", "A kind of bone", "An element symbol"], ok: 0 },
      { q: "This expedition's framing is that…", a: ["God made living things", "Nothing was made", "Machines invented plants", "Rain invented eyes"], ok: 0 }
    ]},
    { id: "design", marker: 22, title: "Intelligent design", bands: UP, img: "images/creation/eye.svg", notes: "Living things have parts fitted to a purpose: an eye for seeing, a wing for flying, information in a seed for becoming a plant. Intelligent design is the claim that this kind of order points to a mind. Our field journal names that mind: God, the Maker.", quiz: [
      { q: "An eye is a clue of design because its parts…", a: ["Fit a purpose: seeing", "Are random junk", "Do no job", "Are levers only"], ok: 0 },
      { q: "A seed carries…", a: ["Information for a plant", "A tiny pulley only", "A storm", "A planet"], ok: 0 },
      { q: "Intelligent design, in these notes, points to…", a: ["A mind — God the Maker", "Chance with no mind", "Element 2", "A hinge only"], ok: 0 },
      { q: "Purpose in living parts is…", a: ["What we mean by design", "A kind of rain", "A lymph fluid", "A pH number"], ok: 0 }
    ]},
    { id: "records", marker: 23, title: "Ways earth's history is preserved", bands: UP, img: "images/creation/fossil.svg", notes: "The world keeps records: fossils in stone, rings in trees, layers of ice, stacked rock, and words people wrote. Fossils show that real plants and animals were buried. Christians study the records with care and read them alongside Scripture. Timescale debates are real; the records themselves are gifts to look at.", quiz: [
      { q: "A fossil is often…", a: ["A buried leftover of life in stone", "A living bee", "A still-growing tree", "A doorknob"], ok: 0 },
      { q: "Tree rings can preserve a record of…", a: ["Seasons of growth", "The periodic table", "Muscle kinds", "pH of soap"], ok: 0 },
      { q: "Ice layers can trap…", a: ["Old air and dust", "Living oak trees", "Pumping hearts", "Taste buds"], ok: 0 },
      { q: "Written history is also a…", a: ["Record people kept", "Kind of atom", "Simple machine", "Tissue type"], ok: 0 }
    ]},
    { id: "selection", marker: 24, title: "Natural selection", bands: UP, img: "images/creation/kinds.svg", notes: "Natural selection describes how, in a place, creatures with traits that fit that place may live and have more babies. The trait was already in the kind. Selection can shift a flock toward darker shells; it does not write a new kind from scratch. Adaptation within a kind is part of the living world's built-in bounce.", quiz: [
      { q: "Natural selection works on traits that are…", a: ["Already in the kind", "Added from outside the kind", "Written onto rocks", "The same in every individual"], ok: 0 },
      { q: "A fair field example is…", a: ["Beetles whose color fits the place leaving more young", "Every beetle becoming a different kind", "Selection inventing a trait the kind never had", "Selection acting on rocks the same way as on beetles"], ok: 0 },
      { q: "Selection by itself does not…", a: ["Write a brand-new kind from scratch", "Ever change a flock's mix of traits", "Happen in real places", "Matter to farmers"], ok: 0 },
      { q: "In these notes, living things were first…", a: ["Made by God, able to vary within their kinds", "Made by machines", "Made by weather only", "Not made"], ok: 0 }
    ]}
  ];

  const upperQuiz = {
    tissue: [
      { q: "A tissue is one cell team. An organ is…", a: ["Several tissues working as one part", "A single cell type only", "Always one tissue", "A lone atom"], ok: 0 },
      { q: "Blood is grouped with which tissue family?", a: ["Connective", "Epithelial", "Nervous", "Skeletal muscle"], ok: 0 },
      { q: "Epithelial tissue is mainly found…", a: ["Covering surfaces and lining organs", "Only inside the marrow", "Only as heart muscle", "Only in the lens"], ok: 0 },
      { q: "Which tissue is built to carry signals?", a: ["Nervous", "Epithelial", "Adipose only", "Cartilage"], ok: 0 }
    ],
    axial: [
      { q: "Arms and legs belong to the…", a: ["Appendicular skeleton", "Axial skeleton", "Lymph vessels", "Dermis only"], ok: 0 },
      { q: "The breastbone's other name is the…", a: ["Sternum", "Femur", "Patella", "Scapula"], ok: 0 },
      { q: "Ribs and sternum mainly guard the…", a: ["Chest organs", "Knee joint", "Ear bones", "Toes"], ok: 0 },
      { q: "Vertebrae stack to form the…", a: ["Backbone", "Windpipe", "Ureter", "Aorta"], ok: 0 }
    ],
    muscle: [
      { q: "Cardiac muscle is found only in the…", a: ["Heart", "Biceps", "Stomach wall", "Iris"], ok: 0 },
      { q: "Smooth muscle is typical of the…", a: ["Gut wall", "Muscles you choose to flex", "Heart chambers only", "Tendons"], ok: 0 },
      { q: "A tendon attaches…", a: ["Muscle to bone", "Bone to bone only", "Nerve to gland", "Lung to rib"], ok: 0 },
      { q: "Skeletal muscle cells look…", a: ["Striped and usually voluntary", "Like red blood cells", "Like fat only", "Like enamel"], ok: 0 }
    ],
    nervous: [
      { q: "Brain and spinal cord together are the…", a: ["Central nervous system", "Peripheral nerves only", "Endocrine glands", "Lymph nodes"], ok: 0 },
      { q: "A nerve impulse travels along a…", a: ["Neuron", "Red cell", "Nephron", "Alveolus"], ok: 0 },
      { q: "Sensory nerves carry messages…", a: ["Toward the central desk", "Only away from the brain", "Through the ureters", "Inside arteries only"], ok: 0 },
      { q: "The spinal cord is protected by the…", a: ["Vertebrae", "Ribs only", "Skull only", "Patella"], ok: 0 }
    ],
    senses: [
      { q: "The retina is the light-sensitive layer of the…", a: ["Eye", "Ear", "Tongue", "Skin"], ok: 0 },
      { q: "The cochlea is the coiled organ of the…", a: ["Inner ear", "Nose", "Eye", "Skin"], ok: 0 },
      { q: "Most of what people call flavor also uses…", a: ["Smell", "Balance only", "The lens", "Bone conduction"], ok: 0 },
      { q: "Skin sensors report pressure, pain, and…", a: ["Temperature", "Pitch", "Color", "pH of blood"], ok: 0 }
    ],
    digestive: [
      { q: "The esophagus connects the mouth to the…", a: ["Stomach", "Bladder", "Larynx", "Heart"], ok: 0 },
      { q: "Most food is absorbed in the…", a: ["Small intestine", "Stomach only", "Esophagus", "Large intestine only"], ok: 0 },
      { q: "Bile, which helps with fats, is made by the…", a: ["Liver", "Kidney", "Spleen", "Thyroid"], ok: 0 },
      { q: "The pancreas adds juices that…", a: ["Help break food down", "Filter urine", "Pump blood", "Carry air"], ok: 0 }
    ],
    excretory: [
      { q: "A nephron is the filter unit of the…", a: ["Kidney", "Lung", "Liver", "Spleen"], ok: 0 },
      { q: "Urine leaves the bladder through the…", a: ["Urethra", "Ureter", "Aorta", "Trachea"], ok: 0 },
      { q: "Ureters run from each kidney to the…", a: ["Bladder", "Heart", "Stomach", "Lung"], ok: 0 },
      { q: "Kidneys also help balance…", a: ["Water and salts in the blood", "The pitch of the voice", "Light in the eye", "Air in the alveoli"], ok: 0 }
    ],
    circulatory: [
      { q: "Veins return blood toward the…", a: ["Heart", "Capillary beds only", "Kidneys only", "Lungs only"], ok: 0 },
      { q: "Capillaries are where blood…", a: ["Trades gases and food with cells", "Is stored for months", "Becomes lymph", "Leaves the body"], ok: 0 },
      { q: "A valve's job in the heart is to…", a: ["Keep flow one way", "Make new red cells", "Sense light", "Warm the skin"], ok: 0 },
      { q: "Arteries leaving the heart carry blood…", a: ["Out to the body or lungs", "Only back from the feet", "Only inside bones", "Only through the ureters"], ok: 0 }
    ],
    lymph: [
      { q: "Lymph nodes cluster where vessels…", a: ["Can be checked for germs", "Pump like a heart", "Make urine", "Exchange oxygen"], ok: 0 },
      { q: "The spleen sits in the abdomen and helps watch…", a: ["Blood", "Sound", "Taste", "Balance"], ok: 0 },
      { q: "Lymph fluid begins as…", a: ["Fluid that leaked out around cells", "Air from the lungs", "Bile from the liver", "Marrow turned solid"], ok: 0 },
      { q: "Lymph returns fluid that has left the…", a: ["Blood capillaries", "Alveoli", "Nephrons", "Taste buds"], ok: 0 }
    ],
    respiratory: [
      { q: "The trachea splits into two…", a: ["Bronchi", "Ureters", "Ventricles", "Esophagi"], ok: 0 },
      { q: "Alveoli are the tiny sacs where…", a: ["Oxygen and carbon dioxide trade", "Food is stored", "Urine is held", "Hormones are made"], ok: 0 },
      { q: "The diaphragm contracts to help you…", a: ["Breathe in", "Pump blood", "Swallow only", "Blink"], ok: 0 },
      { q: "The voice box sits above the…", a: ["Trachea", "Stomach", "Bladder", "Aorta"], ok: 0 }
    ],
    endocrine: [
      { q: "A hormone travels mainly by…", a: ["The blood", "A single nerve wire", "The ureters", "The windpipe"], ok: 0 },
      { q: "The pituitary is called a chief gland because it…", a: ["Signals other glands", "Filters urine", "Pumps blood", "Focuses light"], ok: 0 },
      { q: "Compared with a nerve signal, a hormone is often…", a: ["Slower and longer lasting", "Faster than any nerve", "Heard as sound", "Seen as color"], ok: 0 },
      { q: "Insulin, a hormone, helps the body…", a: ["Use blood sugar", "Bend the knee", "Hear pitch", "Clot a cut"], ok: 0 }
    ],
    blood: [
      { q: "Red cells are specialized to carry…", a: ["Oxygen", "Nerve signals", "Urine", "Bile"], ok: 0 },
      { q: "Platelets help the blood…", a: ["Clot", "Taste", "Focus light", "Store fat"], ok: 0 },
      { q: "White cells are a main part of…", a: ["Defense against germs", "The lens", "The skeleton", "The enamel"], ok: 0 },
      { q: "Plasma is the…", a: ["Liquid that carries the cells", "Solid clot only", "Wall of an artery", "Air in a lung"], ok: 0 }
    ],
    matter: [
      { q: "Melting turns a solid into a…", a: ["Liquid", "Gas with no in-between", "New element", "Mixture of two elements"], ok: 0 },
      { q: "Boiling turns a liquid into a…", a: ["Gas", "Solid", "New atomic number", "Crystal"], ok: 0 },
      { q: "Ice, liquid water, and steam share the same…", a: ["Molecules, in different states", "Atomic number of gold", "Crystal shape", "Container"], ok: 0 },
      { q: "A gas differs from a liquid because a gas…", a: ["Fills whatever space it is given", "Keeps a flat top in an open cup", "Has a fixed shape", "Cannot be compressed at all"], ok: 0 }
    ],
    "atomic-number": [
      { q: "Two atoms of the same element must share the same…", a: ["Proton count", "Neutron count", "Mass number", "Electron count in every ion"], ok: 0 },
      { q: "Carbon is element 6 because it has…", a: ["6 protons", "6 neutrons only", "6 electrons and no protons", "6 bonds and no nucleus"], ok: 0 },
      { q: "An isotope of an element changes the…", a: ["Neutron count, not the atomic number", "Proton count", "Element name", "Periodic group by itself"], ok: 0 },
      { q: "On the periodic table, atomic number…", a: ["Orders the elements", "Is the same as mass for every atom", "Counts only electrons", "Is always even"], ok: 0 }
    ],
    element: [
      { q: "A compound such as water is…", a: ["Two or more elements bonded", "A single element", "An atom with no nucleus", "A mixture that is always an element"], ok: 0 },
      { q: "Gold stays gold because every gold atom has…", a: ["79 protons", "The same neutrons as hydrogen", "No nucleus", "Six protons"], ok: 0 },
      { q: "Oxygen gas in the air is…", a: ["An element", "A compound of gold and carbon", "A kind of tissue", "A state, not a substance"], ok: 0 },
      { q: "The periodic table is a chart of…", a: ["Elements", "Body systems", "Simple machines", "Habitats"], ok: 0 }
    ],
    "atom-parts": [
      { q: "A proton's charge is…", a: ["Positive", "Negative", "Zero", "Positive only in a metal"], ok: 0 },
      { q: "An electron's charge is…", a: ["Negative", "Positive", "Zero", "Twice a proton"], ok: 0 },
      { q: "Adding a neutron changes the…", a: ["Mass, not the element", "Element", "Proton charge", "Atomic number"], ok: 0 },
      { q: "The nucleus is small but holds almost all the…", a: ["Mass", "Volume of the atom", "Electrons", "Chemical bonds"], ok: 0 }
    ],
    heavens: [
      { q: "Psalm 19:1 names the one the heavens declare as…", a: ["God", "A single planet", "The periodic table", "A human observer"], ok: 0 },
      { q: "The firmament in that verse is the…", a: ["Sky spread out", "Inner ear", "Stomach", "Soil layer"], ok: 0 },
      { q: "Handywork means the sky is…", a: ["Made, not an accident of the verse", "A blank", "A machine we built", "Only a weather chart"], ok: 0 },
      { q: "A field use of the verse is to…", a: ["Look up and give thanks", "Ignore the night sky", "Replace the verse with a lab note", "Count protons"], ok: 0 }
    ]
  };
  topics.forEach(function (t) {
    if (upperQuiz[t.id]) t.quizUpper = upperQuiz[t.id];
  });

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
    { id: "element", bands: MID, text: "Name an element you used today without thinking (oxygen you breathed, iron in a pan, sodium in salt)." }
  ];

  const babyPlates = [
    { id: "leaf", name: "Leaf", img: "images/ui/baby-leaf.svg", sound: "leaf", read: "Leaf." },
    { id: "sun", name: "Sun", img: "images/ui/baby-sun.svg", sound: "chirp", read: "Sun." },
    { id: "rain", name: "Rain", img: "images/ui/baby-rain.svg", sound: "drop", read: "Rain. A puddle." },
    { id: "puddle", name: "Puddle", img: "images/habitats/pond.svg", sound: "drop", read: "Puddle." },
    { id: "cloud", name: "Cloud", img: "images/weather/cloud-cumulus.svg", sound: "leaf", read: "Cloud." },
    { id: "moon", name: "Moon", img: "images/creation/heavens.svg", sound: "chirp", read: "Moon." },
    { id: "bird", name: "Bird", img: "images/ui/baby-bird.svg", sound: "chirp", read: "Bird." },
    { id: "fish", name: "Fish", img: "images/ui/baby-fish.svg", sound: "drop", read: "Fish." },
    { id: "seed", name: "Seed", img: "images/specimens/bean-seed.svg", sound: "leaf", read: "Seed." },
    { id: "flower", name: "Flower", img: "images/specimens/dandelion.svg", sound: "chirp", read: "Flower." },
    { id: "worm", name: "Worm", img: "images/specimens/earthworm.svg", sound: "leaf", read: "Worm." },
    { id: "stone", name: "Stone", img: "images/habitats/mountain.svg", sound: "drop", read: "Stone." }
  ];

  const sorts = [
    { id: "kind-sort", title: "After their kind", bands: ["preschool", "early", "primary"], prompt: "God made living things to bring forth after their kind. Sort these field finds.", img: "images/creation/kinds.svg", bins: [
      { id: "bird", name: "Bird" }, { id: "fish", name: "Fish" }, { id: "plant", name: "Plant" }, { id: "creeping", name: "Creeping" }
    ], items: [
      { id: "robin", name: "Robin", bin: "bird", img: "images/specimens/robin.svg" },
      { id: "fish", name: "Fish", bin: "fish", img: "images/specimens/fish.svg" },
      { id: "oak-leaf", name: "Oak", bin: "plant", img: "images/specimens/oak-leaf.svg" },
      { id: "butterfly", name: "Butterfly", bin: "creeping", img: "images/specimens/butterfly.svg" },
      { id: "bee", name: "Bee", bin: "creeping", img: "images/specimens/bee.svg" },
      { id: "pine", name: "Pine", bin: "plant", img: "images/specimens/pine.svg" },
      { id: "feather", name: "Feather", bin: "bird", img: "images/specimens/feather.svg" }
    ]},
    { id: "sink-sort", title: "Sink or float", bands: ["toddler", "preschool", "early"], prompt: "Guess, then sort. Trapped air helps a light or hollow thing float.", img: "images/habitats/pond.svg", bins: [
      { id: "sink", name: "Sinks" }, { id: "float", name: "Floats" }
    ], items: [
      { id: "pebble", name: "Pebble", bin: "sink", img: "images/specimens/pebble.svg" },
      { id: "twig", name: "Twig", bin: "float", img: "images/specimens/twig.svg" },
      { id: "shell", name: "Empty shell", bin: "float", img: "images/specimens/shell.svg" },
      { id: "feather", name: "Feather", bin: "float", img: "images/specimens/feather.svg" },
      { id: "puff", name: "Seed puff", bin: "float", img: "images/specimens/dandelion.svg" }
    ]},
    { id: "acid-sort", title: "Acid or base", bands: UP, prompt: "Household clues only. Never taste a lab jar.", img: "images/body/atom.svg", bins: [
      { id: "acid", name: "Acid" }, { id: "base", name: "Base" }
    ], items: [
      { id: "lemon", name: "Lemon juice", bin: "acid" },
      { id: "vinegar", name: "Vinegar", bin: "acid" },
      { id: "soap", name: "Soap water", bin: "base" },
      { id: "soda", name: "Baking soda in water", bin: "base" }
    ]},
    { id: "plant-parts", title: "Plant parts", bands: ["preschool", "early", "primary"], prompt: "Match the part to its job.", img: "images/specimens/bean-seed.svg", bins: [
      { id: "root", name: "Root" }, { id: "leaf", name: "Leaf" }, { id: "flower", name: "Flower" }, { id: "seed", name: "Seed" }
    ], items: [
      { id: "drink", name: "Drinks from soil", bin: "root", img: "images/habitats/garden.svg" },
      { id: "sun", name: "Catches light", bin: "leaf", img: "images/specimens/oak-leaf.svg" },
      { id: "bee", name: "Invites a bee", bin: "flower", img: "images/specimens/dandelion.svg" },
      { id: "baby", name: "Holds a baby plant", bin: "seed", img: "images/specimens/bean-seed.svg" }
    ]}
  ];

  const matches = [
    { id: "machine-match", title: "Machine to job", bands: SCHOOL, img: "images/machines/lever.svg", pairs: [
      { l: "Lever", r: "Lift a lid with a bar" },
      { l: "Ramp", r: "Walk a load up a slope" },
      { l: "Pulley", r: "Pull down to lift a flag" },
      { l: "Wedge", r: "Split with a point" },
      { l: "Screw", r: "Hold wood with a twist" },
      { l: "Wheel", r: "Roll a load" }
    ]},
    { id: "sense-match", title: "Sense to organ", bands: ["toddler", "preschool", "early", "primary"], img: "images/creation/eye.svg", pairs: [
      { l: "Sight", r: "Eyes", lImg: "images/creation/eye.svg", rImg: "images/creation/eye.svg" },
      { l: "Hearing", r: "Ears", lImg: "images/body/ear.svg", rImg: "images/body/ear.svg" },
      { l: "Smell", r: "Nose", lImg: "images/body/nose.svg", rImg: "images/body/nose.svg" },
      { l: "Taste", r: "Tongue", lImg: "images/body/tongue.svg", rImg: "images/body/tongue.svg" },
      { l: "Touch", r: "Skin", lImg: "images/body/skin.svg", rImg: "images/body/skin.svg" }
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

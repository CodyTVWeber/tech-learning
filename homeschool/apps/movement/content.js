/* Circus Parade — original movement content. No CC recitation text. */
window.HSMovement = {
  subject: "movement",
  theme: "Circus Parade",
  tagline: "Join the parade. Earn ribbons.",
  bands: [
    { id: "baby", label: "Baby", blurb: "Lap play, gentle tracking, and bounce rhymes." },
    { id: "toddler", label: "Toddler", blurb: "March, freeze, clap, and count a few steps." },
    { id: "preschool", label: "Preschool", blurb: "Creative movement, ballet shapes, and freeze band." },
    { id: "early", label: "Early", blurb: "Ballet + tap shapes, follow-the-leader, counting marches." },
    { id: "primary", label: "Primary", blurb: "Tap + street-beat parade, longer sequences, skip-count marches." },
    { id: "upper", label: "Upper", blurb: "Build a parade routine, lead the freeze band, counted warm-ups." }
  ],
  activities: [
    { id: "peek", title: "Wagon Watch", kicker: "Track the parade", bands: ["baby", "toddler"], img: "images/circus-parade-hero.jpg", alt: "Parade wagon and horse on a fairground" },
    { id: "rhymes", title: "Lap Tent Rhymes", kicker: "Bounce and pat", bands: ["baby", "toddler", "preschool"], img: "images/lap-quilt.jpg", alt: "Quilt and wooden circus blocks for lap play" },
    { id: "parade", title: "Join the Parade", kicker: "Follow the leader", bands: ["toddler", "preschool", "early", "primary", "upper"], img: "images/circus-horse.jpg", alt: "White parade horse in brass harness" },
    { id: "ringmaster", title: "Ringmaster Says", kicker: "Listen, then move", bands: ["preschool", "early", "primary", "upper"], img: "images/circus-tent.jpg", alt: "Red and cream circus tent" },
    { id: "freeze", title: "Freeze Band", kicker: "Move, then statue", bands: ["toddler", "preschool", "early", "primary", "upper"], img: "images/freeze-ring.jpg", alt: "Empty spotlighted circus ring" },
    { id: "count", title: "Step Counter", kicker: "Count the steps", bands: ["toddler", "preschool", "early", "primary", "upper"], img: "images/circus-elephant.jpg", alt: "Calm elephant on a sawdust track" },
    { id: "ballet", title: "Tent-Pole Ballet", kicker: "Tall and smooth", bands: ["preschool", "early"], img: "images/circus-tent.jpg", alt: "Circus tent with brass pole" },
    { id: "tap", title: "Board-Walk Tap", kicker: "Toe, heel, stamp", bands: ["early", "primary"], img: "images/circus-bandstand.jpg", alt: "Wooden bandstand with snare drum" },
    { id: "street", title: "Street-Beat Parade", kicker: "Bounce and freeze poses", bands: ["primary"], img: "images/circus-bandstand.jpg", alt: "Circus bandstand and brass" },
    { id: "builder", title: "Parade Builder", kicker: "Make a short show", bands: ["primary", "upper"], img: "images/circus-parade-hero.jpg", alt: "Circus parade wagon" },
    { id: "practice", title: "Practice Tent", kicker: "Timer and bag check", bands: ["preschool", "early", "primary", "upper"], img: "images/circus-tent.jpg", alt: "Circus tent and ticket booth" },
    { id: "glossary", title: "Step Names", kicker: "Words for moves", bands: ["early", "primary", "upper"], img: "images/circus-ribbons.jpg", alt: "Prize ribbons on navy cloth" },
    { id: "collection", title: "Ribbon Board", kicker: "Stamps and ribbons", bands: ["baby", "toddler", "preschool", "early", "primary", "upper"], img: "images/circus-ribbons.jpg", alt: "Prize ribbons" }
  ],
  ribbons: [
    { id: "red", name: "Crimson ribbon", color: "#8e1d1a" },
    { id: "blue", name: "Navy ribbon", color: "#243868" },
    { id: "gold", name: "Brass ribbon", color: "#c4a35a" },
    { id: "green", name: "Sawdust ribbon", color: "#5c6b3a" },
    { id: "cream", name: "Ticket ribbon", color: "#efe4c6" },
    { id: "star", name: "Ring star", color: "#e8d48a" }
  ],
  stamps: [
    { id: "wagon", name: "Wagon" },
    { id: "horse", name: "Parade horse" },
    { id: "elephant", name: "Elephant" },
    { id: "drum", name: "Parade drum" },
    { id: "tent", name: "Big tent" },
    { id: "star", name: "Gold star" }
  ],
  bag: [
    "Water",
    "Practice shoes",
    "Soft clothes you can move in",
    "Hair out of the eyes",
    "A clear patch of floor"
  ],
  moves: {
    "elephant-swing": { name: "Elephant swing", say: "Heavy steps. Swing one arm like a trunk.", how: "Bend the knees. Step slow and heavy. Swing one arm down and up.", kind: "circus", bands: ["toddler", "preschool", "early"] },
    "high-horse": { name: "High-step horse", say: "Lift the knees. Prance.", how: "March with high knees. Hands hold pretend reins.", kind: "circus", bands: ["toddler", "preschool", "early", "primary"] },
    "quiet-mouse": { name: "Quiet mouse", say: "Tiny steps. Soft toes.", how: "Creep on quiet feet. Finger to lips.", kind: "creative", bands: ["baby", "toddler", "preschool"] },
    "lion-stretch": { name: "Lion stretch", say: "Hands down. Hips up. Roar without the scare.", how: "Hands and feet on the floor, hips high, then sit back on the heels.", kind: "circus", bands: ["toddler", "preschool", "early"] },
    "seal-clap": { name: "Seal clap", say: "Clap the hands. Stretch the neck tall.", how: "Sit or kneel. Clap overhead, then in front.", kind: "circus", bands: ["baby", "toddler", "preschool"] },
    "tightrope": { name: "Tightrope", say: "Arms out. Heel to toe.", how: "Walk a straight line, heel touching toe, arms like a pole.", kind: "circus", bands: ["preschool", "early", "primary", "upper"] },
    "juggle-toss": { name: "Pretend juggle", say: "Toss, toss, catch the air.", how: "Alternate hands tossing pretend balls. Eyes on the toss.", kind: "circus", bands: ["preschool", "early", "primary"] },
    "drum-major": { name: "Drum major", say: "Knees up. Punch the sky on the beat.", how: "March. One arm pumps a pretend baton.", kind: "circus", bands: ["toddler", "preschool", "early", "primary", "upper"] },
    "wagon-pull": { name: "Wagon pull", say: "Lean back. Pull the rope.", how: "Two hands on a pretend rope. Walk backward three steps, then forward.", kind: "circus", bands: ["toddler", "preschool", "early"] },
    "ribbon-twirl": { name: "Ribbon twirl", say: "Big arm circles. Soft knees.", how: "Circle one arm, then the other, then both.", kind: "creative", bands: ["toddler", "preschool", "early", "primary"] },
    "statue": { name: "Parade statue", say: "Freeze in a strong shape.", how: "Pick a still shape: star, tuck, or point. Hold without wobbling.", kind: "freeze", bands: ["toddler", "preschool", "early", "primary", "upper"] },
    "bow": { name: "Bow to the crowd", say: "Hands to the sides. Bend. Smile.", how: "Feet together, bend at the hips, rise slowly.", kind: "circus", bands: ["baby", "toddler", "preschool", "early", "primary", "upper"] },
    "melt": { name: "Melt", say: "Drip down to the floor.", how: "Start tall, fold slowly until you sit or lie.", kind: "creative", bands: ["toddler", "preschool", "early"] },
    "grow": { name: "Grow like a tent", say: "Tiny seed, then up to the pole.", how: "Curl small, then rise with arms to a point.", kind: "creative", bands: ["baby", "toddler", "preschool", "early"] },
    "spot-spin": { name: "One-spot spin", say: "Eyes on one point. Turn once. Stop.", how: "Pick a spot on the wall, turn, find the spot again.", kind: "creative", bands: ["early", "primary", "upper"] },
    "skip": { name: "Skip the ring", say: "Step, hop, step, hop.", how: "Skip in a circle. Soft landings.", kind: "locomotor", bands: ["preschool", "early", "primary"] },
    "gallop": { name: "Gallop", say: "One foot chases the other.", how: "Same lead foot. Travel sideways-forward around the room.", kind: "locomotor", bands: ["preschool", "early", "primary"] },
    "giant-tiny": { name: "Giant and tiny", say: "Huge steps, then mouse steps.", how: "Four giant steps, four tiny steps.", kind: "locomotor", bands: ["toddler", "preschool", "early"] },
    "reach-top": { name: "Reach the tent top", say: "Stretch up. Then hang the arms.", how: "Rise on the balls of the feet, reach, lower.", kind: "creative", bands: ["baby", "toddler", "preschool", "early"] },
    "clap-stomp": { name: "Clap stomp", say: "Clap, clap, stomp.", how: "Two claps, one stomp. Repeat.", kind: "rhythm", bands: ["toddler", "preschool", "early", "primary"] },
    "march": { name: "Sawdust march", say: "Left, right, left, right.", how: "Swing the opposite arm to the stepping foot.", kind: "locomotor", bands: ["toddler", "preschool", "early", "primary", "upper"] },
    "wiggle": { name: "Wiggle wash", say: "Shake the hands, the shoulders, the knees.", how: "Loose shake, then freeze tall.", kind: "creative", bands: ["baby", "toddler", "preschool"] },
    "kick-kicks": { name: "Kick kicks", say: "Gentle kicks on a grown-up’s lap or on the floor.", how: "Alternate legs. Soft, not wild.", kind: "baby", bands: ["baby", "toddler"] },
    "open-close": { name: "Open and close", say: "Arms wide like the tent flap. Then hug.", how: "Open arms, close to the chest.", kind: "baby", bands: ["baby", "toddler"] },
    "look-parade": { name: "Look left, look right", say: "Track the wagon.", how: "Slow head turn. Grown-up moves a scarf or the screen wagon.", kind: "baby", bands: ["baby"] },
    "bicycle": { name: "Bicycle legs", say: "Grown-up: gentle bicycle the legs.", how: "On the back, slow circles. Stop if the little one tenses.", kind: "baby", bands: ["baby"] },
    "plie": { name: "Plié (tent bend)", say: "Heels down. Knees bend. Back tall like a tent pole.", how: "Feet in a small V. Bend both knees. Rise without the heels popping.", kind: "ballet", bands: ["preschool", "early"] },
    "tendu": { name: "Tendu (brush the sawdust)", say: "Slide the foot until the toes point. Slide it home.", how: "Keep the standing knee soft-straight. Toes stay on the floor.", kind: "ballet", bands: ["preschool", "early"] },
    "releve": { name: "Relevé (rise)", say: "Rise onto the balls of both feet. Lower quietly.", how: "Hold a chair back if you need it. No bouncing.", kind: "ballet", bands: ["preschool", "early"] },
    "port-de-bras": { name: "Port de bras (carry the arms)", say: "Paint a half-circle in the air.", how: "Arms low, to the sides, overhead, and down. Soft elbows.", kind: "ballet", bands: ["preschool", "early"] },
    "passe": { name: "Passé (knee rest)", say: "Point one foot. Rest it at the other knee.", how: "Standing leg tall. Hold two breaths.", kind: "ballet", bands: ["early"] },
    "toe-tap": { name: "Toe tap", say: "Tap the tip of the shoe. Lift.", how: "Keep the knee easy. Sound is light.", kind: "tap", bands: ["early", "primary"] },
    "heel-drop": { name: "Heel drop", say: "Lift the heel. Drop it for a knock.", how: "Ball of the foot stays down.", kind: "tap", bands: ["early", "primary"] },
    "stamp": { name: "Stamp", say: "Step and leave the foot down. Solid sound.", how: "Whole foot. Not a stomp that hurts.", kind: "tap", bands: ["early", "primary"] },
    "shuffle": { name: "Shuffle", say: "Brush forward. Brush back.", how: "Loose ankle. Two light sounds.", kind: "tap", bands: ["early", "primary"] },
    "ball-change": { name: "Ball change", say: "Ball of one foot, then the other, quick.", how: "Weight rocks back and forth.", kind: "tap", bands: ["primary"] },
    "bounce": { name: "Parade bounce", say: "Bend and stretch the knees on the beat.", how: "Feet under the hips. Bounce small.", kind: "street", bands: ["primary"] },
    "two-step": { name: "Two-step", say: "Side, close, other side, close.", how: "Step together in a small slot. Keep it modest and easy.", kind: "street", bands: ["primary"] },
    "clap-cross": { name: "Clap cross", say: "Clap. Cross the arms. Open.", how: "On the beat: clap, cross, open, clap.", kind: "street", bands: ["primary"] },
    "point-pose": { name: "Point pose", say: "Point one arm. Freeze a strong shape.", how: "Hold two beats. Switch sides.", kind: "street", bands: ["primary", "upper"] },
    "box-step": { name: "Box step", say: "Forward, side, back, side.", how: "A small square on the floor.", kind: "street", bands: ["primary", "upper"] },
    "shoulder-rolls": { name: "Shoulder rolls", say: "Roll the shoulders back. Open the chest.", how: "Slow circles. Used as a warm-up.", kind: "warmup", bands: ["early", "primary", "upper"] },
    "ankle-circles": { name: "Ankle circles", say: "Point, then circle each foot.", how: "Hold a wall. One foot at a time.", kind: "warmup", bands: ["primary", "upper"] },
    "count-in": { name: "Eight-count in", say: "Breathe in four. Out four.", how: "Stand tall. Silent mouths. Ready to start.", kind: "warmup", bands: ["upper"] }
  },
  sequences: {
    baby: ["open-close", "kick-kicks", "look-parade", "seal-clap", "grow"],
    toddler: ["march", "clap-stomp", "elephant-swing", "wiggle", "statue", "bow"],
    preschool: ["drum-major", "high-horse", "tightrope", "ribbon-twirl", "melt", "grow", "bow"],
    early: ["march", "plie", "tendu", "toe-tap", "tightrope", "skip", "bow"],
    primary: ["bounce", "two-step", "shuffle", "stamp", "point-pose", "gallop", "bow"],
    upper: ["shoulder-rolls", "count-in", "drum-major", "tightrope", "spot-spin", "box-step", "statue", "bow"]
  },
  balletSet: ["plie", "tendu", "releve", "port-de-bras", "passe"],
  tapSet: ["toe-tap", "heel-drop", "stamp", "shuffle", "ball-change"],
  streetSet: ["bounce", "two-step", "clap-cross", "point-pose", "box-step"],
  freeze: {
    toddler: { bpm: 84, barsMin: 4, barsMax: 6, warn: true },
    preschool: { bpm: 96, barsMin: 3, barsMax: 6, warn: true },
    early: { bpm: 108, barsMin: 2, barsMax: 5, warn: false },
    primary: { bpm: 118, barsMin: 2, barsMax: 4, warn: false },
    upper: { bpm: 126, barsMin: 1, barsMax: 4, warn: false }
  },
  counts: {
    toddler: { targets: [2, 3, 4, 5], skip: 1, prompt: "Tap the drum each time you step." },
    preschool: { targets: [4, 5, 6, 8, 10], skip: 1, prompt: "Count the steps out loud." },
    early: { targets: [8, 10, 12, 15, 20], skip: 1, prompt: "March and count. Then do that many on the floor." },
    primary: { targets: [10, 12, 16, 20], skip: [2, 5], prompt: "Skip-count the march, then finish the same count across the room." },
    upper: { targets: [16, 24, 32], skip: [2, 3, 5, 10], prompt: "Count a clean phrase, then mark it on paper as 8-counts." }
  },
  rhymes: [
    {
      id: "pat-a-cake",
      title: "Pat-a-cake",
      source: "Traditional public-domain nursery rhyme",
      bands: ["baby", "toddler", "preschool"],
      grownup: "Sit the little one on your lap facing you. Pat hands together on the beat.",
      lines: [
        "Pat-a-cake, pat-a-cake, baker's man,",
        "Bake me a cake as fast as you can.",
        "Pat it, and prick it, and mark it with B,",
        "Put it in the oven for baby and me."
      ]
    },
    {
      id: "this-little-pig",
      title: "This little pig",
      source: "Traditional public-domain nursery rhyme",
      bands: ["baby", "toddler"],
      grownup: "Count toes or fingers, one line each. Gentle tickle on the last line.",
      lines: [
        "This little pig went to market,",
        "This little pig stayed home,",
        "This little pig had roast beef,",
        "This little pig had none,",
        "And this little pig cried wee-wee-wee all the way home."
      ]
    },
    {
      id: "garden",
      title: "Round and round the garden",
      source: "Traditional public-domain nursery rhyme",
      bands: ["baby", "toddler"],
      grownup: "Circle a finger on the palm, then walk two fingers up the arm.",
      lines: [
        "Round and round the garden,",
        "Like a teddy bear.",
        "One step, two steps,",
        "Tickle you under there."
      ]
    },
    {
      id: "hickory",
      title: "Hickory dickory dock",
      source: "Traditional public-domain nursery rhyme",
      bands: ["baby", "toddler", "preschool"],
      grownup: "Raise arms on ‘up’, tap a pretend clock on ‘struck’, lower on ‘down’.",
      lines: [
        "Hickory dickory dock,",
        "The mouse ran up the clock.",
        "The clock struck one,",
        "The mouse ran down,",
        "Hickory dickory dock."
      ]
    },
    {
      id: "banbury",
      title: "Ride a cock-horse",
      source: "Traditional public-domain nursery rhyme",
      bands: ["baby", "toddler"],
      grownup: "Knee-bounce. Stop still on the last line.",
      lines: [
        "Ride a cock-horse to Banbury Cross,",
        "To see a fine lady upon a white horse.",
        "Rings on her fingers and bells on her toes,",
        "She shall have music wherever she goes."
      ]
    },
    {
      id: "market",
      title: "To market, to market",
      source: "Traditional public-domain nursery rhyme",
      bands: ["baby", "toddler"],
      grownup: "Bounce on ‘market’, gentle halt on ‘home again’.",
      lines: [
        "To market, to market, to buy a fat pig,",
        "Home again, home again, jiggety-jig.",
        "To market, to market, to buy a fat hog,",
        "Home again, home again, jiggety-jog."
      ]
    },
    {
      id: "spider",
      title: "The itsy bitsy spider",
      source: "Traditional public-domain song",
      bands: ["toddler", "preschool"],
      grownup: "Fingers climb, rain sprinkles down, sun circle, climb again.",
      lines: [
        "The itsy bitsy spider climbed up the water spout.",
        "Down came the rain and washed the spider out.",
        "Out came the sun and dried up all the rain,",
        "And the itsy bitsy spider climbed up the spout again."
      ]
    },
    {
      id: "pony",
      title: "Little parade pony",
      source: "Original",
      bands: ["baby", "toddler", "preschool"],
      grownup: "Knee-bounce. Faster on ‘trot’, still on ‘whoa’.",
      lines: [
        "Little parade pony, clip and clop,",
        "Around the ring we go, then we stop.",
        "Trot, trot, trot to the gold brass gate,",
        "Whoa, little pony — wait, wait, wait."
      ]
    },
    {
      id: "tent-up",
      title: "The tent goes up",
      source: "Original",
      bands: ["baby", "toddler", "preschool"],
      grownup: "Arms up on ‘up’, down on ‘down’, hug on ‘home’.",
      lines: [
        "The tent goes up, the tent goes up,",
        "Poles in the ground, the tent goes up.",
        "The tent comes down, the tent comes down,",
        "Fold it small and carry it home."
      ]
    },
    {
      id: "five-ribbons",
      title: "Five gold ribbons",
      source: "Original",
      bands: ["toddler", "preschool"],
      grownup: "Hold up five fingers and fold one down each verse.",
      lines: [
        "Five gold ribbons on the parade pole.",
        "One flies off — the wind took hold.",
        "Four gold ribbons in the brass sun.",
        "Count them, clap them, march as one."
      ]
    },
    {
      id: "soft-drum",
      title: "Soft little drum",
      source: "Original",
      bands: ["baby", "toddler"],
      grownup: "Pat chest or a cushion: slow, then quick, then still.",
      lines: [
        "Soft little drum in the circus band,",
        "Pat, pat, pat with a careful hand.",
        "Quick little drum when the horses go,",
        "Then hush — the parade is walking slow."
      ]
    },
    {
      id: "ring-march",
      title: "Marching around the ring",
      source: "Original",
      bands: ["toddler", "preschool", "early"],
      grownup: "March in a small circle. Freeze on ‘stand’.",
      lines: [
        "Marching around the ring we go,",
        "High knees, proud chest, heels in a row.",
        "Marching around until we hear the band —",
        "Halt, tall statue, freeze and stand."
      ]
    }
  ],
  glossary: [
    { term: "March", def: "Walk with a steady beat, opposite arm swinging with the stepping foot.", bands: ["early", "primary", "upper"] },
    { term: "Freeze", def: "Stop all moving at once and hold a still shape.", bands: ["early", "primary", "upper"] },
    { term: "Plié", def: "A slow bend of the knees with the back tall and the heels as quiet as you can keep them.", bands: ["early"] },
    { term: "Tendu", def: "A brush of the foot along the floor until the toes point, then a brush home.", bands: ["early"] },
    { term: "Relevé", def: "A rise onto the balls of the feet, then a quiet lower.", bands: ["early"] },
    { term: "Port de bras", def: "Carrying the arms in a smooth path, as if the air is thick paint.", bands: ["early"] },
    { term: "Passé", def: "One pointed foot rests lightly at the other knee while you stand tall.", bands: ["early"] },
    { term: "Toe tap", def: "A light strike with the tip of the shoe that leaves the floor again.", bands: ["early", "primary"] },
    { term: "Heel drop", def: "The ball of the foot stays down; the heel lifts and knocks the floor.", bands: ["early", "primary"] },
    { term: "Stamp", def: "A whole-foot step that stays down and makes a solid sound.", bands: ["early", "primary"] },
    { term: "Shuffle", def: "Two light brushes: forward, then back, with a loose ankle.", bands: ["early", "primary"] },
    { term: "Ball change", def: "A quick rock of weight from the ball of one foot to the other.", bands: ["primary"] },
    { term: "Bounce", def: "Small knee bends on the beat, feet under the hips, chest easy.", bands: ["primary"] },
    { term: "Two-step", def: "Step to the side and close, then the other side and close.", bands: ["primary"] },
    { term: "8-count", def: "A short phrase of eight beats. Parade steps are often grouped this way.", bands: ["primary", "upper"] },
    { term: "Spotting", def: "Keeping the eyes on one point as you turn so the stop is clean.", bands: ["upper"] },
    { term: "Warm-up", def: "Easy moves first so ankles, knees, and shoulders are ready.", bands: ["primary", "upper"] },
    { term: "Choreography", def: "A planned order of moves. In this app you build a short parade show.", bands: ["upper"] }
  ],
  practiceMinutes: {
    preschool: [3, 5],
    early: [5, 8],
    primary: [5, 10],
    upper: [8, 10]
  },
  parentNotes: {
    baby: "Grown-up stays with the little one. These are lap and floor plays, not a class.",
    toddler: "Short bursts. Stop while it is still fun. Floor should be clear of toys with sharp corners.",
    preschool: "Creative movement and simple ballet shapes. Bare feet or soft shoes on a safe floor.",
    early: "Ballet + tap shapes, original names and cues — not a studio combination.",
    primary: "Tap + street-beat parade. Modest shapes only. No splits, drops, or floor work that needs a coach.",
    upper: "Lead a short parade. Count in 8s. Still a home practice aid, not a class tape."
  }
};

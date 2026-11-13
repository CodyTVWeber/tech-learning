/* Original snare lines. Not quotations of published etudes or songs.
   v2 hooks (data only): note.dynamic is pp|p|mp|mf|f|ff, and each line has
   tempoLocked / tempoMin / tempoMax for a future tempo slider. */
(function (global) {
  "use strict";

  function hit(beats, dynamic) {
    return { beats: beats, rest: false, dynamic: dynamic || "mf" };
  }
  function rest(beats) {
    return { beats: beats, rest: true, dynamic: null };
  }
  const Q = function (d) { return hit(1, d); };
  const E = function (d) { return hit(0.5, d); };
  const H = function (d) { return hit(2, d); };
  const R = function () { return rest(1); };

  const YOUNG = ["baby", "toddler", "preschool", "early", "primary", "upper"];
  const FROM_TODDLER = ["toddler", "preschool", "early", "primary", "upper"];
  const FROM_PRE = ["preschool", "early", "primary", "upper"];
  const FROM_EARLY = ["early", "primary", "upper"];
  const FROM_PRIMARY = ["primary", "upper"];
  const UPPER = ["upper"];

  const LINES = [
    {
      id: "four-steady",
      title: "Four Steady",
      blurb: "Four taps, then four more.",
      audioText: "Four steady taps, then four more. Tap when each note arrives.",
      bpm: 60,
      tempoLocked: true,
      tempoMin: 60,
      tempoMax: 80,
      bands: YOUNG,
      notes: [Q("mp"), Q("mf"), Q("mf"), Q("f"), Q("mf"), Q("mf"), Q("f"), Q("ff")]
    },
    {
      id: "quiet-middle",
      title: "Quiet Middle",
      blurb: "Leave the middle beat quiet.",
      audioText: "Tap, then leave the middle beat quiet, then tap again.",
      bpm: 60,
      tempoLocked: true,
      tempoMin: 60,
      tempoMax: 80,
      bands: FROM_TODDLER,
      notes: [Q("p"), R(), Q("mf"), Q("mf"), Q("mf"), Q("f"), R(), Q("mf")]
    },
    {
      id: "walk-wait",
      title: "Walk and Wait",
      blurb: "Two taps, then let the line rest.",
      audioText: "Two taps, then wait. Then tap, wait, tap, wait.",
      bpm: 64,
      tempoLocked: true,
      tempoMin: 60,
      tempoMax: 80,
      bands: FROM_PRE,
      notes: [Q("mf"), Q("mf"), R(), R(), Q("mp"), R(), Q("f"), R()]
    },
    {
      id: "after-one",
      title: "After One",
      blurb: "Wait one beat, then tap.",
      audioText: "Wait one beat, then tap. Keep the rests quiet.",
      bpm: 66,
      tempoLocked: true,
      tempoMin: 60,
      tempoMax: 80,
      bands: FROM_EARLY,
      notes: [R(), Q("mf"), R(), Q("f"), Q("mp"), R(), Q("mf"), Q("ff")]
    },
    {
      id: "little-pairs",
      title: "Little Pairs",
      blurb: "Two quick taps share a beat.",
      audioText: "Two quick taps share one beat. Then a longer tap.",
      bpm: 70,
      tempoLocked: true,
      tempoMin: 60,
      tempoMax: 80,
      bands: FROM_EARLY,
      notes: [
        E("mf"), E("mf"), Q("f"), Q("mf"), Q("mp"),
        Q("mf"), E("f"), E("f"), Q("mf"), Q("p"),
        E("mp"), E("mf"), E("mf"), E("f"), Q("mf"), Q("f"),
        Q("mf"), Q("mp"), E("f"), E("f"), E("mf"), E("p")
      ]
    },
    {
      id: "split-line",
      title: "Split Line",
      blurb: "Split the beats into quick pairs.",
      audioText: "Split the beats. Quick pairs, then a longer tap.",
      bpm: 74,
      tempoLocked: true,
      tempoMin: 60,
      tempoMax: 80,
      bands: FROM_PRIMARY,
      notes: [
        E("p"), E("mp"), E("mf"), E("mf"), E("f"), E("f"), E("ff"), E("mf"),
        Q("mf"), E("f"), E("mf"), Q("mp"), E("f"), E("p"),
        E("mf"), E("f"), Q("mf"), E("mp"), E("f"), Q("ff"),
        E("p"), E("mf"), E("f"), E("ff"), Q("mf"), Q("f")
      ]
    },
    {
      id: "long-short",
      title: "Long and Short",
      blurb: "A long note, then short ones.",
      audioText: "Hold the long notes in your eyes, and tap once when they start.",
      bpm: 76,
      tempoLocked: true,
      tempoMin: 60,
      tempoMax: 80,
      bands: FROM_PRIMARY,
      notes: [
        H("p"), Q("mf"), Q("f"),
        Q("mf"), H("mp"), Q("ff"),
        E("mf"), E("f"), E("mf"), E("p"), H("f"),
        Q("mp"), E("mf"), E("f"), Q("mf"), E("f"), E("ff")
      ]
    },
    {
      id: "shed-line",
      title: "Shed Line",
      blurb: "Quick taps, longer taps, and rests.",
      audioText: "This line mixes quick taps, longer taps, and quiet beats.",
      bpm: 80,
      tempoLocked: true,
      tempoMin: 60,
      tempoMax: 80,
      bands: UPPER,
      notes: [
        E("mf"), E("f"), R(), E("mp"), E("mf"), Q("f"),
        R(), E("p"), E("mf"), Q("f"), E("ff"), E("mf"),
        Q("mf"), E("f"), E("mf"), E("p"), E("f"), R(),
        E("pp"), E("p"), E("mp"), E("mf"), E("f"), E("f"), E("ff"), E("mf")
      ]
    }
  ];

  LINES.forEach(function (ex) {
    let beat = 0;
    ex.notes.forEach(function (note) {
      beat += note.beats;
      if (!note.rest && ["pp", "p", "mp", "mf", "f", "ff"].indexOf(note.dynamic) === -1) {
        throw new Error(ex.id + " dynamic");
      }
    });
    if (beat < 4 || beat % 4 !== 0) throw new Error(ex.id + " bars " + beat);
    if (ex.bpm < 60 || ex.bpm > 80) throw new Error(ex.id + " bpm");
  });

  global.DRUM_LINES = LINES;
})(window);

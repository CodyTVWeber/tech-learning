(function (global) {
  const LEAF = "#2c5a32";
  const SOIL = "#5c3b22";
  const SUN = "#e6b33a";
  const CREAM = "#f6f1e4";
  const CLAY = "#b04a32";
  const PATH = "#d9c89a";
  const SKY = "#c4d6ba";
  const POND = "#4a7a8a";
  const FLOWERS = {
    s: "#e8d36a",
    m: "#7a9e6e",
    a: "#e08a6a",
    t: "#d4a574",
    p: "#d48aa0",
    i: "#8fbfd4",
    n: "#c4b07a",
    d: "#a9845c",
    g: "#5e8f55",
    o: "#c46a48",
    c: "#c9a06a",
    k: "#b08968",
    e: "#d07a54",
    u: "#6a8f5a",
    r: "#c45a4a",
    h: "#8a9e6e",
    b: "#e6b33a",
    f: "#6b4a62",
    l: "#4f7a48",
    j: "#c47a3a",
    v: "#5a7a48",
    w: "#6a8aaa",
    x: "#8a7a5a",
    y: "#d4b45a",
    z: "#6a9e6a",
    qu: "#7a6aaa",
    sh: "#8a6a4a",
    ch: "#b04a32",
    th: "#cfc4a8",
    ck: "#e6b33a",
    ng: "#5c3b22",
  };

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function wrap(svg, cls, alt) {
    return (
      '<div class="garden-art ' +
      (cls || "") +
      '" role="img" aria-label="' +
      esc(alt) +
      '">' +
      svg +
      "</div>"
    );
  }

  function soundGlyph(g) {
    const pics = {
      s: '<circle cx="60" cy="46" r="8" fill="#5c3b22"/><circle cx="60" cy="28" r="10" fill="#e6b33a"/><circle cx="78" cy="36" r="10" fill="#e6b33a"/><circle cx="84" cy="54" r="10" fill="#e6b33a"/><circle cx="72" cy="68" r="10" fill="#e6b33a"/><circle cx="48" cy="68" r="10" fill="#e6b33a"/><circle cx="36" cy="54" r="10" fill="#e6b33a"/><circle cx="42" cy="36" r="10" fill="#e6b33a"/><rect x="56" y="70" width="8" height="28" fill="#2c5a32"/>',
      m: '<ellipse cx="40" cy="58" rx="16" ry="22" fill="#3f7a45" transform="rotate(-20 40 58)"/><ellipse cx="60" cy="50" rx="16" ry="24" fill="#6b8f4e"/><ellipse cx="82" cy="60" rx="16" ry="22" fill="#2c5a32" transform="rotate(18 82 60)"/><rect y="96" width="120" height="24" fill="#7a8f6a"/>',
      a: '<circle cx="60" cy="62" r="28" fill="#b04a32"/><rect x="56" y="28" width="6" height="16" fill="#5c3b22"/><ellipse cx="74" cy="36" rx="12" ry="7" fill="#2c5a32"/>',
      t: '<rect x="28" y="34" width="46" height="14" fill="#8aa4b0"/><rect x="62" y="34" width="14" height="36" fill="#8aa4b0"/><rect x="70" y="78" width="8" height="18" fill="#4a7a8a"/><rect x="78" y="86" width="8" height="12" fill="#4a7a8a"/><rect x="86" y="92" width="8" height="8" fill="#4a7a8a"/>',
      p: '<ellipse cx="60" cy="58" rx="18" ry="32" fill="#6b8f4e"/><circle cx="60" cy="40" r="6" fill="#d9c89a"/><circle cx="60" cy="56" r="6" fill="#d9c89a"/><circle cx="60" cy="72" r="6" fill="#d9c89a"/>',
      i: '<path d="M24 78 Q60 28 96 74" fill="none" stroke="#6b8f4e" stroke-width="10" stroke-linecap="round"/><circle cx="30" cy="72" r="4" fill="#1c1712"/><circle cx="90" cy="70" r="4" fill="#1c1712"/>',
      n: '<ellipse cx="60" cy="70" rx="36" ry="16" fill="#8a6239"/><ellipse cx="60" cy="66" rx="22" ry="8" fill="#c4b07a"/><circle cx="48" cy="64" r="5" fill="#f6f1e4"/><circle cx="62" cy="62" r="5" fill="#f6f1e4"/><circle cx="74" cy="66" r="5" fill="#f6f1e4"/>',
      d: '<rect x="70" y="18" width="8" height="70" fill="#a07040"/><polygon points="66,88 82,88 74,108" fill="#5c3b22"/><rect y="100" width="120" height="20" fill="#5c3b22"/>',
      g: '<circle cx="42" cy="58" r="18" fill="#2c5a32"/><circle cx="68" cy="50" r="20" fill="#3f7a45"/><circle cx="88" cy="66" r="14" fill="#6b8f4e"/>',
      o: '<rect x="34" y="48" width="52" height="40" fill="#c46a48"/><rect x="28" y="40" width="64" height="12" fill="#8a4030"/><ellipse cx="60" cy="46" rx="16" ry="6" fill="#5c3b22"/>',
      c: '<path d="M86 40 A28 28 0 1 0 86 84" fill="none" stroke="#c9a06a" stroke-width="12"/><rect x="48" y="96" width="24" height="8" fill="#8a6239"/>',
      k: '<ellipse cx="60" cy="58" rx="28" ry="18" fill="#8a8a8a"/><rect x="32" y="50" width="16" height="10" fill="#5c3b22"/><path d="M40 70 Q60 96 80 70" fill="none" stroke="#6a6a6a" stroke-width="6"/>',
      e: '<ellipse cx="58" cy="68" rx="28" ry="16" fill="#e6d2a0"/><circle cx="86" cy="58" r="12" fill="#e6d2a0"/><polygon points="96,54 110,58 96,64" fill="#e6b33a"/><polygon points="78,48 84,40 88,50" fill="#b04a32"/>',
      u: '<ellipse cx="60" cy="66" rx="22" ry="14" fill="#2c5a32"/><circle cx="78" cy="60" r="8" fill="#1c1712"/><rect x="40" y="52" width="4" height="10" fill="#1c1712"/><rect x="52" y="48" width="4" height="12" fill="#1c1712"/>',
      r: '<rect x="28" y="36" width="64" height="8" fill="#8a4030"/><rect x="36" y="44" width="6" height="28" fill="#8a4030"/><rect x="52" y="44" width="6" height="28" fill="#8a4030"/><rect x="68" y="44" width="6" height="28" fill="#8a4030"/><rect x="24" y="24" width="8" height="70" fill="#5c3b22"/>',
      h: '<rect x="36" y="28" width="8" height="72" fill="#6a5a3a"/><rect x="44" y="36" width="40" height="8" fill="#8a7a5a"/><polygon points="84,36 100,48 84,48" fill="#8a7a5a"/>',
      b: '<ellipse cx="58" cy="64" rx="22" ry="16" fill="#e6b33a"/><rect x="48" y="50" width="6" height="28" fill="#1c1712"/><rect x="62" y="50" width="6" height="28" fill="#1c1712"/><ellipse cx="84" cy="48" rx="14" ry="8" fill="#f6f1e4"/>',
      f: '<ellipse cx="60" cy="64" rx="16" ry="26" fill="#5c364e"/><rect x="56" y="30" width="6" height="16" fill="#2c5a32"/>',
      l: '<ellipse cx="64" cy="58" rx="22" ry="34" fill="#3f7a45"/><rect x="40" y="90" width="8" height="16" fill="#5c3b22"/>',
      j: '<path d="M48 28 H78 V70 Q78 96 52 96 Q36 96 36 80" fill="none" stroke="#4a7a8a" stroke-width="10"/>',
      v: '<path d="M30 96 Q60 20 90 70" fill="none" stroke="#2c5a32" stroke-width="8"/><circle cx="88" cy="66" r="6" fill="#6b8f4e"/>',
      w: '<rect x="30" y="40" width="48" height="28" fill="#4a7a8a"/><rect x="70" y="48" width="22" height="8" fill="#8aa4b0"/><polygon points="34,68 78,68 70,92 42,92" fill="#2c5a32"/>',
      x: '<rect x="28" y="36" width="64" height="8" fill="#8a6239" transform="rotate(32 60 40)"/><rect x="28" y="70" width="64" height="8" fill="#8a6239" transform="rotate(-32 60 74)"/>',
      y: '<ellipse cx="60" cy="68" rx="22" ry="16" fill="#c47a3a"/><ellipse cx="78" cy="60" rx="10" ry="8" fill="#a06028"/>',
      z: '<ellipse cx="60" cy="64" rx="16" ry="32" fill="#3f7a45"/><rect x="52" y="34" width="16" height="8" fill="#6b8f4e"/>',
      qu: '<circle cx="60" cy="62" r="24" fill="#e6b33a"/><rect x="56" y="28" width="6" height="14" fill="#5c3b22"/><ellipse cx="78" cy="40" rx="10" ry="6" fill="#2c5a32"/>',
      sh: '<rect x="34" y="58" width="52" height="32" fill="#78502a"/><polygon points="28,58 60,32 92,58" fill="#b04a32"/>',
      ch: '<rect x="24" y="70" width="72" height="14" fill="#6b8f4e"/><rect x="36" y="56" width="18" height="14" fill="#3f7a45"/><rect x="60" y="50" width="16" height="20" fill="#2c5a32"/>',
      th: '<ellipse cx="48" cy="62" rx="16" ry="10" fill="#cfc4a8"/><ellipse cx="74" cy="62" rx="16" ry="10" fill="#cfc4a8"/><ellipse cx="60" cy="66" rx="6" ry="12" fill="#5c3b22"/>',
      ck: '<ellipse cx="58" cy="70" rx="24" ry="14" fill="#e6b33a"/><circle cx="84" cy="60" r="10" fill="#e6b33a"/><polygon points="92,58 104,62 92,66" fill="#e08a6a"/>',
      ng: '<circle cx="60" cy="62" r="26" fill="#c4b07a"/><circle cx="60" cy="62" r="8" fill="#5c3b22"/><rect x="56" y="18" width="8" height="18" fill="#8a6239"/>',
    };
    return pics[g] || pics.s;
  }

  function flower(g, cls, alt) {
    const svg =
      '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect width="120" height="120" fill="#e7f0df"/>' +
      soundGlyph(g) +
      "</svg>";
    const name = (cls ? cls + " " : "") + "garden-sound";
    return wrap(svg, name, alt || "A picture of a garden sound");
  }

  function bee(cls, alt) {
    const svg =
      '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse cx="78" cy="38" rx="22" ry="14" fill="#f3eee0" stroke="' +
      SOIL +
      '" stroke-width="2"/>' +
      '<ellipse cx="52" cy="62" rx="34" ry="22" fill="' +
      SUN +
      '"/>' +
      '<rect x="44" y="44" width="8" height="36" fill="#1c1712"/>' +
      '<rect x="58" y="44" width="8" height="36" fill="#1c1712"/>' +
      '<circle cx="78" cy="58" r="4" fill="#1c1712"/>' +
      "</svg>";
    return wrap(svg, cls || "garden-bee", alt || "A honeybee");
  }

  function hero(cls, alt) {
    const svg =
      '<svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="320" height="120" fill="' +
      SKY +
      '"/>' +
      '<circle cx="278" cy="28" r="18" fill="' +
      SUN +
      '"/>' +
      '<rect y="78" width="320" height="42" fill="' +
      SOIL +
      '"/>' +
      '<rect x="18" y="64" width="80" height="32" fill="' +
      SOIL +
      '"/>' +
      '<rect x="120" y="70" width="80" height="26" fill="' +
      SOIL +
      '"/>' +
      '<rect x="222" y="66" width="80" height="30" fill="' +
      SOIL +
      '"/>' +
      '<circle cx="48" cy="62" r="10" fill="' +
      CLAY +
      '"/>' +
      '<circle cx="158" cy="66" r="9" fill="' +
      LEAF +
      '"/>' +
      '<circle cx="258" cy="64" r="11" fill="' +
      SUN +
      '"/>' +
      "</svg>";
    return wrap(svg, cls || "garden-hero", alt || "A kitchen garden in morning light");
  }

  function bed(cls, alt) {
    const svg =
      '<svg viewBox="0 0 240 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="240" height="90" fill="' +
      PATH +
      '"/>' +
      '<rect x="12" y="28" width="216" height="50" fill="' +
      SOIL +
      '"/>' +
      '<rect x="12" y="22" width="216" height="10" fill="#8a6239"/>' +
      '<circle cx="52" cy="48" r="10" fill="' +
      SUN +
      '"/>' +
      '<circle cx="96" cy="52" r="9" fill="' +
      LEAF +
      '"/>' +
      '<circle cx="140" cy="46" r="11" fill="' +
      CLAY +
      '"/>' +
      '<circle cx="184" cy="50" r="8" fill="#8fbfd4"/>' +
      "</svg>";
    return wrap(svg, cls || "garden-bed-art", alt || "A soil bed");
  }

  function motif(slot) {
    const s = String(slot || "").toLowerCase();
    if (s.indexOf("fig") !== -1 || s.indexOf("vine") !== -1)
      return '<ellipse cx="100" cy="70" rx="18" ry="26" fill="#5c364e"/><rect x="96" y="28" width="8" height="36" fill="' + LEAF + '"/>';
    if (s.indexOf("pot") !== -1 || s.indexOf("cake") !== -1)
      return '<rect x="78" y="62" width="44" height="28" fill="' + CLAY + '"/><rect x="70" y="56" width="60" height="10" fill="#8a4030"/>';
    if (s.indexOf("bug") !== -1)
      return '<ellipse cx="100" cy="78" rx="16" ry="10" fill="' + LEAF + '"/><circle cx="118" cy="76" r="6" fill="#1c1712"/>';
    if (s.indexOf("plum") !== -1)
      return '<circle cx="108" cy="68" r="18" fill="#78405e"/>';
    if (s.indexOf("frog") !== -1 || s.indexOf("pond") !== -1)
      return '<ellipse cx="100" cy="88" rx="54" ry="16" fill="' + POND + '"/><ellipse cx="84" cy="74" rx="16" ry="10" fill="' + LEAF + '"/>';
    if (s.indexOf("shed") !== -1)
      return '<rect x="70" y="50" width="60" height="40" fill="#78502a"/><polygon points="64,50 100,28 136,50" fill="' + CLAY + '"/>';
    if (s.indexOf("duck") !== -1)
      return '<ellipse cx="96" cy="78" rx="20" ry="12" fill="' + SUN + '"/><circle cx="118" cy="72" r="8" fill="' + SUN + '"/>';
    if (s.indexOf("moth") !== -1)
      return '<ellipse cx="86" cy="70" rx="16" ry="10" fill="#cfc4a8"/><ellipse cx="114" cy="70" rx="16" ry="10" fill="#cfc4a8"/><ellipse cx="100" cy="72" rx="6" ry="10" fill="#1c1712"/>';
    if (s.indexOf("rose") !== -1)
      return '<rect x="96" y="70" width="8" height="28" fill="' + LEAF + '"/><circle cx="100" cy="64" r="14" fill="' + CLAY + '"/>';
    if (s.indexOf("mule") !== -1)
      return '<ellipse cx="96" cy="78" rx="24" ry="12" fill="#826448"/><rect x="118" y="58" width="10" height="24" fill="#826448"/>';
    if (s.indexOf("rain") !== -1)
      return '<rect x="70" y="30" width="4" height="28" fill="' + POND + '"/><rect x="90" y="24" width="4" height="34" fill="' + POND + '"/><rect x="110" y="28" width="4" height="30" fill="' + POND + '"/><rect x="130" y="22" width="4" height="36" fill="' + POND + '"/>';
    if (s.indexOf("bee") !== -1)
      return '<ellipse cx="100" cy="70" rx="18" ry="12" fill="' + SUN + '"/><rect x="96" y="60" width="6" height="20" fill="#1c1712"/>';
    if (s.indexOf("boat") !== -1 || s.indexOf("toad") !== -1)
      return '<polygon points="60,86 140,86 120,102 80,102" fill="' + SOIL + '"/><ellipse cx="70" cy="96" rx="40" ry="8" fill="' + POND + '"/>';
    if (s.indexOf("moon") !== -1 || s.indexOf("pool") !== -1)
      return '<circle cx="150" cy="32" r="16" fill="#ece6c8"/><ellipse cx="100" cy="92" rx="48" ry="12" fill="' + POND + '"/>';
    if (s.indexOf("cart") !== -1 || s.indexOf("barn") !== -1)
      return '<rect x="70" y="54" width="60" height="32" fill="#8a6239"/><circle cx="82" cy="90" r="8" fill="#1c1712"/><circle cx="118" cy="90" r="8" fill="#1c1712"/>';
    if (s.indexOf("corn") !== -1)
      return '<ellipse cx="100" cy="72" rx="10" ry="24" fill="' + SUN + '"/><polygon points="80,80 96,40 96,80" fill="' + LEAF + '"/>';
    if (s.indexOf("fern") !== -1)
      return '<polygon points="100,100 70,40 90,100" fill="' + LEAF + '"/><polygon points="100,100 130,36 110,100" fill="' + LEAF + '"/>';
    if (s.indexOf("bird") !== -1 || s.indexOf("herd") !== -1)
      return '<ellipse cx="80" cy="80" rx="18" ry="10" fill="#967850"/><ellipse cx="120" cy="84" rx="16" ry="9" fill="#826448"/>';
    if (s.indexOf("picnic") !== -1 || s.indexOf("basket") !== -1)
      return '<ellipse cx="100" cy="92" rx="40" ry="10" fill="' + CLAY + '"/><rect x="78" y="64" width="44" height="22" fill="#a07040"/>';
    if (s.indexOf("rabbit") !== -1 || s.indexOf("carrot") !== -1)
      return '<ellipse cx="96" cy="80" rx="14" ry="10" fill="#e6e0d4"/><ellipse cx="90" cy="58" rx="4" ry="14" fill="#e6e0d4"/><ellipse cx="130" cy="84" rx="5" ry="14" fill="#c46a2a"/>';
    if (s.indexOf("sunflower") !== -1)
      return '<circle cx="100" cy="54" r="22" fill="' + SUN + '"/><circle cx="100" cy="54" r="8" fill="' + SOIL + '"/><rect x="96" y="54" width="8" height="40" fill="' + LEAF + '"/>';
    if (s.indexOf("pumpkin") !== -1)
      return '<ellipse cx="100" cy="78" rx="24" ry="16" fill="#c46a2a"/><rect x="96" y="56" width="8" height="12" fill="' + LEAF + '"/>';
    if (s.indexOf("sam") !== -1 || s.indexOf("mat") !== -1)
      return '<rect x="60" y="86" width="80" height="10" fill="#8a6239"/><ellipse cx="100" cy="74" rx="16" ry="12" fill="#c49678"/>';
    if (s.indexOf("chop") !== -1)
      return '<rect x="60" y="70" width="80" height="16" fill="#c4b07a"/><rect x="70" y="62" width="18" height="10" fill="' + LEAF + '"/>';
    if (s.indexOf("gate") !== -1 || s.indexOf("trellis") !== -1)
      return '<rect x="70" y="40" width="8" height="60" fill="#8a6239"/><rect x="122" y="40" width="8" height="60" fill="#8a6239"/><rect x="70" y="52" width="60" height="6" fill="#8a6239"/>';
    if (s.indexOf("harvest") !== -1 || s.indexOf("rows") !== -1)
      return '<rect x="40" y="80" width="120" height="8" fill="' + SOIL + '"/><circle cx="70" cy="74" r="8" fill="' + LEAF + '"/><circle cx="110" cy="72" r="9" fill="' + CLAY + '"/><circle cx="148" cy="74" r="8" fill="' + SUN + '"/>';
    if (s.indexOf("wren") !== -1 || s.indexOf("gourd") !== -1)
      return '<ellipse cx="108" cy="70" rx="14" ry="20" fill="#c9a06a"/><ellipse cx="70" cy="64" rx="12" ry="8" fill="#5c364e"/>';
    if (s.indexOf("tomato") !== -1)
      return '<circle cx="100" cy="76" r="16" fill="' + CLAY + '"/><rect x="96" y="54" width="8" height="10" fill="' + LEAF + '"/>';
    if (s.indexOf("worm") !== -1 || s.indexOf("compost") !== -1)
      return '<rect x="50" y="70" width="100" height="24" fill="' + SOIL + '"/><path d="M70 78 q20 -16 40 0 q16 10 30 -4" fill="none" stroke="#c48a6a" stroke-width="4"/>';
    return '<circle cx="100" cy="70" r="16" fill="' + LEAF + '"/><rect x="96" y="70" width="8" height="26" fill="' + LEAF + '"/>';
  }

  function bookIdOf(slot) {
    return String(slot || "")
      .replace(/-cover$/, "")
      .replace(/-p\d+$/, "");
  }

  function pageOf(slot) {
    const m = String(slot || "").match(/-p(\d+)$/);
    return m ? Number(m[1]) : 0;
  }

  function frame(sky, ground, inner) {
    return (
      '<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="200" height="120" fill="' +
      sky +
      '"/>' +
      '<rect y="86" width="200" height="34" fill="' +
      ground +
      '"/>' +
      inner +
      "</svg>"
    );
  }

  const COVERS = {
    "sam-sat": '<rect x="40" y="90" width="120" height="12" fill="#8a6239"/><ellipse cx="100" cy="72" rx="18" ry="14" fill="#c49678"/><rect x="86" y="58" width="28" height="16" fill="#2c5a32"/>',
    "the-fig": '<ellipse cx="100" cy="70" rx="22" ry="30" fill="#5c364e"/><rect x="96" y="36" width="8" height="16" fill="#2c5a32"/>',
    "a-hot-pot": '<rect x="70" y="62" width="60" height="32" fill="#b04a32"/><rect x="62" y="54" width="76" height="12" fill="#8a4030"/><path d="M88 48 q12 -16 0 -8 M112 46 q10 -14 0 -6" fill="none" stroke="#f6f1e4" stroke-width="3"/>',
    "the-red-bug": '<ellipse cx="100" cy="78" rx="28" ry="14" fill="#b04a32"/><circle cx="124" cy="70" r="8" fill="#1c1712"/><rect x="70" y="70" width="6" height="14" fill="#1c1712"/>',
    "stan-stands": '<rect x="92" y="48" width="16" height="36" fill="#2c5a32"/><circle cx="100" cy="40" r="10" fill="#c49678"/><rect x="70" y="84" width="60" height="6" fill="#8a6239"/>',
    "the-plum-plot": '<circle cx="100" cy="64" r="22" fill="#78405e"/><rect x="96" y="40" width="8" height="14" fill="#2c5a32"/>',
    "grant-trots": '<ellipse cx="90" cy="74" rx="28" ry="12" fill="#826448"/><circle cx="122" cy="64" r="10" fill="#826448"/><rect x="70" y="86" width="70" height="4" fill="#5c3b22"/>',
    "the-pond": '<ellipse cx="100" cy="80" rx="60" ry="18" fill="#4a7a8a"/><ellipse cx="78" cy="66" rx="14" ry="8" fill="#6b8f4e"/>',
    "the-shed": '<rect x="64" y="52" width="72" height="40" fill="#78502a"/><polygon points="56,52 100,24 144,52" fill="#b04a32"/>',
    chop: '<rect x="40" y="78" width="90" height="14" fill="#6b8f4e"/><rect x="120" y="40" width="8" height="50" fill="#cfc4a8"/>',
    "the-duck": '<ellipse cx="90" cy="78" rx="28" ry="14" fill="#e6b33a"/><circle cx="120" cy="68" r="10" fill="#e6b33a"/><polygon points="128,66 146,72 128,76" fill="#e08a6a"/>',
    "the-moth": '<ellipse cx="78" cy="70" rx="22" ry="14" fill="#cfc4a8"/><ellipse cx="122" cy="70" rx="22" ry="14" fill="#e6e0d4"/><ellipse cx="100" cy="74" rx="6" ry="12" fill="#1c1712"/>',
    "the-cake": '<rect x="60" y="60" width="80" height="28" fill="#f3eee0"/><rect x="60" y="52" width="80" height="10" fill="#e08a6a"/><rect x="96" y="36" width="8" height="16" fill="#e6b33a"/>',
    "the-vine": '<path d="M40 100 Q70 40 110 70 Q140 90 160 40" fill="none" stroke="#2c5a32" stroke-width="6"/><circle cx="150" cy="42" r="8" fill="#6b8f4e"/>',
    "the-rose": '<circle cx="100" cy="64" r="16" fill="#b04a32"/><circle cx="100" cy="64" r="7" fill="#e08a6a"/><rect x="96" y="78" width="8" height="22" fill="#2c5a32"/>',
    "the-mule": '<ellipse cx="88" cy="76" rx="30" ry="14" fill="#826448"/><rect x="112" y="48" width="12" height="30" fill="#6a5038"/><rect x="108" y="46" width="22" height="6" fill="#6a5038"/>',
    "the-rain": '<rect x="40" y="24" width="4" height="40" fill="#4a7a8a"/><rect x="70" y="18" width="4" height="48" fill="#4a7a8a"/><rect x="100" y="22" width="4" height="44" fill="#4a7a8a"/><rect x="130" y="16" width="4" height="50" fill="#4a7a8a"/><rect x="150" y="28" width="4" height="36" fill="#4a7a8a"/>',
    "the-bee": '<ellipse cx="100" cy="70" rx="26" ry="16" fill="#e6b33a"/><rect x="88" y="56" width="8" height="28" fill="#1c1712"/><rect x="104" y="56" width="8" height="28" fill="#1c1712"/><ellipse cx="128" cy="52" rx="14" ry="8" fill="#f6f1e4"/>',
    "the-boat": '<polygon points="50,78 150,78 130,98 70,98" fill="#8a6239"/><ellipse cx="100" cy="100" rx="70" ry="10" fill="#4a7a8a"/>',
    "the-moon-pool": '<circle cx="150" cy="28" r="16" fill="#ece6c8"/><ellipse cx="90" cy="90" rx="50" ry="14" fill="#4a7a8a"/>',
    "the-cart": '<rect x="60" y="58" width="80" height="28" fill="#8a6239"/><circle cx="78" cy="92" r="10" fill="#1c1712"/><circle cx="122" cy="92" r="10" fill="#1c1712"/>',
    "the-corn": '<ellipse cx="100" cy="70" rx="12" ry="28" fill="#e6b33a"/><polygon points="70,90 96,30 100,90" fill="#2c5a32"/><polygon points="130,90 104,34 100,90" fill="#3f7a45"/>',
    "the-fern": '<polygon points="100,100 60,30 88,100" fill="#2c5a32"/><polygon points="100,100 140,24 112,100" fill="#3f7a45"/><polygon points="100,100 100,20 108,100" fill="#6b8f4e"/>',
    "the-herd": '<ellipse cx="60" cy="78" rx="18" ry="10" fill="#967850"/><ellipse cx="100" cy="74" rx="20" ry="12" fill="#826448"/><ellipse cx="140" cy="80" rx="16" ry="9" fill="#c4a574"/>',
    "the-picnic": '<ellipse cx="100" cy="96" rx="50" ry="10" fill="#b04a32"/><rect x="78" y="64" width="44" height="24" fill="#a07040"/><circle cx="60" cy="70" r="8" fill="#e08a6a"/>',
    "the-rabbit": '<ellipse cx="90" cy="78" rx="18" ry="12" fill="#e6e0d4"/><ellipse cx="82" cy="52" rx="5" ry="16" fill="#e6e0d4"/><ellipse cx="98" cy="50" rx="5" ry="16" fill="#f6f1e4"/>',
    "the-sunflower": '<circle cx="100" cy="48" r="22" fill="#e6b33a"/><circle cx="100" cy="48" r="8" fill="#5c3b22"/><rect x="96" y="68" width="8" height="28" fill="#2c5a32"/>',
    "the-pumpkin": '<ellipse cx="100" cy="78" rx="30" ry="18" fill="#c46a2a"/><rect x="96" y="52" width="8" height="14" fill="#2c5a32"/>',
    "sun-on-the-rows": '<circle cx="150" cy="28" r="16" fill="#e6b33a"/><rect x="30" y="78" width="140" height="6" fill="#5c3b22"/><rect x="30" y="92" width="140" height="6" fill="#3f7a45"/>',
    "harvest-day": '<rect x="48" y="60" width="90" height="26" fill="#8a6239"/><circle cx="66" cy="92" r="8" fill="#1c1712"/><circle cx="120" cy="92" r="8" fill="#1c1712"/><circle cx="150" cy="70" r="12" fill="#c46a2a"/>',
    "the-garden-gate": '<rect x="60" y="36" width="8" height="64" fill="#8a6239"/><rect x="132" y="36" width="8" height="64" fill="#8a6239"/><rect x="60" y="48" width="80" height="6" fill="#8a6239"/><rect x="60" y="68" width="80" height="6" fill="#8a6239"/>',
    "under-the-trellis": '<rect x="40" y="30" width="8" height="70" fill="#8a6239"/><rect x="152" y="30" width="8" height="70" fill="#8a6239"/><rect x="40" y="30" width="120" height="8" fill="#6b8f4e"/><circle cx="70" cy="48" r="8" fill="#5c364e"/><circle cx="100" cy="44" r="8" fill="#78405e"/><circle cx="130" cy="50" r="8" fill="#5c364e"/>',
  };

  function volumeInner(id, page) {
    const rows = {
      1: '<circle cx="36" cy="78" r="18" fill="#e6b33a"/><rect x="24" y="70" width="150" height="5" fill="#3f7a45"/><rect x="24" y="82" width="150" height="5" fill="#2c5a32"/>',
      2: '<rect x="30" y="78" width="90" height="8" fill="#c4b07a"/><rect x="130" y="62" width="22" height="24" fill="#8aa4b0"/><circle cx="70" cy="62" r="10" fill="#c49678"/>',
      3: '<rect x="40" y="40" width="6" height="48" fill="#2c5a32"/><rect x="80" y="28" width="6" height="60" fill="#3f7a45"/><rect x="120" y="36" width="6" height="52" fill="#2c5a32"/><ellipse cx="43" cy="36" rx="10" ry="6" fill="#6b8f4e"/>',
      4: '<rect x="48" y="70" width="70" height="22" fill="#5c3b22"/><path d="M130 88 q16 -20 8 -4" fill="none" stroke="#6b8f4e" stroke-width="4"/>',
      5: '<ellipse cx="100" cy="64" rx="22" ry="14" fill="#e6b33a"/><rect x="90" y="52" width="6" height="24" fill="#1c1712"/><ellipse cx="126" cy="50" rx="12" ry="7" fill="#f6f1e4"/>',
      6: '<circle cx="150" cy="22" r="14" fill="#e6b33a"/><ellipse cx="50" cy="96" rx="16" ry="6" fill="#c49678"/><ellipse cx="90" cy="98" rx="16" ry="6" fill="#c49678"/>',
      7: '<rect x="70" y="48" width="40" height="40" fill="#6a5038"/><ellipse cx="90" cy="48" rx="20" ry="6" fill="#8a6239"/><rect x="120" y="70" width="16" height="16" fill="#8aa4b0"/>',
      8: '<path d="M20 96 H180" fill="none" stroke="#4a7a8a" stroke-width="8"/><rect x="40" y="60" width="14" height="20" fill="#8aa4b0"/>',
      9: '<rect x="40" y="50" width="6" height="40" fill="#8a6239"/><rect x="150" y="50" width="6" height="40" fill="#8a6239"/><path d="M30 50 H170" stroke="#8a6239" stroke-width="4"/><ellipse cx="70" cy="44" rx="10" ry="6" fill="#5c364e"/><ellipse cx="120" cy="42" rx="10" ry="6" fill="#826448"/>',
      10: '<circle cx="100" cy="28" r="16" fill="#e6b33a"/><rect x="24" y="72" width="152" height="5" fill="#e6b33a"/><rect x="24" y="84" width="152" height="5" fill="#6b8f4e"/>',
    };
    const harvest = {
      1: '<circle cx="30" cy="30" r="12" fill="#f0e2b0"/><rect x="50" y="64" width="80" height="22" fill="#8a6239"/><circle cx="66" cy="92" r="7" fill="#1c1712"/>',
      2: '<rect x="70" y="58" width="50" height="28" fill="#a07040"/><ellipse cx="84" cy="70" rx="6" ry="10" fill="#3f7a45"/><ellipse cx="100" cy="68" rx="6" ry="10" fill="#2c5a32"/>',
      3: '<ellipse cx="100" cy="74" rx="28" ry="16" fill="#c46a2a"/><path d="M70 90 Q100 40 130 88" fill="none" stroke="#2c5a32" stroke-width="4"/>',
      4: '<ellipse cx="70" cy="60" rx="8" ry="22" fill="#e6b33a"/><ellipse cx="100" cy="56" rx="8" ry="24" fill="#e6b33a"/><ellipse cx="130" cy="62" rx="8" ry="20" fill="#d4a017"/>',
      5: '<rect x="36" y="40" width="8" height="50" fill="#8a6239"/><rect x="36" y="50" width="28" height="6" fill="#8a6239"/><circle cx="120" cy="70" r="10" fill="#c49678"/><rect x="100" y="80" width="40" height="16" fill="#6b8f4e"/>',
      6: '<ellipse cx="70" cy="70" rx="10" ry="10" fill="#5c364e"/><ellipse cx="96" cy="74" rx="10" ry="10" fill="#78405e"/><rect x="112" y="64" width="36" height="16" fill="#e6d2a0"/>',
      7: '<circle cx="160" cy="70" r="14" fill="#e08a6a"/><rect x="40" y="60" width="90" height="24" fill="#8a6239"/>',
      8: '<rect x="40" y="40" width="120" height="8" fill="#8a6239"/><rect x="40" y="60" width="120" height="8" fill="#8a6239"/><rect x="40" y="80" width="120" height="8" fill="#8a6239"/><circle cx="70" cy="56" r="5" fill="#c46a2a"/>',
      9: '<circle cx="100" cy="24" r="12" fill="#e6b33a"/><rect x="30" y="70" width="140" height="8" fill="#5c3b22"/>',
      10: '<rect x="50" y="36" width="100" height="50" fill="#6a5038"/><rect x="60" y="46" width="80" height="8" fill="#e6d2a0"/><rect x="60" y="62" width="80" height="8" fill="#6b8f4e"/>',
    };
    const gate = {
      1: '<rect x="70" y="30" width="10" height="60" fill="#6a5038"/><rect x="120" y="30" width="10" height="60" fill="#6a5038"/><rect x="70" y="46" width="60" height="6" fill="#8a6239"/>',
      2: '<rect x="90" y="50" width="20" height="28" fill="#e6b33a"/><circle cx="100" cy="46" r="6" fill="#5c3b22"/>',
      3: '<path d="M30 90 Q60 40 90 80" fill="none" stroke="#6b8f4e" stroke-width="4"/><circle cx="88" cy="70" r="5" fill="#e08a6a"/>',
      4: '<rect x="40" y="30" width="6" height="60" fill="#8a6239"/><rect x="70" y="30" width="6" height="60" fill="#8a6239"/><rect x="100" y="30" width="6" height="60" fill="#8a6239"/><path d="M36 50 H130" stroke="#2c5a32" stroke-width="3"/>',
      5: '<rect x="20" y="40" width="160" height="30" fill="#3f7a45" opacity="0.85"/>',
      6: '<circle cx="70" cy="78" r="10" fill="#c49678"/><circle cx="120" cy="80" r="10" fill="#e6d2a0"/><path d="M40 50 Q100 20 160 50" fill="none" stroke="#2c5a32" stroke-width="6"/>',
      7: '<ellipse cx="130" cy="48" rx="14" ry="18" fill="#c9a06a"/><ellipse cx="70" cy="60" rx="12" ry="8" fill="#5c364e"/>',
      8: '<rect x="78" y="36" width="8" height="54" fill="#8a6239"/><rect x="114" y="36" width="8" height="54" fill="#8a6239"/><rect x="78" y="50" width="44" height="5" fill="#8a6239" transform="rotate(8 100 52)"/>',
      9: '<circle cx="70" cy="60" r="5" fill="#c4b07a"/><circle cx="90" cy="66" r="5" fill="#c4b07a"/><circle cx="110" cy="58" r="5" fill="#a07040"/><circle cx="130" cy="68" r="5" fill="#c4b07a"/>',
      10: '<rect x="64" y="34" width="8" height="56" fill="#8a6239"/><rect x="128" y="34" width="8" height="56" fill="#8a6239"/><rect x="30" y="96" width="140" height="6" fill="#c4b07a"/>',
    };
    const trellis = {
      1: '<rect x="36" y="28" width="6" height="60" fill="#8a6239"/><rect x="158" y="28" width="6" height="60" fill="#8a6239"/><rect x="36" y="28" width="128" height="6" fill="#5c3b22"/><circle cx="70" cy="46" r="7" fill="#5c364e"/><circle cx="110" cy="40" r="7" fill="#78405e"/>',
      2: '<rect x="30" y="24" width="140" height="16" fill="#2c5a32"/><rect x="40" y="70" width="30" height="16" fill="#c49678"/>',
      3: '<rect x="80" y="60" width="36" height="22" fill="#f6f1e4"/><rect x="88" y="52" width="20" height="10" fill="#b04a32"/>',
      4: '<path d="M100 40 v30" stroke="#4a7a8a" stroke-width="4"/><ellipse cx="100" cy="88" rx="40" ry="8" fill="#5c3b22"/>',
      5: '<circle cx="60" cy="50" r="4" fill="#e6b33a"/><circle cx="90" cy="42" r="4" fill="#f6f1e4"/><circle cx="120" cy="52" r="4" fill="#e6b33a"/><ellipse cx="100" cy="70" rx="16" ry="10" fill="#e6b33a"/>',
      6: '<circle cx="70" cy="60" r="10" fill="#5c364e"/><circle cx="100" cy="52" r="12" fill="#3a2030"/><circle cx="130" cy="62" r="10" fill="#78405e"/>',
      7: '<rect x="60" y="70" width="40" height="16" fill="#a07040"/><circle cx="78" cy="66" r="6" fill="#5c364e"/>',
      8: '<rect x="30" y="20" width="4" height="30" fill="#4a7a8a"/><rect x="50" y="16" width="4" height="36" fill="#4a7a8a"/><rect x="90" y="48" width="36" height="28" fill="#6a5038"/>',
      9: '<rect x="40" y="30" width="6" height="56" fill="#8a6239"/><rect x="80" y="30" width="6" height="56" fill="#8a6239"/><rect x="120" y="30" width="6" height="56" fill="#8a6239"/><rect x="160" y="30" width="6" height="56" fill="#8a6239"/>',
      10: '<path d="M40 90 Q70 30 100 80 Q130 40 160 88" fill="none" stroke="#3f7a45" stroke-width="5"/><circle cx="150" cy="26" r="10" fill="#e6b33a"/>',
    };
    const sets = {
      "sun-on-the-rows": rows,
      "harvest-day": harvest,
      "the-garden-gate": gate,
      "under-the-trellis": trellis,
    };
    const set = sets[id];
    if (!set) return "";
    return set[page] || set[1];
  }

  function scene(slot, cls, alt) {
    const id = bookIdOf(slot);
    const page = pageOf(slot);
    let svg = "";
    if (COVERS[id] && !page) {
      svg = frame(page ? SKY : "#d7e4cf", SOIL, COVERS[id]);
    } else if (volumeInner(id, page || 1) && (page || COVERS[id])) {
      const skies = ["#9eb8c9", "#c4d6ba", "#d9e2c4", "#e7d7a8", "#f3e7c2", "#c9d8b8", "#b7d0d4", "#9fbea0", "#d5e0c8", "#f0e2b0"];
      svg = frame(skies[(page || 1) - 1] || SKY, SOIL, volumeInner(id, page || 1));
    }
    if (!svg) {
      svg =
        '<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' +
        '<rect width="200" height="120" fill="' +
        SKY +
        '"/>' +
        '<circle cx="168" cy="24" r="14" fill="' +
        SUN +
        '"/>' +
        '<rect y="88" width="200" height="32" fill="' +
        SOIL +
        '"/>' +
        '<rect y="82" width="200" height="8" fill="#6b8f4e"/>' +
        motif(slot) +
        "</svg>";
    }
    return wrap(svg, cls || "book-art", alt || "Garden page");
  }

  function forSlot(slot, cls, alt) {
    const s = String(slot || "");
    if (s === "hero") return hero(cls, alt);
    if (s === "bee") return bee(cls, alt);
    if (s.indexOf("flower-") === 0) return flower(s.slice(7), cls, alt);
    if (s.indexOf("bed-") === 0) return bed(cls, alt);
    if (s.indexOf("icon") === 0) return flower("s", cls, alt);
    return scene(s, cls, alt);
  }

  global.GardenArt = { flower: flower, bee: bee, hero: hero, bed: bed, scene: scene, forSlot: forSlot };
})(window);

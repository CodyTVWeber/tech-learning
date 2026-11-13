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

  function flower(g, cls, alt) {
    const fill = FLOWERS[g] || "#7a9e6e";
    const svg =
      '<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect y="78" width="100" height="42" fill="' +
      SOIL +
      '"/>' +
      '<rect x="46" y="44" width="8" height="42" fill="' +
      LEAF +
      '"/>' +
      '<circle cx="32" cy="40" r="14" fill="' +
      fill +
      '"/>' +
      '<circle cx="68" cy="40" r="14" fill="' +
      fill +
      '"/>' +
      '<circle cx="50" cy="24" r="14" fill="' +
      fill +
      '"/>' +
      '<circle cx="50" cy="44" r="16" fill="' +
      fill +
      '"/>' +
      '<circle cx="50" cy="40" r="8" fill="' +
      SUN +
      '"/>' +
      "</svg>";
    return wrap(svg, cls || "garden-flower-art", alt || "A garden bloom");
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

  function scene(slot, cls, alt) {
    const svg =
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

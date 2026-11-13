/* Single-line percussion staff. One measure per page while playing. */
(function (global) {
  "use strict";

  const VW = 400;
  const VH = 158;
  const STAFF_Y = 74;
  const LEFT = 108;
  const RIGHT = 384;

  function xForBeat(beatInPage) {
    const b = Math.max(0, Math.min(4, beatInPage));
    return LEFT + (b / 4) * (RIGHT - LEFT);
  }

  function esc(text) {
    return String(text).replace(/[&<>]/g, function (c) {
      return c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;";
    });
  }

  function headFill(note, hollow) {
    if (note.judge === "Perfect") return "#1f6a45";
    if (note.judge === "Good") return "#d4783a";
    if (hollow) return "#f3ead7";
    return "#1c1915";
  }

  function drawHead(x, y, note, scale) {
    const rx = 10 * scale;
    const ry = 7.5 * scale;
    const hollow = note.beats >= 2 && note.judge !== "Perfect" && note.judge !== "Good";
    const fill = headFill(note, hollow);
    const stroke = hollow ? "#1c1915" : fill;
    const lit = note.judge === "Perfect" || note.judge === "Good";
    const ring = lit
      ? '<circle cx="' + x + '" cy="' + y + '" r="' + (16 * scale) + '" fill="none" stroke="' + fill + '" stroke-width="' + (2 * scale) + '"/>'
      : "";
    return ring +
      '<ellipse class="head" data-i="' + note.i + '" cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry +
      '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (hollow ? 2 * scale : 0) +
      '" transform="rotate(-28 ' + x + " " + y + ')"/>';
  }

  function stemX(x, scale) {
    return x + 8 * scale;
  }

  function stemTop(y, scale) {
    return y - 36 * scale;
  }

  function drawStem(x, y, scale) {
    const sx = stemX(x, scale);
    const top = stemTop(y, scale);
    return '<line x1="' + sx + '" y1="' + y + '" x2="' + sx + '" y2="' + top + '" stroke="#1c1915" stroke-width="' + (2 * scale) + '"/>';
  }

  function drawFlag(x, y, scale) {
    const sx = stemX(x, scale);
    const top = stemTop(y, scale);
    return '<path d="M' + sx + " " + top +
      " C " + (sx + 14 * scale) + " " + (top + 8 * scale) +
      ", " + (sx + 16 * scale) + " " + (top + 20 * scale) +
      ", " + (sx + 2 * scale) + " " + (top + 26 * scale) +
      '" fill="none" stroke="#1c1915" stroke-width="' + (2 * scale) + '"/>';
  }

  function drawMarker(x, y, note, scale, place) {
    const word = note.judge || "";
    const fill = word === "Perfect" ? "#1f6a45" : word === "Good" ? "#8a4e12" : word === "Miss" ? "#7a3030" : "transparent";
    const dy = (place === "above" ? -46 : 34) * scale;
    return '<text class="marker" data-i="' + note.i + '" x="' + x + '" y="' + (y + dy) +
      '" text-anchor="middle" font-size="' + (11 * scale) +
      '" font-family="Arial Narrow, Liberation Sans Narrow, sans-serif" font-weight="700" fill="' + fill + '">' +
      esc(word) + "</text>";
  }

  function drawRest(x, y, scale) {
    const s = scale * 0.55;
    function P(tx, ty) {
      return (x + (tx - 56) * s).toFixed(1) + " " + (y + (ty - 75) * s).toFixed(1);
    }
    const d = "M" + P(64, 22) +
      "C" + P(52, 20) + " " + P(44, 30) + " " + P(54, 36) +
      "C" + P(64, 42) + " " + P(72, 46) + " " + P(62, 56) +
      "L" + P(46, 74) +
      "C" + P(40, 82) + " " + P(48, 90) + " " + P(58, 86) +
      "C" + P(70, 82) + " " + P(66, 98) + " " + P(52, 104) +
      "C" + P(42, 108) + " " + P(40, 100) + " " + P(48, 96);
    return '<path d="' + d + '" fill="none" stroke="#1c1915" stroke-width="' + (5.5 * s).toFixed(2) +
      '" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  function clefAndTime(y) {
    return '<rect x="16" y="' + (y - 26) + '" width="7" height="52" fill="#1c1915"/>' +
      '<rect x="28" y="' + (y - 26) + '" width="7" height="52" fill="#1c1915"/>' +
      '<text x="46" y="' + (y - 6) + '" font-size="22" font-family="Georgia, serif" fill="#1c1915">4</text>' +
      '<text x="46" y="' + (y + 18) + '" font-size="22" font-family="Georgia, serif" fill="#1c1915">4</text>';
  }

  function drawNotes(notes, xOf, yOf, scale, showWords) {
    let html = "";
    let i = 0;
    while (i < notes.length) {
      const note = notes[i];
      if (!note.rest && note.beats === 0.5) {
        const run = [note];
        let j = i + 1;
        while (j < notes.length && !notes[j].rest && notes[j].beats === 0.5 &&
          Math.floor(notes[j].onset + 1e-6) === Math.floor(note.onset + 1e-6)) {
          run.push(notes[j]);
          j += 1;
        }
        if (run.length >= 2) {
          const first = run[0];
          const last = run[run.length - 1];
          const y1 = yOf(first);
          const y2 = yOf(last);
          html += '<line x1="' + stemX(xOf(first), scale) + '" y1="' + stemTop(y1, scale) +
            '" x2="' + stemX(xOf(last), scale) + '" y2="' + stemTop(y2, scale) +
            '" stroke="#1c1915" stroke-width="' + (4 * scale) + '" stroke-linecap="butt"/>';
          run.forEach(function (n, idx) {
            const x = xOf(n);
            const y = yOf(n);
            html += drawHead(x, y, n, scale) + drawStem(x, y, scale) +
              (showWords ? drawMarker(x, y, n, scale, idx % 2 === 1 ? "below" : "above") : "");
          });
        } else {
          const x = xOf(note);
          const y = yOf(note);
          html += drawHead(x, y, note, scale) + drawStem(x, y, scale) + drawFlag(x, y, scale) +
            (showWords ? drawMarker(x, y, note, scale, "below") : "");
        }
        i = j;
      } else {
        const x = xOf(note);
        const y = yOf(note);
        if (note.rest) html += drawRest(x, y, scale);
        else {
          html += drawHead(x, y, note, scale) + drawStem(x, y, scale);
          if (showWords) html += drawMarker(x, y, note, scale, "below");
        }
        i += 1;
      }
    }
    return html;
  }

  function pageSVG(pageNotes, playheadBeat, turn) {
    const x = xForBeat(playheadBeat);
    const body = clefAndTime(STAFF_Y) +
      '<line x1="12" y1="' + STAFF_Y + '" x2="392" y2="' + STAFF_Y + '" stroke="#1c1915" stroke-width="2"/>' +
      '<line x1="392" y1="' + (STAFF_Y - 28) + '" x2="392" y2="' + (STAFF_Y + 28) + '" stroke="#1c1915" stroke-width="2"/>' +
      drawNotes(pageNotes, function (n) {
        return xForBeat(n.onset - Math.floor(n.onset / 4) * 4);
      }, function () { return STAFF_Y; }, 1, true) +
      '<line id="playhead" x1="' + x + '" y1="28" x2="' + x + '" y2="132" stroke="#a33b24" stroke-width="3"/>';
    return '<svg id="staff" class="' + (turn ? "turn" : "") + '" viewBox="0 0 ' + VW + " " + VH +
      '" role="img" aria-label="Snare staff">' + body + "</svg>";
  }

  function summarySVG(notes, totalBeats) {
    const measures = Math.max(1, Math.ceil(totalBeats / 4));
    const cols = measures > 2 ? 2 : measures;
    const rows = Math.ceil(measures / cols);
    const cellW = 210;
    const cellH = 86;
    const vw = cols * cellW;
    const vh = rows * cellH;
    let body = "";
    for (let m = 0; m < measures; m++) {
      const col = m % cols;
      const row = Math.floor(m / cols);
      const x0 = col * cellW;
      const y = row * cellH + 40;
      body += '<line x1="' + (x0 + 8) + '" y1="' + y + '" x2="' + (x0 + cellW - 8) + '" y2="' + y + '" stroke="#1c1915" stroke-width="1.5"/>';
      body += '<line x1="' + (x0 + cellW - 8) + '" y1="' + (y - 18) + '" x2="' + (x0 + cellW - 8) + '" y2="' + (y + 18) + '" stroke="#1c1915" stroke-width="1.5"/>';
    }
    const onPage = notes.filter(function (n) { return true; });
    body += drawNotes(onPage, function (n) {
      const m = Math.floor(n.onset / 4);
      const col = m % cols;
      const beatIn = n.onset - m * 4;
      return col * cellW + 28 + (beatIn / 4) * (cellW - 44);
    }, function (n) {
      const m = Math.floor(n.onset / 4);
      const row = Math.floor(m / cols);
      return row * cellH + 40;
    }, 0.72, false);
    return '<svg id="staff" viewBox="0 0 ' + vw + " " + vh + '" role="img" aria-label="Notes you played">' + body + "</svg>";
  }

  global.DrumStaff = {
    xForBeat: xForBeat,
    pageSVG: pageSVG,
    summarySVG: summarySVG
  };
})(window);

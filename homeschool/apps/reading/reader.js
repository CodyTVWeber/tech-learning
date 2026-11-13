(function (global) {
  function muted() {
    if (global.HS && HS.muted) return HS.muted();
    try {
      return global.localStorage.getItem("hs.mute") === "1";
    } catch (e) {
      return false;
    }
  }

  function reduceMotion() {
    return global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function art(slot, cls, alt) {
    if (global.GardenArt && GardenArt.forSlot) return GardenArt.forSlot(slot, cls, alt);
    return "";
  }

  const GardenReader = {
    async open(opts) {
      const host = opts.host;
      const cue = opts.cue || function () {};
      const book = await (await fetch(opts.url)).json();
      let page = -1;
      let playing = false;
      let playTimer = 0;

      function stopPlay() {
        playing = false;
        if (playTimer) {
          clearTimeout(playTimer);
          playTimer = 0;
        }
        const synth = global.speechSynthesis;
        if (synth) synth.cancel();
      }

      function say(text, done) {
        const finishOnce = (function () {
          let doneOnce = false;
          return function () {
            if (doneOnce) return;
            doneOnce = true;
            if (done) done();
          };
        })();
        if (!text || muted()) {
          playTimer = setTimeout(finishOnce, reduceMotion() ? 80 : 220);
          return;
        }
        const synth = global.speechSynthesis;
        if (!synth) {
          if (opts.speak) opts.speak(text);
          playTimer = setTimeout(finishOnce, 500);
          return;
        }
        synth.cancel();
        const u = new SpeechSynthesisUtterance(String(text));
        u.rate = 0.88;
        u.pitch = 1;
        u.lang = "en-US";
        u.onend = finishOnce;
        u.onerror = finishOnce;
        const wait = reduceMotion() ? 280 : Math.min(1400, 420 + String(text).length * 70);
        playTimer = setTimeout(finishOnce, wait);
        synth.speak(u);
      }

      function picture(slot, cls) {
        return art(slot, cls, book.title);
      }

      function renderCover() {
        stopPlay();
        host.className = "book";
        host.innerHTML =
          '<div class="book-spread">' +
          picture(book.coverSlot, "book-art book-art-cover") +
          '<div class="book-cover-copy">' +
          "<h1>" +
          book.title +
          "</h1>" +
          "<p>Original garden story. Tap a word to hear it. The sun follows as the page is read.</p>" +
          "</div>" +
          '<div class="book-nav">' +
          '<button type="button" id="book-close">Garden</button>' +
          '<button type="button" id="book-open">Open</button>' +
          "</div>" +
          '<p class="garden-status">Untested, awaiting parent test.</p></div>';
        host.querySelector("#book-close").onclick = function () {
          stopPlay();
          if (opts.onClose) opts.onClose();
        };
        host.querySelector("#book-open").onclick = function () {
          page = 0;
          cue("page");
          render();
        };
        if (opts.speak) opts.speak(book.title);
      }

      function dots() {
        let html = '<div class="book-dots" aria-hidden="true">';
        for (let i = 0; i < book.pages.length; i++) {
          html += '<span class="book-dot' + (i === page ? " is-on" : "") + '"></span>';
        }
        return html + "</div>";
      }

      function render() {
        stopPlay();
        if (page < 0) {
          renderCover();
          return;
        }
        const p = book.pages[page];
        host.className = "book";
        host.innerHTML =
          '<div class="book-spread">' +
          picture(p.slot, "book-art") +
          '<p class="sr-only">' +
          book.title +
          ", page " +
          (page + 1) +
          " of " +
          book.pages.length +
          "</p>" +
          dots() +
          '<div class="book-words" id="book-words">' +
          p.words
            .map(function (w, idx) {
              return '<button type="button" data-i="' + idx + '">' + w.t + "</button>";
            })
            .join("") +
          "</div>" +
          '<div class="book-nav">' +
          '<button type="button" id="book-prev"' +
          (page === 0 ? " disabled" : "") +
          ">Back</button>" +
          '<button type="button" id="book-play">Read page</button>' +
          '<button type="button" id="book-next">' +
          (page === book.pages.length - 1 ? "Finish" : "Next") +
          "</button></div>" +
          '<p class="garden-status">Tap a word to hear it. Untested, awaiting parent test.</p></div>';

        const wordBtns = host.querySelectorAll("#book-words button");
        wordBtns.forEach(function (btn) {
          btn.onclick = function () {
            stopPlay();
            const i = Number(btn.getAttribute("data-i"));
            wordBtns.forEach(function (b) {
              b.classList.toggle("is-on", b === btn);
            });
            say(p.words[i].say);
            cue("page");
          };
        });
        host.querySelector("#book-prev").onclick = function () {
          if (page > 0) {
            page -= 1;
            render();
          }
        };
        host.querySelector("#book-next").onclick = function () {
          if (page < book.pages.length - 1) {
            page += 1;
            cue("bloom");
            render();
          } else if (opts.onDone) {
            stopPlay();
            opts.onDone();
          }
        };
        host.querySelector("#book-play").onclick = function () {
          if (playing) {
            stopPlay();
            host.querySelector("#book-play").textContent = "Read page";
            wordBtns.forEach(function (b) {
              b.classList.remove("is-on");
            });
            return;
          }
          playPage();
        };
      }

      function playPage() {
        if (playing) return;
        playing = true;
        const playBtn = host.querySelector("#book-play");
        if (playBtn) playBtn.textContent = "Stop";
        const p = book.pages[page];
        const buttons = host.querySelectorAll("#book-words button");
        let i = 0;
        function step() {
          if (!playing) return;
          if (i >= p.words.length) {
            playing = false;
            if (playBtn) playBtn.textContent = "Read page";
            buttons.forEach(function (b) {
              b.classList.remove("is-on");
            });
            return;
          }
          buttons.forEach(function (b, idx) {
            b.classList.toggle("is-on", idx === i);
          });
          const text = p.words[i].say;
          i += 1;
          say(text, function () {
            if (playing) step();
          });
        }
        cue("page");
        step();
      }

      renderCover();
    },
  };
  global.GardenReader = GardenReader;
})(window);

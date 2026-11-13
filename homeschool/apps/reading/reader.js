(function (global) {
  const GardenReader = {
    async open(opts) {
      const url = opts.url;
      const host = opts.host;
      const speak = opts.speak || function () {};
      const cue = opts.cue || function () {};
      const imgFor = opts.imgFor;
      const book = await (await fetch(url)).json();
      let page = 0;
      let playing = false;

      function render() {
        const p = book.pages[page];
        host.className = "book";
        host.innerHTML =
          '<div class="book-page">' +
          imgFor(p.slot, "slot") +
          "</div>" +
          '<p class="sr-only">' +
          book.title +
          ", page " +
          (page + 1) +
          "</p>" +
          '<div class="book-words" id="book-words">' +
          p.words
            .map(function (w, idx) {
              return (
                '<button type="button" data-i="' +
                idx +
                '">' +
                w.t +
                "</button>"
              );
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
          '<p class="garden-status">Tap a word to hear it. Untested, awaiting parent test.</p>';

        const words = host.querySelectorAll("#book-words button");
        words.forEach(function (btn) {
          btn.onclick = function () {
            const i = Number(btn.getAttribute("data-i"));
            words.forEach(function (b) {
              b.classList.toggle("is-on", b === btn);
            });
            speak(p.words[i].say);
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
          } else if (opts.onDone) opts.onDone();
        };
        host.querySelector("#book-play").onclick = function () {
          playPage();
        };
      }

      function playPage() {
        if (playing) return;
        playing = true;
        const p = book.pages[page];
        const buttons = host.querySelectorAll("#book-words button");
        let i = 0;
        function step() {
          if (i >= p.words.length) {
            playing = false;
            buttons.forEach(function (b) {
              b.classList.remove("is-on");
            });
            return;
          }
          buttons.forEach(function (b, idx) {
            b.classList.toggle("is-on", idx === i);
          });
          speak(p.words[i].say);
          i += 1;
          setTimeout(step, 700);
        }
        cue("page");
        step();
      }

      render();
    },
  };
  global.GardenReader = GardenReader;
})(window);

/* ═══ BIBLIOTECA + LECTOR DE LIBROS con animación de páginas (solo JS) ═══ */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var lib = $("#library-row");
  if (!lib) return;

  function esc(x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var baseBooks = [];
  (function () {
    var el = $("#books-data");
    if (!el) return;
    try { var d = JSON.parse(el.textContent); if (Array.isArray(d.books)) baseBooks = d.books; } catch (e) { baseBooks = []; }
  })();
  window.__baseBooks = baseBooks; // base para el admin
  var books = (window.__adminBooks && Array.isArray(window.__adminBooks())) ? window.__adminBooks() : baseBooks;

  // texto plano → párrafos (si la página no trae HTML propio)
  function fmtPage(h) {
    h = String(h == null ? "" : h);
    if (/<[a-z][\s\S]*>/i.test(h)) return h;
    return h.split(/\n{2,}/).map(function (p) { return "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>"; }).join("");
  }

  function renderLib() {
    if (!books.length) {
      lib.innerHTML = '<p class="muted small">no hay libros todavía · crea el primero en el admin → pestaña ▩ LIBROS</p>';
      return;
    }
    lib.innerHTML = books.map(function (b, i) {
      var bc = esc(b.color || "#1d4fb0");
      return '<button class="book-card" data-i="' + i + '" title="abrir: ' + esc(b.title) + '">' +
        '<span class="book-icon"><span class="bk-3d" style="--bc:' + bc + '"><span class="bk-front">' +
          '<span class="bk-title">' + esc(b.title || "sin título") + '</span>' +
          '<span class="bk-author">' + esc(b.author || "anónimo") + '</span>' +
        '</span></span></span>' +
        '<span class="bk-label">' + esc(b.title || "sin título").slice(0, 20) + '</span></button>';
    }).join("");
  }
  renderLib();
  window.__renderBooks = function () {
    books = (window.__adminBooks && Array.isArray(window.__adminBooks())) ? window.__adminBooks() : baseBooks;
    renderLib();
  };

  // ── lector modal ──
  var modal = $("#book-modal");
  var stage = $("#book-3d");
  var hint = $("#book-hint");
  var nSheets = 0, current = 0;

  function paperFace(html, num, isBack) {
    return '<div class="face paper' + (isBack ? " back" : "") + '"><div class="p-body">' + (html || "") + '</div>' +
      '<span class="p-num">' + (num || "") + '</span></div>';
  }
  function coverFace(b) {
    var img = b.cover ? '<img class="c-img" src="' + esc(b.cover) + '" alt="">' : "";
    var tag = b.tag ? '<span class="c-tag">' + esc(b.tag) + '</span>' : "";
    return '<div class="face cover" style="--bc:' + esc(b.color || "#1d4fb0") + '">' + img +
      '<div class="c-in">' + tag +
      '<span class="c-title">' + esc(b.title || "") + '</span>' +
      '<span class="c-author">' + esc(b.author || "") + '</span></div></div>';
  }
  function backCoverFace(b) {
    var blurb = b.blurb || "";
    return '<div class="face cover back" style="--bc:' + esc(b.color || "#1d4fb0") + '">' +
      '<div class="c-in bc-in">' +
      '<span class="bc-mark">✦</span>' +
      (blurb ? '<span class="bc-blurb">' + esc(blurb) + '</span>' : "") +
      '<span class="bc-title">' + esc(b.title || "") + '</span>' +
      '<span class="bc-author">' + esc(b.author || "") + '</span>' +
      '<span class="bc-foot">· biblioteca de keneth ·</span>' +
      '</div></div>';
  }
  function finFace() {
    return '<div class="face paper"><div class="p-body fin-page"><span class="fin-mark">✦</span>' +
      '<span class="fin-txt">fin</span></div></div>';
  }
  function pageStart(html, num) { return '<span class="p-tag">' + esc(num) + '</span>' + (html || ""); }

  function openBook(i) {
    var b = books[i] || { pages: [] };
    var pages = Array.isArray(b.pages) ? b.pages : [];
    var contentSheets = Math.ceil((pages.length + 1) / 2); // portada + páginas de a 2
    nSheets = contentSheets + 1; // + hoja final: guarda "fin" + forro trasero
    current = 0;
    var html = '<div class="book-base"><div class="bb-in"><strong>' + esc(b.title || "") + '</strong>' +
      '<span>' + esc(b.author || "") + ' · biblioteca de keneth</span></div></div>';
    for (var k = 0; k < nSheets; k++) {
      var front, back;
      if (k === nSheets - 1) { front = finFace(); back = backCoverFace(b); }
      else if (k === 0) { front = coverFace(b); back = paperFace(fmtPage(pages[0]), "1", true); }
      else {
        front = paperFace(pageStart(fmtPage(pages[2 * k - 1]), 2 * k), 2 * k, false);
        back = paperFace(pageStart(fmtPage(pages[2 * k]), 2 * k + 1), 2 * k + 1, true);
      }
      html += '<div class="sheet" style="z-index:' + ((nSheets - k) * 10) + '">' + front + back + '</div>';
    }
    stage.innerHTML = html;
    document.title = b.title + " — keneth.txt";
    hint.textContent = "▸ clic mitad derecha = avanzar · mitad izquierda = retroceder · " + pages.length + " páginas + portada y contraportada";
    modal.classList.add("show");
  }
  function closeBook() {
    modal.classList.remove("show");
    document.title = "keneth.exe — blog personal";
  }
  function next() {
    if (current >= nSheets) return;
    var sh = stage.children[current + 1]; // +1: el primero es el base
    sh.classList.add("flipped");
    sh.style.zIndex = current; // en la pila izquierda, el último girado queda arriba
    current++;
    if (current >= nSheets) hint.textContent = "⃞ fin del libro · puedes cerrar o volver atrás";
  }
  function prev() {
    if (current <= 0) return;
    current--;
    var sh = stage.children[current + 1];
    sh.style.zIndex = (nSheets - current) * 10;
    sh.classList.remove("flipped");
    hint.textContent = "▸ clic mitad derecha = avanzar · mitad izquierda = retroceder";
  }

  lib.addEventListener("click", function (e) {
    var card = e.target.closest ? e.target.closest(".book-card") : null;
    if (card) openBook(parseInt(card.getAttribute("data-i"), 10));
  });
  stage.addEventListener("click", function (e) {
    var r = stage.getBoundingClientRect();
    if (e.clientX - r.left > r.width / 2) next(); else prev();
  });
  modal.addEventListener("click", function (e) { if (e.target === modal) closeBook(); });
  $("#book-close").addEventListener("click", closeBook);
  $("#book-prev").addEventListener("click", function (e) { e.stopPropagation(); prev(); });
  $("#book-next").addEventListener("click", function (e) { e.stopPropagation(); next(); });
  document.addEventListener("keydown", function (e) {
    if (!modal.classList.contains("show")) return;
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "Escape") closeBook();
  });
})();
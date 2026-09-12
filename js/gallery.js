/* ═══ GALERÍA — grid + lightbox (solo HTML+CSS+JS, fotos en localStorage) ═══ */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var LS_GAL = "kn_admin_gallery_v1";
  var grid = $("#gallery-grid"), count = $("#gallery-count"), empty = $("#gallery-empty");
  var lb = $("#lightbox"), lbImg = $("#lb-img"), lbCap = $("#lb-cap");

  function load() {
    try { var v = JSON.parse(localStorage.getItem(LS_GAL)); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function esc(x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function render() {
    var list = load();
    count.textContent = "· " + list.length;
    empty.hidden = list.length > 0;
    grid.innerHTML = list.map(function (it, i) {
      var cap = (it.title ? "<strong>" + esc(it.title) + "</strong>" : "") +
        (it.caption ? '<span class="g-cap">' + esc(it.caption) + "</span>" : "") +
        (it.d ? '<span class="g-date">' + esc(it.d) + "</span>" : "");
      return '<figure class="g-item" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(it.title || "foto") + '">' +
        '<span class="g-frame"><img src="' + it.img + '" alt="' + esc(it.title || "foto") + '" loading="lazy"></span>' +
        '<figcaption>' + cap + "</figcaption></figure>";
    }).join("");
    var items = grid.querySelectorAll(".g-item");
    for (var k = 0; k < items.length; k++) {
      items[k].addEventListener("click", (function (el) {
        return function () { openLb(parseInt(el.getAttribute("data-i"), 10)); };
      })(items[k]));
      items[k].addEventListener("keydown", (function (el) {
        return function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(parseInt(el.getAttribute("data-i"), 10)); } };
      })(items[k]));
    }
  }

  function openLb(i) {
    var it = load()[i];
    if (!it) return;
    lbImg.src = it.img;
    lbImg.alt = it.title || "foto";
    lbCap.textContent = (it.title ? it.title + " — " : "") + (it.caption || "") + (it.d ? "  ·  " + it.d : "");
    lb.classList.add("show");
  }
  function closeLb() { lb.classList.remove("show"); }

  $("#lb-close").addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });

  render();
  window.__renderGallery = render; // el admin llama esto al añadir/borrar
})();
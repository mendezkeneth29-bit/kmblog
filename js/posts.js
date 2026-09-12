/* Carga los posts (solo HTML+CSS+JS+JSON, sin servidor)
   1) Si la página se sirve por internet → lee data/posts.json (fetch)
   2) Si abres con doble clic (sin servidor) → usa el JSON incrustado en la página */
(function () {
  "use strict";
  var inline = null;
  (function () {
    var el = document.getElementById("posts-data");
    if (!el) return;
    try { var d = JSON.parse(el.textContent); inline = Array.isArray(d) ? d : null; } catch (e) { inline = null; }
  })();

  window.POSTS = window.POSTS || [];
  window.POSTS_READY = fetch("data/posts.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (data) { return Array.isArray(data) ? data : []; })
    .catch(function (err) {
      console.warn("[blog] sin servidor → usando JSON incrustado:", err);
      return inline || [];
    })
    .then(function (arr) {
      window.__basePosts = arr;
      window.POSTS = (window.__adminMerge && window.__adminMerge(arr)) || arr;
      return window.POSTS;
    });
})();


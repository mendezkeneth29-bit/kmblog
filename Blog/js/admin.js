/* ═══ MODO ADMIN SECRETO "MODEM" (solo HTML+CSS+JS+JSON) ═══
   Abrir: pulsa Ctrl+Shift+A (o doble clic en los puntos de la barra superior)
   Contraseña: 2026
   ( ! ) No es seguridad real: vive en el navegador, como un candado de juguete. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };

  // ── helpers de persistence ──
  var LS_POSTS = "kn_admin_posts_v1";
  var LS_SETTINGS = "kn_admin_settings_v1";
  var LS_GUEST = "guestbook-v1";

  var load = function (key, def) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? def : v; } catch (e) { return def; } };
  var save = function (key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { return false; } return true; };

  // fusión de posts editados con los del JSON (lo llama posts.js)
  window.__adminMerge = function (base) {
    var saved = load(LS_POSTS, null);
    return Array.isArray(saved) ? saved : base;
  };

  // ── settings (estilo rápido) ──
  window.__adminSettings = function () { return load(LS_SETTINGS, {}); };
  function applySettings(s) {
    var ss = Object.assign({ accent: "#5b9dff", showCounter: true, showMarquee: true, showCrt: true }, s || {});
    document.documentElement.style.setProperty("--accent", ss.accent);
    var box = $("#visitor-counter");
    if (box) box.closest(".box").style.display = ss.showCounter ? "" : "none";
    var mq = $(".marquee-wrap");
    if (mq) mq.style.display = ss.showMarquee ? "" : "none";
    var crtOn = ss.showCrt !== false;
    var sl = $(".scanlines"), vg = $(".crt-vignette");
    if (sl) sl.style.display = crtOn ? "" : "none";
    if (vg) vg.style.display = crtOn ? "" : "none";
    return ss;
  }
  applySettings(load(LS_SETTINGS, {}));

  // ── UI: login ──
  function esc(x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var root = document.createElement("div");
  root.id = "admin-modal";
  root.innerHTML =
    '<div class="admin-window">' +
      '<div class="admin-titlebar"><span>☰ ADMIN MODEM v1.0</span><span class="admin-close" title="cerrar">✕</span></div>' +
      '<div class="admin-body">' +
        '<div id="admin-login">' +
          '<p class="admin-boot">▸ conectando...<br>▸ MODEM_SECRET_01 online<br>▸ introduce la clave de acceso:</p>' +
          '<div class="admin-login-row">' +
            '<input type="password" id="admin-pass" placeholder="contraseña" autocomplete="off">' +
            '<button class="btn" id="admin-enter">ENTER</button>' +
          '</div>' +
          '<p id="admin-err" class="admin-err"></p>' +
        '</div>' +
        '<div id="admin-console" hidden>' +
          '<nav class="admin-tabs">' +
            '<button class="active" data-tab="posts">▤ POSTS</button>' +
            '<button data-tab="books">▩ LIBROS</button>' +
            '<button data-tab="gal">▦ GALERÍA</button>' +
            '<button data-tab="guest">✉ VISITAS</button>' +
            '<button data-tab="comments">✎ COMENTARIOS</button>' +
            '<button data-tab="settings">◍ AJUSTES</button>' +
          '</nav>' +
          '<div id="tab-posts" class="admin-tab">' +
            '<div class="admin-row">' +
              '<label>escoge post<br><select id="admin-post-select"></select></label>' +
              '<label><button class="btn small" id="admin-new">＋ nuevo</button></label>' +
            '</div>' +
            '<label>slug<br><input id="a-slug" class="a-in" placeholder="mi-post"></label>' +
            '<label>título<br><input id="a-title" class="a-in"></label>' +
            '<label>fecha (aaaa-mm-dd)<br><input id="a-date" class="a-in" placeholder="2026-09-11"></label>' +
            '<label>etiquetas (separadas por coma)<br><input id="a-tags" class="a-in" placeholder="diario, codigo"></label>' +
            '<label>resumen<br><input id="a-excerpt" class="a-in"></label>' +
            '<label>contenido (HTML)<br><textarea id="a-html" rows="7" class="a-in a-area"></textarea></label>' +
            '<div class="admin-btns">' +
              '<button class="btn small" id="a-save">▸ guardar cambios</button>' +
              '<button class="btn small" id="a-del">✕ eliminar</button>' +
              '<button class="btn small" id="a-reset">↺ restaurar originales</button>' +
            '</div>' +
          '</div>' +
          '<div id="tab-books" class="admin-tab" hidden>' +
            '<div class="admin-row">' +
              '<label>escoge libro<br><select id="admin-book-select"></select></label>' +
              '<label><button class="btn small" id="admin-book-new">＋ nuevo libro</button></label>' +
            '</div>' +
            '<label>título<br><input id="b-title" class="a-in"></label>' +
            '<label>autor<br><input id="b-author" class="a-in"></label>' +
            '<label>etiqueta / género<br><input id="b-tag" class="a-in" placeholder="FANTASÍA"></label>' +
            '<label>texto de la contraportada (opcional)<br><input id="b-blurb" class="a-in" placeholder="frase del forro trasero"></label>' +
            '<label>color de la cubierta<br><input type="color" id="b-color" value="#1d4fb0"></label>' +
            '<label>páginas (separa cada página con una línea que diga ---)<br><textarea id="b-pages" rows="9" class="a-in a-area"></textarea></label>' +
            '<div class="admin-btns">' +
              '<button class="btn small" id="b-save">▸ guardar libro</button>' +
              '<button class="btn small" id="b-del">✕ eliminar libro</button>' +
            '</div>' +
            '<p class="admin-warn">tip: cada página se separa con una línea con --- · puedes escribir texto normal o HTML</p>' +
          '</div>' +
          '<div id="tab-gal" class="admin-tab" hidden>' +
            '<label>foto (desde tu computadora)<br><input type="file" id="gal-file" accept="image/*" class="a-in"></label>' +
            '<label>título de la foto<br><input id="gal-title" class="a-in" placeholder="atardecer en el lago"></label>' +
            '<label>texto / descripción<br><input id="gal-caption" class="a-in" placeholder="qué se ve y por qué la subo"></label>' +
            '<div class="admin-btns"><button class="btn small" id="gal-add">▸ añadir a la galería</button></div>' +
            '<div id="admin-gal-list" class="admin-blob"></div>' +
            '<p class="admin-warn">las fotos se guardan en tu navegador · se redimensionan para no llenar la memoria (máx. 40)</p>' +
          '</div>' +
          '<div id="tab-comments" class="admin-tab" hidden>' +
            '<div id="admin-comments-list" class="admin-blob"></div>' +
            '<div class="admin-btns"><button class="btn small" id="cm-clear">⌫ vaciar todos los comentarios</button></div>' +
          '</div>' +
          '<div id="tab-guest" class="admin-tab" hidden>' +
            '<div id="admin-guest-list" class="admin-blob"></div>' +
            '<div class="admin-btns"><button class="btn small" id="g-clear">⌫ vaciar libro de visitas</button></div>' +
          '</div>' +
          '<div id="tab-settings" class="admin-tab" hidden>' +
            '<label>color acento<br><input type="color" id="a-accent" value="#5b9dff"></label>' +
            '<label><input type="checkbox" id="a-counter"> mostrar contador</label>' +
            '<label><input type="checkbox" id="a-marquee"> mostrar marquesina</label>' +
            '<label><input type="checkbox" id="a-crt"> efecto CRT (líneas, viñeta y flicker)</label>' +
            '<div class="admin-btns"><button class="btn small" id="a-settings-save">▸ guardar ajustes</button></div>' +
          '</div>' +
          '<p id="admin-status" class="admin-status">■ listo</p>' +
          '<p class="admin-warn">( ! ) candado de juguete: la clave está en el código. No pongas aquí datos privados.</p>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(root);

  var modal = $("#admin-modal");
  var pass = $("#admin-pass");
  var consoleBox = $("#admin-console");
  var statusEl = $("#admin-status");

  function open() { modal.classList.add("show"); setTimeout(function () { if (pass) pass.focus(); }, 50); }
  function close() { modal.classList.remove("show"); }
$("#admin-modal .admin-close").addEventListener("click", close);
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });

  function login() {
    if (pass.value === "2026") {
      $("#admin-login").hidden = true;
      consoleBox.hidden = false;
      loadPostsList();
      loadBooksList();
      loadGalList();
      loadCommentsList();
      loadGuestList();
      loadSettingsForm();
      status("■ acceso concedido · bienvenid@");
    } else {
      $("#admin-err").textContent = "✕ acceso denegado";
    }
  }
  $("#admin-enter").addEventListener("click", login);
  pass.addEventListener("keydown", function (e) { if (e.key === "Enter") login(); });

  function status(t) { if (statusEl) statusEl.textContent = "■ " + t; }

  // ── POSTS editor ──
  var postsCache = [];
  var sel = $("#admin-post-select");
  function currentList() { return window.__adminMerge(window.__basePosts || []); }
  function reloadPosts() {
    window.POSTS = currentList();
    if (window.__render) window.__render(window.POSTS);
  }
  function loadPostsList() {
    postsCache = currentList().slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    sel.innerHTML = postsCache.map(function (p) { return '<option value="' + esc(p.slug) + '">' + esc(p.date) + " — " + esc(p.title) + "</option>"; }).join("") || '<option value="">(sin posts)</option>';
    if (postsCache[0]) fillPost(postsCache[0]);
  }
  function fillPost(p) {
    $("#a-slug").value = p.slug || "";
    $("#a-title").value = p.title || "";
    $("#a-date").value = p.date || "";
    $("#a-tags").value = (p.tags || []).join(", ");
    $("#a-excerpt").value = p.excerpt || "";
    $("#a-html").value = p.html || "";
  }
  sel.addEventListener("change", function () {
    var p = postsCache.find(function (x) { return x.slug === sel.value; });
    if (p) fillPost(p);
  });
  $("#admin-new").addEventListener("click", function () {
    fillPost({ slug: "", title: "Post nuevo", date: new Date().toISOString().slice(0, 10), tags: [], excerpt: "", html: "<p>Escribe aquí...</p>" });
    sel.selectedIndex = -1;
  });
  function readForm() {
    return {
      slug: $("#a-slug").value.trim().replace(/\s+/g, "-").toLowerCase(),
      title: $("#a-title").value.trim(),
      date: $("#a-date").value.trim(),
      tags: $("#a-tags").value.split(",").map(function (t) { return t.trim(); }).filter(Boolean),
      excerpt: $("#a-excerpt").value.trim(),
      html: $("#a-html").value
    };
  }
  $("#a-save").addEventListener("click", function () {
    var f = readForm();
    if (!f.slug || !f.title) { status("✕ faltan slug o título"); return; }
    var list = currentList();
    var i = list.findIndex(function (p) { return p.slug === f.slug; });
    if (i >= 0) list[i] = f; else list.push(f);
    save(LS_POSTS, list);
    reloadPosts();
    loadPostsList();
    status("guardado · " + f.slug);
  });
  $("#a-del").addEventListener("click", function () {
    var f = readForm(); if (!f.slug) return;
    var list = currentList().filter(function (p) { return p.slug !== f.slug; });
    save(LS_POSTS, list);
    reloadPosts();
    loadPostsList();
    status("eliminado · " + f.slug);
  });
  $("#a-reset").addEventListener("click", function () {
    if (!confirm("¿Quitar tus ediciones y volver a los posts originales?")) return;
    localStorage.removeItem(LS_POSTS);
    reloadPosts();
    loadPostsList();
    status("↺ posts originales restaurados");
  });
// ── libro de visitas manager ──
  function readGuest() { return load(LS_GUEST, []); }
  function paintGuest() {
    var list = readGuest();
    var box = $("#admin-guest-list");
    box.innerHTML = list.length ? list.map(function (g, i) {
      return '<div class="admin-guest-item"><span><strong>' + esc(g.n) + '</strong> <em class="g-meta">' + esc(g.d) + "</em><br>" + esc(g.m) + '</span><button class="btn small" data-gi="' + i + '">✕</button></div>';
    }).join("") : "<p class='muted'>no hay firmas todavía</p>";
    var btns = box.querySelectorAll("[data-gi]");
    for (var k = 0; k < btns.length; k++) {
      btns[k].addEventListener("click", (function (btn) {
        return function () {
          var list2 = readGuest();
          list2.splice(parseInt(btn.getAttribute("data-gi"), 10), 1);
          save(LS_GUEST, list2);
          paintGuest();
          status("✕ firma borrada");
        };
      })(btns[k]));
    }
  }
  function loadGuestList() { paintGuest(); }
  $("#g-clear").addEventListener("click", function () {
    if (!confirm("¿Vaciar todo el libro de visitas?")) return;
    save(LS_GUEST, []);
    paintGuest();
    status("libro de visitas vaciado");
  });

  // ── LIBROS manager ──
  var LS_BOOKS = "kn_admin_books_v1";
  window.__adminBooks = function () { return load(LS_BOOKS, null); };
  var booksCache = [];
  var bsel = $("#admin-book-select");
  function currentBooks() {
    var saved = load(LS_BOOKS, null);
    if (Array.isArray(saved)) return saved;
    return (window.__baseBooks || []);
  }
  function readBookForm() {
    return {
      title: $("#b-title").value.trim(),
      author: $("#b-author").value.trim(),
      tag: $("#b-tag").value.trim().toUpperCase(),
      blurb: $("#b-blurb").value.trim(),
      color: $("#b-color").value,
      pages: $("#b-pages").value.split(/^\s*-{3,}\s*$/m).map(function (s) { return s.trim(); }).filter(Boolean)
    };
  }
  function fillBook(b, idx) {
    $("#b-title").value = b.title || "";
    $("#b-author").value = b.author || "";
    $("#b-tag").value = b.tag || "";
    $("#b-blurb").value = b.blurb || "";
    $("#b-color").value = b.color || "#1d4fb0";
    $("#b-pages").value = (b.pages || []).join("\n---\n");
    bsel.value = (idx == null) ? "" : String(idx);
  }
  function loadBooksList(keep) {
    booksCache = currentBooks().slice();
    bsel.innerHTML = booksCache.map(function (b, i) {
      return '<option value="' + i + '">' + esc(b.title || "sin título") + "</option>";
    }).join("") || '<option value="">(sin libros)</option>';
    if (keep != null && booksCache[keep]) fillBook(booksCache[keep], keep);
    else if (booksCache[0]) fillBook(booksCache[0], 0);
    else fillBook({}, null);
  }
  bsel.addEventListener("change", function () {
    var i = parseInt(bsel.value, 10);
    if (booksCache[i]) fillBook(booksCache[i], i);
  });
  $("#admin-book-new").addEventListener("click", function () {
    fillBook({ title: "", author: "", tag: "", color: "#1d4fb0", pages: ["Escribe aquí la primera página de tu libro..."] }, null);
    $("#b-title").focus();
    status("nuevo libro · ponle título, color y páginas y guarda");
  });
  $("#b-save").addEventListener("click", function () {
    var f = readBookForm();
    if (!f.title) { status("✕ el libro necesita título"); return; }
    var list = currentBooks();
    var i = (bsel.value === "") ? -1 : parseInt(bsel.value, 10);
    var at;
    if (i >= 0 && list[i]) { list[i] = f; at = i; } else { list.push(f); at = list.length - 1; }
    save(LS_BOOKS, list);
    if (window.__renderBooks) window.__renderBooks();
    loadBooksList(at);
    status("libro guardado · " + f.title);
  });
  $("#b-del").addEventListener("click", function () {
    var i = (bsel.value === "") ? -1 : parseInt(bsel.value, 10);
    var list = currentBooks();
    if (i < 0 || !list[i]) { status("✕ escoge un libro de la lista"); return; }
    if (!confirm('¿Eliminar el libro "' + (list[i].title || "") + '"?')) return;
    list.splice(i, 1);
    save(LS_BOOKS, list);
    if (window.__renderBooks) window.__renderBooks();
    loadBooksList();
    status("libro eliminado");
  });

  // ── GALERÍA manager (fotos en localStorage, redimensionadas) ──
  var LS_GAL = "kn_admin_gallery_v1";
  var galFileData = null;
  function currentGal() { return load(LS_GAL, []); }
  function paintGal() {
    var list = currentGal();
    var box = $("#admin-gal-list");
    box.innerHTML = list.length ? list.map(function (it, i) {
      return '<div class="admin-gal-item"><img src="' + it.img + '" alt=""><span><strong>' + esc(it.title || "sin título") + '</strong><br><em class="g-meta">' + esc(it.caption || "") + '</em></span><button class="btn small" data-gi="' + i + '">✕</button></div>';
    }).join("") : "<p class='muted'>no hay fotos todavía</p>";
    var btns = box.querySelectorAll("[data-gi]");
    for (var k = 0; k < btns.length; k++) {
      btns[k].addEventListener("click", (function (btn) {
        return function () {
          var l = currentGal();
          l.splice(parseInt(btn.getAttribute("data-gi"), 10), 1);
          save(LS_GAL, l);
          paintGal();
          if (window.__renderGallery) window.__renderGallery();
          status("✕ foto eliminada");
        };
      })(btns[k]));
    }
  }
  function loadGalList() { paintGal(); }
  $("#gal-file").addEventListener("change", function () {
    var f = this.files && this.files[0];
    galFileData = null;
    if (!f) return;
    if (!/^image\//.test(f.type)) { status("✕ eso no es una imagen"); return; }
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        var max = 1100;
        var r = Math.min(1, max / Math.max(im.width, im.height));
        var cv = document.createElement("canvas");
        cv.width = Math.round(im.width * r); cv.height = Math.round(im.height * r);
        var cx = cv.getContext("2d");
        cx.fillStyle = "#0b1220"; cx.fillRect(0, 0, cv.width, cv.height);
        cx.drawImage(im, 0, 0, cv.width, cv.height);
        galFileData = cv.toDataURL("image/jpeg", 0.82);
        status("foto cargada (" + cv.width + "×" + cv.height + ") · ponle título y añádela");
      };
      im.onerror = function () { status("✕ no pude leer esa imagen"); };
      im.src = fr.result;
    };
    fr.readAsDataURL(f);
  });
  $("#gal-add").addEventListener("click", function () {
    if (!galFileData) { status("✕ primero escoge una foto"); return; }
    var list = currentGal();
    if (list.length >= 40) { status("✕ límite de 40 fotos · borra alguna"); return; }
    list.unshift({
      title: $("#gal-title").value.trim().slice(0, 60),
      caption: $("#gal-caption").value.trim().slice(0, 140),
      img: galFileData,
      d: new Date().toISOString().slice(0, 10)
    });
    try { save(LS_GAL, list); }
    catch (e) { status("✕ memoria del navegador llena · borra alguna foto"); return; }
    galFileData = null;
    $("#gal-file").value = ""; $("#gal-title").value = ""; $("#gal-caption").value = "";
    paintGal();
    if (window.__renderGallery) window.__renderGallery();
    status("▸ foto añadida a la galería");
  });

  // ── COMENTARIOS manager ──
  var LS_CM = "kn_comments_v1";
  function readCmAll() { return load(LS_CM, {}); }
  function paintComments() {
    var o = readCmAll(), box = $("#admin-comments-list"), html = "";
    for (var slug in o) {
      if (!Object.prototype.hasOwnProperty.call(o, slug)) continue;
      var a = o[slug] || [];
      if (!a.length) continue;
      html += '<div class="admin-cm-group"><strong>' + esc(slug) + " · " + a.length + "</strong>" + a.map(function (c, i) {
        return '<div class="admin-guest-item"><span><strong>' + esc(c.n) + '</strong> <em class="g-meta">' + esc(c.d) + "</em><br>" + esc(c.m) + '</span><button class="btn small" data-slug="' + esc(slug) + '" data-ci="' + i + '">✕</button></div>';
      }).join("") + "</div>";
    }
    box.innerHTML = html || "<p class='muted'>no hay comentarios todavía</p>";
    var btns = box.querySelectorAll("[data-ci]");
    for (var k = 0; k < btns.length; k++) {
      btns[k].addEventListener("click", (function (btn) {
        return function () {
          var sl = btn.getAttribute("data-slug");
          var o2 = readCmAll();
          var a = o2[sl] || [];
          a.splice(parseInt(btn.getAttribute("data-ci"), 10), 1);
          o2[sl] = a;
          save(LS_CM, o2);
          paintComments();
          if (window.__render) window.__render(window.POSTS || []);
          status("✕ comentario borrado");
        };
      })(btns[k]));
    }
  }
  function loadCommentsList() { paintComments(); }
  $("#cm-clear").addEventListener("click", function () {
    if (!confirm("¿Borrar TODOS los comentarios de todos los posts?")) return;
    save(LS_CM, {});
    paintComments();
    if (window.__render) window.__render(window.POSTS || []);
    status("⌫ comentarios vaciados");
  });

  // ── ajustes ──
  function loadSettingsForm() {
    var s = load(LS_SETTINGS, {});
    if (s.accent) $("#a-accent").value = s.accent;
    $("#a-counter").checked = s.showCounter !== false;
    $("#a-marquee").checked = s.showMarquee !== false;
    $("#a-crt").checked = s.showCrt !== false;
  }
  $("#a-settings-save").addEventListener("click", function () {
    var s = {
      accent: $("#a-accent").value,
      showCounter: $("#a-counter").checked,
      showMarquee: $("#a-marquee").checked,
      showCrt: $("#a-crt").checked
    };
    save(LS_SETTINGS, s);
    applySettings(s);
    status("◍ ajustes guardados");
  });

  // ── pestañas de la consola ──
  var tabs = document.querySelectorAll(".admin-tabs button");
  for (var t = 0; t < tabs.length; t++) {
    tabs[t].addEventListener("click", (function (btn) {
      return function () {
        for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove("active");
        btn.classList.add("active");
        var name = btn.getAttribute("data-tab");
        $("#tab-posts").hidden = name !== "posts";
        $("#tab-books").hidden = name !== "books";
        $("#tab-gal").hidden = name !== "gal";
        $("#tab-guest").hidden = name !== "guest";
        $("#tab-comments").hidden = name !== "comments";
        $("#tab-settings").hidden = name !== "settings";
      };
    })(tabs[t]));
  }

  // ── gatillos secretos ──
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) { e.preventDefault(); open(); }
  });
  var dots = document.querySelector(".topbar .dots");
  if (dots) dots.addEventListener("dblclick", open);

  // botón [ admin ] del menú (si existe) + acceso global
  var navAdmin = document.getElementById("nav-admin");
  if (navAdmin) navAdmin.addEventListener("click", function (e) { e.preventDefault(); open(); });
  window.__adminOpen = open;
})();
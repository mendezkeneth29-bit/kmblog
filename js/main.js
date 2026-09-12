/* lógica del blog: fecha, posts, archivo, post individual, libro de visitas, contador */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  function renderAll(rawPosts) {
    const posts = (rawPosts || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const fmt = (iso) => {
    try {
      return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return iso; }
  };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // fecha de hoy en topbar
  const t = $("#today");
  if (t) t.textContent = new Date().toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  // ── inicio: últimas 3 (primer post con drop-cap editorial) ──
  const latest = $("#latest-posts");
  if (latest) {
    latest.innerHTML = posts.slice(0, 3).map((p, i) => `
      <article class="post${i === 0 ? " post-drop" : ""}">
        <div class="post-meta">${fmt(p.date)} <span class="dot">●</span> ${p.tags.map((x) => `<a class="tag" href="archive.html?q=${encodeURIComponent(x)}">#${esc(x)}</a>`).join(" ")}</div>
        <h2><a href="post.html?slug=${encodeURIComponent(p.slug)}">${esc(p.title)}</a></h2>
        <p>${esc(p.excerpt)} <a href="post.html?slug=${encodeURIComponent(p.slug)}">leer →</a></p>
      </article>`).join("") || "<p>Sin entradas todavía.</p>";
    if (latest.innerHTML) {
      const nx = latest.nextElementSibling;
      if (nx && nx.classList.contains("ascii-div")) nx.remove();
      latest.insertAdjacentHTML("afterend", '<div class="ascii-div">｡･ﾟ ✦ ｡･ﾟ</div>');
    }
  }

  // ── archivo + buscador ──
  const list = $("#archive-list");
  if (list) {
    const params = new URLSearchParams(location.search);
    const q0 = (params.get("q") || "").toLowerCase();
    const input = $("#search");
    if (input && q0) input.value = params.get("q");
    const render = (q) => {
      const f = posts.filter((p) => !q || (p.title + " " + p.excerpt + " " + p.tags.join(" ")).toLowerCase().includes(q));
      $("#archive-count").textContent = f.length + " entradas";
      let lastYear = "";
      list.innerHTML = f.map((p) => {
        const y = p.date.slice(0, 4);
        const h = y !== lastYear ? `<div class="year">— ${y} —</div>` : "";
        lastYear = y;
        return h + `
        <article class="post">
          <div class="post-meta">${fmt(p.date)}</div>
          <h3><a href="post.html?slug=${encodeURIComponent(p.slug)}">${esc(p.title)}</a></h3>
          <p class="small">${esc(p.excerpt)}</p>
          <div>${p.tags.map((x) => `<span class="tag">#${esc(x)}</span>`).join(" ")}</div>
        </article>`;
      }).join("") || "<p>Nada por aquí. Prueba con otra palabra.</p>";
    };
    render(q0);
    if (input) {
      input.addEventListener("input", (e) => render(e.target.value.trim().toLowerCase()));
      // atajo "/" para buscar (estilo programador, solo JS)
      document.addEventListener("keydown", (e) => {
        if (e.key === "/" && document.activeElement !== input) { e.preventDefault(); input.focus(); }
      });
    }
  }

  // ── post individual + anterior/siguiente + barra lectura ──
  const body = $("#post-body");
  if (body) {
    const slug = new URLSearchParams(location.search).get("slug");
    const idx = Math.max(0, posts.findIndex((x) => x.slug === slug));
    const p = posts[idx] || posts[0];
    if (!p) { body.innerHTML = "<p>No hay entradas.</p>"; return; }
    document.title = p.title + " — keneth.txt";
    const k = $("#post-kicker"); if (k) k.textContent = "✎ " + fmt(p.date);
    const prev = posts[idx + 1], next = posts[idx - 1];
    body.innerHTML = `
      <div class="post-meta">${fmt(p.date)} <span class="dot">●</span> ${p.tags.map(esc).join(" · ")}</div>
      <div class="post-body"><h1>${esc(p.title)}</h1><p><em>${esc(p.excerpt)}</em></p><hr class="hr-dots">${p.html}</div>
      <hr class="hr-dots">
      <p class="center">${prev ? `<a class="btn small" href="post.html?slug=${encodeURIComponent(prev.slug)}">← ${esc(prev.title)}</a>` : ""}
      ${next ? `<a class="btn small" href="post.html?slug=${encodeURIComponent(next.slug)}">${esc(next.title)} →</a>` : ""}</p>
      <p class="small muted center">— fin · <a href="index.html">firmar libro de visitas</a> · <a href="archive.html">más entradas</a></p>`;
    // ── comentarios por post (localStorage, sin servidor) ──
    const CK = "kn_comments_v1";
    const readCm = () => { try { const v = JSON.parse(localStorage.getItem(CK)); return v && typeof v === "object" ? v : {}; } catch { return {}; } };
    const cw = document.createElement("div");
    cw.className = "comments";
    cw.innerHTML = `
      <div class="comments-head">◌ comentarios <span id="cm-count"></span></div>
      <ul class="comments-list" id="cm-list"></ul>
      <form id="cm-form" class="comments-form">
        <input id="cm-name" maxlength="30" placeholder="tu nombre (opcional)">
        <textarea id="cm-msg" maxlength="500" rows="3" placeholder="escribe un comentario..."></textarea>
        <button class="btn small" type="submit">▸ publicar comentario</button>
      </form>`;
    body.appendChild(cw);
    const cmList = cw.querySelector("#cm-list"), cmCount = cw.querySelector("#cm-count"), cmForm = cw.querySelector("#cm-form");
    const paintCm = () => {
      const a = readCm()[p.slug] || [];
      cmCount.textContent = "· " + a.length;
      cmList.innerHTML = a.map((c) => `<li class="cm"><span class="cm-ava">${esc((c.n || "?").charAt(0).toUpperCase())}</span><div><strong>${esc(c.n)}</strong> <span class="g-meta">${esc(c.d)}</span><br>${esc(c.m)}</div></li>`).join("") || `<li class="cm muted">nadie ha comentado todavía · sé el primero</li>`;
    };
    paintCm();
    cmForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const m = $("#cm-msg").value.trim().slice(0, 500);
      if (!m) return;
      const o = readCm();
      const a = o[p.slug] || [];
      a.unshift({ n: $("#cm-name").value.trim().slice(0, 30) || "anónimo", m, d: new Date().toISOString().slice(0, 10) });
      o[p.slug] = a;
      try { localStorage.setItem(CK, JSON.stringify(o)); } catch {}
      paintCm(); cmForm.reset();
    });
    // barra de progreso de lectura (solo JS + CSS)
    const bar = $("#progress");
    if (bar) {
      const onScroll = () => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
      };
      document.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  // ── página "posts": feed con TODAS las entradas completas ──
  const all = $("#all-posts");
  if (all) {
    const ac = $("#all-count");
    if (ac) ac.textContent = "· " + posts.length + " entradas";
    all.innerHTML = posts.map((p) => `
      <article class="post post-full">
        <div class="post-meta">${fmt(p.date)} <span class="dot">●</span> ${p.tags.map((x) => `<a class="tag" href="archive.html?q=${encodeURIComponent(x)}">#${esc(x)}</a>`).join(" ")}</div>
        <h2><a href="post.html?slug=${encodeURIComponent(p.slug)}">${esc(p.title)}</a></h2>
        <div class="post-body post-html">${p.html || ""}</div>
        <p class="small muted"><a href="post.html?slug=${encodeURIComponent(p.slug)}">permalink →</a></p>
      </article>`).join("") || "<p>Sin entradas todavía.</p>";
  }

  // ── libro de visitas (localStorage) ──
  const form = $("#guestbook-form");
  if (form) {
    const KEY = "guestbook-v1";
    const ul = $("#guestbook-list"), count = $("#guest-count");
    const seed = [
      { n: "visitante_chapin", m: "buena onda tu blog, keneth! saludos desde guate", d: "2026-09-02" },
      { n: "lector_502", m: "qué chilero que sea solo html + css + js. me suscribo.", d: "2026-08-28" }
    ];
    const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || seed; } catch { return seed; } };
    const save = (a) => localStorage.setItem(KEY, JSON.stringify(a));
    const paint = () => {
      const a = load();
      save(a); // persiste las firmas semilla para que el panel admin las vea
      count.textContent = a.length + " firmas";
      ul.innerHTML = a.map((g) => `<li><strong>${esc(g.n)}</strong> <span class="g-meta">${esc(g.d)}${g.w ? ` · <a href="${esc(g.w)}">web</a>` : ""}</span><br>${esc(g.m)}</li>`).join("");
    };
    paint();
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const n = $("#guest-name").value.trim().slice(0, 30) || "chapin_anónimo";
      const w = $("#guest-web").value.trim();
      const m = $("#guest-msg").value.trim().slice(0, 300);
      if (!m) return;
      const a = load();
      a.unshift({ n, w, m, d: new Date().toISOString().slice(0, 10) });
      save(a); paint(); form.reset();
    });
  }

  // ── contador de visitas (local, con encanto) ──
  const c = $("#visitor-counter");
  if (c) {
    let n = parseInt(localStorage.getItem("visitas-keneth") || "1", 10);
    localStorage.setItem("visitas-keneth", n + 1);
    c.textContent = String(n).padStart(6, "0");
    const vn = $("#visitor-n"); if (vn) vn.textContent = n.toLocaleString("es-ES");
  }
  } // ← fin renderAll

  // expone el render para que el panel admin pueda refrescar la página
  window.__render = renderAll;

  // Espera al JSON antes de pintar (solo JS + JSON)
  if (window.POSTS_READY && typeof window.POSTS_READY.then === "function") {
    window.POSTS_READY.then(renderAll);
  } else {
    renderAll(window.POSTS || []);
  }
})();

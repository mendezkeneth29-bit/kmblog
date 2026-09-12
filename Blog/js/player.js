/* ═══ REPRODUCTOR 2000s (solo JS) ═══
   Toca los mp3 de mp3/ (lista definida en #tracks-data de cada página).
   Suena en TODAS las páginas: guarda canción, segundo y si estaba sonando
   (localStorage) y al entrar a otra página sigue justo donde iba.
   Al abrir el blog (sesión nueva) arranca solo "Softcore". */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var wrap = $("#music-player");
  if (!wrap) return;

  var cover = "";
  var tracks = [];
  (function () {
    var el = $("#tracks-data");
    if (!el) return;
    try {
      var d = JSON.parse(el.textContent);
      cover = d.cover || "";
      if (Array.isArray(d.tracks)) tracks = d.tracks;
    } catch (e) { tracks = []; }
  })();
  if (!tracks.length) { wrap.style.display = "none"; return; }

  // ── memoria entre páginas (localStorage: sirve en todo el blog) ──
  var K_IDX = "kn_track_idx", K_POS = "kn_track_pos", K_PLAY = "kn_track_play";
  var idx = 0, savedPos = 0, wantPlay = false;
  try {
    var s = parseInt(localStorage.getItem(K_IDX), 10);
    if (tracks[s]) idx = s;
    savedPos = parseFloat(localStorage.getItem(K_POS)) || 0;
    wantPlay = localStorage.getItem(K_PLAY) === "1";
  } catch (e) {}

  // ── auto-arranque: al abrir el blog (sesión nueva) suena "Softcore" ──
  var K_SESS = "kn_music_session";
  var autoIdx = -1;
  for (var ai = 0; ai < tracks.length; ai++) {
    if ((tracks[ai].name || "").toLowerCase().indexOf("softcore") !== -1) { autoIdx = ai; break; }
  }
  var newSession = false;
  try {
    newSession = !sessionStorage.getItem(K_SESS);
    if (newSession) sessionStorage.setItem(K_SESS, "1");
  } catch (e) { newSession = false; }
  if (newSession && autoIdx >= 0) {
    idx = autoIdx;
    savedPos = 0;
    wantPlay = true;
    set(K_IDX, String(idx)); set(K_POS, "0"); set(K_PLAY, "1");
  }

  var audio = new Audio();
  audio.preload = "metadata";

  wrap.innerHTML =
    '<img class="player-cover" alt="portada">' +
    '<div class="player-lcd">' +
      '<span class="player-track">---</span>' +
      '<span class="player-time">0:00</span>' +
      '<div class="player-bar" title="clic o arrastra para adelantar"><div class="player-bar-fill"><i class="player-bar-knob"></i></div></div>' +
    '</div>' +
    '<button class="player-btn" data-act="prev" title="anterior">◂◂</button>' +
    '<button class="player-btn player-main" data-act="toggle" title="play/pausa">►</button>' +
    '<button class="player-btn" data-act="next" title="siguiente">▸▸</button>';

  var coverImg = wrap.querySelector(".player-cover");
  var trackEl = wrap.querySelector(".player-track");
  var timeEl = wrap.querySelector(".player-time");
  var btnMain = wrap.querySelector("[data-act=toggle]");
  if (cover) coverImg.src = cover;

  var ICON_PLAY = "►", ICON_PAUSE = "‖";
  function fmt(s) { if (!isFinite(s) || s < 0) s = 0; var m = Math.floor(s / 60); var ss = Math.floor(s % 60); return m + ":" + (ss < 10 ? "0" : "") + ss; }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // ── barra de tiempo: clic o arrastra para adelantar/retroceder ──
  var bar = wrap.querySelector(".player-bar");
  var fill = wrap.querySelector(".player-bar-fill");
  var dragging = false, previewTime = null;
  function dur() { return isFinite(audio.duration) ? audio.duration : 0; }
  function paintBar(cur, tot) {
    fill.style.width = (tot > 0 ? Math.min(100, (cur / tot) * 100) : 0) + "%";
    timeEl.textContent = tot > 0 ? fmt(cur) + " / " + fmt(tot) : fmt(cur);
  }
  function ratioAt(clientX) {
    var r = bar.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - r.left) / (r.width || 1)));
  }
  bar.addEventListener("pointerdown", function (e) {
    dragging = true; previewTime = null;
    try { bar.setPointerCapture(e.pointerId); } catch (err) {}
    var tot = dur();
    if (tot > 0) { previewTime = ratioAt(e.clientX) * tot; paintBar(previewTime, tot); }
    e.preventDefault();
  });
  bar.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var tot = dur();
    if (tot > 0) { previewTime = ratioAt(e.clientX) * tot; paintBar(previewTime, tot); }
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    if (previewTime != null) {
      try { audio.currentTime = previewTime; } catch (err) {}
      set(K_POS, previewTime);
    }
    previewTime = null;
  }
  bar.addEventListener("pointerup", endDrag);
  bar.addEventListener("pointercancel", endDrag);

  function load() {
    var t = tracks[idx];
    trackEl.textContent = t.name;
    audio.src = encodeURI(t.file);
    paintBar(0, dur());
    set(K_IDX, idx);
  }
  function play() {
    audio.play().then(function () { wrap.classList.remove("waiting"); }).catch(function () {
      // autoplay bloqueado por el navegador: espera el primer clic/tecla
      wrap.classList.add("waiting");
      armResume();
    });
    btnMain.textContent = ICON_PAUSE;
    set(K_PLAY, "1");
  }
  function pause() {
    audio.pause();
    btnMain.textContent = ICON_PLAY;
    set(K_PLAY, "0");
    set(K_POS, audio.currentTime || 0);
  }
  var armed = false;
  function armResume() {
    if (armed) return; armed = true;
    var go = function () {
      armed = false;
      document.removeEventListener("pointerdown", go);
      document.removeEventListener("keydown", go);
      audio.play().then(function () { wrap.classList.remove("waiting"); }).catch(function () {});
    };
    document.addEventListener("pointerdown", go);
    document.addEventListener("keydown", go);
  }
  function step(dir) {
    idx = (idx + dir + tracks.length) % tracks.length;
    savedPos = 0; set(K_POS, "0"); set(K_PLAY, "1");
    load();
    play();
  }
  load();
  audio.addEventListener("loadedmetadata", function () {
    if (savedPos > 0) { try { audio.currentTime = Math.min(savedPos, audio.duration || 0); } catch (e) {} savedPos = 0; }
    paintBar(audio.currentTime, dur());
    if (wantPlay) play();
  });
  audio.addEventListener("timeupdate", function () {
    if (!dragging) paintBar(audio.currentTime, dur());
    if (Math.floor(audio.currentTime) % 2 === 0) set(K_POS, audio.currentTime);
  });
  audio.addEventListener("ended", function () { step(1); });
  audio.addEventListener("play", function () { btnMain.textContent = ICON_PAUSE; set(K_PLAY, "1"); wrap.classList.remove("waiting"); });
  audio.addEventListener("pause", function () { btnMain.textContent = ICON_PLAY; });
  window.addEventListener("pagehide", function () { set(K_POS, audio.currentTime || 0); });
  window.addEventListener("beforeunload", function () { set(K_POS, audio.currentTime || 0); });

  wrap.querySelector("[data-act=toggle]").addEventListener("click", function () {
    if (audio.paused) play(); else pause();
  });
  wrap.querySelector("[data-act=next]").addEventListener("click", function () { step(1); });
  wrap.querySelector("[data-act=prev]").addEventListener("click", function () { step(-1); });
})();
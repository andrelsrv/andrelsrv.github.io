/* Aprimoramento progressivo: o site é completo sem este arquivo. */
(function () {
  "use strict";
  window.__main = true;
  var doc = document, root = doc.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ---------- Analytics (GoatCounter, anônimo, sem cookies) ---------- */
  var queue = [], sent = {};
  function flush() {
    var gc = window.goatcounter;
    if (!gc || typeof gc.count !== "function") return false;
    while (queue.length) {
      var name = queue.shift();
      try { gc.count({ path: "evento/" + name, title: name, event: true }); } catch (e) {}
    }
    return true;
  }
  // track(nome) nunca lança erro: se o script estiver bloqueado, os eventos são descartados em silêncio.
  function track(name, once) {
    if (!name) return;
    if (once) { if (sent[name]) return; sent[name] = 1; }
    queue.push(name);
    flush();
  }
  window.track = track;
  var gcScript = doc.getElementById("gc");
  if (gcScript) gcScript.addEventListener("load", function () { setTimeout(flush, 0); });
  var tries = 0, poll = setInterval(function () { if (flush() || ++tries > 20) clearInterval(poll); }, 500);

  // Origem: navegador embutido do Instagram e ?ref= (o WebView costuma omitir o referrer)
  if (/Instagram/i.test(navigator.userAgent || "")) track("origem/instagram-webview", true);
  try {
    var ref = (new URLSearchParams(location.search).get("ref") || "").toLowerCase();
    if (/^(instagram|linkedin|cv|email)$/.test(ref)) track("origem/" + ref, true);
  } catch (e) {}

  // Um único listener delegado para todos os [data-track]
  doc.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-track]");
    if (el) track(el.getAttribute("data-track"), el.hasAttribute("aria-pressed"));
  });

  // Profundidade de rolagem: marcadores invisíveis em 25/50/75/100%
  if (hasIO) {
    var depthIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { track("scroll/" + en.target.dataset.depth, true); depthIO.unobserve(en.target); }
      });
    });
    [25, 50, 75, 100].forEach(function (p) {
      var m = doc.createElement("div");
      m.setAttribute("aria-hidden", "true");
      m.dataset.depth = p;
      m.style.cssText = "position:absolute;left:0;width:1px;height:1px;pointer-events:none;top:calc(" + p + "% - " + (p === 100 ? 2 : 0) + "px)";
      doc.body.appendChild(m);
      depthIO.observe(m);
    });
  }

  /* ---------- Tema ---------- */
  var KEY = "theme-pref";
  var darkMQ = matchMedia("(prefers-color-scheme: dark)");
  function current() { return root.getAttribute("data-theme") || (darkMQ.matches ? "dark" : "light"); }
  function paintBar() {
    var c = current() === "dark" ? "#000000" : "#fbfbfd";
    if (!root.getAttribute("data-theme")) return; // segue o sistema via media nas metas
    doc.querySelectorAll('meta[name="theme-color"]').forEach(function (m) { m.setAttribute("content", c); });
  }
  paintBar();
  var toggle = doc.getElementById("themeToggle");
  if (toggle) toggle.addEventListener("click", function () {
    var next = current() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    paintBar();
    track("tema/" + (next === "dark" ? "escuro" : "claro"));
  });

  /* ---------- Nav: fundo ao rolar, menu móvel, scroll-spy ---------- */
  var nav = doc.getElementById("nav");
  var heroIn = doc.getElementById("heroIn");
  var parallax = !reduce && matchMedia("(min-width: 768px) and (hover: hover)").matches;
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || 0;
    nav.classList.toggle("scrolled", y > 8);
    if (parallax && heroIn) {
      var p = Math.min(y / window.innerHeight, 1);
      heroIn.style.transform = p ? "translateY(" + (p * 60).toFixed(1) + "px) scale(" + (1 - p * 0.06).toFixed(4) + ")" : "";
      heroIn.style.opacity = p ? Math.max(1 - p * 1.3, 0).toFixed(3) : "";
    }
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  var menu = doc.getElementById("menu");
  if (menu) {
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) menu.open = false; });
    doc.addEventListener("click", function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); } });
  }

  var sections = ["perfil", "experiencia", "pesquisa", "formacao", "contato"];
  if (hasIO) {
    var navLinks = doc.querySelectorAll(".links a");
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        navLinks.forEach(function (a) {
          if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
        track("secao/" + id, true);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (id) { var s = doc.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var rs = doc.querySelectorAll(".r");
  if (hasIO && !reduce) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    rs.forEach(function (el) { rio.observe(el); });
  } else {
    rs.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Contagem animada (o HTML já tem os valores finais) ---------- */
  var stats = doc.getElementById("stats");
  if (stats && hasIO && !reduce) {
    var nums = stats.querySelectorAll("[data-count]");
    var fmt = function (v, d) { return v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }); };
    var sio = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      sio.disconnect();
      var t0 = performance.now(), dur = 1600;
      (function step(t) {
        var k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 4);
        nums.forEach(function (n) { n.textContent = fmt(parseFloat(n.dataset.count) * e, +n.dataset.dec); });
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: 0.4 });
    sio.observe(stats);
  }

  /* ---------- Segmented control Arquitetura / Validação ---------- */
  var seg = doc.getElementById("seg");
  if (seg) {
    var tabs = seg.querySelectorAll("[role=tab]");
    var select = function (i, focus) {
      seg.dataset.i = i;
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute("aria-selected", on);
        t.tabIndex = on ? 0 : -1;
        doc.getElementById(t.getAttribute("aria-controls")).hidden = !on;
        if (on && focus) t.focus();
      });
    };
    tabs.forEach(function (t, j) {
      t.addEventListener("click", function () { select(j); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); select(j ? 0 : 1, true); }
      });
    });
    select(0);
  }

  /* ---------- Compartilhar / copiar link ---------- */
  var share = doc.getElementById("share"), msg = doc.getElementById("shareMsg");
  var URL_SITE = "https://andrelsrv.github.io/";
  function say(t) { msg.textContent = t; setTimeout(function () { msg.textContent = ""; }, 2600); }
  function legacyCopy() {
    var ta = doc.createElement("textarea");
    ta.value = URL_SITE; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0;font-size:16px";
    doc.body.appendChild(ta); ta.select();
    var ok = false; try { ok = doc.execCommand("copy"); } catch (e) {}
    doc.body.removeChild(ta);
    say(ok ? "Link copiado." : URL_SITE);
  }
  if (share) {
    if (!navigator.share) share.querySelector("span").textContent = "Copiar link";
    share.addEventListener("click", function () {
      if (navigator.share) {
        navigator.share({ title: doc.title, url: URL_SITE }).catch(function () {});
      } else if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(URL_SITE).then(function () { say("Link copiado."); }, legacyCopy);
      } else legacyCopy();
    });
  }

  /* ---------- "Como você chegou aqui?" ---------- */
  var who = doc.querySelectorAll(".who button");
  who.forEach(function (b) {
    b.addEventListener("click", function () {
      who.forEach(function (o) { o.setAttribute("aria-pressed", o === b); });
    });
  });

  /* ---------- Onda viajante: incidente + reflexão ---------- */
  var cv = doc.getElementById("wave");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d"), W = 0, H = 0, running = false, visible = true, t0w = performance.now();
    var styleOf = function (v) { return getComputedStyle(root).getPropertyValue(v).trim(); };
    var resize = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
      W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var pulse = function (x, c, w) { var d = (x - c) / w; return Math.exp(-d * d); };
    var draw = function (now) {
      var T = 5200, ph = ((now - t0w) % T) / T;     // 0..1
      var L = W, mid = H * 0.56, A = H * 0.36, w = Math.max(L * 0.035, 10), gamma = -0.62;
      var inc = ph * 2 * L - 0.15 * L;               // posição do pulso incidente
      var ref = 2 * L - inc;                         // imagem refletida no terminal
      var fade = ph > 0.88 ? (1 - ph) / 0.12 : ph < 0.06 ? ph / 0.06 : 1;
      ctx.clearRect(0, 0, W, H);
      var sec = styleOf("--text-2"), acc = styleOf("--accent"), fg = styleOf("--text");
      // linha de base e terminais
      ctx.lineWidth = 1; ctx.strokeStyle = sec; ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(L, mid); ctx.stroke();
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.moveTo(0.5, mid - 8); ctx.lineTo(0.5, mid + 8); ctx.moveTo(L - 0.5, mid - 8); ctx.lineTo(L - 0.5, mid + 8); ctx.stroke();
      // sinal total
      ctx.globalAlpha = fade; ctx.lineWidth = 1.5; ctx.strokeStyle = fg; ctx.lineJoin = "round";
      ctx.beginPath();
      for (var x = 0; x <= L; x += 2) {
        var y = (inc <= L ? pulse(x, inc, w) : 0) + (ref <= L ? gamma * pulse(x, ref, w) : 0);
        var ring = Math.sin(x / (w * 0.55)) * 0.08 * (inc <= L ? pulse(x, inc - w * 2.2, w * 1.6) : 0);
        var yy = mid - A * (y + ring);
        x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
      }
      ctx.stroke();
      // ponto de frente de onda
      var head = inc <= L ? inc : ref;
      if (head >= 0 && head <= L) {
        var hv = inc <= L ? 1 : gamma;
        ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(head, mid - A * hv, 2.6, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    var loop = function (now) { if (!running) return; draw(now); requestAnimationFrame(loop); };
    var start = function () { if (!running && visible && !doc.hidden) { running = true; requestAnimationFrame(loop); } };
    var stop = function () { running = false; };
    resize();
    window.addEventListener("resize", function () { resize(); if (!running) draw(t0w + 5200 * 0.32); });
    if (reduce) {
      draw(t0w + 5200 * 0.32); // quadro estático
      darkMQ.addEventListener && darkMQ.addEventListener("change", function () { draw(t0w + 5200 * 0.32); });
      if (toggle) toggle.addEventListener("click", function () { draw(t0w + 5200 * 0.32); });
    } else {
      if (hasIO) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; visible ? start() : stop(); }).observe(cv);
      doc.addEventListener("visibilitychange", function () { doc.hidden ? stop() : start(); });
      start();
    }
  }
})();

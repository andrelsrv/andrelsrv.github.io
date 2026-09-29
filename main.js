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
    if (/^(instagram|linkedin|cv|email|whatsapp|app)$/.test(ref)) track("origem/" + ref, true);
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
  var parallax = false; // hero interativo: sem parallax
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

  var sections = ["perfil", "experiencia", "web", "pesquisa", "formacao", "contato"];
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

  /* ---------- <details> abertos (detalhes técnicos, cronograma) ---------- */
  doc.addEventListener("toggle", function (e) {
    var d = e.target;
    if (d.open && d.dataset && d.dataset.trackOpen) track(d.dataset.trackOpen, true);
  }, true);

  /* ---------- Linha de transmissão interativa ----------
     Pulsos gaussianos viajam nas duas direções. Nas extremidades:
     Γ = (ZL − Z0)/(ZL + Z0) → aberto +1, curto −1, casado 0 (absorvido).
     Atenuação exponencial ao longo do percurso. */
  var cv = doc.getElementById("wave"), stage = doc.getElementById("lineStage");
  if (cv && cv.getContext && stage) {
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1;
    var gamma = 1, pulses = [], running = false, visible = true, last = 0, tAmb = 0;
    var SPEED = 0.55;      // fração da largura por segundo
    var ALPHA = 0.6;       // atenuação (neper) por largura percorrida
    var PAD = 14;          // margem para os símbolos de terminal
    var colors = {};
    var readColors = function () {
      var cs = getComputedStyle(root);
      colors = { fg: cs.getPropertyValue("--text").trim(), dim: cs.getPropertyValue("--text-2").trim(), acc: cs.getPropertyValue("--accent").trim() };
    };
    var resize = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var L = function () { return W - 2 * PAD; };
    var sigma = function () { return Math.max(L() * 0.022, 7); };

    // Avança um pulso por dt segundos, refletindo nas extremidades com o Γ atual.
    var step = function (p, dt) {
      var len = L(), d = SPEED * len * dt;
      p.x += p.dir * d;
      p.amp *= Math.exp(-ALPHA * d / len);
      while (p.x < 0 || p.x > len) {
        p.x = p.x > len ? 2 * len - p.x : -p.x;
        p.dir = -p.dir; p.amp *= gamma;
        if (gamma === 0) { p.amp = 0; break; }
      }
      return Math.abs(p.amp) > 0.015;
    };
    var lastPulse = -1e9;
    var fire = function (x, auto) {
      var len = L(); x = Math.min(Math.max(x - PAD, 0), len);
      if (pulses.length > 14) pulses.splice(0, 2);
      var a = auto ? 0.6 : 0.9;
      pulses.push({ x: x, dir: 1, amp: a }, { x: x, dir: -1, amp: a });
      lastPulse = performance.now();
      if (!auto) track("onda/toque", true);
    };

    var drawTerminal = function (xe, mid) {
      ctx.save(); ctx.strokeStyle = colors.dim; ctx.lineWidth = 1.25; ctx.globalAlpha = 0.85;
      ctx.beginPath();
      if (gamma === 1) {                              // aberto: círculo vazado
        ctx.arc(xe, mid, 4, 0, 6.2832);
      } else if (gamma === -1) {                      // curto: barra + terra
        ctx.moveTo(xe, mid - 9); ctx.lineTo(xe, mid + 9);
        ctx.moveTo(xe - 5, mid + 13); ctx.lineTo(xe + 5, mid + 13);
      } else {                                        // casado: resistor
        ctx.moveTo(xe, mid - 12);
        for (var k = 0; k < 6; k++) ctx.lineTo(xe + (k % 2 ? -4 : 4), mid - 10 + k * 4);
        ctx.lineTo(xe, mid + 12);
      }
      ctx.stroke(); ctx.restore();
    };

    // Forma de onda total: soma dos pulsos + onda ambiente sutil
    var drawWave = function (list, amb, alpha, withDots) {
      var len = L(), mid = H * 0.56, A = H * 0.34, sg = sigma();
      ctx.globalAlpha = alpha; ctx.lineWidth = 1.6; ctx.strokeStyle = colors.fg; ctx.lineJoin = "round";
      ctx.beginPath();
      for (var x = 0; x <= len; x += 2) {
        var y = 0;
        for (var i = 0; i < list.length; i++) { var d = (x - list[i].x) / sg; if (d > -4 && d < 4) y += list[i].amp * Math.exp(-d * d / 2); }
        if (amb) y += amb * Math.sin((x / len) * Math.PI * 6 - tAmb * 1.6) * Math.sin((x / len) * Math.PI);
        var yy = mid - A * y;
        if (x) ctx.lineTo(PAD + x, yy); else ctx.moveTo(PAD + x, yy);
      }
      ctx.stroke();
      if (withDots) {
        ctx.fillStyle = colors.acc;
        for (var j = 0; j < list.length; j++) {
          ctx.globalAlpha = alpha * Math.min(1, Math.abs(list[j].amp) * 1.6);
          ctx.beginPath(); ctx.arc(PAD + list[j].x, mid - A * list[j].amp, 2.8, 0, 6.2832); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };
    var frame = function () {
      ctx.clearRect(0, 0, W, H);
      var mid = H * 0.56;
      ctx.strokeStyle = colors.dim; ctx.globalAlpha = 0.28; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD, mid); ctx.lineTo(W - PAD, mid); ctx.stroke(); ctx.globalAlpha = 1;
      drawTerminal(PAD, mid); drawTerminal(W - PAD, mid);
    };

    var loop = function (now) {
      if (!running) return;
      var dt = Math.min((now - (last || now)) / 1000, 0.05); last = now; tAmb += dt;
      pulses = pulses.filter(function (p) { return step(p, dt); });
      // Sem interação, um pulso de demonstração a cada ~3 s mantém a linha viva
      if (!pulses.length && now - lastPulse > 2800) fire(PAD + L() * (0.25 + Math.random() * 0.5), true);
      frame();
      drawWave(pulses, pulses.length ? 0.03 : 0.06, 1, true);
      requestAnimationFrame(loop);
    };
    var start = function () { if (!running && visible && !doc.hidden) { running = true; last = 0; requestAnimationFrame(loop); } };
    var stop = function () { running = false; };

    // Movimento reduzido: sem animação contínua; um toque mostra o pulso em quadros discretos sobrepostos.
    var lastShot = null;
    var staticShot = function (x) {
      lastShot = x; frame();
      if (x == null) { drawWave([], 0, 1, false); return; }
      var len = L(), x0 = Math.min(Math.max(x - PAD, 0), len);
      var sim = [{ x: x0, dir: 1, amp: 0.9 }, { x: x0, dir: -1, amp: 0.9 }];
      var N = 6, dtk = 1.9 / SPEED / N;
      for (var k = 0; k < N; k++) {
        drawWave(sim, 0, 0.22 + 0.78 * (k / (N - 1)), k === N - 1);
        sim = sim.filter(function (p) { return step(p, dtk); });
      }
      track("onda/toque", true);
    };
    var fireAt = function (x) { if (reduce) staticShot(x); else { fire(x); start(); } };

    readColors(); resize(); lastW = W;
    stage.addEventListener("click", function (e) {
      var r = cv.getBoundingClientRect();
      fireAt(e.detail === 0 ? W / 2 : e.clientX - r.left); // detail 0 = ativação por teclado
    });
    stage.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); fireAt(W / 2); }
    });
    var redraw = function () { readColors(); if (!running) staticShot(lastShot); };
    var lastW;
    window.addEventListener("resize", function () {
      var w = cv.getBoundingClientRect().width;
      resize(); if (!running) staticShot(w === lastW ? lastShot : null); lastW = w;
    });
    if (darkMQ.addEventListener) darkMQ.addEventListener("change", redraw);
    if (toggle) toggle.addEventListener("click", function () { setTimeout(redraw, 0); });

    if (reduce) staticShot(null);
    else {
      if (hasIO) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); else stop(); }).observe(cv);
      doc.addEventListener("visibilitychange", function () { if (doc.hidden) stop(); else start(); });
      start();
    }
  }
})();

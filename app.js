(() => {
  "use strict";

  // ===============================
  // HELPERS
  // ===============================
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const PATH = (p) => (p.startsWith("./") ? p : "./" + p.replace(/^\//, ""));
  const PAGE = () => (location.pathname.split("/").pop() || "index.html").toLowerCase();

  // ===============================
  // PLAN (single source of truth)
  // Required: qm_plan_v1 + compat (status/plan/last_paid_plan/proStatus)
  // ===============================
  function normalizePlan(raw) {
    const s = String(raw ?? "").trim();
    const u = s.toUpperCase();
    const l = s.toLowerCase();

    if (u === "ELITE" || l === "elite") return "elite";
    if (u === "PRO" || u === "PREMIUM" || l === "pro" || l === "premium") return "pro";
    if (
      u === "BASIC" || u === "FREE" || u === "GUEST" ||
      l === "basic" || l === "free" || l === "guest" || !s
    ) return "basic";
    return "basic";
  }

  function readPlan() {
    // canonical first
    const keys = ["qm_plan_v1", "qm_plan", "status", "plan", "last_paid_plan", "proStatus"];
    for (const k of keys) {
      const val = localStorage.getItem(k);
      if (!val) continue;

      // proStatus special-case
      if (k === "proStatus") {
        if (String(val).toLowerCase() === "true") return "pro";
        continue;
      }

      try {
        const parsed = JSON.parse(val);
        return normalizePlan(parsed?.tier ?? parsed?.plan ?? parsed?.status ?? parsed);
      } catch {
        return normalizePlan(val);
      }
    }
    return "basic";
  }

  function writePlan(plan) {
    const p = normalizePlan(plan);

    // keep canonical
    localStorage.setItem("qm_plan_v1", JSON.stringify({ tier: p, updatedAt: Date.now() }));
    localStorage.setItem("qm_plan", p);

    // compat
    localStorage.setItem("status", p.toUpperCase());
    localStorage.setItem("plan", p.toUpperCase());
    localStorage.setItem("last_paid_plan", p.toUpperCase());

    if (p === "pro" || p === "elite") {
      localStorage.setItem("proStatus", "true");
    } else {
      localStorage.removeItem("proStatus");
    }

    return p;
  }

  function getPlan() {
    return writePlan(readPlan());
  }

  function setPlan(plan) {
    return writePlan(plan);
  }

  function hasAtLeast(required) {
    const rank = { basic: 0, pro: 1, elite: 2 };
    const cur = getPlan();
    const req = normalizePlan(required);
    return (rank[cur] ?? 0) >= (rank[req] ?? 0);
  }

  function isElite() {
    return getPlan() === "elite";
  }

  function isLogged() {
    return localStorage.getItem("is_logged_in") === "true";
  }

  // ===============================
  // ROUTES (single nav map)
  // icons: use your uploaded assets; if not present, text still works.
  // ===============================
  const ROUTES = [
    { key: "home", label: "Start", href: "./index.html", icon: "./assets/home.svg" },
    { key: "dash", label: "Dashboard", href: "./dashboard.html", icon: "./assets/dashboard.svg" },
    { key: "hurt", label: "Hurtownie", href: "./hurtownie.html", icon: "./assets/warehouse.svg", require: "pro" },
    { key: "qm", label: "QualitetMarket", href: "./qualitetmarket.html", icon: "./assets/qm.svg", require: "pro" },
    { key: "intel", label: "Intelligence", href: "./intelligence.html", icon: "./assets/intel.svg", require: "elite" },
    { key: "list", label: "Listing", href: "./listing.html", icon: "./assets/listing.svg", require: "pro" },
    { key: "price", label: "Cennik", href: "./cennik.html", icon: "./assets/pricing.svg" }
  ];

  // NOTE:
  // Jeśli Twoje ikony mają inne nazwy, nic się nie psuje — appka działa,
  // tylko pokaże "puste" miejsce w ikonach. Jak podasz listę assets, dopnę mapę 1:1.

  function currentRouteKey() {
    const page = PAGE();
    const hit = ROUTES.find(r => r.href.toLowerCase().endsWith(page));
    return hit?.key ?? null;
  }

  // ===============================
  // GUARDS (page-level + element-level)
  // body data-require="pro|elite" supported
  // ===============================
  function applyGuards() {
    const required = document.body?.dataset?.require;
    if (required && !hasAtLeast(required)) {
      location.replace(PATH("cennik.html"));
      return;
    }

    // lock elements
    $$("[data-require]").forEach(el => {
      const req = el.getAttribute("data-require");
      if (req && !hasAtLeast(req)) {
        el.setAttribute("aria-disabled", "true");
        el.classList.add("is-locked");
        el.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          location.href = PATH("cennik.html");
        }, { capture: true });
      }
    });
  }

  // ===============================
  // UI: Shell injection (sidebar + bottom nav + thin topbar)
  // Works without editing every HTML.
  // ===============================
  function ensureShell() {
    // If already injected, stop
    if ($(".app-shell")) return;

    // Wrap existing body content
    const bodyChildren = Array.from(document.body.childNodes);

    // Create structure
    const shell = document.createElement("div");
    shell.className = "app-shell";

    const sidebar = document.createElement("aside");
    sidebar.className = "sidebar";
    sidebar.innerHTML = `
      <div class="s-logo" aria-label="QualitetMarket"></div>
      <nav class="s-nav" data-snav></nav>
      <div class="s-spacer"></div>
      <div class="s-foot" data-sfoot></div>
    `;

    const main = document.createElement("main");
    main.className = "content";
    main.innerHTML = `
      <div class="topbar">
        <div class="t-title" data-page-title>QualitetMarket</div>
        <div class="t-pill" id="planBadge">PLAN: BASIC</div>
      </div>
      <div class="content-inner" data-content-inner></div>
    `;

    const bottom = document.createElement("nav");
    bottom.className = "bottom-nav";
    bottom.setAttribute("aria-label", "Nawigacja");
    bottom.innerHTML = `<div data-bnav style="display:flex;gap:6px;align-items:center;justify-content:space-around;width:100%"></div>`;

    // Move old nodes into content-inner
    const inner = main.querySelector("[data-content-inner]");
    bodyChildren.forEach(n => inner.appendChild(n));

    shell.appendChild(sidebar);
    shell.appendChild(main);
    shell.appendChild(bottom);

    document.body.appendChild(shell);
  }

  function pageTitleFromHTML() {
    // Prefer H1 if exists, else document.title
    const h1 = $("h1");
    if (h1 && h1.textContent.trim()) return h1.textContent.trim();
    const t = (document.title || "").trim();
    if (t) return t;
    return "QualitetMarket";
  }

  function renderPlanBadge() {
    const plan = getPlan().toUpperCase();

    const badge = $("#planBadge");
    if (badge) badge.textContent = `PLAN: ${plan}`;

    $$("[data-qm-plan]").forEach(el => {
      el.textContent = plan;
    });
  }

  function renderAuthUI() {
    const logged = isLogged();

    $$("[data-guest-only]").forEach(el => el.style.display = logged ? "none" : "");
    $$("[data-auth-only]").forEach(el => el.style.display = logged ? "" : "none");

    const label = $("[data-auth-label]");
    if (label) label.textContent = logged ? "Zalogowany" : "Gość";
  }

  function navItemHTML(route, activeKey) {
    const locked = route.require && !hasAtLeast(route.require);
    const isActive = route.key === activeKey;

    const icon = `
      <img class="${route.__mode === "sidebar" ? "s-icon" : "b-icon"}"
           src="${route.icon}"
           alt=""
           onerror="this.style.display='none'">
    `;

    const href = locked ? PATH("cennik.html") : route.href;

    if (route.__mode === "sidebar") {
      return `
        <a class="s-item ${isActive ? "active" : ""}"
           href="${href}"
           data-label="${route.label}"
           ${locked ? 'aria-disabled="true"' : ""}>
          ${icon}
        </a>
      `;
    }

    return `
      <a class="b-item ${isActive ? "active" : ""}"
         href="${href}"
         aria-label="${route.label}"
         ${locked ? 'aria-disabled="true"' : ""}>
        ${icon}
      </a>
    `;
  }

  function renderNav() {
    const activeKey = currentRouteKey();

    // Sidebar
    const snav = $("[data-snav]");
    if (snav) {
      const routes = ROUTES.map(r => ({ ...r, __mode: "sidebar" }));
      snav.innerHTML = routes.map(r => navItemHTML(r, activeKey)).join("");
    }

    // Sidebar foot: login/logout quick action
    const sfoot = $("[data-sfoot]");
    if (sfoot) {
      const logged = isLogged();
      sfoot.innerHTML = `
        <a class="s-item" data-label="${logged ? "Wyloguj" : "Zaloguj"}" href="${logged ? "#" : PATH("login.html")}" data-logout="${logged ? "1" : ""}">
          <img class="s-icon" src="./assets/user.svg" alt="" onerror="this.style.display='none'">
        </a>
      `;
    }

    // Bottom nav (mobile)
    const bnav = $("[data-bnav]");
    if (bnav) {
      const mobileRoutes = ROUTES
        .filter(r => ["home", "dash", "qm", "hurt", "price"].includes(r.key))
        .map(r => ({ ...r, __mode: "bottom" }));
      bnav.innerHTML = mobileRoutes.map(r => navItemHTML(r, activeKey)).join("");
    }

    // Title
    const t = $("[data-page-title]");
    if (t) t.textContent = pageTitleFromHTML();
  }

  // ===============================
  // LOGOUT + FIXED PATHS
  // ===============================
  function bindLogout() {
    // any element marked data-logout or [data-logout]
    $$("[data-logout]").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        localStorage.setItem("is_logged_in", "false");
        location.href = PATH("index.html");
      });
    });
  }

  // Optional: handle ?plan=pro|elite on success page (MVP payment return)
  function handlePlanFromQuery() {
    const url = new URL(location.href);
    const p = url.searchParams.get("plan");
    if (!p) return;
    const norm = normalizePlan(p);
    setPlan(norm);
    // clean URL without reload
    url.searchParams.delete("plan");
    history.replaceState({}, "", url.toString());
  }

  // ===============================
  // BOOT
  // ===============================
  function boot() {
    // expose
    window.QM = {
      getPlan,
      setPlan,
      hasAtLeast,
      isElite,
      isLogged
    };

    ensureShell();
    handlePlanFromQuery();
    applyGuards();

    renderPlanBadge();
    renderAuthUI();
    renderNav();
    bindLogout();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

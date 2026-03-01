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
    const keys = ["qm_plan_v1", "qm_plan", "status", "plan", "last_paid_plan", "proStatus"];
    for (const k of keys) {
      const val = localStorage.getItem(k);
      if (!val) continue;

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

    // canonical
    localStorage.setItem("qm_plan_v1", JSON.stringify({ tier: p, updatedAt: Date.now() }));

    // compat (nie ruszać nazw)
    localStorage.setItem("qm_plan", p);
    localStorage.setItem("status", p.toUpperCase());
    localStorage.setItem("plan", p.toUpperCase());
    localStorage.setItem("last_paid_plan", p.toUpperCase());

    if (p === "pro" || p === "elite") localStorage.setItem("proStatus", "true");
    else localStorage.removeItem("proStatus");

    return p;
  }

  function getPlan() { return writePlan(readPlan()); }
  function setPlan(plan) { return writePlan(plan); }

  function hasAtLeast(required) {
    const rank = { basic: 0, pro: 1, elite: 2 };
    const cur = getPlan();
    const req = normalizePlan(required);
    return (rank[cur] ?? 0) >= (rank[req] ?? 0);
  }

  function isElite() { return getPlan() === "elite"; }
  function isLogged() { return localStorage.getItem("is_logged_in") === "true"; }

  // ===============================
  // SERVICE WORKER (global)
  // ===============================
  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }

  // ===============================
  // ICONS (INLINE SVG) — always works
  // ===============================
  const ICON = {
    home: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M3 10.5 12 3l9 7.5V21a1.5 1.5 0 0 1-1.5 1.5H15v-6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v6H4.5A1.5 1.5 0 0 1 3 21v-10.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
    dashboard: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M4 13a7 7 0 1 1 16 0v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6Z" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v6l4 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    warehouse: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M3 9 12 4l9 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 21v-8h10v8" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 16h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    qm: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M7 7.5A4.5 4.5 0 0 1 11.5 3h1A4.5 4.5 0 0 1 17 7.5v9A4.5 4.5 0 0 1 12.5 21h-1A4.5 4.5 0 0 1 7 16.5v-9Z" stroke="currentColor" stroke-width="1.8"/><path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    intel: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M12 2v4M12 18v4M4 12H2M22 12h-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M7 12a5 5 0 1 0 10 0 5 5 0 0 0-10 0Z" stroke="currentColor" stroke-width="1.8"/><path d="M12 9v3l2 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    listing: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M7 6h14M7 12h14M7 18h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
    pricing: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M20 12 12 20 4 12l8-8 8 8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M9.5 10.5c0-1 1-1.5 2.5-1.5s2.5.5 2.5 1.5-1 1.5-2.5 1.5-2.5.5-2.5 1.5 1 1.5 2.5 1.5 2.5-.5 2.5-1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    user: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" stroke-width="1.8"/><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
  };

  // ===============================
  // ROUTES
  // ===============================
  const ROUTES = [
    { key: "home", label: "Start", href: "./index.html", iconKey: "home" },
    { key: "dash", label: "Dashboard", href: "./dashboard.html", iconKey: "dashboard" },
    { key: "hurt", label: "Hurtownie", href: "./hurtownie.html", iconKey: "warehouse", require: "pro" },
    { key: "qm", label: "QualitetMarket", href: "./qualitetmarket.html", iconKey: "qm", require: "pro" },
    { key: "intel", label: "Intelligence", href: "./intelligence.html", iconKey: "intel", require: "elite" },
    { key: "list", label: "Listing", href: "./listing.html", iconKey: "listing", require: "pro" },
    { key: "price", label: "Cennik", href: "./cennik.html", iconKey: "pricing" }
  ];

  function currentRouteKey() {
    const page = PAGE();
    const hit = ROUTES.find(r => r.href.toLowerCase().endsWith(page));
    return hit?.key ?? null;
  }

  // ===============================
  // GUARDS
  // ===============================
  function applyGuards() {
    const required = document.body?.dataset?.require;
    if (required && !hasAtLeast(required)) {
      location.replace(PATH("cennik.html"));
      return;
    }

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
  // UI: Shell injection
  // ===============================
  function ensureShell() {
    if ($(".app-shell")) return;

    const bodyChildren = Array.from(document.body.childNodes);

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

    const inner = main.querySelector("[data-content-inner]");
    bodyChildren.forEach(n => inner.appendChild(n));

    shell.appendChild(sidebar);
    shell.appendChild(main);
    shell.appendChild(bottom);

    document.body.appendChild(shell);
  }

  function pageTitleFromHTML() {
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
    $$("[data-qm-plan]").forEach(el => { el.textContent = plan; });
  }

  function renderAuthUI() {
    const logged = isLogged();
    $$("[data-guest-only]").forEach(el => el.style.display = logged ? "none" : "");
    $$("[data-auth-only]").forEach(el => el.style.display = logged ? "" : "");
    const label = $("[data-auth-label]");
    if (label) label.textContent = logged ? "Zalogowany" : "Gość";
  }

  function iconHTML(iconKey, mode) {
    const svg = ICON[iconKey] || "";
    const cls = mode === "sidebar" ? "s-icon" : "b-icon";
    return `<span class="${cls}" aria-hidden="true" style="display:inline-flex;color:rgba(234,240,255,.92)">${svg}</span>`;
  }

  function navItemHTML(route, activeKey) {
    const locked = route.require && !hasAtLeast(route.require);
    const isActive = route.key === activeKey;
    const href = locked ? PATH("cennik.html") : route.href;

    if (route.__mode === "sidebar") {
      return `
        <a class="s-item ${isActive ? "active" : ""}"
           href="${href}"
           data-label="${route.label}"
           ${locked ? 'aria-disabled="true"' : ""}>
          ${iconHTML(route.iconKey, "sidebar")}
        </a>
      `;
    }

    return `
      <a class="b-item ${isActive ? "active" : ""}"
         href="${href}"
         aria-label="${route.label}"
         ${locked ? 'aria-disabled="true"' : ""}>
        ${iconHTML(route.iconKey, "bottom")}
      </a>
    `;
  }

  function renderNav() {
    const activeKey = currentRouteKey();

    const snav = $("[data-snav]");
    if (snav) {
      const routes = ROUTES.map(r => ({ ...r, __mode: "sidebar" }));
      snav.innerHTML = routes.map(r => navItemHTML(r, activeKey)).join("");
    }

    const sfoot = $("[data-sfoot]");
    if (sfoot) {
      const logged = isLogged();
      sfoot.innerHTML = `
        <a class="s-item" data-label="${logged ? "Wyloguj" : "Zaloguj"}"
           href="${logged ? "#" : PATH("login.html")}"
           data-logout="${logged ? "1" : ""}">
          ${iconHTML("user", "sidebar")}
        </a>
      `;
    }

    const bnav = $("[data-bnav]");
    if (bnav) {
      const mobileRoutes = ROUTES
        .filter(r => ["home", "dash", "qm", "hurt", "price"].includes(r.key))
        .map(r => ({ ...r, __mode: "bottom" }));
      bnav.innerHTML = mobileRoutes.map(r => navItemHTML(r, activeKey)).join("");
    }

    const t = $("[data-page-title]");
    if (t) t.textContent = pageTitleFromHTML();
  }

  // ===============================
  // LOGOUT + FIXED PATHS
  // ===============================
  function bindLogout() {
    $$("[data-logout]").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        localStorage.setItem("is_logged_in", "false");
        location.href = PATH("index.html");
      });
    });
  }

  function handlePlanFromQuery() {
    const url = new URL(location.href);
    const p = url.searchParams.get("plan");
    if (!p) return;
    setPlan(normalizePlan(p));
    url.searchParams.delete("plan");
    history.replaceState({}, "", url.toString());
  }

  // ===============================
  // BOOT
  // ===============================
  function boot() {
    // SW zawsze (żeby wszystkie podstrony były pod kontrolą PWA)
    registerSW();

    // === FIX: noShell MUSI BYĆ TU, na samej górze boot() ===
    if (document.body?.dataset?.noShell === "1") {
      window.QM = { getPlan, setPlan, hasAtLeast, isElite, isLogged };
      handlePlanFromQuery();
      applyGuards();
      renderPlanBadge();
      renderAuthUI();
      bindLogout();
      return;
    }

    window.QM = { getPlan, setPlan, hasAtLeast, isElite, isLogged };

    ensureShell();
    handlePlanFromQuery();
    applyGuards();

    renderPlanBadge();
    renderAuthUI();
    renderNav();
    bindLogout();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

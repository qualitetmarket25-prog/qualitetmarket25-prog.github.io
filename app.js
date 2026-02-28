(() => {
  "use strict";

  // ===============================
  // HELPERS
  // ===============================
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ===============================
  // PLAN (single source of truth)
  // ===============================
  function normalizePlan(raw) {
    const s = String(raw ?? "").trim();
    const u = s.toUpperCase();
    const l = s.toLowerCase();

    if (u === "ELITE" || l === "elite") return "elite";
    if (u === "PRO" || u === "PREMIUM" || l === "pro" || l === "premium") return "pro";
    if (u === "BASIC" || u === "FREE" || u === "GUEST" || l === "basic" || l === "free" || l === "guest" || !s) return "basic";
    return "basic";
  }

  function readPlan() {
    const keys = ["qm_plan", "qm_plan_v1", "status", "plan", "zsz_plan"];
    for (const k of keys) {
      const val = localStorage.getItem(k);
      if (!val) continue;
      try {
        return normalizePlan(JSON.parse(val));
      } catch {
        return normalizePlan(val);
      }
    }
    return "basic";
  }

  function writePlan(plan) {
    const p = normalizePlan(plan);

    localStorage.setItem("qm_plan", p);
    localStorage.setItem("qm_plan_v1", JSON.stringify(p));
    localStorage.setItem("status", p.toUpperCase());
    localStorage.setItem("plan", p.toUpperCase());

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
    return rank[cur] >= rank[req];
  }

  function isElite() {
    return getPlan() === "elite";
  }

  function isLogged() {
    return localStorage.getItem("is_logged_in") === "true";
  }

  // ===============================
  // UI RENDER
  // ===============================
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

  // ===============================
  // NAV MOBILE
  // ===============================
  function bindMobileNav() {
    const root = $("[data-nav-root]");
    const btn = $("[data-nav-toggle]");
    const links = $("[data-nav-links]");
    if (!root || !btn || !links) return;

    const close = () => {
      root.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
    };

    const toggle = () => {
      const open = root.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    };

    btn.addEventListener("click", toggle);
    links.addEventListener("click", e => {
      if (e.target.tagName === "A") close();
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") close();
    });
  }

  // ===============================
  // LOGOUT
  // ===============================
  function bindLogout() {
    $$("[data-logout]").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        localStorage.setItem("is_logged_in", "false");
        location.href = "index.html";
      });
    });
  }

  // ===============================
  // BOOT
  // ===============================
  function boot() {
    window.QM = {
      getPlan,
      setPlan,
      hasAtLeast,
      isElite,
      isLogged
    };

    renderPlanBadge();
    renderAuthUI();
    bindMobileNav();
    bindLogout();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();

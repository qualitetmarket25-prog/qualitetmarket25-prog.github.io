(() => {
  "use strict";

  // ---------------------------
  // helpers
  // ---------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------------------------
  // PLAN (single source of truth)
  // Canon: qm_plan = "basic" | "pro" | "elite"
  // Compat: qm_plan_v1 (JSON), status/plan (uppercase), proStatus (true)
  // ---------------------------
  function normalizePlan(raw) {
    const s = String(raw ?? "").trim();
    const u = s.toUpperCase();
    const l = s.toLowerCase();

    if (u === "ELITE" || l === "elite") return "elite";
    if (u === "PRO" || u === "PREMIUM" || l === "pro" || l === "premium") return "pro";
    if (u === "BASIC" || u === "FREE" || u === "GUEST" || l === "basic" || l === "free" || l === "guest" || !s) return "basic";
    return "basic";
  }

  function readPlanAny() {
    const qm = localStorage.getItem("qm_plan");
    if (qm) return normalizePlan(qm);

    const rawV1 = localStorage.getItem("qm_plan_v1");
    if (rawV1) {
      try { return normalizePlan(JSON.parse(rawV1)); } catch { return normalizePlan(rawV1); }
    }

    const status = localStorage.getItem("status");
    if (status) return normalizePlan(status);

    const plan = localStorage.getItem("plan");
    if (plan) return normalizePlan(plan);

    const zsz = localStorage.getItem("zsz_plan");
    if (zsz) return normalizePlan(zsz);

    return "basic";
  }

  function writePlanAll(planLower) {
    const p = normalizePlan(planLower);

    localStorage.setItem("qm_plan", p);
    localStorage.setItem("qm_plan_v1", JSON.stringify(p));
    localStorage.setItem("status", p.toUpperCase());
    localStorage.setItem("plan", p.toUpperCase());

    if (p === "pro" || p === "elite") localStorage.setItem("proStatus", "true");
    else localStorage.removeItem("proStatus");

    return p;
  }

  function qmGetPlan() {
    const p = readPlanAny();
    return writePlanAll(p); // sync to avoid split-brain
  }

  function qmSetPlan(planLower) {
    return writePlanAll(planLower);
  }

  function qmHasAtLeast(required) {
    const rank = { basic: 0, pro: 1, elite: 2 };
    const cur = qmGetPlan();
    const req = normalizePlan(required);
    return (rank[cur] ?? 0) >= (rank[req] ?? 0);
  }

  function qmIsElite() {
    return qmGetPlan() === "elite";
  }

  // ---------------------------
  // AUTH (UI-level)
  // ---------------------------
  function isLogged() {
    return localStorage.getItem("is_logged_in") === "true";
  }

  function renderAuthUI() {
    const logged = isLogged();
    $$("[data-guest-only]").forEach(el => (el.style.display = logged ? "none" : ""));
    $$("[data-auth-only]").forEach(el => (el.style.display = logged ? "" : "none"));

    const label = $("[data-auth-label]");
    if (label) label.textContent = logged ? "Zalogowany" : "Gość";
  }

  // ---------------------------
  // BADGES
  // ---------------------------
  function renderPlanBadge() {
    const plan = qmGetPlan();
    const text = plan.toUpperCase();

    const badge1 = $("#planBadge");
    if (badge1) badge1.textContent = `PLAN: ${text}`;

    $$("[data-qm-plan]").forEach(el => {
      el.textContent = text;
      el.dataset.plan = plan;
    });
  }

  // ---------------------------
  // NAV (mobile)
  // expects:
  //  [data-nav-root], [data-nav-toggle], [data-nav-links]
  // ---------------------------
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
    links.addEventListener("click", (e) => {
      if (e.target && e.target.tagName === "A") close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  // ---------------------------
  // LOGOUT
  // ---------------------------
  function bindLogout() {
    $$("[data-logout]").forEach(el => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.setItem("is_logged_in", "false");
        // nie resetuj planu automatycznie, bo demo bywa różne — ale możesz jeśli chcesz:
        // qmSetPlan("basic");
        location.href = "index.html";
      });
    });
  }

  // ---------------------------
  // BOOT
  // ---------------------------
  function boot() {
    // expose API
    window.QM = window.QM || {};
    window.QM.getPlan = qmGetPlan;
    window.QM.setPlan = qmSetPlan;
    window.QM.hasAtLeast = qmHasAtLeast;
    window.QM.isElite = qmIsElite;
    window.QM.isLogged = isLogged;

    renderAuthUI();
    renderPlanBadge();
    bindMobileNav();
    bindLogout();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

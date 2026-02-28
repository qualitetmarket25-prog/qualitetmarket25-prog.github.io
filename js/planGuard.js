// js/planGuard.js
// Guard v3 — QualitetMarket / Zarabianie u Szefa (GitHub Pages)
// - canonical plan key: qm_plan_v1 = "basic" | "pro" | "elite"
// - backward compat: status = "BASIC" | "PRO" | "ELITE"
// - optional expiry: plan_expires_at (ISO string)
// - page guard: <body data-require="pro|elite|login">
// - UX lock: disables elements requiring elite via [data-require-btn="elite"] or [data-require="elite"]
(function () {
  "use strict";

  // ---------- helpers ----------
  const safeJsonParse = (v, fallback) => {
    try { return JSON.parse(v); } catch { return fallback; }
  };

  const upper = (s) => String(s || "").toUpperCase();
  const lower = (s) => String(s || "").toLowerCase();

  const planRank = (p) => {
    p = lower(p);
    if (p === "elite") return 2;
    if (p === "pro") return 1;
    return 0; // basic/unknown
  };

  // ---------- plan storage (canonical + compat) ----------
  function readPlanCanonical() {
    // canonical: qm_plan_v1 stored sometimes as JSON string ("pro") or raw string
    const raw = localStorage.getItem("qm_plan_v1");
    const v = safeJsonParse(raw, raw);
    const p = lower(v || "");
    if (p === "pro" || p === "elite" || p === "basic") return p;
    return null;
  }

  function readPlanLegacy() {
    // legacy: status = BASIC/PRO/ELITE
    const s = upper(localStorage.getItem("status"));
    if (s === "PRO") return "pro";
    if (s === "ELITE") return "elite";
    if (s === "BASIC") return "basic";
    return null;
  }

  function writePlan(p) {
    p = lower(p);
    if (p !== "basic" && p !== "pro" && p !== "elite") p = "basic";
    localStorage.setItem("qm_plan_v1", JSON.stringify(p));
    localStorage.setItem("status", upper(p)); // keep compat for older pages
  }

  // ---------- expiry ----------
  function enforceExpiry() {
    const expiresAt = localStorage.getItem("plan_expires_at");
    if (!expiresAt) return;

    const exp = new Date(expiresAt);
    if (Number.isNaN(exp.getTime())) return; // invalid date -> ignore

    const now = new Date();
    if (now > exp) {
      // expire -> downgrade
      localStorage.removeItem("plan_expires_at");
      writePlan("basic");
    }
  }

  // ---------- resolve current plan ----------
  enforceExpiry();

  let plan = readPlanCanonical() || readPlanLegacy() || "basic";

  // normalize + sync both storages to avoid split-brain
  writePlan(plan);
  plan = readPlanCanonical() || "basic";

  // ---------- auth ----------
  const isLogged = localStorage.getItem("is_logged_in") === "true";

  // ---------- page requirement ----------
  const requireType = lower(document.body?.dataset?.require || "");

  if (requireType === "login" && !isLogged) {
    window.location.href = "./login.html";
    return;
  }

  if (requireType === "pro") {
    if (planRank(plan) < planRank("pro")) {
      window.location.href = "./cennik.html";
      return;
    }
  }

  if (requireType === "elite") {
    if (planRank(plan) < planRank("elite")) {
      window.location.href = "./cennik.html";
      return;
    }
  }

  // ---------- UX lock: disable non-allowed controls ----------
  // Supports:
  // 1) data-require-btn="elite|pro|login"
  // 2) data-require="elite|pro" on buttons/links/sections
  function disableIfNotAllowed(el, need) {
    need = lower(need);
    if (!need) return;

    // login requirement on element (optional)
    if (need === "login" && !isLogged) {
      lock(el, "Wymaga logowania");
      return;
    }

    if (need === "pro" && planRank(plan) < planRank("pro")) {
      lock(el, "Wymaga planu PRO");
      return;
    }

    if (need === "elite" && planRank(plan) < planRank("elite")) {
      lock(el, "Wymaga planu ELITE");
      return;
    }
  }

  function lock(el, reason) {
    // Buttons
    if (el.tagName === "BUTTON" || el.getAttribute("role") === "button" || el.hasAttribute("data-action")) {
      el.disabled = true;
      el.classList.add("is-disabled");
      el.title = reason;
      return;
    }

    // Links: prevent navigation
    if (el.tagName === "A") {
      el.classList.add("is-disabled");
      el.setAttribute("aria-disabled", "true");
      el.title = reason;
      el.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "./cennik.html";
      });
      return;
    }

    // Generic elements: visually dim + block pointer
    el.classList.add("is-disabled");
    el.style.pointerEvents = "none";
    el.style.opacity = "0.55";
    el.title = reason;
  }

  // scan on DOMContentLoaded (works even if script is in <head>)
  document.addEventListener("DOMContentLoaded", () => {
    // badge (optional)
    const badge = document.getElementById("planBadge");
    if (badge) badge.textContent = `PLAN: ${upper(plan)}`;

    // apply auth-only / guest-only if used
    document.querySelectorAll("[data-guest-only]").forEach(el => (el.style.display = isLogged ? "none" : ""));
    document.querySelectorAll("[data-auth-only]").forEach(el => (el.style.display = isLogged ? "" : "none"));

    // disable elements by required plan
    document.querySelectorAll("[data-require-btn]").forEach(el => disableIfNotAllowed(el, el.getAttribute("data-require-btn")));
    document.querySelectorAll("[data-require]").forEach(el => {
      // don't treat <body data-require> again
      if (el === document.body) return;
      disableIfNotAllowed(el, el.getAttribute("data-require"));
    });
  });

  // expose minimal debug API
  window.QM_GUARD = {
    plan,
    isLogged,
    setPlan: (p) => writePlan(p),
    expire: () => { localStorage.setItem("plan_expires_at", new Date(Date.now() - 1000).toISOString()); enforceExpiry(); }
  };
})();

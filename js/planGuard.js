// js/planGuard.js
// Guard v4 — QualitetMarket / Zarabianie u Szefa (GitHub Pages)
// SOURCE OF TRUTH: qm_plan = "basic" | "pro" | "elite"
// Compat: qm_plan_v1 (JSON "pro"), status = "BASIC|PRO|ELITE", plan = "PRO|ELITE|BASIC"
// Expiry: plan_expires_at (ISO)
// Page guard: <body data-require="pro|elite|login">
// UX lock: [data-require-btn], [data-require] on elements (excluding <body>)
(function () {
  "use strict";

  // ---------- helpers ----------
  const safeJsonParse = (v, fallback) => { try { return JSON.parse(v); } catch { return fallback; } };
  const upper = (s) => String(s || "").toUpperCase();
  const lower = (s) => String(s || "").toLowerCase().trim();

  const planRank = (p) => {
    p = lower(p);
    if (p === "elite") return 2;
    if (p === "pro") return 1;
    return 0; // basic/unknown
  };

  function normalizePlan(raw) {
    const p = lower(raw);
    if (p === "elite") return "elite";
    if (p === "pro" || p === "premium") return "pro";
    if (p === "basic" || p === "free" || p === "guest" || !p) return "basic";

    // tolerate uppercase legacy inputs
    const u = upper(raw);
    if (u === "ELITE") return "elite";
    if (u === "PRO") return "pro";
    if (u === "BASIC") return "basic";

    return "basic";
  }

  // ---------- read plan from multiple keys (prefer qm_plan) ----------
  function readPlanAny() {
    // 1) canonical: qm_plan (raw string)
    const qmPlan = localStorage.getItem("qm_plan");
    if (qmPlan) return normalizePlan(qmPlan);

    // 2) canonical v1: qm_plan_v1 (sometimes JSON)
    const rawV1 = localStorage.getItem("qm_plan_v1");
    const v1 = safeJsonParse(rawV1, rawV1);
    if (v1) return normalizePlan(v1);

    // 3) legacy: status BASIC/PRO/ELITE
    const status = localStorage.getItem("status");
    if (status) return normalizePlan(status);

    // 4) other legacy keys
    const plan = localStorage.getItem("plan");
    if (plan) return normalizePlan(plan);

    return "basic";
  }

  // ---------- write plan to all keys (sync) ----------
  function writePlanAll(p) {
    p = normalizePlan(p);

    // source of truth
    localStorage.setItem("qm_plan", p);

    // v1 compat
    localStorage.setItem("qm_plan_v1", JSON.stringify(p));

    // legacy compat (uppercase)
    localStorage.setItem("status", upper(p));
    localStorage.setItem("plan", upper(p));

    // legacy pro flag used in some pages
    if (p === "pro" || p === "elite") localStorage.setItem("proStatus", "true");
    else localStorage.removeItem("proStatus");

    return p;
  }

  // ---------- expiry ----------
  function enforceExpiry() {
    const expiresAt = localStorage.getItem("plan_expires_at");
    if (!expiresAt) return;

    const exp = new Date(expiresAt);
    if (Number.isNaN(exp.getTime())) return;

    if (new Date() > exp) {
      localStorage.removeItem("plan_expires_at");
      writePlanAll("basic");
    }
  }

  // ---------- resolve current plan ----------
  enforceExpiry();
  let plan = readPlanAny();
  plan = writePlanAll(plan); // normalize + sync to avoid split-brain

  // ---------- auth ----------
  const isLogged = localStorage.getItem("is_logged_in") === "true";

  // ---------- page requirement ----------
  const requireType = lower(document.body?.dataset?.require || "");

  if (requireType === "login" && !isLogged) {
    window.location.href = "./login.html";
    return;
  }

  if (requireType === "pro" && planRank(plan) < planRank("pro")) {
    window.location.href = "./cennik.html";
    return;
  }

  if (requireType === "elite" && planRank(plan) < planRank("elite")) {
    window.location.href = "./cennik.html";
    return;
  }

  // ---------- UX lock ----------
  function lock(el, reason) {
    // Buttons / inputs
    if (el.tagName === "BUTTON" || el.matches("input,select,textarea") || el.getAttribute("role") === "button" || el.hasAttribute("data-action")) {
      el.disabled = true;
      el.classList.add("is-disabled");
      el.title = reason;
      return;
    }

    // Links
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

    // Generic
    el.classList.add("is-disabled");
    el.style.pointerEvents = "none";
    el.style.opacity = "0.55";
    el.title = reason;
  }

  function disableIfNotAllowed(el, need) {
    need = lower(need);
    if (!need) return;

    if (need === "login" && !isLogged) return lock(el, "Wymaga logowania");
    if (need === "pro" && planRank(plan) < planRank("pro")) return lock(el, "Wymaga planu PRO");
    if (need === "elite" && planRank(plan) < planRank("elite")) return lock(el, "Wymaga planu ELITE");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const badge = document.getElementById("planBadge");
    if (badge) badge.textContent = `PLAN: ${upper(plan)}`;

    document.querySelectorAll("[data-guest-only]").forEach(el => (el.style.display = isLogged ? "none" : ""));
    document.querySelectorAll("[data-auth-only]").forEach(el => (el.style.display = isLogged ? "" : "none"));

    document.querySelectorAll("[data-require-btn]").forEach(el => disableIfNotAllowed(el, el.getAttribute("data-require-btn")));
    document.querySelectorAll("[data-require]").forEach(el => {
      if (el === document.body) return;
      disableIfNotAllowed(el, el.getAttribute("data-require"));
    });
  });

  // debug API
  window.QM_GUARD = {
    get plan() { return plan; },
    isLogged,
    setPlan: (p) => { plan = writePlanAll(p); return plan; },
    expire: () => {
      localStorage.setItem("plan_expires_at", new Date(Date.now() - 1000).toISOString());
      enforceExpiry();
      plan = readPlanAny();
      plan = writePlanAll(plan);
      return plan;
    }
  };
})();

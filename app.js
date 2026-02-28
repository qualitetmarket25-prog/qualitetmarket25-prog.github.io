(() => {
  "use strict";

  // ===== helpers =====
  const $ = (sel, root = document) => root.querySelector(sel);

  // ===== auth (UI only) =====
  try {
    const logged = localStorage.getItem("is_logged_in") === "true";
    document.querySelectorAll("[data-guest-only]").forEach(el => (el.style.display = logged ? "none" : ""));
    document.querySelectorAll("[data-auth-only]").forEach(el => (el.style.display = logged ? "" : "none"));
  } catch {}

  // ===== plan badge (unified) =====
  function getPlanRaw() {
    // najważniejszy u Ciebie jest "status" (BASIC/PRO/ELITE)
    return (
      localStorage.getItem("status") ||
      localStorage.getItem("qm_plan_v1") ||
      localStorage.getItem("qm_plan") ||
      localStorage.getItem("zsz_plan") ||
      localStorage.getItem("plan") ||
      "BASIC"
    );
  }

  function normalizePlan(p) {
    const x = String(p || "").trim().toUpperCase();
    if (x === "ELITE") return "ELITE";
    if (x === "PRO") return "PRO";
    return "BASIC";
  }

  function renderPlanBadge() {
    const plan = normalizePlan(getPlanRaw());
    const badge = $("#planBadge");
    if (badge) badge.textContent = `PLAN: ${plan}`;
    document.documentElement.dataset.plan = plan.toLowerCase();
    return plan;
  }

  // expose (czasem przydaje się w innych plikach)
  window.qmGetPlan = () => normalizePlan(getPlanRaw());
  window.qmIsElite = () => window.qmGetPlan() === "ELITE";

  // ===== mobile nav (if using data-nav-*) =====
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

  // ===== optional: SW register (safe) =====
  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    // nie wywalaj błędów jeśli pliku nie ma
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }

  // ===== init =====
  document.addEventListener("DOMContentLoaded", () => {
    renderPlanBadge();
    bindMobileNav();
    registerSW();
  });
})();

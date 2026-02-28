/* planGuard.js — Qualitet / Zarabianie u Szefa
   Dostęp: localStorage.status = BASIC | PRO | ELITE
   Login:  localStorage.is_logged_in = "true"
   Expiry: localStorage.plan_expires_at = ISO (opcjonalnie)
*/
(function () {
  const PLAN_KEY = "status";
  const LOGIN_KEY = "is_logged_in";
  const EXP_KEY = "plan_expires_at";

  const PLAN_ORDER = { BASIC: 0, PRO: 1, ELITE: 2 };

  function normPlan(p) {
    p = (p || "BASIC").toUpperCase();
    return (p === "PRO" || p === "ELITE") ? p : "BASIC";
  }

  function isExpired() {
    const exp = localStorage.getItem(EXP_KEY);
    if (!exp) return false;
    const t = Date.parse(exp);
    if (!isFinite(t)) return false;
    return Date.now() > t;
  }

  function getPlan() {
    // jeśli plan wygasł — cofamy na BASIC
    if (isExpired()) {
      localStorage.setItem(PLAN_KEY, "BASIC");
      return "BASIC";
    }
    return normPlan(localStorage.getItem(PLAN_KEY));
  }

  function isLoggedIn() {
    return localStorage.getItem(LOGIN_KEY) === "true";
  }

  function requiredLevel(require) {
    const r = (require || "").toLowerCase().trim();
    if (r === "elite") return "ELITE";
    if (r === "pro") return "PRO";
    if (r === "basic") return "BASIC";
    if (r === "login") return "LOGIN";
    return null;
  }

  function hasAccess(plan, required) {
    if (!required || required === "LOGIN") return true;
    return PLAN_ORDER[plan] >= PLAN_ORDER[required];
  }

  function redirect(page) {
    window.location.href = page;
  }

  function renderBadge(plan) {
    const el = document.getElementById("planBadge");
    if (el) el.textContent = plan;

    const proBadge = document.querySelector("[data-pro-badge]");
    if (proBadge) proBadge.textContent = plan;

    const qmPlan = document.querySelector("[data-qm-plan]");
    if (qmPlan) qmPlan.textContent = plan;
  }

  function toggleLinks(selectors, show) {
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(a => {
        a.style.display = show ? "" : "none";
      });
    });
  }

  function hideLinksByPlan(plan) {
    // PRO+
    toggleLinks(
      ['a[href="qualitetmarket.html"]','a[href="/qualitetmarket.html"]','a[href="hurtownie.html"]','a[href="/hurtownie.html"]'],
      PLAN_ORDER[plan] >= PLAN_ORDER.PRO
    );

    // ELITE
    toggleLinks(
      ['a[href="intelligence.html"]','a[href="/intelligence.html"]','a[href="blueprints.html"]','a[href="/blueprints.html"]'],
      PLAN_ORDER[plan] >= PLAN_ORDER.ELITE
    );
  }

  function gatePage() {
    const plan = getPlan();
    renderBadge(plan);
    hideLinksByPlan(plan);

    const requireAttr = document.body.getAttribute("data-require");
    if (!requireAttr) return;

    const required = requiredLevel(requireAttr);

    // każda strona wymagająca czegokolwiek -> musi być login
    if (required && required !== null) {
      if (!isLoggedIn()) redirect("login.html");
    }

    // login-only (dashboard)
    if (required === "LOGIN") return;

    // plan gating
    if (!hasAccess(plan, required)) redirect("cennik.html");
  }

  document.addEventListener("DOMContentLoaded", gatePage);

  // Debug API
  window.QualitetGuard = {
    getPlan,
    isLoggedIn,
    setLogin(flag) { localStorage.setItem(LOGIN_KEY, flag ? "true" : "false"); },
    setPlan(p) { localStorage.setItem(PLAN_KEY, normPlan(p)); }
  };
})();

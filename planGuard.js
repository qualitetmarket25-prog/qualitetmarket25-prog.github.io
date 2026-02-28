/* planGuard.js — Qualitet / Zarabianie u Szefa
   Sterowanie dostępem planów + lekkie “auth” pod demo (localStorage)

   Plan:
   - localStorage.status: BASIC | PRO | ELITE
   Login (opcjonalnie):
   - localStorage.is_logged_in: "true"
*/

(function () {
  const PLAN_KEY = "status";
  const LOGIN_KEY = "is_logged_in";

  const PLAN_ORDER = { BASIC: 0, PRO: 1, ELITE: 2 };

  function normPlan(p) {
    p = (p || "BASIC").toUpperCase();
    return (p === "PRO" || p === "ELITE") ? p : "BASIC";
  }

  function getPlan() {
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
    return null; // brak wymagań
  }

  function hasAccess(plan, required) {
    if (!required) return true;
    return PLAN_ORDER[plan] >= PLAN_ORDER[required];
  }

  function redirect(url) {
    window.location.href = url;
  }

  function renderBadge(plan) {
    const el = document.getElementById("planBadge");
    if (!el) return;
    el.textContent = plan;
  }

  function hideLinksByPlan(plan) {
    // Hurtownie tylko PRO+
    const hurt = document.querySelector('a[href="hurtownie.html"], a[href="/hurtownie.html"]');
    if (hurt) {
      if (PLAN_ORDER[plan] < PLAN_ORDER.PRO) {
        hurt.style.display = "none";
      } else {
        hurt.style.display = "";
      }
    }

    // QualitetMarket tylko PRO+
    const qm = document.querySelector('a[href="qualitetmarket.html"], a[href="/qualitetmarket.html"]');
    if (qm) {
      if (PLAN_ORDER[plan] < PLAN_ORDER.PRO) {
        qm.style.display = "none";
      } else {
        qm.style.display = "";
      }
    }

    // Intelligence + Blueprints tylko ELITE (jeśli tak chcesz)
    const intel = document.querySelector('a[href="intelligence.html"], a[href="/intelligence.html"]');
    if (intel) {
      if (PLAN_ORDER[plan] < PLAN_ORDER.ELITE) intel.style.display = "none";
      else intel.style.display = "";
    }

    const blue = document.querySelector('a[href="blueprints.html"], a[href="/blueprints.html"]');
    if (blue) {
      if (PLAN_ORDER[plan] < PLAN_ORDER.ELITE) blue.style.display = "none";
      else blue.style.display = "";
    }
  }

  function gatePage() {
    const plan = getPlan();
    renderBadge(plan);
    hideLinksByPlan(plan);

    const requireAttr = document.body.getAttribute("data-require"); // pro | elite | login
    if (!requireAttr) return;

    const req = requireAttr.toLowerCase().trim();

    // Wymagane logowanie (opcjonalne)
    if (req === "login") {
      if (!isLoggedIn()) redirect("login.html");
      return;
    }

    // Wymagany plan
    const required = requiredLevel(req);
    if (!hasAccess(plan, required)) {
      redirect("cennik.html");
    }
  }

  document.addEventListener("DOMContentLoaded", gatePage);

  // Mini API pod debug/sterowanie
  window.QualitetGuard = {
    getPlan,
    isLoggedIn,
    setLogin(flag) { localStorage.setItem(LOGIN_KEY, flag ? "true" : "false"); },
    setPlan(p) { localStorage.setItem(PLAN_KEY, normPlan(p)); }
  };
})();

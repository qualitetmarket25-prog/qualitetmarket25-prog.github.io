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

  // Ustal bazę dla redirectów (działa też gdy otworzysz /folder/strona.html)
  function basePath() {
    const p = window.location.pathname;
    // jeśli /something.html -> zwróć katalog
    return p.slice(0, p.lastIndexOf("/") + 1);
  }

  function urlTo(page) {
    // jeśli masz repo GitHub Pages, to i tak bazą jest / (zwykle /)
    // ale gdy wejdzie z podkatalogu, to to trzyma spójność
    return basePath() + page;
  }

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

  function redirect(page) {
    window.location.href = urlTo(page);
  }

  function renderBadge(plan) {
    // Obsługa obu wariantów: id="planBadge" lub data-pro-badge / data-qm-plan
    const byId = document.getElementById("planBadge");
    if (byId) byId.textContent = plan;

    const proBadge = document.querySelector("[data-pro-badge]");
    if (proBadge) proBadge.textContent = plan;

    const qmPlan = document.querySelector("[data-qm-plan]");
    if (qmPlan) qmPlan.textContent = plan;
  }

  function toggleLinks(selectorList, show) {
    selectorList.forEach(sel => {
      document.querySelectorAll(sel).forEach(a => {
        a.style.display = show ? "" : "none";
        a.setAttribute("aria-hidden", show ? "false" : "true");
      });
    });
  }

  function hideLinksByPlan(plan) {
    // Hurtownie tylko PRO+
    toggleLinks(
      ['a[href="hurtownie.html"]', 'a[href="/hurtownie.html"]'],
      PLAN_ORDER[plan] >= PLAN_ORDER.PRO
    );

    // QualitetMarket tylko PRO+
    toggleLinks(
      ['a[href="qualitetmarket.html"]', 'a[href="/qualitetmarket.html"]'],
      PLAN_ORDER[plan] >= PLAN_ORDER.PRO
    );

    // Intelligence + Blueprints tylko ELITE (zostawiam tak jak masz)
    toggleLinks(
      ['a[href="intelligence.html"]', 'a[href="/intelligence.html"]'],
      PLAN_ORDER[plan] >= PLAN_ORDER.ELITE
    );

    toggleLinks(
      ['a[href="blueprints.html"]', 'a[href="/blueprints.html"]'],
      PLAN_ORDER[plan] >= PLAN_ORDER.ELITE
    );
  }

  function gatePage() {
    const plan = getPlan();
    renderBadge(plan);
    hideLinksByPlan(plan);

    const requireAttr = document.body.getAttribute("data-require"); // basic|pro|elite|login
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

  // Mini API pod debug/sterowanie (zostawiam)
  window.QualitetGuard = {
    getPlan,
    isLoggedIn,
    setLogin(flag) { localStorage.setItem(LOGIN_KEY, flag ? "true" : "false"); },
    setPlan(p) { localStorage.setItem(PLAN_KEY, normPlan(p)); }
  };
})();

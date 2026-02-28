/* app.js — Qualitet / Zarabianie u Szefa (ROOT)
   - badge planu
   - pomocnicze API dla planGuard
*/

(function () {
  const LS_PLAN_KEY = "status"; // BASIC/PRO/ELITE
  const LS_PAID_AT = "paid_at";

  function normalizePlan(p) {
    p = (p || "BASIC").toUpperCase();
    return (p === "PRO" || p === "ELITE") ? p : "BASIC";
  }

  function getPlan() {
    return normalizePlan(localStorage.getItem(LS_PLAN_KEY));
  }

  function setPlan(plan) {
    const p = normalizePlan(plan);
    localStorage.setItem(LS_PLAN_KEY, p);

    if (p === "PRO" || p === "ELITE") {
      if (!localStorage.getItem(LS_PAID_AT)) {
        localStorage.setItem(LS_PAID_AT, new Date().toISOString());
      }
    } else {
      localStorage.removeItem(LS_PAID_AT);
    }

    renderPlanBadges();
  }

  function renderPlanBadges() {
    const plan = getPlan();

    // index.html
    const planBadge = document.getElementById("planBadge");
    if (planBadge) {
      planBadge.textContent = plan;
    }

    // inne strony
    document.querySelectorAll("[data-pro-badge],[data-qm-plan]").forEach((el) => {
      el.textContent = plan;
    });
  }

  // DEV: szybkie ustawienie planu przez URL: ?setplan=PRO/ELITE/BASIC
  function devPlanFromUrl() {
    const url = new URL(location.href);
    const p = (url.searchParams.get("setplan") || "").toUpperCase();
    if (p === "PRO" || p === "ELITE" || p === "BASIC") {
      setPlan(p);
      url.searchParams.delete("setplan");
      history.replaceState({}, "", url.toString());
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    devPlanFromUrl();
    renderPlanBadges();
  });

  // udostępniamy do planGuard.js
  window.QualitetApp = { getPlan, setPlan, renderPlanBadges };
})();

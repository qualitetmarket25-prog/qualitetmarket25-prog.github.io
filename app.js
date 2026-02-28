/* QualitetMarket / Zarabianie u Szefa - app.js (root)
   - badge planu (BASIC/PRO/ELITE)
   - prosty logout
   - helpery dla planGuard
*/

(function () {
  const LS_PLAN_KEY = "status"; // BASIC/PRO/ELITE
  const LS_PAID_AT = "paid_at";

  function getPlan() {
    const p = (localStorage.getItem(LS_PLAN_KEY) || "BASIC").toUpperCase();
    if (p !== "PRO" && p !== "ELITE" && p !== "BASIC") return "BASIC";
    return p;
  }

  function setPlan(plan) {
    const p = (plan || "BASIC").toUpperCase();
    localStorage.setItem(LS_PLAN_KEY, (p === "PRO" || p === "ELITE") ? p : "BASIC");
    if (p === "PRO" || p === "ELITE") {
      if (!localStorage.getItem(LS_PAID_AT)) localStorage.setItem(LS_PAID_AT, new Date().toISOString());
    } else {
      localStorage.removeItem(LS_PAID_AT);
    }
  }

  function renderPlanBadges() {
    const plan = getPlan();

    // 1) index.html ma #planBadge
    const planBadge = document.getElementById("planBadge");
    if (planBadge) {
      planBadge.textContent = plan;
      planBadge.classList.remove("is-basic", "is-pro", "is-elite");
      planBadge.classList.add(plan === "ELITE" ? "is-elite" : plan === "PRO" ? "is-pro" : "is-basic");
    }

    // 2) inne strony mogą mieć [data-pro-badge] lub [data-qm-plan]
    document.querySelectorAll("[data-pro-badge],[data-qm-plan]").forEach((el) => {
      el.textContent = plan;
    });

    // 3) opcjonalnie ukryj link Hurtownie dla BASIC (jeśli chcesz)
    const hurtLink = document.getElementById("hurtownieLink");
    if (hurtLink) {
      hurtLink.style.opacity = (plan === "BASIC") ? "0.6" : "1";
    }
  }

  function attachLogout() {
    // Jeśli masz przycisk/element z data-logout – zadziała automatycznie
    const btns = document.querySelectorAll("[data-logout]");
    if (!btns.length) return;

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // nie kasujemy planu, tylko "logout" – jeśli kiedyś dodasz login
        localStorage.removeItem("user_email");
        localStorage.removeItem("is_logged_in");
        location.href = "index.html";
      });
    });
  }

  // Debug: szybka zmiana planu przez URL (opcjonalne)
  // np. /index.html?setplan=PRO
  function devPlanFromUrl() {
    const url = new URL(location.href);
    const setplan = (url.searchParams.get("setplan") || "").toUpperCase();
    if (setplan === "PRO" || setplan === "ELITE" || setplan === "BASIC") {
      setPlan(setplan);
      url.searchParams.delete("setplan");
      history.replaceState({}, "", url.toString());
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    devPlanFromUrl();
    renderPlanBadges();
    attachLogout();
  });

  // Udostępnij minimalne API dla innych skryptów (np. planGuard.js)
  window.QualitetApp = {
    getPlan,
    setPlan,
    renderPlanBadges
  };
})();

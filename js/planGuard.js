/* planGuard.js — Qualitet / Zarabianie u Szefa
   Źródło prawdy: localStorage.status = BASIC | PRO | ELITE
   Login:          localStorage.is_logged_in = "true"
   Expiry:         localStorage.plan_expires_at = ISO (opcjonalnie)

   HOTFIX:
   - migruje stare klucze: plan, qm_plan -> status
   - zapamiętuje ostatni PRO/ELITE i przywraca, jeśli coś zepchnie do BASIC
*/
(function () {
  const PLAN_KEY = "status";
  const LOGIN_KEY = "is_logged_in";
  const EXP_KEY = "plan_expires_at";
  const LAST_KEY = "last_paid_plan"; // trzymamy ostatni PRO/ELITE

  const LEGACY_KEYS = ["plan", "qm_plan"]; // stare wersje

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

  // 1) Migracja: jeśli status nie istnieje, a stare klucze mają PRO/ELITE -> kopiuj do status
  function migrateLegacyPlan() {
    const current = localStorage.getItem(PLAN_KEY);
    if (current) return;

    for (const k of LEGACY_KEYS) {
      const v = normPlan(localStorage.getItem(k));
      if (v === "PRO" || v === "ELITE") {
        localStorage.setItem(PLAN_KEY, v);
        localStorage.setItem(LAST_KEY, v);
        return;
      }
    }
    // jak nic nie ma, ustaw BASIC jako default
    localStorage.setItem(PLAN_KEY, "BASIC");
  }

  // 2) Ochrona: jeśli ktoś zepchnął status do BASIC, a last_paid_plan było PRO/ELITE -> przywróć
  function restoreIfDowngraded() {
    if (isExpired()) {
      localStorage.setItem(PLAN_KEY, "BASIC");
      return;
    }
    const plan = normPlan(localStorage.getItem(PLAN_KEY));
    const last = normPlan(localStorage.getItem(LAST_KEY));

    if (plan === "BASIC" && (last === "PRO" || last === "ELITE")) {
      localStorage.setItem(PLAN_KEY, last);
    }

    // jeśli jest PRO/ELITE, zapisuj jako last
    const now = normPlan(localStorage.getItem(PLAN_KEY));
    if (now === "PRO" || now === "ELITE") localStorage.setItem(LAST_KEY, now);

    // opcjonalnie: utrzymuj kompatybilność wstecz (żeby stare skrypty nie mieszały)
    LEGACY_KEYS.forEach(k => localStorage.setItem(k, now));
  }

  function getPlan() {
    migrateLegacyPlan();
    restoreIfDowngraded();
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

    // kompatybilność: jeśli gdzieś masz inne znaczniki
    const qmPlan = document.querySelector("[data-qm-plan]");
    if (qmPlan) qmPlan.textContent = plan;

    const proBadge = document.querySelector("[data-pro-badge]");
    if (proBadge) proBadge.textContent = plan;
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

    // jeśli strona ma wymagania (login/pro/elite) -> wymagaj login
    if (required && !isLoggedIn()) redirect("login.html");

    // login-only
    if (required === "LOGIN") return;

    // plan gating
    if (!hasAccess(plan, required)) redirect("cennik.html");
  }

  document.addEventListener("DOMContentLoaded", gatePage);

  window.QualitetGuard = {
    getPlan,
    isLoggedIn,
    setLogin(flag) { localStorage.setItem(LOGIN_KEY, flag ? "true" : "false"); },
    setPlan(p) { localStorage.setItem(PLAN_KEY, normPlan(p)); localStorage.setItem(LAST_KEY, normPlan(p)); }
  };
})();

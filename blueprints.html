// ===== PLAN GUARD SYSTEM =====
// Zarabianie u Szefa × QualitetMarket

(function () {

  const DEFAULT_PLAN = "BASIC";
  const plan = localStorage.getItem("plan") || DEFAULT_PLAN;

  // ===== USTAW BADGE + KPI =====
  function applyPlanUI() {

    const badge = document.getElementById("planBadge");
    const currentPlan = document.getElementById("currentPlan");
    const moduleAccess = document.getElementById("moduleAccess");

    if (badge) {
      badge.innerHTML = `<span class="badge">${plan}</span>`;
    }

    if (currentPlan) {
      currentPlan.innerText = plan;
    }

    if (moduleAccess) {
      if (plan === "BASIC") moduleAccess.innerText = "Ograniczone";
      if (plan === "PRO") moduleAccess.innerText = "Pełny dostęp";
      if (plan === "ELITE") moduleAccess.innerText = "Pełny + Premium";
    }
  }

  // ===== BLOKADA MODUŁU HURTOWNIE =====
  function guardHurtownie() {

    const hurtownieLink = document.getElementById("hurtownieLink");
    const hurtownieBtn = document.getElementById("hurtownieBtn");

    if (plan === "BASIC") {

      if (hurtownieLink) hurtownieLink.style.display = "none";

      if (hurtownieBtn) {
        hurtownieBtn.onclick = function (e) {
          e.preventDefault();
          alert("Moduł Hurtownie dostępny od planu PRO.");
          window.location.href = "cennik.html";
        };
      }

      // jeśli ktoś wejdzie bezpośrednio w URL
      if (window.location.pathname.includes("hurtownie.html")) {
        alert("Ten moduł wymaga planu PRO.");
        window.location.href = "cennik.html";
      }
    }
  }

  // ===== OGRANICZENIE IMPORTÓW (BASIC = 1) =====
  function guardImports() {

    if (!window.location.pathname.includes("hurtownie.html")) return;

    let importCount = parseInt(localStorage.getItem("importCount") || "0");

    if (plan === "BASIC" && importCount >= 1) {
      alert("Limit importów w planie BASIC został wykorzystany.");
      window.location.href = "cennik.html";
    }

    const originalProcess = window.processCSV;

    if (originalProcess) {
      window.processCSV = function () {

        if (plan === "BASIC" && importCount >= 1) {
          alert("Upgrade do PRO aby analizować kolejne hurtownie.");
          window.location.href = "cennik.html";
          return;
        }

        originalProcess();

        importCount++;
        localStorage.setItem("importCount", importCount);
      };
    }
  }

  // ===== INIT =====
  document.addEventListener("DOMContentLoaded", function () {
    applyPlanUI();
    guardHurtownie();
    setTimeout(guardImports, 300);
  });

})();

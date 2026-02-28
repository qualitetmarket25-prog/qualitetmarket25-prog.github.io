// limits.js — QualitetMarket
// Limity demo (BASIC = 1 import), działa tylko na hurtownie.html
(function () {
  const PLAN_KEY = "status"; // BASIC | PRO | ELITE
  const plan = (localStorage.getItem(PLAN_KEY) || "BASIC").toUpperCase();
  const safePlan = (plan === "PRO" || plan === "ELITE") ? plan : "BASIC";

  function onHurtownie() {
    return window.location.pathname.includes("hurtownie.html");
  }

  function guardImports() {
    if (!onHurtownie()) return;

    let importCount = parseInt(localStorage.getItem("importCount") || "0", 10);

    // Jeśli BASIC i już zużył 1 import – wywal na cennik
    if (safePlan === "BASIC" && importCount >= 1) {
      alert("Limit importów w planie BASIC został wykorzystany. Upgrade do PRO.");
      window.location.href = "cennik.html";
      return;
    }

    // Nadpisz processCSV dopiero jak istnieje (hurtownie.js musi się załadować)
    const originalProcess = window.processCSV;
    if (typeof originalProcess !== "function") return;

    window.processCSV = function () {
      if (safePlan === "BASIC" && importCount >= 1) {
        alert("Upgrade do PRO aby analizować kolejne hurtownie.");
        window.location.href = "cennik.html";
        return;
      }

      originalProcess();

      importCount++;
      localStorage.setItem("importCount", String(importCount));
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    // czekamy chwilę aż hurtownie.js podstawi processCSV
    setTimeout(guardImports, 300);
  });
})();

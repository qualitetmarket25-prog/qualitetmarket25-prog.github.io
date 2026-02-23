// assets/app.js
(function () {
  const DEFAULT_PLAN = "BASIC";

  function getPlan() {
    return (localStorage.getItem("qm_plan") || DEFAULT_PLAN).toUpperCase();
  }

  function setPlan(plan) {
    localStorage.setItem("qm_plan", plan.toUpperCase());
  }

  function isPro() {
    const p = getPlan();
    return p === "PRO" || p === "ELITE";
  }

  function isLogged() {
    return !!localStorage.getItem("qm_user");
  }

  window.QM = {
    setPlan,
    isPro,
    isLogged,
    logout() {
      localStorage.removeItem("qm_user");
      window.location.href = "login.html";
    },
    requireLogin() {
      if (!isLogged()) window.location.href = "login.html";
    },
    requirePro() {
      if (!isPro()) window.location.href = "cennik.html";
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const req = document.body.getAttribute("data-require");
    if (req === "login") window.QM.requireLogin();
    if (req === "pro") window.QM.requirePro();
  });
})();

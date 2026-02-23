// assets/auth.js
(function () {
  function login(email) {
    if (!email.includes("@")) return false;
    localStorage.setItem("qm_user", email);
    if (!localStorage.getItem("qm_plan"))
      localStorage.setItem("qm_plan", "BASIC");
    return true;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("[data-login-form]");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.querySelector("input[name='email']").value;
      if (!login(email)) {
        alert("Podaj poprawny email");
        return;
      }
      window.location.href = "panel.html";
    });
  });
})();

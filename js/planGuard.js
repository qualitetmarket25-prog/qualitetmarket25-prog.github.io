(function () {

  const status = localStorage.getItem("status");
  const isLogged = localStorage.getItem("is_logged_in") === "true";
  const expiresAt = localStorage.getItem("plan_expires_at");

  const requireType = document.body.dataset.require;

  // 🔐 Wymagane logowanie
  if (requireType === "login" && !isLogged) {
    window.location.href = "login.html";
    return;
  }

  // 🔥 Sprawdzenie wygaśnięcia planu
  if (expiresAt) {
    const now = new Date();
    const exp = new Date(expiresAt);

    if (now > exp) {
      localStorage.removeItem("status");
      localStorage.removeItem("plan_expires_at");
      localStorage.setItem("status", "BASIC");
    }
  }

  // 🔐 Wymagany PRO
  if (requireType === "pro" && status !== "PRO" && status !== "ELITE") {
    window.location.href = "cennik.html";
    return;
  }

  // 🔐 Wymagany ELITE
  if (requireType === "elite" && status !== "ELITE") {
    window.location.href = "cennik.html";
    return;
  }

})();

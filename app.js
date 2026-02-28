<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Płatność zakończona</title>

  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="/icons/icon-192.png">

  <!-- PWA -->
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#0b0f14">
</head>
<body>

<section class="section">
  <div class="container">
    <div class="card highlight" id="box">
      <h2>⏳ Weryfikacja płatności...</h2>
      <p style="margin-top:10px;color:#cbd5e1;">Proszę czekać.</p>
    </div>
  </div>
</section>

<script>
function getParam(name){
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

const plan = (getParam("plan") || "").toUpperCase();
const token = getParam("token");
const box = document.getElementById("box");

/* ====== TOKENY ====== */
const VALID_TOKENS = {
  PRO: "PRO2026SZEF",
  ELITE: "ELITE2026SZEF"
};

if (
  (plan === "PRO" || plan === "ELITE") &&
  token === VALID_TOKENS[plan]
) {

  localStorage.setItem("status", plan);
  localStorage.setItem("paid_at", new Date().toISOString());

  box.innerHTML = `
    <h2>✅ Płatność zakończona</h2>
    <p style="margin-top:10px;color:#cbd5e1;">
      Aktywowano plan: <strong style="color:#fff;">${plan}</strong>
    </p>
    <p style="margin-top:10px;color:#94a3b8;">
      Trwa przekierowanie...
    </p>
  `;

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 2000);

} else {

  box.innerHTML = `
    <h2>❌ Weryfikacja nieudana</h2>
    <p style="margin-top:10px;color:#cbd5e1;">
      Link nieprawidłowy lub wygasły.
    </p>
    <div style="margin-top:20px;">
      <a href="cennik.html" class="btn-primary">
        Wróć do cennika
      </a>
    </div>
  `;
}
</script>

<!-- Service Worker -->
<script>
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}
</script>

</body>
</html>

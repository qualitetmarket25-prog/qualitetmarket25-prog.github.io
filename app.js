<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Płatność zakończona</title>
  <link rel="stylesheet" href="styles.css">
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

/* ====== PROSTE TOKENY ====== */
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
    <div style="margin-top:20px;">
      <a href="dashboard.html" class="btn-primary">
        Przejdź do dashboardu
      </a>
    </div>
  `;

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

</body>
</html>

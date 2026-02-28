// ===== plan badge (unified) =====
function getPlanRaw() {
  // preferuj nowe klucze, ale czytaj wszystko (legacy)
  return (
    localStorage.getItem("qm_plan") ||
    localStorage.getItem("qm_plan_v1") ||
    localStorage.getItem("status") ||
    localStorage.getItem("zsz_plan") ||
    localStorage.getItem("plan") ||
    "basic"
  );
}

function normalizePlan(raw) {
  const p = String(raw || "").trim();

  // obsłuż małe/duże litery i śmieci
  const u = p.toUpperCase();

  if (u === "ELITE") return "elite";
  if (u === "PRO" || u === "PREMIUM") return "pro";
  if (u === "BASIC" || u === "FREE" || u === "GUEST") return "basic";

  // jak ktoś zapisze już małe
  if (p === "elite") return "elite";
  if (p === "pro") return "pro";
  if (p === "basic") return "basic";

  return "basic";
}

function qmGetPlan() {
  return normalizePlan(getPlanRaw());
}

function qmIsElite() {
  return qmGetPlan() === "elite";
}

// ===== plan (single source of truth) =====
// Canon: qm_plan = "basic" | "pro" | "elite"
// Compat: qm_plan_v1 (JSON "pro"), status/plan (uppercase), proStatus (true)
function normalizePlan(raw) {
  const s = String(raw ?? "").trim();
  const u = s.toUpperCase();
  const l = s.toLowerCase();

  if (u === "ELITE" || l === "elite") return "elite";
  if (u === "PRO" || u === "PREMIUM" || l === "pro" || l === "premium") return "pro";
  if (u === "BASIC" || u === "FREE" || u === "GUEST" || l === "basic" || l === "free" || l === "guest" || !s) return "basic";

  return "basic";
}

function readPlanAny() {
  // 1) canonical
  const qm = localStorage.getItem("qm_plan");
  if (qm) return normalizePlan(qm);

  // 2) v1 JSON or raw
  const rawV1 = localStorage.getItem("qm_plan_v1");
  if (rawV1) {
    try { return normalizePlan(JSON.parse(rawV1)); } catch { return normalizePlan(rawV1); }
  }

  // 3) legacy
  const status = localStorage.getItem("status");
  if (status) return normalizePlan(status);

  const plan = localStorage.getItem("plan");
  if (plan) return normalizePlan(plan);

  const zsz = localStorage.getItem("zsz_plan");
  if (zsz) return normalizePlan(zsz);

  return "basic";
}

function writePlanAll(planLower) {
  const p = normalizePlan(planLower);

  // canonical
  localStorage.setItem("qm_plan", p);

  // compat
  localStorage.setItem("qm_plan_v1", JSON.stringify(p));
  localStorage.setItem("status", p.toUpperCase());
  localStorage.setItem("plan", p.toUpperCase());

  if (p === "pro" || p === "elite") localStorage.setItem("proStatus", "true");
  else localStorage.removeItem("proStatus");

  return p;
}

function qmGetPlan() {
  // normalize + sync to avoid split-brain
  const p = readPlanAny();
  return writePlanAll(p);
}

function qmIsElite() {
  return qmGetPlan() === "elite";
}

function qmHasAtLeast(required) {
  const rank = { basic: 0, pro: 1, elite: 2 };
  const cur = qmGetPlan();
  const req = normalizePlan(required);
  return (rank[cur] ?? 0) >= (rank[req] ?? 0);
}

function qmSetPlan(planLower) {
  return writePlanAll(planLower);
}

// expose
window.QM = window.QM || {};
window.QM.getPlan = qmGetPlan;
window.QM.setPlan = qmSetPlan;
window.QM.isElite = qmIsElite;
window.QM.hasAtLeast = qmHasAtLeast;

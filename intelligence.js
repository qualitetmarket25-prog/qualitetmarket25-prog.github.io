/* QualitetMarket • Blueprints Engine
   - loads blueprints.json + products.json
   - calculates avg margin/score and exports pack (CSV + copy pack)
*/

function getPlan() {
  return (localStorage.getItem("plan") || "BASIC").toUpperCase();
}
function setPlan(plan) {
  localStorage.setItem("plan", plan.toUpperCase());
  location.reload();
}
function money(n){ return `${Number(n).toFixed(2)} zł`; }
function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Nie mogę wczytać ${path}`);
  return res.json();
}
function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function toCSV(rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g,'""')}"`;
    return s;
  };
  return rows.map(r => r.map(esc).join(",")).join("\n");
}

function planMultiplier(plan) {
  if (plan === "ELITE") return 0.90;
  if (plan === "PRO") return 0.92;
  return 0.93;
}
function calcSuggested(p, plan, bpMult) {
  const mult = bpMult ?? planMultiplier(plan);
  return Number(p.market_avg_price) * mult;
}
function calcProfit(p, plan, bpMult) {
  const suggested = calcSuggested(p, plan, bpMult);
  const cost = Number(p.wholesale_price) + Number(p.shipping_cost||0);
  return suggested - cost;
}
function calcMarginPercent(p, plan, bpMult) {
  const suggested = calcSuggested(p, plan, bpMult);
  const profit = calcProfit(p, plan, bpMult);
  if (suggested <= 0) return 0;
  return (profit / suggested) * 100;
}
function competitionScore(level) {
  if (level === "low") return 10;
  if (level === "medium") return 6;
  return 2;
}
function calcScore(p, plan, bpMult) {
  const margin = clamp(calcMarginPercent(p, plan, bpMult), 0, 70);
  const trend = clamp(Number(p.trend_score||0), 0, 10);
  const problem = clamp(Number(p.problem_solving_score||0), 0, 10);
  const impulse = clamp(Number(p.impulse_score||0), 0, 10);
  const comp = competitionScore((p.competition_level||"medium").toLowerCase());

  const score =
    margin * 0.40 +
    trend * 10 * 0.20 +
    problem * 10 * 0.20 +
    impulse * 10 * 0.10 +
    comp * 10 * 0.10;

  return clamp(score, 0, 100);
}
function classify(score){
  if (score >= 80) return "🔥 ELITE";
  if (score >= 65) return "⭐ WYSOKI";
  if (score >= 50) return "⚖ ŚREDNI";
  return "❌ NISKI";
}

function ensurePlanUI() {
  const plan = getPlan();
  const planLabel = document.getElementById("planLabel");
  const planBtn = document.getElementById("planBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (planLabel) planLabel.textContent = plan;
  if (planBtn) {
    planBtn.addEventListener("click", () => {
      const next = plan === "BASIC" ? "PRO" : plan === "PRO" ? "ELITE" : "BASIC";
      setPlan(next);
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("plan");
      location.href = "index.html";
    });
  }
}

let PRODUCTS = [];
let BLUEPRINTS = [];
let SELECTED = null;

function renderCards(list) {
  const grid = document.getElementById("blueprintsGrid");
  if (!grid) return;
  grid.innerHTML = list.map(bp => `
    <div class="card qm-bp-card" data-id="${bp.id}">
      <div class="qm-bp-top">
        <span class="badge ${bp.level === "ELITE" ? "ok" : bp.level === "PRO" ? "warn" : ""}">
          <span class="dot" style="background:${bp.level === "ELITE" ? "var(--ok)" : bp.level === "PRO" ? "var(--warn)" : "var(--brand)"}"></span>
          ${bp.level}
        </span>
        <span class="badge">Start: ${bp.time_to_start}</span>
      </div>
      <h3 style="margin-top:10px;">${bp.name}</h3>
      <p>${bp.description}</p>
      <div class="qm-bp-tags">
        ${(bp.tags||[]).slice(0,5).map(t => `<span class="qm-chip">${t}</span>`).join("")}
      </div>
      <div class="hr"></div>
      <button class="btn btn-primary btn-sm qm-bp-btn">Wybierz gotowca</button>
    </div>
  `).join("");

  grid.querySelectorAll(".qm-bp-card").forEach(card => {
    card.addEventListener("click", (e) => {
      const id = card.getAttribute("data-id");
      const bp = BLUEPRINTS.find(x => x.id === id);
      if (bp) selectBlueprint(bp);
    });
  });
}

function getProductsForBlueprint(bp) {
  const plan = getPlan();
  const mult = bp.pricing_rule?.market_multiplier ?? planMultiplier(plan);
  const ids = bp.products || [];
  const ps = ids
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean)
    .map(p => {
      const suggested = calcSuggested(p, plan, mult);
      const profit = calcProfit(p, plan, mult);
      const margin = calcMarginPercent(p, plan, mult);
      const score = calcScore(p, plan, mult);
      return { ...p, _suggested:suggested, _profit:profit, _margin:margin, _score:score };
    })
    .filter(p => p._margin >= 30) // filtr jakości w gotowcu
    .sort((a,b)=>b._score-a._score);

  return { ps, mult };
}

function selectBlueprint(bp) {
  SELECTED = bp;

  const { ps } = getProductsForBlueprint(bp);

  const avgMargin = ps.length ? ps.reduce((s,p)=>s+p._margin,0) / ps.length : 0;
  const avgScore = ps.length ? ps.reduce((s,p)=>s+p._score,0) / ps.length : 0;

  const bpInfo = document.getElementById("bpInfo");
  const bpAvgMargin = document.getElementById("bpAvgMargin");
  const bpAvgScore = document.getElementById("bpAvgScore");
  const bpBadge = document.getElementById("bpBadge");
  const bpCount = document.getElementById("bpCount");

  if (bpInfo) bpInfo.innerHTML = `<b>${bp.name}</b><br>${bp.positioning}<br><br><span class="badge">Zasada ceny: rynek × ${(bp.pricing_rule?.market_multiplier ?? planMultiplier(getPlan())).toFixed(2)}</span>`;
  if (bpAvgMargin) bpAvgMargin.textContent = ps.length ? `${avgMargin.toFixed(1)}%` : "—";
  if (bpAvgScore) bpAvgScore.textContent = ps.length ? `${avgScore.toFixed(1)}` : "—";
  if (bpBadge) { bpBadge.textContent = classify(avgScore); bpBadge.className = `badge ${avgScore>=65 ? "ok":"warn"}`; }
  if (bpCount) bpCount.textContent = `${ps.length} produktów`;

  renderBlueprintProducts(ps);
}

function renderBlueprintProducts(ps) {
  const tbody = document.getElementById("bpProductsTbody");
  if (!tbody) return;
  tbody.innerHTML = ps.slice(0, 20).map(p => `
    <tr>
      <td>
        <div class="qm-cell-title">
          <b>${p.name}</b>
          <div class="qm-sub">${p.category || "—"} • ${p.supplier}</div>
        </div>
      </td>
      <td class="right"><b>${money(p._suggested)}</b></td>
      <td class="right">${money(p._profit)}</td>
      <td class="right">${p._margin.toFixed(1)}%</td>
      <td class="right"><b>${p._score.toFixed(1)}</b></td>
    </tr>
  `).join("");
}

function exportBlueprintCSV() {
  if (!SELECTED) return alert("Najpierw wybierz gotowca.");
  const plan = getPlan();
  const { ps, mult } = getProductsForBlueprint(SELECTED);

  const rows = [["name","price","supplier","category","sku","source_url"]];
  ps.forEach(p => {
    rows.push([
      p.name,
      p._suggested.toFixed(2),
      p.supplier,
      p.category || "",
      p.supplier_sku || "",
      p.source_url || ""
    ]);
  });
  downloadText(`${SELECTED.id}_products.csv`, toCSV(rows));
}

function exportBlueprintPack() {
  if (!SELECTED) return alert("Najpierw wybierz gotowca.");
  const plan = getPlan();
  const { ps } = getProductsForBlueprint(SELECTED);

  const brand = SELECTED.copy_pack?.brand_name || "QualitetMarket";
  const usp = (SELECTED.copy_pack?.usp || []).map(x=>`• ${x}`).join("\n");
  const tone = SELECTED.copy_pack?.tone || "premium-minimal";

  const copyPack =
`BRAND: ${brand}
TONE: ${tone}

USP:
${usp}

POSITIONING:
${SELECTED.positioning}

CHECKLISTA:
1) Wgraj CSV produktów (ceny już policzone)
2) Wklej gotowy opis + tytuły
3) Dodaj 5 zdjęć/produkt (min)
4) Ustaw wysyłkę i zwroty
5) Startuj z 3 ogłoszeniami TOP i rozbudowuj
`;

  const rows = [["name","price","supplier","category","title","description"]];
  ps.slice(0, 25).forEach(p => {
    const title = `${p.name} • ${SELECTED.name} • Szybka dostawa`;
    const desc =
`🔥 ${p.name}

• ${SELECTED.positioning}
• ${usp.split("\n").join("\n")}

Cena: ${money(p._suggested)}
`;
    rows.push([p.name, p._suggested.toFixed(2), p.supplier, p.category||"", title, desc]);
  });

  downloadText(`${SELECTED.id}_PACK.txt`, copyPack);
  downloadText(`${SELECTED.id}_PACK.csv`, toCSV(rows));
}

function copyCopyPack() {
  if (!SELECTED) return alert("Najpierw wybierz gotowca.");
  const brand = SELECTED.copy_pack?.brand_name || "QualitetMarket";
  const usp = (SELECTED.copy_pack?.usp || []).map(x=>`• ${x}`).join("\n");
  const tone = SELECTED.copy_pack?.tone || "premium-minimal";
  const text =
`BRAND: ${brand}
TONE: ${tone}

USP:
${usp}

POSITIONING:
${SELECTED.positioning}
`;
  navigator.clipboard.writeText(text);
  const btn = document.getElementById("copyCopyPackBtn");
  if (btn) {
    btn.textContent = "Skopiowane ✓";
    setTimeout(()=>btn.textContent="Kopiuj Copy Pack", 1200);
  }
}

function applyFilters() {
  const q = (document.getElementById("bpSearch")?.value || "").trim().toLowerCase();
  const level = document.getElementById("bpLevel")?.value || "";
  const plan = getPlan();

  const list = BLUEPRINTS
    .filter(bp => (q ? (bp.name.toLowerCase().includes(q) || (bp.description||"").toLowerCase().includes(q)) : true))
    .filter(bp => (level ? bp.level === level : true))
    .filter(bp => {
      // gating: BASIC widzi BASIC, PRO widzi BASIC+PRO, ELITE widzi wszystko
      if (plan === "ELITE") return true;
      if (plan === "PRO") return bp.level !== "ELITE";
      return bp.level === "BASIC";
    });

  renderCards(list);
  if (!SELECTED && list[0]) selectBlueprint(list[0]);
}

async function init() {
  ensurePlanUI();

  PRODUCTS = await loadJSON("data/products.json");
  BLUEPRINTS = await loadJSON("data/blueprints.json");

  document.getElementById("bpSearch")?.addEventListener("input", applyFilters);
  document.getElementById("bpLevel")?.addEventListener("change", applyFilters);

  document.getElementById("downloadCsvBtn")?.addEventListener("click", exportBlueprintCSV);
  document.getElementById("downloadPackBtn")?.addEventListener("click", exportBlueprintPack);
  document.getElementById("copyCopyPackBtn")?.addEventListener("click", copyCopyPack);

  applyFilters();
}

init().catch(err => {
  console.error(err);
  alert("Błąd wczytywania danych. Sprawdź czy masz folder data/ i js/ w repo.");
});

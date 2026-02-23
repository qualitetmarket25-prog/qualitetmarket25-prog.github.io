/* QualitetMarket • Intelligence Engine (no-backend / GitHub Pages)
   - pricing: suggested = market_avg * multiplier (default 0.92)
   - filters out products with margin < 30%
   - scoring 0..100 (weighted)
   - adds "Sprawdź" verification button per row + proof box
*/

const QM = {
  marketMultiplierDefault: 0.92,
  minMarginPercent: 30,
  weights: {
    margin: 0.40,
    trend: 0.20,
    problem: 0.20,
    impulse: 0.10,
    competition: 0.10
  }
};

function getPlan() {
  return (localStorage.getItem("plan") || "BASIC").toUpperCase();
}
function setPlan(plan) {
  localStorage.setItem("plan", plan.toUpperCase());
  location.reload();
}
function planMultiplier(plan) {
  if (plan === "ELITE") return 0.90;
  if (plan === "PRO") return 0.92;
  return 0.93;
}
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function money(n) { return `${Number(n).toFixed(2)} zł`; }

function calcSuggested(p, plan) {
  const mult = p.market_multiplier ?? planMultiplier(plan) ?? QM.marketMultiplierDefault;
  return Number(p.market_avg_price) * mult;
}
function calcTotalCost(p) {
  const w = Number(p.wholesale_price);
  const s = Number(p.shipping_cost || 0);
  return w + s;
}
function calcProfit(p, plan) {
  const suggested = calcSuggested(p, plan);
  const cost = calcTotalCost(p);
  return suggested - cost;
}
function calcMarginPercent(p, plan) {
  const suggested = calcSuggested(p, plan);
  const profit = calcProfit(p, plan);
  if (suggested <= 0) return 0;
  return (profit / suggested) * 100;
}

function competitionScore(level) {
  if (level === "low") return 10;
  if (level === "medium") return 6;
  return 2;
}
function calcScore(p, plan) {
  const margin = clamp(calcMarginPercent(p, plan), 0, 70);
  const trend = clamp(Number(p.trend_score || 0), 0, 10);
  const problem = clamp(Number(p.problem_solving_score || 0), 0, 10);
  const impulse = clamp(Number(p.impulse_score || 0), 0, 10);
  const comp = competitionScore((p.competition_level || "medium").toLowerCase());

  const score =
    margin * 1.0 * QM.weights.margin +
    trend * 10 * QM.weights.trend +
    problem * 10 * QM.weights.problem +
    impulse * 10 * QM.weights.impulse +
    comp * 10 * QM.weights.competition;

  return clamp(score, 0, 100);
}
function classify(score) {
  if (score >= 80) return { key: "ELITE", label: "🔥 ELITE", badge: "ok" };
  if (score >= 65) return { key: "HIGH", label: "⭐ WYSOKI", badge: "ok" };
  if (score >= 50) return { key: "MEDIUM", label: "⚖ ŚREDNI", badge: "warn" };
  return { key: "LOW", label: "❌ NISKI", badge: "warn" };
}

function buildOfferCopy(p, plan) {
  const price = calcSuggested(p, plan);
  const title = `${p.name} • ${p.category || "TOP"} • Szybka dostawa`;
  const bullets = [
    "✅ Efekt WOW od pierwszego użycia",
    "✅ Idealne na prezent / impuls",
    "✅ Prosty zwrot i szybka obsługa",
    "✅ Sprawdzone pod sprzedaż online"
  ];
  const desc =
`🔥 ${p.name}

${bullets.map(b => `• ${b}`).join("\n")}

Cena: ${money(price)}
Dostawa: szybka (zależnie od dostawcy)
`;
  return { title, desc };
}

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
    if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return rows.map(r => r.map(esc).join(",")).join("\n");
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
      localStorage.removeItem("isPro");
      localStorage.removeItem("plan");
      location.href = "index.html";
    });
  }
}

let ALL = [];
let FILTERED = [];
let SELECTED = null;

function fillSupplierFilter(list) {
  const el = document.getElementById("supplierFilter");
  if (!el) return;
  const suppliers = Array.from(new Set(list.map(p => p.supplier))).sort();
  suppliers.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    el.appendChild(opt);
  });
}

function applyFilters() {
  const q = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
  const supplier = document.getElementById("supplierFilter")?.value || "";
  const status = document.getElementById("statusFilter")?.value || "";
  const plan = getPlan();

  FILTERED = ALL
    .map(p => {
      const suggested = calcSuggested(p, plan);
      const profit = calcProfit(p, plan);
      const margin = calcMarginPercent(p, plan);
      const score = calcScore(p, plan);
      const cls = classify(score);
      return { ...p, _suggested: suggested, _profit: profit, _margin: margin, _score: score, _class: cls };
    })
    .filter(p => p._margin >= QM.minMarginPercent)
    .filter(p => {
      if (!q) return true;
      return (
        String(p.name).toLowerCase().includes(q) ||
        String(p.supplier).toLowerCase().includes(q) ||
        String(p.category || "").toLowerCase().includes(q)
      );
    })
    .filter(p => (supplier ? p.supplier === supplier : true))
    .filter(p => (status ? p._class.key === status : true))
    .sort((a,b) => b._score - a._score);

  renderTable();
  renderKPIs();
}

function renderKPIs() {
  const top = FILTERED[0];
  const kTop = document.getElementById("kpiTopScore");
  const kTopBadge = document.getElementById("kpiTopBadge");
  const kAvgMargin = document.getElementById("kpiAvgMargin");
  const kCount = document.getElementById("kpiCount");
  const kEliteCount = document.getElementById("kpiEliteCount");
  const kRisk = document.getElementById("kpiRisk");

  if (kTop) kTop.textContent = top ? `${top._score.toFixed(1)}` : "—";
  if (kTopBadge) kTopBadge.textContent = top ? top._class.label : "—";

  const avgMargin = FILTERED.length
    ? (FILTERED.reduce((s,p)=>s+p._margin,0) / FILTERED.length)
    : 0;

  if (kAvgMargin) kAvgMargin.textContent = FILTERED.length ? `${avgMargin.toFixed(1)}%` : "—";
  if (kCount) kCount.textContent = `${FILTERED.length} produktów`;

  const eliteCount = FILTERED.filter(p => p._class.key === "ELITE").length;
  if (kEliteCount) kEliteCount.textContent = `${eliteCount}`;

  const highComp = FILTERED.filter(p => (p.competition_level || "").toLowerCase() === "high").length;
  if (kRisk) kRisk.textContent = `Konkurencja HIGH: ${highComp}`;
}

function rowHTML(p) {
  const badgeClass = p._class.badge === "ok" ? "ok" : "warn";
  const verified = (p.verification || "").toLowerCase() === "verified";
  const vBadge = verified ? ` <span class="badge ok" style="margin-left:6px;">Zweryfikowane</span>` : "";
  const src = p.source_url || "https://allegro.pl/";

  return `
    <tr class="qm-row" data-id="${p.id}">
      <td>
        <div class="qm-cell-title">
          <b>${p.name}</b>${vBadge}
          <div class="qm-sub">${p.category || "—"} • weryf: ${p.last_checked || "—"}</div>
        </div>
      </td>
      <td>${p.supplier}</td>
      <td class="right">${money(p.wholesale_price)}</td>
      <td class="right">${money(p.market_avg_price)}</td>
      <td class="right"><b>${money(p._suggested)}</b></td>
      <td class="right">${money(p._profit)}</td>
      <td class="right">${p._margin.toFixed(1)}%</td>
      <td class="right"><b>${p._score.toFixed(1)}</b></td>
      <td><span class="badge ${badgeClass}">${p._class.label}</span></td>
      <td>
        <a class="btn btn-sm btn-ghost qm-verify-btn" href="${src}" target="_blank" rel="noopener">Sprawdź</a>
      </td>
    </tr>
  `;
}

function renderTable() {
  const tbody = document.getElementById("productsTbody");
  if (!tbody) return;
  tbody.innerHTML = FILTERED.map(rowHTML).join("");

  // klik w wiersz -> szczegóły
  tbody.querySelectorAll(".qm-row").forEach(tr => {
    tr.addEventListener("click", (e) => {
      // jeśli klik w link Sprawdź, nie przejmuj selection
      if (e.target && e.target.classList && e.target.classList.contains("qm-verify-btn")) return;
      const id = tr.getAttribute("data-id");
      const p = FILTERED.find(x => x.id === id);
      if (p) selectProduct(p);
    });
  });
}

function selectProduct(p) {
  SELECTED = p;

  document.querySelectorAll(".qm-row").forEach(r => r.classList.remove("active"));
  const tr = document.querySelector(`.qm-row[data-id="${p.id}"]`);
  if (tr) tr.classList.add("active");

  const plan = getPlan();
  const status = p._class;

  const dTitle = document.querySelector(".qm-detail-title");
  const dPrice = document.getElementById("dPrice");
  const dProfit = document.getElementById("dProfit");
  const dMargin = document.getElementById("dMargin");
  const dStatus = document.getElementById("dStatus");

  if (dTitle) dTitle.textContent = `${p.name} • ${p.supplier}`;
  if (dPrice) dPrice.textContent = money(p._suggested);
  if (dProfit) dProfit.textContent = money(p._profit);
  if (dMargin) dMargin.textContent = `${p._margin.toFixed(1)}% marży`;
  if (dStatus) {
    dStatus.textContent = status.label;
    dStatus.className = `badge ${status.badge === "ok" ? "ok" : "warn"}`;
  }

  // bars
  const marginBar = clamp(p._margin, 0, 70) / 70 * 100;
  const trend = clamp(Number(p.trend_score||0), 0, 10);
  const problem = clamp(Number(p.problem_solving_score||0), 0, 10);
  const impulse = clamp(Number(p.impulse_score||0), 0, 10);
  const compLevel = (p.competition_level||"medium").toLowerCase();
  const comp = competitionScore(compLevel);

  const setBar = (fillId, labelId, value, max) => {
    const fill = document.getElementById(fillId);
    const lab = document.getElementById(labelId);
    if (fill) fill.style.width = `${clamp(value,0,max)/max*100}%`;
    if (lab) lab.textContent = `${value.toFixed ? value.toFixed(1) : value}/${max}`;
  };

  setBar("fMargin","bMargin",marginBar,100);
  setBar("fTrend","bTrend",trend,10);
  setBar("fProblem","bProblem",problem,10);
  setBar("fImpulse","bImpulse",impulse,10);
  setBar("fCompetition","bCompetition",comp,10);

  const rec = document.getElementById("recommendationBox");
  if (rec) rec.innerHTML = makeRecommendation(p);

  const openSourceBtn = document.getElementById("openSourceBtn");
  if (openSourceBtn) openSourceBtn.href = p.source_url || "https://allegro.pl/";

  const copyOfferBtn = document.getElementById("copyOfferBtn");
  if (copyOfferBtn) {
    copyOfferBtn.onclick = () => {
      const offer = buildOfferCopy(p, plan);
      navigator.clipboard.writeText(`${offer.title}\n\n${offer.desc}`);
      copyOfferBtn.textContent = "Skopiowane ✓";
      setTimeout(()=>copyOfferBtn.textContent="Kopiuj ofertę (tytuł+opis)", 1200);
    };
  }

  const addBtn = document.getElementById("addToBlueprintBtn");
  if (addBtn) {
    addBtn.onclick = () => {
      const stash = JSON.parse(localStorage.getItem("qm_blueprint_stash") || "[]");
      if (!stash.includes(p.id)) stash.push(p.id);
      localStorage.setItem("qm_blueprint_stash", JSON.stringify(stash));
      addBtn.textContent = "Dodane ✓";
      setTimeout(()=>addBtn.textContent="Dodaj do gotowca", 1200);
    };
  }
}

function makeRecommendation(p) {
  const cls = p._class.key;
  const comp = (p.competition_level || "medium").toLowerCase();

  const lines = [];
  lines.push(`<b>Rekomendacja:</b> ${cls === "ELITE" ? "AGRESYWNA SPRZEDAŻ" : cls === "HIGH" ? "STANDARD PRO" : "TEST / MAŁY BUDŻET"}.`);
  lines.push(`• Konkurencja: <b>${comp.toUpperCase()}</b>`);
  lines.push(`• Strategia: <b>${strategyFor(p)}</b>`);
  lines.push(`• Ten wynik możesz zweryfikować: kliknij <b>Źródło / rynek</b> i porównaj ceny.`);

  if (cls === "ELITE" && comp !== "high") {
    lines.push(`<br><span class="badge ok">🔥 Układ pod 40–60% marży bez podejrzeń (bo cena jest poniżej średniej rynkowej).</span>`);
  } else if (comp === "high") {
    lines.push(`<br><span class="badge warn">⚠ Wysoka konkurencja — wygrywasz opisem, mini-bundle, gratisem.</span>`);
  }

  return lines.join("<br>");
}
function strategyFor(p) {
  const trend = Number(p.trend_score||0);
  const problem = Number(p.problem_solving_score||0);
  if (trend >= 8) return "TikTok / Reels (trend)";
  if (problem >= 8) return "Problem→Rozwiązanie (landing + Allegro)";
  return "Allegro + mocny tytuł + 5 zdjęć + social proof";
}

function exportCSV() {
  const rows = [
    ["id","name","supplier","category","wholesale_price","shipping_cost","market_avg_price","suggested_price","profit","margin_percent","score","status","source_url","last_checked","verification"]
  ];
  FILTERED.forEach(p => {
    rows.push([
      p.id,
      p.name,
      p.supplier,
      p.category || "",
      Number(p.wholesale_price||0).toFixed(2),
      Number(p.shipping_cost||0).toFixed(2),
      Number(p.market_avg_price||0).toFixed(2),
      p._suggested.toFixed(2),
      p._profit.toFixed(2),
      p._margin.toFixed(1),
      p._score.toFixed(1),
      p._class.key,
      p.source_url || "",
      p.last_checked || "",
      p.verification || ""
    ]);
  });
  downloadText("qualitetmarket_products.csv", toCSV(rows));
}
function exportPack() {
  const plan = getPlan();
  const rows = [["name","price","supplier","category","title","description","source_url"]];
  FILTERED.slice(0, 25).forEach(p => {
    const offer = buildOfferCopy(p, plan);
    rows.push([p.name, p._suggested.toFixed(2), p.supplier, p.category || "", offer.title, offer.desc, p.source_url || ""]);
  });
  downloadText("qualitetmarket_pack.csv", toCSV(rows));
}

async function init() {
  ensurePlanUI();

  ALL = await loadJSON("data/products.json");
  fillSupplierFilter(ALL);

  document.getElementById("searchInput")?.addEventListener("input", applyFilters);
  document.getElementById("supplierFilter")?.addEventListener("change", applyFilters);
  document.getElementById("statusFilter")?.addEventListener("change", applyFilters);

  document.getElementById("exportCsvBtn")?.addEventListener("click", exportCSV);
  document.getElementById("exportPackBtn")?.addEventListener("click", exportPack);

  applyFilters();
  if (FILTERED[0]) selectProduct(FILTERED[0]);
}

init().catch(err => {
  console.error(err);
  alert("Błąd wczytywania danych. Sprawdź czy masz folder data/ i js/ w repo.");
});

/* hurtownie.js — QualitetMarket
   CSV -> produkty + marża + scoring + ranking hurtowni
   Wymagane ID w HTML:
   - input type="file" id="csvFile"
   - table id="resultsTable" z <tbody>
   - div id="supplierRanking"
   (opcjonalnie) input id="supplierName" (nazwa hurtowni)
*/

(() => {
  const LS_KEY = "qm_supplier_scores_v1";

  // ===== Helpers =====
  const $ = (sel) => document.querySelector(sel);

  function toast(msg) {
    alert(msg); // prosto i pewnie (możesz podmienić na UI)
  }

  function toNumber(raw) {
    if (raw == null) return NaN;
    let s = String(raw).trim();

    // usuń waluty/spacje
    s = s.replace(/\s/g, "");
    s = s.replace(/zł|pln|PLN|ZŁ/gi, "");

    // zamień przecinek dziesiętny na kropkę
    // ale najpierw usuń separatory tysięcy
    // przykłady: "1 234,50" "1.234,50" "1,234.50"
    // strategia: jeśli ma przecinek i kropkę, uznaj ostatni znak jako separator dziesiętny
    const hasComma = s.includes(",");
    const hasDot = s.includes(".");

    if (hasComma && hasDot) {
      // jeśli ostatni jest przecinek -> przecinek dziesiętny
      if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
        s = s.replace(/\./g, "");
        s = s.replace(",", ".");
      } else {
        // kropka dziesiętna
        s = s.replace(/,/g, "");
      }
    } else if (hasComma && !hasDot) {
      s = s.replace(",", ".");
    }

    return parseFloat(s);
  }

  function detectDelimiter(text) {
    const head = text.split(/\r?\n/).slice(0, 5).join("\n");
    const commas = (head.match(/,/g) || []).length;
    const semis = (head.match(/;/g) || []).length;
    const tabs = (head.match(/\t/g) || []).length;
    // preferuj najczęstszy
    if (tabs > semis && tabs > commas) return "\t";
    if (semis > commas) return ";";
    return ",";
  }

  // Prosty parser CSV z obsługą cudzysłowów
  function parseCSV(text) {
    const delimiter = detectDelimiter(text);
    const rows = [];
    let row = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (ch === '"') {
        if (inQuotes && next === '"') {
          // escaped quote ""
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (!inQuotes && ch === delimiter) {
        row.push(cur);
        cur = "";
        continue;
      }

      if (!inQuotes && (ch === "\n" || ch === "\r")) {
        if (ch === "\r" && next === "\n") i++;
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
        continue;
      }

      cur += ch;
    }

    // ostatnia komórka
    if (cur.length || row.length) {
      row.push(cur);
      rows.push(row);
    }

    // trim
    return rows
      .map((r) => r.map((c) => (c == null ? "" : String(c).trim())))
      .filter((r) => r.some((c) => c !== ""));
  }

  function normalizeHeader(h) {
    return String(h || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[\.\-_/]/g, "");
  }

  function scoreMargin(marginPct) {
    // Możesz zmienić progi; te są agresywne pod e-commerce
    if (marginPct >= 80) return 100;
    if (marginPct >= 50) return 85;
    if (marginPct >= 35) return 70;
    if (marginPct >= 20) return 50;
    if (marginPct >= 10) return 30;
    return 10;
  }

  function computeMarginPct(wholesale, retail) {
    // marża % liczona od ceny hurtowej (jak miałeś)
    if (!isFinite(wholesale) || wholesale <= 0) return NaN;
    if (!isFinite(retail) || retail <= 0) return NaN;
    return ((retail - wholesale) / wholesale) * 100;
  }

  function loadScores() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveScores(list) {
    localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 50))); // limit
  }

  function formatPLN(n) {
    if (!isFinite(n)) return "-";
    return `${n.toFixed(2)} zł`;
  }

  // ===== Główna funkcja =====
  window.processCSV = async function processCSV() {
    const fileInput = $("#csvFile");
    const file = fileInput?.files?.[0];

    if (!file) {
      toast("Wybierz plik CSV.");
      return;
    }

    // opcjonalna nazwa hurtowni (jeśli masz input w HTML)
    const supplierName = ($("#supplierName")?.value || file.name || "Hurtownia").trim();

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length < 2) {
      toast("CSV jest pusty albo ma zły format.");
      return;
    }

    // Wykrywanie kolumn po nagłówku
    const header = rows[0].map(normalizeHeader);

    // Możliwe nazwy kolumn:
    const nameIdx =
      header.findIndex((h) => ["nazwa", "produkt", "product", "name"].includes(h));
    const wholesaleIdx =
      header.findIndex((h) => ["cenahurtowa", "hurt", "wholesale", "cena"].includes(h));
    const retailIdx =
      header.findIndex((h) => ["cenarynkowa", "rynkowa", "retail", "market", "cenadetaliczna", "detal"].includes(h));

    // Jeśli nie wykryło – fallback: 0,1,2
    const idxName = nameIdx >= 0 ? nameIdx : 0;
    const idxWholesale = wholesaleIdx >= 0 ? wholesaleIdx : 1;
    const idxRetail = retailIdx >= 0 ? retailIdx : 2;

    const results = [];
    let totalScore = 0;
    let productCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const name = (r[idxName] || "").trim();
      const wholesale = toNumber(r[idxWholesale]);
      const retail = toNumber(r[idxRetail]);

      if (!name) continue;
      if (!isFinite(wholesale) || !isFinite(retail)) continue;

      const margin = computeMarginPct(wholesale, retail);
      if (!isFinite(margin)) continue;

      const score = scoreMargin(margin);

      totalScore += score;
      productCount++;

      results.push({
        name,
        wholesale,
        retail,
        marginPct: margin,
        score
      });
    }

    if (!results.length) {
      toast("Nie udało się odczytać produktów. Sprawdź kolumny CSV.");
      return;
    }

    // sort: score desc, potem marża desc
    results.sort((a, b) => (b.score - a.score) || (b.marginPct - a.marginPct));

    displayResults(results);

    const avgScore = productCount ? (totalScore / productCount) : 0;

    // zapis do rankingu hurtowni
    const scores = loadScores();
    const entry = {
      supplierName,
      avgScore: Number(avgScore.toFixed(2)),
      products: productCount,
      ts: new Date().toISOString()
    };

    scores.unshift(entry);
    saveScores(scores);

    displaySupplierRanking(scores, entry);
  };

  // ===== Render tabeli =====
  function displayResults(results) {
    const tbody = document.querySelector("#resultsTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    results.forEach((p) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${escapeHtml(p.name)}</td>
        <td>${formatPLN(p.wholesale)}</td>
        <td>${formatPLN(p.retail)}</td>
        <td>${p.marginPct.toFixed(2)}%</td>
        <td>${p.score}</td>
      `;

      tbody.appendChild(tr);
    });
  }

  // ===== Ranking hurtowni =====
  function displaySupplierRanking(scores, lastEntry) {
    const box = $("#supplierRanking");
    if (!box) return;

    // top 5 po avgScore
    const top = [...scores]
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    box.innerHTML = `
      <div class="card soft">
        <strong>Ostatnio policzone:</strong>
        <div style="margin-top:6px;color:#cbd5e1;">
          ${escapeHtml(lastEntry.supplierName)} — <strong>${lastEntry.avgScore}/100</strong>
          <span style="color:#94a3b8;">(${lastEntry.products} produktów)</span>
        </div>

        <div style="margin-top:14px;">
          <strong>TOP 5 hurtowni (wg score):</strong>
          <ol style="margin:8px 0 0 18px;color:#cbd5e1;">
            ${top.map((x) => `
              <li>
                ${escapeHtml(x.supplierName)} — <strong>${x.avgScore}/100</strong>
                <span style="color:#94a3b8;">(${x.products})</span>
              </li>
            `).join("")}
          </ol>
        </div>

        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-sm" id="qmClearRanking">Wyczyść ranking</button>
          <button class="btn btn-sm btn-secondary" id="qmExportRanking">Eksport JSON</button>
        </div>
      </div>
    `;

    // akcje
    $("#qmClearRanking")?.addEventListener("click", () => {
      localStorage.removeItem(LS_KEY);
      displaySupplierRanking([], { supplierName: "-", avgScore: 0, products: 0 });
    });

    $("#qmExportRanking")?.addEventListener("click", () => {
      const data = loadScores();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qm-ranking-hurtowni.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 800);
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Na start pokaż ranking jeśli jest
  document.addEventListener("DOMContentLoaded", () => {
    const scores = loadScores();
    if (scores.length) {
      displaySupplierRanking(scores, scores[0]);
    }
  });
})();

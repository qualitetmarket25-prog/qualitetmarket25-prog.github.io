/* hurtownie.js — QualitetMarket (PROD)
   CSV -> produkty + marża + scoring + ranking hurtowni
   Wymagane ID:
   - input type="file" id="csvFile"
   - table id="resultsTable" z <tbody>
   - div id="supplierRanking"
   - div id="supplierSummary"
   Dodatkowo (PROD):
   - #qmAnalyzeBtn, #qmClearTableBtn, #qmToast
   - #qmSearch, #qmExportProductsCsv, #qmExportProductsJson
   (opcjonalnie) input id="supplierName"
*/

(() => {
  "use strict";

  const LS_KEY = "qm_supplier_scores_v2";
  const LS_LAST_PRODUCTS = "qm_last_products_v1";

  // ✅ produkty per hurtownia (do globalnej bazy)
  const LS_PRODUCTS_BY_SUPPLIER = "qm_products_by_supplier_v1";

  const MAX_SCORES = 100;
  const MAX_SUPPLIERS_STORE = 50;      // ile hurtowni trzymamy
  const MAX_PRODUCTS_PER_SUPPLIER = 5000;

  // ===== DOM helpers =====
  const $ = (sel) => document.querySelector(sel);

  const els = {
    file: () => $("#csvFile"),
    supplierName: () => $("#supplierName"),
    tableBody: () => document.querySelector("#resultsTable tbody"),
    ranking: () => $("#supplierRanking"),
    summary: () => $("#supplierSummary"),
    toast: () => $("#qmToast"),
    analyzeBtn: () => $("#qmAnalyzeBtn"),
    clearBtn: () => $("#qmClearTableBtn"),
    search: () => $("#qmSearch"),
    exportProductsCsv: () => $("#qmExportProductsCsv"),
    exportProductsJson: () => $("#qmExportProductsJson"),
  };

  // ===== UI: toast inline =====
  function showToast(message, type = "info") {
    const box = els.toast();
    if (!box) return;
    box.style.display = "";
    box.textContent = message;

    box.style.opacity = "1";
    box.style.border = "1px solid rgba(148,163,184,.25)";
    box.style.background = "rgba(148,163,184,.08)";

    if (type === "error") {
      box.style.border = "1px solid rgba(239,68,68,.35)";
      box.style.background = "rgba(239,68,68,.10)";
    } else if (type === "success") {
      box.style.border = "1px solid rgba(34,197,94,.30)";
      box.style.background = "rgba(34,197,94,.10)";
    }

    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      box.style.opacity = "0";
      setTimeout(() => {
        box.style.display = "none";
        box.style.opacity = "1";
      }, 250);
    }, 2600);
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function clamp(n, a, b) {
    return Math.min(b, Math.max(a, n));
  }

  // ===== Numbers / PLN =====
  function toNumber(raw) {
    if (raw == null) return NaN;
    let s = String(raw).trim();
    if (!s) return NaN;

    s = s.replace(/^\uFEFF/, "");
    s = s.replace(/\s/g, "");
    s = s.replace(/zł|pln|PLN|ZŁ/gi, "");

    const hasComma = s.includes(",");
    const hasDot = s.includes(".");

    if (hasComma && hasDot) {
      if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
        s = s.replace(/\./g, "");
        s = s.replace(",", ".");
      } else {
        s = s.replace(/,/g, "");
      }
    } else if (hasComma && !hasDot) {
      s = s.replace(",", ".");
    }

    const n = parseFloat(s);
    return Number.isFinite(n) ? n : NaN;
  }

  function formatPLN(n) {
    if (!Number.isFinite(n)) return "–";
    return `${n.toFixed(2)} zł`;
  }

  // ===== CSV =====
  function detectDelimiter(text) {
    const head = text.split(/\r?\n/).slice(0, 8).join("\n");
    const commas = (head.match(/,/g) || []).length;
    const semis = (head.match(/;/g) || []).length;
    const tabs = (head.match(/\t/g) || []).length;

    if (tabs > semis && tabs > commas) return "\t";
    if (semis > commas) return ";";
    return ",";
  }

  function parseCSV(text) {
    text = String(text ?? "").replace(/^\uFEFF/, "");

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

    if (cur.length || row.length) {
      row.push(cur);
      rows.push(row);
    }

    return rows
      .map((r) => r.map((c) => (c == null ? "" : String(c).trim())))
      .filter((r) => r.some((c) => c !== ""));
  }

  function normalizeHeader(h) {
    return String(h || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .replace(/[\.\-_/]/g, "");
  }

  // ===== Column mapping =====
  const HEADER_SYNONYMS = {
    name: ["nazwa", "produkt", "product", "name", "towar", "item", "title", "opis", "description"],
    wholesale: ["cenahurtowa", "hurt", "hurtowa", "wholesale", "purchase", "kupno", "cena", "netto", "cennanetto", "buyprice", "pricebuy", "cost", "supplierprice"],
    retail: ["cenarynkowa", "rynkowa", "retail", "market", "cenadetaliczna", "detal", "brutto", "cenabrutto", "sellprice", "pricesell", "msrp"],
  };

  function findIndex(headerNorm, keys) {
    for (const k of keys) {
      const idx = headerNorm.findIndex((h) => h === k || h.includes(k));
      if (idx >= 0) return idx;
    }
    return -1;
  }

  function mapColumns(rows) {
    const header = rows[0].map(normalizeHeader);

    const idxName = findIndex(header, HEADER_SYNONYMS.name);
    const idxWholesale = findIndex(header, HEADER_SYNONYMS.wholesale);
    const idxRetail = findIndex(header, HEADER_SYNONYMS.retail);

    return {
      idxName: idxName >= 0 ? idxName : 0,
      idxWholesale: idxWholesale >= 0 ? idxWholesale : 1,
      idxRetail: idxRetail >= 0 ? idxRetail : 2,
      header,
    };
  }

  // ===== Scoring =====
  function computeMarginPct(wholesale, retail) {
    if (!Number.isFinite(wholesale) || wholesale <= 0) return NaN;
    if (!Number.isFinite(retail) || retail <= 0) return NaN;
    return ((retail - wholesale) / wholesale) * 100;
  }

  function scoreMargin(marginPct) {
    if (marginPct >= 80) return 100;
    if (marginPct >= 50) return 85;
    if (marginPct >= 35) return 70;
    if (marginPct >= 20) return 50;
    if (marginPct >= 10) return 30;
    return 10;
  }

  function scoreSpread(wholesale, retail) {
    const spread = retail - wholesale;
    if (!Number.isFinite(spread)) return 0;
    if (spread >= 200) return 20;
    if (spread >= 100) return 15;
    if (spread >= 50) return 10;
    if (spread >= 20) return 6;
    if (spread >= 10) return 3;
    return 0;
  }

  function computeScore(wholesale, retail, marginPct) {
    const base = scoreMargin(marginPct);
    const spread = scoreSpread(wholesale, retail);
    const penalty = retail <= wholesale ? 25 : 0;
    return clamp(Math.round(base + spread - penalty), 0, 100);
  }

  // ===== LocalStorage ranking =====
  function loadScores() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function saveScores(list) {
    localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, MAX_SCORES)));
  }

  function normalizeSupplierName(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .slice(0, 80);
  }

  function upsertScore(scores, entry) {
    const key = normalizeSupplierName(entry.supplierName);
    const without = scores.filter((x) => normalizeSupplierName(x.supplierName) !== key);
    return [entry, ...without].slice(0, MAX_SCORES);
  }

  // ✅ LocalStorage produkty per hurtownia
  function loadProductsBySupplier() {
    try {
      const raw = localStorage.getItem(LS_PRODUCTS_BY_SUPPLIER);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function saveProductsBySupplier(list) {
    localStorage.setItem(
      LS_PRODUCTS_BY_SUPPLIER,
      JSON.stringify(list.slice(0, MAX_SUPPLIERS_STORE))
    );
  }

  // ✅ PROD fix: stabilna nazwa hurtowni w rekordzie
  function upsertSupplierProducts(list, supplierName, products) {
    const niceName = String(supplierName || "").trim().slice(0, 80) || "Hurtownia";
    const key = normalizeSupplierName(niceName);
    const without = list.filter((x) => normalizeSupplierName(x?.supplierName) !== key);
    return [
      {
        supplierName: niceName,
        ts: new Date().toISOString(),
        products: products.slice(0, MAX_PRODUCTS_PER_SUPPLIER),
      },
      ...without,
    ].slice(0, MAX_SUPPLIERS_STORE);
  }

  // ===== Products memory (for search/export) =====
  function saveLastProducts(products) {
    try {
      localStorage.setItem(LS_LAST_PRODUCTS, JSON.stringify(products.slice(0, 5000)));
    } catch { /* ignore */ }
  }

  function loadLastProducts() {
    try {
      const raw = localStorage.getItem(LS_LAST_PRODUCTS);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  // ===== Rendering =====
  function renderResults(products, { highlightTop = 10 } = {}) {
    const tbody = els.tableBody();
    if (!tbody) return;

    tbody.innerHTML = "";

    products.forEach((p, i) => {
      const tr = document.createElement("tr");
      if (i < highlightTop) tr.style.background = "rgba(34,197,94,.08)";

      tr.innerHTML = `
        <td>${escapeHtml(p.name)}</td>
        <td>${formatPLN(p.wholesale)}</td>
        <td>${formatPLN(p.retail)}</td>
        <td>${Number.isFinite(p.marginPct) ? p.marginPct.toFixed(2) + "%" : "–"}</td>
        <td><strong>${p.score}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderSupplierSummary(entry, bestProduct) {
    const box = els.summary();
    if (!box) return;

    box.innerHTML = `
      <div style="display:grid;gap:6px;">
        <div><strong>${escapeHtml(entry.supplierName)}</strong></div>
        <div>Produkty: <strong>${entry.products}</strong></div>
        <div>Średni score: <strong>${entry.avgScore}/100</strong></div>
        <div>Najlepszy produkt: <strong>${bestProduct ? escapeHtml(bestProduct.name) : "–"}</strong></div>
        <div style="color:#94a3b8;">Zapis: ${new Date(entry.ts).toLocaleString("pl-PL")}</div>
      </div>
    `;
  }

  function renderSupplierRanking(scores, lastEntry) {
    const box = els.ranking();
    if (!box) return;

    if (!scores.length) {
      box.innerHTML = `<div class="note">Brak danych. Wczytaj pierwszą hurtownię.</div>`;
      return;
    }

    const top = [...scores].sort((a, b) => b.avgScore - a.avgScore).slice(0, 8);

    box.innerHTML = `
      <div class="card soft">
        <strong>Ostatnio policzone:</strong>
        <div style="margin-top:6px;color:#cbd5e1;">
          ${escapeHtml(lastEntry.supplierName)} — <strong>${lastEntry.avgScore}/100</strong>
          <span style="color:#94a3b8;">(${lastEntry.products} produktów)</span>
        </div>

        <div style="margin-top:14px;">
          <strong>TOP hurtowni (wg avg score):</strong>
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
          <button class="btn btn-sm" type="button" id="qmClearRanking">Wyczyść ranking</button>
          <button class="btn btn-sm btn-secondary" type="button" id="qmExportRankingJson">Eksport JSON</button>
          <button class="btn btn-sm btn-secondary" type="button" id="qmExportRankingCsv">Eksport CSV</button>
        </div>
      </div>
    `;

    $("#qmClearRanking")?.addEventListener("click", () => {
      localStorage.removeItem(LS_KEY);
      renderSupplierRanking([], { supplierName: "–", avgScore: 0, products: 0, ts: new Date().toISOString() });
      showToast("Ranking wyczyszczony.", "success");
    });

    $("#qmExportRankingJson")?.addEventListener("click", () => {
      const data = loadScores();
      downloadBlob(JSON.stringify(data, null, 2), "application/json", "qm-ranking-hurtowni.json");
      showToast("Wyeksportowano JSON z rankingiem.", "success");
    });

    $("#qmExportRankingCsv")?.addEventListener("click", () => {
      const data = loadScores();
      const csv = toCsv(
        ["supplierName", "avgScore", "products", "ts"],
        data.map((x) => [x.supplierName, x.avgScore, x.products, x.ts])
      );
      downloadBlob(csv, "text/csv;charset=utf-8", "qm-ranking-hurtowni.csv");
      showToast("Wyeksportowano CSV z rankingiem.", "success");
    });
  }

  // ===== Export helpers =====
  function toCsv(headers, rows) {
    const esc = (v) => {
      const s = String(v ?? "");
      if (/[",\n\r;]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
      return s;
    };
    const sep = ";";
    return [
      headers.map(esc).join(sep),
      ...rows.map((r) => r.map(esc).join(sep))
    ].join("\n");
  }

  function downloadBlob(content, mime, filename) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 800);
  }

  function exportProductsCsv(products) {
    const csv = toCsv(
      ["name", "wholesale", "retail", "marginPct", "score"],
      products.map((p) => [
        p.name,
        Number.isFinite(p.wholesale) ? p.wholesale.toFixed(2) : "",
        Number.isFinite(p.retail) ? p.retail.toFixed(2) : "",
        Number.isFinite(p.marginPct) ? p.marginPct.toFixed(2) : "",
        p.score
      ])
    );
    downloadBlob(csv, "text/csv;charset=utf-8", "qm-produkty.csv");
  }

  function exportProductsJson(products) {
    downloadBlob(JSON.stringify(products, null, 2), "application/json", "qm-produkty.json");
  }

  // ===== Debounce search =====
  function debounce(fn, wait = 180) {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  // ===== Main pipeline =====
  async function processCSV() {
    const file = els.file()?.files?.[0];
    if (!file) {
      showToast("Wybierz plik CSV.", "error");
      return;
    }

    const supplierName =
      (els.supplierName()?.value || file.name || "Hurtownia").trim() || "Hurtownia";

    let text = "";
    try {
      text = await file.text();
    } catch {
      showToast("Nie mogę odczytać pliku.", "error");
      return;
    }

    const rows = parseCSV(text);
    if (rows.length < 2) {
      showToast("CSV jest pusty albo ma zły format.", "error");
      return;
    }

    const { idxName, idxWholesale, idxRetail } = mapColumns(rows);

    const products = [];
    let sumScore = 0;

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];

      const name = String(r[idxName] ?? "").trim();
      if (!name) continue;

      const wholesale = toNumber(r[idxWholesale]);
      const retail = toNumber(r[idxRetail]);

      if (!Number.isFinite(wholesale) || !Number.isFinite(retail)) continue;

      const marginPct = computeMarginPct(wholesale, retail);
      if (!Number.isFinite(marginPct)) continue;

      const score = computeScore(wholesale, retail, marginPct);

      products.push({ name, wholesale, retail, marginPct, score });
      sumScore += score;
    }

    if (!products.length) {
      showToast("Nie udało się odczytać produktów. Sprawdź nagłówki i kolumny w CSV.", "error");
      return;
    }

    products.sort((a, b) =>
      (b.score - a.score) ||
      (b.marginPct - a.marginPct) ||
      (b.retail - a.retail)
    );

    // render tabela
    renderResults(products, { highlightTop: 10 });

    // zapisz ostatnie produkty (search/export)
    saveLastProducts(products);

    // ✅ zapis produktów per hurtownia (globalna baza)
    const allSuppliers = loadProductsBySupplier();
    const nextSuppliers = upsertSupplierProducts(allSuppliers, supplierName, products);
    saveProductsBySupplier(nextSuppliers);

    const avgScore = products.length ? (sumScore / products.length) : 0;

    const entry = {
      supplierName,
      avgScore: Number(avgScore.toFixed(2)),
      products: products.length,
      ts: new Date().toISOString(),
    };

    const bestProduct = products[0] || null;
    renderSupplierSummary(entry, bestProduct);

    const scores = upsertScore(loadScores(), entry);
    saveScores(scores);
    renderSupplierRanking(scores, entry);

    showToast(`Gotowe: ${products.length} produktów. Śr. score: ${entry.avgScore}/100`, "success");
  }

  // ===== Clear table =====
  function clearTable() {
    const tbody = els.tableBody();
    if (tbody) tbody.innerHTML = "";
    const sum = els.summary();
    if (sum) sum.innerHTML = "";
    localStorage.removeItem(LS_LAST_PRODUCTS);
    showToast("Wyniki wyczyszczone.", "success");
  }

  // ===== Bindings =====
  function bind() {
    els.analyzeBtn()?.addEventListener("click", processCSV);
    els.clearBtn()?.addEventListener("click", clearTable);

    const applySearch = debounce(() => {
      const q = String(els.search()?.value ?? "").trim().toLowerCase();
      const all = loadLastProducts();
      const filtered = q
        ? all.filter((p) => String(p.name).toLowerCase().includes(q))
        : all;
      renderResults(filtered, { highlightTop: 10 });
    }, 160);

    els.search()?.addEventListener("input", applySearch);

    els.exportProductsCsv()?.addEventListener("click", () => {
      const data = loadLastProducts();
      if (!data.length) return showToast("Brak produktów do eksportu.", "error");
      exportProductsCsv(data);
      showToast("Wyeksportowano produkty do CSV.", "success");
    });

    els.exportProductsJson()?.addEventListener("click", () => {
      const data = loadLastProducts();
      if (!data.length) return showToast("Brak produktów do eksportu.", "error");
      exportProductsJson(data);
      showToast("Wyeksportowano produkty do JSON.", "success");
    });
  }

  // ===== Init =====
  document.addEventListener("DOMContentLoaded", () => {
    bind();

    // pokaż ranking jeśli jest
    const scores = loadScores();
    if (scores.length) {
      renderSupplierRanking(scores, scores[0]);
    } else {
      renderSupplierRanking([], { supplierName: "–", avgScore: 0, products: 0, ts: new Date().toISOString() });
    }

    // przywróć ostatnie produkty
    const products = loadLastProducts();
    if (products.length) {
      renderResults(products, { highlightTop: 10 });
    }
  });

  // compatibility (jeśli gdzieś jest onclick w starym HTML)
  window.processCSV = processCSV;
})();

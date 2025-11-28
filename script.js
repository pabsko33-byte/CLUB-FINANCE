// --- DATA MOCK (remplaçable par une API plus tard) ---

const INDICES = [
  {
    id: "cac40",
    name: "CAC 40",
    label: "Actions France",
    ticker: "^FCHI",
    value: 7420.5,
    change: +0.32,
    tags: ["Indice large", "Europe", "Actions"],
    comment: "Indice actions large français, utilisé comme repère de marché domestique.",
    series: [92, 94, 96, 93, 97, 99, 101, 100]
  },
  {
    id: "sp500",
    name: "S&P 500",
    label: "Large cap US",
    ticker: "^GSPC",
    value: 5098.4,
    change: -0.24,
    tags: ["US", "Large cap", "ETF core"],
    comment: "Baromètre actions US, souvent au cœur d’une poche ETF monde / US.",
    series: [100, 99, 101, 102, 103, 101, 104, 105]
  },
  {
    id: "nasdaq",
    name: "NASDAQ 100",
    label: "Tech US",
    ticker: "^NDX",
    value: 18045.9,
    change: +0.61,
    tags: ["Tech", "US", "Croissance"],
    comment: "Indice orienté valeurs technologiques, plus volatil que le S&P 500.",
    series: [95, 96, 98, 101, 103, 102, 105, 107]
  },
  {
    id: "msciworld",
    name: "MSCI World",
    label: "ETF monde développé",
    ticker: "URTH",
    value: 3220.7,
    change: +0.18,
    tags: ["Monde développé", "ETF", "Diversification"],
    comment: "Indice monde développé, utilisé comme base de portefeuille longue durée.",
    series: [90, 91, 92, 93, 94, 95, 96, 97]
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    label: "Actif spéculatif",
    ticker: "BTC",
    value: 68440,
    change: +1.25,
    tags: ["Crypto", "Volatilité forte"],
    comment: "Crypto traitée comme laboratoire de volatilité, pas comme poche cœur.",
    series: [100, 103, 98, 105, 110, 108, 112, 115]
  },
  {
    id: "ethereum",
    name: "Ethereum",
    label: "Réseau / smart contracts",
    ticker: "ETH",
    value: 3905,
    change: -0.80,
    tags: ["Crypto", "Smart contracts"],
    comment: "Suivi comme actif de réseau. Poids à calibrer strictement dans une poche risque.",
    series: [95, 97, 96, 98, 97, 99, 101, 100]
  }
];

// --- HELPERS ---

function formatNumber(n) {
  if (n >= 1000 && n < 100000) return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  if (n >= 100000) return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return n.toFixed(2);
}

function formatChange(pct) {
  const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
  return `${sign}${Math.abs(pct).toFixed(2)}%`;
}

// --- SNAPSHOT (HERO) ---

const snapshotListEl = document.getElementById("snapshot-list");
const refreshBtn = document.getElementById("refresh-btn");

function renderSnapshot() {
  snapshotListEl.innerHTML = "";

  INDICES.forEach((asset) => {
    const row = document.createElement("div");
    row.className = "snapshot-row";

    const name = document.createElement("div");
    name.innerHTML = `<span class="snapshot-name">${asset.name}</span>
                      <span class="snapshot-type">${asset.label}</span>`;

    const value = document.createElement("div");
    value.className = "snapshot-value";
    value.textContent = formatNumber(asset.value);

    const change = document.createElement("div");
    change.className = "snapshot-change";
    const cls = asset.change >= 0 ? "pos" : "neg";
    change.classList.add(cls);
    change.textContent = formatChange(asset.change);

    row.appendChild(name);
    row.appendChild(value);
    row.appendChild(change);
    snapshotListEl.appendChild(row);
  });
}

function simulateShift() {
  INDICES.forEach((a) => {
    const drift = (Math.random() - 0.5) * 0.6; // ±0.3%
    a.change = drift;
    a.value = Math.max(1, a.value * (1 + drift / 100));
  });
  renderSnapshot();
  renderMarketsTable(); // synchroniser aussi la table
}

// --- TABLE MARCHÉS & CHART ---

const marketsTableEl = document.getElementById("markets-table");
const chartTitleEl = document.getElementById("chart-title");
const chartTickerEl = document.getElementById("chart-ticker");
const chartCanvasEl = document.getElementById("chart-canvas");
const chartCommentEl = document.getElementById("chart-comment");
const chartTagsEl = document.getElementById("chart-tags");

function renderMarketsTable() {
  marketsTableEl.innerHTML = "";
  INDICES.forEach((asset) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "table-row";
    row.dataset.assetId = asset.id;

    row.innerHTML = `
      <div>
        <span class="table-name-main">${asset.name}</span>
        <span class="table-name-sub">${asset.label}</span>
      </div>
      <div class="table-value">${formatNumber(asset.value)}</div>
      <div class="table-change ${asset.change >= 0 ? "pos" : "neg"}">
        ${formatChange(asset.change)}
      </div>
    `;

    row.addEventListener("click", () => selectAsset(asset.id));
    marketsTableEl.appendChild(row);
  });
}

function selectAsset(id) {
  const asset = INDICES.find((a) => a.id === id);
  if (!asset) return;

  chartTitleEl.textContent = asset.name;
  chartTickerEl.textContent = asset.ticker;
  chartCommentEl.textContent = asset.comment;

  // nettoyer les tags
  chartTagsEl.innerHTML = "";
  asset.tags.forEach((t) => {
    const span = document.createElement("span");
    span.className = "chart-tag";
    span.textContent = t;
    chartTagsEl.appendChild(span);
  });

  // graphique simple en barres
  chartCanvasEl.innerHTML = "";
  const max = Math.max(...asset.series);
  asset.series.forEach((value) => {
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    const height = (value / max) * 100;
    bar.style.transform = `scaleY(${height / 100})`;
    chartCanvasEl.appendChild(bar);
  });
}

// --- NAV SCROLL ---

document.querySelectorAll("[data-scroll]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-scroll");
    const el = document.querySelector(target);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offset = rect.top + window.scrollY - 72;
    window.scrollTo({ top: offset, behavior: "smooth" });
  });
});

// --- INIT ---

renderSnapshot();
renderMarketsTable();
if (INDICES[0]) selectAsset(INDICES[0].id);

if (refreshBtn) {
  refreshBtn.addEventListener("click", simulateShift);
}

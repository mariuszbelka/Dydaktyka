// =====================================================================
// Moduły „przed zajęciami” ćwiczenia LC – logika (teksty w L10.modules)
// Te same obliczenia i tolerancje co w lekcji 1 trybu „Zajęcia”.
// =====================================================================
const MODULES = {
  m1: { id: "lc-m1", setup: () => LS(), steps: [
    { id: "intro", kind: "info" },
    { id: "look", kind: "choice", view: true, correct: 2 },
    { id: "tmDef", kind: "info", view: true, formula: ["holdup", 0] },
    { id: "vm", kind: "num", view: true, table: ["tR", "t0"], unit: "mL", answer: R => R.t0 * R.s.F, tol: 0.03 },
    { id: "kDef", kind: "info", view: true, formula: ["k", 1] },
    { id: "k", kind: "num", view: true, table: ["tR", "t0"], answer: R => pk(R, 1).k, tol: 0.03 },
    { id: "aDef", kind: "info", view: true, formula: ["alpha", 0] },
    { id: "alpha", kind: "num", view: true, table: ["tR", "t0"], answer: R => pk(R, 2).k / pk(R, 1).k, tol: 0.006, abs: true },
    { id: "nDef", kind: "info", view: true, formula: ["N", 0] },
    { id: "N", kind: "num", view: true, table: ["tR", "wh"], answer: R => pk(R, 1).N, tol: 0.04 },
    { id: "rsDef", kind: "info", view: true, formula: ["Rs", 0] },
    { id: "Rs", kind: "num", view: true, table: ["tR", "wh"], answer: R => pairRs(R, 1, 2), tol: 0.04 },
    { id: "rgDef", kind: "info", view: true, formula: ["rG", 0] },
    { id: "rG", kind: "num", view: true, table: ["tR"], answer: R => pk(R, 0).tR / pk(R, 1).tR, tol: 0.01, abs: true },
    { id: "rtInfo", kind: "choice", correct: 1 },
    { id: "summary", kind: "summary" }
  ] }
};

// Podłączenie odtwarzacza (shared/js/player.js) do symulatora LC
const PLAYER_HOOKS = {
  setup(def) { state = JSON.parse(JSON.stringify(def)); result = compute(state); return result; },
  view(canvasId) { drawChrom(null, { canvas: canvasId }); },
  formula([id, line]) {
    const f = FORMULAS.find(x => x.id === id);
    return f ? `<math display="block">${f.f[line || 0]}</math>` : "";
  },
  table(cols, R) {
    const head = { tR: "t<sub>R</sub> [min]", wh: "w<sub>h</sub> [min]", H: "H [mAU]", area: t("thArea") };
    const c = cols.filter(k => head[k]);
    const rows = R.el.map(p => `<tr><td><span class="dot" style="background:${p.color}"></span>${p.i + 1}. ${escapeHtml(p.name)}</td>` +
      c.map(k => `<td>${k === "tR" ? nf(p.tR, 3) : k === "wh" ? nf(p.wh, 4) : k === "H" ? sig3(p.H) : sig3(p.area)}</td>`).join("") + "</tr>").join("");
    let h = `<table class="pl-data"><thead><tr><th>${t("thAnalyte")}</th>${c.map(k => `<th>${head[k]}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>`;
    if (cols.includes("t0")) h += `<p class="pl-foot">t<sub>M</sub> = ${nf(R.t0, 3)} min · F = ${nf(R.s.F, 2)} mL/min</p>`;
    return h;
  }
};

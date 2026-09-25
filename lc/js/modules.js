// =====================================================================
// Moduły „przed zajęciami” ćwiczenia LC – logika (teksty w L10.modules)
// Zadania oznaczone from: [lekcja, krok] korzystają z logiki trybu „Zajęcia”
// (te same obliczenia, progi i tolerancje – wymagania bez zmian, D7).
// =====================================================================
const LSS_MATH = `<mrow><mi>log</mi><mo>&#x2061;</mo><mi>k</mi></mrow><mo>=</mo><mrow><mi>log</mi><mo>&#x2061;</mo><msub><mi>k</mi><mi>w</mi></msub></mrow><mo>−</mo><mi>S</mi><mo>·</mo><mi>φ</mi>`;

const MODULES = {
  m1: { id: "lc-m1", setup: () => LS(), steps: [
    { id: "intro", kind: "info" },
    { id: "look", kind: "choice", view: "chrom", correct: 2 },
    { id: "tmDef", kind: "info", view: "chrom", formula: ["holdup", 0] },
    { id: "vm", kind: "num", view: "chrom", table: ["tR", "t0"], unit: "mL", answer: R => R.t0 * R.s.F, tol: 0.03 },
    { id: "kDef", kind: "info", view: "chrom", formula: ["k", 1] },
    { id: "k", kind: "num", view: "chrom", table: ["tR", "t0"], answer: R => pk(R, 1).k, tol: 0.03 },
    { id: "aDef", kind: "info", view: "chrom", formula: ["alpha", 0] },
    { id: "alpha", kind: "num", view: "chrom", table: ["tR", "t0"], answer: R => pk(R, 2).k / pk(R, 1).k, tol: 0.006, abs: true },
    { id: "nDef", kind: "info", view: "chrom", formula: ["N", 0] },
    { id: "N", kind: "num", view: "chrom", table: ["tR", "wh"], answer: R => pk(R, 1).N, tol: 0.04 },
    { id: "rsDef", kind: "info", view: "chrom", formula: ["Rs", 0] },
    { id: "Rs", kind: "num", view: "chrom", table: ["tR", "wh"], answer: R => pairRs(R, 1, 2), tol: 0.04 },
    { id: "rgDef", kind: "info", view: "chrom", formula: ["rG", 0] },
    { id: "rG", kind: "num", view: "chrom", table: ["tR"], answer: R => pk(R, 0).tR / pk(R, 1).tR, tol: 0.01, abs: true },
    { id: "rtInfo", kind: "choice", correct: 1 },
    { id: "summary", kind: "summary" }
  ] },

  m2: { id: "lc-m2", setup: () => stepSetup(1, 0), steps: [
    { id: "intro", kind: "info" },
    { id: "obs", kind: "info", view: "chrom", controls: ["phiIso"], live: ["kAll"] },
    { id: "lssDef", kind: "info", formula: ["raw", LSS_MATH] },
    { id: "rule", kind: "choice", from: [1, 0] },
    { id: "choose", kind: "goal", from: [1, 1], setup: () => stepSetup(1, 1), view: "chrom", controls: ["phiIso"], live: ["k1", "Rs:1:2", "run"] },
    { id: "revObs", kind: "info", setup: () => stepSetup(1, 2), view: "chrom", controls: ["phiIso"], live: ["kAll"] },
    { id: "rev", kind: "choice", from: [1, 2], view: "chrom" },
    { id: "adjDef", kind: "info" },
    { id: "adj", kind: "choice", from: [1, 3] },
    { id: "improve", kind: "goal", from: [1, 4], setup: () => stepSetup(1, 4), view: "chrom", controls: ["phiIso", "F"], live: ["Rs:1:2", "run"] },
    { id: "summary", kind: "summary" }
  ] },

  m3: { id: "lc-m3", setup: () => stepSetup(2, 0), steps: [
    { id: "intro", kind: "info" },
    { id: "vdDef", kind: "info", view: "vd", formula: ["h", 0] },
    { id: "opt", kind: "goal", from: [2, 0], setup: () => stepSetup(2, 0), view: "vd", controls: ["F"], live: ["H"] },
    { id: "dp", kind: "choice", from: [2, 1] },
    { id: "f2Def", kind: "info", formula: ["F2", 0] },
    { id: "f2", kind: "num", from: [2, 2] },
    { id: "transfer", kind: "goal", from: [2, 3], setup: () => stepSetup(2, 3), view: "chrom", controls: ["L", "ID", "dp", "F", "sigEC"], live: ["Rs:1:2", "dP", "run"] },
    { id: "cs", kind: "choice", from: [2, 4], setup: () => stepSetup(2, 3), view: "chrom", controls: ["ptype"], live: ["Ncol"] },
    { id: "summary", kind: "summary" }
  ] },

  m4: { id: "lc-m4", setup: () => stepSetup(3, 0), steps: [
    { id: "intro", kind: "info" },
    { id: "ecvObs", kind: "info", setup: () => stepSetup(3, 0), view: "chrom", live: ["Ncol", "Nobs:1"] },
    { id: "ecv", kind: "goal", from: [3, 0], setup: () => stepSetup(3, 0), view: "chrom", controls: ["sigEC"], live: ["Rs:1:2", "Nobs:1", "Ncol"] },
    { id: "why", kind: "choice", from: [3, 1] },
    { id: "pDef", kind: "info", setup: () => stepSetup(3, 2), view: "vd", live: ["dP", "Fopt"] },
    { id: "press", kind: "goal", from: [3, 2], setup: () => stepSetup(3, 2), view: "vd", controls: ["F"], live: ["dP", "Fopt"] },
    { id: "dwDef", kind: "info", setup: () => stepSetup(3, 3), view: "chrom", formula: ["tc", 0] },
    { id: "dwNum", kind: "num", from: [3, 3] },
    { id: "dwComp", kind: "goal", from: [3, 4], setup: () => stepSetup(3, 4), view: "chrom", controls: ["tIso0"], live: ["tRall"] },
    { id: "summary", kind: "summary" }
  ] },

  m5: { id: "lc-m5", setup: () => stepSetup(4, 0), steps: [
    { id: "intro", kind: "info" },
    { id: "asDef", kind: "info", setup: () => stepSetup(4, 0), view: "chrom", formula: ["As", 0], live: ["As:1"] },
    { id: "as", kind: "goal", from: [4, 0], setup: () => stepSetup(4, 0), view: "chrom", controls: ["endcap"], live: ["As:1"] },
    { id: "sil", kind: "choice", from: [4, 1] },
    { id: "snDef", kind: "info", setup: () => stepSetup(4, 2), view: "chrom", zoom: 1000, formula: ["SN", 0] },
    { id: "sn", kind: "num", from: [4, 2], view: "chrom", zoom: 1000, table: ["H", "h"] },
    { id: "snGoal", kind: "goal", from: [4, 3], setup: () => stepSetup(4, 3), view: "chrom", zoom: 1000, controls: ["Vinj", "ID", "F"], live: ["SN:0", "dP"] },
    { id: "rsdDef", kind: "info", formula: ["RSDmax", 0] },
    { id: "rsd", kind: "num", from: [4, 4] },
    { id: "summary", kind: "summary" }
  ] }
};

// ---------- Podłączenie odtwarzacza (shared/js/player.js) do symulatora LC ----------
const CTRL = {
  phiIso: { lab: () => t("phiB"), unit: "%", range: [0, 100, 0.5] },
  F: { lab: () => t("flow"), unit: "mL/min", range: [0.05, 3, 0.01] },
  sigEC: { lab: () => t("sigEC"), unit: "µL", num: 0.5 },
  Vinj: { lab: () => t("Vinj"), unit: "µL", num: 1 },
  tIso0: { lab: () => t("tIso0"), unit: "min", num: 0.05 },
  L: { lab: () => t("length"), unit: "mm", opts: [30, 50, 75, 100, 150, 250] },
  ID: { lab: () => t("idLabel"), unit: "mm", opts: [1.0, 2.1, 3.0, 4.0, 4.6] },
  dp: { lab: () => t("particle"), unit: "µm", opts: [1.7, 1.8, 2.7, 3, 3.5, 5, 10] },
  ptype: { lab: () => t("ptype"), opts: [["porous", () => t("porous")], ["coreshell", () => t("coreshell")]] },
  endcap: { lab: () => t("phase"), opts: [[true, () => t("endcap1")], [false, () => t("endcap0")]] }
};

const PLAYER_HOOKS = {
  setup(def) { state = JSON.parse(JSON.stringify(def)); result = compute(state); return result; },
  view(canvasId, kind, zoom) { if (kind === "vd") drawVD(canvasId); else drawChrom(null, { canvas: canvasId, zoom }); },
  formula(spec) {
    if (spec[0] === "raw") return `<math display="block">${spec[1]}</math>`;
    const f = FORMULAS.find(x => x.id === spec[0]);
    return f ? `<math display="block">${f.f[spec[1] || 0]}</math>` : "";
  },
  task([li, si]) {
    const st = LESSONS[li].steps[si], tk = st.task;
    return { kind: tk.type, answer: tk.answer, tol: tk.tol, abs: tk.abs, unit: tk.unit, correct: tk.correct,
             q: tk.q, options: tk.options, hint: tk.hint, explain: tk.explain, check: tk.check, m: tk.m, ref: st.ref };
  },
  controls(list, S) {
    return list.map(k => {
      const c = CTRL[k], lab = `${c.lab()}${c.unit ? ` <small>[${c.unit}]</small>` : ""}`;
      if (c.range) return `<label class="pl-field"><span>${lab}</span><input type="number" data-k="${k}" value="${S[k]}" step="${c.range[2]}" min="${c.range[0]}" max="${c.range[1]}" inputmode="decimal">
        <input type="range" data-k="${k}" value="${S[k]}" min="${c.range[0]}" max="${c.range[1]}" step="${c.range[2]}"></label>`;
      if (c.num != null) return `<label class="pl-field"><span>${lab}</span><input type="number" data-k="${k}" value="${S[k]}" step="${c.num}" inputmode="decimal"></label>`;
      return `<label class="pl-field"><span>${lab}</span><select data-k="${k}">` + c.opts.map(o => {
        const [v, l] = Array.isArray(o) ? [o[0], o[1]()] : [o, String(o).replace(".", L10.decimal)];
        return `<option value="${v}" ${String(v) === String(S[k]) || Number(v) === Number(S[k]) && typeof v === "number" ? "selected" : ""}>${l}</option>`;
      }).join("") + `</select></label>`;
    }).join("");
  },
  readControl(el) {
    const k = el.dataset.k; if (!k) return null;
    const c = CTRL[k];
    if (el.tagName === "SELECT") return [k, k === "endcap" ? el.value === "true" : k === "ptype" ? el.value : Number(el.value)];
    const v = Number(String(el.value).replace(",", "."));
    const lim = NUM[k];
    if (el.value === "" || !isFinite(v) || (lim && (v < lim[0] || v > lim[1]))) { el.classList.add("invalid"); return null; }
    el.classList.remove("invalid");
    if (c.range) document.querySelectorAll(`#plCtrl input[data-k="${k}"]`).forEach(x => { if (x !== el) x.value = v; });
    return [k, v];
  },
  live(list, R, S) {
    const chip = (l, v) => `<span class="pl-chip">${l} = <b>${v}</b></span>`;
    return list.map(s => {
      const [k, a, b] = s.split(":"), p = a != null ? R.peaks[+a] : null;
      switch (k) {
        case "kAll": return R.peaks.map(q => q.eluted ? chip(`k<sub>${q.i + 1}</sub>`, nf(q.k, 2)) : "").join("");
        case "k1": return chip("k<sub>1</sub>", R.el.length ? nf(R.el[0].k, 2) : "–");
        case "Rs": return chip(`R<sub>s</sub>(${+a + 1}/${+b + 1})`, nf(pairRs(R, +a, +b), 2));
        case "run": return chip(t("kpiT"), nf(R.runTime, 1) + " min");
        case "dP": return chip("ΔP", nInt(R.dP) + " bar");
        case "H": return chip("H", nf(R.H * 1000, 2) + " µm") + chip("H<sub>min</sub>", nf(R.Hmin * 1000, 2) + " µm");
        case "Fopt": return chip("F<sub>opt</sub>", nf(R.Fopt, 2) + " mL/min");
        case "Ncol": return chip(t("kpiN"), nInt(R.N));
        case "Nobs": return p && p.eluted ? chip(`N<sub>${+a + 1}</sub>`, nInt(p.N)) : "";
        case "As": return p && p.eluted ? chip(`A<sub>s</sub>`, nf(p.As, 2)) : "";
        case "SN": return p && p.eluted ? chip("S/N", p.SN == null ? "∞" : nf(p.SN, 1)) : "";
        case "tRall": return R.peaks.map(q => q.eluted ? chip(`t<sub>R${q.i + 1}</sub>`, nf(q.tR, 2)) : "").join("");
        default: return "";
      }
    }).join("");
  },
  table(cols, R) {
    const head = { tR: "t<sub>R</sub> [min]", wh: "w<sub>h</sub> [min]", H: "H [mAU]", h: "h [mAU]", area: t("thArea") };
    const c = cols.filter(k => head[k]);
    const val = (p, k) => k === "tR" ? nf(p.tR, 3) : k === "wh" ? nf(p.wh, 4) : k === "H" ? sig3(p.H) : k === "h" ? sig3(p.hNoise) : sig3(p.area);
    const rows = R.el.map(p => `<tr><td><span class="dot" style="background:${p.color}"></span>${p.i + 1}. ${escapeHtml(p.name)}</td>` +
      c.map(k => `<td>${val(p, k)}</td>`).join("") + "</tr>").join("");
    let h = `<table class="pl-data"><thead><tr><th>${t("thAnalyte")}</th>${c.map(k => `<th>${head[k]}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>`;
    if (cols.includes("t0")) h += `<p class="pl-foot">t<sub>M</sub> = ${nf(R.t0, 3)} min · F = ${nf(R.s.F, 2)} mL/min</p>`;
    return h;
  }
};

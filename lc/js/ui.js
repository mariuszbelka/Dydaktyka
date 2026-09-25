// =====================================================================
// Formatowanie
// =====================================================================
const nf = (v, d) => v.toLocaleString(LOCALE, { minimumFractionDigits: d, maximumFractionDigits: d });
const nInt = v => Math.round(v).toLocaleString(LOCALE);
function sig3(v) {   // 3 cyfry znaczące
  if (!isFinite(v)) return "–";
  const a = Math.abs(v);
  const d = a >= 100 ? 0 : a >= 10 ? 1 : a >= 1 ? 2 : a >= 0.1 ? 3 : a >= 0.01 ? 4 : 5;
  return nf(v, d);
}
function niceStep(range, target) {
  const raw = range / target, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}
const stepDecimals = st => Math.max(0, -Math.floor(Math.log10(st) + 1e-9));
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

// =====================================================================
// Rysowanie
// =====================================================================
function prep(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  return { ctx, w, h };
}

let chromGeom = null;
function drawChrom(T) {
  const R = result, canvas = document.getElementById("chrom");
  const { ctx, w, h } = prep(canvas);
  const C = { text: cssVar("--text"), muted: cssVar("--muted"), grid: cssVar("--grid"), border: cssVar("--border"), accent: cssVar("--accent") };
  const m = { l: 56, r: R.iso ? 14 : 40, t: 22, b: 34 };
  const pw = w - m.l - m.r, ph = h - m.t - m.b;
  const tEnd = R.tEnd, tShow = T == null ? tEnd : T;
  const X = t => m.l + t / tEnd * pw;
  const zoom = Number(document.getElementById("yzoom").value) || 1;
  let peakMax = 0;
  for (let j = 0; j <= GRID; j++) if (R.tot[j] > peakMax) peakMax = R.tot[j];
  const yTop = Math.max(peakMax * 1.12 / zoom, 8 * (R.s.noise || 0.001));
  const yBot = -0.06 * yTop;
  const Y = v => m.t + ph - (v - yBot) / (yTop - yBot) * ph;
  chromGeom = { m, pw, tEnd };

  // siatka i osie
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.fillStyle = C.muted; ctx.textAlign = "center"; ctx.textBaseline = "top";
  const st = niceStep(tEnd, Math.max(4, Math.floor(pw / 80)));
  for (let t = 0; t <= tEnd + 1e-9; t += st) {
    const x = Math.round(X(t)) + 0.5;
    ctx.beginPath(); ctx.moveTo(x, m.t); ctx.lineTo(x, m.t + ph); ctx.stroke();
    ctx.fillText(nf(t, stepDecimals(st)), x, m.t + ph + 6);
  }
  ctx.fillText(t("axisTime"), m.l + pw / 2, m.t + ph + 20);
  const sy = niceStep(yTop - yBot, 5);
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  for (let v = Math.ceil(yBot / sy) * sy; v <= yTop + 1e-12; v += sy) {
    const y = Math.round(Y(v)) + 0.5;
    ctx.beginPath(); ctx.moveTo(m.l, y); ctx.lineTo(m.l + pw, y); ctx.stroke();
    ctx.fillText(nf(v, stepDecimals(sy)), m.l - 6, y);
  }
  ctx.save(); ctx.translate(11, m.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center";
  ctx.fillText(t("axisSignal"), 0, 0); ctx.restore();

  ctx.save(); ctx.beginPath(); ctx.rect(m.l, m.t, pw, ph); ctx.clip();

  // program gradientu na detektorze
  if (!R.iso) {
    ctx.strokeStyle = C.accent; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.25; ctx.beginPath();
    for (let j = 0; j <= 400; j++) { const t = j / 400 * tEnd, y = m.t + ph - R.phiProg(t - R.tD - R.t0) * ph; j ? ctx.lineTo(X(t), y) : ctx.moveTo(X(t), y); }
    ctx.stroke(); ctx.setLineDash([]);
  }
  // t_M
  ctx.strokeStyle = C.muted; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
  const x0 = Math.round(X(R.t0)) + 0.5;
  ctx.beginPath(); ctx.moveTo(x0, m.t); ctx.lineTo(x0, m.t + ph); ctx.stroke(); ctx.setLineDash([]);

  // piki (wypełnienie) i sygnał, do chwili tShow
  const jMax = Math.min(GRID, Math.floor(tShow / tEnd * GRID));
  ctx.save(); ctx.beginPath(); ctx.rect(m.l, 0, X(tShow) - m.l + 0.5, h); ctx.clip();
  R.el.forEach(p => {
    ctx.fillStyle = hexA(p.color, 0.2);
    ctx.beginPath(); ctx.moveTo(X(0), Y(0));
    for (let j = 0; j <= GRID; j += 1) ctx.lineTo(X(R.ts[j]), Y(p.sig[j]));
    ctx.lineTo(X(tEnd), Y(0)); ctx.closePath(); ctx.fill();
  });
  ctx.restore();
  ctx.strokeStyle = C.text; ctx.lineWidth = zoom > 1 ? 0.8 : 1.3; ctx.lineJoin = "round"; ctx.beginPath();
  for (let j = 0; j <= jMax; j++) { const px = X(R.ts[j]), py = Y(R.tot[j] + R.noise[j]); j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke();
  ctx.restore();

  // etykiety
  ctx.fillStyle = C.muted; ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText("t_M", x0, m.t - 4);
  if (!R.iso) {
    ctx.fillStyle = C.accent; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    [0, 50, 100].forEach(v => ctx.fillText(v + "%", m.l + pw + 6, m.t + ph - v / 100 * ph));
    ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(t("gradAtDetector"), m.l + pw, m.t - 4);
  }
  let lastX = -1e9, lvl = 0;
  ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.font = "600 11px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  R.el.forEach(p => {
    if (p.tR > tShow) return;
    const x = X(p.tR), top = Math.max(m.t + 12, Y(p.H) - 4);
    lvl = x - lastX < 18 ? lvl + 1 : 0; lastX = x;
    ctx.fillStyle = p.color;
    ctx.fillText(String(p.i + 1), x, top - lvl * 12);
  });

  if (T != null && T < tEnd) {
    ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(X(T), m.t); ctx.lineTo(X(T), m.t + ph); ctx.stroke();
  }
  ctx.strokeStyle = C.border; ctx.lineWidth = 1; ctx.strokeRect(m.l + 0.5, m.t + 0.5, pw, ph);
}

function interpX(traj, T) {
  const { t, x } = traj;
  if (T >= t[t.length - 1]) return x[x.length - 1];
  let lo = 0, hi = t.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (t[mid] <= T) lo = mid; else hi = mid; }
  const f = (T - t[lo]) / (t[hi] - t[lo] || 1);
  return x[lo] + f * (x[hi] - x[lo]);
}

function drawColumn(T) {
  const R = result, canvas = document.getElementById("column");
  const { ctx, w } = prep(canvas);
  const C = { muted: cssVar("--muted"), border: cssVar("--border"), column: cssVar("--column"), mp: cssVar("--mp-rgb") };
  const m = { l: 56, r: 64 };
  const cw = w - m.l - m.r, cy = 44, ch = 40;
  const L = R.s.L, tNow = T == null ? R.tEnd : T;
  const X = x => m.l + x / L * cw;

  ctx.fillStyle = C.column; ctx.fillRect(m.l, cy - ch / 2, cw, ch);
  for (let px = 0; px < cw; px += 2) {
    const phi = R.phiAt(px / cw * L, tNow);
    ctx.fillStyle = `rgba(${C.mp},${(0.05 + 0.35 * phi).toFixed(3)})`;
    ctx.fillRect(m.l + px, cy - ch / 2, 2, ch);
  }

  const sInj = 0.004 * L;
  const amax = Math.max(...R.s.analytes.map(a => a.amt), 1e-9);
  R.peaks.forEach(p => {
    if (p.eluted && tNow >= p.mu) return;
    const xc = interpX(p.traj, tNow);
    const sx = Math.sqrt(R.H * xc + sInj * sInj);
    const pxS = Math.max(1.2, sx / L * cw);
    const a0 = Math.min(0.95, 0.35 + 0.6 * p.amt / amax);
    for (let d = -3.2 * pxS; d <= 3.2 * pxS; d += 1) {
      const px = X(xc) + d;
      if (px < m.l || px > m.l + cw) continue;
      ctx.fillStyle = hexA(p.color, a0 * Math.exp(-0.5 * (d / pxS) ** 2));
      ctx.fillRect(px, cy - ch / 2 + 3, 1.2, ch - 6);
    }
    if (pxS < 30) {
      ctx.fillStyle = p.color; ctx.font = "600 11px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText(String(p.i + 1), Math.min(Math.max(X(xc), m.l + 6), m.l + cw - 6), cy - ch / 2 - 3);
    }
  });

  ctx.strokeStyle = C.border; ctx.lineWidth = 1; ctx.strokeRect(m.l + 0.5, cy - ch / 2 + 0.5, cw, ch);
  ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillStyle = C.muted; ctx.textBaseline = "middle";
  ctx.textAlign = "right"; ctx.fillText(t("inlet"), m.l - 8, cy);
  ctx.textAlign = "left"; ctx.fillText(t("detector"), m.l + cw + 8, cy);
  ctx.textBaseline = "top"; ctx.textAlign = "left"; ctx.fillText("0", m.l, cy + ch / 2 + 6);
  ctx.textAlign = "right"; ctx.fillText(L + " mm", m.l + cw, cy + ch / 2 + 6);
  ctx.textAlign = "center";
  const phiIn = R.phiAt(0, tNow), phiOut = R.phiAt(L, tNow);
  ctx.fillText(R.iso ? t("colIso", nf(phiIn * 100, 1)) : t("colGrad", nf(phiIn * 100, 0), nf(phiOut * 100, 0), cw > 420),
               m.l + cw / 2, cy + ch / 2 + 24);
}

function drawVD() {
  const R = result, canvas = document.getElementById("vd");
  const { ctx, w, h } = prep(canvas);
  const C = { text: cssVar("--text"), muted: cssVar("--muted"), grid: cssVar("--grid"), border: cssVar("--border"), accent: cssVar("--accent") };
  const m = { l: 44, r: 12, t: 12, b: 34 };
  const pw = w - m.l - m.r, ph = h - m.t - m.b;
  const P = R.P, dpUm = R.s.dp;
  const nuOf = u => u * R.dpmm / R.Dmm;
  const Hof = u => dpUm * (P.A + P.B / nuOf(u) + P.C * nuOf(u));  // µm
  const uMax = Math.max(3 * R.uOpt, 1.3 * R.u);
  const uMin = uMax / 200;
  const Hmin = Hof(R.uOpt);
  const yMax = Math.max(4 * Hmin, 1.25 * Hof(R.u));
  const X = u => m.l + u / uMax * pw, Y = v => m.t + ph - Math.min(v, yMax) / yMax * ph;

  ctx.strokeStyle = C.grid; ctx.fillStyle = C.muted; ctx.lineWidth = 1; ctx.textAlign = "center"; ctx.textBaseline = "top";
  const sx = niceStep(uMax, 5);
  for (let u = 0; u <= uMax + 1e-9; u += sx) { const x = Math.round(X(u)) + 0.5; ctx.beginPath(); ctx.moveTo(x, m.t); ctx.lineTo(x, m.t + ph); ctx.stroke(); ctx.fillText(nf(u, stepDecimals(sx)), x, m.t + ph + 6); }
  ctx.fillText(t("axisVelocity"), m.l + pw / 2, m.t + ph + 20);
  const sy = niceStep(yMax, 4);
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  for (let v = 0; v <= yMax + 1e-9; v += sy) { const y = Math.round(Y(v)) + 0.5; ctx.beginPath(); ctx.moveTo(m.l, y); ctx.lineTo(m.l + pw, y); ctx.stroke(); ctx.fillText(nf(v, stepDecimals(sy)), m.l - 6, y); }
  ctx.save(); ctx.translate(11, m.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("H [µm]", 0, 0); ctx.restore();

  const curve = (f, color, dash, lw) => {
    ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = lw; ctx.beginPath();
    for (let j = 0; j <= 200; j++) { const u = uMin + (uMax - uMin) * j / 200; const y = Y(f(u)); j ? ctx.lineTo(X(u), y) : ctx.moveTo(X(u), y); }
    ctx.stroke(); ctx.setLineDash([]);
  };
  ctx.save(); ctx.beginPath(); ctx.rect(m.l, m.t, pw, ph); ctx.clip();
  curve(() => dpUm * P.A, C.muted, [3, 3], 1);
  curve(u => dpUm * P.B / nuOf(u), C.muted, [3, 3], 1);
  curve(u => dpUm * P.C * nuOf(u), C.muted, [3, 3], 1);
  curve(Hof, C.text, [], 2);
  ctx.restore();

  ctx.fillStyle = C.muted; ctx.beginPath(); ctx.arc(X(R.uOpt), Y(Hmin), 3.5, 0, 7); ctx.fill();
  ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(X(R.u), Y(R.H * 1000), 5.5, 0, 7); ctx.fill();
  ctx.textAlign = X(R.u) > m.l + pw - 90 ? "right" : "left"; ctx.textBaseline = "bottom";
  ctx.fillText(t("operatingPoint"), X(R.u) + (ctx.textAlign === "left" ? 8 : -8), Y(R.H * 1000) - 4);
  ctx.fillStyle = C.muted; ctx.font = "11px system-ui, -apple-system, Segoe UI, Roboto, sans-serif"; ctx.textAlign = "right"; ctx.textBaseline = "top";
  ctx.fillText(t("vdDashed"), m.l + pw - 6, m.t + 4);
  ctx.strokeStyle = C.border; ctx.lineWidth = 1; ctx.strokeRect(m.l + 0.5, m.t + 0.5, pw, ph);
}

// =====================================================================
// Panele liczbowe
// =====================================================================
function renderStats() {
  const R = result, s = R.s;
  const set = (id, v) => { document.getElementById(id).innerHTML = v; };
  const hid = '<span style="color:var(--muted)">?</span>';
  set("k_t0", nf(R.t0, 3) + " min");
  set("k_t0s", `V<sub>M</sub> = ${nInt(R.Vm * 1000)} µL · u = ${nf(R.u, 2)} mm/s`);
  let ncTxt = "";
  if (!R.iso && R.el.length > 1) {
    const wAvg = R.el.reduce((a, p) => a + p.wh, 0) / R.el.length;
    ncTxt = ` · n<sub>c</sub> ≈ ${nInt(1 + (R.el[R.el.length - 1].tR - R.el[0].tR) / (1.7 * wAvg))}`;
  }
  set("k_N", reportMode ? hid : nInt(R.N));
  set("k_Ns", reportMode ? t("calcFromReport") : `H = ${nf(R.H * 1000, 1)} µm · h = ${nf(R.h, 2)}${ncTxt}`);
  const pBadge = R.dP > 1300 ? `<span class="badge bad">${t("pAbove")}</span>` : R.dP > 400 ? `<span class="badge warn">${t("pUhplc")}</span>` : `<span class="badge good">${t("pOk")}</span>`;
  set("k_P", nInt(R.dP) + " bar");
  set("k_Ps", (R.iso ? "" : t("maxInGradient")) + pBadge);
  if (R.crit && !reportMode) {
    const cls = R.crit.Rs >= 1.5 ? "good" : R.crit.Rs >= 1.0 ? "warn" : "bad";
    set("k_Rs", nf(R.crit.Rs, 2));
    set("k_Rss", `<span class="badge ${cls}">${R.crit.Rs >= 1.5 ? t("resolved") : R.crit.Rs >= 1 ? t("partial") : t("coelution")}</span> ${R.crit.a.i + 1} / ${R.crit.b.i + 1}`);
  } else { set("k_Rs", R.crit ? hid : "–"); set("k_Rss", ""); }
  set("k_T", nf(R.runTime, 1) + " min");
  const notEl = R.peaks.filter(p => !p.eluted).length;
  set("k_Ts", notEl ? `<span class="badge bad">${t("notEluting", notEl)}</span>` : (R.iso ? t("toLastPeak") : `t<sub>D</sub> = ${nf(R.tD, 2)} min`));
  set("k_V", nf(s.F * R.runTime, 1) + " mL");
  set("k_Vs", t("atFlow", nf(s.F, 2)));

  document.getElementById("resultsCard").classList.toggle("report", reportMode);
  document.getElementById("thK").innerHTML = R.iso ? "k" : "k<sub>e</sub>";
  document.getElementById("thSN").innerHTML = reportMode ? "h [mAU]" : "S/N";
  const q = '<td class="hid">?</td>';
  const rows = R.el.map(p => {
    const rsCls = p.Rs == null ? "" : p.Rs >= 1.5 ? "good" : p.Rs >= 1 ? "warn" : "bad";
    const asCls = p.As >= 0.8 && p.As <= 1.8 ? "good" : "bad";
    const crit = !reportMode && R.crit && (R.crit.a === p || R.crit.b === p) ? ' class="critical"' : "";
    const snCell = reportMode ? `<td>${R.s.noise > 0 ? sig3(p.hNoise) : "0"}</td>`
      : `<td>${p.SN == null ? "∞" : `<span class="badge ${p.SN >= 10 ? "good" : "bad"}">${p.SN >= 100 ? nInt(p.SN) : nf(p.SN, 1)}</span>`}</td>`;
    return `<tr${crit}><td>${p.i + 1}</td><td><span class="dot" style="background:${p.color}"></span>${escapeHtml(p.name)}</td>
      <td>${nf(p.tR, 3)}</td><td>${nf(p.wh, 4)}</td><td>${sig3(p.H)}</td><td>${sig3(p.area)}</td>
      ${reportMode ? q + q + q : `<td>${nf(R.iso ? p.k : p.kE, 2)}</td><td>${p.alpha == null ? "–" : nf(p.alpha, 3)}</td><td>${R.iso ? nInt(p.N) : "–"}</td>`}
      <td><span class="badge ${asCls}">${nf(p.As, 2)}</span></td>
      ${reportMode ? q : `<td>${p.Rs == null ? "–" : `<span class="badge ${rsCls}">${nf(p.Rs, 2)}</span>`}</td>`}
      ${snCell}</tr>`;
  });
  R.peaks.filter(p => !p.eluted).forEach(p => rows.push(
    `<tr><td>${p.i + 1}</td><td><span class="dot" style="background:${p.color}"></span>${escapeHtml(p.name)}</td><td colspan="10" style="text-align:left;color:var(--bad)">${t("notElutingRow")}</td></tr>`));
  document.getElementById("tbody").innerHTML = rows.join("");
  document.getElementById("tableHint").innerHTML = reportMode
    ? t("hintReport", nf(R.t0, 3), nf(s.F, 2))
    : (R.iso ? t("hintIso") : t("hintGrad"));
  renderLive();
  document.getElementById("vdHint").innerHTML = hideVdHint
    ? t("vdHintHidden")
    : t("vdHint", nf(R.uOpt, 2), nf(R.Fopt, 2), nf(R.Hmin * 1000, 1));
}

// =====================================================================
// Formularz
// =====================================================================
const $ = id => document.getElementById(id);
const NUM = {
  F: [0.01, 5], phiIso: [0, 100], phi0: [0, 100], phi1: [0, 100], tIso0: [0, 60], tG: [0.5, 120], hold: [0, 60],
  VD: [0, 5], sigEC: [0, 100], Vinj: [0.1, 250], noise: [0, 5], Dm: [0.05, 5]
};
const AN_LIM = { logkw: [-8, 12], S: [-15, 15], amt: [0, 100] };

function readNum(id) {
  const el = $(id), [lo, hi] = NUM[id];
  const v = Number(String(el.value).replace(",", "."));
  const ok = el.value !== "" && isFinite(v) && v >= lo && v <= hi;
  el.classList.toggle("invalid", !ok);
  return ok ? v : null;
}

function setSelect(id, val) {
  const el = $(id); const str = String(val);
  const opt = [...el.options].find(o => Number(o.value) === Number(val) || o.value === str);
  el.value = opt ? opt.value : el.options[0].value;
}

function writeForm() {
  setSelect("L", state.L); setSelect("ID", state.ID); setSelect("dp", state.dp);
  $("ptype").value = state.ptype; $("mod").value = state.mod; $("endcap").value = state.endcap ? "1" : "0";
  Object.keys(NUM).forEach(id => { $(id).value = state[id]; $(id).classList.remove("invalid"); });
  $("Fr").value = state.F; $("phiIsoR").value = state.phiIso;
  document.querySelectorAll("#modeSeg button").forEach(b => b.classList.toggle("on", b.dataset.mode === state.mode));
  $("isoBox").classList.toggle("hidden", state.mode !== "iso");
  $("gradBox").classList.toggle("hidden", state.mode !== "grad");
  renderAnalytes();
}

function renderAnalytes() {
  $("anList").innerHTML = `<div class="an-head"><span></span><span>${t("anName")}</span><span>log k<sub>w</sub></span><span>S</span><span>${t("anAmount")}</span><span title="${t("anBasicTitle")}">${t("anBasic")}</span><span></span></div>` +
    state.analytes.map((a, i) => `<div class="an-row" data-i="${i}">
      <span class="dot" style="background:${PALETTE[i % PALETTE.length]};margin:0"></span>
      <input type="text" data-k="name" value="${escapeHtml(a.name)}" aria-label="${t("anName")} ${i + 1}">
      <input type="number" data-k="logkw" step="0.05" value="${a.logkw}" aria-label="log kw">
      <input type="number" data-k="S" step="0.1" value="${a.S}" aria-label="S">
      <input type="number" data-k="amt" step="any" min="0" value="${a.amt}" aria-label="${t("anAmount")}">
      <input type="checkbox" data-k="basic" ${a.basic ? "checked" : ""} aria-label="${t("anBasicTitle")}">
      <button class="del" title="${t("remove")}" aria-label="${t("remove")} ${i + 1}">×</button></div>`).join("");
  $("addAn").disabled = state.analytes.length >= MAX_ANALYTES;
}

function readForm() {
  let ok = true;
  ["L", "ID", "dp"].forEach(id => { state[id] = Number($(id).value); });
  state.ptype = $("ptype").value; state.mod = $("mod").value; state.endcap = $("endcap").value === "1";
  Object.keys(NUM).forEach(id => { const v = readNum(id); if (v == null) ok = false; else state[id] = v; });
  document.querySelectorAll(".an-row").forEach(row => {
    const a = state.analytes[+row.dataset.i];
    row.querySelectorAll("input").forEach(inp => {
      const k = inp.dataset.k;
      if (k === "name") { a.name = inp.value; return; }
      if (k === "basic") { a.basic = inp.checked; return; }
      const v = Number(String(inp.value).replace(",", ".")), [lo, hi] = AN_LIM[k];
      const good = inp.value !== "" && isFinite(v) && v >= lo && v <= hi;
      inp.classList.toggle("invalid", !good);
      if (good) a[k] = v; else ok = false;
    });
  });
  return ok;
}

let pending = false;
function update() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    readForm();
    result = compute(state);
    stopPlay(); animT = null;
    renderStats(); redraw();
  });
}
function applyState(s) {           // natychmiastowe przeliczenie (zajęcia)
  state = JSON.parse(JSON.stringify(s));
  writeForm();
  result = compute(state);
  stopPlay(); animT = null;
  renderStats(); redraw();
}

function redraw() {
  if (!result) return;
  drawChrom(animT); drawColumn(animT); drawVD();
  const T = animT == null ? result.tEnd : animT;
  $("scrub").value = Math.round(T / result.tEnd * 1000);
  $("tLabel").textContent = "t = " + nf(T, 2) + " min";
}

// =====================================================================
// Animacja
// =====================================================================
let lastFrame = 0;
function frame(ts) {
  if (!playing) return;
  const dtReal = lastFrame ? (ts - lastFrame) / 1000 : 0; lastFrame = ts;
  animT = (animT == null ? 0 : animT) + dtReal * result.tEnd / 14;
  if (animT >= result.tEnd) { animT = null; stopPlay(); }
  redraw();
  if (playing) requestAnimationFrame(frame);
}
function startPlay() {
  if (animT == null || animT >= result.tEnd) animT = 0;
  playing = true; lastFrame = 0; $("play").textContent = t("pause"); requestAnimationFrame(frame);
}
function stopPlay() { playing = false; $("play").textContent = t("play"); }



// =====================================================================
// Stałe modelu
// =====================================================================
const PALETTE = ["#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2", "#65a30d"];
const PARTICLES = {
  porous:    { A: 1.2, B: 2.0, C: 0.08, eps: 0.65 },
  coreshell: { A: 0.7, B: 1.6, C: 0.06, eps: 0.50 }
};
const FLOW_RESISTANCE = 1500;   // Φ w prawie Darcy'ego
const MAX_ANALYTES = 8;
const AREA_SCALE = 1000;        // pole [mAU·s] dla ilości 1, V_inj 10 µL, F 1 mL/min
const GRID = 5000;              // punkty chromatogramu

function viscosity(phi, mod) {  // cP, 25 °C, przybliżenie empiryczne
  return mod === "MeOH"
    ? 0.89 * (1 - phi) + 0.54 * phi + 3.0 * phi * (1 - phi)
    : 0.89 * (1 - phi) + 0.34 * phi + 0.9 * phi * (1 - phi);
}
function tailFactor(a, s) {     // τ/σ_kol
  if (!a.basic) return 0.12;
  return s.endcap ? 0.5 : 3.2;
}

const DEFAULT_ANALYTES = [
  { name: L10.names.analyte(1), logkw: 1.00, S: 2.5, amt: 1.0, basic: false },
  { name: L10.names.analyte(2), logkw: 1.80, S: 3.5, amt: 0.8, basic: false },
  { name: L10.names.analyte(3), logkw: 2.40, S: 4.0, amt: 1.0, basic: false },
  { name: L10.names.analyte(4), logkw: 2.55, S: 4.3, amt: 0.7, basic: false },
  { name: L10.names.analyte(5), logkw: 3.10, S: 4.6, amt: 1.2, basic: false }
];

const BASE = { L: 150, ID: 4.6, dp: 5, ptype: "porous", endcap: true, F: 1.0, mod: "ACN", mode: "iso", phiIso: 40,
               phi0: 10, phi1: 90, tIso0: 0, tG: 20, hold: 3, VD: 1.0, sigEC: 12, Vinj: 10, noise: 0.005, Dm: 1.0 };

const PRESETS = {
  uhplc: {
    hint: L10.presets.uhplc,
    s: Object.assign({}, BASE, { L: 100, ID: 2.1, dp: 1.7, F: 0.4, mode: "grad", phi0: 5, phi1: 95, tG: 10, hold: 2, VD: 0.35, sigEC: 4, Vinj: 2 })
  },
  hplc: {
    hint: L10.presets.hplc,
    s: Object.assign({}, BASE)
  },
  crit: {
    hint: L10.presets.crit,
    s: Object.assign({}, BASE, { dp: 3.5, phiIso: 46 })
  },
  gep: {
    hint: L10.presets.gep,
    s: Object.assign({}, BASE, { phiIso: 30 })
  },
  ecv: {
    hint: L10.presets.ecv,
    s: Object.assign({}, BASE, { L: 50, ID: 2.1, dp: 1.7, ptype: "coreshell", F: 0.5, phiIso: 45, VD: 0.35, sigEC: 10, Vinj: 1 })
  }
};

const cloneAn = arr => arr.map(a => Object.assign({}, a));
let state = Object.assign({}, PRESETS.uhplc.s, { analytes: cloneAn(DEFAULT_ANALYTES) });
let result = null;
let animT = null;      // null = pełny chromatogram
let playing = false;
let reportMode = false;
let hideVdHint = false;

// =====================================================================
// Pomocnicze
// =====================================================================
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function gaussRand(rng) {
  let u = 0; while (u === 0) u = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

// Kształt piku: gauss (μ, σ) splecony z wykładniczym ogonem τ; pole = area [mAU·min]
function peakShape(mu, sigma, tau, area) {
  const t0 = mu - 6 * sigma, t1 = mu + 7 * sigma + 12 * tau;
  const M = 1600, dt = (t1 - t0) / (M - 1);
  const y = new Float64Array(M);
  const c = area / (sigma * Math.sqrt(2 * Math.PI));
  for (let i = 0; i < M; i++) { const z = (t0 + i * dt - mu) / sigma; y[i] = c * Math.exp(-0.5 * z * z); }
  if (tau > 0.2 * dt) {
    const a = Math.exp(-dt / tau);
    let prev = 0;
    for (let i = 0; i < M; i++) { prev = a * prev + (1 - a) * y[i]; y[i] = prev; }
  }
  return { t0, dt, y, M };
}
function shapeAt(sh, t) {
  const f = (t - sh.t0) / sh.dt;
  if (f < 0 || f >= sh.M - 1) return 0;
  const i = Math.floor(f), r = f - i;
  return sh.y[i] * (1 - r) + sh.y[i + 1] * r;
}
// Pomiar piku wg Ph. Eur. 2.2.46: t_R (maksimum), H, w_h, w_0,05, d, A_s
function measurePeak(sh) {
  const { y, dt, t0, M } = sh;
  let im = 0;
  for (let i = 1; i < M; i++) if (y[i] > y[im]) im = i;
  let tA = t0 + im * dt, H = y[im];
  if (im > 0 && im < M - 1) {
    const y0 = y[im - 1], y1 = y[im], y2 = y[im + 1], den = y0 - 2 * y1 + y2;
    if (den !== 0) { const d = 0.5 * (y0 - y2) / den; tA += d * dt; H = y1 - 0.25 * (y0 - y2) * d; }
  }
  const cross = (lev, dir) => {
    let i = im;
    while (i + dir >= 0 && i + dir < M && y[i + dir] >= lev) i += dir;
    const j = i + dir;
    if (j < 0 || j >= M) return t0 + i * dt;
    const f = (y[i] - lev) / (y[i] - y[j]);
    return t0 + (i + dir * f) * dt;
  };
  const hl = cross(H / 2, -1), hr = cross(H / 2, 1);
  const l5 = cross(0.05 * H, -1), r5 = cross(0.05 * H, 1);
  return { tR: tA, H, wh: hr - hl, w05: r5 - l5, d: tA - l5, As: (r5 - l5) / (2 * (tA - l5)) };
}

// =====================================================================
// Obliczenia
// =====================================================================
function compute(s) {
  const P = PARTICLES[s.ptype];
  const L = s.L, r = s.ID / 2, dpmm = s.dp / 1000;
  const Vm = P.eps * Math.PI * r * r * L / 1000;   // mL
  const t0 = Vm / s.F;                             // min
  const uMin = L / t0, u = uMin / 60;              // mm/min, mm/s
  const Dmm = s.Dm * 1e-5 * 100;                   // mm²/s
  const nu = u * dpmm / Dmm;
  const h = P.A + P.B / nu + P.C * nu;
  const H = h * dpmm;                              // mm
  const N = L / H;
  const sigVtot = Math.sqrt(s.sigEC * s.sigEC + s.Vinj * s.Vinj / 12);   // µL
  const sigEC = (sigVtot / 1000) / s.F;            // min
  const iso = s.mode === "iso";
  const tD = iso ? 0 : s.VD / s.F;
  const p0 = s.phi0 / 100, p1 = s.phi1 / 100, pIso = s.phiIso / 100;
  const tI = iso ? 0 : s.tIso0;

  const phiProg = iso
    ? () => pIso
    : (tau) => tau <= tI ? p0 : (tau >= tI + s.tG ? p1 : p0 + (p1 - p0) * (tau - tI) / s.tG);
  const phiAt = (x, t) => phiProg(t - tD - (x / L) * t0);
  const kOf = (a, phi) => Math.pow(10, a.logkw - a.S * phi);

  const progEnd = iso ? 0 : tD + t0 + tI + s.tG + s.hold;
  const tMax = progEnd + 150 * t0;
  const dt = t0 / 400;

  const peaks = s.analytes.map((a, i) => {
    let x = 0, t = 0, step = 0;
    const tr = [0], xr = [0];
    while (x < L && t < tMax) {
      const k1 = kOf(a, phiAt(x, t));
      const xm = x + 0.5 * dt * uMin / (1 + k1);
      const k2 = kOf(a, phiAt(xm, t + 0.5 * dt));
      const xn = x + dt * uMin / (1 + k2);
      if (xn >= L) { t += dt * (L - x) / (xn - x); x = L; }
      else { x = xn; t += dt; }
      if (++step % 4 === 0 || x >= L) { tr.push(t); xr.push(x); }
    }
    const p = { i, name: a.name || L10.names.analyte(i + 1), color: PALETTE[i % PALETTE.length], amt: a.amt,
                eluted: x >= L, traj: { t: tr, x: xr } };
    if (!p.eluted) return p;
    p.mu = t;
    p.kE = kOf(a, phiAt(L, t));
    const sigCol = t0 * (1 + p.kE) / Math.sqrt(N);
    p.sigma = Math.sqrt(sigCol * sigCol + sigEC * sigEC);
    p.tau = tailFactor(a, s) * sigCol;
    p.area = AREA_SCALE * a.amt * (s.Vinj / 10) / s.F;         // mAU·s
    p.shape = peakShape(p.mu, p.sigma, p.tau, p.area / 60);
    Object.assign(p, measurePeak(p.shape));
    p.k = (p.tR - t0) / t0;
    p.N = 5.54 * Math.pow(p.tR / p.wh, 2);
    // S/N = 2H/h, h – rozstęp szumu ślepej próby w oknie 5·w_h (10 Hz)
    if (s.noise > 0) {
      const n = Math.max(20, Math.round(5 * p.wh * 60 * 10));
      const rng = mulberry32(1000 + i * 7919);
      let mn = Infinity, mx = -Infinity;
      for (let j = 0; j < n; j++) { const v = s.noise * gaussRand(rng); if (v < mn) mn = v; if (v > mx) mx = v; }
      p.hNoise = mx - mn; p.SN = 2 * p.H / p.hNoise;
    } else { p.hNoise = 0; p.SN = null; }
    return p;
  });

  const el = peaks.filter(p => p.eluted).sort((a, b) => a.tR - b.tR);
  let crit = null;
  el.forEach((p, j) => {
    p.Rs = null; p.alpha = null;
    if (j > 0) {
      const q = el[j - 1];
      p.Rs = 1.18 * (p.tR - q.tR) / (p.wh + q.wh);
      if (iso && q.k > 0) p.alpha = p.k / q.k;
      if (!crit || p.Rs < crit.Rs) crit = { Rs: p.Rs, a: q, b: p };
    }
  });

  // Ciśnienie (maksimum po składzie fazy)
  const us = (s.F * 1e-6 / 60) / (Math.PI * Math.pow(r / 1000, 2));   // m/s
  const phis = iso ? [pIso] : Array.from({ length: 41 }, (_, j) => Math.min(p0, p1) + Math.abs(p1 - p0) * j / 40);
  const etaMax = Math.max(...phis.map(p => viscosity(p, s.mod)));
  const dP = FLOW_RESISTANCE * etaMax * 1e-3 * (L / 1000) * us / Math.pow(dpmm / 1000, 2) / 1e5;  // bar

  const lastPeak = el.length ? Math.max(...el.map(p => p.mu + 5 * p.sigma + 6 * p.tau)) : 2 * t0;
  const tEnd = Math.max(lastPeak, progEnd, 1.5 * t0) * 1.02;

  // Sygnał na siatce wyświetlania
  const ts = new Float64Array(GRID + 1), tot = new Float64Array(GRID + 1), noise = new Float64Array(GRID + 1);
  for (let j = 0; j <= GRID; j++) ts[j] = j / GRID * tEnd;
  el.forEach(p => {
    p.sig = new Float64Array(GRID + 1);
    const j0 = Math.max(0, Math.floor(p.shape.t0 / tEnd * GRID)), j1 = Math.min(GRID, Math.ceil((p.shape.t0 + p.shape.dt * p.shape.M) / tEnd * GRID));
    for (let j = j0; j <= j1; j++) { const v = shapeAt(p.shape, ts[j]); p.sig[j] = v; tot[j] += v; }
    p.jA = Math.round(p.tR / tEnd * GRID);
  });
  const rng = mulberry32(12345);
  for (let j = 0; j <= GRID; j++) noise[j] = s.noise * gaussRand(rng);

  const nuOpt = Math.sqrt(P.B / P.C);
  const uOpt = nuOpt * Dmm / dpmm;
  const Fopt = s.F * uOpt / u;
  const Hmin = dpmm * (P.A + 2 * Math.sqrt(P.B * P.C));   // mm

  const runEnd = el.length ? Math.max(...el.map(p => p.mu + 4 * p.sigma + 4 * p.tau)) : 0;
  return { s, P, t0, u, nu, h, H, N, sigEC, sigVtot, tD, iso, phiProg, phiAt, peaks, el, crit, dP, tEnd,
           runTime: Math.max(runEnd, progEnd), uOpt, Fopt, Hmin, Dmm, dpmm, Vm, ts, tot, noise };
}


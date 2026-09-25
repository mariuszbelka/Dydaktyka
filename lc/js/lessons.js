// =====================================================================
// Zajęcia – logika zadań (wspólna dla wszystkich języków).
// Teksty (tytuły, treść, pytania, komunikaty) są w i18n/<język>.js
// w tablicy L10.lessons o tej samej kolejności lekcji i kroków.
// =====================================================================
const NM = L10.names;
const MIX3 = () => [
  { name: NM.impurity("A"), logkw: 1.80, S: 3.5, amt: 0.5, basic: false },
  { name: NM.api, logkw: 2.40, S: 4.0, amt: 1.0, basic: false },
  { name: NM.impurity("B"), logkw: 2.55, S: 4.3, amt: 0.5, basic: false }
];
const MIX4 = () => MIX3().concat([{ name: NM.impurity("C"), logkw: 3.10, S: 4.6, amt: 0.5, basic: false }]);
const LS = (over, analytes) => Object.assign({}, BASE, over || {}, { analytes: analytes || MIX3() });
const pk = (R, i) => R.peaks[i];
const pairRs = (R, i, j) => {
  const a = R.peaks[i], b = R.peaks[j];
  if (!a.eluted || !b.eluted) return 0;
  return 1.18 * Math.abs(b.tR - a.tR) / (a.wh + b.wh);
};
const sameCol = (S, B) => S.L === B.L && S.ID === B.ID && S.dp === B.dp && S.ptype === B.ptype && S.endcap === B.endcap;
const fmt = v => nf(v, Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : Math.abs(v) >= 1 ? 2 : 3);
const REF = t => `<p class="ref">${t}</p>`;
const RSD_T90 = { 2: 2.920, 3: 2.353, 4: 2.132, 5: 2.015 };
const within = (v, lo, hi) => v >= lo - 1e-9 && v <= hi + 1e-9;
const K = (name, k, phi, S, amt, basic) => ({ name, logkw: +(Math.log10(k) + S * phi).toFixed(3), S, amt, basic: !!basic });
const COND = rows => `<table class="cond">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</table>`;
const t0Of = (L, ID, F, eps) => (eps || 0.65) * Math.PI * (ID / 2) ** 2 * L / 1000 / F;
function pvRatio(R, i, j) {           // p/v: i – pik mniejszy, j – pik główny
  const a = R.peaks[i], b = R.peaks[j];
  if (!a.eluted || !b.eluted) return 0;
  const j0 = Math.min(a.jA, b.jA), j1 = Math.max(a.jA, b.jA);
  let mn = Infinity;
  for (let k = j0; k <= j1; k++) mn = Math.min(mn, R.tot[k]);
  const Hp = R.tot[a.jA];
  return mn <= Hp * 1e-4 ? Infinity : Hp / mn;
}
const fmtPv = v => isFinite(v) ? nf(v, 2) : L10.msg.pvInf;
const minRsAll = R => R.el.reduce((m, p) => p.Rs == null ? m : Math.min(m, p.Rs), Infinity);
const refArea = S => AREA_SCALE * 0.001 * (S.Vinj / 10) / S.F;   // pole piku w roztworze porównawczym (a), 0,1%

// ---------- Monografie: warunki i dopasowane retencje ----------
const SMX_SET = Object.assign({}, BASE, { L: 250, ID: 4.0, dp: 5, F: 0.9, mod: "MeOH", mode: "iso", phiIso: 35, sigEC: 12, Vinj: 20 });
const T0_SMX = t0Of(250, 4.0, 0.9);
const smx = (name, rrt, S, amt) => K(name, rrt * 10 / T0_SMX - 1, 0.35, S, amt);
const SMX_NAMES = [NM.smx, NM.impurity("B"), NM.impurity("D"), NM.impurity("A"), NM.impurity("F"), NM.impurity("C"), NM.impurity("E")];
const SMX_RRT = [[1, 3.5], [2.0, 4.5], [0.3, 1.5], [1.2, 3.8], [0.45, 3.0], [0.5, 2.5], [0.35, 2.0]];
const smxMix = (named, amt) => SMX_RRT.map(([r, S], i) => smx(named || i === 0 ? SMX_NAMES[i] : NM.peak(i + 1), r, S, i === 0 ? 1 : amt));

const AA_SET = Object.assign({}, BASE, { L: 250, ID: 4.6, dp: 5, F: 1.0, mod: "ACN", mode: "iso", phiIso: 75, sigEC: 12, Vinj: 20 });
const T0_AA = t0Of(250, 4.6, 1.0);
const aa = (name, rrt, S, amt) => K(name, rrt * 9 / T0_AA - 1, 0.75, S, amt);

const VER_SET = Object.assign({}, BASE, { L: 250, ID: 4.6, dp: 5, F: 1.5, mod: "ACN", mode: "grad", phi0: 37, phi1: 65, tIso0: 22, tG: 5, hold: 18, VD: 1.0, sigEC: 12, Vinj: 10 });
const T0_VER = t0Of(250, 4.6, 1.5);
const ver = (name, rrt, S, amt) => K(name, rrt * 15 / T0_VER - 1, 0.37, S, amt, true);
const VER_MIX = () => [ver(NM.verapamil, 1, 4.5, 1.0), ver(NM.impurity("I"), 1.3, 4.8, 1.0), K(NM.impurity("M"), 398, 0.37, 7.0, 1.0, true)];

const ASP_SET = Object.assign({}, BASE, { L: 250, ID: 4.0, dp: 5, F: 1.0, mod: "ACN", mode: "iso", phiIso: 10, sigEC: 12, Vinj: 20 });
const ASP_MIX = () => [K(NM.aspC, 1.2, 0.10, 3.0, 0.3), K(NM.aspB, 1.55, 0.10, 3.2, 0.3),
                       K(NM.aspA, 3.0, 0.10, 3.5, 0.3), K(NM.aspartame, 6.0, 0.10, 4.0, 1.0)];

const T0_ERY = t0Of(250, 4.6, 1.0);
const ery = (name, rrt, S, amt) => K(name, rrt * 23 / T0_ERY - 1, 0.35, S, amt, true);
const ERY_MIX = () => [ery(NM.impurity("A"), 0.4, 5.0, 0.02), ery(NM.impurity("B"), 0.52, 5.5, 0.03), ery(NM.eryC, 0.55, 5.2, 0.03),
  ery(NM.impurity("C"), 0.9, 5.6, 0.03), ery(NM.eryA, 1.0, 5.5, 1.0), ery(NM.eryB, 1.75, 5.8, 0.05),
  ery(NM.impurity("F"), 1.81, 6.2, 0.015), K(NM.impurity("E"), 38.3, 0.35, 6.0, 0.03, true)];
const ERY_SET = Object.assign({}, BASE, { L: 250, ID: 4.6, dp: 3.5, F: 1.0, mod: "ACN", mode: "grad", phi0: 35, phi1: 50, tIso0: 40.3, tG: 2, hold: 13, VD: 1.0, sigEC: 12, Vinj: 200, Dm: 0.5 });
function eryBIso(S) {                // t_R erytromycyny B w izokracji fazą A
  const s = Object.assign({}, S, { mode: "iso", phiIso: S.phi0, analytes: [S.analytes[5]] });
  const R = compute(s);
  return R.peaks[0].eluted ? R.peaks[0].tR : Infinity;
}

// Wspólne sprawdzenia „czy zmieniono tylko dozwolone parametry”
function snGoal(R, S, B, m, min) {   // S/N z dozwolonymi zmianami (2.2.46)
  if (S.phiIso !== B.phiIso || S.mode !== "iso") return { ok: false, msg: m.keepMobile };
  if (!S.analytes[0] || S.analytes[0].amt !== B.analytes[0].amt) return { ok: false, msg: m.keepConc };
  if (S.noise !== B.noise) return { ok: false, msg: m.keepNoise };
  const ld = S.L / S.dp, ld0 = B.L / B.dp;
  if (!within(ld, 0.75 * ld0, 1.5 * ld0)) return { ok: false, msg: m.ldRange(nf(ld, 1), nf(0.75 * ld0, 1), nf(1.5 * ld0, 1)) };
  const F2 = B.F * (S.ID * S.ID * B.dp) / (B.ID * B.ID * S.dp);
  if (!within(S.F, 0.5 * F2, 1.5 * F2)) return { ok: false, msg: m.flowScaled(nf(F2, 2)) };
  const sn = pk(R, 0).SN;
  return sn >= min ? { ok: true, msg: m.snOk(nf(sn, 1)) } : { ok: false, msg: m.snLow(nf(sn, 1)) };
}

const LESSON_LOGIC = [
  { group: "p", steps: [                                                         // 1. Parametry
    { setup: LS(), report: true, task: { type: "num", unit: "mL", answer: R => R.t0 * R.s.F, tol: 0.03 } },
    { report: true, task: { type: "num", answer: R => pk(R, 1).k, tol: 0.03 } },
    { report: true, task: { type: "num", answer: R => pk(R, 2).k / pk(R, 1).k, tol: 0.006, abs: true } },
    { report: true, task: { type: "num", answer: R => pk(R, 1).N, tol: 0.04 } },
    { report: true, task: { type: "num", answer: R => pairRs(R, 1, 2), tol: 0.04 } },
    { report: true, task: { type: "num", answer: R => pk(R, 0).tR / pk(R, 1).tR, tol: 0.01, abs: true } },
    { report: true, task: { type: "choice", correct: 1 } }
  ] },
  { group: "p", steps: [                                                         // 2. Retencja i selektywność
    { setup: LS(), task: { type: "choice", correct: 1 } },
    { setup: LS({ phiIso: 50 }), task: { type: "goal", check: (R, S, B, ref, m) => {
        if (!sameCol(S, B) || S.F !== B.F || S.mode !== "iso") return { ok: false, msg: m.onlyPhi };
        const k1 = R.el.length ? R.el[0].k : 0, rs = pairRs(R, 1, 2), f = [];
        if (k1 < 2) f.push(m.k1Low(nf(k1, 2)));
        if (rs < 1.5) f.push(m.rsLow(nf(rs, 2)));
        if (R.runTime > 16) f.push(m.timeHigh(nf(R.runTime, 1), 16));
        return f.length ? { ok: false, msg: m.notYet(f) } : { ok: true, msg: m.ok(nf(k1, 2), nf(rs, 2), nf(R.runTime, 1), nf(S.phiIso, 1)) };
      } } },
    { setup: LS({ phiIso: 55 }), task: { type: "choice", correct: 1 } },
    { setup: LS(), task: { type: "choice", correct: 1 } },
    { setup: LS(), task: { type: "goal", check: (R, S, B, ref, m) => {
        if (!sameCol(S, B) || S.mode !== "iso") return { ok: false, msg: m.keepColMode };
        if (!within(S.phiIso, 30, 50)) return { ok: false, msg: m.phiRange(nf(S.phiIso, 1)) };
        if (!within(S.F, 0.5 * B.F, 1.5 * B.F)) return { ok: false, msg: m.flowRange(nf(S.F, 2)) };
        const rs = pairRs(R, 1, 2);
        return rs >= 2.0 ? { ok: true, msg: m.ok(nf(rs, 2), nf(S.phiIso, 1), nf(S.F, 2)) } : { ok: false, msg: m.low(nf(rs, 2)) };
      } } }
  ] },
  { group: "p", steps: [                                                         // 3. Sprawność
    { setup: LS({ F: 2.0 }), hideVd: true, task: { type: "goal", check: (R, S, B, ref, m) => {
        if (!sameCol(S, B)) return { ok: false, msg: m.keepCol };
        const dev = (R.H - R.Hmin) / R.Hmin;
        return dev <= 0.02 ? { ok: true, msg: m.ok(nf(R.H * 1000, 2), nf(R.Hmin * 1000, 2), nf(S.F, 2)) }
                           : { ok: false, msg: m.high(nf(R.H * 1000, 2), nf(dev * 100, 0)) };
      } } },
    { setup: LS(), task: { type: "choice", correct: 1 } },
    { setup: LS(), task: { type: "num", unit: "mL/min", answer: () => 1.0 * (2.1 * 2.1 * 5) / (4.6 * 4.6 * 3), tol: 0.03 } },
    { setup: LS(), task: { type: "goal", check: (R, S, B, ref, m) => {
        if (S.L !== 100 || S.ID !== 2.1 || S.dp !== 3) return { ok: false, msg: m.setCol };
        if (S.mode !== "iso" || S.phiIso !== 40) return { ok: false, msg: m.keepPhi };
        const F2 = 1.0 * (2.1 * 2.1 * 5) / (4.6 * 4.6 * 3);
        if (!within(S.F, 0.5 * F2, 1.5 * F2)) return { ok: false, msg: m.flow(nf(S.F, 2), nf(F2, 2)) };
        const rs = pairRs(R, 1, 2);
        if (rs < 1.5) return { ok: false, msg: m.rs(nf(rs, 2), S.sigEC > 6) };
        if (R.dP > 400) return { ok: false, msg: m.pressure(nInt(R.dP)) };
        return { ok: true, msg: m.ok(nf(rs, 2), nInt(R.dP), nf(R.runTime, 1), nf(S.F * R.runTime, 1)) };
      } } },
    { task: { type: "choice", correct: 1 } }
  ] },
  { group: "p", steps: [                                                         // 4. Aparatura
    { setup: LS({ L: 50, ID: 2.1, dp: 1.7, F: 0.5, sigEC: 12, Vinj: 1 }), task: { type: "goal", check: (R, S, B, ref, m) => {
        if (!sameCol(S, B) || S.F !== B.F || S.phiIso !== B.phiIso || S.mode !== "iso") return { ok: false, msg: m.onlyInstr };
        const rs = pairRs(R, 1, 2);
        return rs >= 1.5 ? { ok: true, msg: m.ok(nf(rs, 2), nf(S.sigEC, 1)) } : { ok: false, msg: m.low(nf(rs, 2)) };
      } } },
    { task: { type: "choice", correct: 1 } },
    { setup: LS({ L: 100, ID: 2.1, dp: 1.7, F: 0.5, sigEC: 4, Vinj: 1 }), task: { type: "goal", check: (R, S, B, ref, m) => {
        if (!sameCol(S, B)) return { ok: false, msg: m.keepCol };
        if (R.dP > 400) return { ok: false, msg: m.over(nInt(R.dP)) };
        if (R.dP < 370) return { ok: false, msg: m.under(nInt(R.dP)) };
        return { ok: true, msg: m.ok(nf(S.F, 2), nInt(R.dP), nf(R.Fopt, 2)) };
      } } },
    { setup: LS({ mode: "grad", phi0: 10, phi1: 90, tG: 20, hold: 3, VD: 1.0 }, MIX4()), task: { type: "num", unit: "min", answer: () => 0.65, tol: 0.02, abs: true } },
    { setup: LS({ mode: "grad", phi0: 10, phi1: 90, tG: 20, hold: 3, VD: 0.35 }, MIX4()),
      ref: LS({ mode: "grad", phi0: 10, phi1: 90, tG: 20, hold: 3, VD: 1.0 }, MIX4()),
      task: { type: "goal", check: (R, S, B, Rref, m) => {
        const keys = ["L", "ID", "dp", "F", "phi0", "phi1", "tG", "VD"];
        if (keys.some(k => S[k] !== B[k]) || S.mode !== "grad") return { ok: false, msg: m.onlyIso };
        const worst = Math.max(...R.peaks.map((p, i) => p.eluted ? Math.abs(p.tR - Rref.peaks[i].tR) / Rref.peaks[i].tR : 1));
        return worst <= 0.01 ? { ok: true, msg: m.ok(nf(worst * 100, 2), nf(S.tIso0, 2)) } : { ok: false, msg: m.dev(nf(worst * 100, 1)) };
      } } }
  ] },
  { group: "p", steps: [                                                         // 5. SST
    { setup: LS({ endcap: false }, [
        { name: NM.impurity("A"), logkw: 1.80, S: 3.5, amt: 0.5, basic: false },
        { name: NM.apiBase, logkw: 2.40, S: 4.0, amt: 1.0, basic: true },
        { name: NM.impurity("B"), logkw: 2.55, S: 4.3, amt: 0.5, basic: false }]),
      task: { type: "goal", check: (R, S, B, ref, m) => {
        if (S.phiIso !== B.phiIso || S.mode !== "iso") return { ok: false, msg: m.keepMobile };
        if (!S.analytes[1] || !S.analytes[1].basic) return { ok: false, msg: m.keepBase };
        const as = pk(R, 1).As;
        return within(as, 0.8, 1.8) ? { ok: true, msg: m.ok(nf(as, 2)) } : { ok: false, msg: m.out(nf(as, 2)) };
      } } },
    { task: { type: "choice", correct: 1 } },
    { setup: LS({}, [{ name: NM.api005, logkw: 2.40, S: 4.0, amt: 0.0005, basic: false }]), report: true,
      task: { type: "num", answer: R => pk(R, 0).SN, tol: 0.04 } },
    { setup: LS({}, [{ name: NM.api005, logkw: 2.40, S: 4.0, amt: 0.0005, basic: false }]),
      task: { type: "goal", check: (R, S, B, ref, m) => snGoal(R, S, B, m, 10) } },
    { task: { type: "num", unit: "%", answer: () => 0.349 * 2.0 * Math.sqrt(6) / RSD_T90[5], tol: 0.012, abs: true } }
  ] },
  { group: "m", steps: [                                                         // 6. Sulfametoksazol (0108)
    { setup: Object.assign({}, SMX_SET, { analytes: smxMix(false, 0.1) }), task: { type: "choice", correct: 1 } },
    { task: { type: "choice", correct: 2 } },
    { setup: Object.assign({}, SMX_SET, { analytes: [smx(NM.smx, 1, 3.5, 0.1), smx(NM.impurity("A"), 1.2, 3.8, 0.1)] }), report: true,
      task: { type: "num", answer: R => pairRs(R, 0, 1), tol: 0.04 } },
    { setup: Object.assign({}, SMX_SET, { analytes: smxMix(true, 0.1) }), task: { type: "goal", check: (R, S, B, ref, m) => {
        if (!sameCol(S, B) || S.mode !== "iso" || S.mod !== "MeOH") return { ok: false, msg: m.keepColMod };
        if (!within(S.phiIso, 25, 45)) return { ok: false, msg: m.phiRange(nf(S.phiIso, 1)) };
        if (!within(S.F, 0.45, 1.35)) return { ok: false, msg: m.flowRange(nf(S.F, 2)) };
        const T = 3 * pk(R, 0).tR, rs = pairRs(R, 0, 3), mr = minRsAll(R), f = [];
        if (T > 20) f.push(m.time(nf(T, 1)));
        if (rs < 3.5) f.push(m.rsA(nf(rs, 2)));
        if (mr < 1.5) f.push(m.rsMin(nf(mr, 2)));
        return f.length ? { ok: false, msg: m.notYet(f) } : { ok: true, msg: m.ok(nf(T, 1), nf(S.phiIso, 1), nf(S.F, 2), nf(rs, 2)) };
      } } },
    { setup: Object.assign({}, SMX_SET, { analytes: [smx(NM.smx, 1, 3.5, 1.0), smx(NM.impurity("A"), 1.2, 3.8, 0.0007), smx(NM.impurity("C"), 0.5, 2.5, 0.0003)] }), report: true,
      task: { type: "num", unit: "%", answer: R => pk(R, 1).area / refArea(R.s) * 0.1, tol: 0.004, abs: true } }
  ] },
  { group: "m", steps: [                                                         // 7. Kwas askorbinowy (0253)
    { setup: Object.assign({}, AA_SET, { analytes: [aa(NM.impurity("D"), 0.5, -2.5, 0.3), aa(NM.ascorbic, 1, -3.0, 1.0), aa(NM.impurity("C"), 1.45, -3.5, 0.3)] }),
      task: { type: "choice", correct: 1 } },
    { task: { type: "choice", correct: 1 } },
    { setup: Object.assign({}, AA_SET, { analytes: [aa(NM.ascorbic, 1, -3.0, 0.1), aa(NM.impurity("C"), 1.45, -3.5, 0.8)] }), report: true,
      task: { type: "num", answer: R => pairRs(R, 0, 1), tol: 0.04 } },
    { setup: Object.assign({}, AA_SET, { noise: 0.006, analytes: [aa(NM.impurityC01, 1.45, -3.5, 0.001)] }),
      task: { type: "goal", check: (R, S, B, ref, m) => snGoal(R, S, B, m, 20) } }
  ] },
  { group: "m", steps: [                                                         // 8. Werapamil (0573)
    { setup: Object.assign({}, VER_SET, { analytes: VER_MIX() }), task: { type: "choice", correct: 1 } },
    { report: true, task: { type: "num", answer: R => pairRs(R, 0, 1), tol: 0.04 } },
    { task: { type: "choice", correct: 1 } },
    { setup: Object.assign({}, VER_SET, { analytes: VER_MIX() }), task: { type: "goal", check: (R, S, B, ref, m) => {
        if (S.L !== 150 || S.ID !== 4.6 || S.dp !== 3) return { ok: false, msg: m.setCol };
        if (S.mode !== "grad" || S.phi0 !== 37 || S.phi1 !== 65) return { ok: false, msg: m.keepPhases };
        if (!within(S.F, 1.25, 3.75)) return { ok: false, msg: m.flowRange(nf(S.F, 2)) };
        if (R.dP > 400) return { ok: false, msg: m.pressure(nInt(R.dP)) };
        const f = (1.5 / S.F) * (150 / 250), bad = [];
        if (Math.abs(S.tIso0 - 22 * f) > 0.05 * 22 * f + 0.05) bad.push(m.isoShould(nf(22 * f, 2)));
        if (Math.abs(S.tG - 5 * f) > 0.1 * 5 * f + 0.05) bad.push(m.gradShould(nf(5 * f, 2)));
        if (bad.length) return { ok: false, msg: m.times(bad) };
        const rs = pairRs(R, 0, 1);
        if (rs < 4.5) return { ok: false, msg: m.rs(nf(rs, 2)) };
        if (!pk(R, 2).eluted) return { ok: false, msg: m.mNotEluted };
        return { ok: true, msg: m.ok(nf(S.F, 2), nInt(R.dP), nf(S.tIso0, 1), nf(S.tG, 1), nf(S.hold, 1), nf(rs, 2), nf(R.runTime, 1)) };
      } } }
  ] },
  { group: "m", steps: [                                                         // 9. Aspartam (0973)
    { setup: Object.assign({}, ASP_SET, { analytes: ASP_MIX() }), task: { type: "choice", correct: 1 } },
    { setup: Object.assign({}, ASP_SET, { dp: 10, analytes: ASP_MIX() }), task: { type: "goal", check: (R, S, B, ref, m) => {
        if (!sameCol(S, B) || S.phiIso !== B.phiIso || S.mode !== "iso") return { ok: false, msg: m.keepColPhase };
        if (!within(S.F, 0.5, 1.5)) return { ok: false, msg: m.flowRange(nf(S.F, 2)) };
        const rs = pairRs(R, 0, 1);
        return rs >= 3.5 ? { ok: true, msg: m.ok(nf(rs, 2), nf(S.F, 2), nf(2 * pk(R, 3).tR, 1)) } : { ok: false, msg: m.low(nf(rs, 2)) };
      } } }
  ] },
  { group: "m", steps: [                                                         // 10. Erytromycyna (0552)
    { setup: Object.assign({}, ERY_SET, { analytes: ERY_MIX() }), task: { type: "choice", correct: 1 } },
    { task: { type: "choice", correct: 1 } },
    { setup: Object.assign({}, ERY_SET, { phi0: 37, phi1: 52, analytes: ERY_MIX() }), task: { type: "goal", check: (R, S, B, ref, m) => {
        if (!sameCol(S, B) || S.mode !== "grad" || S.F !== B.F) return { ok: false, msg: m.keepColFlow };
        const tB = eryBIso(S);
        if (Math.abs(S.tIso0 - tB) > 1) return { ok: false, msg: m.isoMismatch(nf(S.tIso0, 1), nf(tB, 1)) };
        const pv1 = pvRatio(R, 6, 5), pv2 = pvRatio(R, 3, 4), rs = pairRs(R, 1, 2), f = [];
        if (rs < 1.2) f.push(m.rs(nf(rs, 2)));
        if (pv1 < 1.5) f.push(m.pvF(fmtPv(pv1)));
        if (pv2 < 2.0) f.push(m.pvC(fmtPv(pv2)));
        return f.length ? { ok: false, msg: m.notYet(f) } : { ok: true, msg: m.ok(nf(S.phi0, 1), nf(S.tIso0, 1), fmtPv(pv1), nf(rs, 2)) };
      } } }
  ] }
];

// Połączenie logiki z tekstami bieżącego języka
const LESSONS = LESSON_LOGIC.map((L, li) => {
  const tx = L10.lessons[li];
  return { group: L.group, title: tx.title, steps: L.steps.map((st, si) => {
    const s = tx.steps[si];
    return Object.assign({}, st, { title: s.title, html: s.html, live: s.live,
      task: Object.assign({}, st.task, s.task, { m: Object.assign({}, L10.msg, (s.task && s.task.m) || {}) }) });
  }) };
});

function renderLive() {
  const box = $("liveBox");
  if (!lesson.active || !result) { box.classList.add("hidden"); return; }
  const st = LESSONS[lesson.li].steps[lesson.si];
  if (!st.live) { box.classList.add("hidden"); return; }
  box.classList.remove("hidden");
  box.innerHTML = st.live(result, state);
}

// ---------- Silnik zajęć ----------
const lesson = { active: false, li: 0, si: 0, base: null, ref: null, tries: 0, loadedLi: -1 };
const TEACHER = /prowadzacy|teacher/.test(location.search + location.hash);
const PROG_KEY = "hplc-zajecia-v1";
function loadProg() { try { return JSON.parse(localStorage.getItem(PROG_KEY)) || {}; } catch (_) { return {}; } }
function saveProg(p) { try { localStorage.setItem(PROG_KEY, JSON.stringify(p)); } catch (_) {} }
let progress = loadProg();
const isDone = (li, si) => !!(progress[li] && progress[li][si]);
function markDone() {
  progress[lesson.li] = progress[lesson.li] || {};
  progress[lesson.li][lesson.si] = true;
  saveProg(progress); renderDots();
}

function stepSetup(li, si) {       // warunki kroku: własne lub ostatnie zdefiniowane wcześniej
  const steps = LESSONS[li].steps;
  for (let j = si; j >= 0; j--) if (steps[j].setup) return steps[j].setup;
  return LS();
}

function renderDots() {
  const L = LESSONS[lesson.li];
  $("dots").innerHTML = L.steps.map((s, j) =>
    `<button class="${isDone(lesson.li, j) ? "done" : ""} ${j === lesson.si ? "cur" : ""}" data-j="${j}" title="${escapeHtml(s.title)}">${j + 1}</button>`).join("");
  const nDone = L.steps.filter((_, j) => isDone(lesson.li, j)).length;
  $("lessonProgress").textContent = t("passed", nDone, L.steps.length);
}

const lessonHash = (li, si) => "#" + t("hashLessons") + "=" + (li + 1) + "." + (si + 1);

function openStep(li, si, applySetup) {
  lesson.li = li; lesson.si = si; lesson.tries = 0;
  const st = LESSONS[li].steps[si];
  if (applySetup !== false && (st.setup || lesson.loadedLi !== li)) applyState(stepSetup(li, si));
  lesson.loadedLi = li;
  reportMode = !!st.report; hideVdHint = !!st.hideVd;
  lesson.base = JSON.parse(JSON.stringify(state));
  lesson.ref = st.ref ? compute(JSON.parse(JSON.stringify(st.ref))) : null;
  renderStats();
  $("lessonSel").value = String(li);
  $("stepTitle").textContent = t("stepTitle", si + 1, st.title);
  $("stepText").innerHTML = typeof st.html === "function" ? st.html() : st.html;
  renderTask(st);
  renderDots();
  $("prevStep").disabled = si === 0 && li === 0;
  $("nextStep").textContent = si < LESSONS[li].steps.length - 1 ? t("next") : (li < LESSONS.length - 1 ? t("nextLesson") : t("end"));
  $("nextStep").disabled = si === LESSONS[li].steps.length - 1 && li === LESSONS.length - 1;
  try { history.replaceState(null, "", lessonHash(li, si)); } catch (_) {}
}

function renderTask(st) {
  const tk = st.task;
  let html = `<div class="q">${tk.q}</div>`;
  if (tk.type === "num") {
    html += `<div class="ansrow"><input type="text" id="ans" inputmode="decimal" autocomplete="off" aria-label="${t("answer")}">${tk.unit ? `<span>${tk.unit}</span>` : ""}<button class="btn primary" id="checkBtn">${t("check")}</button></div>`;
  } else if (tk.type === "choice") {
    html += tk.options.map((o, j) => `<label class="opt"><input type="radio" name="opt" value="${j}"><span>${o}</span></label>`).join("");
    html += `<button class="btn primary" id="checkBtn" style="margin-top:6px">${t("check")}</button>`;
  } else {
    html += `<button class="btn primary" id="checkBtn">${t("check")}</button>`;
  }
  html += `<div class="feedback" id="fb"></div>`;
  if (tk.hint) html += `<details class="hintbox"><summary>${t("hint")}</summary><div>${tk.hint}</div></details>`;
  if (TEACHER) {
    let key = "";
    if (tk.type === "num") key = t("teacherNum", fmt(tk.answer(result)));
    if (tk.type === "choice") key = t("teacherChoice", String.fromCharCode(97 + tk.correct));
    if (tk.type === "goal") key = t("teacherGoal", tk.hint || "");
    html += `<div class="teacher">${t("teacher")} – ${key}</div>`;
  }
  $("task").innerHTML = html;
  $("checkBtn").addEventListener("click", checkAnswer);
  if (tk.type === "num") $("ans").addEventListener("keydown", e => { if (e.key === "Enter") checkAnswer(); });
}

function feedback(kind, msg) { const fb = $("fb"); fb.className = "feedback " + kind; fb.innerHTML = msg; }

function checkAnswer() {
  const st = LESSONS[lesson.li].steps[lesson.si], tk = st.task;
  readForm(); result = compute(state); renderStats(); redraw();
  const R = result;
  lesson.tries++;
  if (tk.type === "num") {
    const raw = $("ans").value.trim().replace(/\s/g, "").replace(",", ".");
    const v = Number(raw);
    if (raw === "" || !isFinite(v)) { feedback("bad", t("enterNumber")); return; }
    const ans = tk.answer(R);
    const err = tk.abs ? Math.abs(v - ans) : Math.abs(v - ans) / Math.abs(ans);
    if (err <= tk.tol) { feedback("ok", `<b>${t("correct")}</b> ` + tk.explain(R)); markDone(); }
    else if (err <= 3 * tk.tol) feedback("near", t("near"));
    else feedback("bad", `<b>${t("wrong")}</b> ` + (lesson.tries >= 2 && tk.hint ? t("hintPrefix") + tk.hint : t("tryAgain")));
  } else if (tk.type === "choice") {
    const sel = document.querySelector('#task input[name="opt"]:checked');
    if (!sel) { feedback("bad", t("selectAnswer")); return; }
    if (+sel.value === tk.correct) { feedback("ok", `<b>${t("correct")}</b> ` + tk.explain(R)); markDone(); }
    else feedback("bad", `<b>${t("wrong")}</b> ` + t("thinkAgain") + (tk.hint ? " – " + tk.hint : "."));
  } else {
    const res = tk.check(R, state, lesson.base, lesson.ref, tk.m);
    if (res.ok) { feedback("ok", `<b>${t("passedGoal")}</b> ` + res.msg + " " + tk.explain(R)); markDone(); }
    else feedback("bad", res.msg + (lesson.tries >= 2 && tk.hint ? "<br>" + t("hintPrefix") + tk.hint : ""));
  }
}

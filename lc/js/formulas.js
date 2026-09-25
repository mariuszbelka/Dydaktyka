// =====================================================================
// Karta wzorów LC (Ph. Eur. 2.2.46) – MathML (pomocnik: shared/js/mathml.js); opisy w L10.formulas
// =====================================================================
const T = MX.tok, S_ = (a, b) => MX.sub(T(a), T(b));
const sym = {
  tR: S_("t", "R"), tR1: S_("t", "R1"), tR2: S_("t", "R2"), tM: S_("t", "M"), t0: S_("t", "0"), tt: S_("t", "t"),
  tRi: S_("t", "Ri"), tRst: S_("t", "Rst"), wh: S_("w", "h"), wh1: S_("w", "h1"), wh2: S_("w", "h2"),
  VM: S_("V", "M"), VR: S_("V", "R"), V0: S_("V", "0"), Vt: S_("V", "t"), VS: S_("V", "S"), KC: S_("K", "C"), K0: S_("K", "0"),
  Hp: S_("H", "p"), Hv: S_("H", "v"), dp: S_("d", "p"), RF: S_("R", "F"), RF1: S_("R", "F1"), RF2: S_("R", "F2"), Rs: S_("R", "s"),
  Rrel: MX.sub(T("R"), T("rel")), rG: S_("r", "G"), As: S_("A", "s"), w005: MX.sub(T("w"), T("0.05")),
  tD: S_("t", "D"), t05: MX.sub(T("t"), T("0.5")), tG: S_("t", "G"), tG1: S_("t", "G1"), tG2: S_("t", "G2"), tc: S_("t", "c"),
  F1: S_("F", "1"), F2: S_("F", "2"), dc1: S_("dc", "1"), dc2: S_("dc", "2"), dp1: S_("dp", "1"), dp2: S_("dp", "2"),
  L1: S_("L", "1"), L2: S_("L", "2"), D0: S_("D", "0"), Vinj1: MX.sub(T("V"), T("inj1")), Vinj2: MX.sub(T("V"), T("inj2")),
  k1: S_("k", "1"), k2: S_("k", "2"), yi: S_("y", "i"), ybar: MX.bar(T("y")),
  t90: MX.sub(T("t"), `<mn>90</mn><mo>%</mo><mo>,</mo><mi>n</mi><mo>−</mo><mn>1</mn>`),
  t905: MX.sub(T("t"), `<mn>90</mn><mo>%</mo><mo>,</mo><mn>5</mn>`)
};
const sq = a => MX.sup(a, "<mn>2</mn>");
const dcsq = n => MX.subsup(T("dc"), T(n), "<mn>2</mn>");
const FTX = L10.formulas;

// id → wzory i symbole legendy (kolejność legendy = kolejność opisów w L10.formulas.items[id].leg)
const FORMULAS = [
  { sec: "defs" },
  { id: "dwell", f: [T("D=") + sym.tD + T("×F")], leg: [sym.tD, sym.t05, sym.tG, T("F")] },
  { id: "holdup", f: [sym.VM + T("=") + sym.tM + T("×F")], leg: [sym.tM, T("F")] },
  { id: "pv", f: [T("p/v=") + MX.frac(sym.Hp, sym.Hv)], leg: [sym.Hp, sym.Hv] },
  { id: "H", f: [T("H=") + MX.frac(T("L"), T("N"))], leg: [T("L"), T("N")] },
  { id: "N", f: [T("N=5.54") + MX.sup(MX.par(MX.frac(sym.tR, sym.wh)), "<mn>2</mn>")], leg: [sym.tR, sym.wh] },
  { id: "h", f: [T("h=") + MX.frac(T("H"), sym.dp)], leg: [T("H"), sym.dp] },
  { id: "Rrel", f: [sym.Rrel + T("=") + MX.frac(T("b"), T("c"))], leg: [T("b"), T("c")] },
  { id: "r", f: [T("r=") + MX.frac(sym.tRi + T("-") + sym.tM, sym.tRst + T("-") + sym.tM)], leg: [sym.tRi, sym.tRst, sym.tM] },
  { id: "rG", f: [sym.rG + T("=") + MX.frac(sym.tRi, sym.tRst)], leg: [] },
  { id: "Rs", f: [sym.Rs + T("=") + MX.frac(T("1.18") + MX.par(sym.tR2 + T("-") + sym.tR1), sym.wh1 + T("+") + sym.wh2),
                  sym.Rs + T("=") + MX.frac(T("1.18a") + MX.par(sym.RF2 + T("-") + sym.RF1), sym.wh1 + T("+") + sym.wh2)],
    leg: [sym.tR1 + T(",") + sym.tR2, sym.wh1 + T(",") + sym.wh2, sym.RF1 + T(",") + sym.RF2, T("a")] },
  { id: "RF", f: [sym.RF + T("=") + MX.frac(T("b"), T("a"))], leg: [T("b"), T("a")] },
  { id: "k", f: [T("k=") + MX.frac(MX.txt(FTX.kNum), MX.txt(FTX.kDen)) + T("=") + sym.KC + T("×") + MX.frac(sym.VS, sym.VM),
                 T("k=") + MX.frac(sym.tR + T("-") + sym.tM, sym.tM)], leg: [sym.KC, sym.VS, sym.VM, sym.tR, sym.tM] },
  { id: "VR", f: [sym.VR + T("=") + sym.tR + T("×F"), sym.V0 + T("=") + sym.t0 + T("×F") + MX.o("&#x2003;") + sym.Vt + T("=") + sym.tt + T("×F")],
    leg: [T("F"), sym.t0 + T(",") + sym.tt] },
  { id: "K0", f: [sym.K0 + T("=") + MX.frac(sym.tR + T("-") + sym.t0, sym.tt + T("-") + sym.t0)], leg: [sym.tR, sym.t0, sym.tt] },
  { id: "alpha", f: [T("α=") + MX.frac(sym.k2, sym.k1)], leg: [sym.k1, sym.k2] },
  { id: "SN", f: [T("S/N=") + MX.frac(T("2H"), T("h"))], leg: [T("H"), T("h")] },
  { id: "As", f: [sym.As + T("=") + MX.frac(sym.w005, T("2d"))], leg: [sym.w005, T("d")] },
  { id: "RSD", f: [T("%RSD=") + MX.frac(T("100"), sym.ybar) + MX.sqrt(MX.frac(`<mo largeop="true">∑</mo>` + sq(MX.par(sym.yi + T("-") + sym.ybar)), T("n-1")))],
    leg: [sym.yi, sym.ybar, T("n")] },
  { sec: "sst" },
  { id: "RSDmax", f: [T("%") + MX.sub(T("RSD"), T("max")) + T("=") + MX.frac(T("KB") + MX.sqrt(T("n")), sym.t90),
                      T("K=") + MX.frac(T("0.6"), MX.sqrt(T("2"))) + T("×") + MX.frac(sym.t905, MX.sqrt(T("6"))) + T("=0.349")],
    leg: [T("K"), T("B"), T("n"), sym.t90], table: true },
  { id: "sens", f: [], leg: [] },
  { sec: "adj" },
  { id: "F2", f: [sym.F2 + T("=") + sym.F1 + T("×") + MX.frac(dcsq("2") + T("×") + sym.dp1, dcsq("1") + T("×") + sym.dp2)],
    leg: [sym.F1, sym.F2, sym.dc1 + T(",") + sym.dc2, sym.dp1 + T(",") + sym.dp2] },
  { id: "Vinj", f: [sym.Vinj2 + T("=") + sym.Vinj1 + T("×") + MX.frac(sym.L2 + T("×") + dcsq("2"), sym.L1 + T("×") + dcsq("1"))],
    leg: [sym.Vinj1 + T(",") + sym.Vinj2, sym.L1 + T(",") + sym.L2, sym.dc1 + T(",") + sym.dc2] },
  { id: "tG", f: [sym.tG2 + T("=") + sym.tG1 + T("×") + MX.frac(sym.F1, sym.F2) + T("×") + MX.frac(sym.L2 + T("×") + dcsq("2"), sym.L1 + T("×") + dcsq("1"))],
    leg: [sym.tG1 + T(",") + sym.tG2] },
  { id: "tc", f: [sym.tc + T("=t-") + MX.frac(MX.par(T("D-") + sym.D0), T("F"))], leg: [T("t"), sym.tc, T("D"), sym.D0, T("F")] }
];

function renderFormulas() {
  const n = v => numStr(v);
  const rsdTable = `<table class="ftab"><caption>${FTX.rsdCaption}</caption>
    <tr><th rowspan="2"><i>B</i> (%)</th><th colspan="4">${FTX.rsdHead} <i>n</i></th></tr><tr><th>3</th><th>4</th><th>5</th><th>6</th></tr>
    ${[["2.0", "0.41", "0.59", "0.73", "0.85"], ["2.5", "0.52", "0.74", "0.92", "1.06"], ["3.0", "0.62", "0.89", "1.10", "1.27"]]
      .map(r => `<tr>${r.map(c => `<td>${n(c)}</td>`).join("")}</tr>`).join("")}</table>`;
  $("formulaList").innerHTML = FORMULAS.map(x => {
    if (x.sec) return `<h2 class="fsec">${FTX.sections[x.sec]}</h2>`;
    const tx = FTX.items[x.id];
    return `<article class="fcard"><h3>${tx.name}</h3>${tx.en ? `<div class="fen">${tx.en}</div>` : ""}
      ${x.f.map(f => `<math display="block">${f}</math>`).join("")}
      ${x.leg.length ? `<table class="leg">${x.leg.map((s, i) => `<tr><td class="ls"><math>${s}</math></td><td class="le">=</td><td>${tx.leg[i]};</td></tr>`).join("")}</table>` : ""}
      ${x.table ? rsdTable : ""}
      ${tx.note ? `<p class="fnote">${tx.note}</p>` : ""}</article>`;
  }).join("");
}

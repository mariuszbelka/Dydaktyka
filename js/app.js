// =====================================================================
// Tryby, zdarzenia i start aplikacji
// =====================================================================
function setAppMode(mode) {
  const f = mode === "formulas";
  document.body.classList.toggle("mode-formulas", f);
  $("formulas").classList.toggle("hidden", !f);
  document.querySelector("main").classList.toggle("hidden", f);
  lesson.active = mode === "lesson";
  document.querySelectorAll("#appMode button").forEach(b => b.classList.toggle("on", b.dataset.app === mode));
  $("lessonCard").classList.toggle("hidden", !lesson.active);
  $("presetCard").classList.toggle("hidden", lesson.active);
  if (lesson.active) openStep(lesson.li, lesson.si, true);
  else {
    reportMode = false; hideVdHint = false; renderStats();
    try { history.replaceState(null, "", location.pathname + location.search + (f ? "#" + t("hashFormulas") : "")); } catch (_) {}
    if (f) window.scrollTo(0, 0); else redraw();
  }
}

$("lessonSel").innerHTML = [["p", t("groupBasics")], ["m", t("groupMonographs")]].map(([g, lab]) =>
  `<optgroup label="${lab}">` + LESSONS.map((L, i) => L.group === g ? `<option value="${i}">${L.title}</option>` : "").join("") + "</optgroup>").join("");
$("lessonSel").addEventListener("change", e => openStep(+e.target.value, 0, true));
$("dots").addEventListener("click", e => { const b = e.target.closest("button"); if (b) openStep(lesson.li, +b.dataset.j, true); });
$("prevStep").addEventListener("click", () => {
  if (lesson.si > 0) openStep(lesson.li, lesson.si - 1, true);
  else if (lesson.li > 0) openStep(lesson.li - 1, LESSONS[lesson.li - 1].steps.length - 1, true);
});
$("nextStep").addEventListener("click", () => {
  if (lesson.si < LESSONS[lesson.li].steps.length - 1) openStep(lesson.li, lesson.si + 1, true);
  else if (lesson.li < LESSONS.length - 1) openStep(lesson.li + 1, 0, true);
});
$("resetStep").addEventListener("click", () => {
  applyState(stepSetup(lesson.li, lesson.si));
  openStep(lesson.li, lesson.si, false);
});
document.querySelectorAll("#appMode button").forEach(b => b.addEventListener("click", () => setAppMode(b.dataset.app)));
document.querySelectorAll("#langSeg button").forEach(b => b.addEventListener("click", () => switchLang(b.dataset.lang)));

document.querySelector("aside").addEventListener("input", e => {
  if (e.target.closest("#lessonCard")) return;
  if (e.target.id === "Fr") $("F").value = e.target.value;
  if (e.target.id === "F" && readNum("F") != null) $("Fr").value = $("F").value;
  if (e.target.id === "phiIsoR") $("phiIso").value = e.target.value;
  if (e.target.id === "phiIso" && readNum("phiIso") != null) $("phiIsoR").value = $("phiIso").value;
  if (e.target.id !== "preset") update();
});
document.querySelector("aside").addEventListener("change", e => {
  if (e.target.closest("#lessonCard")) return;
  if ((e.target.tagName === "SELECT" && e.target.id !== "preset") || e.target.type === "checkbox") update();
});
$("yzoom").addEventListener("change", redraw);

$("modeSeg").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  readForm(); state.mode = b.dataset.mode; writeForm(); update();
});
$("anList").addEventListener("click", e => {
  if (!e.target.classList.contains("del")) return;
  readForm();
  state.analytes.splice(+e.target.closest(".an-row").dataset.i, 1);
  renderAnalytes(); update();
});
$("addAn").addEventListener("click", () => {
  if (state.analytes.length >= MAX_ANALYTES) return;
  readForm();
  const last = state.analytes[state.analytes.length - 1] || { logkw: 1.5, S: 3.5 };
  state.analytes.push({ name: L10.names.analyte(state.analytes.length + 1), logkw: +(last.logkw + 0.3).toFixed(2), S: last.S, amt: 1, basic: false });
  renderAnalytes(); update();
});
$("preset").addEventListener("change", e => {
  const p = PRESETS[e.target.value];
  $("presetHint").textContent = p ? p.hint : "";
  if (!p) return;
  Object.assign(state, p.s, { analytes: cloneAn(DEFAULT_ANALYTES) });
  writeForm(); update();
});

$("play").addEventListener("click", () => playing ? stopPlay() : startPlay());
$("scrub").addEventListener("input", e => {
  stopPlay();
  const v = +e.target.value;
  animT = v >= 1000 ? null : v / 1000 * result.tEnd;
  redraw();
});

$("chrom").addEventListener("mousemove", e => {
  if (!chromGeom || !result) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const tm = (e.clientX - rect.left - chromGeom.m.l) / chromGeom.pw * chromGeom.tEnd;
  if (tm < 0 || tm > chromGeom.tEnd) { $("readout").textContent = ""; return; }
  const j = Math.round(tm / result.tEnd * GRID);
  let txt = t("readout", nf(tm, 3), sig3(result.tot[j] + result.noise[j]));
  if (!result.iso) txt += " · B = " + nf(result.phiProg(tm - result.tD - result.t0) * 100, 0) + "%";
  $("readout").textContent = txt;
});
$("chrom").addEventListener("mouseleave", () => { $("readout").textContent = ""; });

function toast(msg) { const el = $("toast"); el.textContent = msg; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 1800); }

$("btnShare").addEventListener("click", async () => {
  let url;
  if (lesson.active) url = location.href.split("#")[0] + lessonHash(lesson.li, lesson.si);
  else {
    readForm();
    const enc = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    url = location.href.split("#")[0] + "#s=" + enc;
    try { history.replaceState(null, "", "#s=" + enc); } catch (_) {}
  }
  try { await navigator.clipboard.writeText(url); toast(lesson.active ? t("linkStep") : t("linkState")); }
  catch (_) { toast(t("linkAddr")); }
});

$("btnPng").addEventListener("click", () => {
  const src = $("chrom"), c = document.createElement("canvas");
  c.width = src.width; c.height = src.height;
  const ctx = c.getContext("2d");
  ctx.fillStyle = cssVar("--panel"); ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(src, 0, 0);
  const a = document.createElement("a"); a.download = "chromatogram.png"; a.href = c.toDataURL("image/png"); a.click();
});
$("btnPrint").addEventListener("click", () => window.print());

new ResizeObserver(() => redraw()).observe(document.querySelector(".content"));
try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", redraw); } catch (_) {}

const HASH_LESSON = /^#(?:zajecia|lessons)(?:=(\d+)(?:\.(\d+))?)?/;
const HASH_FORMULAS = /^#(?:wzory|formulas)/;
function lessonFromHash(mz) {
  lesson.li = Math.min(LESSONS.length - 1, Math.max(0, (+mz[1] || 1) - 1));
  lesson.si = Math.min(LESSONS[lesson.li].steps.length - 1, Math.max(0, (+mz[2] || 1) - 1));
}
window.addEventListener("hashchange", () => {
  const mz = location.hash.match(HASH_LESSON);
  if (!mz) return;
  const prev = [lesson.li, lesson.si];
  lessonFromHash(mz);
  if (lesson.active && prev[0] === lesson.li && prev[1] === lesson.si) return;
  lesson.loadedLi = -1;
  if (lesson.active) openStep(lesson.li, lesson.si, true); else setAppMode("lesson");
});

(function init() {
  applyI18n();
  renderFormulas();
  const hs = location.hash;
  const ms = hs.match(/^#s=(.+)$/);
  const mz = hs.match(HASH_LESSON);
  if (ms) {
    try {
      const s = JSON.parse(decodeURIComponent(escape(atob(ms[1]))));
      if (s && Array.isArray(s.analytes)) state = Object.assign({}, BASE, s, { analytes: s.analytes.map(a => Object.assign({ basic: false }, a)) });
    } catch (_) {}
  } else { $("preset").value = "uhplc"; $("presetHint").textContent = PRESETS.uhplc.hint; }
  writeForm();
  result = compute(state); renderStats(); redraw();
  if (HASH_FORMULAS.test(hs)) setAppMode("formulas");
  if (mz) { lessonFromHash(mz); setAppMode("lesson"); }
})();

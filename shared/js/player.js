// =====================================================================
// Wspólny odtwarzacz modułów „przed zajęciami” (mikrokroki, telefon).
//
// Ćwiczenie dostarcza:
//   MODULES = { klucz: { id, setup: () => stan, steps: [krok, …] } }
//     krok: { id, kind: "info" | "num" | "choice" | "goal" | "summary",
//             setup?: () => stan      – warunki startowe od tego kroku
//             from?: [lekcja, krok]  – zadanie (odpowiedź, tolerancja, sprawdzenie, teksty) z trybu „Zajęcia”
//             view?: "chrom" | "vd",  zoom?, formula?, table?: [kolumny], controls?: [parametry], live?: [wskaźniki]
//             answer?, tol?, abs?, unit?, correct? – gdy zadanie nie pochodzi z lekcji }
//   L10.modules[klucz] = { title, short, time, steps: { id: { title, text, more, q, options, hint, explain, short, seminar } } }
//   PLAYER_HOOKS: setup(stan) → wynik · view(płótno, rodzaj, zoom) · table(kolumny, wynik) → HTML · formula(spec) → MathML
//                 controls(lista, stan) → HTML · readControl(element) → [klucz, wartość] | null · live(lista, wynik, stan) → HTML
//                 task(from) → { kind, answer, tol, abs, unit, correct, q, options, hint, explain, check, m, ref }
// Postęp i wyniki trzymane lokalnie (do czasu podłączenia serwera – D12, D16).
// =====================================================================
const PLAYER = { key: null, mod: null, tx: null, i: 0, res: {}, sel: null, R: null, base: null, ref: null };
const plKey = () => "modul-" + PLAYER.mod.id + "-v1";
function plLoad(mod) { try { return JSON.parse(localStorage.getItem("modul-" + mod.id + "-v1")) || null; } catch (_) { return null; } }
function plSave() { try { localStorage.setItem(plKey(), JSON.stringify({ i: PLAYER.i, res: PLAYER.res })); } catch (_) {} }
const plStep = () => PLAYER.mod.steps[PLAYER.i];
const plIsTask = st => st.kind === "num" || st.kind === "choice" || st.kind === "goal";
const plDone = st => { const r = PLAYER.res[st.id]; return !!(r && (r.ok || r.revealed)); };

// Zadanie kroku: pola z trybu „Zajęcia” (from) nadpisane polami modułu
function plTask(st) {
  const base = st.from ? PLAYER_HOOKS.task(st.from) : {};
  const tx = PLAYER.tx.steps[st.id] || {};
  const pick = k => tx[k] != null ? tx[k] : base[k];
  return {
    kind: st.kind, answer: st.answer || base.answer, tol: st.tol != null ? st.tol : base.tol, abs: st.abs != null ? st.abs : base.abs,
    unit: st.unit != null ? st.unit : base.unit, correct: st.correct != null ? st.correct : base.correct,
    check: base.check, m: base.m, ref: base.ref,
    title: tx.title, text: tx.text, more: tx.more, q: pick("q"), options: pick("options"), hint: pick("hint"), explain: pick("explain"),
    short: tx.short || tx.title
  };
}

function plApplySetup(i) {           // warunki startowe: ostatni krok ≤ i, który je definiuje
  let def = null;
  for (let j = i; j >= 0; j--) if (PLAYER.mod.steps[j].setup) { def = PLAYER.mod.steps[j].setup(); break; }
  PLAYER.R = PLAYER_HOOKS.setup(def || PLAYER.mod.setup());
  PLAYER.base = JSON.parse(JSON.stringify(state));
}

function plMaxReach() {              // nie można przeskoczyć nierozwiązanego zadania
  const k = PLAYER.mod.steps.findIndex(s => plIsTask(s) && !plDone(s));
  return k < 0 ? PLAYER.mod.steps.length - 1 : k;
}

// ---------- Lista modułów ----------
function playerMenu(mods, texts) {
  $("plTitle").textContent = t("modulesTitle");
  document.title = t("modulesTitle");
  $("plViz").classList.add("hidden");
  $("plCount").textContent = "";
  $("plBarFill").style.width = "0";
  $("plBody").innerHTML = `<div class="pl-text"><p>${t("modulesIntro")}</p></div>` + Object.keys(mods).map((k, n) => {
    const m = mods[k], tx = texts[k], saved = plLoad(m) || { res: {} };
    const tasks = m.steps.filter(plIsTask), done = tasks.filter(s => saved.res[s.id] && (saved.res[s.id].ok || saved.res[s.id].revealed)).length;
    const badge = done === tasks.length ? `<span class="badge good">${t("stOk")}</span>` : done ? `<span class="badge warn">${done}/${tasks.length}</span>` : "";
    return `<a class="pl-mod" href="?lang=${LANG}&m=${k}"><span><b>${tx.title}</b><br><small>${tx.short || ""} · ${tx.time || ""}</small></span>${badge}</a>`;
  }).join("");
  $("plPrev").classList.add("hidden");
  $("plMain").textContent = t("home");
  $("plMain").addEventListener("click", () => { location.href = $("plBack").href; });
}

// ---------- Moduł ----------
function playerStart(key, mod, tx, startIndex) {
  PLAYER.key = key; PLAYER.mod = mod; PLAYER.tx = tx;
  const saved = plLoad(mod);
  PLAYER.res = saved ? saved.res : {};
  PLAYER.i = Math.min(startIndex != null ? startIndex : (saved ? saved.i : 0), plMaxReach());
  plApplySetup(PLAYER.i);
  document.title = tx.title;
  $("plTitle").textContent = tx.title;
  $("plMain").addEventListener("click", plMainAction);
  $("plPrev").addEventListener("click", () => plGo(PLAYER.i - 1));
  window.addEventListener("hashchange", () => { const k = +location.hash.slice(1) - 1; if (k !== PLAYER.i && k >= 0) plGo(k); });
  plRender();
}

function plGo(i) {
  if (i < 0 || i >= PLAYER.mod.steps.length) return;
  i = Math.min(i, plMaxReach());
  const prev = PLAYER.i;
  PLAYER.i = i; plSave();
  // nowe warunki startowe przy wejściu na krok z własnym „setup” lub przy cofnięciu
  if (PLAYER.mod.steps[i].setup || i < prev || plStep().kind === "goal") plApplySetup(i);
  plRender();
  try { history.replaceState(null, "", "#" + (i + 1)); } catch (_) {}
  window.scrollTo(0, 0);
}

function plRefresh() {                // po zmianie kontrolki: przelicz, narysuj, odśwież dane
  const st = plStep();
  if (st.view) PLAYER_HOOKS.view("plChrom", st.view, st.zoom);
  if (st.table && $("plTable")) $("plTable").innerHTML = PLAYER_HOOKS.table(st.table, PLAYER.R);
  if (st.live && $("plLive")) $("plLive").innerHTML = PLAYER_HOOKS.live(st.live, PLAYER.R, state);
}

function plRender() {
  const st = plStep(), n = PLAYER.mod.steps.length, tk = plTask(st);
  $("plCount").textContent = `${PLAYER.i + 1}/${n}`;
  $("plBarFill").style.width = (100 * (PLAYER.i + 1) / n) + "%";
  $("plViz").classList.toggle("hidden", !st.view);
  let h = tk.title ? `<h2>${tk.title}</h2>` : "";
  if (tk.text) h += `<div class="pl-text">${tk.text}</div>`;
  if (st.formula) h += PLAYER_HOOKS.formula(st.formula);
  if (plIsTask(st)) h += `<div class="pl-q">${tk.q}</div>`;
  if (st.controls) h += `<div class="pl-ctrl" id="plCtrl">${PLAYER_HOOKS.controls(st.controls, state)}</div>`;
  if (st.live) h += `<div class="pl-live" id="plLive"></div>`;
  if (st.table) h += `<div id="plTable"></div>`;
  if (st.kind === "info" && tk.more) h += `<details><summary>${t("more")}</summary><div class="pl-text">${tk.more}</div></details>`;
  const r = PLAYER.res[st.id] || {};
  if (st.kind === "num") {
    h += `<div class="pl-ans"><input id="plAns" type="text" inputmode="decimal" autocomplete="off" aria-label="${t("answer")}" value="${r.value != null ? r.value : ""}">${tk.unit ? `<span>${tk.unit}</span>` : ""}</div>`;
  } else if (st.kind === "choice") {
    h += tk.options.map((o, j) => `<button class="pl-opt ${r.choice === j ? "sel" : ""}" data-j="${j}">${o}</button>`).join("");
  }
  if (plIsTask(st)) {
    h += `<div class="pl-fb" id="plFb"></div><div id="plRevealBox"></div>`;
    if (tk.hint && st.kind === "goal") h += `<details><summary>${t("hint")}</summary><div class="pl-text">${tk.hint}</div></details>`;
  }
  if (st.kind === "summary") h += plSummary();
  $("plBody").innerHTML = h;
  plRefresh();
  if (st.controls) $("plCtrl").addEventListener("input", e => {
    const kv = PLAYER_HOOKS.readControl(e.target);
    if (!kv) return;
    state[kv[0]] = kv[1];
    PLAYER.R = result = compute(state);
    plRefresh();
  });
  if (st.kind === "choice") document.querySelectorAll(".pl-opt").forEach(b => b.addEventListener("click", () => {
    if (plDone(st)) return;
    document.querySelectorAll(".pl-opt").forEach(x => x.classList.remove("sel"));
    b.classList.add("sel"); PLAYER.sel = +b.dataset.j;
  }));
  if (st.kind === "num") $("plAns").addEventListener("keydown", e => { if (e.key === "Enter") plMainAction(); });
  PLAYER.sel = r.choice != null ? r.choice : null;
  if (plIsTask(st) && plDone(st)) plShowSolved(st, tk, r.revealed, r.msg);
  plButtons();
}

function plSummary() {
  const tx = PLAYER.tx.steps[plStep().id] || {};
  const tasks = PLAYER.mod.steps.filter(plIsTask);
  let h = `<ul class="pl-sum">` + tasks.map(s => {
    const r = PLAYER.res[s.id] || {};
    const badge = r.ok ? `<span class="badge good">${t("stOk")}</span>` : r.revealed ? `<span class="badge warn">${t("stHelp")}</span>` : `<span class="badge bad">${t("stTodo")}</span>`;
    return `<li><span>${plTask(s).short || s.id}</span>${badge}</li>`;
  }).join("") + "</ul>";
  if (tx.seminar) h += `<div class="pl-seminar"><b>${t("seminar")}</b><br>${tx.seminar}</div>`;
  h += `<p class="hint" style="margin-top:12px">${t("reportSoon")}</p>`;
  return h;
}

function plButtons() {
  const st = plStep(), last = PLAYER.i === PLAYER.mod.steps.length - 1;
  $("plPrev").disabled = PLAYER.i === 0;
  const main = $("plMain");
  main.textContent = plIsTask(st) && !plDone(st) ? t("check") : last ? t("finish") : t("next");
}

function plFb(kind, html) { const f = $("plFb"); f.className = "pl-fb " + kind; f.innerHTML = html; }

function plShowSolved(st, tk, revealed, msg) {
  const expl = tk.explain ? tk.explain(PLAYER.R) : "";
  plFb(revealed ? "help" : "ok", (revealed ? `<b>${t("solution")}</b> ` + (st.kind === "goal" && tk.hint ? tk.hint + " " : "") : `<b>${t("correct")}</b> ` + (msg ? msg + " " : "")) + expl);
  if (st.kind === "choice") document.querySelectorAll(".pl-opt").forEach(b => { if (+b.dataset.j === tk.correct) b.classList.add("right"); });
  $("plRevealBox").innerHTML = "";
}

function plMainAction() {
  const st = plStep();
  if (!(plIsTask(st) && !plDone(st))) {
    if (PLAYER.i < PLAYER.mod.steps.length - 1) plGo(PLAYER.i + 1);
    else location.href = "?lang=" + LANG;
    return;
  }
  const tk = plTask(st);
  const r = PLAYER.res[st.id] = PLAYER.res[st.id] || { tries: 0 };
  let failMsg = "";
  if (st.kind === "num") {
    const raw = $("plAns").value.trim().replace(/\s/g, "").replace(",", ".");
    const v = Number(raw);
    if (raw === "" || !isFinite(v)) { plFb("bad", t("enterNumber")); return; }
    r.tries++; r.value = $("plAns").value.trim();
    const ans = tk.answer(PLAYER.R), err = tk.abs ? Math.abs(v - ans) : Math.abs(v - ans) / Math.abs(ans);
    if (err <= tk.tol) r.ok = true;
    else failMsg = err <= 3 * tk.tol ? t("near") : `<b>${t("wrong")}</b>`;
  } else if (st.kind === "choice") {
    if (PLAYER.sel == null) { plFb("bad", t("selectAnswer")); return; }
    r.tries++; r.choice = PLAYER.sel;
    if (PLAYER.sel === tk.correct) r.ok = true; else failMsg = `<b>${t("wrong")}</b> ${t("thinkAgain")}.`;
  } else {
    r.tries++;
    const res = tk.check(PLAYER.R, state, PLAYER.base, PLAYER.ref || (tk.ref ? compute(JSON.parse(JSON.stringify(tk.ref))) : null), tk.m);
    if (res.ok) { r.ok = true; r.msg = res.msg; } else failMsg = res.msg;
  }
  if (r.ok) plShowSolved(st, tk, false, r.msg);
  else {
    plFb(failMsg.indexOf(t("near")) === 0 ? "near" : "bad", failMsg + (r.tries >= 2 && tk.hint && st.kind !== "goal" ? " " + t("hintPrefix") + tk.hint : ""));
    if (r.tries >= 3) {
      $("plRevealBox").innerHTML = `<button class="pl-reveal" id="plReveal">${t("reveal")}</button>`;
      $("plReveal").addEventListener("click", () => { r.revealed = true; plSave(); plShowSolved(st, tk, true); plButtons(); });
    }
  }
  plSave(); plButtons();
}

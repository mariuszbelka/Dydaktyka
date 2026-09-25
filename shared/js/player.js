// =====================================================================
// Wspólny odtwarzacz modułów „przed zajęciami” (mikrokroki, telefon).
// Ćwiczenie dostarcza:
//   moduł (logika): { id, setup: () => stan, steps: [{ id, kind: "info"|"num"|"choice"|"summary",
//                    view?, table?, formula?, answer?, tol?, abs?, unit?, correct? }] }
//   teksty: L10.modules[<klucz>] = { title, steps: { <id>: { title, text, more, q, options, hint, explain, seminar } } }
//   hooki PLAYER_HOOKS: setup(stan) → wynik, view(idPłótna), table(kolumny, wynik) → HTML, formula(spec) → MathML
// Postęp i wyniki kroków trzymane lokalnie (do czasu podłączenia serwera – D12, D16).
// =====================================================================
const PLAYER = { mod: null, tx: null, i: 0, res: {}, sel: null, R: null };
const plKey = () => "modul-" + PLAYER.mod.id + "-v1";
function plLoad() { try { return JSON.parse(localStorage.getItem(plKey())) || null; } catch (_) { return null; } }
function plSave() { try { localStorage.setItem(plKey(), JSON.stringify({ i: PLAYER.i, res: PLAYER.res })); } catch (_) {} }
const plStep = () => PLAYER.mod.steps[PLAYER.i];
const plText = st => PLAYER.tx.steps[st.id] || {};
const plIsTask = st => st.kind === "num" || st.kind === "choice";
const plDone = st => { const r = PLAYER.res[st.id]; return !!(r && (r.ok || r.revealed)); };

function playerStart(mod, tx, startIndex) {
  PLAYER.mod = mod; PLAYER.tx = tx;
  const saved = plLoad();
  PLAYER.res = saved ? saved.res : {};
  PLAYER.i = Math.min(startIndex != null ? startIndex : (saved ? saved.i : 0), plMaxReach());
  PLAYER.R = PLAYER_HOOKS.setup(mod.setup());
  document.title = tx.title;
  $("plTitle").textContent = tx.title;
  $("plMain").addEventListener("click", plMainAction);
  $("plPrev").addEventListener("click", () => plGo(PLAYER.i - 1));
  window.addEventListener("hashchange", () => { const k = +location.hash.slice(1) - 1; if (k !== PLAYER.i && k >= 0) plGo(k); });
  plRender();
}

// najdalszy dostępny krok: nie można przeskoczyć nierozwiązanego zadania
function plMaxReach() {
  const k = PLAYER.mod.steps.findIndex(s => plIsTask(s) && !plDone(s));
  return k < 0 ? PLAYER.mod.steps.length - 1 : k;
}

function plGo(i) {
  if (i < 0 || i >= PLAYER.mod.steps.length) return;
  i = Math.min(i, plMaxReach());
  PLAYER.i = i; plSave(); plRender();
  try { history.replaceState(null, "", "#" + (i + 1)); } catch (_) {}
  window.scrollTo(0, 0);
}

function plRender() {
  const st = plStep(), tx = plText(st), n = PLAYER.mod.steps.length;
  $("plCount").textContent = `${PLAYER.i + 1}/${n}`;
  $("plBarFill").style.width = (100 * (PLAYER.i + 1) / n) + "%";
  $("plViz").classList.toggle("hidden", !st.view);
  if (st.view) PLAYER_HOOKS.view("plChrom");
  let h = tx.title ? `<h2>${tx.title}</h2>` : "";
  if (st.kind === "info") {
    h += `<div class="pl-text">${tx.text || ""}</div>`;
    if (st.formula) h += PLAYER_HOOKS.formula(st.formula);
    if (tx.more) h += `<details><summary>${t("more")}</summary><div class="pl-text">${tx.more}</div></details>`;
  } else if (plIsTask(st)) {
    if (tx.text) h += `<div class="pl-text">${tx.text}</div>`;
    h += `<div class="pl-q">${tx.q}</div>`;
    if (st.table) h += PLAYER_HOOKS.table(st.table, PLAYER.R);
    const r = PLAYER.res[st.id] || {};
    if (st.kind === "num") {
      h += `<div class="pl-ans"><input id="plAns" type="text" inputmode="decimal" autocomplete="off" aria-label="${t("answer")}" value="${r.value != null ? r.value : ""}">${st.unit ? `<span>${st.unit}</span>` : ""}</div>`;
    } else {
      h += tx.options.map((o, j) => `<button class="pl-opt ${r.choice === j ? "sel" : ""} ${plDone(st) && j === st.correct ? "right" : ""}" data-j="${j}">${o}</button>`).join("");
    }
    h += `<div class="pl-fb" id="plFb"></div><div id="plRevealBox"></div>`;
  } else if (st.kind === "summary") {
    const tasks = PLAYER.mod.steps.filter(plIsTask);
    h += `<div class="pl-text">${tx.text || ""}</div><ul class="pl-sum">` + tasks.map(s => {
      const r = PLAYER.res[s.id] || {};
      const badge = r.ok ? `<span class="badge good">${t("stOk")}</span>` : r.revealed ? `<span class="badge warn">${t("stHelp")}</span>` : `<span class="badge bad">${t("stTodo")}</span>`;
      return `<li><span>${plText(s).short || plText(s).title || s.id}</span>${badge}</li>`;
    }).join("") + "</ul>";
    if (tx.seminar) h += `<div class="pl-seminar"><b>${t("seminar")}</b><br>${tx.seminar}</div>`;
    h += `<p class="hint" style="margin-top:12px">${t("reportSoon")}</p>`;
  }
  $("plBody").innerHTML = h;
  if (st.kind === "choice") document.querySelectorAll(".pl-opt").forEach(b => b.addEventListener("click", () => {
    if (plDone(st)) return;
    document.querySelectorAll(".pl-opt").forEach(x => x.classList.remove("sel"));
    b.classList.add("sel"); PLAYER.sel = +b.dataset.j;
  }));
  if (st.kind === "num") $("plAns").addEventListener("keydown", e => { if (e.key === "Enter") plMainAction(); });
  PLAYER.sel = (PLAYER.res[st.id] || {}).choice ?? null;
  if (plIsTask(st) && plDone(st)) plShowSolved(st, PLAYER.res[st.id].revealed);
  plButtons();
}

function plButtons() {
  const st = plStep(), last = PLAYER.i === PLAYER.mod.steps.length - 1;
  $("plPrev").disabled = PLAYER.i === 0;
  const main = $("plMain");
  if (plIsTask(st) && !plDone(st)) { main.textContent = t("check"); main.disabled = false; }
  else { main.textContent = last ? t("finish") : t("next"); main.disabled = false; }
}

function plFb(kind, html) { const f = $("plFb"); f.className = "pl-fb " + kind; f.innerHTML = html; }

function plShowSolved(st, revealed) {
  const tx = plText(st);
  plFb(revealed ? "help" : "ok", (revealed ? `<b>${t("solution")}</b> ` : `<b>${t("correct")}</b> `) + tx.explain(PLAYER.R));
  if (st.kind === "choice") document.querySelectorAll(".pl-opt").forEach(b => { if (+b.dataset.j === st.correct) b.classList.add("right"); });
  $("plRevealBox").innerHTML = "";
}

function plMainAction() {
  const st = plStep();
  if (!(plIsTask(st) && !plDone(st))) {
    if (PLAYER.i < PLAYER.mod.steps.length - 1) plGo(PLAYER.i + 1);
    else location.href = $("plBack").href;
    return;
  }
  const r = PLAYER.res[st.id] = PLAYER.res[st.id] || { tries: 0 };
  const tx = plText(st);
  if (st.kind === "num") {
    const raw = $("plAns").value.trim().replace(/\s/g, "").replace(",", ".");
    const v = Number(raw);
    if (raw === "" || !isFinite(v)) { plFb("bad", t("enterNumber")); return; }
    r.tries++; r.value = $("plAns").value.trim();
    const ans = st.answer(PLAYER.R), err = st.abs ? Math.abs(v - ans) : Math.abs(v - ans) / Math.abs(ans);
    if (err <= st.tol) r.ok = true;
    else plFb(err <= 3 * st.tol ? "near" : "bad", (err <= 3 * st.tol ? t("near") : `<b>${t("wrong")}</b> `) + (r.tries >= 2 && tx.hint ? " " + t("hintPrefix") + tx.hint : ""));
  } else {
    if (PLAYER.sel == null) { plFb("bad", t("selectAnswer")); return; }
    r.tries++; r.choice = PLAYER.sel;
    if (PLAYER.sel === st.correct) r.ok = true;
    else plFb("bad", `<b>${t("wrong")}</b> ` + (tx.hint && r.tries >= 2 ? t("hintPrefix") + tx.hint : t("thinkAgain") + "."));
  }
  if (r.ok) plShowSolved(st, false);
  else if (r.tries >= 3) {
    $("plRevealBox").innerHTML = `<button class="pl-reveal" id="plReveal">${t("reveal")}</button>`;
    $("plReveal").addEventListener("click", () => { r.revealed = true; plSave(); plShowSolved(st, true); plButtons(); });
  }
  plSave(); plButtons();
}

// Test symulatora: node tests/run.js  (wymaga pakietu playwright i przeglądarki Chromium)
// Sprawdza obie wersje językowe: błędy JS, brakujące klucze, zgodność struktury tekstów,
// rozwiązywalność wszystkich zadań i identyczność wyników liczbowych PL/EN.
const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); }
catch (_) { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright")); }

const ROOT = "file://" + path.resolve(__dirname, "..");
const URL = ROOT + "/lc/index.html";

// Rozwiązania zadań typu „cel”: klucz „lekcja.krok” → zmiany stanu
const SOLUTIONS = {
  "2.2": { phiIso: 38 }, "2.5": { phiIso: 30 }, "3.1": { F: 0.55 }, "3.4": { L: 100, ID: 2.1, dp: 3, F: 0.35, sigEC: 5 },
  "4.1": { sigEC: 4 }, "4.3": { F: 0.18 }, "4.5": { tIso0: 0.65 }, "5.1": { endcap: true }, "5.4": { Vinj: 45 },
  "6.4": { phiIso: 40, F: 1.2 }, "7.4": { Vinj: 50 }, "8.4": { L: 150, dp: 3, F: 1.5, tIso0: 13.2, tG: 3.0, hold: 10.8 },
  "9.2": { F: 0.6 }, "10.3": { phi0: 36, phi1: 51, tIso0: "eryB" }
};

let failures = 0;
const fail = m => { failures++; console.log("  ✗ " + m); };
const ok = m => console.log("  ✓ " + m);

async function runLang(browser, lang) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const problems = [];
  page.on("pageerror", e => problems.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" || m.type() === "warning") problems.push(m.type() + ": " + m.text()); });
  await page.goto(URL + "?lang=" + lang);
  await page.waitForTimeout(300);
  const res = await page.evaluate(SOL => {
    const out = { steps: [] };
    LESSONS.forEach((L, li) => L.steps.forEach((st, si) => {
      const key = (li + 1) + "." + (si + 1);
      const S0 = JSON.parse(JSON.stringify(stepSetup(li, si)));
      const R = compute(S0); result = R;
      const ref = st.ref ? compute(JSON.parse(JSON.stringify(st.ref))) : null;
      const tk = st.task, o = { key, type: tk.type, tR: R.peaks.map(p => p.eluted ? +p.tR.toFixed(4) : null) };
      const texts = [st.title, typeof st.html === "function" ? st.html() : st.html, tk.q];
      if (st.live) texts.push(st.live(R, S0));
      if (tk.type === "num") { o.ans = +tk.answer(R).toPrecision(6); texts.push(tk.explain(R)); }
      if (tk.type === "choice") { o.correct = tk.correct; o.nOpt = tk.options.length; texts.push(tk.explain(R)); }
      if (tk.type === "goal") {
        const r0 = tk.check(R, S0, S0, ref, tk.m);
        o.initial = r0.ok; texts.push(r0.msg);
        const sol = SOL[key];
        if (sol) {
          const S = Object.assign(JSON.parse(JSON.stringify(S0)), sol);
          if (sol.tIso0 === "eryB") S.tIso0 = +eryBIso(S).toFixed(1);
          const R2 = compute(S), r = tk.check(R2, S, S0, ref, tk.m);
          o.solved = r.ok; o.msg = r.msg.replace(/<[^>]+>/g, ""); texts.push(r.msg, tk.explain(R2));
        }
      }
      o.undef = texts.some(x => typeof x !== "string" || /undefined|NaN/.test(x));
      out.steps.push(o);
    }));
    out.formulas = document.querySelectorAll("#formulaList math").length;
    out.lang = LANG;
    return out;
  }, SOLUTIONS);
  await page.close();
  // Widok telefonu w każdym trybie
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  m.on("pageerror", e => problems.push("mobile pageerror: " + e.message));
  for (const h of ["", "#" + (lang === "pl" ? "zajecia=6.1" : "lessons=6.1"), "#" + (lang === "pl" ? "wzory" : "formulas")]) {
    await m.goto(URL + "?lang=" + lang + h); await m.waitForTimeout(250);
    const [sw, iw] = await m.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    res.overflow = (res.overflow || 0) + (sw > iw ? 1 : 0);
  }
  await m.close();
  res.problems = problems;
  return res;
}

async function structure(browser) {
  const page = await browser.newPage();
  await page.goto(URL + "?lang=pl");
  const diff = await page.evaluate(() => {
    const d = [];
    const walk = (a, b, p) => {
      if (typeof a !== typeof b) { d.push(p + ": typ " + typeof a + " vs " + typeof b); return; }
      if (Array.isArray(a)) { if (a.length !== b.length) d.push(p + ": długość " + a.length + " vs " + b.length); a.forEach((x, i) => b[i] !== undefined && walk(x, b[i], p + "[" + i + "]")); return; }
      if (a && typeof a === "object") {
        new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => {
          if (!(k in a)) d.push(p + "." + k + ": brak w PL"); else if (!(k in b)) d.push(p + "." + k + ": brak w EN"); else walk(a[k], b[k], p + "." + k);
        });
      }
    };
    walk(I18N.pl, I18N.en, "L10");
    if (I18N.pl.lessons.length !== LESSON_LOGIC.length) d.push("liczba lekcji ≠ logika");
    I18N.pl.lessons.forEach((L, i) => { if (L.steps.length !== LESSON_LOGIC[i].steps.length) d.push(`lekcja ${i + 1}: liczba kroków ≠ logika`); });
    return d;
  });
  await page.close();
  return diff;
}

(async () => {
  const browser = await chromium.launch();
  console.log("Struktura tekstów PL/EN");
  const d = await structure(browser);
  d.length ? d.forEach(fail) : ok("zgodna");
  const R = {};
  for (const lang of ["pl", "en"]) {
    console.log(`Wersja ${lang.toUpperCase()}`);
    const r = R[lang] = await runLang(browser, lang);
    r.lang === lang ? ok("język wybrany z ?lang") : fail("język " + r.lang);
    r.problems.length ? r.problems.forEach(p => fail(p)) : ok("brak błędów i ostrzeżeń w konsoli");
    r.formulas > 40 ? ok(`wzory: ${r.formulas} elementów MathML`) : fail("za mało wzorów: " + r.formulas);
    r.overflow ? fail("przewijanie w poziomie na telefonie") : ok("brak przewijania w poziomie (390 px)");
    let n = 0;
    r.steps.forEach(s => {
      if (s.undef) fail(`${s.key}: tekst zawiera undefined/NaN`);
      if (s.type === "goal") {
        n++;
        if (s.initial) fail(`${s.key}: zadanie zaliczone już na starcie`);
        if (s.solved !== true) fail(`${s.key}: rozwiązanie nie przechodzi (${s.msg || "brak rozwiązania w teście"})`);
      }
      if (s.type === "choice" && !(s.correct >= 0 && s.correct < s.nOpt)) fail(`${s.key}: zła poprawna odpowiedź`);
      if (s.type === "num" && !isFinite(s.ans)) fail(`${s.key}: odpowiedź nie jest liczbą`);
    });
    ok(`${r.steps.length} kroków, ${n} zadań typu „cel” sprawdzonych`);
  }
  console.log("Strona główna");
  for (const lang of ["pl", "en"]) {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 } }); const errs = [];
    p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error" || m.type() === "warning") errs.push(m.text()); });
    await p.goto(ROOT + "/index.html?lang=" + lang); await p.waitForTimeout(200);
    const info = await p.evaluate(() => ({ title: document.querySelector("h1").textContent, link: document.querySelector("a[data-href]").getAttribute("href"),
      over: document.documentElement.scrollWidth > innerWidth }));
    errs.length ? errs.forEach(fail) : ok(`${lang}: brak błędów, tytuł „${info.title}”, link ${info.link}`);
    if (info.over) fail(`${lang}: przewijanie w poziomie`);
    await p.close();
  }
  const pr = await browser.newPage();
  await pr.goto(ROOT + "/index.html?lang=en#lessons=2.3"); await pr.waitForTimeout(400);
  /\/lc\/index\.html\?lang=en#lessons=2\.3$/.test(pr.url()) || /\/lc\/\?lang=en#lessons=2\.3$/.test(pr.url())
    ? ok("stary link #lessons przekierowany do lc/") : fail("przekierowanie starego linku: " + pr.url());
  await pr.close();
  console.log("Moduły (odtwarzacz na telefon)");
  const modAns = {};
  for (const lang of ["pl", "en"]) {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 } }); const errs = [];
    p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error" || m.type() === "warning") errs.push(m.text()); });
    await p.goto(ROOT + "/lc/modul.html?lang=" + lang); await p.evaluate(() => localStorage.clear());
    await p.goto(ROOT + "/lc/modul.html?lang=" + lang); await p.waitForTimeout(200);
    const menu = await p.evaluate(() => ({ n: document.querySelectorAll(".pl-mod").length, keys: Object.keys(MODULES), undef: /undefined|NaN/.test(document.body.innerHTML),
      over: document.documentElement.scrollWidth > innerWidth }));
    menu.n === menu.keys.length && !menu.undef && !menu.over ? ok(`${lang}: lista ${menu.n} modułów`) : fail(`${lang}: lista modułów (${menu.n}/${menu.keys.length}, undefined: ${menu.undef}, przewijanie: ${menu.over})`);
    modAns[lang] = {};
    for (const key of menu.keys) {
      await p.goto(ROOT + "/lc/modul.html?lang=" + lang + "&m=" + key + "#1"); await p.waitForTimeout(250);
      const r = await p.evaluate(() => {
        const out = { words: [], undef: [], answers: [] };
        PLAYER.mod.steps.forEach((st, i) => {
          const tx = PLAYER.tx.steps[st.id] || {}, tk = plTask(st);
          if (!PLAYER.tx.steps[st.id]) out.undef.push(st.id + " (brak tekstu)");
          if (st.kind === "info") {
            const w = (tx.text || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
            if (w > 80) out.words.push(`${st.id}: ${w} słów`);
          }
          const texts = [tk.title, tk.text, tk.more, tk.seminar, tx.seminar].filter(x => x != null);
          if (plIsTask(st)) texts.push(tk.q, tk.short);
          if (st.kind === "choice") texts.push(...tk.options);
          if (st.kind === "goal") texts.push(tk.hint);
          if (texts.some(x => typeof x !== "string" || /undefined|NaN/.test(x))) out.undef.push(st.id);
          if (st.kind === "num") out.answers.push(+tk.answer(PLAYER.R).toPrecision(6));
        });
        out.skip = (location.hash = "#" + PLAYER.mod.steps.length, true);
        return out;
      });
      await p.waitForTimeout(150);
      const reached = await p.evaluate(() => [PLAYER.i, PLAYER.mod.steps.findIndex(plIsTask)]);
      reached[0] <= reached[1] ? ok(`${lang} ${key}: nie da się przeskoczyć zadań`) : fail(`${lang} ${key}: przeskok do kroku ${reached[0] + 1}`);
      await p.evaluate(() => { location.hash = "#1"; }); await p.waitForTimeout(150);
      const n = await p.evaluate(() => PLAYER.mod.steps.length);
      const goalFail = [];
      for (let i = 0; i < n + 2 && await p.evaluate(() => plStep().kind !== "summary"); i++) {
        const st = await p.evaluate(() => { const s = plStep(), tk = plTask(s);
          return { id: s.id, kind: s.kind, from: s.from, ans: s.kind === "num" ? tk.answer(PLAYER.R) : null, c: tk.correct, done: plDone(s) }; });
        if (!st.done && st.kind === "num") { await p.fill("#plAns", String(+st.ans.toPrecision(4))); await p.click("#plMain"); }
        if (!st.done && st.kind === "choice") { await p.click(`.pl-opt[data-j="${st.c}"]`); await p.click("#plMain"); }
        if (!st.done && st.kind === "goal") {
          await p.click("#plMain");
          if (await p.evaluate(() => !!(PLAYER.res[plStep().id] || {}).ok)) goalFail.push(st.id + " zaliczone na starcie");
          const sol = SOLUTIONS[st.from[0] + 1 + "." + (st.from[1] + 1)];
          await p.evaluate(sol => { Object.assign(state, sol); PLAYER.R = result = compute(state); plRefresh(); }, sol);
          await p.click("#plMain");
          if (!await p.evaluate(() => !!(PLAYER.res[plStep().id] || {}).ok)) goalFail.push(st.id + ": " + await p.evaluate(() => $("plFb").textContent));
        }
        await p.click("#plMain");
      }
      const end = await p.evaluate(() => ({ i: PLAYER.i + 1, n: PLAYER.mod.steps.length, ok: PLAYER.mod.steps.filter(plIsTask).every(s => PLAYER.res[s.id] && PLAYER.res[s.id].ok),
        over: document.documentElement.scrollWidth > innerWidth, undef: /undefined|NaN/.test(document.body.innerHTML) }));
      goalFail.forEach(g => fail(`${lang} ${key}: ${g}`));
      end.i === end.n && end.ok ? ok(`${lang} ${key}: przejście do podsumowania, wszystkie zadania zaliczone`) : fail(`${lang} ${key}: zatrzymanie na kroku ${end.i}/${end.n}`);
      if (end.over) fail(`${lang} ${key}: przewijanie w poziomie`);
      if (end.undef) fail(`${lang} ${key}: undefined/NaN w podsumowaniu`);
      r.words.length ? r.words.forEach(w => fail(`${lang} ${key}: za dużo tekstu (${w})`)) : ok(`${lang} ${key}: ekrany informacyjne ≤ 80 słów`);
      if (r.undef.length) fail(`${lang} ${key}: undefined/NaN lub brak tekstu w krokach ${r.undef.join(", ")}`);
      modAns[lang][key] = JSON.stringify(r.answers);
    }
    errs.length ? errs.forEach(fail) : ok(`${lang}: brak błędów w konsoli`);
    await p.close();
  }
  JSON.stringify(modAns.pl) === JSON.stringify(modAns.en) ? ok("moduły: identyczne odpowiedzi PL/EN") : fail("moduły: odpowiedzi PL/EN się różnią");
  console.log("Zgodność wyników PL/EN");
  const same = JSON.stringify(R.pl.steps.map(s => [s.tR, s.ans, s.correct, s.initial, s.solved])) === JSON.stringify(R.en.steps.map(s => [s.tR, s.ans, s.correct, s.initial, s.solved]));
  same ? ok("identyczne czasy retencji, odpowiedzi i wyniki sprawdzeń") : fail("wyniki PL i EN się różnią");
  await browser.close();
  console.log(failures ? `\n${failures} błędów` : "\nWszystkie testy zaliczone");
  process.exit(failures ? 1 : 0);
})();

// =====================================================================
// Wspólny silnik języków. Słowniki strony rejestrują się wcześniej jako
// I18N.pl, I18N.en (var I18N = I18N || {}; I18N.pl = {...}).
// Wybór języka: ?lang=pl|en → zapamiętany wybór → język przeglądarki
// =====================================================================
const LANGS = I18N;
const LANG = (() => {
  const q = new URLSearchParams(location.search).get("lang");
  if (q && LANGS[q]) { try { localStorage.setItem("hplc-lang", q); } catch (_) {} return q; }
  try { const s = localStorage.getItem("hplc-lang"); if (s && LANGS[s]) return s; } catch (_) {}
  return /^pl/i.test(navigator.language || "") ? "pl" : "en";
})();
const L10 = LANGS[LANG];
const LOCALE = L10.locale;

function t(key, ...args) {
  const v = L10.ui[key];
  if (v === undefined) { console.warn("i18n: missing key " + key); return key; }
  return typeof v === "function" ? v(...args) : v;
}

function applyI18n() {
  document.documentElement.lang = LANG;
  document.title = t("docTitle");
  document.querySelectorAll("[data-i18n]").forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-title]").forEach(el => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  document.querySelectorAll("#langSeg button").forEach(b => b.classList.toggle("on", b.dataset.lang === LANG));
}

function switchLang(l) {
  if (!LANGS[l] || l === LANG) return;
  try { localStorage.setItem("hplc-lang", l); } catch (_) {}
  const u = new URL(location.href);
  u.searchParams.set("lang", l);
  // przetłumacz nazwę trybu w adresie (#zajecia ↔ #lessons, #wzory ↔ #formulas)
  const ui = LANGS[l].ui;
  if (ui.hashLessons) u.hash = u.hash.replace(/^#(zajecia|lessons)/, "#" + ui.hashLessons).replace(/^#(wzory|formulas)/, "#" + ui.hashFormulas);
  location.href = u.toString();
}

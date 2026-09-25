// =====================================================================
// Wspólny pomocnik zapisu wzorów w MathML (styl monografii Ph. Eur.)
// Wymaga: shared/js/i18n.js (L10.decimal – separator dziesiętny języka)
// =====================================================================
const DEC = L10.decimal;
const numStr = v => String(v).replace(".", DEC);
const MX = {
  tok(s) {                        // liczby → mn, litery → mi (kursywa), reszta → mo
    return (s.match(/\d+(?:\.\d+)?|[A-Za-zα]|\S/g) || []).map(tk =>
      /^\d/.test(tk) ? `<mn>${numStr(tk)}</mn>` : /^[A-Za-zα]$/.test(tk) ? `<mi>${tk}</mi>` : `<mo>${tk.replace("-", "−")}</mo>`).join("");
  },
  sub: (a, b) => `<msub><mrow>${a}</mrow><mrow>${b}</mrow></msub>`,
  sup: (a, b) => `<msup><mrow>${a}</mrow><mrow>${b}</mrow></msup>`,
  subsup: (a, b, c) => `<msubsup><mrow>${a}</mrow><mrow>${b}</mrow><mrow>${c}</mrow></msubsup>`,
  frac: (a, b) => `<mfrac><mrow>${a}</mrow><mrow>${b}</mrow></mfrac>`,
  sqrt: a => `<msqrt>${a}</msqrt>`,
  par: a => `<mrow><mo>(</mo>${a}<mo>)</mo></mrow>`,
  bar: a => `<mover><mrow>${a}</mrow><mo>‾</mo></mover>`,
  txt: a => `<mtext>${a}</mtext>`,
  o: a => `<mo>${a}</mo>`
};

# Dydaktyka – ćwiczenia z analityki farmaceutycznej / Exercises in pharmaceutical analysis

Repozytorium materiałów do zajęć prowadzonych przez dr. hab. Mariusza Belkę: ćwiczenia z chromatografii
cieczowej (LC), spektrometrii mas (MS), ekstrakcji i analityki leków biotechnologicznych – każde w wersji
polskiej i angielskiej. Statyczne strony bez zależności (GitHub Pages lub otwarcie z dysku).

Online: https://mariuszbelka.github.io/Dydaktyka/ · ćwiczenie LC: https://mariuszbelka.github.io/Dydaktyka/lc/?lang=pl (EN: `?lang=en`)

Założenia i decyzje projektowe: `KONTEKST.md`, `docs/ZALOZENIA_PROJEKTOWE.md`.

## Ćwiczenie LC – symulator HPLC

Interaktywny symulator dydaktyczny chromatografii cieczowej (Ph. Eur. 2.2.46, 2.2.29), folder `lc/`.

### Tryby
- **Symulator** – retencja (LSS, izokracja i gradient z objętością opóźnienia), sprawność (van Deemter),
  dyspersja pozakolumnowa, kształt piku EMG, szum detektora; parametry liczone wzorami Ph. Eur. 2.2.46
  z pomiaru pików (k, α, N, R_s, A_s, S/N, p/v), ciśnienie, animacja pasm w kolumnie.
- **Zajęcia** – 5 lekcji podstawowych i 5 przykładów z monografii (sulfametoksazol 0108, kwas askorbinowy 0253,
  werapamil 0573, aspartam 0973, estolan erytromycyny 0552); zadania obliczeniowe, zamknięte i cele w symulatorze.
- **Wzory** – karta wzorów Ph. Eur. 2.2.46 w zapisie MathML, do druku / PDF.

### Linki (względem `…/Dydaktyka/lc/`)
| | PL | EN |
|---|---|---|
| wybór języka | `?lang=pl` | `?lang=en` |
| krok zajęć | `#zajecia=2.3` | `#lessons=2.3` |
| karta wzorów | `#wzory` | `#formulas` |
| tryb prowadzącego (z odpowiedziami, niezabezpieczony) | `?prowadzacy` | `?teacher` |

Bez `?lang` strona używa ostatnio wybranego języka, a w pierwszej kolejności języka przeglądarki.

## Struktura
```
index.html, i18n/          strona główna (lista ćwiczeń, PL/EN); przekierowuje stare linki do lc/
shared/css/base.css        wspólny wygląd (tryb ciemny, telefon, wydruk)
shared/fonts/              podzbiór STIX Two Math (SIL OFL 1.1, licencja: OFL-STIXTwoMath.txt)
shared/js/i18n.js          wspólny silnik języków: ?lang=, t(), przełącznik PL/EN
shared/js/mathml.js        pomocnik zapisu wzorów w MathML
shared/js/player.js        odtwarzacz modułów „przed zajęciami” (mikrokroki, telefon) + shared/css/player.css
lc/index.html              ćwiczenie LC
lc/i18n/pl.js, en.js       WSZYSTKIE teksty LC (interfejs, lekcje, komunikaty, legendy wzorów)
lc/js/model.js             model chromatograficzny
lc/js/ui.js                wykresy, tabela, formularz, animacja
lc/js/lessons.js           logika zadań (wspólna dla języków) i silnik zajęć
lc/js/formulas.js          wzory LC w MathML
lc/js/app.js               zdarzenia i start
lc/modul.html, lc/js/modules.js   moduły „przed zajęciami” LC: lista (bez ?m) lub moduł ?m=m1…m5
tests/run.js               test (wszystkie strony, oba języki)
docs/                      założenia projektowe
```
Słowniki rejestrują się jako `I18N.pl` / `I18N.en` i muszą mieć identyczną strukturę (sprawdza test).
Nowe ćwiczenie = folder obok `lc/` korzystający z `shared/`. Silnik lekcji zostanie przeniesiony do `shared/`
razem z przebudową pod telefon (D6–D7).

## Testy
```
npm install      # jednorazowo: playwright
npm test
```
Test sprawdza: zgodność struktury tekstów PL/EN, brak błędów i brakujących kluczy, że każde zadanie
typu „cel” nie jest zaliczone na starcie i ma rozwiązanie, identyczność wyników liczbowych PL/EN
oraz brak przewijania w poziomie na telefonie.

### Model
Opis modelu i uproszczeń: sekcja „Model i założenia” na stronie. Temperatura, pH, bufor i chemia fazy
stacjonarnej nie są modelowane; w przykładach z monografii retencje dopasowano do podanych czasów
i retencji względnych (w przykładzie aspartamu – ilustracyjne). Wyniki są orientacyjne.

# Symulator HPLC / HPLC Simulator

Interaktywny symulator dydaktyczny chromatografii cieczowej (Ph. Eur. 2.2.46, 2.2.29) w wersji
polskiej i angielskiej. Statyczna strona bez zależności – działa na GitHub Pages i po otwarciu
`index.html` z dysku (offline).

Online: https://mariuszbelka.github.io/LC/ · English: https://mariuszbelka.github.io/LC/?lang=en

## Tryby
- **Symulator** – retencja (LSS, izokracja i gradient z objętością opóźnienia), sprawność (van Deemter),
  dyspersja pozakolumnowa, kształt piku EMG, szum detektora; parametry liczone wzorami Ph. Eur. 2.2.46
  z pomiaru pików (k, α, N, R_s, A_s, S/N, p/v), ciśnienie, animacja pasm w kolumnie.
- **Zajęcia** – 5 lekcji podstawowych i 5 przykładów z monografii (sulfametoksazol 0108, kwas askorbinowy 0253,
  werapamil 0573, aspartam 0973, estolan erytromycyny 0552); zadania obliczeniowe, zamknięte i cele w symulatorze.
- **Wzory** – karta wzorów Ph. Eur. 2.2.46 w zapisie MathML, do druku / PDF.

## Linki
| | PL | EN |
|---|---|---|
| wybór języka | `?lang=pl` | `?lang=en` |
| krok zajęć | `#zajecia=2.3` | `#lessons=2.3` |
| karta wzorów | `#wzory` | `#formulas` |
| tryb prowadzącego (z odpowiedziami, niezabezpieczony) | `?prowadzacy` | `?teacher` |

Bez `?lang` strona używa ostatnio wybranego języka, a w pierwszej kolejności języka przeglądarki.

## Struktura
```
index.html            szkielet strony (teksty wstawiane z i18n)
css/style.css         wygląd, tryb ciemny, wydruk karty wzorów
fonts/                podzbiór STIX Two Math (SIL OFL 1.1, licencja w fonts/OFL-STIXTwoMath.txt)
i18n/pl.js, en.js     WSZYSTKIE teksty: interfejs, lekcje, komunikaty, legendy wzorów
js/i18n.js            wybór języka, funkcja t()
js/model.js           model chromatograficzny (compute)
js/ui.js              wykresy, tabela, formularz, animacja
js/lessons.js         logika zadań (warunki startowe, odpowiedzi, sprawdzanie) – wspólna dla języków
js/formulas.js        wzory w MathML – wspólne dla języków
js/app.js             zdarzenia i start
tests/run.js          test obu wersji językowych
```

Logika zadań jest jedna; teksty są w `i18n/<język>.js` w tablicy `lessons` o tej samej kolejności lekcji
i kroków co `LESSON_LOGIC` w `js/lessons.js`. Nowy język = kopia `i18n/en.js` + wpis w `js/i18n.js`.

## Testy
```
npm install      # jednorazowo: playwright
npm test
```
Test sprawdza: zgodność struktury tekstów PL/EN, brak błędów i brakujących kluczy, że każde zadanie
typu „cel” nie jest zaliczone na starcie i ma rozwiązanie, identyczność wyników liczbowych PL/EN
oraz brak przewijania w poziomie na telefonie.

## Model
Opis modelu i uproszczeń: sekcja „Model i założenia” na stronie. Temperatura, pH, bufor i chemia fazy
stacjonarnej nie są modelowane; w przykładach z monografii retencje dopasowano do podanych czasów
i retencji względnych (w przykładzie aspartamu – ilustracyjne). Wyniki są orientacyjne.

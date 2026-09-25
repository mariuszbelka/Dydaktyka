# KONTEKST — Repozytorium dydaktyczne (ćwiczenia: LC, MS, ekstrakcja, analityka leków biotechnologicznych)

**Aktualizacja: 25.09.2026 · źródło: Claude Code**

## Status
Działający dwujęzyczny (PL/EN) symulator HPLC z trybem zajęć (5 lekcji podstawowych + 5 przykładów z monografii Ph. Eur.) i kartą wzorów Ph. Eur. 2.2.46, opublikowany na GitHub Pages. Następny etap: przebudowa pod telefony, porcjowanie treści, materiały „przed zajęciami” i raport mailem do prowadzącego (D6–D10). Docelowo repozytorium obejmie wszystkie prowadzone ćwiczenia (D11); LC jest pierwszym z nich. **Pierwsze ćwiczenia: grudzień 2026.** Wymagania: indywidualne raporty, zadania casowe, odporność na oszustwa, moduły otwierane wg harmonogramu – wymagają serwera (D12–D16).

Online: https://mariuszbelka.github.io/LC/?lang=pl · https://mariuszbelka.github.io/LC/?lang=en
Repozytorium: https://github.com/mariuszbelka/LC (publiczne; gałąź robocza `claude/keen-shannon-18w04r`, publikacja z `main`).

## Decyzje
| # | Data | Decyzja | Uzasadnienie / uwaga |
|---|---|---|---|
| D1 | 25.09.2026 | Statyczna strona na GitHub Pages, repozytorium publiczne | zero infrastruktury, stały link dla studentów |
| D2 | 25.09.2026 | Merytoryka oparta na Ph. Eur. 2.2.46 i 2.2.29 oraz monografiach 0108, 0253, 0573, 0973, 0552; tekstu Ph. Eur. nie umieszczamy w repo | prawa autorskie – w repo tylko parametry metod i opisy własnymi słowami |
| D3 | 25.09.2026 | Poziom podstawowy (farmacja/analityka); zadania w symulatorze: obliczeniowe, zamknięte, „cel do osiągnięcia” | wybór Mariusza |
| D4 | 25.09.2026 | Podział na pliki bez narzędzi budowania (zwykłe skrypty), działa też offline z dysku | projekt urósł; ~~jeden plik HTML~~ → struktura z `README.md` |
| D5 | 25.09.2026 | Wersje PL i EN (English Division): jedna logika zadań, teksty w `i18n/`; terminologia Ph. Eur.; separator dziesiętny PL „,” / EN „.” | identyczne zadania dla obu grup; wyniki PL/EN sprawdza test |
| D6 | 25.09.2026 | Podstawowym urządzeniem studenta jest **telefon** – projekt mobile-first | wygoda studentów; szczegóły: `docs/ZALOZENIA_PROJEKTOWE.md` §2 |
| D7 | 25.09.2026 | **Mniejsza gęstość treści**: mikrokroki (jedna idea/jedno działanie na ekran), stopniowe odsłanianie – **bez obniżania wymagań** (te same obliczenia, kryteria SST, tolerancje) | fizyczny rozmiar ekranu i możliwość przetworzenia treści na raz przez obecnych studentów; §3 |
| D8 | 25.09.2026 | Materiały **„przed zajęciami”** przygotowujące do aktywnego udziału w seminarium praktycznym na żywo | model odwróconej klasy; §4 |
| D9 | 25.09.2026 | Na koniec student **wysyła raport mailem** do prowadzącego | wariant techniczny do wyboru (mailto / plik / formularz); §5 |
| D10 | 25.09.2026 | Dalsze prace wspólnie: struktura lekcji, sposób raportowania, szczegóły metodyczne | §6 |
| D11 | 25.09.2026 | Repozytorium = **baza wszystkich zajęć Mariusza**: ćwiczenia z LC, MS, ekstrakcji i analityki leków biotechnologicznych, każde w PL i EN | wspólny silnik (języki, lekcje, raport, wygląd) + osobny folder na ćwiczenie; §9 |
| D12 | 25.09.2026 | Każdy student wysyła **własny raport** z wykonania | §10 |
| D13 | 25.09.2026 | Zadania **angażujące, problemowe, casowe** (diagnoza → działanie w granicach Ph. Eur. → sprawdzenie → uzasadnienie) | §10.3 |
| D14 | 25.09.2026 | **Odporność na oszustwa**: indywidualne warianty, sprawdzanie na serwerze, rejestr prób, weryfikacja ustna na seminarium | §10.2 |
| D15 | 25.09.2026 | Moduły **otwierane i zamykane** zgodnie z terminami zajęć grup | egzekwowane na serwerze; §10 |
| D16 | 25.09.2026 | Potrzebny **backend**; D9 w wariancie „mailto” ~~raport z przeglądarki~~ → raport tworzony na serwerze, mail jako powiadomienie | wynika z D12, D14, D15; warianty w §10.4 (rekomendacja: usługa w chmurze UE po uzgodnieniu z IOD) |

## Stan merytoryczny
Model: retencja LSS (izokracja/gradient z objętością opóźnienia), van Deemter, dyspersja pozakolumnowa, piki EMG (ogonowanie zasad), szum i S/N, ciśnienie (Darcy); parametry liczone wzorami Ph. Eur. z pomiaru pików. Retencje w przykładach z monografii dopasowane do podanych t_R/RRT (aspartam – ilustracyjnie). Nie modelujemy temperatury, pH, buforu ani chemii fazy stacjonarnej.

## Następne kroki / blokery
1. **Decyzja o architekturze backendu** (§10.4) i zgoda IOD uczelni na przetwarzanie danych studentów; pytania §10.6 – **blokuje D12, D14, D15**; termin: październik 2026.
1a. Decyzja o docelowej strukturze repozytorium i adresach (D11, `docs/ZALOZENIA_PROJEKTOWE.md` §9) – **przed** przebudową mobilną, żeby nie robić jej dwa razy.
2. Odpowiedzi Mariusza na pytania z `docs/ZALOZENIA_PROJEKTOWE.md` §7 (czas modułu „przed”, podział lekcji, wariant raportu, adres e-mail, EN, pre-test) – **blokują implementację D8–D9**.
3. Projekt ekranu zadania na telefon (makieta) i podział obecnych kroków na mikrokroki (D6–D7).
4. Przegląd merytoryczny wersji EN przez English Division.
5. Rozszerzenie `npm test` o kryteria z §8.

## Kluczowe pliki
| Ścieżka | Co to |
|---|---|
| `docs/ZALOZENIA_PROJEKTOWE.md` | cele i zasady D6–D16, struktura repozytorium, backend i ochrona przed oszustwami (§10), harmonogram do grudnia, pytania otwarte |
| `README.md` | struktura kodu, linki PL/EN, testy |
| `i18n/pl.js`, `i18n/en.js` | wszystkie teksty (lekcje, komunikaty, wzory) |
| `js/lessons.js` | logika zadań (wspólna dla języków) |
| `tests/run.js` | test obu wersji (`npm test`) |

## Historia zmian
- 25.09.2026 — Claude Code: D12–D16 (raporty indywidualne, casy, odporność na oszustwa, harmonogram modułów, backend); termin: grudzień 2026.
- 25.09.2026 — Claude Code: założenie pliku; decyzje D1–D5 (stan obecny), D6–D10 (mobile, porcjowanie, „przed zajęciami”, raport mailem) i D11 (repo dla wszystkich zajęć).

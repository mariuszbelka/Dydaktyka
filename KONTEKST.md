# KONTEKST — Repozytorium dydaktyczne (ćwiczenia: LC, MS, ekstrakcja, analityka leków biotechnologicznych)

**Aktualizacja: 25.09.2026 · źródło: Claude Code**

## Status
Działający dwujęzyczny (PL/EN) symulator HPLC z trybem zajęć (5 lekcji podstawowych + 5 przykładów z monografii Ph. Eur.) i kartą wzorów Ph. Eur. 2.2.46, opublikowany na GitHub Pages. Następny etap: przebudowa pod telefony, porcjowanie treści, materiały „przed zajęciami” i raport mailem do prowadzącego (D6–D10). Docelowo repozytorium obejmie wszystkie prowadzone ćwiczenia (D11); LC jest pierwszym z nich. **Pierwsze ćwiczenia: grudzień 2026.** Wymagania: indywidualne raporty, zadania casowe, odporność na oszustwa, moduły otwierane wg harmonogramu – wymagają serwera (D12–D16).

Online: https://mariuszbelka.github.io/Dydaktyka/ (ćwiczenie LC: `…/Dydaktyka/lc/?lang=pl|en` po scaleniu nowej struktury do `main`)
Repozytorium: https://github.com/mariuszbelka/Dydaktyka (publiczne, plan darmowy; gałąź robocza `claude/keen-shannon-18w04r`, publikacja z `main`). Stary adres `…/LC/` nie działa od zmiany nazwy.

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
| D15 | 25.09.2026 | Moduły **otwierane i zamykane** zgodnie z terminami zajęć grup | ~~egzekwowane na serwerze~~ → daty dostępności w Moodle (D17), serwer dodatkowo odrzuca spóźnione zgłoszenia; §10 |
| D16 | 25.09.2026 | Potrzebny **backend**; D9 w wariancie „mailto” ~~raport z przeglądarki~~ → raport tworzony na serwerze, mail jako powiadomienie | wynika z D12, D14, D15; warianty w §10.4 (rekomendacja: usługa w chmurze UE po uzgodnieniu z IOD) |
| D17 | 25.09.2026 | Platforma: **Moodle uczelni przez LTI 1.3**; terminy otwarcia/zamknięcia modułów ustawiane w Moodle | tożsamość, grupy i harmonogram z Moodle; potrzebny mały serwer narzędzia + rejestracja przez IT; §10.7 |
| D18 | 25.09.2026 | Logowanie przez Moodle (LTI); zapasowo jednorazowy link na mail uczelniany | dostęp spoza Moodle i pilotaż przed konfiguracją IT |
| D19 | 25.09.2026 | Wyniki **nie wpływają na ocenę** – raport = informacja zwrotna | umiarkowany poziom zabezpieczeń (warianty, serwer, okna, rejestr), bez proctoringu |
| D20 | 25.09.2026 | Repozytorium = **prywatne źródło prawdy Mariusza** dla wszystkich zajęć; Moodle = kanał udostępniania studentom | treści, zadania i decyzje powstają w repo, do Moodle trafiają aktywności/linki |
| D21 | 25.09.2026 | Nazwa repozytorium: **`dydaktyka`** (zamiast `LC`) | zgodne z D11; zmianę nazwy wykonuje Mariusz w ustawieniach GitHub; adres stron zmieni się na `mariuszbelka.github.io/Dydaktyka/` |
| D22 | 25.09.2026 | Skala: **~80 studentów, 10 grup**; kursy Moodle **PL i EN są osobne** | język ćwiczenia ustalany przez kurs (parametr LTI), harmonogramy grup w Moodle |
| D23 | 25.09.2026 | Cel: **zbiorcze zaliczenie w Moodle** dla wszystkich studentów | narzędzie zwraca do Moodle wynik „ukończono” (LTI Assignment and Grade Services); w kursie: ukończenie aktywności „po otrzymaniu oceny/zaliczenia”, pozycja oceny ukryta, waga 0 (zgodnie z D19) – raport ukończenia kursu pokazuje wszystkich naraz |
| D24 | 25.09.2026 | Repozytorium na razie **publiczne, plan darmowy** (GitHub Pages) | ochronę przed oszustwami zapewnią warianty i sprawdzanie na serwerze (D14), nie ukrycie kodu |
| D25 | 25.09.2026 | Struktura: strona główna + `shared/` (wspólne) + folder na ćwiczenie (`lc/`, później `ms/`, `ekstrakcja/`, `biotech/`) | realizacja D11; silnik lekcji trafi do `shared/` w kroku 2 (mobile) |
| D26 | 25.09.2026 | Moduły „przed zajęciami” w **odtwarzaczu mikrokroków** (`shared/js/player.js`, strona `lc/modul.html`): 1 ekran = 1 pojęcie lub 1 zadanie, przyklejony chromatogram, duży przycisk na dole; nie można przeskoczyć nierozwiązanego zadania; po 3 błędnych próbach „Pokaż rozwiązanie” = krok „z pomocą”; na końcu podsumowanie + pytanie na seminarium | prototyp: moduł 1 (LC) = ten sam zakres obliczeń i tolerancje co lekcja 1; test: ekran informacyjny ≤ 80 słów, przejście całego modułu PL/EN |
| D27 | 25.09.2026 | **Zaakceptowano** kierunek mikrokroków: ilość treści na ekran odpowiednia, pytania prowadzą krok po kroku; w materiałach „przed zajęciami” **wolno odsłaniać rozwiązanie** (po 3 próbach, krok „z pomocą”) | ocena prototypu modułu 1 przez Mariusza; ten format obowiązuje dla kolejnych modułów |

## Stan merytoryczny
Model: retencja LSS (izokracja/gradient z objętością opóźnienia), van Deemter, dyspersja pozakolumnowa, piki EMG (ogonowanie zasad), szum i S/N, ciśnienie (Darcy); parametry liczone wzorami Ph. Eur. z pomiaru pików. Retencje w przykładach z monografii dopasowane do podanych t_R/RRT (aspartam – ilustracyjnie). Nie modelujemy temperatury, pH, buforu ani chemii fazy stacjonarnej.

## Następne kroki / blokery
1. **Moodle/LTI (D17):** kontakt z administratorem Moodle uczelni (wersja ≥ 3.10, rejestracja narzędzia LTI 1.3), miejsce hostingu serwera narzędzia i uzgodnienie z IOD (§10.7, pyt. 15–17) – **blokuje D12, D14, D15 w wersji produkcyjnej**; termin: październik 2026. Do tego czasu: wspólny silnik, ścieżka mobilna, casy i serwer narzędzia z logowaniem zapasowym (D18).
1a. ~~Zmiana nazwy~~ – zrobione (25.09.2026). Nowa struktura `shared/` + `lc/` + strona główna – zrobione na gałęzi roboczej (krok 1); do scalenia z `main` po akceptacji.
1b. ~~Widoczność~~ → repo **na razie publiczne i darmowe** (D24). Mariusz sprawdza wersję Moodle.
2. Odpowiedzi Mariusza na pytania z `docs/ZALOZENIA_PROJEKTOWE.md` §7 (czas modułu „przed”, podział lekcji, wariant raportu, adres e-mail, EN, pre-test) – **blokują implementację D8–D9**.
3. ~~Ocena prototypu~~ → zaakceptowany (D27). Dalej: pozostałe lekcje i casy w formacie mikrokroków; raport (po Moodle).
4. Przegląd merytoryczny wersji EN przez English Division.
5. Rozszerzenie `npm test` o kryteria z §8.

## Kluczowe pliki
| Ścieżka | Co to |
|---|---|
| `docs/ZALOZENIA_PROJEKTOWE.md` | cele i zasady D6–D16, struktura repozytorium, backend i ochrona przed oszustwami (§10), harmonogram do grudnia, pytania otwarte |
| `README.md` | struktura kodu, linki PL/EN, testy |
| `lc/i18n/pl.js`, `lc/i18n/en.js` | wszystkie teksty LC (lekcje, komunikaty, wzory) |
| `lc/js/lessons.js` | logika zadań LC (wspólna dla języków) |
| `shared/js/player.js`, `lc/js/modules.js`, `lc/modul.html` | odtwarzacz modułów „przed zajęciami” i moduł 1 LC |
| `tests/run.js` | test obu wersji (`npm test`) |

## Historia zmian
- 25.09.2026 — Claude Code: D27 – akceptacja mikrokroków i odsłaniania rozwiązań.
- 25.09.2026 — Claude Code: D26 – odtwarzacz mikrokroków i prototyp modułu 1 (krok 2).
- 25.09.2026 — Claude Code: D24–D25; zmiana nazwy repo na `dydaktyka`; nowa struktura (krok 1) na gałęzi roboczej.
- 25.09.2026 — Claude Code: D20–D23 (repo jako źródło prawdy, nazwa `dydaktyka`, 80 studentów / 10 grup / osobne kursy PL i EN, zbiorcze zaliczenie w Moodle).
- 25.09.2026 — Claude Code: D17–D19 (Moodle LTI, logowanie, wyniki bez wpływu na ocenę).
- 25.09.2026 — Claude Code: D12–D16 (raporty indywidualne, casy, odporność na oszustwa, harmonogram modułów, backend); termin: grudzień 2026.
- 25.09.2026 — Claude Code: założenie pliku; decyzje D1–D5 (stan obecny), D6–D10 (mobile, porcjowanie, „przed zajęciami”, raport mailem) i D11 (repo dla wszystkich zajęć).

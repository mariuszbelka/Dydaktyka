# Założenia projektowe i dydaktyczne – repozytorium ćwiczeń (LC, MS, ekstrakcja, leki biotechnologiczne)

**Stan: 25.09.2026 · źródło: Mariusz (decyzje) / Claude Code (spisanie)**
Dokument roboczy. Streszczenie decyzji jest w `KONTEKST.md` (D6–D11). Tutaj są cele, zasady
i pytania otwarte, które trzeba rozstrzygnąć przed implementacją.

---

## 1. Cel nadrzędny

Symulator i lekcje mają **przygotować studentów do aktywnego udziału w seminarium praktycznym
prowadzonym na żywo** oraz dać prowadzącemu informację zwrotną (raport), a nie zastąpić zajęcia.
Wymagania merytoryczne – zgodność z Ph. Eur. 2.2.46/2.2.29, obliczenia z danych chromatograficznych,
kryteria przydatności układu – **pozostają na obecnym poziomie**.

## 2. Telefon jako podstawowe urządzenie (D6)

Studenci będą korzystać z zasobów głównie na telefonach. Projekt zaczyna się od ekranu telefonu,
a wersja komputerowa jest jego rozszerzeniem, nie odwrotnie.

Zasady:
- **Punkt odniesienia:** ekran ~390 × 844 px, orientacja pionowa, obsługa kciukiem.
  Test automatyczny już sprawdza brak przewijania w poziomie; dochodzi ocena „jeden ekran = jedno zadanie”.
- **Na ekranie zadania widać jednocześnie:** polecenie, jeden potrzebny wykres (zwykle chromatogram)
  i tylko te kontrolki, których zadanie wymaga. Pozostałe panele są zwinięte.
  Obecnie wszystkie kontrolki są zawsze widoczne, a wykres jest daleko pod nimi – to trzeba zmienić.
- **Cele dotykowe ≥ 44 px**, suwaki zamiast wpisywania tam, gdzie to możliwe, klawiatura numeryczna
  przy odpowiedziach liczbowych (już jest `inputmode="decimal"`).
- **Tabela wyników** na telefonie: tylko kolumny potrzebne w danym kroku (np. t_R, w_h), reszta na żądanie.
- **Wydajność:** strona ma działać płynnie na przeciętnym telefonie i słabym łączu (bez zewnętrznych
  bibliotek; obecny rozmiar ~0,5 MB łącznie z czcionką – nie zwiększać bez potrzeby).

## 3. Gęstość treści: porcjowanie bez obniżania wymagań (D7)

Problem: obecny krok zawiera naraz kontekst, definicję, wzór, odwołanie do Ph. Eur., polecenie,
podpowiedź i wyjaśnienie. Na telefonie to kilka ekranów tekstu, a do tego trudno to przetworzyć
za jednym razem. Założenie projektowe: obecni studenci (pokolenie Z) lepiej przyswajają treść
podaną w krótkich, domkniętych porcjach z natychmiastową informacją zwrotną – trzeba im w tym
pomóc strukturą materiału, **nie** upraszczając samych wymagań.

Zasady porcjowania:
- **Jedna idea i jedno działanie na ekran.** Krok dzielimy na mikrokroki:
  (a) krótkie wprowadzenie / obserwacja w symulatorze → (b) pojęcie i wzór → (c) zadanie → (d) informacja zwrotna.
- **Orientacyjny limit tekstu:** ok. 40–80 słów na ekran przed pierwszym działaniem studenta
  (do zweryfikowania na zajęciach, nie dogmat).
- **Stopniowe odsłanianie:** odwołanie do Ph. Eur., uzasadnienie i „dlaczego” są dostępne po rozwinięciu
  lub po udzieleniu odpowiedzi, a nie przed nią.
- **Najpierw obserwacja, potem formalizm** tam, gdzie to możliwe (np. przesuń %B → co się stało z k? → wzór LSS).
- **Informacja zwrotna od razu** po każdej odpowiedzi, z wyjaśnieniem opartym na bieżących liczbach (już jest).

Czego NIE robimy (ochrona jakości):
- nie usuwamy obliczeń ani nie zastępujemy ich wyborem z listy,
- nie zaokrąglamy/nie upraszczamy wzorów Ph. Eur. ani kryteriów SST,
- nie luzujemy tolerancji odpowiedzi liczbowych,
- nie skracamy liczby zadań kosztem zakresu – porcjowanie zmienia *podział*, nie *ilość* wymagań.

## 4. Materiały „przed zajęciami” (D8)

Cel: student przychodzi na seminarium praktyczne z opanowanymi pojęciami i rachunkiem, więc czas
na żywo idzie na pracę z aparatem, dyskusję i rozwiązywanie problemów (model „odwróconej klasy”).

Założenia robocze (do doprecyzowania – p. 7):
- **Osobna ścieżka „Przed zajęciami”** dla każdego seminarium: jasno podane cele („po tym module potrafisz…”),
  krótkie porcje treści, zadania sprawdzające, na końcu raport.
- **Szacowany czas** podany na starcie (np. 20–30 min; do ustalenia).
- **Zadania gotowości** („bilet wejściowy”) – kilka obowiązkowych zadań, których wynik trafia do raportu,
  żeby prowadzący przed zajęciami wiedział, co trzeba powtórzyć.
- **Powiązanie z zajęciami na żywo:** każdy moduł kończy się 1–2 pytaniami / problemami, które będą
  rozwiązywane na seminarium (student przychodzi z własną propozycją).
- Istniejące lekcje (podstawy + monografie) zostają; część z nich stanie się materiałem „przed”,
  część – materiałem do pracy na zajęciach (podział do ustalenia).

## 5. Raport do prowadzącego mailem (D9)

Na końcu modułu student wysyła prowadzącemu raport e-mailem.

Ograniczenia techniczne (strona jest statyczna, na GitHub Pages – bez serwera):
- **Wariant A – `mailto:`**: przycisk otwiera aplikację pocztową studenta z gotowym tematem i treścią
  raportu. Zalety: zero infrastruktury, działa na telefonie, dane idą wyłącznie przez pocztę studenta.
  Wady: długość treści bywa ograniczona (bezpiecznie ~1500–2000 znaków), brak załączników,
  student może edytować treść przed wysłaniem.
- **Wariant B – raport jako plik** (PDF/TXT) pobierany i dołączany ręcznie do maila. Pełniejszy,
  ale na telefonie mniej wygodny.
- **Wariant C – formularz uczelniany** (np. MS Forms / Google Forms) zamiast maila. Wygodne zbiorcze
  wyniki dla prowadzącego, ale to nie jest „mail” i zależy od polityki uczelni.
- ~~Rekomendacja robocza: A jako podstawa + opcjonalnie B~~ → **nieaktualne po D12–D15 (25.09.2026)**:
  wymaganie odporności na oszustwa wyklucza raport tworzony i wysyłany wyłącznie z przeglądarki
  studenta (można go dowolnie zmienić). Raport ma powstawać i być przechowywany po stronie serwera; e-mail
  pozostaje kanałem powiadomienia i kopii dla studenta – patrz §10.

Zawartość raportu (propozycja do akceptacji):
- identyfikacja: imię i nazwisko, nr albumu, grupa (wpisywane przez studenta, nie przechowywane na serwerze),
- moduł, język, data i czas ukończenia,
- dla każdego zadania: zaliczone / niezaliczone, liczba prób, podana odpowiedź liczbowa,
- wyniki zadań „gotowości” i odpowiedzi na pytania na seminarium,
- krótka suma kontrolna utrudniająca ręczną edycję wyników (nie zabezpieczenie kryptograficzne).

Kwestie prawne/organizacyjne: dane osobowe (imię, nr albumu) trafiają tylko do poczty prowadzącego –
bez zapisu na serwerze i bez analityki; adres e-mail prowadzącego do ustalenia (nie wpisywać prywatnego adresu
w kodzie bez decyzji – repozytorium jest publiczne).

## 6. Dalsze prace nad treścią (D10)

Do dopracowania wspólnie z Mariuszem:
- **struktura lekcji** (mikrokroki, ścieżki „przed” / „na zajęciach”, kolejność tematów),
- **sposób raportowania** (p. 5),
- **szczegóły metodyczne** (dobór zadań, poziom podpowiedzi, liczba prób, forma informacji zwrotnej,
  powiązanie z zajęciami na żywo i z oceną).

## 7. Pytania otwarte do Mariusza

1. Ile czasu student ma poświęcić na moduł „przed zajęciami” i ile takich modułów (na każde seminarium?).
2. Które obecne lekcje mają być „przed”, a które „na zajęciach”?
3. Raport: wariant A, B czy C; czy raport ma wpływać na ocenę (wtedy potrzebna lepsza ochrona przed edycją)?
4. Adres e-mail do raportów (służbowy) i format tematu maila (np. „[HPLC] Moduł 1 – nr albumu”).
5. Czy ta sama struktura i raport obowiązują w English Division?
6. Czy potrzebny jest krótki „pre-test” na początku modułu (do porównania z wynikiem końcowym)?

## 8. Kryteria akceptacji (do testów)

- każdy ekran zadania na 390 px mieści: polecenie + wykres + potrzebne kontrolki bez przewijania w poziomie
  i z minimalnym przewijaniem w pionie,
- żaden mikrokrok nie przekracza limitu tekstu z p. 3 przed pierwszym działaniem studenta,
- zakres i trudność zadań nie maleją względem wersji z 25.09.2026 (te same obliczenia, kryteria, tolerancje),
- raport zawiera wszystkie pola z p. 5 i generuje się poprawnie w PL i EN,
- test automatyczny (`npm test`) obejmuje nowe elementy.

## 9. Repozytorium dla wszystkich zajęć (D11)

Docelowo to repozytorium jest bazą wszystkich ćwiczeń prowadzonych przez Mariusza, każde w wersji
polskiej i angielskiej:
- chromatografia cieczowa (LC) – obecny symulator i lekcje,
- spektrometria mas (MS),
- ekstrakcja (przygotowanie próbki),
- analityka leków biotechnologicznych.

Zasady D6–D10 (telefon, porcjowanie, „przed zajęciami”, raport mailem, dwa języki) obowiązują
**wszystkie** ćwiczenia, więc powinny powstać raz, jako wspólny silnik, a nie osobno w każdym ćwiczeniu.

Proponowana struktura (do akceptacji):
```
index.html              strona główna: lista ćwiczeń, wybór języka
shared/                 wspólny silnik: i18n, silnik lekcji i zadań, raport mailem, style, czcionka wzorów, testy
lc/                     ćwiczenie LC (obecny symulator: model, lekcje, wzory, teksty PL/EN)
ms/                     ćwiczenie MS
ekstrakcja/             ćwiczenie z ekstrakcji
biotech/                analityka leków biotechnologicznych
docs/                   założenia, decyzje, materiały dla prowadzącego
```
Każde ćwiczenie ma własne: model/symulację (jeśli jest), lekcje „przed zajęciami” i „na zajęciach”,
teksty `pl`/`en` i kartę wzorów lub pojęć. Wspólne: przełącznik języka, ścieżka lekcji na telefon,
typy zadań, raport, wygląd, testy.

Ryzyka i skutki:
- **Adresy:** obecny symulator jest w katalogu głównym (`…/LC/`). Po przeniesieniu do `…/LC/lc/`
  stare linki (`…/LC/?lang=en#lessons=2.3`) trzeba przekierować – strona główna rozpozna stare
  parametry i przeniesie do ćwiczenia LC.
- **Nazwa repozytorium:** „LC” przestanie pasować do zawartości. Zmiana nazwy (np. na „dydaktyka”)
  zmienia też adres GitHub Pages (`mariuszbelka.github.io/<nazwa>/`), a stary adres **nie**
  przekierowuje automatycznie. Decyzja: zostawić nazwę (i znane już studentom linki) czy zmienić
  teraz, zanim linki się rozejdą – **do decyzji Mariusza**; im wcześniej, tym taniej.
- **Kolejność prac:** najpierw wydzielenie wspólnego silnika i nowa struktura, potem przebudowa
  mobilna i raport – inaczej te elementy trzeba by robić dwa razy.
- **Monografie i źródła:** zasada D2 (bez tekstu Ph. Eur. i innych chronionych źródeł w publicznym repo)
  obowiązuje wszystkie ćwiczenia.

Pytania otwarte (uzupełnienie §7):
7. Zmiana nazwy repozytorium i adresu teraz czy pozostawienie „LC”?
8. Kolejność powstawania ćwiczeń (MS, ekstrakcja, biotech) i terminy zajęć, na które mają być gotowe.
9. Czy ćwiczenia MS / ekstrakcja / biotech mają mieć symulator (jak LC), czy wystarczą lekcje
   z zadaniami na danych (np. widma, wyniki odzysku)?

## 10. Wymagania funkcjonalne od 25.09.2026 (D12–D16)

Termin: **pierwsze ćwiczenia w grudniu 2026**. Funkcjonalność ma priorytet nad szybkością wdrożenia.

| # | Wymaganie | Co to oznacza w praktyce |
|---|---|---|
| D12 | **Każdy student wysyła własny, indywidualny raport z wykonania** | identyfikacja studenta, raport przypisany do osoby i modułu, prowadzący widzi listę raportów grupy |
| D13 | **Zadania angażujące, problemowe, oparte na przypadkach („casy”)** | zamiast „oblicz Rs” – sytuacja z laboratorium kontroli jakości, którą trzeba zdiagnozować i rozwiązać w granicach Ph. Eur., z krótkim uzasadnieniem |
| D14 | **Odporność na oszustwa** | indywidualne warianty zadań, sprawdzanie odpowiedzi poza przeglądarką, rejestr prób, wykrywanie anomalii |
| D15 | **Moduły otwierane i zamykane zgodnie z terminami zajęć** | harmonogram na grupę; poza oknem czasowym nie da się wysłać rozwiązania (lub wysłanie jest oznaczone jako spóźnione) |
| D16 | **Potrzebny serwer (backend)** – wniosek z D12, D14, D15 | strona statyczna na GitHub Pages zostaje jako interfejs; dochodzi usługa: logowanie, wydawanie wariantów, sprawdzanie, raporty, harmonogram |

### 10.1 Dlaczego sama strona statyczna nie wystarczy
Kod strony jest publiczny i wykonuje się w telefonie studenta. Każdą kontrolę w przeglądarce
(data otwarcia modułu, sprawdzenie odpowiedzi, „suma kontrolna” raportu) można obejść narzędziami
przeglądarki, a poprawne odpowiedzi można policzyć, uruchamiając kod strony. Ochrona musi więc
opierać się na tym, czego student nie kontroluje: serwerze z tajnym kluczem i zapisie zdarzeń.

### 10.2 Projekt ochrony przed oszustwami (warstwy)
1. **Tożsamość:** logowanie adresem uczelnianym (domena uczelni) – najlepiej przez uczelniane
   konto (SSO, np. Microsoft 365) albo jednorazowy link na maila uczelnianego.
2. **Indywidualne warianty:** parametry zadania (retencje, poziomy zanieczyszczeń, warunki metody, dane „casu”)
   generuje serwer z ziarna = f(student, moduł, tajny klucz). Każdy ma inne liczby, więc przekazanie
   odpowiedzi koledze nic nie daje, a znajomość publicznego kodu nie wystarcza do wyliczenia cudzych wyników.
3. **Sprawdzanie po stronie serwera:** przeglądarka wysyła odpowiedź, serwer ją ocenia; wyjaśnienia
   i poprawne wartości trafiają do przeglądarki dopiero po zaliczeniu lub zamknięciu modułu.
4. **Okna czasowe na serwerze** (D15): serwer odrzuca albo oznacza rozwiązania spoza harmonogramu grupy.
5. **Rejestr zdarzeń:** czas rozpoczęcia i zakończenia, liczba prób, czas na zadanie. Flagi dla prowadzącego:
   ukończenie nierealnie szybko, identyczne błędne odpowiedzi u różnych studentów, wiele kont z jednego urządzenia.
6. **Raport tworzony przez serwer** (nie przez przeglądarkę): prowadzący dostaje zestawienie (tabela / CSV) i powiadomienie
   mailem; student dostaje kopię.
7. **Weryfikacja na zajęciach:** zadania „casowe” kończą się pytaniem, które student rozwija ustnie na seminarium –
   najskuteczniejsze zabezpieczenie przed oddaniem cudzej pracy.

Ograniczenie, które trzeba przyjąć świadomie: żaden system zdalny nie zapobiegnie w 100% temu,
że ktoś rozwiąże zadanie za studenta. Celem jest, by oszustwo kosztowało więcej niż samodzielna praca
i było wykrywalne.

### 10.3 Zadania „casowe” (D13) – zasady
- Punkt wyjścia to **realna sytuacja**: np. „SST nie przechodzi po wymianie kolumny”, „nowy aparat UHPLC,
  a monografia jest na HPLC”, „w serii pojawił się nieznany pik”.
- Student **diagnozuje** (z chromatogramu i danych), **proponuje działanie** w granicach Ph. Eur. 2.2.46,
  **sprawdza** je w symulatorze i **uzasadnia** decyzję w 1–3 zdaniach (uzasadnienie trafia do raportu).
- Casy mają kilka poprawnych ścieżek, a niektóre także pułapki (zmiana niedozwolona przez 2.2.46),
  co odróżnia rozumienie od zgadywania.
- Każdy case ma warianty liczbowe (§10.2 p. 2), dzięki czemu te same casy można stosować w kolejnych latach.

### 10.4 Warianty architektury (do decyzji)
| Wariant | Opis | Zalety | Wady / ryzyka |
|---|---|---|---|
| **A. Własna usługa w chmurze UE** (np. Supabase – region Frankfurt, lub Cloudflare Workers + baza) | logowanie adresem uczelnianym (jednorazowy link), baza zadań, raportów i harmonogramu, prosty panel prowadzącego | pełna kontrola nad wariantami, sprawdzaniem i harmonogramem; darmowy lub tani plan wystarcza dla kilkuset studentów | dane osobowe u zewnętrznego dostawcy – wymaga uzgodnienia z IOD uczelni (umowa powierzenia, UE); utrzymanie po stronie projektu |
| **B. Integracja z uczelnianą platformą e-learningową** (np. Moodle przez LTI, jeśli uczelnia ją udostępnia) | logowanie, grupy, terminy i oceny z platformy; symulator jako zewnętrzne narzędzie | tożsamość i RODO po stronie uczelni; znane studentom miejsce | wymaga zgody i konfiguracji przez dział IT; narzędzie LTI i tak potrzebuje własnego serwera do wariantów i sprawdzania |
| **C. Uczelniane Microsoft 365** (SSO + np. Power Automate / listy SharePoint) | logowanie kontem uczelnianym, raporty do listy/arkusza | dane w infrastrukturze uczelni | ograniczone możliwości sprawdzania i generowania wariantów; zależność od uprawnień w tenancie uczelni |

Rekomendacja robocza: **A** z logowaniem przez adres uczelniany, po konsultacji z IOD – daje wszystkie
wymagane funkcje do grudnia; **B** warto rozważyć, jeśli uczelnia udostępnia Moodle z LTI i IT zgodzi się szybko.

### 10.5 Zakres prac i harmonogram roboczy (do grudnia 2026)
1. Decyzje: architektura (10.4), zgoda IOD, adres/konta, nazwa repozytorium (§9) – **październik**.
2. Wspólny silnik (§9) + ścieżka lekcji na telefon (D6–D7) – **październik**.
3. Backend: logowanie, harmonogram, warianty, sprawdzanie, raporty, panel prowadzącego – **październik–listopad**.
4. Pierwsze casy dla LC (przerobienie obecnych lekcji na „przed zajęciami” i casy) – **listopad**.
5. Pilotaż na małej grupie / współpracownikach, poprawki – **koniec listopada**.
6. Pierwsze zajęcia – **grudzień**.

### 10.6 Pytania otwarte (uzupełnienie §7)
10. Z jakich platform uczelni można korzystać: konta Microsoft 365 (SSO), Moodle/inna platforma e-learningowa?
11. Czy mogę założyć usługę w chmurze UE (wariant A) i kto uzgadnia to z IOD uczelni?
12. Kto poza Mariuszem ma mieć dostęp do panelu prowadzącego (asystenci, English Division)?
13. Czy raport i wyniki wpływają na ocenę (to określa wymagany poziom zabezpieczeń i archiwizacji)?
14. Liczba grup i studentów w grudniowych zajęciach (PL/EN), harmonogram terminów.

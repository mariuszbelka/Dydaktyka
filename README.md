# Symulator HPLC

Interaktywny symulator dydaktyczny chromatografii cieczowej w odwróconym układzie faz.
Jeden plik `index.html` bez zależności – działa w przeglądarce, także offline.
Wersja online: https://mariuszbelka.github.io/LC/

## Tryb „Symulator”
- **Retencja** z modelu LSS (`log k = log k_w − S·φ`), elucja izokratyczna i gradientowa
  (izokrata początkowa, objętość opóźnienia D, migracja pasm liczona numerycznie).
- **Sprawność** z równania van Deemtera (cząstki porowate / core-shell), dyspersja pozakolumnowa
  i objętość nastrzyku.
- **Kształt piku** EMG: ogonowanie związków zasadowych, silniejsze na fazie bez end-cappingu.
- **Detekcja**: sygnał w mAU, szum detektora, S/N.
- **Wyniki liczone wzorami Ph. Eur. 2.2.46** z pomiaru symulowanych pików: t_R, w_h, k, α,
  N = 5,54(t_R/w_h)², R_s = 1,18Δt_R/(w_h1+w_h2), A_s = w_0,05/2d, S/N = 2H/h;
  do tego ciśnienie, czas analizy, zużycie fazy, animacja pasm w kolumnie, krzywa van Deemtera.

## Tryb „Zajęcia”
Pięć lekcji dla studentów (poziom podstawowy), oparte na Ph. Eur. 2.2.46 i 2.2.29:

1. **Parametry chromatograficzne** – obliczenia z „raportu integracji”: V_M, k, α, N, R_s, r_G.
2. **Retencja i selektywność** – wpływ %B, dobór składu fazy, inwersja kolejności elucji,
   dozwolone zmiany składu fazy ruchomej.
3. **Sprawność i van Deemter** – optymalny przepływ, ziarno a N, przeliczanie przepływu
   i przeniesienie metody na inną kolumnę (L/d_p), kolumny core-shell.
4. **Aparatura** – dyspersja pozakolumnowa, limit ciśnienia, objętość opóźnienia i jej kompensacja.
5. **Przydatność układu (SST)** – współczynnik symetrii, S/N i czułość układu, %RSD_max.

Zadania są trzech typów: obliczenie (sprawdzane z tolerancją), pytanie zamknięte oraz cel do
osiągnięcia w symulatorze (np. „uzyskaj R_s ≥ 2,0 w dozwolonym zakresie %B”).
Postęp zapisuje się lokalnie w przeglądarce studenta.

Linki do konkretnego kroku: `…/LC/#zajecia=2.3` (lekcja 2, krok 3).
Tryb prowadzącego z odpowiedziami: `…/LC/?prowadzacy#zajecia=1.1`
(nie jest zabezpieczony – odpowiedzi może zobaczyć każdy, kto zna adres).

Opis modelu i uproszczeń znajduje się w sekcji „Model i założenia” na stronie.
Wyniki są orientacyjne – narzędzie służy do nauki zależności, nie do przewidywania konkretnej metody.

# Symulator HPLC

Interaktywny symulator dydaktyczny chromatografii cieczowej w odwróconym układzie faz.
Jeden plik `index.html` bez zależności – wystarczy otworzyć go w przeglądarce (działa offline).

## Co pokazuje
- **Retencja** z modelu LSS (`log k = log k_w − S·φ`), elucja izokratyczna i gradientowa
  (czas opóźnienia wynikający z objętości V_D, migracja pasm liczona numerycznie).
- **Sprawność** z zredukowanego równania van Deemtera (cząstki porowate / core-shell)
  i wpływ dyspersji pozakolumnowej σ_V.
- **Wyniki**: t₀, N, t_R, k (k_e w gradiencie), α, w½, N_obs, R_s z oznaczeniem pary krytycznej,
  pojemność pików w gradiencie, ciśnienie (prawo Darcy'ego, lepkość woda–ACN/MeOH), czas analizy, zużycie fazy.
- **Animacja** pasm w kolumnie zsynchronizowana z chromatogramem, krzywa van Deemtera z punktem pracy.
- Gotowe scenariusze dydaktyczne, link z zapisanymi ustawieniami, eksport chromatogramu do PNG.

Założenia i uproszczenia modelu są opisane w sekcji „Model i założenia” na stronie.
Wyniki są orientacyjne – narzędzie służy do nauki zależności, nie do przewidywania konkretnej metody.

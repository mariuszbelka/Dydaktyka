// ----- Zmienne globalne -----
let anality = [];             // kolekcja analitów (kulki)
let zdarzeniaWyjscia = [];      // zapamiętane momenty wyjścia analitów
let substancje = [];          // definicje substancji (analitów) z ich współczynnikami retencji
let czasSymulacji = 0;        // czas symulacji (w klatkach)

// Obszar kolumny (faza stacjonarna)
let kolumnaLewo, kolumnaPrawo, kolumnaGora, kolumnaDol;

// Obszar chromatogramu (dolna część)
let chromGora, chromWysokosc;

// Parametry symulacji
let predkoscPodstawowa = 2;   // przepływ fazy ruchomej (ml/min, używany jako piksele/klatkę)
let czasCalkowity = 1200;     // zakres osi czasu chromatogramu (w klatkach), przeliczany w inicjujSymulacje()
const amplituda = 50;         // bazowa amplituda pików

// Parametr dyspersji – im większa wartość, tym większy losowy rozrzut (w pikselach na klatkę)
let wspolczynnikDyspersji = 0.5;

// Pola edytowalne (HTML)
let polePrzeplywu, poleRetencji0, poleRetencji1, poleRetencji2;
let poleStezenia0, poleStezenia1, poleStezenia2;
let poleDyspersji;
let przyciskAktualizacji;
let komunikatBledu;
let etykietaPrzeplywu, etykietaRetencji0, etykietaRetencji1, etykietaRetencji2;
let etykietaStezenia0, etykietaStezenia1, etykietaStezenia2;
let etykietaDyspersji;

function setup() {
  createCanvas(800, 600);
  
  // Ustawienia obszaru kolumny
  kolumnaLewo  = 50;
  kolumnaPrawo = width - 50;
  kolumnaGora  = 50;
  kolumnaDol   = 300;
  
  // Ustawienia obszaru chromatogramu
  chromGora      = 350;
  chromWysokosc  = height - 400;
  
  // Definicja substancji z domyślnymi współczynnikami retencji i kolorami
  // Im wyższy k, tym analit porusza się wolniej (predkosc = predkoscPodstawowa/(1+k))
  substancje = [
    { id: 0, k: 0.5, c: 1, kolor: color(255, 0, 0) },   // czerwona
    { id: 1, k: 1.0, c: 1, kolor: color(0, 200, 0) },     // zielona
    { id: 2, k: 2.0, c: 1, kolor: color(0, 0, 255) }      // niebieska
  ];
  
  // Tworzenie pól edytowalnych i etykiet (umieszczone pod canvasem)
  etykietaPrzeplywu = createP("Przepływ fazy ruchomej (ml/min):");
  etykietaPrzeplywu.position(20, height + 10);
  polePrzeplywu = createInput("2");
  polePrzeplywu.position(20, height + 40);
  
  etykietaRetencji0 = createP("Współczynnik retencji dla analitu 1 (czerwony):");
  etykietaRetencji0.position(20, height + 70);
  poleRetencji0 = createInput("0.5");
  poleRetencji0.position(20, height + 100);
  
  etykietaRetencji1 = createP("Współczynnik retencji dla analitu 2 (zielony):");
  etykietaRetencji1.position(20, height + 130);
  poleRetencji1 = createInput("1.0");
  poleRetencji1.position(20, height + 160);
  
  etykietaRetencji2 = createP("Współczynnik retencji dla analitu 3 (niebieski):");
  etykietaRetencji2.position(20, height + 190);
  poleRetencji2 = createInput("2.0");
  poleRetencji2.position(20, height + 220);
  
  etykietaStezenia0 = createP("Stężenie substancji 1 (czerwony):");
  etykietaStezenia0.position(20, height + 250);
  poleStezenia0 = createInput("1");
  poleStezenia0.position(20, height + 280);
  
  etykietaStezenia1 = createP("Stężenie substancji 2 (zielony):");
  etykietaStezenia1.position(20, height + 310);
  poleStezenia1 = createInput("1");
  poleStezenia1.position(20, height + 340);
  
  etykietaStezenia2 = createP("Stężenie substancji 3 (niebieski):");
  etykietaStezenia2.position(20, height + 370);
  poleStezenia2 = createInput("1");
  poleStezenia2.position(20, height + 400);
  
  etykietaDyspersji = createP("Współczynnik dyspersji:");
  etykietaDyspersji.position(20, height + 430);
  poleDyspersji = createInput("0.5");
  poleDyspersji.position(20, height + 460);
  
  przyciskAktualizacji = createButton("Aktualizuj parametry i zresetuj symulację");
  przyciskAktualizacji.position(20, height + 490);
  przyciskAktualizacji.mousePressed(aktualizujParametry);
  
  komunikatBledu = createP("");
  komunikatBledu.position(20, height + 520);
  komunikatBledu.style("color", "#c00000");
  
  inicjujSymulacje();
}

function inicjujSymulacje() {
  czasSymulacji = 0;
  anality = [];
  zdarzeniaWyjscia = [];
  
  // Zakres osi czasu dopasowany do najwolniejszego analitu (z zapasem 30% na dyspersję),
  // żeby piki nie wypadały poza chromatogram przy małym przepływie lub dużym k
  let kMax = max(substancje.map(s => s.k));
  let czasNajwolniejszego = (kolumnaPrawo - kolumnaLewo) / (predkoscPodstawowa / (1 + kMax));
  czasCalkowity = max(1200, ceil(1.3 * czasNajwolniejszego));
  
  // Dla każdej substancji generujemy osobno anality zgodnie z ustalonym stężeniem.
  // Bazowa liczba kulek dla danej substancji wynosi 30, mnożona przez wartość stężenia.
  for (let i = 0; i < substancje.length; i++) {
    let liczbaAnalitow = round(30 * substancje[i].c);
    for (let j = 0; j < liczbaAnalitow; j++) {
      let analit = {
        typ: substancje[i].id,
        k: substancje[i].k,
        kolor: substancje[i].kolor,
        x: kolumnaLewo,  // start przy lewej krawędzi kolumny
        y: random(kolumnaGora, kolumnaDol),
        // Efektywna prędkość zależna od retencji
        predkosc: predkoscPodstawowa / (1 + substancje[i].k),
        wyszedl: false,
        czasWyjscia: null
      };
      anality.push(analit);
    }
  }
}

// Odczytuje liczbę z pola; zwraca null (i podświetla pole), gdy wartość jest nieprawidłowa
function czytajLiczbe(pole, min, maks, minWlacznie) {
  let tekst = pole.value().trim().replace(",", ".");
  let wartosc = Number(tekst);
  let poprawna = tekst !== "" && isFinite(wartosc) && wartosc <= maks &&
                 (minWlacznie ? wartosc >= min : wartosc > min);
  pole.style("background-color", poprawna ? "" : "#ffd0d0");
  return poprawna ? wartosc : null;
}

function aktualizujParametry() {
  // Wszystkie parametry (także stężenia) są przyjmowane dopiero po kliknięciu przycisku
  let przeplyw  = czytajLiczbe(polePrzeplywu, 0, 50, false);
  let k0        = czytajLiczbe(poleRetencji0, 0, 50, true);
  let k1        = czytajLiczbe(poleRetencji1, 0, 50, true);
  let k2        = czytajLiczbe(poleRetencji2, 0, 50, true);
  let c0        = czytajLiczbe(poleStezenia0, 0, 20, true);
  let c1        = czytajLiczbe(poleStezenia1, 0, 20, true);
  let c2        = czytajLiczbe(poleStezenia2, 0, 20, true);
  let dyspersja = czytajLiczbe(poleDyspersji, 0, 10, true);
  
  if ([przeplyw, k0, k1, k2, c0, c1, c2, dyspersja].includes(null)) {
    komunikatBledu.html("Nieprawidłowe wartości w zaznaczonych polach: przepływ 0–50 (> 0), " +
                        "k 0–50, stężenie 0–20, dyspersja 0–10. Symulacja nie została zresetowana.");
    return;
  }
  komunikatBledu.html("");
  
  predkoscPodstawowa = przeplyw;
  substancje[0].k = k0;
  substancje[1].k = k1;
  substancje[2].k = k2;
  substancje[0].c = c0;
  substancje[1].c = c1;
  substancje[2].c = c2;
  wspolczynnikDyspersji = dyspersja;
  
  inicjujSymulacje();
  loop(); // Wznów pętlę rysującą, jeśli została zatrzymana
}

function draw() {
  background(240);
  czasSymulacji++;
  // Przy dużej dyspersji część kulek może wyjść później niż zakładał zapas – rozszerz oś czasu
  if (czasSymulacji > czasCalkowity) {
    czasCalkowity = ceil(1.2 * czasSymulacji);
  }
  
  // --- Aktualizacja położenia analitów z efektem dyspersji ---
  for (let analit of anality) {
    if (!analit.wyszedl) {
      // Dodajemy do deterministycznego przesunięcia losowy składnik z rozkładu normalnego
      let przyrostX = analit.predkosc + randomGaussian(0, wspolczynnikDyspersji);
      analit.x += przyrostX;
      // Zapewnij, że analit nie cofnie się poza lewą krawędź
      analit.x = max(analit.x, kolumnaLewo);
      if (analit.x > kolumnaPrawo) {
        analit.wyszedl = true;
        analit.czasWyjscia = czasSymulacji;
        zdarzeniaWyjscia.push({ czas: czasSymulacji, typ: analit.typ });
      }
    }
  }
  
  // --- Rysowanie kolumny (fazy stacjonarnej) ---
  fill(220);
  stroke(0);
  rect(kolumnaLewo, kolumnaGora, kolumnaPrawo - kolumnaLewo, kolumnaDol - kolumnaGora);
  
  // --- Rysowanie analitów jako kolorowych kulek ---
  noStroke();
  for (let analit of anality) {
    fill(analit.kolor);
    ellipse(analit.x, analit.y, 10, 10);
  }
  
  // --- Rysowanie tła chromatogramu ---
  fill(255);
  stroke(0);
  rect(kolumnaLewo, chromGora, kolumnaPrawo - kolumnaLewo, chromWysokosc);
  
  // --- Przygotowanie danych do rysowania chromatogramu ---
  let sigmaCzas = 10; // odchylenie standardowe w klatkach
  let daneChromatogramu = [];  // dane dla każdej substancji
  let globalMax = 0;           // globalna maksymalna intensywność (dla skalowania)
  
  // Dla każdej substancji obliczamy intensywność w kolejnych punktach na osi x.
  // Stężenie jest już odzwierciedlone w liczbie kulek, więc każda kulka wnosi tę samą
  // amplitudę – sygnał jest liniowy względem stężenia.
  for (let subst of substancje) {
    let punkty = [];
    
    for (let x = kolumnaLewo; x <= kolumnaPrawo; x += 2) {
      // Mapuj pozycję x na czas symulacji (w klatkach)
      let t = map(x, kolumnaLewo, kolumnaPrawo, 0, czasCalkowity);
      let intensywnosc = 0;
      // Sumuj wkład z każdego zdarzenia wyjścia dla danej substancji
      for (let zdarzenie of zdarzeniaWyjscia) {
        if (zdarzenie.typ === subst.id) {
          intensywnosc += amplituda * exp(-sq(t - zdarzenie.czas) / (2 * sq(sigmaCzas)));
        }
      }
      if (intensywnosc > globalMax) {
        globalMax = intensywnosc;
      }
      punkty.push({ x: x, intensywnosc: intensywnosc });
    }
    daneChromatogramu.push({ substancja: subst, punkty: punkty });
  }
  
  // Oblicz wspólczynnik skalowania, aby najwyższy szczyt mieścił się w polu chromatogramu
  let wspolczynnikSkali = 1;
  if (globalMax > chromWysokosc) {
    wspolczynnikSkali = chromWysokosc / globalMax;
  }
  
  // --- Rysowanie krzywych chromatogramu ---
  for (let d of daneChromatogramu) {
    stroke(d.substancja.kolor);
    noFill();
    beginShape();
    for (let pt of d.punkty) {
      let y = chromGora + chromWysokosc - pt.intensywnosc * wspolczynnikSkali;
      vertex(pt.x, y);
    }
    endShape();
  }
  
  // --- Rysowanie osi chromatogramu ---
  stroke(0);
  // Oś X (czas retencji [s])
  line(kolumnaLewo, chromGora + chromWysokosc, kolumnaPrawo, chromGora + chromWysokosc);
  let liczbaTickowX = 5;
  textSize(10);
  for (let i = 0; i <= liczbaTickowX; i++) {
    let xTick = map(i, 0, liczbaTickowX, kolumnaLewo, kolumnaPrawo);
    line(xTick, chromGora + chromWysokosc, xTick, chromGora + chromWysokosc + 5);
    // Oblicz czas retencji w sekundach (przyjmując 60 klatek/s)
    let czasSekundy = map(xTick, kolumnaLewo, kolumnaPrawo, 0, czasCalkowity/60);
    text(nf(czasSekundy, 1, 1), xTick - 10, chromGora + chromWysokosc + 20);
  }
  // Podpis osi X
  textSize(12);
  text("czas retencji [s]", (kolumnaLewo + kolumnaPrawo) / 2 - 40, chromGora + chromWysokosc + 40);
  
  // Oś Y (sygnał [a.u.])
  line(kolumnaLewo, chromGora, kolumnaLewo, chromGora + chromWysokosc);
  let liczbaTickowY = 5;
  for (let i = 0; i <= liczbaTickowY; i++) {
    let yTick = map(i, 0, liczbaTickowY, chromGora + chromWysokosc, chromGora);
    line(kolumnaLewo - 5, yTick, kolumnaLewo, yTick);
    let sygnal = nf(map(i, 0, liczbaTickowY, 0, globalMax * wspolczynnikSkali), 1, 1);
    text(sygnal, kolumnaLewo - 30, yTick + 3);
  }
  // Podpis osi Y (obrócony)
  push();
  translate(kolumnaLewo - 50, chromGora + chromWysokosc/2);
  rotate(-HALF_PI);
  text("sygnał [a.u.]", 0, 0);
  pop();
  
  // --- Wyświetlenie czasu symulacji ---
  fill(0);
  noStroke();
  textSize(14);
  text("Czas symulacji: " + czasSymulacji, 10, height - 10);
  
  // --- Zakończenie symulacji, gdy wszystkie kulki dotrą do końca kolumny ---
  let wszyscyWyszli = anality.every(a => a.wyszedl);
  if (wszyscyWyszli) {
    noLoop();
    fill(0);
    textSize(16);
    text("Symulacja zakończona", width/2 - 70, 30);
  }
}

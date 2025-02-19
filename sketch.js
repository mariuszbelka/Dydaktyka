// ----- Zmienne globalne -----
let anality = [];             // kolekcja analitów (kulki)
let zdarzeniaWyjscia = [];      // zapamiêtane momenty wyjœcia analitów
let substancje = [];          // definicje substancji (analitów) z ich wspó³czynnikami retencji
let czasSymulacji = 0;        // czas symulacji (w klatkach)

// Obszar kolumny (faza stacjonarna)
let kolumnaLewo, kolumnaPrawo, kolumnaGora, kolumnaDol;

// Obszar chromatogramu (dolna czêœæ)
let chromGora, chromWysokosc;

// Parametry symulacji
let predkoscPodstawowa = 2;   // przep³yw fazy ruchomej (ml/min, u¿ywany jako piksele/klatkê)
let czasCalkowity = 1200;     // zakres czasu symulacji (w klatkach) dla mapowania chromatogramu
const amplituda = 50;         // bazowa amplituda pików

// Parametr dyspersji – im wiêksza wartoœæ, tym wiêkszy losowy rozrzut (w pikselach na klatkê)
let wspolczynnikDyspersji = 0.5;

// Pola edytowalne (HTML)
let polePrzeplywu, poleRetencji0, poleRetencji1, poleRetencji2;
let poleStezenia0, poleStezenia1, poleStezenia2;
let poleDyspersji;
let przyciskAktualizacji;
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
  
  // Definicja substancji z domyœlnymi wspó³czynnikami retencji i kolorami
  // Im wy¿szy k, tym analit porusza siê wolniej (predkosc = predkoscPodstawowa/(1+k))
  substancje = [
    { id: 0, k: 0.5, kolor: color(255, 0, 0) },   // czerwona
    { id: 1, k: 1.0, kolor: color(0, 200, 0) },     // zielona
    { id: 2, k: 2.0, kolor: color(0, 0, 255) }      // niebieska
  ];
  
  // Tworzenie pól edytowalnych i etykiet (umieszczone pod canvasem)
  etykietaPrzeplywu = createP("Przep³yw fazy ruchomej (ml/min):");
  etykietaPrzeplywu.position(20, height + 10);
  polePrzeplywu = createInput("2");
  polePrzeplywu.position(20, height + 40);
  
  etykietaRetencji0 = createP("Wspó³czynnik retencji dla analitu 1 (czerwony):");
  etykietaRetencji0.position(20, height + 70);
  poleRetencji0 = createInput("0.5");
  poleRetencji0.position(20, height + 100);
  
  etykietaRetencji1 = createP("Wspó³czynnik retencji dla analitu 2 (zielony):");
  etykietaRetencji1.position(20, height + 130);
  poleRetencji1 = createInput("1.0");
  poleRetencji1.position(20, height + 160);
  
  etykietaRetencji2 = createP("Wspó³czynnik retencji dla analitu 3 (niebieski):");
  etykietaRetencji2.position(20, height + 190);
  poleRetencji2 = createInput("2.0");
  poleRetencji2.position(20, height + 220);
  
  etykietaStezenia0 = createP("Stê¿enie substancji 1 (czerwony):");
  etykietaStezenia0.position(20, height + 250);
  poleStezenia0 = createInput("1");
  poleStezenia0.position(20, height + 280);
  
  etykietaStezenia1 = createP("Stê¿enie substancji 2 (zielony):");
  etykietaStezenia1.position(20, height + 310);
  poleStezenia1 = createInput("1");
  poleStezenia1.position(20, height + 340);
  
  etykietaStezenia2 = createP("Stê¿enie substancji 3 (niebieski):");
  etykietaStezenia2.position(20, height + 370);
  poleStezenia2 = createInput("1");
  poleStezenia2.position(20, height + 400);
  
  etykietaDyspersji = createP("Wspó³czynnik dyspersji:");
  etykietaDyspersji.position(20, height + 430);
  poleDyspersji = createInput("0.5");
  poleDyspersji.position(20, height + 460);
  
  przyciskAktualizacji = createButton("Aktualizuj parametry i zresetuj symulacjê");
  przyciskAktualizacji.position(20, height + 490);
  przyciskAktualizacji.mousePressed(aktualizujParametry);
  
  inicjujSymulacje();
}

function inicjujSymulacje() {
  czasSymulacji = 0;
  anality = [];
  zdarzeniaWyjscia = [];
  
  // Dla ka¿dej substancji generujemy osobno anality zgodnie z ustalonym stê¿eniem.
  // Bazowa liczba kulek dla danej substancji wynosi 30, mno¿ona przez wartoœæ stê¿enia.
  for (let i = 0; i < substancje.length; i++) {
    let stZ;
    if (substancje[i].id === 0) {
      stZ = parseFloat(poleStezenia0.value());
    } else if (substancje[i].id === 1) {
      stZ = parseFloat(poleStezenia1.value());
    } else if (substancje[i].id === 2) {
      stZ = parseFloat(poleStezenia2.value());
    }
    let liczbaAnalitow = round(30 * stZ);
    for (let j = 0; j < liczbaAnalitow; j++) {
      let analit = {
        typ: substancje[i].id,
        k: substancje[i].k,
        kolor: substancje[i].kolor,
        x: kolumnaLewo,  // start przy lewej krawêdzi kolumny
        y: random(kolumnaGora, kolumnaDol),
        // Efektywna prêdkoœæ zale¿na od retencji
        predkosc: predkoscPodstawowa / (1 + substancje[i].k),
        wyszedl: false,
        czasWyjscia: null
      };
      anality.push(analit);
    }
  }
}

function aktualizujParametry() {
  // Aktualizuj przep³yw, wspó³czynniki retencji oraz wspó³czynnik dyspersji na podstawie pól
  predkoscPodstawowa = parseFloat(polePrzeplywu.value());
  substancje[0].k = parseFloat(poleRetencji0.value());
  substancje[1].k = parseFloat(poleRetencji1.value());
  substancje[2].k = parseFloat(poleRetencji2.value());
  wspolczynnikDyspersji = parseFloat(poleDyspersji.value());
  
  inicjujSymulacje();
  loop(); // Wznów pêtlê rysuj¹c¹, jeœli zosta³a zatrzymana
}

function draw() {
  background(240);
  czasSymulacji++;
  
  // --- Aktualizacja po³o¿enia analitów z efektem dyspersji ---
  for (let analit of anality) {
    if (!analit.wyszedl) {
      // Dodajemy do deterministycznego przesuniêcia losowy sk³adnik z rozk³adu normalnego
      let przyrostX = analit.predkosc + randomGaussian(0, wspolczynnikDyspersji);
      analit.x += przyrostX;
      // Zapewnij, ¿e analit nie cofnie siê poza lew¹ krawêdŸ
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
  
  // --- Rysowanie t³a chromatogramu ---
  fill(255);
  stroke(0);
  rect(kolumnaLewo, chromGora, kolumnaPrawo - kolumnaLewo, chromWysokosc);
  
  // --- Przygotowanie danych do rysowania chromatogramu ---
  let sigmaCzas = 10; // odchylenie standardowe w klatkach
  let daneChromatogramu = [];  // dane dla ka¿dej substancji
  let globalMax = 0;           // globalna maksymalna intensywnoœæ (dla skalowania)
  
  // Dla ka¿dej substancji obliczamy intensywnoœæ w kolejnych punktach na osi x
  for (let subst of substancje) {
    let punkty = [];
    // Ustal stê¿enie odpowiednie dla danej substancji
    let stZ = 1;
    if (subst.id === 0) {
      stZ = parseFloat(poleStezenia0.value());
    } else if (subst.id === 1) {
      stZ = parseFloat(poleStezenia1.value());
    } else if (subst.id === 2) {
      stZ = parseFloat(poleStezenia2.value());
    }
    let amplitudaUzyta = amplituda * stZ;
    
    for (let x = kolumnaLewo; x <= kolumnaPrawo; x += 2) {
      // Mapuj pozycjê x na czas symulacji (w klatkach)
      let t = map(x, kolumnaLewo, kolumnaPrawo, 0, czasCalkowity);
      let intensywnosc = 0;
      // Sumuj wk³ad z ka¿dego zdarzenia wyjœcia dla danej substancji
      for (let zdarzenie of zdarzeniaWyjscia) {
        if (zdarzenie.typ === subst.id) {
          intensywnosc += amplitudaUzyta * exp(-sq(t - zdarzenie.czas) / (2 * sq(sigmaCzas)));
        }
      }
      if (intensywnosc > globalMax) {
        globalMax = intensywnosc;
      }
      punkty.push({ x: x, intensywnosc: intensywnosc });
    }
    daneChromatogramu.push({ substancja: subst, punkty: punkty });
  }
  
  // Oblicz wspólczynnik skalowania, aby najwy¿szy szczyt mieœci³ siê w polu chromatogramu
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
  // Oœ X (czas retencji [s])
  line(kolumnaLewo, chromGora + chromWysokosc, kolumnaPrawo, chromGora + chromWysokosc);
  let liczbaTickowX = 5;
  textSize(10);
  for (let i = 0; i <= liczbaTickowX; i++) {
    let xTick = map(i, 0, liczbaTickowX, kolumnaLewo, kolumnaPrawo);
    line(xTick, chromGora + chromWysokosc, xTick, chromGora + chromWysokosc + 5);
    // Oblicz czas retencji w sekundach (przyjmuj¹c 60 klatek/s)
    let czasSekundy = map(xTick, kolumnaLewo, kolumnaPrawo, 0, czasCalkowity/60);
    text(nf(czasSekundy, 1, 1), xTick - 10, chromGora + chromWysokosc + 20);
  }
  // Podpis osi X
  textSize(12);
  text("czas retencji [s]", (kolumnaLewo + kolumnaPrawo) / 2 - 40, chromGora + chromWysokosc + 40);
  
  // Oœ Y (sygna³ [a.u.])
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
  text("sygna³ [a.u.]", 0, 0);
  pop();
  
  // --- Wyœwietlenie czasu symulacji ---
  fill(0);
  noStroke();
  textSize(14);
  text("Czas symulacji: " + czasSymulacji, 10, height - 10);
  
  // --- Zakoñczenie symulacji, gdy wszystkie kulki dotr¹ do koñca kolumny ---
  let wszyscyWyszli = anality.every(a => a.wyszedl);
  if (wszyscyWyszli) {
    noLoop();
    fill(0);
    textSize(16);
    text("Symulacja zakoñczona", width/2 - 70, 30);
  }
}

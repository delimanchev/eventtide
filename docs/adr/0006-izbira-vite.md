# ADR-0006 – Izbira Vite za razvoj frontenda

- Status: sprejeto
- Datum: 2026-11-04

## Kontekst in problem

Za React frontend potrebujem razvojni strežnik in orodje za pripravo produkcijske različice. Backend bo ločena aplikacija Express, zato frontend ne potrebuje lastnega strežniškega ogrodja.

## Dejavniki odločitve

- Preprosta priprava React projekta.
- Hiter prikaz sprememb med razvojem.
- Možnost izdelave datotek za produkcijsko gostovanje.
- Skladnost z ločenim backendom.

## Obravnavane alternative

- Vite.
- Ročna nastavitev Webpacka.
- Next.js.

## Sprejeta odločitev in utemeljitev

Izbral sem Vite, ker omogoča preprosto pripravo React projekta ter razvojni strežnik s sprotnim prikazom sprememb. Omogoča tudi izdelavo produkcijskih datotek.

Ročna nastavitev Webpacka bi zahtevala več konfiguracije. Next.js vključuje dodatne možnosti strežniškega izvajanja, ki jih pri načrtovani ločitvi React frontenda in Express backenda trenutno ne potrebujem.

## Posledice

### Pozitivne

- Hitreje lahko pripravim razvojno okolje.
- Spremembe komponent se hitro prikažejo v brskalniku.
- Produkcijsko različico lahko izdelam z ukazom za gradnjo.

### Negativne

- Usmerjanje med stranmi in pridobivanje podatkov moram urediti posebej.
- Pri gostovanju moram nastaviti pravilno obravnavo poti aplikacije.
- Vrednosti, vključene v frontend, so dostopne uporabniku, zato vanje ne smem vključiti skrivnosti.
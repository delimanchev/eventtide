# ADR-0001 – Ločitev frontenda in backenda ter komunikacija REST/JSON

- Status: sprejeto
- Datum: 2026-11-04

## Kontekst in problem

EventTide potrebuje uporabniški vmesnik ter poslovno logiko za prijave, čakalni seznam in preverjanje pravic. Določiti moram, kako bosta ta dela organizirana in kako bosta komunicirala.

## Dejavniki odločitve

- Pregledna razdelitev odgovornosti.
- Preverjanje pravic in pravil prijavljanja na strežniku.
- Možnost ločenega razvoja vmesnika in poslovne logike.

## Obravnavane alternative

- Enotna aplikacija s strežniškim izrisovanjem strani.
- Ločena frontend in backend s komunikacijo REST/JSON.
- Ločena frontend in backend s komunikacijo GraphQL.

## Sprejeta odločitev in utemeljitev

Izbral sem ločena frontend in backend, ki komunicirata prek REST API-ja v obliki JSON.

Frontend bo prikazoval podatke in obrazce, backend pa bo preverjal pravice, izvajal poslovna pravila in dostopal do baze. REST zadostuje za predvidene operacije nad dogodki in prijavami ter je za ta obseg preprostejši od GraphQL.

## Posledice

### Pozitivne

- Vmesnik in poslovna logika imata jasno ločene odgovornosti.
- Backend lahko preverjam neodvisno od uporabniškega vmesnika.
- Isti API lahko pozneje uporablja tudi drug odjemalec.

### Negativne

- Lokalno moram zaganjati frontend in backend.
- Usklajevati moram obliko zahtev, odgovorov in napak.
- Pri različnih izvorih moram ustrezno nastaviti CORS in pošiljanje sejnih piškotkov.
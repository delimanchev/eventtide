# ADR-0003 – Izbira Node.js in Expressa za backend

- Status: sprejeto
- Datum: 2026-11-04

## Kontekst in problem

EventTide potrebuje backend za obdelavo zahtev, preverjanje uporabniških pravic in izvajanje pravil prijavljanja. Backend mora zagotavljati REST API in dostopati do PostgreSQL.

## Dejavniki odločitve

- Uporaba JavaScripta na frontendu in backendu.
- Preprosta izdelava REST API-ja.
- Podpora za PostgreSQL, strežniške seje in preverjanje zahtev.

## Obravnavane alternative

- Node.js in Express.
- Python in FastAPI.
- C# in ASP.NET Core.

## Sprejeta odločitev in utemeljitev

Izbral sem Node.js in Express, ker lahko uporabljam JavaScript na obeh delih aplikacije in zmanjšam preklapljanje med programskimi jeziki.

Express omogoča določanje API-poti ter uporabo vmesnih funkcij za preverjanje sej, vlog in vhodnih podatkov. Za predvideni obseg EventTide zadostuje, hkrati pa omogoča povezavo s PostgreSQL.

## Posledice

### Pozitivne

- Frontend in backend uporabljata isti programski jezik.
- API lahko razdelim na poti za uporabnike, dogodke in prijave.
- Skupna preverjanja lahko izvajam z vmesnimi funkcijami.

### Negativne

- Express ne predpisuje strukture projekta, zato jo moram določiti sam.
- Validacijo, seje in dostop do baze moram urediti z dodatnimi knjižnicami.
- Sam moram poskrbeti za dosledno obravnavo napak in preverjanje pravic.
# ADR-0007 – Izbira Docker Compose za lokalno podatkovno bazo

- Status: sprejeto
- Datum: 2026-11-04

## Kontekst in problem

EventTide za lokalni razvoj potrebuje PostgreSQL. Razvojno okolje mora biti preprosto pripraviti tudi na drugem računalniku, podatki pa se morajo ohraniti po odstranitvi vsebnika.

## Dejavniki odločitve

- Ponovljiva priprava podatkovne baze.
- Ločitev baze od drugih projektov.
- Preprost zagon in ustavitev.
- Trajno shranjevanje razvojnih podatkov.

## Obravnavane alternative

- Lokalna namestitev PostgreSQL.
- PostgreSQL v vsebniku z Docker Compose.
- Oddaljena podatkovna baza v oblaku.

## Sprejeta odločitev in utemeljitev

Izbral sem Docker Compose, ker lahko različico PostgreSQL, vrata in nastavitve določim v skupni konfiguracijski datoteki. Bazo bom lahko zagnal z ukazom `docker compose up -d`.

Podatke bom shranjeval v imenovani Docker volume, občutljive nastavitve pa v datoteki `.env`, ki ne bo vključena v Git. Frontend in backend bom za zdaj zaganjal neposredno z Node.js.

Lokalna namestitev bi zahtevala več ročne priprave na vsakem računalniku, oddaljena baza pa bi bila odvisna od omrežne povezave.

## Posledice

### Pozitivne

- Enaka konfiguracija baze je uporabna na različnih računalnikih.
- PostgreSQL ne potrebuje neposredne namestitve v operacijski sistem.
- Podatki v imenovanem volumnu ostanejo po odstranitvi vsebnika.

### Negativne

- Nameščen in zagnan mora biti Docker.
- Vsebniki porabljajo dodatne sistemske vire.
- Brisanje volumna odstrani podatke, zato moram z njim ravnati previdno.
- Volume ne nadomešča varnostne kopije.
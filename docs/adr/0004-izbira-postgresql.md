# ADR-0004 – Izbira PostgreSQL za podatkovno bazo

- Status: sprejeto
- Datum: 2026-11-04

## Kontekst in problem

EventTide shranjuje uporabnike, kategorije, dogodke in prijave, ki so med seboj povezani. Pri sočasnih prijavah mora sistem preprečiti prekoračitev kapacitete dogodka.

## Dejavniki odločitve

- S PostgreSQL imam že izkušnje.
- Podatki imajo jasno določene povezave.
- Potrebujem omejitve enoličnosti in podporo za transakcije.
- Potrjevanje prijav mora pravilno delovati tudi pri sočasnih zahtevah.

## Obravnavane alternative

- PostgreSQL.
- MySQL.
- MongoDB.

## Sprejeta odločitev in utemeljitev

Izbral sem PostgreSQL, ker imam z njim že izkušnje in ustreza relacijskemu modelu EventTide. Tuji ključi bodo zagotavljali veljavne povezave, enolične omejitve pa preprečevale podvojene uporabniške e-poštne naslove in prijave.

Prijave in premike s čakalnega seznama bom izvajal v transakcijah z zaklepanjem zapisa dogodka. Backend bo znotraj transakcije preveril kapaciteto in šele nato potrdil prijavo. MySQL bi bil prav tako primeren, vendar PostgreSQL izbiram zaradi obstoječega znanja. MongoDB za ta povezani podatkovni model ne prinaša jasne prednosti.

## Posledice

### Pozitivne

- Podatkovna baza podpira povezave in omejitve iz podatkovnega modela.
- Transakcije omogočajo skupno potrditev ali razveljavitev povezanih sprememb.
- Obstoječe izkušnje mi olajšajo razvoj in odpravljanje napak.

### Negativne

- Spremembe strukture baze moram upravljati z migracijami.
- Zagotoviti moram delovanje baze in varnostne kopije.
- Pravilno moram izvesti transakcije in zaklepanje; sama izbira baze ne prepreči prekoračitve kapacitete.
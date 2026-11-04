# EventTide

EventTide je spletna aplikacija za organizacijo dogodkov in upravljanje prijav udeležencev. Omogočala bo objavo dogodkov, prijave z omejenim številom mest, čakalni seznam in evidentiranje prisotnosti.

Projekt je trenutno v fazi načrtovanja. Implementacija aplikacije še ni pripravljena.

## Uporabniške vloge

- **Udeleženec:** pregleduje dogodke, se prijavlja in upravlja svoje prijave.
- **Organizator:** ustvarja dogodke, spremlja prijave in evidentira prisotnost.
- **Administrator:** upravlja uporabniške račune, dodeljuje vloge in umika neprimerne dogodke.

## Glavne funkcionalnosti

- Objava, iskanje in filtriranje dogodkov.
- Prijave z upoštevanjem kapacitete.
- Čakalni seznam s samodejnim zapolnjevanjem sproščenih mest.
- Pregled in odpoved lastnih prijav.
- Pregled prijavljenih in evidentiranje prisotnosti.
- Administratorsko upravljanje uporabnikov in dogodkov.

Med poznejšimi nadgradnjami so zasebni dogodki s kodo povabila ali QR-povezavo.

## Predvidene tehnologije

- **Frontend:** React, CSS in Vite.
- **Backend:** Node.js in Express.
- **Podatkovna baza:** PostgreSQL.
- **Avtentikacija:** strežniške seje in bcrypt.
- **Lokalno okolje:** Docker Compose za podatkovno bazo.
- **Upravljanje različic:** Git in GitHub.

## Dokumentacija

1. [Zasnova rešitve](docs/01-zasnova-resitve.md)
2. [Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
3. [Podatkovni model](docs/03-podatkovni-model.md)
4. [Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
5. [Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
6. [Wireframe-i](docs/06-wireframes.md)
7. [Arhitekturne odločitve – ADR](docs/adr/)

## Struktura repozitorija

- `frontend/` – prostor za uporabniški vmesnik.
- `backend/` – prostor za REST API in poslovno logiko.
- `docs/` – projektna dokumentacija.
- `docs/wireframes/` – slike skic uporabniškega vmesnika.
- `docs/adr/` – zapisi arhitekturnih odločitev.

## Lokalna priprava

Repozitorij kloniramo in odpremo njegovo mapo:

```bash
git clone https://github.com/delimanchev/eventtide.git
cd eventtide
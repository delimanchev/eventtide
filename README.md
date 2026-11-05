# EventTide

EventTide je spletna aplikacija za organizacijo dogodkov in upravljanje prijav udeležencev. Omogočala bo objavo dogodkov, prijave z omejenim številom mest, čakalni seznam in evidentiranje prisotnosti.

Pripravljeno je osnovno razvojno okolje: React frontend, Express backend in povezava s PostgreSQL. Poslovne funkcionalnosti MVP so še v razvoju.

## Uporabniške vloge

- **Udeleženec:** pregleduje dogodke, se prijavlja in upravlja svoje prijave.
- **Organizator:** ustvarja dogodke, spremlja prijave in evidentira prisotnost.
- **Administrator:** upravlja uporabniške račune, dodeljuje vloge in umika neprimerne dogodke.

## Načrtovane funkcionalnosti MVP

- Objava, iskanje in filtriranje dogodkov.
- Prijave z upoštevanjem kapacitete.
- Čakalni seznam s samodejnim zapolnjevanjem sproščenih mest.
- Pregled in odpoved lastnih prijav.
- Pregled prijavljenih in evidentiranje prisotnosti.
- Administratorsko upravljanje uporabnikov in dogodkov.
- Osnovna registracija, prijava in preverjanje uporabniških pravic.

Med poznejšimi nadgradnjami so zasebni dogodki s kodo povabila ali QR-povezavo.

## Tehnologije

- **Frontend:** React, CSS in Vite.
- **Backend:** Node.js in Express.
- **Podatkovna baza:** PostgreSQL.
- **Dostop do baze:** knjižnica pg.
- **Avtentikacija – načrtovano:** strežniške seje in bcrypt.
- **Lokalno okolje:** Docker Compose za podatkovno bazo.
- **Preverjanje kode:** ESLint.
- **Upravljanje različic:** Git in GitHub.
- **Spremljanje razvoja:** GitHub Projects in Issues.

## Dokumentacija

1. [Zasnova rešitve](docs/01-zasnova-resitve.md)
2. [Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
3. [Podatkovni model](docs/03-podatkovni-model.md)
4. [Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
5. [Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
6. [Wireframe-i](docs/06-wireframes.md)
7. [Arhitekturne odločitve – ADR](docs/adr/)

## Struktura repozitorija

- `frontend/` – React uporabniški vmesnik.
- `backend/` – Express REST API in povezava z bazo.
- `compose.yaml` – konfiguracija lokalne podatkovne baze.
- `.env.example` – primer nastavitev podatkovne baze.
- `backend/.env.example` – primer nastavitev backenda.
- `docs/` – projektna dokumentacija.
- `docs/wireframes/` – slike skic uporabniškega vmesnika.
- `docs/adr/` – zapisi arhitekturnih odločitev.

## Lokalni zagon

### Zahteve

- Node.js 24 in npm.
- Docker Desktop z Docker Compose.
- Git.

Docker Desktop mora biti zagnan.

### 1. Kloniranje repozitorija

```bash
git clone https://github.com/delimanchev/eventtide.git
cd eventtide
```

### 2. Nastavitev okolja

Ob prvi pripravi kopiramo vzorčni konfiguraciji:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

V glavni datoteki `.env` določimo ime baze, uporabnika in geslo. V `backend/.env` nastavimo povezavo z isto bazo.

Vrednost `POSTGRES_PASSWORD` v glavni datoteki se mora ujemati z `DB_PASSWORD` v backendu. Ujemati se morata tudi ime baze in uporabnik.

Datoteki `.env` sta izključeni iz Gita. V repozitoriju hranimo samo vzorčni datoteki `.env.example` brez dejanskih skrivnosti.

### 3. Namestitev odvisnosti

Iz glavne mape projekta:

```bash
npm install --prefix frontend
npm install --prefix backend
```

### 4. Zagon podatkovne baze

Iz glavne mape projekta:

```bash
docker compose up -d --wait
```

PostgreSQL je na računalniku dosegljiv na naslovu `127.0.0.1:5433`. Znotraj vsebnika uporablja vrata `5432`.

Podatki se shranjujejo v imenovani Docker volume `postgres_data`. Docker Compose imenu volumna običajno doda predpono projekta.

Stanje preverimo z:

```bash
docker compose ps
```

### 5. Zagon backenda

V ločenem terminalu iz glavne mape:

```bash
cd backend
npm run dev
```

Backend je privzeto dosegljiv na:

http://localhost:3001

### 6. Zagon frontenda

V drugem terminalu iz glavne mape:

```bash
cd frontend
npm run dev
```

Frontend je privzeto dosegljiv na:

http://localhost:5173

Uporabimo naslov, ki ga izpiše Vite. Če uporablja druga vrata, ustrezno prilagodimo `FRONTEND_URL` v `backend/.env` in ponovno zaženemo backend.

## Preverjanje delovanja

### Povezava z bazo

```bash
curl -i http://localhost:3001/api/health
```

Pri dosegljivi bazi pričakujemo HTTP 200:

```json
{"status":"ok","database":"connected"}
```

Za preverjanje nedosegljive baze iz glavne mape izvedemo:

```bash
docker compose stop database
curl -i http://localhost:3001/api/health
```

Pričakujemo HTTP 503:

```json
{"status":"error","database":"unavailable"}
```

Bazo nato ponovno zaženemo:

```bash
docker compose up -d --wait
curl -i http://localhost:3001/api/health
```

Odgovor mora ponovno vrniti HTTP 200.

### Preverjanje frontenda

Iz glavne mape:

```bash
npm run lint --prefix frontend
npm run build --prefix frontend
```

Prvi ukaz preveri kodo z ESLint, drugi pa pripravi produkcijsko različico frontenda.

## Ustavitev aplikacije

Frontend in backend ustavimo s `Ctrl + C` v njunih terminalih.

Podatkovno bazo ustavimo iz glavne mape:

```bash
docker compose stop
```

Ponovno jo zaženemo z:

```bash
docker compose up -d --wait
```

Podatki se pri ustavitvi ohranijo v volumnu. Ukaz `docker compose down -v` odstrani tudi volume in podatke.

## Razvojni proces

Uporabljamo GitHub Flow:

1. Posodobimo lokalno vejo `main`.
2. Za nalogo ustvarimo razvojno vejo.
3. Spremembe shranjujemo s smiselnimi commiti.
4. Razvojno vejo pošljemo na GitHub.
5. Odpremo pull request v `main`.
6. V PR opišemo spremembe, preverjanje in povezane Issues.
7. Po preverjanju spremembe združimo in lokalno posodobimo `main`.

Primer povezave v opisu PR:

```text
Closes #2
```

Vejo `main` ščiti obvezen pull request brez zahtevanih odobritev. Force push in brisanje sta prepovedana, pravila pa veljajo tudi za administratorja.

Razvoj spremljamo na tabli **EventTide – MVP** s stolpci:

- **To Do:** načrtovane naloge.
- **Doing:** naloge v izvajanju.
- **Done:** zaključene in preverjene naloge.

Vsak razvojni Issue vsebuje opis naloge in oznako povezane uporabniške zgodbe. Implementirane funkcionalnosti preverjamo glede na sprejemne kriterije v dokumentaciji.

## Trenutno stanje

Pripravljeno:

- Projektna dokumentacija in wireframe-i.
- Predloga in osem arhitekturnih odločitev.
- Osnovni React frontend z Vite.
- Osnovni Express backend.
- PostgreSQL prek Docker Compose z imenovanim volumnom.
- Pot `/api/health` za preverjanje povezave z bazo.
- Vzorčne okoljske nastavitve.
- GitHub Project za spremljanje razvoja.

Naslednji koraki:

- Priprava tabel in začetnih podatkov.
- Registracija, prijava in uporabniške vloge.
- Objava in iskanje dogodkov.
- Prijave, odpovedi in čakalni seznam.
- Evidentiranje prisotnosti in administratorske funkcije.

## Avtor

Andrej Delimanchev  
GitHub: [delimanchev](https://github.com/delimanchev)
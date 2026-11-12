# EventTide

EventTide je spletna aplikacija za organizacijo dogodkov in upravljanje prijav udeležencev. Omogoča objavo dogodkov, prijave z omejenim številom mest, čakalni seznam in evidentiranje prisotnosti.

## Uporabniške vloge

- **Udeleženec:** pregleduje dogodke, se prijavlja in upravlja svoje prijave.
- **Organizator:** ustvarja in objavlja dogodke, spremlja prijave in evidentira prisotnost.
- **Administrator:** upravlja uporabniške račune, dodeljuje vlogo organizatorja in umika neprimerne dogodke iz javne objave.

## Funkcionalnosti MVP

- Objava, iskanje in filtriranje javnih dogodkov.
- Prijave z upoštevanjem kapacitete.
- Čakalni seznam s samodejnim zapolnjevanjem sproščenih mest.
- Pregled in odpoved lastnih prijav.
- Pregled prijavljenih in evidentiranje prisotnosti.
- Administratorsko upravljanje uporabnikov in moderiranje dogodkov.
- Registracija, prijava in preverjanje uporabniških pravic.

Zasebni dogodki s kodo povabila ali QR-povezavo so predvideni za poznejšo nadgradnjo.

## Tehnologije

- **Frontend:** React, CSS in Vite.
- **Backend:** Node.js in Express.
- **Podatkovna baza:** PostgreSQL.
- **Dostop do baze:** knjižnica `pg`.
- **Avtentikacija:** strežniške seje v PostgreSQL in zgoščevanje gesel z bcrypt.
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

Pred zagonom baze odpri Docker Desktop.

### 1. Kloniranje repozitorija

```bash
git clone https://github.com/delimanchev/eventtide.git
cd eventtide
```

### 2. Nastavitev okolja

Ob prvi pripravi iz glavne mape projekta kopiramo vzorčni konfiguraciji:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

V glavni datoteki `.env` nastavimo `POSTGRES_DB`, `POSTGRES_USER` in `POSTGRES_PASSWORD`. V `backend/.env` nastavimo enake vrednosti v `DB_NAME`, `DB_USER` in `DB_PASSWORD`.

Za podpisovanje sejnih piškotkov ustvarimo naključno skrivnost:

```bash
node -e 'console.log(require("node:crypto").randomBytes(32).toString("hex"))'
```

Izpisano vrednost vpišemo v `backend/.env` za `SESSION_SECRET=`. Če vrstica že obstaja, zamenjamo njeno vrednost.

Če želimo ustvariti začetnega administratorja, v `backend/.env` nastavimo še veljaven `ADMIN_EMAIL` in svoje `ADMIN_PASSWORD`. Geslo mora imeti najmanj 12 znakov in največ 72 bajtov UTF-8.

Obe datoteki `.env` sta izključeni iz Gita. V repozitorij dodajamo samo vzorčni datoteki `.env.example` brez dejanskih gesel in skrivnosti.

### 3. Namestitev odvisnosti

Iz glavne mape projekta:

```bash
npm ci --prefix backend
npm ci --prefix frontend
```

### 4. Zagon podatkovne baze

```bash
docker compose up -d --wait database
```

PostgreSQL je na računalniku dosegljiv na naslovu `127.0.0.1:5433`. Znotraj vsebnika uporablja vrata `5432`. Podatki se shranjujejo v imenovanem Docker volumnu `postgres_data`. Docker Compose imenu volumna običajno doda predpono projekta.

Stanje preverimo z:

```bash
docker compose ps
```

### 5. Migracije in začetni administrator

Ko PostgreSQL deluje, iz glavne mape projekta zaženemo:

```bash
npm run db:migrate --prefix backend
```

Ukaz ustvari podatkovne tabele in tabelo za uporabniške seje ter doda začetne kategorije: Izobraževanje, Šport in Umetnost. Ponovni zagon preskoči že izvedene migracije.

Če smo nastavili `ADMIN_EMAIL` in `ADMIN_PASSWORD`, po migracijah ustvarimo začetnega administratorja:

```bash
npm run admin:create --prefix backend
```

Administrator se prijavi prek istega obrazca kot drugi uporabniki. Nove račune, ki jih ustvarimo prek registracijskega obrazca, aplikacija privzeto registrira kot udeležence.

### 6. Zagon backenda

V ločenem terminalu iz glavne mape projekta:

```bash
npm run dev --prefix backend
```

Backend je privzeto dosegljiv na [http://localhost:3001](http://localhost:3001).

### 7. Zagon frontenda

V drugem terminalu iz glavne mape projekta:

```bash
npm run dev --prefix frontend
```

Frontend je privzeto dosegljiv na [http://localhost:5173](http://localhost:5173).

Uporabimo naslov, ki ga izpiše Vite. Če uporablja druga vrata, ustrezno prilagodimo `FRONTEND_URL` v `backend/.env` in ponovno zaženemo backend. Na sveži bazi je javni seznam prazen, dokler organizator ne objavi prvega prihodnjega javnega dogodka.

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
docker compose up -d --wait database
curl -i http://localhost:3001/api/health
```

Odgovor mora ponovno vrniti HTTP 200.

### Preverjanje frontenda

```bash
npm run lint --prefix frontend
npm run build --prefix frontend
```

Prvi ukaz preveri kodo z ESLint, drugi pa pripravi produkcijsko različico frontenda.

### Funkcionalni preizkus MVP

1. Organizator objavi prihodnji javni dogodek s kapaciteto enega mesta. Obiskovalec ga brez prijave najde prek iskanja in odpre podrobnosti.
2. Prvi udeleženec dobi potrjeno prijavo, drugi pa se uvrsti na čakalni seznam.
3. Prvi udeleženec odpove prijavo. Drugi v razdelku **Moje prijave** po osvežitvi vidi status **Potrjena**.
4. Organizator označi drugega udeleženca kot prisotnega in preveri, da je oznaka po osvežitvi še vedno shranjena.
5. Administrator umakne dogodek iz objave. Po osvežitvi ga ni več na javnem seznamu, javne podrobnosti pa niso več dostopne.

Po objavi ali umiku dogodka osvežimo stran, da vidimo najnovejši javni seznam.

## Ustavitev aplikacije

Frontend in backend ustavimo s `Ctrl+C` v njunih terminalih.

Podatkovno bazo ustavimo iz glavne mape:

```bash
docker compose stop
```

Ponovno jo zaženemo z:

```bash
docker compose up -d --wait database
```

Podatki se pri ustavitvi ohranijo v volumnu. Ukaz `docker compose down -v` odstrani tudi volumen in podatke.

## Razvojni proces

Uporabljamo GitHub Flow:

1. Posodobimo lokalno vejo `main`.
2. Za nalogo ustvarimo razvojno vejo.
3. Spremembe shranjujemo s smiselnimi commiti.
4. Razvojno vejo pošljemo na GitHub.
5. Odpremo pull request v `main`.
6. V PR opišemo spremembe, preverjanje in povezane naloge.
7. Po preverjanju spremembe združimo in lokalno posodobimo `main`.

Primer povezave v opisu PR:

```text
Closes #2
```

Vejo `main` ščiti obvezen pull request brez zahtevanih odobritev. Force push in brisanje sta prepovedana, pravila pa veljajo tudi za administratorja.

Razvoj spremljamo na tabli **EventTide – MVP** s stolpci **To Do**, **Doing** in **Done**. Implementirane funkcionalnosti preverjamo glede na sprejemne kriterije v dokumentaciji.

## Trenutno stanje

Funkcionalnosti MVP so implementirane. Preverjen je bil celoten potek od objave dogodka do prijave, čakalnega seznama, odpovedi, evidentiranja prisotnosti in umika iz objave. Preverjena sta bila tudi lokalni zagon iz svežega klona z ločeno bazo in prijava novega administratorja.

## Avtor

Andrej Delimanchev  
GitHub: [delimanchev](https://github.com/delimanchev)
# ADR-0005 – Avtentikacija s strežniškimi sejami in bcrypt

- Status: sprejeto
- Datum: 2026-11-04

## Kontekst in problem

EventTide potrebuje prijavo uporabnikov in omejevanje dostopa glede na vlogo. Gesel ne smem shranjevati v berljivi obliki, uporabnikovo prijavo pa moram ohraniti med zahtevami.

## Dejavniki odločitve

- Varno shranjevanje gesel.
- Možnost preklica seje ob odjavi.
- Preverjanje uporabnikove vloge in aktivnosti računa na backendu.
- Primernost za spletno aplikacijo z enim backendom.

## Obravnavane alternative

- Strežniške seje in bcrypt.
- Žetoni JWT in bcrypt.
- Zunanja storitev za avtentikacijo.

## Sprejeta odločitev in utemeljitev

Izbral sem strežniške seje, ker omogočajo neposredno upravljanje in preklic prijave na strežniku. Brskalnik bo v piškotku HttpOnly hranil samo identifikator seje. Podatki sej bodo shranjeni na strežniku v PostgreSQL.

Gesla bom zgoščeval z bcrypt, ki uporablja sol in nastavljivo računsko zahtevnost. Pri preverjanju gesla bom uporabil funkcijo knjižnice za primerjavo z zgoščeno vrednostjo.

Backend bo pri zaščitenih zahtevah preveril sejo, aktivnost računa, trenutno vlogo in po potrebi lastništvo podatkov. JWT za predvideni obseg ne prinaša potrebne prednosti, zunanja storitev pa bi dodala odvisnost od ponudnika.

## Posledice

### Pozitivne

- Ob odjavi lahko sejo razveljavim na strežniku.
- Gesla niso shranjena v berljivi obliki.
- Spremembe vloge ali deaktivacija računa se upoštevajo pri naslednji zaščiteni zahtevi.

### Negativne

- Upravljati moram shranjevanje, potek veljavnosti in čiščenje sej.
- Pravilno moram nastaviti piškotke, v produkciji tudi Secure in ustrezen SameSite.
- Zahteve, ki spreminjajo podatke, moram zaščititi pred CSRF.
- Računsko zahtevnost bcrypt moram prilagoditi strežniku.
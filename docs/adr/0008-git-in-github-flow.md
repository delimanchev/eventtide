# ADR-0008 – Uporaba Gita in GitHub Flow

- Status: sprejeto
- Datum: 2026-11-04

## Kontekst in problem

Pri razvoju EventTide potrebujem zgodovino sprememb in jasen postopek vključevanja novega dela v glavno vejo. Naloga zahteva uporabo GitHub Flow in zaščito veje main.

## Dejavniki odločitve

- Sledenje spremembam in možnost vrnitve na prejšnje različice.
- Pregled sprememb pred združevanjem.
- Preprost postopek za samostojni razvoj.
- Izpolnjevanje zahtev naloge.

## Obravnavane alternative

- Neposredno shranjevanje sprememb v main.
- GitHub Flow s kratkotrajnimi razvojnimi vejami.
- Git Flow z dodatnimi vejami za razvoj in izdaje.

## Sprejeta odločitev in utemeljitev

Izbral sem Git za upravljanje različic in GitHub za oddaljeni repozitorij. Razvoj bo potekal po GitHub Flow: za posamezno spremembo ustvarim razvojno vejo, pripravim commite in odprem pull request v main.

GitHub Flow ustreza obsegu projekta in zahteva manj upravljanja vej kot Git Flow. Pull request omogoča pregled razlik pred združitvijo.

Vejo main bom zaščitil z obveznim pull requestom brez zahtevanih odobritev. Force push in brisanje veje bosta prepovedana, pravila pa bodo veljala tudi za administratorja repozitorija.

## Posledice

### Pozitivne

- Spremembe imajo sledljivo zgodovino.
- Razvoj posamezne funkcionalnosti poteka ločeno od glavne veje.
- Pull request prikaže spremembe pred združitvijo.
- Zaščita main preprečuje neposredne spremembe mimo dogovorjenega postopka.

### Negativne

- Tudi manjše spremembe zahtevajo razvojno vejo in pull request.
- Razvojne veje moram sproti usklajevati z main.
- Morebitne konflikte moram razrešiti pred združitvijo.
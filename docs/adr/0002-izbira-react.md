# ADR-0002 – Izbira Reacta za uporabniški vmesnik

- Status: sprejeto
- Datum: 2026-11-04

## Kontekst in problem

EventTide potrebuje interaktiven vmesnik za iskanje dogodkov, prijavljanje in upravljanje prisotnosti. Izbrati moram tehnologijo, s katero bom te zaslone izdelal in vzdrževal.

## Dejavniki odločitve

- Z Reactom imam že izkušnje.
- Več zaslonov uporablja podobne obrazce in kartice dogodkov.
- Podatke želim posodabljati brez ponovnega nalaganja celotne strani.

## Obravnavane alternative

- HTML, CSS in JavaScript brez ogrodja.
- React.
- Vue.

## Sprejeta odločitev in utemeljitev

Izbral sem React, ker imam z njim že izkušnje in lahko hitreje začnem razvoj. Omogoča izdelavo ponovno uporabnih komponent, kot so kartice dogodkov, filtri in obrazci.

Z upravljanjem stanja lahko po prijavi ali odpovedi posodobim prikazane podatke brez ponovnega nalaganja celotne strani. Vue bi omogočal podobno rešitev, vendar bi zahteval dodatno učenje.

## Posledice

### Pozitivne

- Uporabim lahko obstoječe znanje.
- Skupne komponente zmanjšajo podvajanje kode.
- Vmesnik lahko sproti posodablja rezultate iskanja in statuse prijav.

### Negativne

- React doda odvisnosti in zahteva vzdrževanje paketov.
- Poskrbeti moram za stanje podatkov ter prikaz nalaganja in napak.
- V primerjavi s preprosto statično stranjo je začetna priprava zahtevnejša.
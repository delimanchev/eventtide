# EventTide – funkcionalnosti in obseg

## Uporabniške vloge

### Udeleženec
Pregleduje dogodke, se prijavlja nanje, spremlja svoje prijave in jih odpoveduje. Ne more objavljati dogodkov ali dostopati do prijav drugih uporabnikov.

### Organizator
Ustvarja in ureja svoje dogodke, določa število mest, pregleduje prijave ter evidentira prisotnost. Ne more upravljati uporabnikov ali dogodkov drugih organizatorjev.

### Administrator
Upravlja uporabniške račune, dodeljuje vlogo organizatorja in umika neprimerne dogodke. Ne more ustvarjati prijav v imenu udeležencev ali spreminjati vrstnega reda čakalnega seznama.

## Predvidene funkcionalnosti

1. **Objava dogodka [MVP]** – Organizator določi naslov, opis, kategorijo, lokacijo, čas, rok za prijavo in največje število udeležencev.
2. **Iskanje dogodkov [MVP]** – Uporabnik išče dogodke po naslovu in jih filtrira po kategoriji ali datumu.
3. **Prijava na dogodek [MVP]** – Sistem do roka za prijavo potrjuje prijave glede na prosta mesta in preprečuje podvojene prijave.
4. **Čakalni seznam [MVP]** – Ob zapolnitvi dogodka sistem uporabnika uvrsti na čakalni seznam. Če se pred iztekom prijav sprosti mesto, potrdi prvega čakajočega.
5. **Upravljanje lastnih prijav [MVP]** – Udeleženec vidi status svojih prijav in jih lahko odpove pred začetkom dogodka.
6. **Evidentiranje prisotnosti [MVP]** – Organizator pregleda prijave na svoj dogodek in ob izvedbi označi prisotnost potrjenih udeležencev.
7. **Administratorsko upravljanje [MVP]** – Administrator upravlja račune, dodeljuje vlogo organizatorja in umika neprimerne dogodke.
8. **Odpoved dogodka** – Organizator odpove dogodek, prijavljeni uporabniki pa v aplikaciji vidijo razlog odpovedi.
9. **Ocenjevanje dogodka** – Po koncu dogodka lahko prisotni udeleženci oddajo oceno in komentar.
10. **Priljubljeni dogodki** – Uporabnik shrani zanimive dogodke za poznejši ogled.
11. **Izvoz udeležencev** – Organizator izvozi seznam udeležencev svojega dogodka v datoteko CSV.
12. **Statistika dogodkov** – Organizator spremlja zasedenost, število prijav, odpovedi in prisotnih udeležencev.
13. **Zasebni dogodki s povabilom** – Organizator ustvari zaseben dogodek, do katerega uporabniki dostopajo prek kode ali QR-povezave. Dogodek ni viden v javnem seznamu, prijave pa upoštevajo obstoječa pravila kapacitete in čakalnega seznama.

## Prva delujoča različica – MVP

MVP vključuje sedem zgoraj označenih funkcionalnosti ter osnovno registracijo, prijavo in preverjanje uporabniških pravic.

Domensko specifične funkcionalnosti so predvsem prijava z omejitvijo mest, samodejno upravljanje čakalnega seznama in evidentiranje prisotnosti. Glavni proces je objava dogodka, prijava udeleženca, morebitna uvrstitev na čakalni seznam in evidentiranje udeležbe.

## Kasnejše nadgradnje

1. E-poštna obvestila in opomniki.
2. QR-vstopnice za evidentiranje prisotnosti.
3. PDF-potrdila o udeležbi.
4. Ponavljajoči se dogodki.
5. Dodajanje dogodkov v osebni koledar.

## Izven obsega

- Prodaja vstopnic in spletna plačila.
- Videokonference in prenosi dogodkov v živo.
- Rezervacija oštevilčenih sedežev.
- Samostojna mobilna aplikacija.

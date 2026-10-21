# EventTide – uporabniške zgodbe

Zgodbe izhajajo iz funkcionalnosti v dokumentu 02-funkcionalnosti-in-obseg.md. MVP označuje prvo delujočo različico.

## US-01 – Objava dogodka [MVP]

**Povezana funkcionalnost:** 1. Objava dogodka  
**Vloga:** Organizator

Kot organizator želim ustvariti in objaviti dogodek, da se lahko uporabniki nanj prijavijo.

### Sprejemni kriteriji
- Organizator vnese naslov, opis, kategorijo, lokacijo, začetek, konec, rok za prijavo in kapaciteto.
- Sistem zavrne objavo, če manjka obvezen podatek ali kapaciteta ni pozitivno celo število.
- Konec mora biti poznejši od začetka, rok za prijavo pa ne sme biti po začetku dogodka.
- Objavljen dogodek je viden na javnem seznamu prihajajočih dogodkov.

## US-02 – Iskanje in filtriranje dogodkov [MVP]

**Povezana funkcionalnost:** 2. Iskanje dogodkov  
**Vloga:** Udeleženec

Kot udeleženec želim iskati in filtrirati dogodke, da najdem dogodke, ki me zanimajo.

### Sprejemni kriteriji
- Iskanje vrne objavljene prihajajoče dogodke, katerih naslov vsebuje vneseno besedilo, ne glede na velikost črk.
- Uporabnik lahko rezultate omeji s kategorijo in datumom začetka dogodka.
- Pri vsakem rezultatu so prikazani naslov, datum, lokacija in število prostih mest.
- Če ni zadetkov, sistem prikaže sporočilo »Ni najdenih dogodkov«.

## US-03 – Prijava na dogodek [MVP]

**Povezana funkcionalnost:** 3. Prijava na dogodek  
**Vloga:** Udeleženec

Kot udeleženec želim rezervirati prosto mesto na dogodku, da se ga lahko udeležim.

### Sprejemni kriteriji
- Prijava je dovoljena samo prijavljenemu uporabniku na objavljen dogodek pred iztekom roka za prijavo.
- Če je mesto prosto, prijava dobi status »potrjena«.
- Sistem prepreči drugo aktivno prijavo istega uporabnika na isti dogodek.
- Tudi pri sočasnih prijavah število potrjenih prijav ne preseže kapacitete.

## US-04 – Uvrstitev na čakalni seznam [MVP]

**Povezana funkcionalnost:** 4. Čakalni seznam  
**Vloga:** Udeleženec

Kot udeleženec želim biti uvrščen na čakalni seznam polnega dogodka, da lahko dobim mesto ob odpovedi.

### Sprejemni kriteriji
- Če je dogodek poln in so prijave še odprte, nova prijava dobi status »cakalna«.
- Uporabnik v pregledu svojih prijav vidi, da je na čakalnem seznamu.
- Vrstni red določa čas prijave; ob enakem času odloča id prijave.

## US-05 – Samodejna potrditev čakajočega [MVP]

**Povezana funkcionalnost:** 4. Čakalni seznam  
**Vloga:** Udeleženec

Kot udeleženec na čakalnem seznamu želim samodejno dobiti sproščeno mesto, da se mi ni treba ponovno prijavljati.

### Sprejemni kriteriji
- Ob odpovedi potrjene prijave pred iztekom roka sistem potrdi prvega čakajočega.
- Status izbranega uporabnika se spremeni iz »cakalna« v »potrjena«.
- Po izteku roka za prijavo ali pri odpovedanem oziroma umaknjenem dogodku ni premikov s čakalnega seznama.
- Samodejna potrditev ne povzroči prekoračitve kapacitete.

## US-06 – Pregled in odpoved lastnih prijav [MVP]

**Povezana funkcionalnost:** 5. Upravljanje lastnih prijav  
**Vloga:** Udeleženec

Kot udeleženec želim pregledovati in odpovedovati svoje prijave, da lahko upravljam svojo udeležbo.

### Sprejemni kriteriji
- Uporabnik vidi samo svoje prijave z naslovom dogodka, datumom in statusom.
- Pred začetkom dogodka lahko odpove potrjeno ali čakajočo prijavo.
- Odpovedana prijava dobi status »odpovedana« in ne zaseda mesta.
- Odpoved potrjene prijave pred iztekom roka sproži zapolnitev mesta po pravilih čakalnega seznama.

## US-07 – Pregled prijav in evidentiranje prisotnosti [MVP]

**Povezana funkcionalnost:** 6. Evidentiranje prisotnosti  
**Vloga:** Organizator

Kot organizator želim pregledati prijavljene in označiti prisotnost, da imam evidenco dejanske udeležbe.

### Sprejemni kriteriji
- Organizator vidi potrjene udeležence in čakalni seznam samo za svoje dogodke.
- Od začetka dogodka dalje lahko potrjenega udeleženca označi kot prisotnega ali odsotnega.
- Prisotnosti ni mogoče evidentirati pri čakajoči ali odpovedani prijavi.
- Shranjena prisotnost ostane vidna po ponovnem odprtju seznama.

## US-08 – Upravljanje uporabniških računov [MVP]

**Povezana funkcionalnost:** 7. Administratorsko upravljanje  
**Vloga:** Administrator

Kot administrator želim upravljati račune in vloge, da nadzorujem dostop do aplikacije.

### Sprejemni kriteriji
- Administrator lahko pregleduje uporabniške račune in njihove vloge.
- Udeležencu lahko dodeli vlogo organizatorja oziroma organizatorju vrne vlogo udeleženca.
- Administrator lahko deaktivira račun; deaktiviran uporabnik ne more dostopati do zaščitenih funkcij.
- Udeleženec in organizator nimata dostopa do upravljanja računov.

## US-09 – Umik neprimernega dogodka [MVP]

**Povezana funkcionalnost:** 7. Administratorsko upravljanje  
**Vloga:** Administrator

Kot administrator želim umakniti neprimeren dogodek, da preprečim prikaz neustrezne vsebine.

### Sprejemni kriteriji
- Administrator mora ob umiku objavljenega dogodka vnesti razlog.
- Dogodek dobi status »umaknjen« in izgine z javnega seznama.
- Umaknjen dogodek ne sprejema novih prijav in ne izvaja premikov s čakalnega seznama.
- Obstoječi prijavljeni uporabniki v svojih prijavah vidijo stanje dogodka in razlog umika.

## US-10 – Odpoved dogodka [Pozneje]

**Povezana funkcionalnost:** 8. Odpoved dogodka  
**Vloga:** Organizator

Kot organizator želim odpovedati svoj dogodek, da prijavljeni uporabniki vedo, da ne bo izveden.

### Sprejemni kriteriji
- Organizator lahko odpove samo svoj objavljen dogodek in mora vnesti razlog.
- Dogodek dobi status »odpovedan« in ni več prikazan med razpoložljivimi dogodki.
- Sistem ustavi nove prijave in premike s čakalnega seznama.
- Prijavljeni uporabniki v svojih prijavah vidijo odpoved in njen razlog.

## US-11 – Oddaja ocene dogodka [Pozneje]

**Povezana funkcionalnost:** 9. Ocenjevanje dogodka  
**Vloga:** Udeleženec

Kot udeleženec želim oceniti obiskani dogodek, da organizatorju posredujem povratno informacijo.

### Sprejemni kriteriji
- Oceno lahko odda samo uporabnik z evidentirano prisotnostjo po koncu dogodka.
- Ocena mora biti celo število od 1 do 5, komentar pa je neobvezen.
- Uporabnik lahko za isti dogodek odda samo eno oceno.
- Uporabnik ne more oddati ocene v imenu druge osebe.

## US-12 – Pregled povratnih informacij [Pozneje]

**Povezana funkcionalnost:** 9. Ocenjevanje dogodka  
**Vloga:** Organizator

Kot organizator želim pregledati ocene in komentarje, da lahko izboljšam prihodnje dogodke.

### Sprejemni kriteriji
- Organizator vidi ocene in komentarje samo za svoje dogodke.
- Sistem prikaže posamezne ocene, komentarje in povprečno oceno dogodka.
- Če ocen še ni, sistem prikaže sporočilo »Dogodek še nima ocen«.

## US-13 – Shranjevanje priljubljenih dogodkov [Pozneje]

**Povezana funkcionalnost:** 10. Priljubljeni dogodki  
**Vloga:** Udeleženec

Kot udeleženec želim shraniti zanimive dogodke, da jih pozneje lažje najdem.

### Sprejemni kriteriji
- Prijavljen uporabnik lahko objavljen dogodek doda med priljubljene.
- Isti dogodek je v uporabnikovem seznamu prikazan največ enkrat.
- Uporabnik lahko dogodek odstrani iz priljubljenih.
- Shranjevanje dogodka ne ustvari prijave in ne rezervira mesta.

## US-14 – Izvoz udeležencev [Pozneje]

**Povezana funkcionalnost:** 11. Izvoz udeležencev  
**Vloga:** Organizator

Kot organizator želim izvoziti seznam udeležencev, da ga lahko uporabim pri izvedbi dogodka.

### Sprejemni kriteriji
- Organizator lahko izvozi podatke samo za svoj dogodek.
- Izvoz ustvari datoteko CSV s potrjenimi udeleženci.
- Datoteka vsebuje ime, e-poštni naslov in stanje prisotnosti.
- Čakajoče in odpovedane prijave niso vključene v izvoz.

## US-15 – Pregled statistike dogodkov [Pozneje]

**Povezana funkcionalnost:** 12. Statistika dogodkov  
**Vloga:** Organizator

Kot organizator želim spremljati statistiko svojih dogodkov, da ocenim zanimanje in udeležbo.

### Sprejemni kriteriji
- Organizator vidi statistiko samo za svoje dogodke.
- Sistem za dogodek prikaže število potrjenih, čakajočih in odpovedanih prijav ter prisotnih udeležencev.
- Delež zasedenosti je izračunan kot število potrjenih prijav, deljeno s kapaciteto, pomnoženo s 100.
- Dogodek brez prijav prikazuje ničelne vrednosti in 0 % zasedenosti.

## US-16 – Ustvarjanje zasebnega dogodka [Pozneje]

**Povezana funkcionalnost:** 13. Zasebni dogodki s povabilom  
**Vloga:** Organizator

Kot organizator želim ustvariti zaseben dogodek s kodo in QR-povezavo, da lahko povabim izbrano skupino ljudi.

### Sprejemni kriteriji
- Organizator lahko ob ustvarjanju dogodka izbere javno ali zasebno vidnost.
- Sistem za zaseben dogodek ustvari enolično naključno kodo povabila.
- Organizator lahko kopira kodo in povezavo ter prenese QR-kodo s to povezavo.
- Zaseben dogodek ni prikazan v javnem seznamu ali rezultatih iskanja.
- Dostop do zasebnega dogodka je dovoljen njegovemu organizatorju, administratorju in prijavljenim uporabnikom z veljavno kodo povabila.

## US-17 – Dostop do zasebnega dogodka [Pozneje]

**Povezana funkcionalnost:** 13. Zasebni dogodki s povabilom  
**Vloga:** Udeleženec

Kot udeleženec želim vnesti kodo povabila ali skenirati QR-kodo, da lahko odprem zaseben dogodek in se nanj prijavim.

### Sprejemni kriteriji
- Uporabnik lahko vnese kodo povabila v obrazec »Pridruži se zasebnemu dogodku«.
- Skeniranje QR-kode s telefonom odpre povezavo do istega dogodka.
- Neprijavljen uporabnik se mora najprej prijaviti; po prijavi se ohrani povezava do povabljenega dogodka.
- Ob neveljavni kodi sistem prikaže sporočilo »Neveljavna koda povabila« in ne razkrije podrobnosti dogodka.
- Veljavna koda omogoči ogled dogodka; uporabnik prijavo potrdi posebej, pri čemer veljajo kapaciteta, rok za prijavo in čakalni seznam.

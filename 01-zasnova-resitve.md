# EventTide – zasnova rešitve

## Ime rešitve

EventTide – spletna aplikacija za organizacijo dogodkov in prijavo udeležencev.

## Namen rešitve in problem

EventTide omogoča organizacijo dogodkov in delavnic ter upravljanje prijav na enem mestu. Namenjen je organizatorjem, ki prijave trenutno zbirajo prek elektronske pošte, sporočil ali preglednic, zaradi česar težje spremljajo število prostih mest, odpovedi in prisotnost udeležencev.

Aplikacija bo omogočala objavo dogodkov, prijavo udeležencev, omejevanje števila prijav in upravljanje čakalnega seznama. S tem bo zmanjšala ročno delo organizatorjev in udeležencem omogočila jasen pregled nad njihovimi prijavami.

## Ciljni uporabniki

Ciljni uporabniki so študentska društva, izobraževalne organizacije in drugi organizatorji manjših dogodkov ter posamezniki, ki se želijo udeležiti njihovih delavnic, predavanj ali srečanj.

Sistem bodo uporabljale tri skupine uporabnikov:

- Udeleženci bodo iskali dogodke, pregledovali njihove podrobnosti ter upravljali lastne prijave.
- Organizatorji bodo objavljali dogodke, določali število mest, spremljali prijave in evidentirali prisotnost.
- Administratorji bodo upravljali uporabniške račune, dodeljevali vlogo organizatorja in nadzorovali objavljene dogodke.

## Kratek opis delovanja

Organizator ustvari in objavi dogodek, pri katerem določi naslov, opis, kategorijo, lokacijo, čas začetka in konca, rok za prijavo ter največje število udeležencev.

Obiskovalec lahko pregleduje objavljene dogodke in jih filtrira po kategoriji ali datumu. Za prijavo na dogodek se mora registrirati oziroma prijaviti v uporabniški račun.

Če je na dogodku še prosto mesto, sistem prijavo potrdi. Če so vsa mesta zasedena, uporabnika uvrsti na čakalni seznam glede na čas prijave. Posamezen uporabnik ima lahko za isti dogodek samo eno aktivno prijavo.

Udeleženec lahko svojo prijavo odpove pred začetkom dogodka. Če potrjeno prijavo odpove v času, ko so prijave še odprte, sistem sproščeno mesto samodejno dodeli prvemu uporabniku na čakalnem seznamu. Po izteku roka za prijavo novih prijav in premikov s čakalnega seznama ne izvaja več.

Organizator ima pregled nad potrjenimi prijavami in čakalnim seznamom za svoje dogodke. Ob izvedbi dogodka evidentira prisotnost potrjenih udeležencev.

## Primer uporabe

Študentsko društvo objavi delavnico fotografije z 20 prostimi mesti. Prvih 20 prijavljenih uporabnikov prejme potrjeno prijavo, naslednji pa se uvrstijo na čakalni seznam.

Pred iztekom roka za prijavo eden od potrjenih udeležencev odpove udeležbo. Sistem njegovo prijavo označi kot odpovedano in samodejno potrdi prijavo prvega čakajočega uporabnika. Organizator na dan delavnice odpre seznam potrjenih udeležencev in označi njihovo prisotnost.

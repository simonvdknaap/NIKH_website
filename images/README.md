# Foto's

Zet hier alle foto's neer. De **eerste letter** van de bestandsnaam bepaalt

in welk album de foto op de website komt:

| Eerste letter | Album     |
|---------------|-----------|
| `K`           | Koppen    |
| `P`           | Penningen |
| `B`           | Buste     |
| `L`           | Lichamen  |
| `H`           | Handen    |
| `O`           | Overig    |

Hoofd- of kleine letter maakt niet uit. Voorbeelden:

```
K_portret-oude-man.jpg   -> Koppen
P_penning-1987.jpg       -> Penningen
B-brons-vrouw.jpg        -> Buste
l_staande-figuur.jpg     -> Lichamen
H_gevouwen-handen.jpg    -> Handen
O_wandreliëf.jpg         -> Overig
```

- Foto's met een andere eerste letter worden overgeslagen; de build geeft
  dan een waarschuwing.
- De albumfoto (cover) is de eerste foto van het album. Wil je zelf kiezen,
  zet dan `feature` in de bestandsnaam, bijvoorbeeld `K_feature-portret.jpg`.
- Na een push naar `main` wordt de website automatisch opnieuw gepubliceerd.

## Meerdere foto's van één werk

Geef de foto's dezelfde naam met een volgnummer aan het eind (1 of 2 cijfers,
na `-` of `_`):

```
K_portret-oude-man-1.jpg   <- hoofdfoto
K_portret-oude-man-2.jpg
K_portret-oude-man-3.jpg
```

- Foto **1** is de hoofdfoto: alleen die verschijnt op de startpagina, in de
  categorieën, bij Werk en in de filters. Is er geen 1, dan het laagste nummer.
- Op de pagina van het werk staan alle foto's: de hoofdfoto groot, met kleine
  foto's eronder om te wisselen.
- Een foto zonder nummer is een werk met één foto. Let op: een naam die eindigt
  op `-` of `_` met 1 of 2 cijfers telt als volgnummer; een jaartal
  (`P_penning-1987.jpg`) niet.
- Het `.yaml`-bestand heeft de naam van het werk **zonder** nummer:
  `K_portret-oude-man.yaml`.

## Informatie over een werk

Elk werk krijgt een eigen pagina, die opent als je in een album op de foto
klikt. De informatie op die pagina komt uit een `.yaml`-bestand met de naam
van het werk (de bestandsnaam van de foto, zonder volgnummer):

```
K_portret-oude-man-1.jpg
K_portret-oude-man.yaml
```

Inhoud van het `.yaml`-bestand (alle velden zijn optioneel):

```yaml
titel: "Portret van een oude man"
jaar: 1987
techniek: "Gietwerk (verloren was)"
materiaal: "Brons"
afmetingen: "32 × 20 × 24 cm"
beschikbaar: true
uitgelicht: true
omslag: true
tags: ["Cleo", "Anneke"]
beschrijving: |
  Vrije tekst over het werk. Je kunt **vet** en *cursief* gebruiken,
  en meerdere regels.
```

- Velden die ontbreken worden niet getoond.
- `beschikbaar: true` betekent dat het werk te koop is. Op de pagina van het
  werk staat dan een pastelgroene stip rechtsboven op de foto, "beschikbaar"
  bij de titel en onder de informatie "Interesse in dit werk? Neem contact op"
  (met een link naar de Contact-pagina). In de overzichten is dat niet te zien.
  Weglaten (of `beschikbaar: false`) als het werk niet beschikbaar is. Het
  oudere `te_koop: true` werkt ook.
- `techniek` en `materiaal` worden ook filters, net als tags: bovenaan elke
  categorie- en overzichtspagina staat één rij knoppen met alle tags,
  technieken en materialen om op te filteren, en elke techniek en elk materiaal krijgt
  een eigen pagina, net als een tag. Alle categorieën, personen (tags),
  technieken en materialen staan onder **Werk** in het menu. Meerdere materialen schrijf je als lijst:
  `materiaal: ["Brons", "Hout"]` (in het formulier: gescheiden door
  komma's).
- `uitgelicht: true` zet dit werk in het grote uitgelichte blok op de
  startpagina. Het blok toont altijd een **persoon, techniek of materiaal**
  (nooit een categorie) en linkt naar die pagina: de persoon van het werk,
  anders de techniek, anders het materiaal. Wil je zelf kiezen, schrijf dan de
  naam: `uitgelicht: "Brons"`. Bij meer uitgelichte werken toont elk bezoek
  aan de startpagina het volgende (om de beurt). Zonder uitgelichte werken
  wisselt het tussen alle personen (of, als die er nog niet zijn, alle
  technieken en materialen).
- `omslag: true` kiest de foto van dit werk voor de tegels op de Werk-pagina
  (van zijn categorie, personen, techniek en materiaal) en voor de tegel van
  de categorie op de startpagina. Heeft een tegel meer gekozen werken, dan
  wisselt hij elke dag; zonder gekozen werken wisselt hij tussen alle werken.
- `tags` is een lijst van **personen** die het werk voorstelt (op de website
  heet dit *Personen*). Elke tag
  krijgt een eigen overzichtspagina met alle werken met die tag, uit alle
  categorieën (bijvoorbeeld `/tags/cleo/`; alle tags staan onder **Werk** in het
  menu). Op de pagina van een categorie kun je met knoppen boven de foto's
  filteren op tag. Schrijf een tag steeds op dezelfde manier: `Cleo` en
  `cleo` worden wel samengevoegd, maar `Clio` niet. Dat geldt ook voor
  technieken en materialen.
- Heeft een werk meer foto's, dan verschijnt bij aanwijzen met de muis de
  tweede foto (in de categorieën, bij de personen, technieken en materialen
  en op de Werk-pagina; niet op de startpagina).
- Zonder `titel` wordt de bestandsnaam de titel: `K_portret-oude-man.jpg`
  wordt "Portret oude man".
- Zonder `.yaml`-bestand krijgt de foto ook een pagina, alleen met de titel
  en de categorie.

## Invullen via de website

Je kunt de gegevens ook op de website zelf invullen:

1. Open de website één keer met `?beheer=1` achter het adres, bijvoorbeeld
   <https://simonvdknaap.github.io/NIKH_website/?beheer=1>. Deze browser
   onthoudt dat je in beheermodus bent (uitzetten: `?beheer=0`). Gewone
   bezoekers zien het formulier niet.
2. Open een werk waarvan nog niet alle gegevens bekend zijn: naast de foto
   staat een formulier met de bekende gegevens al ingevuld. Het formulier
   blijft staan tot alle velden zijn ingevuld (de vinkjes tellen niet mee).
3. Vul de velden aan en klik op **Versturen**. De gegevens gaan per e-mail
   naar het adres uit `hugo.toml` (`formulier_email`, via formsubmit.co), met
   het `.yaml`-bestand als bijlage. Heeft het werk nog geen `.yaml`-bestand,
   dan opent ook GitHub met dat bestand al ingevuld; klik daar op
   **Commit changes**.
4. Zet een gemailde bijlage in deze map (vervang het oude bestand); na een
   paar minuten staat de informatie op de website.

Bij een werk dat al gegevens heeft, staat in beheermodus ook een knop
**Gegevens bewerken op GitHub**.

Opslaan via GitHub kan alleen met een GitHub-account dat schrijfrechten heeft
op deze repository, in de branch uit `hugo.toml` (`github_branch`, standaard
`main`).

De verdeling en de pagina's worden gemaakt in `content/_content.gotmpl`;
de opmaak van de pagina staat in `layouts/_default/werk.html`.

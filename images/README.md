# Foto's

Zet hier alle foto's neer. De **eerste letter** van de bestandsnaam bepaalt
in welk album de foto op de website komt:

| Eerste letter | Album     |
|---------------|-----------|
| `K`           | Koppen    |
| `P`           | Penningen |
| `B`           | Buste     |
| `L`           | Lichamen  |

Hoofd- of kleine letter maakt niet uit. Voorbeelden:

```
K_portret-oude-man.jpg   -> Koppen
P_penning-1987.jpg       -> Penningen
B-brons-vrouw.jpg        -> Buste
l_staande-figuur.jpg     -> Lichamen
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
te_koop: true
tags: ["Moniek", "Anneke"]
beschrijving: |
  Vrije tekst over het werk. Je kunt **vet** en *cursief* gebruiken,
  en meerdere regels.
```

- Velden die ontbreken worden niet getoond.
- `te_koop: true` betekent dat het werk te koop is. Op de pagina van het werk
  staat dan een pastelgroene stip rechtsboven op de foto, "te koop" bij de
  titel en onder de informatie een oproep om contact op te nemen (met een link
  naar de Contact-pagina). In de overzichten is dat niet te zien. Weglaten (of
  `te_koop: false`) als het werk niet te koop is.
- `techniek` en `materiaal` worden ook filters, net als tags: bovenaan elke
  categorie- en overzichtspagina staat één rij knoppen met alle tags,
  technieken en materialen om op te filteren, en elke techniek en elk materiaal krijgt
  een eigen pagina, net als een tag. Alle categorieën, personen (tags),
  technieken en materialen staan onder **Werk** in het menu. Meerdere materialen schrijf je als lijst:
  `materiaal: ["Brons", "Hardsteen"]` (in het formulier: gescheiden door
  komma's).
- `tags` is een lijst van **personen** die het werk voorstelt (op de website
  heet dit *Personen*). Elke tag
  krijgt een eigen overzichtspagina met alle werken met die tag, uit alle
  categorieën (bijvoorbeeld `/tags/moniek/`; alle tags staan onder **Werk** in het
  menu). Op de pagina van een categorie kun je met knoppen boven de foto's
  filteren op tag. Schrijf een tag steeds op dezelfde manier: `Moniek` en
  `moniek` worden wel samengevoegd, maar `Monique` niet. Dat geldt ook voor
  technieken en materialen.
- Op de startpagina wordt elke dag een andere tag uitgelicht (het grote blok),
  met de foto van het eerste werk met die tag.
- Zonder `titel` wordt de bestandsnaam de titel: `K_portret-oude-man.jpg`
  wordt "Portret oude man".
- Zonder `.yaml`-bestand krijgt de foto ook een pagina, alleen met de titel
  en de categorie.

## Invullen via de website (voor de kunstenaar)

De gegevens kunnen ook op de website zelf worden ingevuld, zonder GitHub:

1. Open de website één keer met `?beheer=1` achter het adres:
   <https://simonvdknaap.github.io/NIKH_website/?beheer=1>. Deze browser
   onthoudt dat (uitzetten: `?beheer=0`). Gewone bezoekers zien het
   formulier niet.
2. Open een werk zonder gegevens: naast de foto staat een formulier.
3. Vul de velden in en klik op **Versturen**. De gegevens gaan per e-mail
   naar het adres in `hugo.toml` (`formulier_email`).

De e-mail bevat alle velden en het kant-en-klare `.yaml`-bestand als
**bijlage**, met de juiste naam (bijvoorbeeld `K_portret.yaml`). Zet die
bijlage in de map `images/` en de website wordt vanzelf bijgewerkt. (De inhoud
staat ook in het veld `yaml` in de e-mail, voor het geval de bijlage ontbreekt.)

Het versturen loopt via [FormSubmit](https://formsubmit.co). **De allereerste
keer** stuurt FormSubmit een bevestigingsmail naar het ontvangstadres: klik
daarin op *Activate Form*. Pas daarna komen de berichten binnen.

De verdeling en de pagina's worden gemaakt in `content/_content.gotmpl`;
de opmaak van de pagina staat in `layouts/_default/werk.html`.

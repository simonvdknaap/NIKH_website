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

## Informatie over een werk

Elke foto krijgt een eigen pagina, die opent als je in een album op de foto
klikt. De informatie op die pagina komt uit een `.yaml`-bestand met
**dezelfde naam** als de foto:

```
K_portret-oude-man.jpg
K_portret-oude-man.yaml
```

Inhoud van het `.yaml`-bestand (alle velden zijn optioneel):

```yaml
titel: "Portret van een oude man"
jaar: 1987
techniek: "Gietwerk (verloren was)"
materiaal: "Brons"
afmetingen: "32 × 20 × 24 cm"
tags: ["Moniek", "Anneke"]
beschrijving: |
  Vrije tekst over het werk. Je kunt **vet** en *cursief* gebruiken,
  en meerdere regels.
```

- Velden die ontbreken worden niet getoond.
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

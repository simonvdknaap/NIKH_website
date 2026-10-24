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
beschrijving: |
  Vrije tekst over het werk. Je kunt **vet** en *cursief* gebruiken,
  en meerdere regels.
```

- Velden die ontbreken worden niet getoond.
- Zonder `titel` wordt de bestandsnaam de titel: `K_portret-oude-man.jpg`
  wordt "Portret oude man".
- Zonder `.yaml`-bestand krijgt de foto ook een pagina, alleen met de titel
  en de categorie.

De verdeling en de pagina's worden gemaakt in `content/_content.gotmpl`;
de opmaak van de pagina staat in `layouts/_default/werk.html`.

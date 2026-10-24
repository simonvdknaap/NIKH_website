/* custom.js */

/*
 * Filteren: één rij knoppen met alle tags, technieken en materialen
 * (layouts/partials/filter.html). De foto's hebben data-tags,
 * data-technieken en data-materialen. Eén keuze tegelijk; die komt in het
 * adres (bijv. ?materialen=brons), zodat je ernaar kunt linken.
 */
const tagFilter = document.querySelector(".tag-filter");

if (tagFilter) {
  const buttons = Array.from(tagFilter.querySelectorAll("button"));
  const link = tagFilter.querySelector(".tag-filter-link");
  const leeg = tagFilter.querySelector(".tag-filter-leeg");
  const items = document.querySelectorAll("#gallery .gallery-item");
  const groepen = ["tags", "technieken", "materialen"];

  const kies = (button) => {
    const { groep, tag } = button.dataset;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    items.forEach((item) => {
      item.hidden = Boolean(tag) && !(item.dataset[groep] || "").split(" ").includes(tag);
    });
    leeg.hidden = Array.from(items).some((item) => !item.hidden);

    link.hidden = !tag || !button.dataset.href;
    if (!link.hidden) {
      link.href = button.dataset.href;
      link.textContent = `Alle werken met ${button.firstChild.textContent.trim()} →`;
    }

    const url = new URL(window.location.href);
    ["tag", ...groepen].forEach((g) => url.searchParams.delete(g));
    if (tag) url.searchParams.set(groep, tag);
    history.replaceState(null, "", url);
    window.dispatchEvent(new Event("gallery:update"));
  };

  buttons.forEach((button) => button.addEventListener("click", () => kies(button)));

  // Keuze uit het adres overnemen (?tag= is de oude naam voor ?tags=)
  const params = new URLSearchParams(window.location.search);
  const start = buttons.find((b) => {
    const { groep, tag } = b.dataset;
    return tag && (params.get(groep) === tag || (groep === "tags" && params.get("tag") === tag));
  });
  if (start) window.addEventListener("load", () => kies(start));
}

/*
 * Startpagina: het uitgelichte blok toont elke dag een andere tag.
 * Alle tags staan in de pagina; hier wordt er één zichtbaar gemaakt.
 */
const uitgelicht = document.querySelector("[data-uitgelicht]");

if (uitgelicht) {
  const opties = uitgelicht.querySelectorAll(":scope > a");
  const dag = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
  const keuze = dag % opties.length;
  opties.forEach((optie, i) => (optie.hidden = i !== keuze));
}

/*
 * Werkpagina met meerdere foto's: klik op een kleine foto om hem groot te tonen.
 */
document.querySelectorAll(".werk-fotos").forEach((fotos) => {
  const groot = fotos.querySelector(".werk-afbeelding");
  const knoppen = fotos.querySelectorAll(".werk-miniaturen button");
  knoppen.forEach((knop) =>
    knop.addEventListener("click", () => {
      const img = groot.querySelector("img");
      img.src = knop.dataset.src;
      img.width = knop.dataset.width;
      img.height = knop.dataset.height;
      img.style.setProperty("--r", knop.dataset.width / knop.dataset.height);
      groot.href = knop.dataset.full;
      knoppen.forEach((k) => k.setAttribute("aria-pressed", String(k === knop)));
    }),
  );
});

/*
 * Beheermodus voor de werkpagina's.
 * Zet aan met ?beheer=1 achter een adres van de site, uit met ?beheer=0.
 * De keuze wordt in deze browser onthouden.
 */
const BEHEER_KEY = "nikh-beheer";

function beheerModus() {
  const param = new URLSearchParams(window.location.search).get("beheer");
  try {
    if (param === "1") localStorage.setItem(BEHEER_KEY, "1");
    if (param === "0") localStorage.removeItem(BEHEER_KEY);
    return localStorage.getItem(BEHEER_KEY) === "1";
  } catch {
    return param === "1";
  }
}

/* Waarde als YAML: getallen los, tekst tussen aanhalingstekens (JSON is geldige YAML). */
function yamlWaarde(value) {
  return /^\d+$/.test(value) ? value : JSON.stringify(value);
}

function maakYaml(form) {
  const data = new FormData(form);
  const regels = [];
  for (const veld of ["titel", "jaar", "techniek", "materiaal", "afmetingen"]) {
    const value = (data.get(veld) || "").trim();
    if (!value) continue;
    // Meerdere materialen, gescheiden door komma's, worden een lijst
    const materialen = value.split(",").map((m) => m.trim()).filter(Boolean);
    if (veld === "materiaal" && materialen.length > 1) regels.push(`${veld}: ${JSON.stringify(materialen)}`);
    else regels.push(`${veld}: ${yamlWaarde(value)}`);
  }
  if (data.get("te_koop")) regels.push("te_koop: true");
  const tags = (data.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (tags.length) regels.push(`tags: ${JSON.stringify(tags)}`);
  const beschrijving = (data.get("beschrijving") || "").replace(/\r\n/g, "\n").trim();
  if (beschrijving) {
    regels.push("beschrijving: |");
    for (const regel of beschrijving.split("\n")) regels.push(regel ? `  ${regel}` : "");
  }
  return regels.join("\n") + "\n";
}

if (beheerModus()) {
  document.querySelectorAll(".werk-beheer").forEach((el) => (el.hidden = false));

  /* Terug van formsubmit.co na het versturen (?verstuurd=1) */
  if (new URLSearchParams(window.location.search).get("verstuurd") === "1") {
    document.querySelectorAll(".werk-form").forEach((form) => {
      const melding = document.createElement("p");
      melding.className = "werk-form-verstuurd";
      melding.textContent = "Verstuurd, dank je wel! De gegevens komen binnenkort op de website.";
      form.replaceWith(melding);
    });
  }

  /*
   * Bij Versturen: maak het .yaml-bestand, voeg het toe als bijlage en verstuur
   * het formulier naar formsubmit.co, dat alles naar het e-mailadres stuurt.
   */
  document.querySelectorAll(".werk-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const { bestand } = form.dataset;
      const yaml = maakYaml(form);
      const pagina = window.location.origin + window.location.pathname;

      form.elements.yaml.value = yaml;
      form.elements.Pagina.value = pagina;
      form.elements._next.value = `${pagina}?verstuurd=1`;
      try {
        const bijlage = new DataTransfer();
        bijlage.items.add(new File([yaml], `${bestand}.yaml`, { type: "text/plain" }));
        form.elements.attachment.files = bijlage.files;
      } catch (error) {
        // Oude browser: geen bijlage, de inhoud staat dan alleen in het veld "yaml".
        console.error(error);
      }

      form.querySelector("button").disabled = true;
      form.submit();
    });
  });
}

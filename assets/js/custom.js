/* custom.js */

/*
 * Filteren op tag op de albumpagina's. De knoppen staan in
 * layouts/partials/tag-filter.html, de foto's hebben data-tags.
 * De gekozen tag komt in het adres (?tag=moniek), zodat je ernaar kunt linken.
 */
const tagFilter = document.querySelector(".tag-filter");

if (tagFilter) {
  const buttons = tagFilter.querySelectorAll("button");
  const link = tagFilter.querySelector(".tag-filter-link");
  const items = document.querySelectorAll("#gallery .gallery-item");

  const kiesTag = (tag) => {
    const button = Array.from(buttons).find((b) => b.dataset.tag === tag) || buttons[0];
    tag = button.dataset.tag;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    items.forEach((item) => {
      item.hidden = tag !== "" && !(item.dataset.tags || "").split(" ").includes(tag);
    });
    link.hidden = !tag || !button.dataset.href;
    if (!link.hidden) {
      link.href = button.dataset.href;
      link.textContent = `Alle werken met ${button.firstChild.textContent.trim()} →`;
    }
    const url = new URL(window.location.href);
    if (tag) url.searchParams.set("tag", tag);
    else url.searchParams.delete("tag");
    history.replaceState(null, "", url);
    window.dispatchEvent(new Event("gallery:update"));
  };

  buttons.forEach((button) => button.addEventListener("click", () => kiesTag(button.dataset.tag)));
  const start = new URLSearchParams(window.location.search).get("tag");
  if (start) window.addEventListener("load", () => kiesTag(start));
}

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
    if (value) regels.push(`${veld}: ${yamlWaarde(value)}`);
  }
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

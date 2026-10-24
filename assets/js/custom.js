/* custom.js */

/*
 * Filteren op de albumpagina's, per groep: tags, technieken, materialen.
 * De knoppen staan in layouts/partials/tag-filter.html; de foto's hebben
 * data-tags, data-technieken en data-materialen. Filters uit verschillende
 * groepen worden gecombineerd. De keuze komt in het adres
 * (?tags=moniek&materialen=brons), zodat je ernaar kunt linken.
 */
const tagFilter = document.querySelector(".tag-filter");

if (tagFilter) {
  const groepen = tagFilter.querySelectorAll(".tag-filter-groep");
  const link = tagFilter.querySelector(".tag-filter-link");
  const leeg = tagFilter.querySelector(".tag-filter-leeg");
  const items = document.querySelectorAll("#gallery .gallery-item");
  const keuze = {};

  const pasToe = (laatste) => {
    items.forEach((item) => {
      item.hidden = Object.entries(keuze).some(
        ([groep, tag]) => tag && !(item.dataset[groep] || "").split(" ").includes(tag),
      );
    });
    leeg.hidden = Array.from(items).some((item) => !item.hidden);

    // Link naar de overzichtspagina van de laatst gekozen waarde
    link.hidden = !laatste || !laatste.dataset.tag || !laatste.dataset.href;
    if (!link.hidden) {
      link.href = laatste.dataset.href;
      link.textContent = `Alle werken met ${laatste.firstChild.textContent.trim()} →`;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("tag");
    for (const [groep, tag] of Object.entries(keuze)) {
      if (tag) url.searchParams.set(groep, tag);
      else url.searchParams.delete(groep);
    }
    history.replaceState(null, "", url);
    window.dispatchEvent(new Event("gallery:update"));
  };

  const kies = (groepEl, tag) => {
    const buttons = Array.from(groepEl.querySelectorAll("button"));
    const button = buttons.find((b) => b.dataset.tag === tag) || buttons[0];
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    keuze[groepEl.dataset.groep] = button.dataset.tag;
    return button;
  };

  groepen.forEach((groepEl) => {
    keuze[groepEl.dataset.groep] = "";
    groepEl.querySelectorAll("button").forEach((button) =>
      button.addEventListener("click", () => pasToe(kies(groepEl, button.dataset.tag))),
    );
  });

  // Filters uit het adres overnemen (?tag= is de oude naam voor ?tags=)
  const params = new URLSearchParams(window.location.search);
  let laatste = null;
  groepen.forEach((groepEl) => {
    const groep = groepEl.dataset.groep;
    const tag = params.get(groep) || (groep === "tags" ? params.get("tag") : null);
    if (tag) laatste = kies(groepEl, tag);
  });
  if (laatste) window.addEventListener("load", () => pasToe(laatste));
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
    if (!value) continue;
    // Meerdere materialen, gescheiden door komma's, worden een lijst
    const materialen = value.split(",").map((m) => m.trim()).filter(Boolean);
    if (veld === "materiaal" && materialen.length > 1) regels.push(`${veld}: ${JSON.stringify(materialen)}`);
    else regels.push(`${veld}: ${yamlWaarde(value)}`);
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

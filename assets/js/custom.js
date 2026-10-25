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
 * Startpagina: elke tegel zo hoog als zijn foto, zodat niets wordt bijgesneden.
 * De breedte van een tegel volgt uit het mozaïek; de hoogte = breedte gedeeld
 * door de verhouding van de foto, omgerekend naar rijen van 4px.
 */
const homeGrid = document.querySelector(".home-grid");

if (homeGrid) {
  const RIJ = 4;
  const deelHomeIn = () => {
    homeGrid.classList.add("uitgelijnd");
    homeGrid.querySelectorAll(":scope > .home-item").forEach((tegel) => {
      const img = Array.from(tegel.querySelectorAll("figure > img:not(.hover-foto)")).find((i) => !i.closest("[hidden]"));
      if (!img) return;
      const verhouding = parseFloat(img.getAttribute("width")) / parseFloat(img.getAttribute("height"));
      const marge = parseFloat(getComputedStyle(tegel).marginBottom) || 0;
      const hoogte = tegel.getBoundingClientRect().width / verhouding;
      tegel.style.gridRow = `span ${Math.ceil((hoogte + marge) / RIJ)}`;
    });
  };
  deelHomeIn();
  let breedte = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === breedte) return;
    breedte = window.innerWidth;
    deelHomeIn();
  });
}

/*
 * Categorie-, persoon-, techniek- en materiaalpagina's (o.a. via het
 * uitgelichte blok op de startpagina): "Terug naar Home" als je van de
 * startpagina kwam, anders "Terug naar Werk". Bij terugkomen van een werk
 * geldt de eerdere keuze (onthouden voor dit bezoek).
 */
const terug = document.querySelector(".header-terug[data-home]");

if (terug) {
  const home = new URL(terug.dataset.home, window.location.href);
  const werk = new URL(terug.getAttribute("href"), window.location.href);
  const sleutel = "nikh-terug:" + window.location.pathname;
  let herkomst = null;
  try {
    const vorige = document.referrer ? new URL(document.referrer) : null;
    if (vorige && vorige.origin === window.location.origin) {
      if (vorige.pathname === home.pathname) herkomst = "home";
      else if (vorige.pathname === werk.pathname) herkomst = "werk";
    }
    if (herkomst) sessionStorage.setItem(sleutel, herkomst);
    else herkomst = sessionStorage.getItem(sleutel);
  } catch {
    // geen sessionStorage: dan blijft het "Terug naar Werk"
  }
  if (herkomst === "home") {
    terug.href = home.href;
    terug.lastChild.textContent = " Terug naar Home";
  }
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
  if (data.get("beschikbaar")) regels.push("beschikbaar: true");
  if (data.get("uitgelicht")) regels.push("uitgelicht: true");
  if (data.get("omslag")) regels.push("omslag: true");
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

  /*
   * Bij Opslaan: maak het .yaml-bestand en open GitHub's "nieuw bestand"-pagina
   * met de naam en inhoud al ingevuld; daar klik je op "Commit changes".
   */
  document.querySelectorAll(".werk-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const { repo, branch, bestand } = form.dataset;
      const url = new URL(`https://github.com/${repo}/new/${branch}/images`);
      url.searchParams.set("filename", `${bestand}.yaml`);
      url.searchParams.set("value", maakYaml(form));
      window.open(url, "_blank", "noopener");
    });
  });
}

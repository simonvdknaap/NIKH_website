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
      knoppen.forEach((k) => k.setAttribute("aria-pressed", String(k === knop)));
    }),
  );
});

/*
 * Startpagina: mozaïek zonder bijgesneden foto's en met rechte randen.
 * - Groot scherm: links de uitgelichte foto, rechts 1 tot 3 rijen categorieën
 *   die samen precies even hoog zijn als die foto.
 * - Daaronder (en op de telefoon na de uitgelichte foto) rijen die precies van
 *   rand tot rand lopen; alleen de laatste rij mag korter zijn.
 * Elke foto houdt zijn eigen verhouding; de maten worden zo berekend dat de
 * randen kloppen. Zonder JavaScript blijft het gewone (bijgesneden) mozaïek.
 */
const homeGrid = document.querySelector(".home-grid");

if (homeGrid) {
  const groot = window.matchMedia("(min-width: 900px)");

  const verhoudingVan = (tegel) => {
    const img = Array.from(tegel.querySelectorAll("figure > img:not(.hover-foto)")).find((i) => !i.closest("[hidden]"));
    return img ? parseFloat(img.getAttribute("width")) / parseFloat(img.getAttribute("height")) : 1;
  };

  // Rijen die de breedte vullen; doelhoogte per rij, laatste rij mag korter
  const rijen = (items, x0, y0, breedte, doel, gap, plaats) => {
    let y = y0;
    let i = 0;
    while (i < items.length) {
      let som = 0;
      let j = i;
      let hoogte = Infinity;
      // voeg tegels toe zolang de rij daardoor dichter bij de doelhoogte komt
      while (j < items.length) {
        const nieuweSom = som + items[j].r;
        const nieuweHoogte = (breedte - gap * (j - i)) / nieuweSom;
        if (j > i && Math.abs(nieuweHoogte - doel) > Math.abs(hoogte - doel)) break;
        som = nieuweSom;
        hoogte = nieuweHoogte;
        j++;
      }
      const laatste = j >= items.length;
      if (laatste && hoogte > doel * 1.15) hoogte = doel; // korte laatste rij: gat aan het eind
      let x = x0;
      for (let k = i; k < j; k++) {
        const w = k === j - 1 && !(laatste && hoogte === doel) ? x0 + breedte - x : items[k].r * hoogte;
        plaats(items[k].tegel, x, y, w, hoogte);
        x += w + gap;
      }
      y += hoogte + gap;
      i = j;
    }
    return y;
  };

  const deelHomeIn = () => {
    const cs = getComputedStyle(homeGrid);
    const links = parseFloat(cs.paddingLeft);
    const W = homeGrid.clientWidth - links - parseFloat(cs.paddingRight);
    const gap = groot.matches ? 12 : 8;
    const tegels = Array.from(homeGrid.querySelectorAll(":scope > .home-item"));
    const items = tegels.map((tegel) => ({ tegel, r: verhoudingVan(tegel) }));
    const plaats = (tegel, x, y, w, h) => {
      Object.assign(tegel.style, { position: "absolute", left: links + x + "px", top: y + "px", width: w + "px", height: h + "px" });
    };
    homeGrid.classList.add("gelegd");

    let y = 0;
    let rest = items;
    const uitgelicht = items[0] && items[0].tegel.classList.contains("home-featured") ? items[0] : null;

    if (uitgelicht && groot.matches && items.length >= 2) {
      // Uitgelicht links; rechts 1 tot 3 rijen (elk 1 tot 3 tegels). Kies de
      // verdeling waarbij de uitgelichte foto ongeveer 58% van de breedte krijgt.
      const anderen = items.slice(1);
      const verdelingen = [];
      const maak = (gekozen, gebruikt) => {
        if (gekozen.length) verdelingen.push(gekozen);
        if (gekozen.length === 3) return;
        for (let n = 1; n <= 3 && gebruikt + n <= anderen.length; n++) maak([...gekozen, n], gebruikt + n);
      };
      maak([], 0);
      let beste = null;
      for (const verdeling of verdelingen) {
        let start = 0;
        let a = 0;
        let c = 0;
        for (const n of verdeling) {
          const som = anderen.slice(start, start + n).reduce((t, it) => t + it.r, 0);
          a += 1 / som;
          c += (gap * (n - 1)) / som;
          start += n;
        }
        // breedte uitgelicht (wF) zodat de rijen samen even hoog zijn als de foto
        const wF = ((W - gap) * a - c + gap * (verdeling.length - 1)) / (a + 1 / uitgelicht.r);
        const score = Math.abs(wF / W - 0.58);
        if (wF > W * 0.35 && wF < W * 0.75 && (!beste || score < beste.score)) beste = { verdeling, wF, score };
      }
      if (beste) {
        const H = beste.wF / uitgelicht.r;
        plaats(uitgelicht.tegel, 0, 0, beste.wF, H);
        const R = W - beste.wF - gap;
        const rij = (deel, ry) => {
          const som = deel.reduce((a, b) => a + b.r, 0);
          const h = (R - gap * (deel.length - 1)) / som;
          let x = beste.wF + gap;
          deel.forEach((it, k) => {
            const w = k === deel.length - 1 ? W - x : it.r * h;
            plaats(it.tegel, x, ry, w, h);
            x += w + gap;
          });
          return h;
        };
        let ry = 0;
        let start = 0;
        for (const n of beste.verdeling) {
          ry += rij(anderen.slice(start, start + n), ry) + gap;
          start += n;
        }
        y = H + gap;
        rest = anderen.slice(start);
      }
    }
    if (rest === items && uitgelicht) {
      // Telefoon (of te weinig tegels): uitgelicht over de volle breedte
      plaats(uitgelicht.tegel, 0, 0, W, W / uitgelicht.r);
      y = W / uitgelicht.r + gap;
      rest = items.slice(1);
    }
    y = rijen(rest, 0, y, W, groot.matches ? 300 : 150, gap, plaats);
    homeGrid.style.height = Math.max(0, y - gap) + "px";
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
  // Uitgelicht met een naam (uitgelicht: "Cleo") blijft die naam houden
  if (data.get("uitgelicht")) regels.push(`uitgelicht: ${form.dataset.uitgelicht ? JSON.stringify(form.dataset.uitgelicht) : "true"}`);
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

  /* Terug van formsubmit.co na het versturen (?verstuurd=1): het formulier blijft staan */
  if (new URLSearchParams(window.location.search).get("verstuurd") === "1") {
    document.querySelectorAll(".werk-form-verstuurd").forEach((el) => (el.hidden = false));
  }

  /*
   * Bij Versturen: maak het .yaml-bestand, voeg het toe als bijlage en verstuur
   * het formulier naar formsubmit.co, dat alles naar het e-mailadres stuurt.
   * Heeft het werk nog geen .yaml-bestand (data-repo), dan opent ook GitHub's
   * "nieuw bestand"-pagina met de naam en inhoud al ingevuld.
   */
  document.querySelectorAll(".werk-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const { repo, branch, bestand } = form.dataset;
      const yaml = maakYaml(form);
      const pagina = window.location.origin + window.location.pathname;

      if (repo) {
        const url = new URL(`https://github.com/${repo}/new/${branch}/images`);
        url.searchParams.set("filename", `${bestand}.yaml`);
        url.searchParams.set("value", yaml);
        window.open(url, "_blank", "noopener");
      }

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

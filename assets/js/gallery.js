import justifiedLayout from "./justified-layout.js";
import * as params from "@params";

/*
 * Rijen foto's in hun eigen verhouding (justified layout): de foto's in een
 * rij krijgen dezelfde hoogte en vullen samen de breedte. Gebruikt voor de
 * fotogalerij van albums (#gallery) en voor de Werk-pagina (.werk-rijen).
 */
/*
 * Rijen van 2 of 3 foto's die precies de breedte vullen (voor categorieën met
 * weinig werken op groot scherm). De verdeling in rijen van 2 en 3 wordt zo
 * gekozen dat de rijen zo gelijk mogelijk van hoogte zijn. Alleen de laatste
 * rij mag minder foto's hebben; die wordt niet hoger dan de andere rijen en
 * laat dan rechts ruimte over.
 */
function rijenVanTweeOfDrie(ratios, { rowWidth, spacing }) {
  const n = ratios.length;
  const hoogte = (van, tot) => (rowWidth - (tot - van - 1) * spacing) / ratios.slice(van, tot).reduce((a, b) => a + b, 0);
  const sorted = [...ratios].sort((a, b) => a - b);
  const mediaan = sorted[Math.floor(n / 2)] || 1;
  const doel = rowWidth / (2.5 * mediaan);
  const afwijking = (h) => Math.log(h / doel) ** 2;

  // kosten[i] = beste verdeling van foto i tot het eind
  const kosten = new Array(n + 1).fill(Infinity);
  const stap = new Array(n + 1).fill(0);
  kosten[n] = 0;
  for (let i = n - 1; i >= 0; i--) {
    for (const k of [2, 3, 1]) {
      if (i + k > n) continue;
      const laatste = i + k === n;
      // Rijen van 1 alleen als laatste rij (of als er maar 1 foto is)
      if (k === 1 && !laatste) continue;
      const h = hoogte(i, i + k);
      // De laatste rij wordt niet hoger dan het doel: dan blijft er rechts ruimte
      const c = laatste && h > doel ? 0.15 * (h / doel - 1) : afwijking(h);
      if (c + kosten[i + k] < kosten[i]) {
        kosten[i] = c + kosten[i + k];
        stap[i] = k;
      }
    }
  }

  const boxes = [];
  let top = 0;
  let vorige = doel;
  for (let i = 0; i < n; i += stap[i]) {
    const k = stap[i];
    let h = hoogte(i, i + k);
    if (i + k === n && h > vorige) h = vorige;
    let left = 0;
    for (let j = i; j < i + k; j++) {
      const width = ratios[j] * h;
      boxes.push({ width, height: h, top, left });
      left += width + spacing;
    }
    vorige = h;
    top += h + spacing;
  }
  return { boxes, containerHeight: Math.max(0, top - spacing) };
}

function deelIn(container, { itemSelector, rowHeight, spacing, imgHeight, onLayout, labelsOnder, kleineRijen }) {
  let containerWidth = 0;
  const items = container.querySelectorAll(itemSelector);

  const aspectRatios = Array.from(items).map((item) => {
    const img = item.querySelector("img");
    img.style.width = "100%";
    img.style.height = imgHeight;
    return parseFloat(img.getAttribute("width")) / parseFloat(img.getAttribute("height"));
  });

  // force: opnieuw indelen, ook als de breedte gelijk is (bijv. na filteren op tag)
  function update(force) {
    if (force !== true && containerWidth === container.getBoundingClientRect().width) return;
    containerWidth = container.getBoundingClientRect().width;

    // Alleen zichtbare foto's indelen; verborgen foto's (filter) overslaan
    const visible = Array.from(items).map((item, i) => [item, aspectRatios[i]]).filter(([item]) => !item.hidden);

    const layout = (kleineRijen && kleineRijen() ? rijenVanTweeOfDrie : justifiedLayout)(
      visible.map(([, ratio]) => ratio),
      {
        rowWidth: containerWidth,
        spacing: spacing(),
        rowHeight: rowHeight(),
        heightTolerance: Number.isInteger(params.targetRowHeightTolerance) ? params.targetRowHeightTolerance : 0.25,
      },
    );

    const onder = labelsOnder ? labelsOnder() : false;
    visible.forEach(([item], i) => {
      const { width, left } = layout.boxes[i];
      item.style.position = "absolute";
      item.style.width = width + "px";
      item.style.left = left + "px";
      item.style.overflow = "hidden";
    });

    // Labels onder de foto: per rij ruimte maken voor het hoogste label
    const extraPerRij = new Map();
    if (onder) {
      visible.forEach(([item], i) => {
        const label = item.querySelector(".home-caption");
        const top = layout.boxes[i].top;
        extraPerRij.set(top, Math.max(extraPerRij.get(top) || 0, label ? label.offsetHeight : 0));
      });
    }
    const rijen = Array.from(extraPerRij.keys()).sort((a, b) => a - b);
    const extraBoven = (top) => rijen.filter((t) => t < top).reduce((som, t) => som + extraPerRij.get(t), 0);

    visible.forEach(([item], i) => {
      const { height, top } = layout.boxes[i];
      const extra = extraPerRij.get(top) || 0;
      item.style.height = height + extra + "px";
      item.style.top = top + extraBoven(top) + "px";
      const figure = item.querySelector("figure");
      if (labelsOnder && figure) figure.style.height = onder ? height + "px" : "";
    });

    const totaalExtra = rijen.reduce((som, t) => som + extraPerRij.get(t), 0);
    container.style.position = "relative";
    container.style.height = layout.containerHeight + totaalExtra + "px";
    container.style.visibility = "";
    if (onLayout) onLayout();
  }

  if (!labelsOnder) {
    window.addEventListener("gallery:update", () => update(true));
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    // Call twice to adjust for scrollbars appearing after first call
    update();
    update();
  }
  return update;
}

const gallery = document.getElementById("gallery");
const groot = window.matchMedia("(min-width: 900px)");

if (gallery) {
  // Categorie met minder dan 24 werken: op groot scherm rijen van 2 of 3 foto's
  const weinig = gallery.hasAttribute("data-categorie") && gallery.querySelectorAll(".gallery-item").length < 24;
  deelIn(gallery, {
    itemSelector: ".gallery-item",
    rowHeight: () => params.targetRowHeight || 288,
    spacing: () => (Number.isInteger(params.boxSpacing) ? params.boxSpacing : 8),
    imgHeight: "auto",
    kleineRijen: () => weinig && groot.matches,
  });
}

/*
 * Werk-pagina: op groot scherm grotere rijen dan in de albums, op de telefoon
 * klein. Op kleinere schermen: als een naam in een label over twee regels
 * loopt, staan de labels van alle foto's onder de foto in plaats van erin.
 */
const werkRijen = Array.from(document.querySelectorAll(".werk-rijen"));

/*
 * Elke tegel toont elke dag een andere foto uit zijn groep (data-opties). De
 * keuze verschilt per tegel, zodat niet alle tegels tegelijk "doorschuiven".
 * De categorieën (data-max-drie) wisselen niet per dag maar bij elk bezoek aan
 * de Werk-pagina, net als het uitgelichte blok op de startpagina; de browser
 * onthoudt hoeveelste bezoek het is.
 * Dit gebeurt vóór het indelen, want de verhouding van de foto telt mee.
 */
const dag = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
let bezoek = 0;
if (document.querySelector(".werk-rijen[data-max-drie] .werk-tegel[data-opties]")) {
  try {
    bezoek = (parseInt(localStorage.getItem("nikh-werk-bezoek"), 10) || 0) + 1;
    localStorage.setItem("nikh-werk-bezoek", bezoek);
  } catch {
    bezoek = Math.floor(Math.random() * 1000);
  }
}
document.querySelectorAll(".werk-tegel[data-opties]").forEach((tegel) => {
  let opties;
  try {
    opties = JSON.parse(tegel.dataset.opties);
  } catch {
    return;
  }
  const verschuiving = Array.from(tegel.getAttribute("href")).reduce((som, teken) => som + teken.charCodeAt(0), 0);
  const teller = tegel.closest("[data-max-drie]") ? bezoek : dag;
  const keuze = opties[(teller + verschuiving) % opties.length];
  const img = tegel.querySelector("img");
  img.src = keuze.s;
  img.setAttribute("width", keuze.w);
  img.setAttribute("height", keuze.h);
  tegel.querySelector("figure").style.backgroundColor = keuze.c;
  const hover = tegel.querySelector(".hover-foto");
  if (hover) {
    hover.hidden = !keuze.s2;
    if (keuze.s2) hover.src = keuze.s2;
  }
  tegel.style.setProperty("--r", keuze.w / keuze.h);
});
let labelsOnder = false;

const werkUpdates = werkRijen.map((container) =>
  deelIn(container, {
    itemSelector: ".werk-tegel",
    rowHeight: () => (groot.matches ? 320 : 144),
    spacing: () => (groot.matches ? 12 : 8),
    imgHeight: "100%",
    onLayout: () => container.classList.add("ingedeeld"),
    labelsOnder: () => labelsOnder,
    kleineRijen: () => groot.matches && container.hasAttribute("data-max-drie"),
  }),
);

// Loopt een label (in de foto) over meer dan één regel?
function labelOverTweeRegels(label) {
  const [naam, aantal] = label.children;
  const regel = parseFloat(getComputedStyle(naam).lineHeight) || naam.offsetHeight;
  return naam.offsetHeight > regel * 1.5 || (aantal && aantal.offsetTop > naam.offsetTop + 2);
}

function deelWerkIn() {
  // Eerst met de labels in de foto indelen en meten, daarna zo nodig eronder
  labelsOnder = false;
  werkRijen.forEach((c) => c.classList.remove("labels-onder"));
  werkUpdates.forEach((update) => update(true));
  if (!groot.matches && werkRijen.some((c) => Array.from(c.querySelectorAll(".home-caption")).some(labelOverTweeRegels))) {
    labelsOnder = true;
    werkRijen.forEach((c) => c.classList.add("labels-onder"));
    werkUpdates.forEach((update) => update(true));
  }
}

if (werkRijen.length) {
  let breedte = 0;
  const bijResize = () => {
    if (breedte === document.documentElement.clientWidth) return;
    breedte = document.documentElement.clientWidth;
    deelWerkIn();
  };
  window.addEventListener("resize", bijResize);
  window.addEventListener("orientationchange", bijResize);
  bijResize();
  deelWerkIn(); // nog een keer, voor een eventuele schuifbalk
}

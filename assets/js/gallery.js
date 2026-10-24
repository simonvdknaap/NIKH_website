import justifiedLayout from "./justified-layout.js";
import * as params from "@params";

/*
 * Rijen foto's in hun eigen verhouding (justified layout): de foto's in een
 * rij krijgen dezelfde hoogte en vullen samen de breedte. Gebruikt voor de
 * fotogalerij van albums (#gallery) en voor de Werk-pagina (.werk-rijen).
 */
function deelIn(container, { itemSelector, rowHeight, spacing, imgHeight, onLayout, labelsOnder }) {
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

    const layout = justifiedLayout(
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

if (gallery) {
  deelIn(gallery, {
    itemSelector: ".gallery-item",
    rowHeight: () => params.targetRowHeight || 288,
    spacing: () => (Number.isInteger(params.boxSpacing) ? params.boxSpacing : 8),
    imgHeight: "auto",
  });
}

/*
 * Werk-pagina: op groot scherm grotere rijen dan in de albums, op de telefoon
 * klein. Op kleinere schermen: als een naam in een label over twee regels
 * loopt, staan de labels van alle foto's onder de foto in plaats van erin.
 */
const groot = window.matchMedia("(min-width: 900px)");
const werkRijen = Array.from(document.querySelectorAll(".werk-rijen"));
let labelsOnder = false;

const werkUpdates = werkRijen.map((container) =>
  deelIn(container, {
    itemSelector: ".werk-tegel",
    rowHeight: () => (groot.matches ? 320 : 144),
    spacing: () => (groot.matches ? 12 : 8),
    imgHeight: "100%",
    onLayout: () => container.classList.add("ingedeeld"),
    labelsOnder: () => labelsOnder,
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

import justifiedLayout from "./justified-layout.js";
import * as params from "@params";

/*
 * Rijen foto's in hun eigen verhouding (justified layout): de foto's in een
 * rij krijgen dezelfde hoogte en vullen samen de breedte. Gebruikt voor de
 * fotogalerij van albums (#gallery) en voor de Werk-pagina (.werk-rijen).
 */
function deelIn(container, { itemSelector, rowHeight, spacing, imgHeight, onLayout }) {
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

    visible.forEach(([item], i) => {
      const { width, height, top, left } = layout.boxes[i];
      item.style.position = "absolute";
      item.style.width = width + "px";
      item.style.height = height + "px";
      item.style.top = top + "px";
      item.style.left = left + "px";
      item.style.overflow = "hidden";
    });

    container.style.position = "relative";
    container.style.height = layout.containerHeight + "px";
    container.style.visibility = "";
    if (onLayout) onLayout();
  }

  window.addEventListener("gallery:update", () => update(true));
  window.addEventListener("resize", update);
  window.addEventListener("orientationchange", update);

  // Call twice to adjust for scrollbars appearing after first call
  update();
  update();
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

// Werk-pagina: op groot scherm grotere rijen dan in de albums, op de telefoon klein
const groot = window.matchMedia("(min-width: 900px)");

document.querySelectorAll(".werk-rijen").forEach((container) => {
  deelIn(container, {
    itemSelector: ".werk-tegel",
    rowHeight: () => (groot.matches ? 320 : 144),
    spacing: () => (groot.matches ? 12 : 8),
    imgHeight: "100%",
    onLayout: () => container.classList.add("ingedeeld"),
  });
});

import justifiedLayout from "./justified-layout.js";
import * as params from "@params";

const gallery = document.getElementById("gallery");

if (gallery) {
  let containerWidth = 0;
  const items = gallery.querySelectorAll(".gallery-item");

  const aspectRatios = Array.from(items).map((item) => {
    const img = item.querySelector("img");
    img.style.width = "100%";
    img.style.height = "auto";
    return parseFloat(img.getAttribute("width")) / parseFloat(img.getAttribute("height"));
  });

  // force: opnieuw indelen, ook als de breedte gelijk is (bijv. na filteren op tag)
  function updateGallery(force) {
    if (force !== true && containerWidth === gallery.getBoundingClientRect().width) return;
    containerWidth = gallery.getBoundingClientRect().width;

    // Alleen zichtbare foto's indelen; verborgen foto's (filter) overslaan
    const visible = Array.from(items).map((item, i) => [item, aspectRatios[i]]).filter(([item]) => !item.hidden);

    const layout = justifiedLayout(
      visible.map(([, ratio]) => ratio),
      {
        rowWidth: containerWidth,
        spacing: Number.isInteger(params.boxSpacing) ? params.boxSpacing : 8,
        rowHeight: params.targetRowHeight || 288,
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

    gallery.style.position = "relative";
    gallery.style.height = layout.containerHeight + "px";
    gallery.style.visibility = "";
  }

  window.addEventListener("gallery:update", () => updateGallery(true));
  window.addEventListener("resize", updateGallery);
  window.addEventListener("orientationchange", updateGallery);

  // Call twice to adjust for scrollbars appearing after first call
  updateGallery();
  updateGallery();
}

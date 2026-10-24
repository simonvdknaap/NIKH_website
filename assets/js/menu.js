/*
 * Menu. Groot scherm: altijd zichtbaar in de kop (zie custom.css).
 * Telefoon: de menuknop opent het menu als blok onder de kop; sluiten met de
 * knop, Escape of een klik ernaast.
 */
const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");
const telefoon = window.matchMedia("(max-width: 799px)");

if (toggle && menu) {
  menu.classList.remove("hidden");

  const zet = (open) => {
    menu.classList.toggle("open", open);
    // Dicht op de telefoon: niet bereikbaar met Tab; op groot scherm altijd bereikbaar
    menu.inert = telefoon.matches && !open;
    toggle.setAttribute("aria-expanded", String(open));
  };

  zet(false);
  telefoon.addEventListener("change", () => zet(false));
  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    zet(!menu.classList.contains("open"));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      zet(false);
      toggle.focus();
    }
  });
  // Tik naast het open menu: alleen sluiten, niet ook de link eronder volgen
  document.addEventListener(
    "click",
    (event) => {
      if (!menu.classList.contains("open") || menu.contains(event.target) || toggle.contains(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      zet(false);
    },
    true,
  );
}

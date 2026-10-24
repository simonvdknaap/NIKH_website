/*
 * Menu: de items verschijnen rechts in de kop, naast de menuknop. Er schuift
 * niets over de pagina en de inhoud verspringt niet. Sluiten met de knop of
 * met Escape.
 */
const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

if (toggle && menu) {
  menu.classList.remove("hidden");

  const zet = (open) => {
    menu.classList.toggle("open", open);
    menu.inert = !open;
    toggle.setAttribute("aria-expanded", String(open));
  };

  zet(false);
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
}

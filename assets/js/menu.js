/*
 * Menu als paneel dat van rechts over de pagina schuift (de inhoud
 * verspringt niet). Sluiten met de knop in het paneel, Escape of een klik
 * naast het paneel.
 */
const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

if (toggle && menu) {
  const sluitKnop = document.createElement("button");
  sluitKnop.type = "button";
  sluitKnop.className = "menu-sluiten";
  sluitKnop.setAttribute("aria-label", "Menu sluiten");
  sluitKnop.textContent = "✕";
  menu.prepend(sluitKnop);

  const zet = (open) => {
    menu.classList.toggle("open", open);
    menu.classList.toggle("hidden", false);
    menu.inert = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) sluitKnop.focus();
  };

  zet(false);
  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    zet(!menu.classList.contains("open"));
  });
  sluitKnop.addEventListener("click", () => {
    zet(false);
    toggle.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      zet(false);
      toggle.focus();
    }
  });
  // Klik naast het open menu: alleen sluiten, niet ook de link eronder volgen
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

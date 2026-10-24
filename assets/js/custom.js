/* custom.js */

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
    if (value) regels.push(`${veld}: ${yamlWaarde(value)}`);
  }
  const beschrijving = (data.get("beschrijving") || "").replace(/\r\n/g, "\n").trim();
  if (beschrijving) {
    regels.push("beschrijving: |");
    for (const regel of beschrijving.split("\n")) regels.push(regel ? `  ${regel}` : "");
  }
  return regels.join("\n") + "\n";
}

if (beheerModus()) {
  document.querySelectorAll(".werk-beheer").forEach((el) => (el.hidden = false));

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

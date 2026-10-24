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

function zetStatus(form, tekst, isFout = false) {
  const status = form.querySelector(".werk-form-status");
  status.textContent = tekst;
  status.classList.toggle("fout", isFout);
}

if (beheerModus()) {
  document.querySelectorAll(".werk-beheer").forEach((el) => (el.hidden = false));

  document.querySelectorAll(".werk-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const { email, bestand } = form.dataset;
      const data = new FormData(form);
      const veld = (naam) => (data.get(naam) || "").trim();
      const button = form.querySelector("button");

      const bericht = {
        _subject: `NIKH website: gegevens voor ${bestand}`,
        _template: "box",
        _captcha: "false",
        _honey: veld("_honey"),
        Foto: bestand,
        Pagina: window.location.origin + window.location.pathname,
        Titel: veld("titel"),
        Jaar: veld("jaar"),
        Techniek: veld("techniek"),
        Materiaal: veld("materiaal"),
        Afmetingen: veld("afmetingen"),
        Beschrijving: veld("beschrijving"),
        [`Inhoud voor images/${bestand}.yaml`]: maakYaml(form),
      };

      button.disabled = true;
      zetStatus(form, "Bezig met versturen…");
      try {
        const response = await fetch(`https://formsubmit.co/ajax/${email}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(bericht),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || String(result.success) !== "true") {
          throw new Error(result.message || `HTTP ${response.status}`);
        }
        zetStatus(form, "Verstuurd, dank je wel! De gegevens komen binnenkort op de website.");
        form.querySelectorAll("input, textarea").forEach((el) => (el.disabled = true));
      } catch (error) {
        console.error(error);
        zetStatus(form, "Versturen is niet gelukt. Probeer het later nog eens.", true);
        button.disabled = false;
      }
    });
  });
}

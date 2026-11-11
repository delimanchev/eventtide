import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const POT = "/api/organizator/dogodki";
const DATUMI = [
  ["zacetek", "Začetek"],
  ["konec", "Konec"],
  ["rok_prijave", "Rok prijave"],
];

async function zahteva(pot, options = {}) {
  const odgovor = await fetch(`${API_URL}${pot}`, {
    ...options,
    credentials: "include",
  });
  const podatki = await odgovor.json();

  if (!odgovor.ok) {
    throw new Error(podatki.error || "Zahteva ni uspela.");
  }

  return podatki;
}

function lokalniDatum(vrednost) {
  if (!vrednost) return "";

  const datum = new Date(vrednost);
  const lokalniCas = datum.getTime() - datum.getTimezoneOffset() * 60_000;
  return new Date(lokalniCas).toISOString().slice(0, 19);
}

export default function DogodkiOrganizatorja() {
  const [dogodki, nastaviDogodke] = useState([]);
  const [kategorije, nastaviKategorije] = useState([]);
  const [urejanje, nastaviUrejanje] = useState(null);
  const [napaka, nastaviNapako] = useState("");
  const [nalaganje, nastaviNalaganje] = useState(true);
  const [vTeku, nastaviVTeku] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };

    Promise.all([zahteva(POT, options), zahteva("/api/kategorije", options)])
      .then(([seznam, izbor]) => {
        if (controller.signal.aborted) return;
        nastaviDogodke(seznam.dogodki);
        nastaviKategorije(izbor.kategorije);
      })
      .catch((error) => {
        if (!controller.signal.aborted) nastaviNapako(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) nastaviNalaganje(false);
      });

    return () => controller.abort();
  }, []);

  async function izvedi(pot, options) {
    nastaviVTeku(true);
    nastaviNapako("");

    try {
      await zahteva(pot, options);
      nastaviUrejanje(null);
      const seznam = await zahteva(POT);
      nastaviDogodke(seznam.dogodki);
      return true;
    } catch (error) {
      nastaviNapako(error.message);
      return false;
    } finally {
      nastaviVTeku(false);
    }
  }

  const zaklenjeno = urejanje?.status === "objavljen";

  async function shrani(event) {
    event.preventDefault();
    const obrazec = event.currentTarget;
    const polja = new FormData(obrazec);
    const podatki = {
      naslov: polja.get("naslov"),
      opis: polja.get("opis"),
      lokacija: polja.get("lokacija"),
      kategorija_id: Number(polja.get("kategorija_id")),
    };

    if (!zaklenjeno) {
      podatki.kapaciteta = Number(polja.get("kapaciteta"));

      for (const [ime, oznaka] of DATUMI) {
        const datum = new Date(polja.get(ime));
        if (!Number.isFinite(datum.getTime())) {
          nastaviNapako(`Preveri polje »${oznaka}«.`);
          return;
        }
        podatki[ime] = datum.toISOString();
      }
    }

    const uspesno = await izvedi(urejanje ? `${POT}/${urejanje.id}` : POT, {
      method: urejanje ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(podatki),
    });

    if (uspesno) obrazec.reset();
  }

  return (
    <section>
      <h2>Moji dogodki</h2>
      {napaka && <p role="alert">{napaka}</p>}
      {nalaganje && <p>Nalaganje dogodkov …</p>}
      {!nalaganje && dogodki.length === 0 && <p>Še nimaš dogodkov.</p>}

      <ul>
        {dogodki.map((dogodek) => (
          <li key={dogodek.id}>
            {dogodek.naslov} ({dogodek.status}){" "}
            {["osnutek", "objavljen"].includes(dogodek.status) && (
              <button
                type="button"
                disabled={vTeku}
                onClick={() => {
                  nastaviNapako("");
                  nastaviUrejanje(dogodek);
                }}
              >
                Uredi
              </button>
            )}{" "}
            {dogodek.status === "osnutek" && (
              <button
                type="button"
                disabled={vTeku}
                onClick={() => izvedi(`${POT}/${dogodek.id}/objavi`, { method: "POST" })}
              >
                Objavi
              </button>
            )}
          </li>
        ))}
      </ul>

      <h3>{urejanje ? "Uredi dogodek" : "Ustvari osnutek"}</h3>
      {zaklenjeno && <p>Po objavi so termin, rok prijave in kapaciteta zaklenjeni.</p>}

      <form key={urejanje?.id ?? "nov"} onSubmit={shrani}>
        <fieldset disabled={vTeku || nalaganje || kategorije.length === 0}>
          <div><label>Naslov <input name="naslov" defaultValue={urejanje?.naslov} required /></label></div>
          <div><label>Opis <textarea name="opis" defaultValue={urejanje?.opis} required /></label></div>
          <div><label>Lokacija <input name="lokacija" defaultValue={urejanje?.lokacija} required /></label></div>
          <div>
            <label>
              Kategorija{" "}
              <select name="kategorija_id" defaultValue={urejanje?.kategorija_id ?? ""} required>
                <option value="" disabled>Izberi kategorijo</option>
                {kategorije.map((kategorija) => (
                  <option key={kategorija.id} value={kategorija.id}>{kategorija.naziv}</option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>
              Kapaciteta{" "}
              <input name="kapaciteta" type="number" min="1" step="1"
                defaultValue={urejanje?.kapaciteta} disabled={zaklenjeno} required />
            </label>
          </div>
          {DATUMI.map(([ime, oznaka]) => (
            <div key={ime}>
              <label>
                {oznaka}{" "}
                <input name={ime} type="datetime-local" step="1"
                  defaultValue={lokalniDatum(urejanje?.[ime])} disabled={zaklenjeno} required />
              </label>
            </div>
          ))}
          <button type="submit">{urejanje ? "Shrani spremembe" : "Ustvari osnutek"}</button>
          {urejanje && (
            <button type="button" onClick={() => nastaviUrejanje(null)}>Prekliči urejanje</button>
          )}
        </fieldset>
      </form>
    </section>
  );
}
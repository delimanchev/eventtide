import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const STATUSI = {
  potrjena: "Potrjena",
  cakalna: "Na čakalnem seznamu",
  odpovedana: "Odpovedana",
};

const PRISOTNOST = {
  neevidentirana: "Neevidentirana",
  prisoten: "Prisoten",
  odsoten: "Odsoten",
};

async function zahteva(pot, options = {}) {
  const odgovor = await fetch(pot, {
    ...options,
    credentials: "include",
  });
  const podatki = await odgovor.json();

  if (!odgovor.ok) {
    throw new Error(podatki.error || "Zahteva ni uspela.");
  }

  return podatki;
}

function SeznamPrijav({ dogodekId }) {
  const [prijave, nastaviPrijave] = useState(null);
  const [napaka, nastaviNapako] = useState("");
  const [sporocilo, nastaviSporocilo] = useState("");
  const [shranjevanje, nastaviShranjevanje] = useState(false);

  const pot = `${API_URL}/api/organizator/dogodki/${dogodekId}/prijave`;

  useEffect(() => {
    const controller = new AbortController();

    zahteva(pot, { signal: controller.signal })
      .then(({ dogodek }) => {
        if (!controller.signal.aborted) nastaviPrijave(dogodek.prijave);
      })
      .catch((error) => {
        if (!controller.signal.aborted) nastaviNapako(error.message);
      });

    return () => controller.abort();
  }, [pot]);

  async function shrani(id, prisotnost) {
    nastaviShranjevanje(true);
    nastaviNapako("");
    nastaviSporocilo("");

    try {
      const { prijava } = await zahteva(`${pot}/${id}/prisotnost`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prisotnost }),
      });

      nastaviPrijave((prejsnje) =>
        prejsnje.map((vnos) => vnos.id === id ? { ...vnos, ...prijava } : vnos),
      );
      nastaviSporocilo("Prisotnost je shranjena.");
    } catch (error) {
      nastaviNapako(error.message);
    } finally {
      nastaviShranjevanje(false);
    }
  }

  return (
    <div>
      {napaka && <p role="alert">{napaka}</p>}
      {sporocilo && <p role="status">{sporocilo}</p>}
      {prijave === null && !napaka && <p role="status">Nalaganje prijav …</p>}
      {prijave?.length === 0 && <p>Za ta dogodek še ni prijav.</p>}

      {prijave?.length > 0 && (
        <ul>
          {prijave.map((prijava) => (
            <li key={prijava.id}>
              {prijava.ime} · {STATUSI[prijava.status]} ·{" "}
              {prijava.status === "potrjena" ? (
                <label>
                  Prisotnost:{" "}
                  <select
                    value={prijava.prisotnost}
                    disabled={shranjevanje}
                    onChange={(event) => shrani(prijava.id, event.target.value)}
                  >
                    {Object.entries(PRISOTNOST).map(([vrednost, oznaka]) => (
                      <option key={vrednost} value={vrednost}>{oznaka}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <span>Prisotnost: {PRISOTNOST[prijava.prisotnost]}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PrijaveDogodka({ dogodekId }) {
  const [odprto, nastaviOdprto] = useState(false);

  return (
    <div>
      <button
        type="button"
        aria-expanded={odprto}
        onClick={() => nastaviOdprto((prejsnje) => !prejsnje)}
      >
        {odprto ? "Skrij prijave" : "Prikaži prijave"}
      </button>
      {odprto && <SeznamPrijav dogodekId={dogodekId} />}
    </div>
  );
}
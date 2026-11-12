import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const POT = `${API_URL}/api/admin`;

async function zahteva(pot, moznosti = {}) {
  const odgovor = await fetch(`${POT}${pot}`, {
    ...moznosti,
    credentials: "include",
  });
  const podatki = await odgovor.json();

  if (!odgovor.ok) {
    throw new Error(podatki.error || "Zahteva ni uspela.");
  }

  return podatki;
}

export default function Administracija() {
  const [podatki, nastaviPodatke] = useState(null);
  const [napaka, nastaviNapako] = useState("");
  const [sporocilo, nastaviSporocilo] = useState("");
  const [vTeku, nastaviVTeku] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const moznosti = { signal: controller.signal };

    Promise.all([
      zahteva("/uporabniki", moznosti),
      zahteva("/dogodki", moznosti),
    ])
      .then(([{ uporabniki }, { dogodki }]) => {
        if (!controller.signal.aborted) nastaviPodatke({ uporabniki, dogodki });
      })
      .catch((error) => {
        if (!controller.signal.aborted) nastaviNapako(error.message);
      });

    return () => controller.abort();
  }, []);

  async function izvedi(dejanje) {
    nastaviVTeku(true);
    nastaviNapako("");
    nastaviSporocilo("");

    try {
      await dejanje();
    } catch (error) {
      nastaviNapako(error.message);
    } finally {
      nastaviVTeku(false);
    }
  }

  function posodobiRacun(racun, sprememba) {
    return izvedi(async () => {
      const { uporabnik } = await zahteva(`/uporabniki/${racun.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sprememba),
      });

      nastaviPodatke((prejsnji) => ({
        ...prejsnji,
        uporabniki: prejsnji.uporabniki.map((vnos) =>
          vnos.id === uporabnik.id ? uporabnik : vnos,
        ),
      }));
      nastaviSporocilo(`Račun »${uporabnik.ime}« je posodobljen.`);
    });
  }

  function umakniDogodek(dogodek) {
    if (!window.confirm(`Želiš umakniti dogodek »${dogodek.naslov}« iz objave?`)) {
      return;
    }

    return izvedi(async () => {
      await zahteva(`/dogodki/${dogodek.id}/umik`, { method: "PATCH" });

      nastaviPodatke((prejsnji) => ({
        ...prejsnji,
        dogodki: prejsnji.dogodki.filter((vnos) => vnos.id !== dogodek.id),
      }));
      nastaviSporocilo(`Dogodek »${dogodek.naslov}« je umaknjen.`);
    });
  }

  return (
    <section>
      <h2>Administracija</h2>
      {napaka && <p role="alert">{napaka}</p>}
      {sporocilo && <p role="status">{sporocilo}</p>}
      {!podatki && !napaka && <p role="status">Nalaganje …</p>}

      {podatki && (
        <>
          <h3>Uporabniki</h3>
          <ul>
            {podatki.uporabniki.map((racun) => (
              <li key={racun.id}>
                {racun.ime} ({racun.email}) · {racun.vloga} ·{" "}
                {racun.aktiven ? "Aktiven" : "Neaktiven"}{" "}
                {racun.vloga === "udeleženec" && (
                  <button
                    type="button"
                    disabled={vTeku}
                    onClick={() => posodobiRacun(racun, { vloga: "organizator" })}
                  >
                    Dodeli vlogo organizatorja
                  </button>
                )}{" "}
                {racun.vloga !== "administrator" && (
                  <button
                    type="button"
                    disabled={vTeku}
                    onClick={() => posodobiRacun(racun, { aktiven: !racun.aktiven })}
                  >
                    {racun.aktiven ? "Deaktiviraj račun" : "Aktiviraj račun"}
                  </button>
                )}
              </li>
            ))}
          </ul>

          <h3>Objavljeni dogodki</h3>
          {podatki.dogodki.length === 0 && <p>Ni objavljenih dogodkov.</p>}
          <ul>
            {podatki.dogodki.map((dogodek) => (
              <li key={dogodek.id}>
                {dogodek.naslov} · {dogodek.organizator} · {dogodek.vidnost}{" "}
                <button
                  type="button"
                  disabled={vTeku}
                  onClick={() => umakniDogodek(dogodek)}
                >
                  Umakni iz objave
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
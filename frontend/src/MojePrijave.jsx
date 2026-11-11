import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const POT = `${API_URL}/api/moje-prijave`;

const STATUSI = {
  potrjena: "Potrjena",
  cakalna: "Na čakalnem seznamu",
  odpovedana: "Odpovedana",
};

const datum = new Intl.DateTimeFormat("sl-SI", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Ljubljana",
});

export default function MojePrijave() {
  const [prijave, nastaviPrijave] = useState(null);
  const [napaka, nastaviNapako] = useState("");
  const [sporocilo, nastaviSporocilo] = useState("");
  const [odpovedVTeKu, nastaviOdpovedVTeKu] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function nalozi() {
      try {
        const odgovor = await fetch(POT, {
          credentials: "include",
          signal: controller.signal,
        });
        const podatki = await odgovor.json();

        if (!odgovor.ok) {
          throw new Error(podatki.error || "Prijav ni mogoče naložiti.");
        }

        if (!controller.signal.aborted) nastaviPrijave(podatki.prijave);
      } catch (error) {
        if (!controller.signal.aborted) nastaviNapako(error.message);
      }
    }

    nalozi();
    return () => controller.abort();
  }, []);

  async function odpovej(prijava) {
    if (!window.confirm(`Želiš odpovedati prijavo na »${prijava.naslov}«?`)) {
      return;
    }

    nastaviOdpovedVTeKu(true);
    nastaviNapako("");
    nastaviSporocilo("");

    try {
      const odgovor = await fetch(`${POT}/${prijava.id}/odpoved`, {
        method: "POST",
        credentials: "include",
      });
      const podatki = await odgovor.json();

      if (!odgovor.ok) {
        throw new Error(podatki.error || "Odpoved ni uspela.");
      }

      nastaviPrijave((prejsnje) =>
        prejsnje.map((vnos) =>
          vnos.id === prijava.id
            ? { ...vnos, status: podatki.prijava.status }
            : vnos,
        ),
      );
      nastaviSporocilo(`Prijava na »${prijava.naslov}« je odpovedana.`);
    } catch (error) {
      nastaviNapako(error.message);
    } finally {
      nastaviOdpovedVTeKu(false);
    }
  }

  return (
    <section>
      <h2>Moje prijave</h2>
      {napaka && <p role="alert">{napaka}</p>}
      {sporocilo && <p role="status">{sporocilo}</p>}
      {prijave === null && !napaka && <p role="status">Nalaganje prijav …</p>}
      {prijave?.length === 0 && <p>Še nimaš prijav.</p>}

      {prijave?.map((prijava) => (
        <article key={prijava.id}>
          <h3>{prijava.naslov}</h3>
          <p>{datum.format(new Date(prijava.zacetek))} · {prijava.lokacija}</p>
          <p>Status: {STATUSI[prijava.status] ?? prijava.status}</p>
          {(prijava.status === "potrjena" || prijava.status === "cakalna") && (
            <button
              type="button"
              disabled={odpovedVTeKu}
              onClick={() => odpovej(prijava)}
            >
              Odpovej prijavo
            </button>
          )}
        </article>
      ))}
    </section>
  );
}
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const oblikovalnikDatuma = new Intl.DateTimeFormat("sl-SI", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Ljubljana",
});

function datum(cas) {
  return oblikovalnikDatuma.format(new Date(cas));
}

function useJavniApi(pot) {
  const [rezultat, nastaviRezultat] = useState(null);

  useEffect(() => {
    if (!pot) return;

    const controller = new AbortController();

    async function nalozi() {
      try {
        const odgovor = await fetch(`${API_URL}${pot}`, {
          signal: controller.signal,
        });
        const podatki = await odgovor.json();

        if (!odgovor.ok) {
          throw new Error(podatki.error || "Podatkov ni mogoče naložiti.");
        }

        if (!controller.signal.aborted) {
          nastaviRezultat({ pot, podatki });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          nastaviRezultat({ pot, napaka: error.message });
        }
      }
    }

    nalozi();
    return () => controller.abort();
  }, [pot]);

  return rezultat?.pot === pot ? rezultat : null;
}

export default function JavniDogodki() {
  const [filtri, nastaviFiltre] = useState("");
  const [izbraniId, nastaviIzbraniId] = useState(null);

  const seznam = useJavniApi(`/api/dogodki${filtri ? `?${filtri}` : ""}`);
  const izbor = useJavniApi("/api/kategorije");
  const podrobnosti = useJavniApi(
    izbraniId === null ? null : `/api/dogodki/${izbraniId}`,
  );
  const dogodek = podrobnosti?.podatki?.dogodek;

  function poisci(event) {
    event.preventDefault();
    const parametri = new URLSearchParams();

    for (const [ime, vrednost] of new FormData(event.currentTarget)) {
      const vnos = vrednost.trim();
      if (vnos) parametri.set(ime, vnos);
    }

    nastaviIzbraniId(null);
    nastaviFiltre(parametri.toString());
  }

  return (
    <section>
      <h2>Prihajajoči dogodki</h2>

      <form onSubmit={poisci}>
        <label>
          Naslov{" "}
          <input name="iskanje" type="search" maxLength={200} />
        </label>{" "}
        <label>
          Kategorija{" "}
          <select name="kategorija_id" disabled={!izbor?.podatki}>
            <option value="">Vse kategorije</option>
            {izbor?.podatki?.kategorije.map((kategorija) => (
              <option key={kategorija.id} value={kategorija.id}>
                {kategorija.naziv}
              </option>
            ))}
          </select>
        </label>{" "}
        <label>
          Datum začetka <input name="datum" type="date" />
        </label>{" "}
        <button type="submit">Poišči</button>{" "}
        <button
          type="reset"
          onClick={() => {
            nastaviFiltre("");
            nastaviIzbraniId(null);
          }}
        >
          Počisti filtre
        </button>
      </form>

      {izbor?.napaka && <p role="alert">{izbor.napaka}</p>}
      {!seznam && <p role="status">Nalaganje dogodkov …</p>}
      {seznam?.napaka && <p role="alert">{seznam.napaka}</p>}
      {seznam?.podatki?.dogodki.length === 0 && <p>Ni najdenih dogodkov.</p>}

      {seznam?.podatki?.dogodki.map((vnos) => (
        <article key={vnos.id}>
          <h3>{vnos.naslov}</h3>
          <p>{datum(vnos.zacetek)} · {vnos.lokacija} · {vnos.kategorija}</p>
          <p>Prosta mesta: {vnos.prosta_mesta}</p>
          <button type="button" onClick={() => nastaviIzbraniId(vnos.id)}>
            Podrobnosti
          </button>
        </article>
      ))}

      {izbraniId !== null && (
        <section aria-label="Podrobnosti dogodka">
          <button type="button" onClick={() => nastaviIzbraniId(null)}>
            Zapri podrobnosti
          </button>
          {!podrobnosti && <p role="status">Nalaganje podrobnosti …</p>}
          {podrobnosti?.napaka && <p role="alert">{podrobnosti.napaka}</p>}
          {dogodek && (
            <>
              <h3>{dogodek.naslov}</h3>
              <p>{dogodek.opis}</p>
              <p>Kategorija: {dogodek.kategorija}</p>
              <p>Lokacija: {dogodek.lokacija}</p>
              <p>Začetek: {datum(dogodek.zacetek)}</p>
              <p>Konec: {datum(dogodek.konec)}</p>
              <p>Rok prijave: {datum(dogodek.rok_prijave)}</p>
              <p>Prosta mesta: {dogodek.prosta_mesta}</p>
            </>
          )}
        </section>
      )}
    </section>
  );
}
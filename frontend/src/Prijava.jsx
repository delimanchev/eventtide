import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function authZahteva(pot, options = {}) {
  return fetch(`${API_URL}/api/auth/${pot}`, {
    ...options,
    credentials: "include",
  });
}

export default function Prijava() {
  const [uporabnik, nastaviUporabnika] = useState(null);
  const [preverjanje, nastaviPreverjanje] = useState(true);
  const [oddajanje, nastaviOddajanje] = useState(false);
  const [napaka, nastaviNapako] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function preveriSejo() {
      try {
        const odgovor = await authZahteva("me", {
          signal: controller.signal,
        });

        if (odgovor.status === 401) return;
        if (!odgovor.ok) throw new Error("Seje ni bilo mogoče preveriti.");

        const podatki = await odgovor.json();
        nastaviUporabnika(podatki.uporabnik);
      } catch {
        if (!controller.signal.aborted) {
          nastaviNapako("Seje ni bilo mogoče preveriti.");
        }
      } finally {
        if (!controller.signal.aborted) nastaviPreverjanje(false);
      }
    }

    preveriSejo();
    return () => controller.abort();
  }, []);

  async function prijavi(event) {
    event.preventDefault();
    const obrazec = event.currentTarget;
    const podatki = Object.fromEntries(new FormData(obrazec));

    nastaviOddajanje(true);
    nastaviNapako("");

    try {
      const odgovor = await authZahteva("login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(podatki),
      });
      const rezultat = await odgovor.json().catch(() => null);

      if (!odgovor.ok) {
        nastaviNapako(rezultat?.error || "Prijava ni uspela.");
        return;
      }

      obrazec.reset();
      nastaviUporabnika(rezultat.uporabnik);
    } catch {
      nastaviNapako("Povezava s strežnikom ni uspela.");
    } finally {
      nastaviOddajanje(false);
    }
  }

  async function odjavi() {
    nastaviOddajanje(true);
    nastaviNapako("");

    try {
      const odgovor = await authZahteva("logout", { method: "POST" });

      if (!odgovor.ok) {
        nastaviNapako("Odjava ni uspela.");
        return;
      }

      nastaviUporabnika(null);
    } catch {
      nastaviNapako("Povezava s strežnikom ni uspela.");
    } finally {
      nastaviOddajanje(false);
    }
  }

  return (
    <section aria-labelledby="prijava-naslov">
      <h2 id="prijava-naslov">{uporabnik ? "Moj račun" : "Prijava"}</h2>

      {preverjanje ? (
        <p role="status">Preverjam prijavo …</p>
      ) : uporabnik ? (
        <>
          <p>Prijavljen uporabnik: {uporabnik.ime}</p>
          <p>Vloga: {uporabnik.vloga}</p>
          <button type="button" onClick={odjavi} disabled={oddajanje}>
            Odjavi se
          </button>
        </>
      ) : (
        <form onSubmit={prijavi}>
          <p>
            <label>
              E-pošta{" "}
              <input name="email" type="email" autoComplete="username" required />
            </label>
          </p>
          <p>
            <label>
              Geslo{" "}
              <input
                name="geslo"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
          </p>
          <button type="submit" disabled={oddajanje}>
            {oddajanje ? "Prijavljam …" : "Prijavi se"}
          </button>
        </form>
      )}

      {napaka && <p role="alert">{napaka}</p>}
    </section>
  );
}
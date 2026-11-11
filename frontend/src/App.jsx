import { useState } from "react";
import "./App.css";
import Prijava from "./Prijava.jsx";
import JavniDogodki from "./JavniDogodki.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  const [oddajanje, nastaviVTeku] = useState(false);
  const [napaka, nastaviNapako] = useState("");
  const [uspeh, nastaviUspeh] = useState("");

  async function registriraj(event) {
    event.preventDefault();
    const obrazec = event.currentTarget;
    const podatki = new FormData(obrazec);

    nastaviVTeku(true);
    nastaviNapako("");
    nastaviUspeh("");

    try {
      const odgovor = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(podatki)),
      });

      const rezultat = await odgovor.json().catch(() => null);

      if (odgovor.status !== 201) {
        nastaviNapako(rezultat?.error || "Registracija ni uspela.");
        return;
      }

      obrazec.reset();
      nastaviUspeh("Račun je uspešno ustvarjen.");
    } catch {
      nastaviNapako("Povezava s strežnikom ni uspela.");
    } finally {
      nastaviVTeku(false);
    }
  }

  return (
    <main>
      <h1>EventTide</h1>
      <JavniDogodki />
      <Prijava />
      <h2>Ustvari račun</h2>

      <form onSubmit={registriraj}>
        <p>
          <label>
            Ime <input name="ime" autoComplete="name" required />
          </label>
        </p>
        <p>
          <label>
            E-pošta{" "}
            <input name="email" type="email" autoComplete="email" required />
          </label>
        </p>
        <p>
          <label>
            Geslo{" "}
            <input
              name="geslo"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
            />
          </label>
        </p>
        <button type="submit" disabled={oddajanje}>
          {oddajanje ? "Ustvarjam račun …" : "Ustvari račun"}
        </button>
      </form>

      {napaka && <p role="alert">{napaka}</p>}
      {uspeh && <p role="status">{uspeh}</p>}
    </main>
  );
}
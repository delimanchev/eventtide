import "dotenv/config";
import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";

const { Pool } = pg;

const app = express();
const port = Number(process.env.PORT || 3001);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5433),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 3000,
  query_timeout: 3000,
});

pool.on("error", () => {
  console.error("Povezava s podatkovno bazo je bila prekinjena.");
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch {
    res.status(503).json({
      status: "error",
      database: "unavailable",
    });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { ime, email, geslo } = req.body ?? {};

  if (
    typeof ime !== "string" ||
    typeof email !== "string" ||
    typeof geslo !== "string"
  ) {
    return res.status(400).json({ error: "Vnesi ime, e-pošto in geslo." });
  }

  const cistoIme = ime.trim();
  const cistEmail = email.trim().toLowerCase();

  if (!cistoIme) {
    return res.status(400).json({ error: "Vnesi ime." });
  }

  if (cistEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cistEmail)) {
    return res.status(400).json({ error: "Vnesi veljaven e-poštni naslov." });
  }

  if ([...geslo].length < 12 || Buffer.byteLength(geslo, "utf8") > 72) {
    return res.status(400).json({
      error: "Geslo mora imeti vsaj 12 znakov in največ 72 bajtov UTF-8.",
    });
  }

  try {
    const gesloHash = await bcrypt.hash(geslo, 12);
    const { rows } = await pool.query(
      `INSERT INTO uporabnik (ime, email, geslo_hash)
       VALUES ($1, $2, $3)
       RETURNING id, ime, email, vloga, aktiven`,
      [cistoIme, cistEmail, gesloHash],
    );

    return res.status(201).json({ uporabnik: rows[0] });
  } catch (error) {
    if (error.code === "23505" && error.constraint === "uporabnik_email_uk") {
      return res.status(409).json({ error: "Ta e-poštni naslov je že v uporabi." });
    }

    console.error("Registracija ni uspela:", error.code ?? error.name);
    return res.status(500).json({ error: "Registracija trenutno ni mogoča." });
  }
});

app.listen(port, () => {
  console.log(`EventTide API: http://localhost:${port}`);
});
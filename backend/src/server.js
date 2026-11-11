import "dotenv/config";
import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

const app = express();
const port = Number(process.env.PORT || 3001);
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("V backend/.env manjka SESSION_SECRET.");
}

const pool = new pg.Pool({
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

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());

const PgSessionStore = connectPgSimple(session);

app.use(
  session({
    name: "eventtide.sid",
    secret: sessionSecret,
    store: new PgSessionStore({ pool, tableName: "uporabniska_seja" }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({ status: "ok", database: "connected" });
  } catch {
    return res.status(503).json({ status: "error", database: "unavailable" });
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

app.post("/api/auth/login", async (req, res, next) => {
  if (req.get("Origin") !== frontendUrl) {
    return res.status(403).json({ error: "Nedovoljen izvor zahteve." });
  }

  const { email, geslo } = req.body ?? {};
  const neveljavnaPrijava = { error: "Napačna e-pošta ali geslo." };

  if (
    typeof email !== "string" ||
    typeof geslo !== "string" ||
    Buffer.byteLength(geslo, "utf8") > 72
  ) {
    return res.status(401).json(neveljavnaPrijava);
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, ime, email, vloga, aktiven, geslo_hash
       FROM uporabnik
       WHERE lower(btrim(email)) = $1`,
      [email.trim().toLowerCase()],
    );

    const uporabnik = rows[0];

    if (!uporabnik?.aktiven || !(await bcrypt.compare(geslo, uporabnik.geslo_hash))) {
      return res.status(401).json(neveljavnaPrijava);
    }

    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.uporabnikId = uporabnik.id;
      req.session.save((error) => {
        if (error) return next(error);

        const { id, ime, email, vloga } = uporabnik;
        return res.json({ uporabnik: { id, ime, email, vloga } });
      });
    });
  } catch (error) {
    return next(error);
  }
});

async function zahtevajPrijavo(req, res, next) {
  const uporabnikId = req.session?.uporabnikId;

  if (!uporabnikId) {
    return res.status(401).json({ error: "Najprej se prijavi." });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, ime, email, vloga
       FROM uporabnik
       WHERE id = $1 AND aktiven = true`,
      [uporabnikId],
    );

    if (!rows[0]) {
      return res.status(401).json({ error: "Seja ni več veljavna." });
    }

    req.uporabnik = rows[0];
    return next();
  } catch (error) {
    return next(error);
  }
}

function zahtevajVlogo(...dovoljeneVloge) {
  return (req, res, next) => {
    if (!req.uporabnik) {
      return res.status(401).json({ error: "Najprej se prijavi." });
    }

    if (!dovoljeneVloge.includes(req.uporabnik.vloga)) {
      return res.status(403).json({
        error: "Za to dejanje nimaš dovoljenja.",
      });
    }

    return next();
  };
}

app.get("/api/auth/me", zahtevajPrijavo, (req, res) => {
  res.set("Cache-Control", "no-store");
  return res.json({ uporabnik: req.uporabnik });
});

app.post("/api/auth/logout", (req, res, next) => {
  if (req.get("Origin") !== frontendUrl) {
    return res.status(403).json({ error: "Nedovoljen izvor zahteve." });
  }

  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("eventtide.sid", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.sendStatus(204);
  });
});

app.listen(port, () => {
  console.log(`EventTide API: http://localhost:${port}`);
});
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

app.post(
  "/api/organizator/dogodki",
  zahtevajPrijavo,
  zahtevajVlogo("organizator"),
  async (req, res, next) => {
    if (req.get("Origin") !== frontendUrl) {
      return res.status(403).json({ error: "Nedovoljen izvor zahteve." });
    }

    const {
      naslov, opis, lokacija, kategorija_id,
      zacetek, konec, rok_prijave, kapaciteta,
    } = req.body ?? {};

    if (![naslov, opis, lokacija].every(
      (vrednost) => typeof vrednost === "string" && vrednost.trim(),
    )) {
      return res.status(400).json({ error: "Vnesi naslov, opis in lokacijo." });
    }

    if (![kategorija_id, kapaciteta].every(
      (vrednost) => Number.isInteger(vrednost) && vrednost > 0 && vrednost <= 2147483647,
    )) {
      return res.status(400).json({
        error: "Izberi kategorijo in vnesi pozitivno celo število mest.",
      });
    }

    const termini = [zacetek, konec, rok_prijave];

    if (!termini.every((vrednost) =>
      typeof vrednost === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(vrednost) &&
      Number.isFinite(Date.parse(vrednost)),
    )) {
      return res.status(400).json({ error: "Vnesi veljavne termine s časovnim pasom." });
    }

    if (Date.parse(konec) <= Date.parse(zacetek) ||
        Date.parse(rok_prijave) > Date.parse(zacetek)) {
      return res.status(400).json({
        error: "Konec mora biti po začetku, rok prijave pa najpozneje ob začetku.",
      });
    }

    try {
      const { rows } = await pool.query(
        `INSERT INTO dogodek (
           organizator_id, kategorija_id, naslov, opis, lokacija,
           zacetek, konec, rok_prijave, kapaciteta
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, naslov, status`,
        [
          req.uporabnik.id, kategorija_id, naslov.trim(), opis.trim(),
          lokacija.trim(), zacetek, konec, rok_prijave, kapaciteta,
        ],
      );

      return res.status(201).json({ dogodek: rows[0] });
    } catch (error) {
      if (error.code === "23503" && error.constraint === "dogodek_kategorija_id_fkey") {
        return res.status(400).json({ error: "Izbrana kategorija ne obstaja." });
      }
      if (["22007", "22008", "23514"].includes(error.code)) {
        return res.status(400).json({ error: "Preveri termine in kapaciteto." });
      }
      return next(error);
    }
  },
);

app.get(
  "/api/organizator/dogodki",
  zahtevajPrijavo,
  zahtevajVlogo("organizator"),
  async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT id, naslov, opis, lokacija, kategorija_id, kapaciteta,
                zacetek, konec, rok_prijave, status
         FROM dogodek
         WHERE organizator_id = $1
         ORDER BY zacetek ASC, id ASC`,
        [req.uporabnik.id],
      );

      return res.json({ dogodki: rows });
    } catch (error) {
      console.error("Branje dogodkov ni uspelo:", error.code ?? error.name);
      return res.status(500).json({ error: "Dogodkov trenutno ni mogoče prikazati." });
    }
  },
);

app.get("/api/kategorije", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, naziv FROM kategorija ORDER BY naziv ASC",
    );

    return res.json({ kategorije: rows });
  } catch (error) {
    console.error("Branje kategorij ni uspelo:", error.code ?? error.name);
    return res.status(500).json({ error: "Kategorij trenutno ni mogoče prikazati." });
  }
});

app.post(
  "/api/organizator/dogodki/:id/objavi",
  zahtevajPrijavo,
  zahtevajVlogo("organizator"),
  async (req, res) => {
    if (req.get("Origin") !== frontendUrl) {
      return res.status(403).json({ error: "Nedovoljen izvor zahteve." });
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
      return res.status(400).json({ error: "Neveljaven ID dogodka." });
    }

    try {
      const { rows } = await pool.query(
        `UPDATE dogodek
         SET status = 'objavljen'
         WHERE id = $1 AND organizator_id = $2 AND status = 'osnutek'
         RETURNING id, naslov, status`,
        [id, req.uporabnik.id],
      );

      if (rows.length > 0) {
        return res.json({ dogodek: rows[0] });
      }

      const { rowCount } = await pool.query(
        "SELECT 1 FROM dogodek WHERE id = $1 AND organizator_id = $2",
        [id, req.uporabnik.id],
      );

      if (rowCount === 0) {
        return res.status(404).json({ error: "Dogodek ni najden." });
      }

      return res.status(409).json({ error: "Objaviš lahko samo osnutek." });
    } catch (error) {
      console.error("Objava dogodka ni uspela:", error.code ?? error.name);
      return res.status(500).json({ error: "Objava dogodka trenutno ni mogoča." });
    }
  },
);

app.patch(
  "/api/organizator/dogodki/:id",
  zahtevajPrijavo,
  zahtevajVlogo("organizator"),
  async (req, res) => {
    if (req.get("Origin") !== frontendUrl) {
      return res.status(403).json({ error: "Nedovoljen izvor zahteve." });
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
      return res.status(400).json({ error: "Neveljaven ID dogodka." });
    }

    const besedila = ["naslov", "opis", "lokacija"];
    const stevila = ["kategorija_id", "kapaciteta"];
    const datumi = ["zacetek", "konec", "rok_prijave"];
    const dovoljenaPolja = new Set([...besedila, ...stevila, ...datumi]);
    const zaklenjenaPolja = new Set(["kapaciteta", ...datumi]);

    const telo = req.body;
    if (!telo || typeof telo !== "object" || Array.isArray(telo)) {
      return res.status(400).json({ error: "Pošlji podatke dogodka." });
    }

    const polja = Object.keys(telo);
    if (polja.length === 0 || polja.some((polje) => !dovoljenaPolja.has(polje))) {
      return res.status(400).json({ error: "Neveljavna polja za urejanje." });
    }

    const vrednosti = [];
    const nastavitve = [];
    const datumISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;

    for (const polje of polja) {
      let vrednost = telo[polje];

      if (besedila.includes(polje)) {
        if (typeof vrednost !== "string" || !vrednost.trim()) {
          return res.status(400).json({ error: `Izpolni polje ${polje}.` });
        }
        vrednost = vrednost.trim();
      } else if (stevila.includes(polje)) {
        if (!Number.isInteger(vrednost) || vrednost < 1 || vrednost > 2147483647) {
          return res.status(400).json({ error: `Neveljavna vrednost za ${polje}.` });
        }
      } else if (
        typeof vrednost !== "string" ||
        !datumISO.test(vrednost) ||
        !Number.isFinite(Date.parse(vrednost))
      ) {
        return res.status(400).json({ error: `Neveljaven datum za ${polje}.` });
      }

      vrednosti.push(vrednost);
      nastavitve.push(`${polje} = $${vrednosti.length}`);
    }

    const samoOsnutek = polja.some((polje) => zaklenjenaPolja.has(polje));

    try {
      const { rows } = await pool.query(
        `UPDATE dogodek
         SET ${nastavitve.join(", ")}
         WHERE id = $${vrednosti.length + 1}
           AND organizator_id = $${vrednosti.length + 2}
           AND (
             status = 'osnutek'
             OR (status = 'objavljen' AND NOT $${vrednosti.length + 3}::boolean)
           )
         RETURNING id, naslov, opis, lokacija, kategorija_id, kapaciteta,
                   zacetek, konec, rok_prijave, status`,
        [...vrednosti, id, req.uporabnik.id, samoOsnutek],
      );

      if (rows.length > 0) {
        return res.json({ dogodek: rows[0] });
      }

      const obstaja = await pool.query(
        "SELECT 1 FROM dogodek WHERE id = $1 AND organizator_id = $2",
        [id, req.uporabnik.id],
      );

      if (obstaja.rowCount === 0) {
        return res.status(404).json({ error: "Dogodek ni najden." });
      }

      return res.status(409).json({
        error: "Teh polj v trenutnem statusu dogodka ni mogoče spremeniti.",
      });
    } catch (error) {
      if (error.code === "23503") {
        return res.status(400).json({ error: "Izbrana kategorija ne obstaja." });
      }

      if (["23514", "22007", "22008"].includes(error.code)) {
        return res.status(400).json({
          error: "Preveri termin in rok prijave. Konec mora biti po začetku, rok prijave pa najpozneje ob začetku.",
        });
      }

      console.error("Urejanje dogodka ni uspelo:", error.code ?? error.name);
      return res.status(500).json({ error: "Urejanje dogodka trenutno ni mogoče." });
    }
  },
);

app.get("/api/dogodki/:id", async (req, res) => {
  const { id } = req.params;
  if (!/^[1-9]\d*$/.test(id) || Number(id) > 2147483647) {
    return res.status(400).json({ error: "Neveljaven ID dogodka." });
  }

  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.naslov, d.opis, d.lokacija, d.zacetek, d.konec,
              d.rok_prijave, k.naziv AS kategorija,
              GREATEST(0, d.kapaciteta - (
                SELECT COUNT(*)::integer
                FROM prijava p
                WHERE p.dogodek_id = d.id AND p.status = 'potrjena'
              )) AS prosta_mesta
       FROM dogodek d
       JOIN kategorija k ON k.id = d.kategorija_id
       WHERE d.id = $1
         AND d.status = 'objavljen'
         AND d.vidnost = 'javen'
         AND d.zacetek > NOW()`,
      [Number(id)],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Dogodek ni najden." });
    }

    return res.json({ dogodek: rows[0] });
  } catch (error) {
    console.error("Branje podrobnosti dogodka ni uspelo:", error.code ?? error.name);
    return res.status(500).json({ error: "Dogodka trenutno ni mogoče prikazati." });
  }
});

app.get("/api/dogodki", async (req, res) => {
  const { iskanje, kategorija_id: kategorijaId, datum } = req.query;

  const pogoji = [
    "d.status = 'objavljen'",
    "d.vidnost = 'javen'",
    "d.zacetek > NOW()",
  ];
  const vrednosti = [];

  if (iskanje !== undefined) {
    if (typeof iskanje !== "string" || iskanje.length > 200) {
      return res.status(400).json({ error: "Neveljaven iskalni niz." });
    }

    const niz = iskanje.trim();
    if (niz) {
      vrednosti.push(niz);
      pogoji.push(`strpos(lower(d.naslov), lower($${vrednosti.length})) > 0`);
    }
  }

  if (kategorijaId !== undefined) {
    if (
      typeof kategorijaId !== "string" ||
      !/^[1-9]\d*$/.test(kategorijaId) ||
      Number(kategorijaId) > 2147483647
    ) {
      return res.status(400).json({ error: "Neveljavna kategorija." });
    }

    vrednosti.push(Number(kategorijaId));
    pogoji.push(`d.kategorija_id = $${vrednosti.length}`);
  }

  if (datum !== undefined) {
    if (typeof datum !== "string" || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(datum)) {
      return res.status(400).json({ error: "Datum mora biti v obliki LLLL-MM-DD." });
    }

    const preverjenDatum = new Date(`${datum}T00:00:00Z`);
    if (
      !Number.isFinite(preverjenDatum.getTime()) ||
      preverjenDatum.toISOString().slice(0, 10) !== datum
    ) {
      return res.status(400).json({ error: "Neveljaven datum." });
    }

    vrednosti.push(datum);
    pogoji.push(
      `(d.zacetek AT TIME ZONE 'Europe/Ljubljana')::date = $${vrednosti.length}::date`,
    );
  }

  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.naslov, d.lokacija, d.zacetek, d.kategorija_id,
              k.naziv AS kategorija,
              GREATEST(0, d.kapaciteta - (
                SELECT COUNT(*)::integer
                FROM prijava p
                WHERE p.dogodek_id = d.id AND p.status = 'potrjena'
              )) AS prosta_mesta
       FROM dogodek d
       JOIN kategorija k ON k.id = d.kategorija_id
       WHERE ${pogoji.join(" AND ")}
       ORDER BY d.zacetek ASC, d.id ASC`,
      vrednosti,
    );

    return res.json({ dogodki: rows });
  } catch (error) {
    console.error("Branje javnih dogodkov ni uspelo:", error.code ?? error.name);
    return res.status(500).json({ error: "Dogodkov trenutno ni mogoče prikazati." });
  }
});

app.post(
  "/api/dogodki/:id/prijava",
  zahtevajPrijavo,
  zahtevajVlogo("udeleženec"),
  async (req, res) => {
    if (req.get("Origin") !== frontendUrl) {
      return res.status(403).json({ error: "Nedovoljen izvor zahteve." });
    }

    const { id } = req.params;
    if (!/^[1-9]\d*$/.test(id) || Number(id) > 2147483647) {
      return res.status(400).json({ error: "Neveljaven ID dogodka." });
    }

    let povezava;

    try {
      povezava = await pool.connect();
      await povezava.query("BEGIN");

      const { rows: dogodki } = await povezava.query(
        `SELECT kapaciteta
         FROM dogodek
         WHERE id = $1 AND status = 'objavljen' AND vidnost = 'javen'
         FOR UPDATE`,
        [id],
      );

      if (dogodki.length === 0) {
        await povezava.query("ROLLBACK");
        return res.status(404).json({ error: "Dogodek ni najden." });
      }

      const { rows: [stanje] } = await povezava.query(
        `SELECT d.rok_prijave > statement_timestamp() AS prijave_odprte,
                (SELECT COUNT(*)::integer
                 FROM prijava p
                 WHERE p.dogodek_id = d.id AND p.status = 'potrjena') AS potrjene
         FROM dogodek d
         WHERE d.id = $1`,
        [id],
      );

      if (!stanje.prijave_odprte) {
        await povezava.query("ROLLBACK");
        return res.status(409).json({ error: "Rok za prijavo je potekel." });
      }

      const status = stanje.potrjene < dogodki[0].kapaciteta
        ? "potrjena"
        : "cakalna";

      const { rows: [prijava] } = await povezava.query(
        `INSERT INTO prijava (uporabnik_id, dogodek_id, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (uporabnik_id, dogodek_id) DO NOTHING
         RETURNING id, dogodek_id, status`,
        [req.uporabnik.id, id, status],
      );

      await povezava.query("COMMIT");

      if (!prijava) {
        return res.status(409).json({ error: "Na ta dogodek si se že prijavil." });
      }

      return res.status(201).json({ prijava });
    } catch (error) {
      if (povezava) {
        try {
          await povezava.query("ROLLBACK");
        } catch (napaka) {
          povezava.release(napaka);
          povezava = null;
        }
      }

      console.error("Prijava na dogodek ni uspela:", error.code ?? error.name);
      return res.status(500).json({ error: "Prijava trenutno ni mogoča." });
    } finally {
      povezava?.release();
    }
  },
);

app.listen(port, () => {
  console.log(`EventTide API: http://localhost:${port}`);
});
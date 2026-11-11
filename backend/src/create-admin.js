import "dotenv/config";
import bcrypt from "bcrypt";
import pg from "pg";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
const geslo = process.env.ADMIN_PASSWORD ?? "";

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
  throw new Error("V backend/.env nastavi veljaven ADMIN_EMAIL.");
}

if ([...geslo].length < 12 || Buffer.byteLength(geslo, "utf8") > 72) {
  throw new Error("ADMIN_PASSWORD mora imeti vsaj 12 znakov in največ 72 bajtov.");
}

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5433),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 3000,
});

try {
  await client.connect();

  const gesloHash = await bcrypt.hash(geslo, 12);
  const { rowCount } = await client.query(
    `INSERT INTO uporabnik (ime, email, geslo_hash, vloga)
     VALUES ($1, $2, $3, 'administrator')
     ON CONFLICT DO NOTHING`,
    ["Administrator", email, gesloHash],
  );

  if (rowCount === 1) {
    console.log("Administratorski račun je ustvarjen.");
  } else {
    const { rows } = await client.query(
      `SELECT vloga, aktiven FROM uporabnik WHERE lower(btrim(email)) = $1`,
      [email],
    );

    if (rows[0]?.vloga !== "administrator" || !rows[0].aktiven) {
      throw new Error("Ta e-pošta že pripada računu, ki ni aktiven administrator.");
    }

    console.log("Aktiven administratorski račun že obstaja. Geslo ni bilo spremenjeno.");
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
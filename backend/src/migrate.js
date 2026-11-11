import "dotenv/config";
import { readFile, readdir } from "node:fs/promises";
import pg from "pg";

const migrationsDir = new URL("../db/migrations/", import.meta.url);

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
  await client.query("BEGIN");

  // Prepreči, da bi dva procesa hkrati izvajala migracije.
  await client.query("SELECT pg_advisory_xact_lock(41756, 1)");

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const { rows } = await client.query("SELECT filename FROM schema_migrations");
  const applied = new Set(rows.map(({ filename }) => filename));

  const files = (await readdir(migrationsDir))
    .filter((filename) => /^\d{3}_[a-z0-9_]+\.sql$/.test(filename))
    .sort();

  const pending = files.filter((filename) => !applied.has(filename));

  for (const filename of pending) {
    const sql = await readFile(new URL(filename, migrationsDir), "utf8");
    await client.query(sql);
    await client.query(
      "INSERT INTO schema_migrations (filename) VALUES ($1)",
      [filename],
    );
  }

  await client.query("COMMIT");
  console.log(
    pending.length
      ? `Izvedene migracije: ${pending.join(", ")}`
      : "Ni novih migracij.",
  );
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(`Migracija ni uspela: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
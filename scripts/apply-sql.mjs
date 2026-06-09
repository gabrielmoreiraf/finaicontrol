// Aplica um arquivo .sql diretamente no Neon via driver HTTP.
// Uso: node scripts/apply-sql.mjs drizzle/0007_password_reset.sql
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnv(path) {
  try {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {}
}

loadEnv(".env.local");
loadEnv(".env");

const file = process.argv[2];
if (!file) {
  console.error("Informe o caminho do .sql");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const raw = readFileSync(file, "utf8");
const statements = raw
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

for (const [i, stmt] of statements.entries()) {
  console.log(`Executando statement ${i + 1}/${statements.length}...`);
  await sql.query(stmt);
}

console.log("OK: SQL aplicado com sucesso.");

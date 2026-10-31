// Crea y exporta el pool de conexiones a PostgreSQL usando la configuración validada
// de env.ts. Reutiliza hasta 10 conexiones y registra errores de conexión inactiva
// con un mensaje genérico que no expone detalles.

import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  max: 10,
});

// Si una conexión inactiva falla, avisar sin exponer detalles
pool.on("error", () => {
  console.error("Error inesperado en el pool de PostgreSQL");
});
// Carga el .env de la raíz y valida al arrancar que existan todas las variables
// obligatorias y que los puertos sean enteros. Si falta alguna, detiene la app
// indicando solo el nombre de la variable. Exporta la configuración tipada en `env`.
// Es el único archivo que lee process.env.

import { resolve } from "node:path";
import { config } from "dotenv";

// 1. Cargar el .env de la RAÍZ del proyecto
config({ path: resolve(__dirname, "../../../.env"), quiet: true });

// 2. Leer una variable obligatoria o detener la app
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable ${name} missing`);
  }
  return value;
}

// 3. Leer una variable que debe ser un número entero
function requiredInt(name: string): number {
  const num = Number(required(name));
  if (!Number.isInteger(num)) {
    throw new Error(`La variable ${name} debe ser un número entero`);
  }
  return num;
}

// 4. Configuración validada, lista para usar
export const env = {
  port: requiredInt("PORT"),
  db: {
    host: required("DB_HOST"),
    port: requiredInt("DB_PORT"),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    name: required("DB_NAME"),
  },
  keys: {
    encryption: required("ENCRYPTION_KEY"),
    hmac: required("HMAC_KEY"),
  },
};
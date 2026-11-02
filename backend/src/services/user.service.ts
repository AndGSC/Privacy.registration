import { pool } from "../config/db";
import { env } from "../config/env";
import { logEvent } from "./audit.service";
import { maskEmail, maskName, maskPhone } from "./masking.service";
import type { RegisterUserInput, UserInternal, UserPublic } from "../models/user";


/**
 * Inserta un usuario nuevo en las 3 tablas dentro de una transacción:
 * o se guardan todas las filas, o no se guarda ninguna.
 * Devuelve solo el id y la fecha de creación.
 */

async function insertUserRows(
  fullName: string, email: string, phone: string | null, password: string,
): Promise<{ id: string; createdAt: Date }> {

    // Conexión dedicada: todas las consultas de la transacción deben usar la misma
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

// 1. Identidad base. El consentimiento se registra con la hora del servidor

    const result = await client.query(
      "INSERT INTO users (consent_at) VALUES (now()) RETURNING id, created_at",
    );
    const row = result.rows[0];
    if (!row) throw new Error("INSERT_FAILED");

    // 2. Datos personales cifrados con ENCRYPTION_KEY ($5).
    //    email_lookup es el índice ciego: HMAC del correo con HMAC_KEY ($6),
    //    permite buscar el correo y evitar duplicados sin descifrarlo.
    //    Si phone es null, pgp_sym_encrypt devuelve NULL (teléfono opcional).

    await client.query(
      `INSERT INTO user_pii (user_id, full_name_enc, email_enc, email_lookup, phone_enc)
       VALUES ($1, pgp_sym_encrypt($2, $5), pgp_sym_encrypt($3, $5),
               hmac($3, $6, 'sha256'), pgp_sym_encrypt($4, $5))`,
      [row.id, fullName, email, phone, env.keys.encryption, env.keys.hmac],
    );


    // 3. Contraseña con hash bcrypt (costo 12) y salt aleatorio.
    await client.query(
      `INSERT INTO user_credentials (user_id, password_hash)
       VALUES ($1, crypt($2, gen_salt('bf', 12)))`,
      [row.id, password],
    );

    await client.query("COMMIT");
    return { id: row.id, createdAt: row.created_at };
  } catch (err) {
    // Cualquier fallo deshace todo: no quedan usuarios a medias
    await client.query("ROLLBACK");
    if ((err as { code?: string }).code === "23505") {
      throw new Error("EMAIL_ALREADY_REGISTERED");
    }
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Registra un usuario aplicando las reglas del negocio:
 * consentimiento obligatorio, normalización del correo, guardado protegido,
 * auditoría del evento y respuesta solo con datos enmascarados.
 */
// Reglas del registro
export async function registerUser(input: RegisterUserInput): Promise<UserPublic> {
  if (input.consent !== true) throw new Error("CONSENT_REQUIRED");

    // Normalizar evita que "Ana@Mail.com " y "ana@mail.com" cuenten como correos distintos
  const email = input.email.trim().toLowerCase();
  const phone = input.phone ?? null;

  const created = await insertUserRows(input.fullName, email, phone, input.password);

  // Se audita después del COMMIT: antes, el usuario aún no existe
  // para otras conexiones y la llave foránea de audit_log fallaría
  await logEvent("USER_REGISTERED", created.id, null);

  // Regla #7: la respuesta solo contiene datos enmascarados (UserPublic)
  return {
    id: created.id,
    fullNameMasked: maskName(input.fullName),
    emailMasked: maskEmail(email),
    phoneMasked: phone ? maskPhone(phone) : null,
    createdAt: created.createdAt.toISOString(),
  };
}


// Formato válido de un UUID
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Convierte un usuario interno (descifrado) en su versión pública (enmascarada)
function toPublic(user: UserInternal): UserPublic {
  return {
    id: user.id,
    fullNameMasked: maskName(user.fullName),
    emailMasked: maskEmail(user.email),
    phoneMasked: user.phone ? maskPhone(user.phone) : null,
    createdAt: user.createdAt.toISOString(),
  };
}

// Devuelve el usuario enmascarado, o null si no existe o está inactivo
export async function getUserById(id: string): Promise<UserPublic | null> {
  if (!UUID_REGEX.test(id)) return null;

  const result = await pool.query(
    `SELECT u.id, u.created_at, u.is_active,
            pgp_sym_decrypt(p.full_name_enc, $2) AS full_name,
            pgp_sym_decrypt(p.email_enc, $2)     AS email,
            pgp_sym_decrypt(p.phone_enc, $2)     AS phone
     FROM users u
     JOIN user_pii p ON p.user_id = u.id
     WHERE u.id = $1 AND u.is_active = true`,
    [id, env.keys.encryption],
  );

  const row = result.rows[0];
  if (!row) return null;

  const user: UserInternal = {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
    isActive: row.is_active,
  };

  await logEvent("USER_VIEWED", user.id, null);
  return toPublic(user);
}
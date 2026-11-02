import {pool} from "../config/db";
import {env} from "../config/env";


export type AuditAction = "USER_REGISTERED" | "USER_VIEWED" | "LOGIN_FAILED";

export async function logEvent (
    action: AuditAction,
    userId: string | null,
    details: Record<string, string> | null,
    ): Promise<void> {
        const detailsJson = details ? JSON.stringify(details) : null;
        await pool.query(
        `INSERT INTO audit_log (user_id, action, details_enc)
        VALUES ($1, $2, pgp_sym_encrypt($3, $4))`,
        [userId, action, detailsJson, env.keys.encryption],
  );
}
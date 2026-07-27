import crypto from "crypto";
import { env } from "../config/env";

/**
 * Cifrado simétrico AES-256-GCM para datos fiscales sensibles (BACK-34).
 *
 * Se usa para proteger el XML del CFDI en reposo. La llave se deriva de
 * `FINANZAS_ENCRYPTION_KEY` con scrypt para admitir cualquier longitud de
 * secreto. El formato de salida es `iv:authTag:cipherText` en hexadecimal,
 * de modo que descifrar no requiere almacenar metadatos adicionales.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recomendado para GCM

function getKey(): Buffer {
  // Derivación determinista: misma clave de entorno → misma llave de 32 bytes.
  return crypto.scryptSync(env.FINANZAS_ENCRYPTION_KEY, "control-escolar-finanzas", 32);
}

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error("Formato de dato cifrado inválido");
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}

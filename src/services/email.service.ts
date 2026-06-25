import { env } from "../config/env";

/**
 * Abstracción de envío de correo.
 *
 * En desarrollo no hay servidor SMTP configurado, por lo que los correos se
 * registran en consola. Esta función es el punto de integración para:
 *   - un proveedor real (Nodemailer / SES / Resend), o
 *   - un worker de cola (Redis/BullMQ) que procese los envíos en background
 *     (ver BACK-17 del plan).
 *
 * Mantener la firma estable permite cambiar la implementación sin tocar a los
 * servicios que la consumen.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export async function enviarCorreo(message: EmailMessage): Promise<void> {
  if (env.NODE_ENV === "production") {
    // TODO(BACK-17): encolar en Redis/BullMQ y procesar con un worker real.
    console.warn(
      `[email] Envío en producción no configurado. Destinatario: ${message.to}`
    );
    return;
  }

  console.info(
    `\n[email] ──────────────────────────────────────────\n` +
      `Para:    ${message.to}\n` +
      `Asunto:  ${message.subject}\n` +
      `${message.text}\n` +
      `────────────────────────────────────────────────\n`
  );
}

export function correoRecuperacion(token: string): Pick<EmailMessage, "subject" | "text"> {
  const url = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  return {
    subject: "Recuperación de contraseña — Control Escolar",
    text:
      `Recibimos una solicitud para restablecer tu contraseña.\n\n` +
      `Abre el siguiente enlace para crear una nueva (válido por 1 hora):\n${url}\n\n` +
      `Si no solicitaste este cambio, ignora este mensaje.`,
  };
}

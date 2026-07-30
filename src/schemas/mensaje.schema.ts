import { z } from "zod";

export const crearConversacionSchema = z.object({
  participanteId: z.string().uuid("ID de participante inválido"),
});

export const enviarMensajeSchema = z.object({
  contenido: z.string().min(1, "El mensaje no puede estar vacío").max(5000),
});

import { z } from "zod";

// ─── Colegiaturas ───

export const colegiaturaSchema = z.object({
  alumnoId: z.string().uuid("Alumno inválido"),
  cicloEscolarId: z.string().uuid("Ciclo inválido"),
  concepto: z.string().min(2, "Concepto requerido").default("Colegiatura"),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
  descuento: z.coerce.number().min(0).default(0),
  recargo: z.coerce.number().min(0).default(0),
  fechaVencimiento: z.coerce.date(),
});

export const colegiaturaUpdateSchema = colegiaturaSchema
  .omit({ alumnoId: true, cicloEscolarId: true })
  .partial()
  .extend({ estatus: z.enum(["PENDIENTE", "PARCIAL", "PAGADA", "VENCIDA", "CANCELADA"]).optional() });

// Generación masiva de cargos por ciclo (BACK-28). Aplica automáticamente las
// becas vigentes de cada alumno como descuento.
export const generarCargosSchema = z.object({
  cicloEscolarId: z.string().uuid("Ciclo inválido"),
  concepto: z.string().min(2).default("Colegiatura"),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
  fechaVencimiento: z.coerce.date(),
});

// ─── Pagos ───

export const pagoSchema = z.object({
  colegiaturaId: z.string().uuid("Colegiatura inválida"),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
  metodo: z.enum(["EFECTIVO", "TRANSFERENCIA", "TARJETA", "STRIPE"]).default("EFECTIVO"),
  referencia: z.string().optional().or(z.literal("")),
});

// ─── Becas ───

export const becaSchema = z.object({
  alumnoId: z.string().uuid("Alumno inválido"),
  tipo: z.enum(["ACADEMICA", "DEPORTIVA", "CONVENIO", "SOCIOECONOMICA"]).default("ACADEMICA"),
  porcentaje: z.coerce.number().min(0.01, "Mínimo 0.01%").max(100, "Máximo 100%"),
  descripcion: z.string().optional().or(z.literal("")),
  vigenciaInicio: z.coerce.date(),
  vigenciaFin: z.coerce.date(),
});

export const becaUpdateSchema = becaSchema
  .omit({ alumnoId: true })
  .partial()
  .extend({ activa: z.boolean().optional() });

// ─── Descuentos (catálogo configurable) ───

export const descuentoSchema = z.object({
  concepto: z.string().min(2, "Concepto requerido"),
  tipo: z.enum(["PORCENTAJE", "MONTO"]).default("PORCENTAJE"),
  valor: z.coerce.number().positive("El valor debe ser mayor a 0"),
  descripcion: z.string().optional().or(z.literal("")),
  activo: z.boolean().default(true),
});

export const descuentoUpdateSchema = descuentoSchema.partial();

// ─── Facturación CFDI ───

export const facturaSchema = z.object({
  pagoId: z.string().uuid("Pago inválido"),
  rfcReceptor: z
    .string()
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i, "RFC inválido"),
  razonSocial: z.string().min(2, "Razón social requerida"),
  usoCfdi: z.string().min(2).default("G03"),
});

export type ColegiaturaInput = z.infer<typeof colegiaturaSchema>;
export type ColegiaturaUpdateInput = z.infer<typeof colegiaturaUpdateSchema>;
export type GenerarCargosInput = z.infer<typeof generarCargosSchema>;
export type PagoInput = z.infer<typeof pagoSchema>;
export type BecaInput = z.infer<typeof becaSchema>;
export type BecaUpdateInput = z.infer<typeof becaUpdateSchema>;
export type DescuentoInput = z.infer<typeof descuentoSchema>;
export type DescuentoUpdateInput = z.infer<typeof descuentoUpdateSchema>;
export type FacturaInput = z.infer<typeof facturaSchema>;

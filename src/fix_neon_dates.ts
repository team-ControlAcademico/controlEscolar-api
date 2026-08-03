import { PrismaClient } from "@prisma/client";

const neonUrl = "postgresql://neondb_owner:npg_unEXwDSJo2L9@ep-falling-smoke-axdw0p3j.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: neonUrl,
    },
  },
});

function addYears(date: Date, years: number): Date {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
}

async function main() {
  console.log("Conectando a Neon DB para actualizar fechas a 2026...");

  // 1. Ciclos Escolares
  const ciclos = await prisma.cicloEscolar.findMany();
  for (const ciclo of ciclos) {
    let nuevoNombre = ciclo.nombre;
    if (nuevoNombre.includes("2024")) {
      nuevoNombre = nuevoNombre.replace("2024", "2026");
    }
    
    await prisma.cicloEscolar.update({
      where: { id: ciclo.id },
      data: {
        nombre: nuevoNombre,
        fechaInicio: addYears(ciclo.fechaInicio, 2),
        fechaFin: addYears(ciclo.fechaFin, 2),
      },
    });
  }
  console.log(`Actualizados ${ciclos.length} ciclos escolares a 2026.`);

  // 2. Colegiaturas
  const colegiaturas = await prisma.colegiatura.findMany();
  let colegiaturasUpdated = 0;
  for (const col of colegiaturas) {
    let nuevoConcepto = col.concepto;
    if (nuevoConcepto.includes("2024")) {
      nuevoConcepto = nuevoConcepto.replace("2024", "2026");
    }

    await prisma.colegiatura.update({
      where: { id: col.id },
      data: {
        concepto: nuevoConcepto,
        fechaVencimiento: addYears(col.fechaVencimiento, 2),
      },
    });
    colegiaturasUpdated++;
  }
  console.log(`Actualizadas ${colegiaturasUpdated} colegiaturas a 2026.`);

  // 3. Becas
  const becas = await prisma.beca.findMany();
  for (const beca of becas) {
    await prisma.beca.update({
      where: { id: beca.id },
      data: {
        vigenciaInicio: addYears(beca.vigenciaInicio, 2),
        vigenciaFin: addYears(beca.vigenciaFin, 2),
      },
    });
  }
  console.log(`Actualizadas ${becas.length} becas a 2026.`);

  // 4. Asistencias
  const asistencias = await prisma.asistencia.findMany();
  for (const asis of asistencias) {
    if (asis.fecha.getFullYear() === 2024) {
      await prisma.asistencia.update({
        where: { id: asis.id },
        data: {
          fecha: addYears(asis.fecha, 2),
        },
      });
    }
  }
  console.log(`Actualizadas ${asistencias.length} asistencias a 2026.`);

  console.log("¡Toda la base de datos ha sido migrada de 2024 a 2026 exitosamente!");
}

main()
  .catch((e) => {
    console.error("Error al actualizar Neon DB:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

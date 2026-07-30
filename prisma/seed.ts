/**
 * SEED DE DESARROLLO — SOLO PARA ENTORNOS LOCALES
 *
 * Las credenciales aquí contenidas son exclusivamente para pruebas
 * de desarrollo local. NUNCA ejecutar este seed en producción.
 * Las contraseñas están en CREDENTIALS.md (compartido con el equipo).
 */
import { PrismaClient, Prisma, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // ─── USUARIOS ───
  const users = [
    { email: "admin@universidad.mx", password: "Admin123!", role: "ADMIN" as Role, nombre: "Administrador General", curp: "ADMG800101HDFRNN09" },
    { email: "escolar@universidad.mx", password: "Escolar123!", role: "ESCOLAR" as Role, nombre: "Control Escolar", curp: "ESCO800202HDFRNN01" },
    { email: "finanzas@universidad.mx", password: "Finanzas123!", role: "ADMINISTRATIVO" as Role, nombre: "Finanzas U", curp: "FINA800303HDFRNN02", departamento: "Finanzas" },
    { email: "docente@universidad.mx", password: "Docente123!", role: "DOCENTE" as Role, nombre: "Profesor Juan", curp: "DOCE800404HDFRNN03", especialidad: "Matemáticas", gradoAcademico: "Doctorado" },
    { email: "docente2@universidad.mx", password: "Docente123!", role: "DOCENTE" as Role, nombre: "Profesora María", curp: "DOCE800505HDFRNN04", especialidad: "Programación", gradoAcademico: "Maestría" },
    { email: "alumno@universidad.mx", password: "Alumno123!", role: "ALUMNO" as Role, nombre: "Alumno Demo", curp: "ALUM800505HDFRNN04", matricula: "20240001", semestre: 3 },
    { email: "alumno2@universidad.mx", password: "Alumno123!", role: "ALUMNO" as Role, nombre: "Ana López", curp: "ALUM800606HDFRNN05", matricula: "20240002", semestre: 3 },
    { email: "alumno3@universidad.mx", password: "Alumno123!", role: "ALUMNO" as Role, nombre: "Carlos Ruiz", curp: "ALUM800707HDFRNN06", matricula: "20240003", semestre: 1 },
    { email: "alumno4@universidad.mx", password: "Alumno123!", role: "ALUMNO" as Role, nombre: "Diana Martinez", curp: "ALUM800808HDFRNN07", matricula: "20240004", semestre: 3 },
    { email: "alumno5@universidad.mx", password: "Alumno123!", role: "ALUMNO" as Role, nombre: "Eduardo Garcia", curp: "ALUM800909HDFRNN08", matricula: "20240005", semestre: 3 },
    { email: "alumno6@universidad.mx", password: "Alumno123!", role: "ALUMNO" as Role, nombre: "Fernanda Gomez", curp: "ALUM801010HDFRNN09", matricula: "20240006", semestre: 3 },
    { email: "alumno7@universidad.mx", password: "Alumno123!", role: "ALUMNO" as Role, nombre: "Gerardo Perez", curp: "ALUM801111HDFRNN10", matricula: "20240007", semestre: 3 },
    { email: "alumno8@universidad.mx", password: "Alumno123!", role: "ALUMNO" as Role, nombre: "Hugo Sanchez", curp: "ALUM801212HDFRNN11", matricula: "20240008", semestre: 3 },
    { email: "padre@universidad.mx", password: "Padre123!", role: "PADRE" as Role, nombre: "Padre Demo", curp: "PADR800606HDFRNN05" },
  ];

  const createdUsers: Record<string, string> = {};

  for (const u of users) {
    const { password, role, nombre, curp, ...rest } = u;
    const extra = u as any;

    const existing = await prisma.user.findUnique({ where: { email: rest.email } });
    if (existing) {
      createdUsers[rest.email] = existing.id;
      console.log(`  Usuario ${rest.email} ya existe, saltando...`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email: rest.email, password: hashedPassword, role },
    });
    createdUsers[rest.email] = user.id;

    const profileBase = { nombre, curp: curp || null };
    switch (role) {
      case "ADMIN":
        await prisma.adminProfile.create({ data: { ...profileBase, userId: user.id } });
        break;
      case "ESCOLAR":
        await prisma.escolarProfile.create({ data: { ...profileBase, userId: user.id } });
        break;
      case "ADMINISTRATIVO":
        await prisma.administrativoProfile.create({ data: { ...profileBase, departamento: extra.departamento || null, userId: user.id } });
        break;
      case "DOCENTE":
        await prisma.docenteProfile.create({
          data: { ...profileBase, especialidad: extra.especialidad || null, gradoAcademico: extra.gradoAcademico || null, userId: user.id },
        });
        break;
      case "ALUMNO":
        await prisma.alumnoProfile.create({ data: { ...profileBase, matricula: extra.matricula, semestre: extra.semestre ?? 1, userId: user.id } });
        break;
      case "PADRE":
        await prisma.padreProfile.create({ data: { ...profileBase, userId: user.id } });
        break;
    }

    console.log(`  Usuario ${rest.email} (${role}) creado.`);
  }

  // ─── CARRERAS ───
  const carreraIng = await prisma.carrera.upsert({
    where: { clave: "ISW" },
    update: {},
    create: {
      clave: "ISW",
      nombre: "Ingeniería de Software",
      descripcion: "Formación integral en desarrollo de software, bases de datos, redes y gestión de proyectos tecnológicos.",
      creditosTotales: 350,
      duracionSemestres: 8,
    },
  });
  console.log(`  Carrera: ${carreraIng.nombre}`);

  const carreraAdm = await prisma.carrera.upsert({
    where: { clave: "ADM" },
    update: {},
    create: {
      clave: "ADM",
      nombre: "Administración de Empresas",
      descripcion: "Formación en gestión empresarial, finanzas, marketing y recursos humanos.",
      creditosTotales: 340,
      duracionSemestres: 8,
    },
  });
  console.log(`  Carrera: ${carreraAdm.nombre}`);

  // ─── MATERIAS ───
  const materiasData = [
    { clave: "MAT-101", nombre: "Matemáticas I", creditos: 8, tipo: "OBLIGATORIA" },
    { clave: "PRG-101", nombre: "Programación I", creditos: 10, tipo: "OBLIGATORIA" },
    { clave: "BDD-201", nombre: "Bases de Datos", creditos: 8, tipo: "OBLIGATORIA" },
    { clave: "RED-301", nombre: "Redes de Computadoras", creditos: 8, tipo: "OBLIGATORIA" },
    { clave: "PRG-201", nombre: "Programación II", creditos: 10, tipo: "OBLIGATORIA" },
    { clave: "ADM-101", nombre: "Introducción a la Administración", creditos: 6, tipo: "OBLIGATORIA" },
    { clave: "ETC-401", nombre: "Ética Profesional", creditos: 4, tipo: "OBLIGATORIA" },
    { clave: "ING-101", nombre: "Inglés I", creditos: 4, tipo: "OBLIGATORIA" },
  ];

  const materias: Record<string, any> = {};
  for (const m of materiasData) {
    const materia = await prisma.materia.upsert({
      where: { clave: m.clave },
      update: {},
      create: m,
    });
    materias[m.clave] = materia;
  }
  console.log(`  Materias: ${materiasData.length}`);

  // ─── PLAN DE ESTUDIO ISW ───
  const planISW = await prisma.planEstudio.upsert({
    where: { clave: "PLAN-ISW-2024" },
    update: {},
    create: {
      clave: "PLAN-ISW-2024",
      nombre: "Plan ISW 2024",
      carreraId: carreraIng.id,
    },
  });

  const planMateriasISW = [
    { materiaId: materias["MAT-101"].id, semestre: 1 },
    { materiaId: materias["PRG-101"].id, semestre: 1 },
    { materiaId: materias["ING-101"].id, semestre: 1 },
    { materiaId: materias["PRG-201"].id, semestre: 2 },
    { materiaId: materias["BDD-201"].id, semestre: 3 },
    { materiaId: materias["RED-301"].id, semestre: 4 },
    { materiaId: materias["ETC-401"].id, semestre: 5 },
  ];
  for (const pm of planMateriasISW) {
    await prisma.planMateria.upsert({
      where: { planId_materiaId: { planId: planISW.id, materiaId: pm.materiaId } },
      update: {},
      create: { planId: planISW.id, ...pm },
    });
  }
  console.log("  Plan ISW 2024 con materias por semestre");

  // ─── PLAN ADM ───
  const planADM = await prisma.planEstudio.upsert({
    where: { clave: "PLAN-ADM-2024" },
    update: {},
    create: {
      clave: "PLAN-ADM-2024",
      nombre: "Plan ADM 2024",
      carreraId: carreraAdm.id,
    },
  });

  await prisma.planMateria.upsert({
    where: { planId_materiaId: { planId: planADM.id, materiaId: materias["ADM-101"].id } },
    update: {},
    create: { planId: planADM.id, materiaId: materias["ADM-101"].id, semestre: 1 },
  });
  await prisma.planMateria.upsert({
    where: { planId_materiaId: { planId: planADM.id, materiaId: materias["ING-101"].id } },
    update: {},
    create: { planId: planADM.id, materiaId: materias["ING-101"].id, semestre: 1 },
  });

  // ─── CICLO ESCOLAR ───
  const ciclo = await prisma.cicloEscolar.upsert({
    where: { id: "seed-ciclo-1" },
    update: {},
    create: {
      id: "seed-ciclo-1",
      nombre: "Enero-Abril 2024",
      fechaInicio: new Date("2024-01-08"),
      fechaFin: new Date("2024-04-26"),
      tipo: "CUATRIMESTRAL",
      activo: true,
    },
  });
  console.log(`  Ciclo: ${ciclo.nombre}`);

  // ─── DOCENTES ───
  const docentes = await prisma.docenteProfile.findMany({ take: 2 });
  const [docJuan, docMaria] = docentes;

  // ─── GRUPOS ───
  const grupoBase = { cicloEscolarId: ciclo.id };

  const g1 = await prisma.grupo.upsert({
    where: { clave: "PRG101-G1" },
    update: {},
    create: {
      clave: "PRG101-G1",
      materiaId: materias["PRG-101"].id,
      docenteId: docJuan.id,
      aula: "Lab-101",
      cupoMaximo: 25,
      ...grupoBase,
    },
  });

  const g2 = await prisma.grupo.upsert({
    where: { clave: "MAT101-G1" },
    update: {},
    create: {
      clave: "MAT101-G1",
      materiaId: materias["MAT-101"].id,
      docenteId: docMaria.id,
      aula: "A-201",
      cupoMaximo: 30,
      ...grupoBase,
    },
  });

  await prisma.horario.createMany({
    data: [
      { grupoId: g1.id, dia: "LUNES", horaInicio: "07:00", horaFin: "09:00", aula: "Lab-101" },
      { grupoId: g1.id, dia: "MIERCOLES", horaInicio: "07:00", horaFin: "09:00", aula: "Lab-101" },
      { grupoId: g2.id, dia: "MARTES", horaInicio: "09:00", horaFin: "11:00", aula: "A-201" },
      { grupoId: g2.id, dia: "JUEVES", horaInicio: "09:00", horaFin: "11:00", aula: "A-201" },
    ],
    skipDuplicates: true,
  });

  // ─── INSCRIBIR ALUMNOS ───
  const alumnos = await prisma.alumnoProfile.findMany({ take: 8 });
  for (const alumno of alumnos) {
    await prisma.inscripcion.upsert({
      where: { alumnoId_grupoId: { alumnoId: alumno.id, grupoId: g1.id } },
      update: {},
      create: { alumnoId: alumno.id, grupoId: g1.id, estatus: "INSCRITO" },
    }).catch(() => {});
    
    await prisma.inscripcion.upsert({
      where: { alumnoId_grupoId: { alumnoId: alumno.id, grupoId: g2.id } },
      update: {},
      create: { alumnoId: alumno.id, grupoId: g2.id, estatus: "INSCRITO" },
    }).catch(() => {});
  }

  // ─── ACTUALIZAR CARRERA DE ALUMNOS ───
  for (const alumno of alumnos) {
    await prisma.alumnoProfile.update({ where: { id: alumno.id }, data: { carreraId: carreraIng.id } }).catch(() => {});
  }

  // ─── FASE 3: ASISTENCIAS DE EJEMPLO ───
  console.log("  Generando asistencias de ejemplo...");
  const asistenciaFechas = [
    new Date("2024-01-08"),
    new Date("2024-01-10"),
    new Date("2024-01-15"),
    new Date("2024-01-17"),
    new Date("2024-01-22"),
    new Date("2024-01-24"),
    new Date("2024-01-29"),
    new Date("2024-01-31"),
  ];

  for (const alumno of alumnos) {
    for (const fecha of asistenciaFechas) {
      // Simular ~85% de asistencia
      const presente = Math.random() > 0.15;
      await prisma.asistencia.upsert({
        where: {
          alumnoId_grupoId_fecha: {
            alumnoId: alumno.id,
            grupoId: g1.id,
            fecha,
          },
        },
        update: {},
        create: {
          alumnoId: alumno.id,
          grupoId: g1.id,
          fecha,
          presente,
          justificacion: !presente && Math.random() > 0.5 ? "Justificación médica" : null,
        },
      });
    }
  }
  console.log(`  Asistencias creadas para ${alumnos.length} alumnos en ${asistenciaFechas.length} fechas`);

  // ─── FASE 3: CALIFICACIONES DE EJEMPLO ───
  console.log("  Generando calificaciones de ejemplo...");
  const calificacionesData = [
    { unidad: 1, tipo: "ORDINARIO" },
    { unidad: 2, tipo: "ORDINARIO" },
  ];

  for (const alumno of alumnos) {
    for (const cal of calificacionesData) {
      // Generar calificación entre 6.0 y 10.0
      const calificacion = Math.round((6 + Math.random() * 4) * 10) / 10;
      await prisma.calificacion.upsert({
        where: {
          alumnoId_grupoId_unidad_tipo: {
            alumnoId: alumno.id,
            grupoId: g1.id,
            unidad: cal.unidad,
            tipo: cal.tipo,
          },
        },
        update: {},
        create: {
          alumnoId: alumno.id,
          grupoId: g1.id,
          unidad: cal.unidad,
          tipo: cal.tipo,
          calificacion,
        },
      });
    }
  }
  console.log("  Calificaciones (unidad 1 y 2) creadas para alumnos inscritos");

  // ─── FASE 4: FINANZAS ───
  console.log("  Generando datos financieros de ejemplo...");

  // Descuento configurable de catálogo
  await prisma.descuento.upsert({
    where: { concepto: "Pronto pago" },
    update: {},
    create: {
      concepto: "Pronto pago",
      tipo: "PORCENTAJE",
      valor: new Prisma.Decimal(5),
      descripcion: "5% por pago antes de la fecha de vencimiento",
    },
  });

  // Beca académica vigente para el primer alumno (50%)
  const [alumnoBecado] = alumnos;
  if (alumnoBecado) {
    const yaTieneBeca = await prisma.beca.findFirst({ where: { alumnoId: alumnoBecado.id } });
    if (!yaTieneBeca) {
      await prisma.beca.create({
        data: {
          alumnoId: alumnoBecado.id,
          tipo: "ACADEMICA",
          porcentaje: new Prisma.Decimal(50),
          descripcion: "Beca de excelencia académica",
          vigenciaInicio: new Date("2024-01-01"),
          vigenciaFin: new Date("2024-12-31"),
        },
      });
    }
  }

  // Colegiatura del ciclo para cada alumno inscrito (aplicando beca si existe)
  const MONTO_COLEGIATURA = new Prisma.Decimal(3500);
  for (const alumno of alumnos) {
    const beca = await prisma.beca.findFirst({
      where: { alumnoId: alumno.id, activa: true },
      orderBy: { porcentaje: "desc" },
    });
    const descuento = beca
      ? MONTO_COLEGIATURA.times(beca.porcentaje).div(100).toDecimalPlaces(2)
      : new Prisma.Decimal(0);
    const total = MONTO_COLEGIATURA.minus(descuento);

    const colegiatura = await prisma.colegiatura.upsert({
      where: {
        alumnoId_cicloEscolarId_concepto: {
          alumnoId: alumno.id,
          cicloEscolarId: ciclo.id,
          concepto: "Colegiatura Enero-Abril 2024",
        },
      },
      update: {},
      create: {
        alumnoId: alumno.id,
        cicloEscolarId: ciclo.id,
        concepto: "Colegiatura Enero-Abril 2024",
        monto: MONTO_COLEGIATURA,
        descuento,
        recargo: new Prisma.Decimal(0),
        total,
        fechaVencimiento: new Date("2024-02-10"),
      },
    });

    // Los 3 primeros alumnos ya pagaron su colegiatura completa
    if (alumnos.indexOf(alumno) < 3 && colegiatura.estatus === "PENDIENTE") {
      await prisma.pago.create({
        data: {
          colegiaturaId: colegiatura.id,
          alumnoId: alumno.id,
          monto: total,
          metodo: "TRANSFERENCIA",
          referencia: `SEED-${alumno.matricula}`,
        },
      });
      await prisma.colegiatura.update({ where: { id: colegiatura.id }, data: { estatus: "PAGADA" } });
    }
  }
  console.log("  Descuento, beca, colegiaturas y pagos de ejemplo creados");

  // ─── FASE 5: COMUNICACIÓN ───
  console.log("  Generando datos de comunicación de ejemplo...");

  // Avisos de ejemplo
  const adminUserId = createdUsers["admin@universidad.mx"];
  const docenteUserId = createdUsers["docente@universidad.mx"];
  const alumnoUserId = createdUsers["alumno@universidad.mx"];

  if (adminUserId && docenteUserId && alumnoUserId) {
    // Aviso general del admin
    const avisoGeneral = await prisma.aviso.upsert({
      where: { id: "seed-aviso-1" },
      update: {},
      create: {
        id: "seed-aviso-1",
        titulo: "Bienvenidos al ciclo Enero-Abril 2024",
        contenido: "Les damos la bienvenida al nuevo ciclo escolar. Recuerden revisar sus horarios y estar pendientes de los avisos importantes. La administración está a su disposición para cualquier duda.",
        tipo: "GENERAL",
        rolesDestino: ["ALUMNO", "DOCENTE", "PADRE"],
        autorId: adminUserId,
      },
    });

    // Aviso académico del control escolar
    const escolarUserId = createdUsers["escolar@universidad.mx"];
    if (escolarUserId) {
      await prisma.aviso.upsert({
        where: { id: "seed-aviso-2" },
        update: {},
        create: {
          id: "seed-aviso-2",
          titulo: "Periodo de inscripciones extraordinarias",
          contenido: "Se abre el periodo de inscripciones extraordinarias del 15 al 20 de enero. Acudir a control escolar con su comprobante de pago.",
          tipo: "ACADEMICO",
          rolesDestino: ["ALUMNO"],
          fechaExpiracion: new Date("2024-01-20"),
          autorId: escolarUserId,
        },
      });
    }

    // Aviso urgente
    await prisma.aviso.upsert({
      where: { id: "seed-aviso-3" },
      update: {},
      create: {
        id: "seed-aviso-3",
        titulo: "Mantenimiento de servidores",
        contenido: "El próximo sábado 13 de enero se realizará mantenimiento a los servidores de 22:00 a 06:00. El sistema estará fuera de línea durante ese periodo.",
        tipo: "URGENTE",
        rolesDestino: ["ADMIN", "ESCOLAR", "ADMINISTRATIVO", "DOCENTE", "ALUMNO", "PADRE"],
        autorId: adminUserId,
      },
    });

    console.log("  3 avisos de ejemplo creados");

    // Conversaciones y mensajes de ejemplo
    const [p1DocAlum, p2DocAlum] = [docenteUserId, alumnoUserId].sort();
    const convDocAlum = await prisma.conversacion.upsert({
      where: {
        participante1Id_participante2Id: { participante1Id: p1DocAlum, participante2Id: p2DocAlum },
      },
      update: {},
      create: { participante1Id: p1DocAlum, participante2Id: p2DocAlum },
    });

    const mensajesDocAlum = [
      { remitenteId: docenteUserId, contenido: "Hola, recuerda entregar la tarea de Programación I antes del viernes." },
      { remitenteId: alumnoUserId, contenido: "Sí profesor, ya estoy trabajando en ella. ¿Puedo enviarla por correo?" },
      { remitenteId: docenteUserId, contenido: "Claro, envíala a mi correo institucional antes de las 23:59." },
    ];

    for (let i = 0; i < mensajesDocAlum.length; i++) {
      const m = mensajesDocAlum[i];
      await prisma.mensaje.create({
        data: {
          conversacionId: convDocAlum.id,
          remitenteId: m.remitenteId,
          contenido: m.contenido,
          createdAt: new Date(Date.now() - (mensajesDocAlum.length - i) * 60000), // separados por 1 min
        },
      }).catch(() => {}); // skip si ya existe
    }

    const [p1AdmAlum, p2AdmAlum] = [adminUserId, alumnoUserId].sort();
    const convAdmAlum = await prisma.conversacion.upsert({
      where: {
        participante1Id_participante2Id: { participante1Id: p1AdmAlum, participante2Id: p2AdmAlum },
      },
      update: {},
      create: { participante1Id: p1AdmAlum, participante2Id: p2AdmAlum },
    });

    await prisma.mensaje.create({
      data: {
        conversacionId: convAdmAlum.id,
        remitenteId: adminUserId,
        contenido: "Bienvenido al sistema. Si tienes alguna duda sobre el uso de la plataforma, no dudes en escribirme.",
      },
    }).catch(() => {});

    console.log("  2 conversaciones con mensajes de ejemplo creadas");
  }

  console.log("  Grupos, horarios, inscripciones, asistencias, calificaciones, finanzas y comunicación creados\nSeed completado.");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


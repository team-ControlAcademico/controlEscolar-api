/**
 * SEED DE DESARROLLO — SOLO PARA ENTORNOS LOCALES
 *
 * Las credenciales aquí contenidas son exclusivamente para pruebas
 * de desarrollo local. NUNCA ejecutar este seed en producción.
 * Las contraseñas están en CREDENTIALS.md (compartido con el equipo).
 */
import { PrismaClient, Role } from "@prisma/client";
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
  const alumnos = await prisma.alumnoProfile.findMany({ take: 3 });
  if (alumnos.length > 0) {
    await prisma.inscripcion.upsert({
      where: { alumnoId_grupoId: { alumnoId: alumnos[0].id, grupoId: g1.id } },
      update: {},
      create: { alumnoId: alumnos[0].id, grupoId: g1.id, estatus: "INSCRITO" },
    });
    await prisma.inscripcion.upsert({
      where: { alumnoId_grupoId: { alumnoId: alumnos[1]?.id, grupoId: g1.id } },
      update: {},
      create: { alumnoId: alumnos[1]?.id, grupoId: g1.id, estatus: "INSCRITO" },
    }).catch(() => {});
  }

  // ─── ACTUALIZAR CARRERA DE ALUMNOS ───
  if (alumnos.length > 0) {
    await prisma.alumnoProfile.update({ where: { id: alumnos[0].id }, data: { carreraId: carreraIng.id } }).catch(() => {});
  }

  console.log("  Grupos, horarios e inscripciones creados\nSeed completado.");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

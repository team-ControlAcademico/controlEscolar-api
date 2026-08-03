import { PrismaClient, Role } from "@prisma/client";
import { CrearUsuarioInput, ActualizarUsuarioInput } from "../schemas/usuario.schema";
import { AppError } from "../middlewares/error.middleware";
import { registerUser } from "./auth.service";

const prisma = new PrismaClient();

export async function listarUsuarios(params?: { role?: string; busqueda?: string; isActive?: boolean }) {
  const where: any = {};

  if (params?.role) {
    where.role = params.role as Role;
  }

  if (params?.isActive !== undefined) {
    where.isActive = params.isActive;
  }

  if (params?.busqueda) {
    const term = params.busqueda;
    where.OR = [
      { email: { contains: term, mode: "insensitive" } },
      { admin: { nombre: { contains: term, mode: "insensitive" } } },
      { escolar: { nombre: { contains: term, mode: "insensitive" } } },
      { administrativo: { nombre: { contains: term, mode: "insensitive" } } },
      { docente: { nombre: { contains: term, mode: "insensitive" } } },
      { alumno: { nombre: { contains: term, mode: "insensitive" } } },
      { padre: { nombre: { contains: term, mode: "insensitive" } } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      admin: true,
      escolar: true,
      administrativo: true,
      docente: true,
      alumno: true,
      padre: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
}

export async function obtenerUsuario(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      admin: true,
      escolar: true,
      administrativo: true,
      docente: true,
      alumno: true,
      padre: true,
    },
  });

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function crearUsuario(data: CrearUsuarioInput) {
  // Reutiliza la lógica de registro de authService
  return await registerUser(data as any);
}

export async function actualizarUsuario(id: string, data: ActualizarUsuarioInput) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      admin: true,
      escolar: true,
      administrativo: true,
      docente: true,
      alumno: true,
      padre: true,
    },
  });

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  // Actualizar datos base del User
  const updateUserData: any = {};
  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError("El correo electrónico ya está registrado por otro usuario", 409);
    }
    updateUserData.email = data.email;
  }
  if (data.isActive !== undefined) {
    updateUserData.isActive = data.isActive;
  }

  if (Object.keys(updateUserData).length > 0) {
    await prisma.user.update({
      where: { id },
      data: updateUserData,
    });
  }

  // Actualizar el perfil según el rol del usuario
  const profileData: any = {};
  if (data.nombre) profileData.nombre = data.nombre;
  if (data.curp !== undefined) profileData.curp = data.curp || null;

  switch (user.role) {
    case "ADMIN":
      if (user.admin && Object.keys(profileData).length > 0) {
        await prisma.adminProfile.update({ where: { id: user.admin.id }, data: profileData });
      }
      break;
    case "ESCOLAR":
      if (user.escolar && Object.keys(profileData).length > 0) {
        await prisma.escolarProfile.update({ where: { id: user.escolar.id }, data: profileData });
      }
      break;
    case "ADMINISTRATIVO":
      if (user.administrativo) {
        if (data.departamento !== undefined) profileData.departamento = data.departamento || null;
        if (Object.keys(profileData).length > 0) {
          await prisma.administrativoProfile.update({ where: { id: user.administrativo.id }, data: profileData });
        }
      }
      break;
    case "DOCENTE":
      if (user.docente) {
        if (data.especialidad !== undefined) profileData.especialidad = data.especialidad || null;
        if (data.gradoAcademico !== undefined) profileData.gradoAcademico = data.gradoAcademico || null;
        if (Object.keys(profileData).length > 0) {
          await prisma.docenteProfile.update({ where: { id: user.docente.id }, data: profileData });
        }
      }
      break;
    case "ALUMNO":
      if (user.alumno) {
        if (data.matricula) profileData.matricula = data.matricula;
        if (data.semestre) profileData.semestre = data.semestre;
        if (Object.keys(profileData).length > 0) {
          await prisma.alumnoProfile.update({ where: { id: user.alumno.id }, data: profileData });
        }
      }
      break;
    case "PADRE":
      if (user.padre && Object.keys(profileData).length > 0) {
        await prisma.padreProfile.update({ where: { id: user.padre.id }, data: profileData });
      }
      break;
  }

  return await obtenerUsuario(id);
}

export async function eliminarUsuario(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  await prisma.user.delete({ where: { id } });
}

export async function toggleActivar(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });

  return await obtenerUsuario(id);
}

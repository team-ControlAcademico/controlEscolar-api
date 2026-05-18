require('dotenv').config();
const { sequelize, User, Alumno, Maestro, Grupo, Materia, Padre } = require('../models');

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Database synced.');

  // Create superadmin
  await User.create({ name: 'Super Admin', email: 'superadmin@controlescolar.com', password: 'SuperAdmin2024!', rol: 'admin' });

  // Create admin
  await User.create({ name: 'Admin', email: 'admin@controlescolar.com', password: 'password', rol: 'admin' });

  // Create maestro user + maestro profile
  const maestroUser = await User.create({ name: 'Carlos Lopez', email: 'carlos.lopez@controlescolar.com', password: 'password', rol: 'maestro' });
  const maestro = await Maestro.create({ user_id: maestroUser.id, num_empleado: 'M001', nombre: 'Carlos', apellido_paterno: 'Lopez', apellido_materno: 'Garcia', especialidad: 'Matematicas', telefono: '5551234567', email: 'carlos.lopez@controlescolar.com' });

  // Create materias
  const mat1 = await Materia.create({ nombre: 'Matematicas I', codigo: 'MAT101', descripcion: 'Curso basico de matematicas', creditos: 5 });
  const mat2 = await Materia.create({ nombre: 'Español', codigo: 'ESP101', descripcion: 'Curso basico de lengua española', creditos: 5 });
  const mat3 = await Materia.create({ nombre: 'Historia', codigo: 'HIS101', descripcion: 'Historia de Mexico', creditos: 4 });

  // Associate maestro with materias
  await maestro.setMaterias([mat1, mat2]);

  // Create grupos
  const g1 = await Grupo.create({ nombre: '1ero A', grado: 1, seccion: 'A', aula: '101', capacidad: 40 });
  const g2 = await Grupo.create({ nombre: '2do B', grado: 2, seccion: 'B', aula: '202', capacidad: 35 });

  // Associate grupos with materias
  await g1.setMaterias([mat1, mat2, mat3]);
  await g2.setMaterias([mat1, mat3]);

  // Create alumno user + alumno profile
  const alumnoUser = await User.create({ name: 'Juan Perez', email: 'juan.perez@controlescolar.com', password: 'password', rol: 'alumno' });
  await Alumno.create({ user_id: alumnoUser.id, matricula: 'A001', nombre: 'Juan', apellido_paterno: 'Perez', apellido_materno: 'Lopez', fecha_nacimiento: '2005-03-15', genero: 'M', direccion: 'Calle Principal 123', telefono: '5559876543', email: 'juan.perez@controlescolar.com', grupo_id: g1.id });

  // Create padre user + padre profile
  const padreUser = await User.create({ name: 'Maria Lopez', email: 'maria.lopez@controlescolar.com', password: 'password', rol: 'padre' });
  await Padre.create({ user_id: padreUser.id, nombre: 'Maria', apellido_paterno: 'Lopez', apellido_materno: 'Sanchez', telefono: '5554567890', email: 'maria.lopez@controlescolar.com', direccion: 'Calle Principal 123', ocupacion: 'Ingeniera' });

  console.log('Seed completed!');
  console.log('Users created:');
  console.log('  SuperAdmin: superadmin@controlescolar.com / SuperAdmin2024!');
  console.log('  Admin:      admin@controlescolar.com / password');
  console.log('  Maestro:    carlos.lopez@controlescolar.com / password');
  console.log('  Alumno:     juan.perez@controlescolar.com / password');
  console.log('  Padre:      maria.lopez@controlescolar.com / password');

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

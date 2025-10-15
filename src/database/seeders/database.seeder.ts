import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { Post } from '../../entities/post.entity';

@Injectable()
export class DatabaseSeeder {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async seed(): Promise<void> {
    // Verificar si ya existen usuarios
    const existingUsers = await this.userRepository.count();
    if (existingUsers > 0) {
      console.log('La base de datos ya contiene usuarios. Saltando seeder.');
      return;
    }

    console.log('Iniciando seeder de base de datos...');

    // Crear usuarios de prueba
    const users = [
      {
        email: 'juan.perez@example.com',
        password: await bcrypt.hash('123456', 10),
        firstName: 'Juan',
        lastName: 'Pérez',
        alias: 'juanp',
        birthDate: new Date('1990-05-15'),
      },
      {
        email: 'maria.garcia@example.com',
        password: await bcrypt.hash('123456', 10),
        firstName: 'María',
        lastName: 'García',
        alias: 'mariag',
        birthDate: new Date('1988-08-22'),
      },
      {
        email: 'carlos.rodriguez@example.com',
        password: await bcrypt.hash('123456', 10),
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        alias: 'carlosr',
        birthDate: new Date('1992-12-03'),
      },
      {
        email: 'ana.martinez@example.com',
        password: await bcrypt.hash('123456', 10),
        firstName: 'Ana',
        lastName: 'Martínez',
        alias: 'anam',
        birthDate: new Date('1995-03-18'),
      },
      {
        email: 'luis.lopez@example.com',
        password: await bcrypt.hash('123456', 10),
        firstName: 'Luis',
        lastName: 'López',
        alias: 'luisl',
        birthDate: new Date('1987-11-07'),
      },
    ];

    const savedUsers: User[] = [];
    for (const userData of users) {
      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);
      savedUsers.push(savedUser);
      console.log(`Usuario creado: ${savedUser.alias}`);
    }

    // Crear publicaciones de prueba (una por usuario)
    const posts = [
      {
        message: '¡Hola a todos! Este es mi primer post en PeriConecta. Espero conocer gente nueva y compartir experiencias interesantes.',
        userId: savedUsers[0].id,
      },
      {
        message: 'Hermoso día para salir a caminar por el parque. La naturaleza siempre me inspira y me da energía positiva. 🌳☀️',
        userId: savedUsers[1].id,
      },
      {
        message: 'Acabo de terminar de leer un libro increíble sobre desarrollo personal. Las pequeñas acciones diarias realmente marcan la diferencia.',
        userId: savedUsers[2].id,
      },
      {
        message: 'Cocinando mi receta favorita de pasta. No hay nada como una buena comida casera para alegrar el día. ¿Cuál es su plato favorito?',
        userId: savedUsers[3].id,
      },
      {
        message: 'Reflexionando sobre los objetivos del año. Es importante pausar de vez en cuando y evaluar nuestro progreso. ¡Sigamos adelante!',
        userId: savedUsers[4].id,
      },
    ];

    for (const postData of posts) {
      const post = this.postRepository.create(postData);
      const savedPost = await this.postRepository.save(post);
      console.log(`Publicación creada para usuario ID ${savedPost.userId}`);
    }

    console.log('Seeder completado exitosamente!');
    console.log('Usuarios de prueba creados:');
    savedUsers.forEach(user => {
      console.log(`- ${user.alias} (${user.email}) - Contraseña: 123456`);
    });
  }
}
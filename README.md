# PeriConecta API

API REST para la red social PeriConecta desarrollada con NestJS, TypeORM y PostgreSQL.

## Características

- ✅ Autenticación JWT
- ✅ Gestión de usuarios y perfiles
- ✅ Publicaciones con sistema de likes
- ✅ Base de datos PostgreSQL
- ✅ Validación de datos
- ✅ Seeder automático con datos de prueba

## Requisitos

- Node.js 18+
- PostgreSQL 12+
- Docker (opcional)

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Configurar PostgreSQL (usando Docker):
```bash
docker-compose up -d
```

5. Ejecutar la aplicación:
```bash
npm run start:dev
```

## Variables de Entorno

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=admin123
DB_NAME=periconecta_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development
```

## Endpoints de la API

### Autenticación

#### POST /auth/register
Registrar un nuevo usuario.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "123456",
  "firstName": "Juan",
  "lastName": "Pérez",
  "alias": "juanp",
  "birthDate": "1990-05-15"
}
```

#### POST /auth/login
Iniciar sesión.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "123456"
}
```

### Usuarios

#### GET /users/profile
Obtener perfil del usuario autenticado.

#### GET /users/:id
Obtener perfil de usuario por ID.

#### GET /users/alias/:alias
Obtener perfil de usuario por alias.

### Publicaciones

#### GET /posts
Listar todas las publicaciones con información de likes.

#### POST /posts
Crear una nueva publicación.

#### GET /posts/:id
Obtener una publicación específica por ID.

#### POST /posts/:id/like
Dar like a una publicación.

#### DELETE /posts/:id/like
Quitar like de una publicación.

## Usuarios de Prueba

Al iniciar la aplicación, se crean automáticamente los siguientes usuarios de prueba:

| Alias | Email | Contraseña |
|-------|-------|------------|
| juanp | juan.perez@example.com | 123456 |
| mariag | maria.garcia@example.com | 123456 |
| carlosr | carlos.rodriguez@example.com | 123456 |
| anam | ana.martinez@example.com | 123456 |
| luisl | luis.lopez@example.com | 123456 |

Cada usuario tiene una publicación de ejemplo.

## Tecnologías Utilizadas

- **NestJS** - Framework de Node.js
- **TypeORM** - ORM para TypeScript
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **class-validator** - Validación de datos

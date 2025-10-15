-- Script SQL para poblar la base de datos PeriConecta
-- Basado en el seeder de TypeScript database.seeder.ts
-- Ejecutar este script después de crear las tablas

-- Limpiar datos existentes (opcional - descomenta si necesitas limpiar)
-- DELETE FROM likes;
-- DELETE FROM posts;
-- DELETE FROM users;
-- ALTER SEQUENCE users_id_seq RESTART WITH 1;
-- ALTER SEQUENCE posts_id_seq RESTART WITH 1;
-- ALTER SEQUENCE likes_id_seq RESTART WITH 1;

-- Insertar usuarios de prueba
-- Nota: Las contraseñas están hasheadas con bcrypt (salt rounds: 10) para '123456'
INSERT INTO users (email, password, "firstName", "lastName", alias, "birthDate", "createdAt", "updatedAt") VALUES
('juan.perez@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Juan', 'Pérez', 'juanp', '1990-05-15', NOW(), NOW()),
('maria.garcia@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'María', 'García', 'mariag', '1988-08-22', NOW(), NOW()),
('carlos.rodriguez@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos', 'Rodríguez', 'carlosr', '1992-12-03', NOW(), NOW()),
('ana.martinez@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ana', 'Martínez', 'anam', '1995-03-18', NOW(), NOW()),
('luis.lopez@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Luis', 'López', 'luisl', '1987-11-07', NOW(), NOW());

-- Insertar publicaciones de prueba (una por usuario)
-- Nota: Los userId corresponden a los IDs generados automáticamente (1-5)
INSERT INTO posts (content, "userId", "likesCount", "createdAt", "updatedAt") VALUES
('¡Hola a todos! Este es mi primer post en PeriConecta. Espero conocer gente nueva y compartir experiencias interesantes.', 1, 0, NOW(), NOW()),
('Hermoso día para salir a caminar por el parque. La naturaleza siempre me inspira y me da energía positiva. 🌳☀️', 2, 0, NOW(), NOW()),
('Acabo de terminar de leer un libro increíble sobre desarrollo personal. Las pequeñas acciones diarias realmente marcan la diferencia.', 3, 0, NOW(), NOW()),
('Cocinando mi receta favorita de pasta. No hay nada como una buena comida casera para alegrar el día. ¿Cuál es su plato favorito?', 4, 0, NOW(), NOW()),
('Reflexionando sobre los objetivos del año. Es importante pausar de vez en cuando y evaluar nuestro progreso. ¡Sigamos adelante!', 5, 0, NOW(), NOW());

-- Verificar los datos insertados
SELECT 'Usuarios creados:' as info;
SELECT id, email, alias, "firstName", "lastName" FROM users ORDER BY id;

SELECT 'Publicaciones creadas:' as info;
SELECT p.id, p.content, u.alias as autor FROM posts p 
JOIN users u ON p."userId" = u.id 
ORDER BY p.id;

-- Información adicional
SELECT 'Información de acceso:' as info;
SELECT 
    alias as "Alias",
    email as "Email",
    '123456' as "Contraseña"
FROM users 
ORDER BY id;

-- Estadísticas
SELECT 
    (SELECT COUNT(*) FROM users) as "Total Usuarios",
    (SELECT COUNT(*) FROM posts) as "Total Publicaciones",
    (SELECT COUNT(*) FROM likes) as "Total Likes";
# Paddle Match API - Backend

API REST para la aplicación Paddle Match, construida con NestJS, Prisma y PostgreSQL.

## Características Implementadas

### Autenticación y Usuarios
- ✅ Registro y login con JWT
- ✅ Refresh tokens
- ✅ Roles: SUPERADMIN, COURT_OWNER, PLAYER
- ✅ Perfiles de usuario con nivel de juego, preferencias, stats
- ✅ Búsqueda de jugadores por nivel, ciudad, zona

### Canchas (Courts)
- ✅ CRUD de canchas (solo Court Owners)
- ✅ Fotos, amenities, geolocalización
- ✅ Estadísticas de ocupación
- ✅ Búsqueda y filtros

### Turnos (TimeSlots)
- ✅ Creación de turnos disponibles
- ✅ Validación de overlapping
- ✅ Gestión de disponibilidad
- ✅ Filtros por cancha, fecha, disponibilidad

### Partidos (Matches)
- ✅ Creación de partidos
- ✅ Unirse/Salir de partidos
- ✅ Gestión de spots disponibles
- ✅ Filtros por nivel, fecha, ciudad, estado
- ✅ Cancelación (solo organizador)

### Sistema Social
- ✅ Sistema de amigos
- ✅ Enviar/Aceptar solicitudes de amistad
- ✅ Listar amigos

### En Desarrollo
- ⏳ Chat en tiempo real (Socket.io)
- ⏳ Sistema de notificaciones push
- ⏳ Sistema de ACK pre-partido
- ⏳ Sistema de scoring y penalizaciones
- ⏳ Modo "Quiero Jugar Ya"
- ⏳ Reviews entre jugadores

## Stack Tecnológico

- **Framework**: NestJS 11
- **Database**: PostgreSQL
- **ORM**: Prisma 5
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/paddle_match"

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Seed de base de datos
npm run prisma:seed
```

## Desarrollo

```bash
# Modo desarrollo con hot-reload
npm run start:dev

# Compilar
npm run build

# Producción
npm run start:prod
```

La API estará disponible en `http://localhost:3000`

## Documentación API

Swagger UI disponible en: `http://localhost:3000/api/docs`

## Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refrescar token
- `GET /api/auth/me` - Perfil del usuario actual

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/search` - Buscar jugadores
- `GET /api/users/me` - Mi perfil
- `PUT /api/users/me/profile` - Actualizar perfil
- `GET /api/users/me/stats` - Mis estadísticas

### Canchas
- `POST /api/courts` - Crear cancha (Court Owner)
- `GET /api/courts` - Listar canchas
- `GET /api/courts/my-courts` - Mis canchas
- `GET /api/courts/:id` - Detalle de cancha
- `PATCH /api/courts/:id` - Actualizar cancha
- `DELETE /api/courts/:id` - Eliminar cancha
- `GET /api/courts/:id/stats` - Estadísticas de cancha

### Turnos
- `POST /api/timeslots` - Crear turno (Court Owner)
- `GET /api/timeslots` - Listar turnos
- `GET /api/timeslots/:id` - Detalle de turno
- `DELETE /api/timeslots/:id` - Eliminar turno

### Partidos
- `POST /api/matches` - Crear partido
- `GET /api/matches` - Listar partidos disponibles
- `GET /api/matches/:id` - Detalle de partido
- `POST /api/matches/:id/join` - Unirse a partido
- `POST /api/matches/:id/leave` - Salir de partido
- `DELETE /api/matches/:id` - Cancelar partido (organizador)

### Amigos
- `POST /api/friends/request` - Enviar solicitud
- `POST /api/friends/:id/accept` - Aceptar solicitud
- `GET /api/friends` - Listar amigos

## Modelo de Datos

Ver `prisma/schema.prisma` para el schema completo.

Entidades principales:
- User (Usuario con roles)
- Profile (Perfil del jugador)
- Court (Cancha de pádel)
- TimeSlot (Turno disponible)
- Match (Partido)
- MatchPlayer (Relación partido-jugador)
- Friendship (Amistad)
- Review (Valoración)
- Notification (Notificación)
- ScoringHistory (Historial de puntuación)

## Scripts Disponibles

```bash
npm run start:dev      # Desarrollo
npm run build          # Compilar
npm run start:prod     # Producción
npm run lint           # Linter
npm run format         # Prettier
npm run prisma:generate # Generar Prisma Client
npm run prisma:migrate # Ejecutar migraciones
npm run prisma:studio  # Abrir Prisma Studio
```

## Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

Variables críticas:
- `DATABASE_URL` - URL de conexión a PostgreSQL
- `JWT_SECRET` - Secret para JWT tokens
- `JWT_REFRESH_SECRET` - Secret para refresh tokens
- `PORT` - Puerto del servidor (default: 3000)
- `CORS_ORIGIN` - Origen permitido para CORS

## Seguridad

- Contraseñas hasheadas con bcrypt
- JWT con refresh tokens
- Guards de autenticación y roles
- Validación de inputs con class-validator
- CORS configurado

## Próximos Pasos

1. Implementar Socket.io para chat y notificaciones en tiempo real
2. Sistema de ACK con cron jobs
3. Sistema de penalizaciones automáticas
4. Modo "Quiero Jugar Ya" con notificaciones push
5. Reviews y ratings entre jugadores
6. Tests unitarios y e2e
7. CI/CD pipeline

## Licencia

Privado - Todos los derechos reservados

# 🎾 Paddle Match App

Aplicación completa para organizar partidos de pádel con sistema de reservas, búsqueda de jugadores y gestión de canchas.

## 🚀 Características Principales

### Tipos de Usuario
- **Superadmin**: Administrador total de la aplicación
- **Dueño de Cancha**: Gestiona turnos y disponibilidad de canchas
- **Jugador**: Busca y organiza partidos

### Funcionalidades

#### Para Jugadores
- 🔍 **Búsqueda Pasiva**: Listado de turnos disponibles con filtros
- ⚡ **Modo "Quiero Jugar Ya"**: Notificaciones instantáneas cuando se libera un espacio
- 👥 **Sistema de Amigos**: Agrega amigos y ve partidos donde ya están inscritos
- 💬 **Chat en Tiempo Real**: Comunícate con los jugadores del partido
- ⭐ **Sistema de Scoring**: Rating basado en partidos jugados, puntualidad y comportamiento
- ✅ **ACK Pre-Partido**: Confirmación 2 horas antes del partido
- 🏆 **Niveles de Juego**: Filtra por nivel (Principiante, Intermedio, Avanzado, Profesional)
- 📊 **Historial**: Ve tus partidos jugados y con quién

#### Para Dueños de Canchas
- 📅 **Gestión de Turnos**: Cargar y eliminar disponibilidad
- 🏟️ **Administración de Canchas**: Múltiples canchas, precios, amenities
- 📈 **Estadísticas**: Ocupación y uso de las canchas

#### Sistema de Penalizaciones
- ⚠️ **Cancelaciones**: Penalización en el scoring
- 🚫 **No ACK**: Exclusión del partido si no se confirma a tiempo
- 📉 **Rating**: Impacta en la visibilidad en búsquedas

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Real-time**: Socket.io
- **Autenticación**: JWT + Refresh Tokens
- **Validación**: class-validator, class-transformer
- **Documentación**: Swagger

### Frontend Web
- **Framework**: React 18 + TypeScript
- **State Management**: Zustand
- **UI**: TailwindCSS + shadcn/ui
- **HTTP Client**: Axios + TanStack Query
- **Real-time**: Socket.io client
- **Routing**: React Router v6

### Mobile (Futuro)
- **Framework**: React Native + TypeScript
- **Notificaciones**: Firebase Cloud Messaging

## 📦 Estructura del Proyecto

```
paddle-match-app/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── auth/        # Autenticación y autorización
│   │   ├── users/       # Gestión de usuarios
│   │   ├── courts/      # Gestión de canchas
│   │   ├── timeslots/   # Gestión de turnos
│   │   ├── matches/     # Gestión de partidos
│   │   ├── chat/        # Chat en tiempo real
│   │   ├── notifications/ # Sistema de notificaciones
│   │   ├── friends/     # Sistema de amigos
│   │   ├── scoring/     # Sistema de puntuación
│   │   └── common/      # Utilidades comunes
│   ├── prisma/          # Schema y migraciones
│   └── test/            # Tests
├── frontend/            # Aplicación React
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/       # Páginas/Vistas
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API calls
│   │   ├── store/       # Estado global (Zustand)
│   │   └── utils/       # Utilidades
│   └── public/          # Assets estáticos
└── docs/                # Documentación

```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Instalación Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno en .env
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

### Instalación Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configurar variables de entorno en .env
npm run dev
```

## 📚 Documentación API

Una vez corriendo el backend, la documentación Swagger está disponible en:
```
http://localhost:3000/api/docs
```

## 🗄️ Modelo de Datos

### Entidades Principales
- **User**: Usuarios del sistema con roles y perfil
- **Court**: Canchas de pádel
- **TimeSlot**: Turnos disponibles en las canchas
- **Match**: Partidos organizados
- **ChatMessage**: Mensajes del chat por partido
- **Review**: Valoraciones entre jugadores
- **Notification**: Notificaciones del sistema
- **Friendship**: Relaciones de amistad

## 🔐 Seguridad

- Autenticación JWT con refresh tokens
- Bcrypt para hashing de contraseñas
- Rate limiting en endpoints críticos
- Validación de datos en todos los inputs
- CORS configurado
- Helmet para headers de seguridad

## 📱 Fases de Desarrollo

- [x] Fase 1: Estructura base y configuración
- [ ] Fase 2: Autenticación y usuarios
- [ ] Fase 3: Gestión de canchas y turnos
- [ ] Fase 4: Sistema de partidos
- [ ] Fase 5: Chat y notificaciones en tiempo real
- [ ] Fase 6: Sistema de amigos y scoring
- [ ] Fase 7: Frontend React
- [ ] Fase 8: Mobile React Native

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## 📄 Licencia

Este proyecto es privado y de uso exclusivo.

## 📧 Contacto

Para consultas sobre el proyecto, contactar al equipo de desarrollo.

---

**Hecho con ❤️ para la comunidad de pádel**

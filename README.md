# Komunidad - Plataforma de Gestión de Consorcios

![Komunidad](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Plataforma integral para la administración de consorcios que conecta administradores, propietarios, inquilinos y proveedores en un solo ecosistema digital.

## 🚀 Características Principales

### Para Administradores
- **Gestión Financiera Completa**: Liquidación de expensas, control de morosidad, conciliación bancaria
- **Comunicación Centralizada**: Avisos, votaciones, mensajería directa
- **Gestión de Proveedores**: Presupuestos, órdenes de trabajo, evaluaciones
- **Reportes y Analytics**: Dashboards personalizables, exportación de datos
- **Multi-Consorcio**: Gestión de múltiples edificios desde una sola cuenta

### Para Propietarios
- Acceso 24/7 a expensas digitales
- Participación en votaciones online
- Reserva de amenities
- Estado de cuenta en tiempo real
- Historial completo de pagos

### Para Inquilinos
- Información de expensas
- Avisos y comunicaciones
- Sistema de reclamos
- Acceso a información del edificio

### Para Proveedores
- Portal de presupuestos
- Gestión de órdenes de trabajo
- Seguimiento de trabajos
- Documentación digital

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Real-time**: Socket.io Client

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **Cache**: Redis
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **PDF Generation**: PDFKit

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database Admin**: pgAdmin 4

## 📋 Prerrequisitos

- Node.js 20+ y npm
- Docker y Docker Compose
- Git

## 🚦 Inicio Rápido

> **💡 Tip**: Para una guía detallada paso a paso, consulta [QUICKSTART.md](docs/QUICKSTART.md)

### Método 1: Script Helper (Recomendado) 🎯

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd admin_consorcios

# 2. Ejecutar helper script interactivo
./docker-helper.sh

# 3. Seleccionar opción 1 (Iniciar todo)
# El script se encarga de todo automáticamente
```

### Método 2: Docker Compose Manual

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd admin_consorcios

# 2. Aumentar timeout (importante)
export COMPOSE_HTTP_TIMEOUT=120

# 3. Iniciar servicios
docker-compose up -d

# 4. Si el frontend no inicia automáticamente
docker start komunidad-frontend

# 5. Verificar estado
docker ps
```

Los servicios estarán disponibles en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **pgAdmin**: http://localhost:5050 (opcional, usar profile: tools)

### 4. Desarrollo Local (Sin Docker)

#### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar base de datos
createdb komunidad
psql komunidad < migrations/001_initial_schema.sql

# Iniciar servidor de desarrollo
npm run dev
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 📚 Estructura del Proyecto

```
admin_consorcios/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   ├── utils/           # Utilities
│   │   └── styles/          # Global styles
│   └── public/              # Static assets
│
├── backend/                 # Express API
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # TypeScript interfaces
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic
│   ├── migrations/          # Database migrations
│   └── seeds/               # Database seeds
│
├── docs/                    # Documentation
├── docker-compose.yml       # Docker services
└── README.md               # This file
```

## 🔐 Usuarios por Defecto

### SuperAdmin
- **Email**: superadmin@komunidad.com
- **DNI**: 00000000
- **Password**: admin123

## 📖 API Documentation

### Authentication

```bash
# Login
POST /api/v1/auth/login
{
  "identifier": "dni/cuit/email",
  "password": "password"
}

# Register (Owner/Tenant)
POST /api/v1/auth/register
{
  "dni": "12345678",
  "email": "user@example.com",
  "password": "password",
  "first_name": "John",
  "last_name": "Doe",
  "role": "owner"
}

# Register Provider
POST /api/v1/auth/register-provider
{
  "cuit_cuil": "20123456789",
  "email": "provider@example.com",
  "password": "password",
  "first_name": "Provider",
  "last_name": "Name",
  "company_name": "Company Name"
}
```

### Buildings

```bash
# Get all buildings
GET /api/v1/buildings

# Get building by ID
GET /api/v1/buildings/:id

# Create building (SuperAdmin only)
POST /api/v1/buildings

# Update building
PUT /api/v1/buildings/:id
```

### Expenses

```bash
# Get expenses by building
GET /api/v1/expenses/building/:buildingId

# Get my expenses (Owner/Tenant)
GET /api/v1/expenses/my-expenses

# Create expense (Admin)
POST /api/v1/expenses
```

## 🔑 Roles y Permisos

### SuperAdmin
- Gestión completa del sistema
- Crear y gestionar administradores
- Crear y asignar consorcios
- Acceso a todos los datos

### Administrador
- Gestionar sus consorcios asignados
- Liquidar expensas
- Gestionar unidades y usuarios
- Comunicaciones y votaciones
- Gestionar proveedores

### Propietario
- Ver sus expensas
- Participar en votaciones
- Reservar amenities
- Comunicarse con administrador

### Inquilino
- Ver información de expensas
- Recibir avisos
- Realizar reclamos
- Información limitada del edificio

### Proveedor
- Cargar presupuestos
- Gestionar órdenes de trabajo
- Subir documentación

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Scripts Disponibles

### Backend
- `npm run dev`: Inicia servidor de desarrollo
- `npm run build`: Compila TypeScript
- `npm start`: Inicia servidor de producción
- `npm run migrate:up`: Ejecuta migraciones
- `npm run migrate:down`: Revierte migraciones

### Frontend
- `npm run dev`: Inicia servidor de desarrollo
- `npm run build`: Genera build de producción
- `npm start`: Inicia servidor de producción
- `npm run lint`: Ejecuta linter

## 📚 Documentación Adicional

- **[🚀 Guía de Inicio Rápido](docs/QUICKSTART.md)** - Paso a paso para tener Komunidad funcionando en minutos
- **[🐛 Troubleshooting](docs/TROUBLESHOOTING.md)** - Soluciones a problemas comunes
- **[📦 Dependencias](docs/DEPENDENCIES.md)** - Detalles sobre versiones y compatibilidad
- **[🔧 Docker Helper](docker-helper.sh)** - Script interactivo para gestionar Docker

## 🛠️ Utilidades Incluidas

### Docker Helper Script

Script interactivo que simplifica todas las operaciones de Docker:

```bash
./docker-helper.sh
```

Funciones:
- ✅ Iniciar/detener servicios con un click
- ✅ Reconstrucción automática
- ✅ Ver logs en tiempo real
- ✅ Diagnóstico y debug
- ✅ Limpieza de contenedores y volúmenes
- ✅ Manejo automático del frontend

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

## 📞 Soporte

Para soporte, envía un email a support@komunidad.com o abre un issue en el repositorio.

---

⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub!

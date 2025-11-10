# Troubleshooting - Komunidad

Esta guía contiene soluciones a problemas comunes que puedes encontrar al desarrollar o ejecutar Komunidad.

## Problemas con Docker

### Error: Container timeout durante docker-compose up

**Síntoma**: Al ejecutar `docker-compose up`, el contenedor frontend falla con timeout.

**Solución**:
```bash
# Detener todos los contenedores
docker-compose down

# Limpiar volúmenes si es necesario
docker-compose down -v

# Reconstruir las imágenes
docker-compose build --no-cache

# Iniciar de nuevo
docker-compose up -d

# Si el frontend no inicia, iniciarlo manualmente
docker start komunidad-frontend

# Verificar logs
docker logs -f komunidad-frontend
```

### Frontend no compila - Module not found

**Síntoma**: Error `Module not found: Can't resolve 'lucide-react'` o similar.

**Solución**:
```bash
# Reconstruir la imagen del frontend
docker-compose build --no-cache frontend

# O si estás en desarrollo local:
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Base de datos no inicializa

**Síntoma**: El backend no puede conectarse a PostgreSQL.

**Solución**:
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Verificar logs de PostgreSQL
docker logs komunidad-db

# Si necesitas reiniciar la base de datos
docker-compose down postgres
docker volume rm admin_consorcios_postgres_data
docker-compose up -d postgres

# Esperar a que esté healthy
docker ps
```

## Problemas con el Frontend

### Error: Next.js outdated

**Síntoma**: Mensaje "Next.js (14.2.15) is outdated".

**Solución**: Este es solo un warning informativo. Puedes ignorarlo o actualizar:
```bash
cd frontend
npm update next
```

### Error: Cannot resolve module

**Síntoma**: Error al importar módulos.

**Solución**:
```bash
cd frontend
npm install <nombre-del-paquete>
# O reinstalar todas las dependencias
rm -rf node_modules package-lock.json .next
npm install
```

### Error de Hydration en React 19

**Síntoma**: Errores de hidratación en el navegador.

**Solución**: Asegúrate de que los componentes cliente tengan `'use client'` al inicio:
```typescript
'use client';

import { useState } from 'react';
// ...resto del código
```

## Problemas con el Backend

### Error: Cannot find module

**Síntoma**: Backend crash con error de módulo no encontrado.

**Solución**:
```bash
cd backend
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Error de conexión a PostgreSQL

**Síntoma**: `ECONNREFUSED 127.0.0.1:5432` o similar.

**Solución**:
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Verificar variables de entorno
docker exec komunidad-backend env | grep DB_

# Si usas desarrollo local, asegúrate de que las variables sean correctas
# En .env o en tu terminal:
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=komunidad
```

### Error: JWT_SECRET not configured

**Síntoma**: Error 500 al intentar login.

**Solución**: Asegúrate de tener configurado JWT_SECRET:
```bash
# En docker-compose.yml o en .env
JWT_SECRET=tu-clave-secreta-aqui-cambiar-en-produccion
```

## Problemas de Desarrollo Local (Sin Docker)

### PostgreSQL: Database does not exist

**Solución**:
```bash
# Crear la base de datos
createdb komunidad

# Ejecutar migraciones
psql komunidad < backend/migrations/001_initial_schema.sql

# Verificar
psql komunidad -c "\dt"
```

### Error: Port already in use

**Síntoma**: `EADDRINUSE: address already in use :::3000` o `:::4000`.

**Solución**:
```bash
# Encontrar el proceso usando el puerto
lsof -i :3000
lsof -i :4000

# Matar el proceso (reemplaza PID con el ID del proceso)
kill -9 PID

# O cambiar el puerto en .env o package.json
```

### npm install falla con permisos

**Solución**:
```bash
# Limpiar caché de npm
npm cache clean --force

# Reinstalar sin sudo
npm install --unsafe-perm
```

## Problemas de Performance

### Build muy lento

**Solución**:
```bash
# Frontend: Aumentar memoria de Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Backend: Compilación incremental
npm run dev  # En lugar de build + start
```

### Docker consume mucha memoria

**Solución**:
```bash
# Limpiar imágenes no usadas
docker system prune -a

# Limitar recursos en docker-compose.yml
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 2G
```

## Problemas de Autenticación

### Token expirado constantemente

**Solución**: Aumentar JWT_EXPIRES_IN en backend/.env:
```bash
JWT_EXPIRES_IN=30d  # En lugar de 7d
```

### Login no funciona

**Síntoma**: Error 401 al intentar login.

**Solución**:
```bash
# Verificar que exista el usuario superadmin
docker exec -it komunidad-db psql -U postgres -d komunidad -c "SELECT * FROM users WHERE role='superadmin';"

# Si no existe, la migración no se ejecutó correctamente
# Ejecutar manualmente:
docker exec -i komunidad-db psql -U postgres -d komunidad < backend/migrations/001_initial_schema.sql
```

### CORS error en el navegador

**Síntoma**: Error de CORS al llamar a la API.

**Solución**: Verificar configuración de CORS en backend:
```typescript
// backend/src/server.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
```

Y en frontend:
```typescript
// frontend/src/services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
```

## Obtener Ayuda

Si ninguna de estas soluciones funciona:

1. **Revisar logs detallados**:
```bash
docker-compose logs -f
docker logs -f komunidad-frontend
docker logs -f komunidad-backend
docker logs -f komunidad-db
```

2. **Verificar versiones**:
```bash
node --version  # Debe ser 20+
npm --version
docker --version
docker-compose --version
```

3. **Reset completo** (último recurso):
```bash
# Detener todo
docker-compose down -v

# Eliminar volúmenes
docker volume prune

# Eliminar imágenes del proyecto
docker images | grep komunidad | awk '{print $3}' | xargs docker rmi -f

# Limpiar node_modules
rm -rf frontend/node_modules backend/node_modules
rm -rf frontend/.next backend/dist

# Reconstruir todo
docker-compose build --no-cache
docker-compose up -d
```

4. **Abrir un issue** en GitHub con:
   - Descripción del problema
   - Logs relevantes
   - Pasos para reproducir
   - Información del sistema (OS, versiones)

# 🚀 Guía de Inicio Rápido - Komunidad

Esta guía te ayudará a tener Komunidad funcionando en menos de 5 minutos.

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Git instalado
- Puertos 3000, 4000, 5432, 6379 disponibles

## 🎯 Método 1: Usando el Script Helper (Recomendado)

### Paso 1: Clonar el Repositorio

```bash
git clone <repository-url>
cd admin_consorcios
```

### Paso 2: Ejecutar el Helper Script

```bash
./docker-helper.sh
```

El script te mostrará un menú interactivo:
```
1) 🚀 Iniciar todo (build + up)
2) ▶️  Iniciar servicios existentes
3) ⏹️  Detener servicios
4) 🔄 Reiniciar servicios
5) 🔨 Reconstruir todo (clean build)
6) 📋 Ver logs
7) 🔍 Ver estado de contenedores
8) 🧹 Limpiar todo (contenedores + volúmenes)
9) 🐛 Debug: Iniciar frontend manualmente
10) 📊 Ver logs en tiempo real
0) ❌ Salir
```

**Selecciona la opción 1** para iniciar todo automáticamente.

### Paso 3: Esperar y Verificar

El script:
- ✅ Construirá todas las imágenes Docker
- ✅ Iniciará todos los servicios
- ✅ Iniciará el frontend automáticamente si hay timeout
- ✅ Mostrará el estado de todos los contenedores

### Paso 4: Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 🛠️ Método 2: Docker Compose Manual

### Opción A: Inicio Normal

```bash
# Exportar variable para aumentar timeout
export COMPOSE_HTTP_TIMEOUT=120

# Iniciar servicios
docker-compose up -d

# Si el frontend no inicia automáticamente
docker start komunidad-frontend

# Ver logs
docker logs -f komunidad-frontend
docker logs -f komunidad-backend
```

### Opción B: Con Rebuild Completo

```bash
# Detener y limpiar
docker-compose down

# Reconstruir sin caché
docker-compose build --no-cache

# Iniciar con timeout extendido
export COMPOSE_HTTP_TIMEOUT=180
docker-compose up -d

# Verificar estado
docker ps
```

## 🐛 Solución Rápida de Problemas

### Problema: Frontend no inicia (timeout error)

```bash
# Iniciar frontend manualmente
docker start komunidad-frontend

# Verificar que está corriendo
docker ps | grep frontend

# Ver logs para confirmar
docker logs komunidad-frontend
```

### Problema: Error de compilación en frontend

```bash
# Ver logs detallados
docker logs komunidad-frontend

# Si hay errores de CSS/Tailwind, reconstruir
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

### Problema: Base de datos no se conecta

```bash
# Verificar que PostgreSQL está healthy
docker ps | grep komunidad-db

# Ver logs de PostgreSQL
docker logs komunidad-db

# Reiniciar servicios en orden
docker-compose restart postgres
docker-compose restart backend
docker-compose restart frontend
```

### Problema: Puertos ya en uso

```bash
# Verificar qué está usando los puertos
lsof -i :3000
lsof -i :4000
lsof -i :5432

# Cambiar puertos en docker-compose.yml si es necesario
# O detener los servicios que usan esos puertos
```

## ✅ Verificación de Instalación

### 1. Verificar Contenedores

```bash
docker ps
```

Deberías ver 4 contenedores corriendo:
- `komunidad-frontend` (puerto 3000)
- `komunidad-backend` (puerto 4000)
- `komunidad-db` (puerto 5432)
- `komunidad-redis` (puerto 6379)

### 2. Verificar Frontend

Abre http://localhost:3000 en tu navegador. Deberías ver:
- Landing page de Komunidad
- Logo y navegación
- Secciones de beneficios
- Botones funcionales

### 3. Verificar Backend

```bash
# Health check
curl http://localhost:4000/health

# Debería responder:
# {"status":"ok","timestamp":"..."}
```

### 4. Verificar Base de Datos

```bash
# Conectarse a PostgreSQL
docker exec -it komunidad-db psql -U postgres -d komunidad

# Ver tablas
\dt

# Debería mostrar todas las tablas (users, buildings, etc.)

# Salir
\q
```

## 🔑 Credenciales de Prueba

### SuperAdmin
- **Email**: superadmin@komunidad.com
- **DNI**: 00000000
- **Contraseña**: admin123

### URLs Importantes
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api/v1
- Health Check: http://localhost:4000/health

## 📊 Comandos Útiles

### Ver logs en tiempo real
```bash
# Frontend
docker logs -f komunidad-frontend

# Backend
docker logs -f komunidad-backend

# Todos
docker-compose logs -f
```

### Reiniciar un servicio específico
```bash
docker-compose restart frontend
docker-compose restart backend
```

### Detener todo
```bash
docker-compose down
```

### Limpiar todo (¡cuidado! borra datos)
```bash
docker-compose down -v
docker volume prune -f
```

### Ver uso de recursos
```bash
docker stats
```

## 🎨 Personalización Rápida

### Cambiar puertos

Edita `docker-compose.yml`:

```yaml
frontend:
  ports:
    - "3001:3000"  # Cambiar primer número

backend:
  ports:
    - "4001:4000"  # Cambiar primer número
```

Luego reinicia:
```bash
docker-compose down
docker-compose up -d
```

## 🔄 Actualizar el Código

```bash
# Obtener últimos cambios
git pull

# Reconstruir y reiniciar
docker-compose down
docker-compose build
docker-compose up -d
```

## 📱 Próximos Pasos

Una vez que todo esté funcionando:

1. ✅ Explorar la landing page
2. ✅ Probar el login con superadmin
3. ✅ Revisar la estructura del proyecto
4. ✅ Leer la documentación completa en `docs/`
5. ✅ Empezar a desarrollar funcionalidades

## 🆘 ¿Necesitas Ayuda?

- **Troubleshooting completo**: `docs/TROUBLESHOOTING.md`
- **Documentación de dependencias**: `docs/DEPENDENCIES.md`
- **README principal**: `README.md`
- **Issues en GitHub**: Abre un issue si encuentras problemas

## 💡 Tips Profesionales

1. **Usa el script helper** para operaciones comunes
2. **Monitorea los logs** cuando desarrolles
3. **Usa volumes de Docker** para no perder cambios
4. **Ejecuta tests** antes de commits
5. **Mantén Docker actualizado** para mejor rendimiento

---

**¿Todo funcionando?** ¡Genial! Ahora puedes empezar a desarrollar 🎉

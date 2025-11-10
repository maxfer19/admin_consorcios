# 🔐 Troubleshooting - Login Issues

## Credenciales del Superadmin

**DNI:** `00000000`
**Password:** `admin123`
**Email:** `superadmin@komunidad.com`

## Verificar que el Backend está funcionando

### 1. Verificar el estado del contenedor

```bash
docker ps | grep komunidad-backend
```

Deberías ver algo como:
```
komunidad-backend   Up X minutes   0.0.0.0:4000->4000/tcp
```

### 2. Verificar logs del backend

```bash
docker logs komunidad-backend --tail 50
```

Deberías ver:
```
🚀 Server running on port 4000
📡 Environment: development
🔗 API: http://localhost:4000/api/v1
```

**Si ves errores de TypeScript**, significa que el código no está actualizado. Ejecuta:
```bash
git pull origin claude/consorcio-app-structure-design-011CUwKgD38yg94pM72s7jsf
docker-compose build backend
docker-compose restart backend
```

### 3. Probar el endpoint de health

```bash
curl http://localhost:4000/health
```

Debería responder:
```json
{"status":"ok","timestamp":"..."}
```

### 4. Probar el login directamente

```bash
./test-login.sh
```

O manualmente:
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "00000000",
    "password": "admin123"
  }'
```

Respuesta esperada (exitosa):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "dni": "00000000",
    "email": "superadmin@komunidad.com",
    "role": "superadmin",
    ...
  }
}
```

## Problemas Comunes y Soluciones

### ❌ "Error al iniciar sesión" en el Frontend

#### Causa 1: Backend no está corriendo
**Solución:**
```bash
docker-compose restart backend
docker logs -f komunidad-backend
```

#### Causa 2: Frontend no puede conectarse al Backend
**Verificar:** El frontend debe estar en http://localhost:3000 y el backend en http://localhost:4000

**Verificar variable de entorno:**
```bash
docker exec komunidad-frontend printenv | grep API_URL
```

Debería mostrar:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Causa 3: Contraseña incorrecta en la base de datos
**Verificar el usuario en la DB:**
```bash
docker exec -it komunidad-db psql -U postgres -d komunidad -c "SELECT id, dni, email, role, status FROM users WHERE role='superadmin';"
```

**Regenerar el hash de la contraseña:**
```bash
cd backend
node generate-hash.js
```

**Actualizar en la DB:**
```bash
docker exec -it komunidad-db psql -U postgres -d komunidad
```
```sql
UPDATE users
SET password_hash = '$2a$10$NUEVO_HASH_AQUI'
WHERE dni = '00000000';
\q
```

#### Causa 4: Errores de CORS
**Ver logs del backend** cuando intentas hacer login desde el frontend:
```bash
docker logs -f komunidad-backend
```

Si ves errores de CORS, verificar la variable `CORS_ORIGIN` en docker-compose.yml.

### ❌ Backend crasheando con errores de TypeScript

**Solución:**
```bash
cd /home/server/admin_consorcios
git pull origin claude/consorcio-app-structure-design-011CUwKgD38yg94pM72s7jsf
docker-compose build backend --no-cache
docker-compose restart backend
```

### ❌ Error: "Your account is pending approval"

El superadmin debe tener `status = 'active'`. Verificar:
```bash
docker exec -it komunidad-db psql -U postgres -d komunidad -c "SELECT dni, status FROM users WHERE dni='00000000';"
```

Si el status no es 'active':
```bash
docker exec -it komunidad-db psql -U postgres -d komunidad -c "UPDATE users SET status='active' WHERE dni='00000000';"
```

## URLs de la Aplicación

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api/v1
- **Health Check:** http://localhost:4000/health
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

## Verificación Completa

Ejecuta estos comandos en orden:

```bash
# 1. Ver estado de todos los contenedores
docker-compose ps

# 2. Ver logs del backend
docker logs komunidad-backend --tail 20

# 3. Ver logs del frontend
docker logs komunidad-frontend --tail 20

# 4. Probar health check
curl http://localhost:4000/health

# 5. Probar login
./test-login.sh

# 6. Ver usuario superadmin en DB
docker exec -it komunidad-db psql -U postgres -d komunidad -c "SELECT id, dni, email, role, status FROM users WHERE role='superadmin';"
```

## Soporte

Si después de seguir todos estos pasos el login sigue sin funcionar, proporciona:
1. Logs del backend (últimas 50 líneas)
2. Logs del frontend (últimas 50 líneas)
3. Resultado del test-login.sh
4. Resultado de la consulta del superadmin en la DB

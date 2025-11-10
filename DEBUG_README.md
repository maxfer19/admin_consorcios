# 🐛 Guía de Debugging del Login

## 🎯 Problema Actual

Estás viendo "Error al iniciar sesión" en el frontend, pero según los logs del backend, algunos logins **SÍ están funcionando** (HTTP 200).

```
POST /api/v1/auth/login 401 196.033 ms - 142  ❌ Falló
POST /api/v1/auth/login 200 81.680 ms - 745   ✅ Exitoso
POST /api/v1/auth/login 200 150.599 ms - 767  ✅ Exitoso
```

Esto significa que:
- ✅ El backend está funcionando
- ✅ La base de datos está OK (después de ejecutar fix-superadmin.sh)
- ❓ El problema podría estar en el **frontend** (JavaScript, manejo de errores, CORS, etc.)

---

## 🔧 Herramientas de Debug Disponibles

### 1️⃣ **Página HTML de Debug** (Recomendado para empezar)

Abre directamente en tu navegador:

```bash
# En tu servidor
cd /home/server/admin_consorcios
python3 -m http.server 8080
```

Luego abre en tu navegador:
```
http://localhost:8080/debug-frontend-login.html
```

O simplemente abre el archivo `debug-frontend-login.html` directamente en Chrome/Firefox.

**Esta página te permite:**
- ✅ Probar el login con interfaz visual
- ✅ Ver todos los headers y responses
- ✅ Probar CORS
- ✅ Probar health check
- ✅ Ver exactamente qué está enviando y recibiendo

---

### 2️⃣ **Script de Consola del Navegador**

1. Ve a la página de login del frontend: http://localhost:3000/login
2. Abre la consola del navegador (F12 o Click Derecho → Inspeccionar → Console)
3. Copia y pega TODO el contenido de `debug-frontend-console.js`
4. Presiona Enter

El script automáticamente:
- ✅ Limpia localStorage
- ✅ Prueba health endpoint
- ✅ Prueba CORS
- ✅ Intenta login
- ✅ Muestra información detallada con colores

---

### 3️⃣ **Test desde Terminal (lo que ya probaste)**

```bash
./test-login.sh
```

Este test ya funcionó parcialmente (algunos 200 OK), pero sigue dando problemas.

---

## 📊 Interpretación de Resultados

### Escenario A: HTML Debug funciona ✅ pero Frontend falla ❌

**Diagnóstico:** El problema está en el código del frontend

**Posibles causas:**
1. Error en el componente de login (`frontend/src/app/login/page.tsx`)
2. Error en el servicio API (`frontend/src/services/api.ts`)
3. Error en el manejo de la respuesta
4. Problema con el router de Next.js

**Solución:**
```bash
# Ver logs del frontend
docker logs -f komunidad-frontend

# Mientras tanto, intenta hacer login en http://localhost:3000/login
# Los errores aparecerán en los logs
```

---

### Escenario B: Ambos fallan con 401 ❌

**Diagnóstico:** El hash de contraseña aún está corrupto

**Solución:**
```bash
cd /home/server/admin_consorcios
./fix-superadmin.sh
```

---

### Escenario C: Error de red / CORS ❌

**Diagnóstico:** Problema de conectividad o CORS

**Verificar:**
```bash
# Ver si el backend está corriendo
docker ps | grep komunidad-backend

# Ver configuración CORS en docker-compose.yml
grep CORS_ORIGIN docker-compose.yml
```

**Debería mostrar:**
```
CORS_ORIGIN: http://localhost:3000
```

---

## 🔍 Paso a Paso - Debugging Completo

### Paso 1: Verificar que TODO está corriendo

```bash
docker ps
```

Deberías ver 4 contenedores: backend, frontend, postgres, redis

### Paso 2: Verificar logs del backend

```bash
docker logs -f komunidad-backend
```

Deberías ver:
```
🚀 Server running on port 4000
📡 Environment: development
```

### Paso 3: Probar con HTML Debug

Abre `debug-frontend-login.html` y presiona "Probar Login"

**Si es exitoso (200 OK):** El backend funciona, el problema está en el frontend
**Si falla (401):** Ejecuta `./fix-superadmin.sh`
**Si error de red:** El backend no está corriendo o hay problema de CORS

### Paso 4: Si HTML funciona pero frontend no

1. Abre http://localhost:3000/login
2. Abre consola del navegador (F12)
3. Pega el script de `debug-frontend-console.js`
4. Mira los logs de frontend:
   ```bash
   docker logs -f komunidad-frontend
   ```

### Paso 5: Inspeccionar Network Tab

1. Abre http://localhost:3000/login
2. Abre DevTools (F12)
3. Ve a la pestaña "Network"
4. Intenta hacer login
5. Busca la petición a `/api/v1/auth/login`
6. Click en ella para ver:
   - Request Headers
   - Request Payload
   - Response Headers
   - Response Body

**Compara con lo que muestra el HTML Debug que SÍ funciona**

---

## 💡 Soluciones Rápidas

### Si el problema es CORS:

```bash
# Editar docker-compose.yml
nano docker-compose.yml

# Asegurarse que backend tiene:
CORS_ORIGIN: http://localhost:3000

# Reiniciar
docker-compose restart backend
```

### Si el problema es el hash de contraseña:

```bash
./fix-superadmin.sh
```

### Si el frontend tiene error de código:

```bash
# Ver logs en tiempo real
docker logs -f komunidad-frontend

# Mientras tanto, intenta login en el navegador
# Los errores JS aparecerán en los logs
```

### Si el backend está crasheando:

```bash
# Ver si hay errores de TypeScript
docker logs komunidad-backend --tail 100

# Si hay errores, actualizar código
git pull origin claude/consorcio-app-structure-design-011CUwKgD38yg94pM72s7jsf
docker-compose build backend --no-cache
docker-compose restart backend
```

---

## 📞 Información de Soporte

**Credenciales de prueba:**
- DNI: `00000000`
- Password: `admin123`
- Email: `superadmin@komunidad.com`

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000/api/v1
- Health: http://localhost:4000/health

**Archivos clave:**
- Frontend Login: `frontend/src/app/login/page.tsx`
- API Service: `frontend/src/services/api.ts`
- Backend Auth: `backend/src/routes/auth.routes.ts`

---

## 🎯 Próximo Paso Sugerido

**Ejecuta ESTO primero:**

```bash
cd /home/server/admin_consorcios
git pull origin claude/consorcio-app-structure-design-011CUwKgD38yg94pM72s7jsf

# Abrir el HTML debug en tu navegador
# O usar python http server
python3 -m http.server 8080

# Luego abre: http://localhost:8080/debug-frontend-login.html
```

**Y envíame:**
1. Captura de pantalla del resultado del HTML debug
2. Captura de Network tab cuando intentas login desde el frontend
3. Logs de frontend mientras intentas login

Con eso podré identificar exactamente dónde está el problema.

# 🪟 Guía: Acceder desde Windows

## 🎯 Tu Escenario

- **Servidor Ubuntu:** 192.168.1.68 (donde corre Docker)
- **Tu Windows:** Otra máquina en la red
- **Objetivo:** Acceder a la aplicación desde Windows (simulando producción)

---

## ✅ **ESTADO ACTUAL (Según check-services.sh):**

- ✅ Backend corriendo y login funcionando
- ✅ Frontend corriendo
- ✅ PostgreSQL corriendo
- ✅ Redis corriendo
- ✅ CORS configurado para red local

**TODO debería estar funcionando.**

---

## 🧪 **PRUEBAS PASO A PASO desde Windows:**

### Paso 1: Probar el Debug HTML

Desde tu navegador en Windows, abre:

```
http://192.168.1.68:8080/debug-frontend-login.html
```

1. En el campo **"Backend API URL"** escribe: `http://192.168.1.68:4000/api/v1`
2. Verifica que DNI sea: `00000000`
3. Verifica que Password sea: `admin123`
4. Click en **"Probar Login"**

**¿Qué debería pasar?**
- ✅ Si funciona: Verás "LOGIN EXITOSO" y un token
- ❌ Si falla: Copia TODO el output y envíamelo

---

### Paso 2: Probar la Aplicación Real

Desde tu navegador en Windows, abre:

```
http://192.168.1.68:3000
```

1. Deberías ver la página de login de Komunidad
2. Ingresa:
   - **DNI:** `00000000`
   - **Password:** `admin123`
3. Click en **"Iniciar Sesión"**

**¿Qué debería pasar?**
- ✅ Si funciona: Te redirige a `/superadmin`
- ❌ Si falla: Continúa al Paso 3

---

### Paso 3: Ver errores en el navegador (SI FALLA)

Si el login falla en el paso 2:

1. Abre **DevTools** (presiona F12)
2. Ve a la pestaña **"Console"**
   - ¿Hay errores en rojo?
   - Copia y pégame los errores
3. Ve a la pestaña **"Network"**
   - Busca la petición a `auth/login`
   - Click en ella
   - Ve a:
     - **Headers** (Request URL, Request Method, Status Code)
     - **Payload** (qué datos envió)
     - **Response** (qué respondió el servidor)
   - Toma captura de pantalla

---

## 🔍 Análisis de Posibles Errores

### Error A: "Failed to fetch" en debug HTML
**Causa:** Firewall o red bloqueando

**Solución:**
```bash
# En el servidor Ubuntu
sudo ufw allow 3000
sudo ufw allow 4000
sudo ufw status
```

### Error B: Debug HTML funciona ✅ pero Frontend falla ❌
**Causa:** Frontend está usando URL incorrecta

**Verificar:**
```bash
# En el servidor
docker exec komunidad-frontend printenv NEXT_PUBLIC_API_URL
```

**Debería mostrar:** `http://192.168.1.68:4000`

**Si muestra otra cosa:**
```bash
# Editar docker-compose.yml
nano docker-compose.yml

# Buscar NEXT_PUBLIC_API_URL y cambiar a:
NEXT_PUBLIC_API_URL: http://192.168.1.68:4000

# Reiniciar
docker-compose restart frontend
```

### Error C: 401 Unauthorized
**Causa:** Contraseña incorrecta en la DB

**Solución:**
```bash
./fix-superadmin.sh
```

### Error D: CORS Error
**Causa:** Backend no permite peticiones desde tu IP

**Verificar:**
```bash
docker exec komunidad-backend printenv CORS_ORIGIN
```

**Debería mostrar:** `http://localhost:3000,http://192.168.1.68:3000`

**Si es diferente:**
```bash
nano docker-compose.yml
# Buscar CORS_ORIGIN y cambiar a:
CORS_ORIGIN: http://localhost:3000,http://192.168.1.68:3000

docker-compose restart backend
```

---

## 🌐 **Para Producción en la Nube:**

Cuando subas a la nube (AWS, Azure, Google Cloud, etc.):

### 1. Cambiar URLs en docker-compose.yml

```yaml
backend:
  environment:
    CORS_ORIGIN: https://tu-dominio.com
    # O si usas IP pública:
    CORS_ORIGIN: http://IP-PUBLICA:3000

frontend:
  environment:
    NEXT_PUBLIC_API_URL: https://api.tu-dominio.com
    # O:
    NEXT_PUBLIC_API_URL: http://IP-PUBLICA:4000
```

### 2. Usar HTTPS (Obligatorio en producción)

```bash
# Instalar certbot para SSL
sudo apt install certbot

# Usar nginx como reverse proxy
sudo apt install nginx
```

### 3. Configuración típica en la nube:

```
Usuario (Navegador)
      ↓
   HTTPS/SSL
      ↓
Dominio: app.tu-empresa.com
      ↓
Load Balancer / Nginx
      ↓
   ┌──────────────┬─────────────┐
   ↓              ↓             ↓
Frontend:3000  Backend:4000  DB:5432
```

### 4. Variables de entorno en producción:

```yaml
# docker-compose.prod.yml
backend:
  environment:
    NODE_ENV: production
    CORS_ORIGIN: https://app.tu-empresa.com
    JWT_SECRET: ${JWT_SECRET}  # Desde .env seguro
    DB_HOST: ${DB_HOST}        # RDS o DB gestionada
    DB_PASSWORD: ${DB_PASSWORD}

frontend:
  environment:
    NEXT_PUBLIC_API_URL: https://api.tu-empresa.com
    NODE_ENV: production
```

---

## 📊 **Diferencia: Red Local vs Producción**

| Aspecto | Red Local (Ahora) | Producción (Nube) |
|---------|-------------------|-------------------|
| IP | 192.168.1.68 | IP Pública o Dominio |
| Protocolo | HTTP | HTTPS |
| CORS | IP específica | Dominio específico |
| Firewall | Router local | Security Groups/Firewall en nube |
| Base de Datos | Docker local | RDS/Cloud SQL gestionado |
| Backups | Manual | Automáticos |
| Escalabilidad | Limitado | Auto-scaling |

---

## 🚀 **Siguiente Paso:**

**Ejecuta en el servidor:**

```bash
./final-debug.sh
```

Este script verificará TODO y te dará un reporte completo.

**Luego desde tu Windows:**

1. Prueba el debug HTML primero
2. Prueba la app real
3. Si algo falla, envíame:
   - Output del final-debug.sh
   - Capturas del navegador (Console y Network)
   - Descripción exacta del error

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué funciona en el servidor pero no desde Windows?**
R: Porque `localhost` en el navegador se refiere a tu PC, no al servidor.

**P: ¿192.168.1.68 es seguro para producción?**
R: NO. Es una IP privada de red local. En producción usa dominio + HTTPS.

**P: ¿Qué cambios hay que hacer para subir a la nube?**
R: Cambiar IPs por el dominio, habilitar HTTPS, usar base de datos gestionada.

**P: ¿Funcionará desde cualquier parte del mundo en la nube?**
R: SÍ, si tienes un dominio público y HTTPS configurado correctamente.

---

## 🎯 **Resumen:**

**Ahora mismo (red local):**
- Funciona: http://192.168.1.68:3000
- Sólo accesible desde tu red local

**En producción (nube):**
- Funcionará: https://tu-dominio.com
- Accesible desde cualquier parte del mundo
- Requiere: Dominio, SSL/HTTPS, IP pública

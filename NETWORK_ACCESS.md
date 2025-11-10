# 🌐 Configuración de Acceso por Red Local

## 🎯 Problema Detectado

Estás accediendo a la aplicación desde **`192.168.1.68`** (red local), pero la aplicación está configurada para funcionar solo en **`localhost`**.

### ¿Por qué es un problema?

Cuando tu navegador está en:
```
http://192.168.1.68:8080/debug-frontend-login.html
```

Y la app intenta conectarse a:
```
http://localhost:4000/api/v1
```

**"localhost" en el navegador se refiere a TU COMPUTADORA**, no al servidor donde está Docker corriendo.

---

## 🔧 Solución Automática (Recomendada)

Ejecuta este script en el servidor:

```bash
cd /home/server/admin_consorcios
./setup-network-access.sh
```

El script automáticamente:
1. ✅ Detecta la IP del servidor (192.168.1.68)
2. ✅ Actualiza CORS en el backend para permitir peticiones desde la red
3. ✅ Actualiza el frontend para usar la IP del servidor
4. ✅ Reinicia los servicios
5. ✅ Te da las URLs correctas para acceder

---

## 🛠️ Solución Manual

Si prefieres hacerlo manualmente:

### 1. Editar docker-compose.yml

```bash
nano docker-compose.yml
```

**Backend (línea ~54):**
```yaml
# Antes:
CORS_ORIGIN: http://localhost:3000

# Después:
CORS_ORIGIN: http://localhost:3000,http://192.168.1.68:3000
```

**Frontend (línea ~82):**
```yaml
# Antes:
NEXT_PUBLIC_API_URL: http://localhost:4000

# Después:
NEXT_PUBLIC_API_URL: http://192.168.1.68:4000
```

### 2. Reiniciar servicios

```bash
docker-compose down
docker-compose up -d
```

### 3. Usar las URLs correctas

**Desde tu computadora (en la red local):**
- Frontend: `http://192.168.1.68:3000`
- Backend: `http://192.168.1.68:4000/api/v1`
- Debug HTML: `http://192.168.1.68:8080/debug-frontend-login.html`

**Desde el servidor (SSH):**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000/api/v1`

---

## 📊 Entendiendo localhost vs IP de Red

### Localhost (127.0.0.1)
- Solo accesible desde la misma máquina
- `localhost` en el navegador = tu computadora
- Útil para desarrollo local

### IP de Red (ej: 192.168.1.68)
- Accesible desde cualquier dispositivo en la red
- Permite que otros accedan a la aplicación
- Necesario si navegador y servidor están en máquinas diferentes

### Diagrama

```
┌─────────────────┐
│ Tu Computadora  │
│ (Navegador)     │
│ 192.168.1.100   │
└────────┬────────┘
         │
         │ ❌ http://localhost:4000
         │    (intenta conectar a 192.168.1.100:4000 - NO EXISTE)
         │
         │ ✅ http://192.168.1.68:4000
         │    (conecta correctamente al servidor)
         │
         ↓
┌─────────────────┐
│ Servidor        │
│ (Docker)        │
│ 192.168.1.68    │
│                 │
│ ┌─────────────┐ │
│ │ Backend     │ │
│ │ Port 4000   │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ Frontend    │ │
│ │ Port 3000   │ │
│ └─────────────┘ │
└─────────────────┘
```

---

## 🚀 Después de la Configuración

### Test Rápido con cURL (desde el servidor)

```bash
# Test health
curl http://localhost:4000/health

# Test login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"00000000","password":"admin123"}'
```

### Test desde tu Navegador

1. Abre: `http://192.168.1.68:8080/debug-frontend-login.html`
2. En "Backend API URL" usa: `http://192.168.1.68:4000/api/v1`
3. Presiona "Probar Login"
4. Debería funcionar ✅

### Usar la Aplicación Real

1. Abre: `http://192.168.1.68:3000`
2. Login con:
   - DNI: `00000000`
   - Password: `admin123`
3. Debería funcionar ✅

---

## 🔒 Consideraciones de Seguridad

### Para Desarrollo (OK)
```yaml
CORS_ORIGIN: http://localhost:3000,http://192.168.1.68:3000
```
Esto es seguro para desarrollo en red local privada.

### Para Producción (Cambiar)
```yaml
CORS_ORIGIN: https://tu-dominio.com
```
En producción, usa un dominio específico, no IPs.

---

## ❓ Problemas Comunes

### "Failed to fetch" desde el navegador

**Causa:** Usando `localhost` en lugar de la IP del servidor

**Solución:**
```bash
# En debug-frontend-login.html, cambiar:
http://localhost:4000/api/v1
# Por:
http://192.168.1.68:4000/api/v1
```

### Error de CORS

**Causa:** Backend no permite peticiones desde la IP del cliente

**Solución:**
```bash
./setup-network-access.sh
```

### Connection Refused

**Causa:** Firewall bloqueando los puertos

**Solución:**
```bash
# Verificar puertos abiertos
sudo netstat -tlnp | grep -E '3000|4000'

# Abrir puertos si es necesario (Ubuntu/Debian)
sudo ufw allow 3000
sudo ufw allow 4000
```

---

## 🎯 Resumen de Comandos

```bash
# Configurar acceso por red (automático)
./setup-network-access.sh

# Verificar servicios corriendo
docker ps

# Ver logs
docker logs -f komunidad-backend
docker logs -f komunidad-frontend

# Revertir cambios
cp docker-compose.yml.backup docker-compose.yml
docker-compose restart
```

---

## 📱 URLs Finales

**Reemplaza `192.168.1.68` con la IP real de tu servidor**

| Servicio | Desde Servidor | Desde Red Local |
|----------|----------------|-----------------|
| Frontend | http://localhost:3000 | http://192.168.1.68:3000 |
| Backend | http://localhost:4000/api/v1 | http://192.168.1.68:4000/api/v1 |
| Health | http://localhost:4000/health | http://192.168.1.68:4000/health |
| Debug HTML | - | http://192.168.1.68:8080/debug-frontend-login.html |

**Credenciales:**
- DNI: `00000000`
- Password: `admin123`

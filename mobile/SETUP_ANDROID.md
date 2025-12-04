# 📱 Guía Paso a Paso: Levantar la App en Android

Esta guía te lleva de la mano para levantar la app en tu celular Android.

## Paso 1: Clonar el Repositorio (Si no lo hiciste)

```bash
git clone https://github.com/maxfer19/admin_consorcios.git
cd admin_consorcios
git checkout claude/paddle-match-app-01QFmAU6QNig93ebLpLqH9NU
cd mobile
```

## Paso 2: Instalar Dependencias

```bash
npm install
```

Esto puede tardar 2-3 minutos. ☕

## Paso 3: Levantar el Backend

**En otra terminal:**

```bash
cd ../backend

# Si es la primera vez:
npm install
cp .env.example .env

# Asegurarse que tenés PostgreSQL corriendo
# Editar .env con tus credenciales de PostgreSQL

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones (crea las tablas)
npx prisma migrate dev --name init

# Iniciar el servidor
npm run start:dev
```

El backend debe estar corriendo en `http://localhost:3000`

## Paso 4: Configurar tu Celular Android

### 4.1 Habilitar Modo Desarrollador

1. Andá a **Ajustes** en tu celular
2. Buscá **"Acerca del teléfono"** o **"About phone"**
3. Buscá **"Número de compilación"** o **"Build number"**
4. **Tocá 7 veces** sobre "Número de compilación"
5. Te va a decir "Ya sos desarrollador"

### 4.2 Activar Depuración USB

1. Volvé a **Ajustes**
2. Ahora vas a ver **"Opciones de desarrollador"** o **"Developer options"**
3. Entrá ahí
4. Activá **"Depuración USB"** o **"USB debugging"**
5. También activá **"Instalar vía USB"** si está disponible

### 4.3 Conectar el Celular a la PC

1. Conectá tu celular con el cable USB
2. En el celular, va a aparecer un mensaje:
   - "¿Permitir depuración USB?"
   - Marcá "Permitir siempre desde esta computadora"
   - Tocá "Aceptar"

### 4.4 Verificar Conexión

```bash
# En la terminal, ejecutá:
adb devices
```

**Deberías ver algo así:**
```
List of devices attached
ABC123456789    device
```

Si dice "unauthorized", volvé al paso 4.3 y aceptá el mensaje en el celular.

Si no aparece nada:
```bash
# Reiniciar adb
adb kill-server
adb start-server
adb devices
```

## Paso 5: Configurar la IP para Dispositivo Físico

### 5.1 Obtener tu IP Local

**Windows:**
```bash
ipconfig
```
Buscá "IPv4 Address" de tu WiFi, ejemplo: `192.168.1.100`

**Linux/Mac:**
```bash
ifconfig | grep "inet "
```
O
```bash
ip addr show
```

Buscá algo como `inet 192.168.1.100/24`

### 5.2 Editar la Configuración

1. Abrí el archivo `src/constants/config.ts`
2. Cambiá la línea:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://TU_IP:3000/api', // Cambia TU_IP por la IP que obtuviste
  TIMEOUT: 30000,
};
```

Ejemplo:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.100:3000/api',
  TIMEOUT: 30000,
};
```

**¡IMPORTANTE!** El celular y la PC deben estar en la misma red WiFi.

## Paso 6: Ejecutar la App

### Terminal 1: Metro Bundler
```bash
npm start
```

Deberías ver algo así:
```
                ######                ######
              ###     ####        ####     ###
            ##          ###    ###          ##
            ##             ####             ##
            ##             ####             ##
            ##           ##    ##           ##
            ##         ###      ###         ##
              ###     ####        ####     ###
                ######                ######

               Welcome to Metro!
```

### Terminal 2: Instalar en Android
```bash
npm run android
```

Esto va a:
1. Compilar la app (puede tardar 3-5 minutos la primera vez)
2. Instalar en tu celular
3. Abrir la app automáticamente

## Paso 7: Probar la App

1. La app debería abrirse en tu celular
2. Vas a ver la pantalla de Login
3. Probá crear una cuenta:
   - Nombre: Tu nombre
   - Apellido: Tu apellido
   - Email: test@test.com
   - Contraseña: test1234 (mínimo 8 caracteres)
4. Tocá "Registrarse"
5. Si todo está bien, vas a entrar a la app y ver la lista de partidos

## 🎉 ¡Listo!

Tu app está corriendo en el celular. Ahora podés:
- Ver partidos disponibles
- Unirte a partidos
- Ver tu perfil
- Y más!

## 🐛 Problemas Comunes

### Error: "Unable to connect to development server"

**Solución 1:** Verificá la IP en `config.ts`
```bash
# Obtené tu IP nuevamente
ipconfig  # Windows
ifconfig  # Linux/Mac

# Cambiala en src/constants/config.ts
```

**Solución 2:** Verificá que el backend esté corriendo
```bash
# En la terminal del backend, deberías ver:
# 🎾 Paddle Match API running on: http://localhost:3000
```

**Solución 3:** Verificá que estén en la misma WiFi
- El celular y la PC deben estar conectados a la misma red

**Solución 4:** Desactivá el firewall temporalmente

### Error: "BUILD FAILED"

```bash
# Limpiar y rebuild
cd android
./gradlew clean
cd ..
npm run android
```

### La app se crashea al abrir

```bash
# Limpiar caché
npm start -- --reset-cache

# En otra terminal
npm run android
```

### El celular no se detecta

```bash
# Verificar drivers USB (Windows)
# Descargar drivers del fabricante de tu celular

# Probar otro cable USB
# Algunos cables solo cargan, no transfieren datos

# Reiniciar adb
adb kill-server
adb start-server
adb devices
```

## 📞 ¿Necesitás Ayuda?

Si seguiste todos los pasos y algo no funciona:
1. Copiá el error completo que te aparece
2. Abrí un issue en GitHub con el error
3. Incluí:
   - Sistema operativo (Windows/Mac/Linux)
   - Modelo de celular
   - Versión de Android
   - Error completo

---

**¡Que disfrutes la app!** 🎾

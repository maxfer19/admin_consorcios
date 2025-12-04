# Paddle Match - Mobile App (React Native)

Aplicación móvil para Android e iOS construida con React Native.

## 🚀 Características

- ✅ Autenticación (Login/Register)
- ✅ Lista de partidos disponibles
- ✅ Detalle de partido con información completa
- ✅ Unirse/Salir de partidos
- ✅ Perfil de usuario
- ✅ Integración completa con backend
- ✅ Manejo de estados con Zustand
- ✅ Navegación con React Navigation
- ✅ TypeScript

## 📋 Requisitos Previos

- Node.js 18 o superior
- Android Studio (para desarrollo Android)
- JDK 17
- Android SDK instalado

### Configuración de Android Studio

1. Instalar Android Studio desde https://developer.android.com/studio
2. Abrir Android Studio > Tools > SDK Manager
3. Instalar:
   - Android SDK Platform 33 (o superior)
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android SDK Command-line Tools

4. Configurar variables de entorno:

**Linux/Mac:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Windows:**
```powershell
ANDROID_HOME=C:\Users\TuUsuario\AppData\Local\Android\Sdk
Path=%Path%;%ANDROID_HOME%\platform-tools
```

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# O con yarn
yarn install
```

## 📱 Ejecutar en Android

### Opción 1: Dispositivo Físico (Recomendado)

1. **Habilitar Depuración USB en tu celular:**
   - Ir a Ajustes > Acerca del teléfono
   - Tocar 7 veces en "Número de compilación"
   - Volver a Ajustes > Opciones de desarrollador
   - Activar "Depuración USB"

2. **Conectar el celular por USB:**
   ```bash
   # Verificar que el dispositivo está conectado
   adb devices

   # Deberías ver algo como:
   # List of devices attached
   # ABC123456789    device
   ```

3. **Ejecutar la app:**
   ```bash
   # Terminal 1: Iniciar Metro Bundler
   npm start

   # Terminal 2: Instalar y ejecutar en Android
   npm run android
   ```

### Opción 2: Emulador de Android Studio

1. **Crear un AVD (Android Virtual Device):**
   - Abrir Android Studio
   - Tools > Device Manager
   - Create Device
   - Seleccionar un dispositivo (ej: Pixel 5)
   - Descargar una imagen del sistema (ej: API 33)
   - Finish

2. **Iniciar el emulador:**
   ```bash
   # Listar emuladores disponibles
   emulator -list-avds

   # Iniciar un emulador
   emulator -avd Nombre_Del_AVD
   ```

3. **Ejecutar la app:**
   ```bash
   npm run android
   ```

## 🔌 Configuración del Backend

La app se conecta al backend en:
- **Emulador Android:** `http://10.0.2.2:3000/api`
- **Dispositivo físico:** Cambia la IP en `src/constants/config.ts`

**Para dispositivo físico:**

1. Obtener tu IP local:
   ```bash
   # Linux/Mac
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Editar `src/constants/config.ts`:
   ```typescript
   export const API_CONFIG = {
     BASE_URL: 'http://TU_IP_LOCAL:3000/api', // Ejemplo: http://192.168.1.100:3000/api
     TIMEOUT: 30000,
   };
   ```

3. **Importante:** El backend y el celular deben estar en la misma red WiFi.

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm start              # Iniciar Metro Bundler
npm run android        # Ejecutar en Android
npm run ios            # Ejecutar en iOS (solo Mac)

# Utilidades
npm run lint           # Ejecutar ESLint
npm test               # Ejecutar tests

# Limpiar caché
npm start -- --reset-cache
```

## 📂 Estructura del Proyecto

```
mobile/
├── android/              # Código nativo Android
├── ios/                  # Código nativo iOS
├── src/
│   ├── components/       # Componentes reutilizables
│   │   └── common/      # Button, Input, MatchCard
│   ├── constants/        # Configuraciones y constantes
│   ├── navigation/       # Configuración de navegación
│   ├── screens/          # Pantallas de la app
│   │   ├── Auth/        # Login, Register
│   │   ├── Home/        # Lista de partidos
│   │   ├── Match/       # Detalle de partido
│   │   └── Profile/     # Perfil de usuario
│   ├── services/         # API services
│   │   ├── api.ts       # Configuración de Axios
│   │   ├── auth.service.ts
│   │   ├── matches.service.ts
│   │   └── users.service.ts
│   ├── store/            # Estado global (Zustand)
│   │   ├── authStore.ts
│   │   └── matchesStore.ts
│   ├── types/            # TypeScript types
│   └── utils/            # Utilidades
├── App.tsx               # Componente raíz
├── index.js              # Entry point
└── package.json
```

## 🐛 Solución de Problemas

### Error: "Unable to load script"
```bash
# Limpiar caché y reinstalar
rm -rf node_modules
npm install
npm start -- --reset-cache
```

### Error: "Command failed: ./gradlew app:installDebug"
```bash
# Ir a android/ y ejecutar
cd android
./gradlew clean
cd ..
npm run android
```

### El celular no se detecta
```bash
# Verificar conexión
adb devices

# Si aparece "unauthorized", aceptá en el celular el mensaje de USB debugging

# Reiniciar adb
adb kill-server
adb start-server
```

### Error de red en dispositivo físico
- Verificá que el celular y la PC estén en la misma WiFi
- Cambiá la IP en `src/constants/config.ts` a tu IP local
- Desactivá el firewall temporalmente

## 📸 Capturas

La app incluye:
- Pantalla de Login/Registro
- Home con lista de partidos
- Detalle completo de cada partido
- Perfil de usuario con estadísticas
- Navegación fluida con tabs

## 🔐 Autenticación

La app usa JWT tokens con refresh tokens:
- Los tokens se guardan en AsyncStorage
- Auto-refresh cuando el token expira
- Navegación automática entre Auth/Home según estado

## 🎨 Diseño

- UI moderna y limpia
- Colores: #007AFF (primary), #34C759 (success)
- Tipografía San Francisco (iOS) / Roboto (Android)
- Componentes reutilizables
- Responsive design

## 🚧 Próximas Funcionalidades

- [ ] Sistema de amigos
- [ ] Chat en tiempo real
- [ ] Notificaciones push
- [ ] Modo "Quiero Jugar Ya"
- [ ] Sistema de ACK pre-partido
- [ ] Filtros avanzados
- [ ] Geolocalización
- [ ] Compartir partidos

## 📄 Licencia

Privado - Todos los derechos reservados

---

**¿Problemas?** Abrí un issue en el repositorio.

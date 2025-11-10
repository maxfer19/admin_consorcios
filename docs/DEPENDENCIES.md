# Dependencias del Proyecto Komunidad

Este documento detalla las versiones de las dependencias principales del proyecto y por qué se eligieron estas versiones específicas.

## Frontend

### Core Framework
- **Next.js**: `14.2.18`
  - Última versión estable de Next.js 14
  - Mejor compatibilidad con el ecosistema React
  - Soporte completo de App Router
  - Evita problemas de dependencias peer con React 19

- **React**: `18.3.1`
  - Versión estable y ampliamente adoptada
  - Excelente soporte de bibliotecas de terceros
  - Mejor documentación y ejemplos
  - Compatible con Next.js 14.2.x

- **React DOM**: `18.3.1`
  - Debe coincidir con la versión de React

### UI y Estilos
- **Tailwind CSS**: `3.4.13`
- **lucide-react**: `0.454.0` - Iconos SVG de alta calidad
- **clsx**: `2.1.1` - Utilidad para clases condicionales
- **tailwind-merge**: `2.5.2` - Merge de clases Tailwind

### Estado y Forms
- **Zustand**: `4.5.5` - Gestión de estado global
- **React Hook Form**: `7.53.0` - Manejo de formularios
- **Zod**: `3.23.8` - Validación de esquemas

### HTTP y Comunicación
- **Axios**: `1.7.7` - Cliente HTTP
- **Socket.io Client**: `4.7.5` - WebSocket para tiempo real

### Utilidades
- **date-fns**: `3.6.0` - Manipulación de fechas
- **react-hot-toast**: `2.4.1` - Notificaciones toast
- **recharts**: `2.12.7` - Gráficos y visualizaciones

### TypeScript y Tipos
- **TypeScript**: `5.6.2`
- **@types/react**: `18.3.12`
- **@types/react-dom**: `18.3.1`
- **@types/node**: `22.7.4`

### Linting
- **ESLint**: `8.57.1`
- **eslint-config-next**: `14.2.18`

## Backend

### Runtime y Framework
- **Node.js**: `20.x` (Alpine en Docker)
- **Express**: `4.19.2`
- **TypeScript**: `5.6.2`

### Base de Datos
- **PostgreSQL**: `16-alpine`
- **pg**: `8.12.0` - Driver de PostgreSQL
- **Redis**: `7-alpine`

### Autenticación y Seguridad
- **jsonwebtoken**: `9.0.2` - JWT para autenticación
- **bcryptjs**: `2.4.3` - Hash de contraseñas
- **helmet**: `7.1.0` - Headers de seguridad
- **express-rate-limit**: `7.4.0` - Rate limiting

### Middleware
- **cors**: `2.8.5`
- **compression**: `1.7.4`
- **morgan**: `1.10.0` - Logger HTTP
- **dotenv**: `16.4.5` - Variables de entorno

### Validación y Utilidades
- **express-validator**: `7.2.0`
- **date-fns**: `3.6.0`
- **multer**: `1.4.5-lts.1` - Manejo de archivos
- **nodemailer**: `6.9.15` - Envío de emails
- **pdfkit**: `0.15.0` - Generación de PDFs

### Real-time
- **socket.io**: `4.7.5`

### Testing
- **jest**: `29.7.0`
- **@types/jest**: `29.5.13`

## Compatibilidad de Versiones

### ¿Por qué Next.js 14 y no Next.js 15?

Next.js 15 requiere React 19 RC, que aún está en desarrollo y tiene:
- Menor soporte de bibliotecas de terceros
- Posibles breaking changes
- Menos documentación y ejemplos
- Dependencias peer más estrictas

Next.js 14.2.18 ofrece:
- Estabilidad probada en producción
- Amplio soporte del ecosistema
- App Router completamente funcional
- Mejor compatibilidad con herramientas de desarrollo

### Actualización Futura

Cuando React 19 se estabilice completamente (probablemente Q1-Q2 2025), podemos actualizar:

```bash
# Futuro upgrade a Next.js 15+ y React 19
npm install next@latest react@latest react-dom@latest
npm install -D @types/react@latest @types/react-dom@latest eslint-config-next@latest
```

## Resolución de Problemas

### Error: ERESOLVE unable to resolve dependency tree

Este error ocurre cuando hay conflictos de versiones peer. Soluciones:

1. **Opción 1**: Usar versiones compatibles (actual)
2. **Opción 2**: Forzar instalación (no recomendado)
   ```bash
   npm install --legacy-peer-deps
   ```
3. **Opción 3**: Forzar resolución (puede romper cosas)
   ```bash
   npm install --force
   ```

### Verificar Compatibilidad

Antes de actualizar dependencias importantes:

```bash
# Ver dependencias peer requeridas
npm info next@15.0.3 peerDependencies

# Ver árbol de dependencias
npm ls react
npm ls react-dom
```

## Actualización de Dependencias

### Actualización Menor (Segura)
```bash
# Actualizar patches y minor versions
npm update

# O específicamente
npm update next react react-dom
```

### Actualización Mayor (Requiere Testing)
```bash
# Ver versiones disponibles
npm outdated

# Actualizar con cuidado
npm install next@latest --save-exact
```

## Docker y Node.js

### Versión de Node.js en Docker

Usamos `node:20-alpine` porque:
- Node.js 20 es la versión LTS actual
- Alpine Linux reduce el tamaño de las imágenes (~5x más pequeño)
- Mejor performance en contenedores
- Soporte a largo plazo hasta Abril 2026

## Referencias

- [Next.js Releases](https://github.com/vercel/next.js/releases)
- [React Releases](https://react.dev/blog)
- [Node.js Release Schedule](https://nodejs.org/en/about/releases/)
- [Can I Use Next.js 15?](https://nextjs.org/docs/app/building-your-application/upgrading)

---

**Última actualización**: Noviembre 2024
**Revisión recomendada**: Cada 3 meses

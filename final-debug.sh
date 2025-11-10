#!/bin/bash
# Script de verificación FINAL - Debugging completo

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

clear
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}🔍 VERIFICACIÓN COMPLETA - Komunidad Login${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""

SERVER_IP=$(hostname -I | awk '{print $1}')

echo -e "${BLUE}📍 IP del Servidor: ${SERVER_IP}${NC}"
echo ""

# 1. Estado de contenedores
echo "═══ 1. Estado de Contenedores ═══"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=komunidad"
echo ""

# 2. Variables de entorno del BACKEND
echo "═══ 2. Variables de Entorno del BACKEND ═══"
echo -n "  CORS_ORIGIN: "
docker exec komunidad-backend printenv CORS_ORIGIN 2>/dev/null || echo "NO CONFIGURADO"
echo -n "  NODE_ENV: "
docker exec komunidad-backend printenv NODE_ENV 2>/dev/null || echo "NO CONFIGURADO"
echo -n "  PORT: "
docker exec komunidad-backend printenv PORT 2>/dev/null || echo "NO CONFIGURADO"
echo ""

# 3. Variables de entorno del FRONTEND
echo "═══ 3. Variables de Entorno del FRONTEND ═══"
echo -n "  NEXT_PUBLIC_API_URL: "
docker exec komunidad-frontend printenv NEXT_PUBLIC_API_URL 2>/dev/null || echo "NO CONFIGURADO"
echo ""

# 4. Test Backend desde el servidor
echo "═══ 4. Test Backend (desde servidor) ═══"
echo "  Endpoint: http://localhost:4000/api/v1/auth/login"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"00000000","password":"admin123"}' 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "  ${GREEN}✅ Login exitoso (200 OK)${NC}"
    echo "  Token: $(echo "$BODY" | jq -r '.token' 2>/dev/null | cut -c1-50)..."
else
    echo -e "  ${RED}❌ Login falló ($HTTP_CODE)${NC}"
    echo "  Response: $BODY"
fi
echo ""

# 5. Test Backend desde IP de red
echo "═══ 5. Test Backend (desde IP de red) ═══"
echo "  Endpoint: http://${SERVER_IP}:4000/api/v1/auth/login"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://${SERVER_IP}:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"00000000","password":"admin123"}' 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "  ${GREEN}✅ Login exitoso (200 OK)${NC}"
else
    echo -e "  ${RED}❌ Login falló ($HTTP_CODE)${NC}"
    echo "  Response: $BODY"
fi
echo ""

# 6. Test CORS
echo "═══ 6. Test CORS ═══"
echo "  Verificando si el backend acepta peticiones desde el frontend..."
echo ""

CORS_HEADER=$(curl -s -I -X OPTIONS http://localhost:4000/api/v1/auth/login \
  -H "Origin: http://${SERVER_IP}:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" 2>/dev/null | grep -i "access-control-allow-origin" || echo "")

if [ ! -z "$CORS_HEADER" ]; then
    echo -e "  ${GREEN}✅ CORS configurado correctamente${NC}"
    echo "  $CORS_HEADER"
else
    echo -e "  ${YELLOW}⚠️  CORS header no encontrado${NC}"
fi
echo ""

# 7. Test Frontend
echo "═══ 7. Test Frontend ═══"
echo -n "  http://localhost:3000: "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Responde${NC}"
else
    echo -e "${RED}❌ No responde${NC}"
fi

echo -n "  http://${SERVER_IP}:3000: "
if curl -s http://${SERVER_IP}:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Responde${NC}"
else
    echo -e "${RED}❌ No responde${NC}"
fi
echo ""

# 8. Logs recientes
echo "═══ 8. Logs Recientes del Backend ═══"
docker logs komunidad-backend --tail 15 2>&1 | grep -E "(POST|GET|Error|error|Login|login|401|200)" || echo "  (Sin actividad reciente)"
echo ""

# 9. Verificar código fuente del frontend
echo "═══ 9. API Service del Frontend ═══"
echo "  Verificando services/api.ts en el contenedor..."
echo ""

if docker exec komunidad-frontend test -f /app/src/services/api.ts; then
    echo "  Primeras 10 líneas del api.ts:"
    docker exec komunidad-frontend head -n 10 /app/src/services/api.ts
else
    echo -e "  ${RED}❌ Archivo api.ts no encontrado${NC}"
fi
echo ""

# 10. Resumen y recomendaciones
echo "════════════════════════════════════════════════════════════"
echo -e "${BLUE}📋 RESUMEN${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""

echo -e "${YELLOW}URLs para acceder desde Windows:${NC}"
echo "  🌐 Frontend:  http://${SERVER_IP}:3000"
echo "  🔌 Backend:   http://${SERVER_IP}:4000/api/v1"
echo "  🐛 Debug:     http://${SERVER_IP}:8080/debug-frontend-login.html"
echo ""

echo -e "${YELLOW}Credenciales:${NC}"
echo "  DNI: 00000000"
echo "  Password: admin123"
echo ""

echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}🧪 PRUEBAS A REALIZAR:${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "1️⃣  Desde tu Windows, abre el navegador y ve a:"
echo "    http://${SERVER_IP}:8080/debug-frontend-login.html"
echo ""
echo "    - En 'Backend API URL' pon: http://${SERVER_IP}:4000/api/v1"
echo "    - Click en 'Probar Login'"
echo "    - ¿Qué resultado te da? (Copia y pega el output)"
echo ""

echo "2️⃣  Desde tu Windows, abre:"
echo "    http://${SERVER_IP}:3000"
echo ""
echo "    - Intenta hacer login"
echo "    - Abre DevTools (F12) y ve a la pestaña Console"
echo "    - Ve también a la pestaña Network"
echo "    - ¿Qué errores ves?"
echo ""

echo "3️⃣  Si el debug HTML funciona pero el frontend no:"
echo "    - El problema está en el código del frontend"
echo "    - Necesito ver los logs del navegador (F12 → Console)"
echo ""

echo "════════════════════════════════════════════════════════════"

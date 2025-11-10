#!/bin/bash
# Script para verificar y arrancar el frontend después de timeout

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Verificando estado de servicios...${NC}"
echo ""

docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${YELLOW}Verificando qué servicios están corriendo...${NC}"
echo ""

BACKEND_RUNNING=$(docker ps --filter "name=komunidad-backend" --filter "status=running" -q)
DB_RUNNING=$(docker ps --filter "name=komunidad-db" --filter "status=running" -q)
REDIS_RUNNING=$(docker ps --filter "name=komunidad-redis" --filter "status=running" -q)
FRONTEND_RUNNING=$(docker ps --filter "name=komunidad-frontend" --filter "status=running" -q)

if [ ! -z "$BACKEND_RUNNING" ]; then
    echo -e "  ✅ Backend corriendo"
else
    echo -e "  ❌ Backend NO está corriendo"
fi

if [ ! -z "$DB_RUNNING" ]; then
    echo -e "  ✅ PostgreSQL corriendo"
else
    echo -e "  ❌ PostgreSQL NO está corriendo"
fi

if [ ! -z "$REDIS_RUNNING" ]; then
    echo -e "  ✅ Redis corriendo"
else
    echo -e "  ❌ Redis NO está corriendo"
fi

if [ ! -z "$FRONTEND_RUNNING" ]; then
    echo -e "  ✅ Frontend corriendo"
else
    echo -e "  ⚠️  Frontend NO está corriendo (normal después de timeout)"
fi

echo ""

# Si frontend no está corriendo, intentar iniciarlo
if [ -z "$FRONTEND_RUNNING" ]; then
    echo -e "${YELLOW}Iniciando frontend (puede tardar 1-2 minutos)...${NC}"

    # Verificar si el contenedor existe pero está detenido
    FRONTEND_EXISTS=$(docker ps -a --filter "name=komunidad-frontend" -q)

    if [ ! -z "$FRONTEND_EXISTS" ]; then
        echo "  Contenedor existe, iniciándolo..."
        docker start komunidad-frontend
    else
        echo "  Contenedor no existe, creándolo..."
        export COMPOSE_HTTP_TIMEOUT=300
        docker-compose up -d frontend
    fi

    echo ""
    echo -e "${YELLOW}Esperando a que frontend esté listo...${NC}"
    echo "  (Esto puede tomar 1-2 minutos)"

    for i in {1..60}; do
        if docker ps --filter "name=komunidad-frontend" --filter "status=running" -q > /dev/null 2>&1; then
            sleep 2
            echo ""
            echo -e "  ${GREEN}✅ Frontend iniciado después de ${i} segundos${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
    echo ""
fi

echo ""
echo -e "${YELLOW}📊 Estado final de contenedores:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${YELLOW}🧪 Probando endpoints...${NC}"
echo ""

# Test Backend Health
echo -n "  Backend Health: "
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Test Backend API
echo -n "  Backend API: "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"00000000","password":"admin123"}' 2>/dev/null)

if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ OK (Login funciona)${NC}"
elif [ "$RESPONSE" = "401" ]; then
    echo -e "${YELLOW}⚠️  Backend OK pero credenciales fallan (ejecuta ./fix-superadmin.sh)${NC}"
else
    echo -e "${RED}❌ FAIL (código: $RESPONSE)${NC}"
fi

# Test Frontend
echo -n "  Frontend: "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Aún iniciando... (espera 1 minuto más)${NC}"
fi

echo ""
echo "════════════════════════════════════════════"
echo -e "${GREEN}📱 URLs de Acceso:${NC}"
echo "════════════════════════════════════════════"
echo ""

SERVER_IP=$(hostname -I | awk '{print $1}')

echo "Desde el servidor (localhost):"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:4000/api/v1"
echo "  Health:    http://localhost:4000/health"
echo ""
echo "Desde la red local:"
echo "  Frontend:  http://${SERVER_IP}:3000"
echo "  Backend:   http://${SERVER_IP}:4000/api/v1"
echo "  Health:    http://${SERVER_IP}:4000/health"
echo ""
echo "Debug HTML:"
echo "  http://${SERVER_IP}:8080/debug-frontend-login.html"
echo "  (usa Backend API URL: http://${SERVER_IP}:4000/api/v1)"
echo ""
echo "════════════════════════════════════════════"
echo ""
echo -e "${GREEN}Credenciales:${NC}"
echo "  DNI: 00000000"
echo "  Password: admin123"
echo ""

# Ver logs del frontend si está corriendo
if docker ps --filter "name=komunidad-frontend" --filter "status=running" -q > /dev/null 2>&1; then
    echo -e "${YELLOW}📋 Últimas líneas de logs del frontend:${NC}"
    docker logs komunidad-frontend --tail 10
fi

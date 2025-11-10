#!/bin/bash
# Script de reparación para el error ContainerConfig de Docker
# Este script limpia los contenedores corruptos y reinicia todo limpiamente

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Komunidad - Script de Reparación Docker${NC}"
echo ""
echo "Este script va a:"
echo "  1. Detener todos los contenedores"
echo "  2. Eliminar el contenedor corrupto del backend"
echo "  3. Limpiar la metadata corrupta"
echo "  4. Reconstruir y reiniciar todo"
echo ""
echo -e "${RED}IMPORTANTE: Esto NO eliminará los datos de la base de datos${NC}"
echo ""
read -p "¿Continuar? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operación cancelada"
    exit 1
fi

echo ""
echo -e "${YELLOW}Paso 1: Deteniendo servicios...${NC}"
docker-compose down || true

echo ""
echo -e "${YELLOW}Paso 2: Eliminando contenedor corrupto del backend...${NC}"
docker rm -f komunidad-backend 2>/dev/null || true
docker rm -f 1840522b0f9c_komunidad-backend 2>/dev/null || true

echo ""
echo -e "${YELLOW}Paso 3: Eliminando la imagen corrupta del backend...${NC}"
docker rmi -f admin_consorcios-claude-consorcio-app-structure-design-011cuwkgd38yg94pm72s7jsf_backend 2>/dev/null || true

echo ""
echo -e "${YELLOW}Paso 4: Limpiando contenedores sin usar...${NC}"
docker container prune -f

echo ""
echo -e "${YELLOW}Paso 5: Reconstruyendo el backend desde cero...${NC}"
export COMPOSE_HTTP_TIMEOUT=120
docker-compose build --no-cache backend

echo ""
echo -e "${YELLOW}Paso 6: Iniciando todos los servicios...${NC}"
docker-compose up -d

echo ""
echo -e "${YELLOW}Paso 7: Esperando a que los servicios estén listos...${NC}"
sleep 10

echo ""
echo -e "${GREEN}✅ Reparación completada!${NC}"
echo ""
echo -e "${GREEN}📊 Estado de contenedores:${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}🌐 URLs de acceso:${NC}"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:4000"
echo "  Health:    http://localhost:4000/health"
echo ""
echo -e "${YELLOW}💡 Para ver los logs: docker-compose logs -f${NC}"

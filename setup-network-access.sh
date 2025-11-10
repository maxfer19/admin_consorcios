#!/bin/bash
# Script para configurar acceso desde red local

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🌐 Configuración de Acceso por Red Local${NC}"
echo "=============================================="
echo ""

# Detectar IP del servidor
SERVER_IP=$(hostname -I | awk '{print $1}')

if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}❌ No se pudo detectar la IP del servidor${NC}"
    echo "Por favor ingresa la IP manualmente:"
    read -p "IP del servidor: " SERVER_IP
fi

echo -e "${YELLOW}📍 IP del servidor detectada: ${SERVER_IP}${NC}"
echo ""

# Confirmar
echo "Esta configuración permitirá acceso desde:"
echo "  - localhost (127.0.0.1)"
echo "  - ${SERVER_IP} (red local)"
echo ""
read -p "¿Continuar? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operación cancelada"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 1: Actualizando docker-compose.yml...${NC}"

# Backup
cp docker-compose.yml docker-compose.yml.backup
echo "  ✅ Backup creado: docker-compose.yml.backup"

# Update CORS_ORIGIN for backend
sed -i "s|CORS_ORIGIN: http://localhost:3000|CORS_ORIGIN: http://localhost:3000,http://${SERVER_IP}:3000|g" docker-compose.yml

# Update NEXT_PUBLIC_API_URL for frontend to use server IP
sed -i "s|NEXT_PUBLIC_API_URL: http://localhost:4000|NEXT_PUBLIC_API_URL: http://${SERVER_IP}:4000|g" docker-compose.yml

echo "  ✅ docker-compose.yml actualizado"
echo ""

echo -e "${YELLOW}Step 2: Mostrando cambios...${NC}"
echo ""
echo "Backend CORS_ORIGIN:"
grep "CORS_ORIGIN:" docker-compose.yml
echo ""
echo "Frontend API_URL:"
grep "NEXT_PUBLIC_API_URL:" docker-compose.yml
echo ""

echo -e "${YELLOW}Step 3: Reiniciando servicios...${NC}"
docker-compose down
echo "  ✅ Servicios detenidos"
echo ""
docker-compose up -d
echo "  ✅ Servicios iniciados"
echo ""

echo -e "${YELLOW}Step 4: Esperando a que los servicios estén listos...${NC}"
sleep 10

echo -e "${GREEN}✅ Configuración completada!${NC}"
echo ""
echo "════════════════════════════════════════════"
echo -e "${GREEN}📱 URLs de Acceso:${NC}"
echo "════════════════════════════════════════════"
echo ""
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
echo "  (usa: http://${SERVER_IP}:4000/api/v1 como Backend API URL)"
echo ""
echo "════════════════════════════════════════════"
echo ""

# Test health
echo -e "${YELLOW}Testing health endpoint...${NC}"
sleep 2
curl -s http://localhost:4000/health | jq '.' 2>/dev/null || curl -s http://localhost:4000/health

echo ""
echo ""
echo -e "${GREEN}🎉 Todo listo!${NC}"
echo ""
echo -e "${YELLOW}Ahora puedes:${NC}"
echo "  1. Abrir http://${SERVER_IP}:3000 en tu navegador"
echo "  2. Hacer login con DNI: 00000000, Password: admin123"
echo ""
echo -e "${YELLOW}Si necesitas revertir los cambios:${NC}"
echo "  cp docker-compose.yml.backup docker-compose.yml"
echo "  docker-compose restart"
echo ""

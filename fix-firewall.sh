#!/bin/bash
# Script para abrir puertos en el firewall y verificar conectividad

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

clear
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}🔥 Configuración de Firewall para Komunidad${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""

SERVER_IP=$(hostname -I | awk '{print $1}')
echo -e "${BLUE}📍 IP del Servidor: ${SERVER_IP}${NC}"
echo ""

# 1. Verificar estado del firewall
echo "═══ 1. Verificando Firewall (UFW) ═══"
echo ""

if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status | head -n1)
    echo "  Estado: $UFW_STATUS"
    echo ""

    if [[ "$UFW_STATUS" == *"active"* ]]; then
        echo -e "  ${YELLOW}⚠️  Firewall está activo${NC}"
        echo "  Reglas actuales:"
        sudo ufw status numbered | grep -E "(3000|4000|8080)" || echo "    (Sin reglas para puertos 3000, 4000, 8080)"
        echo ""

        echo -e "${YELLOW}¿Deseas abrir los puertos necesarios? (s/n)${NC}"
        read -p "  Respuesta: " -n 1 -r
        echo ""

        if [[ $REPLY =~ ^[Ss]$ ]]; then
            echo ""
            echo "  Abriendo puertos..."
            sudo ufw allow 3000/tcp comment 'Komunidad Frontend'
            sudo ufw allow 4000/tcp comment 'Komunidad Backend'
            sudo ufw allow 8080/tcp comment 'Debug Server'
            echo ""
            echo -e "  ${GREEN}✅ Puertos abiertos${NC}"
            echo ""
            echo "  Reglas actualizadas:"
            sudo ufw status numbered | grep -E "(3000|4000|8080)"
        else
            echo ""
            echo -e "  ${RED}❌ Puertos NO fueron abiertos${NC}"
            echo "  El acceso desde Windows seguirá bloqueado."
            echo ""
        fi
    else
        echo -e "  ${GREEN}✅ Firewall está inactivo (no bloqueará conexiones)${NC}"
    fi
else
    echo -e "  ${GREEN}✅ UFW no está instalado (firewall no activo)${NC}"
fi
echo ""

# 2. Verificar en qué interfaces escuchan los puertos
echo "═══ 2. Verificando Puertos y Interfaces ═══"
echo ""

echo "  Puertos escuchando:"
echo ""

# Puerto 3000 (Frontend)
PORT_3000=$(sudo netstat -tlnp 2>/dev/null | grep :3000 || sudo ss -tlnp 2>/dev/null | grep :3000 || echo "")
if [ ! -z "$PORT_3000" ]; then
    if [[ "$PORT_3000" == *"0.0.0.0:3000"* ]] || [[ "$PORT_3000" == *":::3000"* ]]; then
        echo -e "    ${GREEN}✅ Puerto 3000 (Frontend) - Escuchando en TODAS las interfaces${NC}"
    elif [[ "$PORT_3000" == *"127.0.0.1:3000"* ]]; then
        echo -e "    ${RED}❌ Puerto 3000 (Frontend) - Solo escuchando en localhost${NC}"
        echo "       Esto es un PROBLEMA - No accesible desde red"
    fi
    echo "       $PORT_3000"
else
    echo -e "    ${RED}❌ Puerto 3000 (Frontend) - NO está escuchando${NC}"
fi
echo ""

# Puerto 4000 (Backend)
PORT_4000=$(sudo netstat -tlnp 2>/dev/null | grep :4000 || sudo ss -tlnp 2>/dev/null | grep :4000 || echo "")
if [ ! -z "$PORT_4000" ]; then
    if [[ "$PORT_4000" == *"0.0.0.0:4000"* ]] || [[ "$PORT_4000" == *":::4000"* ]]; then
        echo -e "    ${GREEN}✅ Puerto 4000 (Backend) - Escuchando en TODAS las interfaces${NC}"
    elif [[ "$PORT_4000" == *"127.0.0.1:4000"* ]]; then
        echo -e "    ${RED}❌ Puerto 4000 (Backend) - Solo escuchando en localhost${NC}"
        echo "       Esto es un PROBLEMA - No accesible desde red"
    fi
    echo "       $PORT_4000"
else
    echo -e "    ${RED}❌ Puerto 4000 (Backend) - NO está escuchando${NC}"
fi
echo ""

# Puerto 8080 (Debug HTML)
PORT_8080=$(sudo netstat -tlnp 2>/dev/null | grep :8080 || sudo ss -tlnp 2>/dev/null | grep :8080 || echo "")
if [ ! -z "$PORT_8080" ]; then
    if [[ "$PORT_8080" == *"0.0.0.0:8080"* ]] || [[ "$PORT_8080" == *":::8080"* ]]; then
        echo -e "    ${GREEN}✅ Puerto 8080 (Debug) - Escuchando en TODAS las interfaces${NC}"
    elif [[ "$PORT_8080" == *"127.0.0.1:8080"* ]]; then
        echo -e "    ${YELLOW}⚠️  Puerto 8080 (Debug) - Solo escuchando en localhost${NC}"
    fi
    echo "       $PORT_8080"
else
    echo -e "    ${YELLOW}⚠️  Puerto 8080 (Debug) - NO está escuchando${NC}"
    echo "       (Es normal si no ejecutaste python3 -m http.server 8080)"
fi
echo ""

# 3. Test de conectividad desde el servidor mismo
echo "═══ 3. Test desde el Servidor (localhost) ═══"
echo ""

echo "  Backend Health:"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health 2>/dev/null)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "    ${GREEN}✅ http://localhost:4000/health - OK${NC}"
else
    echo -e "    ${RED}❌ http://localhost:4000/health - FAIL (código: $HEALTH_RESPONSE)${NC}"
fi
echo ""

echo "  Backend Login:"
LOGIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"00000000","password":"admin123"}' 2>/dev/null)
if [ "$LOGIN_RESPONSE" = "200" ]; then
    echo -e "    ${GREEN}✅ http://localhost:4000/api/v1/auth/login - OK${NC}"
else
    echo -e "    ${YELLOW}⚠️  http://localhost:4000/api/v1/auth/login - código: $LOGIN_RESPONSE${NC}"
fi
echo ""

# 4. Test desde IP de red
echo "═══ 4. Test desde IP de Red (${SERVER_IP}) ═══"
echo ""

echo "  Backend Health:"
HEALTH_RESPONSE_IP=$(curl -s -o /dev/null -w "%{http_code}" http://${SERVER_IP}:4000/health 2>/dev/null || echo "000")
if [ "$HEALTH_RESPONSE_IP" = "200" ]; then
    echo -e "    ${GREEN}✅ http://${SERVER_IP}:4000/health - OK${NC}"
    echo -e "    ${GREEN}   El puerto 4000 ES accesible desde la red${NC}"
else
    echo -e "    ${RED}❌ http://${SERVER_IP}:4000/health - FAIL (código: $HEALTH_RESPONSE_IP)${NC}"
    echo -e "    ${RED}   El puerto 4000 NO es accesible desde la red${NC}"
    echo "    Causa: Firewall o Docker bind incorrecto"
fi
echo ""

# 5. Verificar docker-compose.yml
echo "═══ 5. Verificando docker-compose.yml ═══"
echo ""

if [ -f "docker-compose.yml" ]; then
    echo "  Configuración de puertos:"
    grep -A2 "ports:" docker-compose.yml | grep -E "(3000|4000)" || echo "    (No encontrado)"
    echo ""

    # Verificar si hay bind a localhost
    if grep -q "127.0.0.1:4000" docker-compose.yml; then
        echo -e "  ${RED}❌ PROBLEMA ENCONTRADO:${NC}"
        echo "     docker-compose.yml tiene bind a 127.0.0.1"
        echo "     Esto hace que SOLO sea accesible desde localhost"
        echo ""
        echo "  Debe ser:"
        echo "    ports:"
        echo "      - \"4000:4000\"  # Correcto - todas las interfaces"
        echo ""
        echo "  NO debe ser:"
        echo "    ports:"
        echo "      - \"127.0.0.1:4000:4000\"  # Incorrecto"
    fi
fi
echo ""

# 6. Resumen
echo "════════════════════════════════════════════════════════════"
echo -e "${BLUE}📋 RESUMEN Y ACCIONES${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ "$HEALTH_RESPONSE_IP" = "200" ]; then
    echo -e "${GREEN}✅ El backend ES accesible desde la red${NC}"
    echo ""
    echo "  Desde tu Windows, deberías poder:"
    echo "  - Abrir: http://${SERVER_IP}:3000 (Frontend)"
    echo "  - Abrir: http://${SERVER_IP}:4000/health (Backend Health)"
    echo "  - Usar debug HTML: http://${SERVER_IP}:8080/debug-frontend-login.html"
    echo "            con API URL: http://${SERVER_IP}:4000/api/v1"
    echo ""
    echo "  Si aún falla, el problema está en:"
    echo "  1. Firewall de Windows bloqueando"
    echo "  2. Firewall del router"
    echo "  3. Problema de red"
else
    echo -e "${RED}❌ El backend NO es accesible desde la red${NC}"
    echo ""
    echo -e "${YELLOW}ACCIONES REQUERIDAS:${NC}"
    echo ""

    if command -v ufw &> /dev/null; then
        UFW_STATUS=$(sudo ufw status | head -n1)
        if [[ "$UFW_STATUS" == *"active"* ]]; then
            echo "  1️⃣  Abrir puertos en el firewall:"
            echo "      sudo ufw allow 3000/tcp"
            echo "      sudo ufw allow 4000/tcp"
            echo "      sudo ufw allow 8080/tcp"
            echo ""
        fi
    fi

    echo "  2️⃣  Reiniciar Docker para aplicar cambios:"
    echo "      docker-compose restart"
    echo ""

    echo "  3️⃣  Verificar de nuevo:"
    echo "      curl http://${SERVER_IP}:4000/health"
fi

echo ""
echo "════════════════════════════════════════════════════════════"

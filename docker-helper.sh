#!/bin/bash
# Komunidad Docker Helper Script
# Este script facilita las operaciones comunes de Docker

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏢 Komunidad - Docker Helper${NC}"
echo ""

# Función para mostrar el menú
show_menu() {
    echo "Selecciona una opción:"
    echo ""
    echo "  1) 🚀 Iniciar todo (build + up)"
    echo "  2) ▶️  Iniciar servicios existentes"
    echo "  3) ⏹️  Detener servicios"
    echo "  4) 🔄 Reiniciar servicios"
    echo "  5) 🔨 Reconstruir todo (clean build)"
    echo "  6) 📋 Ver logs"
    echo "  7) 🔍 Ver estado de contenedores"
    echo "  8) 🧹 Limpiar todo (contenedores + volúmenes)"
    echo "  9) 🐛 Debug: Iniciar frontend manualmente"
    echo " 10) 📊 Ver logs en tiempo real"
    echo "  0) ❌ Salir"
    echo ""
    echo -n "Opción: "
}

# Función para iniciar todo
start_all() {
    echo -e "${YELLOW}Iniciando todos los servicios...${NC}"
    export COMPOSE_HTTP_TIMEOUT=120
    docker-compose up -d --build

    echo ""
    echo -e "${GREEN}✅ Servicios iniciados!${NC}"
    echo ""
    echo "Esperando a que los servicios estén listos..."
    sleep 5

    # Verificar si el frontend inició correctamente
    if ! docker ps | grep -q komunidad-frontend; then
        echo -e "${YELLOW}⚠️  Frontend no se inició automáticamente, iniciándolo manualmente...${NC}"
        docker start komunidad-frontend
        sleep 3
    fi

    show_status
}

# Función para iniciar servicios
start_services() {
    echo -e "${YELLOW}Iniciando servicios...${NC}"
    docker-compose up -d

    sleep 3

    # Verificar si el frontend inició correctamente
    if ! docker ps | grep -q komunidad-frontend; then
        echo -e "${YELLOW}⚠️  Frontend no se inició, iniciándolo manualmente...${NC}"
        docker start komunidad-frontend
    fi

    echo -e "${GREEN}✅ Servicios iniciados!${NC}"
    show_status
}

# Función para detener servicios
stop_services() {
    echo -e "${YELLOW}Deteniendo servicios...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Servicios detenidos!${NC}"
}

# Función para reiniciar servicios
restart_services() {
    echo -e "${YELLOW}Reiniciando servicios...${NC}"
    docker-compose restart

    sleep 3

    # Verificar si el frontend reinició correctamente
    if ! docker ps | grep -q komunidad-frontend; then
        echo -e "${YELLOW}⚠️  Frontend no se reinició, iniciándolo manualmente...${NC}"
        docker start komunidad-frontend
    fi

    echo -e "${GREEN}✅ Servicios reiniciados!${NC}"
    show_status
}

# Función para reconstruir todo
rebuild_all() {
    echo -e "${RED}⚠️  Esto eliminará contenedores existentes y reconstruirá desde cero${NC}"
    echo -n "¿Continuar? (s/n): "
    read -r response

    if [[ "$response" =~ ^[Ss]$ ]]; then
        echo -e "${YELLOW}Deteniendo y eliminando contenedores...${NC}"
        docker-compose down

        echo -e "${YELLOW}Eliminando imágenes de Komunidad...${NC}"
        docker images | grep komunidad | awk '{print $3}' | xargs -r docker rmi -f

        echo -e "${YELLOW}Reconstruyendo...${NC}"
        export COMPOSE_HTTP_TIMEOUT=180
        docker-compose build --no-cache

        echo -e "${YELLOW}Iniciando servicios...${NC}"
        docker-compose up -d

        sleep 5

        # Verificar si el frontend inició
        if ! docker ps | grep -q komunidad-frontend; then
            echo -e "${YELLOW}⚠️  Frontend no se inició, iniciándolo manualmente...${NC}"
            docker start komunidad-frontend
        fi

        echo -e "${GREEN}✅ Reconstrucción completa!${NC}"
        show_status
    else
        echo -e "${YELLOW}Operación cancelada${NC}"
    fi
}

# Función para ver logs
view_logs() {
    echo "¿De qué servicio quieres ver los logs?"
    echo "1) Frontend"
    echo "2) Backend"
    echo "3) PostgreSQL"
    echo "4) Redis"
    echo "5) Todos"
    echo -n "Opción: "
    read -r log_option

    case $log_option in
        1) docker logs komunidad-frontend ;;
        2) docker logs komunidad-backend ;;
        3) docker logs komunidad-db ;;
        4) docker logs komunidad-redis ;;
        5) docker-compose logs ;;
        *) echo -e "${RED}Opción inválida${NC}" ;;
    esac
}

# Función para ver estado
show_status() {
    echo ""
    echo -e "${GREEN}📊 Estado de Contenedores:${NC}"
    docker ps -a --filter "name=komunidad" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo -e "${GREEN}🌐 URLs de Acceso:${NC}"
    echo "  Frontend:  http://localhost:3000"
    echo "  Backend:   http://localhost:4000"
    echo "  Health:    http://localhost:4000/health"
    echo "  PostgreSQL: localhost:5432"
    echo "  Redis:     localhost:6379"
    echo ""
}

# Función para limpiar todo
clean_all() {
    echo -e "${RED}⚠️  ADVERTENCIA: Esto eliminará TODOS los contenedores y volúmenes${NC}"
    echo -e "${RED}    Se perderán todos los datos de la base de datos!${NC}"
    echo -n "¿Estás seguro? (escribe 'SI' para continuar): "
    read -r response

    if [[ "$response" == "SI" ]]; then
        echo -e "${YELLOW}Deteniendo servicios...${NC}"
        docker-compose down -v

        echo -e "${YELLOW}Eliminando imágenes...${NC}"
        docker images | grep komunidad | awk '{print $3}' | xargs -r docker rmi -f

        echo -e "${YELLOW}Limpiando volúmenes...${NC}"
        docker volume prune -f

        echo -e "${GREEN}✅ Limpieza completa!${NC}"
    else
        echo -e "${YELLOW}Operación cancelada${NC}"
    fi
}

# Función para iniciar frontend manualmente
start_frontend_manual() {
    echo -e "${YELLOW}Iniciando frontend manualmente...${NC}"
    docker start komunidad-frontend
    sleep 2
    echo ""
    echo -e "${GREEN}Frontend logs:${NC}"
    docker logs komunidad-frontend
}

# Función para ver logs en tiempo real
follow_logs() {
    echo "¿De qué servicio quieres ver los logs en tiempo real?"
    echo "1) Frontend"
    echo "2) Backend"
    echo "3) PostgreSQL"
    echo "4) Redis"
    echo "5) Todos"
    echo -n "Opción: "
    read -r log_option

    echo -e "${YELLOW}Presiona Ctrl+C para salir${NC}"
    echo ""

    case $log_option in
        1) docker logs -f komunidad-frontend ;;
        2) docker logs -f komunidad-backend ;;
        3) docker logs -f komunidad-db ;;
        4) docker logs -f komunidad-redis ;;
        5) docker-compose logs -f ;;
        *) echo -e "${RED}Opción inválida${NC}" ;;
    esac
}

# Loop principal
while true; do
    show_menu
    read -r option
    echo ""

    case $option in
        1) start_all ;;
        2) start_services ;;
        3) stop_services ;;
        4) restart_services ;;
        5) rebuild_all ;;
        6) view_logs ;;
        7) show_status ;;
        8) clean_all ;;
        9) start_frontend_manual ;;
        10) follow_logs ;;
        0)
            echo -e "${GREEN}¡Hasta luego!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Opción inválida${NC}"
            ;;
    esac

    echo ""
    echo -e "${YELLOW}Presiona Enter para continuar...${NC}"
    read -r
    clear
done

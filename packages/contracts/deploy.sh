#!/bin/bash

# Script de ayuda para deploy de CrypteK
echo "🚀 CrypteK Deployment Script"
echo "============================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si existe .env
check_env() {
    if [ ! -f ".env" ]; then
        echo -e "${RED}❌ Archivo .env no encontrado${NC}"
        echo -e "${YELLOW}📝 Copia .env.example a .env y configura tus claves:${NC}"
        echo "   cp .env.example .env"
        echo "   # Edita .env con tu PRIVATE_KEY y API keys"
        exit 1
    fi
}

# Función para verificar Foundry
check_foundry() {
    if ! command -v forge &> /dev/null; then
        echo -e "${RED}❌ Foundry no está instalado${NC}"
        echo -e "${YELLOW}📦 Instala Foundry: https://book.getfoundry.sh/getting-started/installation${NC}"
        exit 1
    fi
}

# Función para deploy
deploy() {
    local network=$1
    echo -e "${GREEN}🔧 Deploying to $network...${NC}"

    if [ "$network" = "local" ]; then
        forge script script/Deploy.s.sol --fork-url http://localhost:8545 --broadcast --verify
    else
        forge script script/Deploy.s.sol --rpc-url $network --broadcast --verify
    fi
}

# Función para mostrar menú
show_menu() {
    echo -e "${GREEN}Selecciona la red para deploy:${NC}"
    echo "1) Local (Anvil)"
    echo "2) Sepolia (Ethereum testnet)"
    echo "3) Lisk Sepolia"
    echo "4) Polygon Mumbai"
    echo "5) Arbitrum Sepolia"
    echo "6) Salir"
    echo ""
}

# Main script
main() {
    check_foundry
    check_env

    while true; do
        show_menu
        read -p "Opción: " choice

        case $choice in
            1)
                echo -e "${YELLOW}⚠️  Asegúrate de tener Anvil corriendo en localhost:8545${NC}"
                deploy "local"
                ;;
            2)
                deploy "sepolia"
                ;;
            3)
                deploy "lisk_sepolia"
                ;;
            4)
                deploy "polygon_mumbai"
                ;;
            5)
                deploy "arbitrum_sepolia"
                ;;
            6)
                echo -e "${GREEN}👋 ¡Hasta luego!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Opción inválida${NC}"
                ;;
        esac

        echo ""
        read -p "¿Quieres hacer otro deploy? (y/n): " continue
        if [[ $continue != "y" && $continue != "Y" ]]; then
            break
        fi
    done
}

# Ejecutar script
main

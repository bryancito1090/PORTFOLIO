#!/usr/bin/env bash
# ==============================================================================
# Script de Despliegue Continuo / Actualización en el VPS
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "========================================================"
echo "🚀 INICIANDO DESPLIEGUE EN PRODUCCIÓN (PORTFOLIO)"
echo "========================================================"

cd "$ROOT_DIR"

echo "==> [1/4] Actualizando rama develop desde Forgejo..."
git fetch origin develop
git checkout develop
git pull origin develop

echo "==> [2/4] Verificando variables de entorno en deploy/.env..."
if [ ! -f "$SCRIPT_DIR/.env" ]; then
  echo "❌ Error: No existe el archivo $SCRIPT_DIR/.env"
  echo "   Copia $SCRIPT_DIR/.env.example a $SCRIPT_DIR/.env y rellena tus claves."
  exit 1
fi

echo "==> [3/4] Compilando y levantando contenedores Docker..."
cd "$SCRIPT_DIR"
docker compose -f docker-compose.prod.yml up -d --build

echo "==> [4/4] Comprobando salud de los servicios..."
sleep 5
docker compose -f docker-compose.prod.yml ps

echo "========================================================"
echo "✅ DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "   API disponible en: http://localhost:8080 o https://api.bryan-bano.com"
echo "========================================================"

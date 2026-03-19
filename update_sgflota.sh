#!/bin/bash
# Script de actualización rápida de SGFlota en producción
# Ejecutar desde /var/www/SGflota como root

set -e

APP_DIR="/var/www/SGflota"
cd $APP_DIR

echo "=== [1/5] Git pull ==="
git pull origin main

echo "=== [2/5] npm install ==="
npm install --legacy-peer-deps

echo "=== [3/5] Prisma generate ==="
npx prisma generate

echo "=== [4/5] Build ==="
npm run build

echo "=== [5/5] Copiar assets y reiniciar ==="
if [ -d ".next/standalone" ]; then
    # Copiar public (sin seguir el symlink de uploads)
    cp -r public .next/standalone/ 2>/dev/null || true
    # Copiar chunks estáticos (crítico para que el navegador cargue JS)
    cp -r .next/static .next/standalone/.next/ || true
    # Reparar symlink de uploads (evita loops infinitos)
    rm -rf .next/standalone/public/uploads
    ln -sf /var/www/uploads .next/standalone/public/uploads
fi

pm2 restart sgflota
pm2 save

echo ""
echo "================================================="
echo "Actualización completada."
pm2 list
echo "================================================="

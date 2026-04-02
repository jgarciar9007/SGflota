#!/bin/bash
# Script de actualización rápida de SGFlota en producción
# Ejecutar desde /var/www/SGflota como root

set -e

APP_DIR="/var/www/SGflota"
cd $APP_DIR

echo "=== [1/5] Git pull ==="
git pull origin main

echo "=== [1.5/5] Asegurar variables de entorno ==="
grep -q "OPENROUTER_API_KEY" .env 2>/dev/null || \
  echo 'OPENROUTER_API_KEY="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"' >> .env
# Asegurar que NEXTAUTH_URL usa el dominio con HTTPS (no IP)
sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL="https://urban-rentals.es"|' .env

echo "=== [2/5] npm install ==="
npm install --legacy-peer-deps

echo "=== [3/5] Prisma generate ==="
npx prisma generate

echo "=== [3.5/5] Restaurar symlink uploads antes del build ==="
mkdir -p /var/www/uploads/vehicles
rm -rf public/uploads
ln -sf /var/www/uploads public/uploads

echo "=== [4/5] Build ==="
npm run build

echo "=== [5/5] Copiar assets y reiniciar ==="

if [ -d ".next/standalone" ]; then
    # Copiar public EXCLUYENDO uploads (se gestiona como symlink a /var/www/uploads)
    mkdir -p .next/standalone/public
    find public -maxdepth 1 ! -name 'uploads' ! -name 'public' -exec cp -r {} .next/standalone/public/ \; 2>/dev/null || true
    # Copiar chunks estáticos (crítico para que el navegador cargue JS)
    cp -r .next/static .next/standalone/.next/ || true
    # Recrear symlink de uploads en standalone
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

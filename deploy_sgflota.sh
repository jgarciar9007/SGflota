#!/bin/bash
# Despliegue de SGFlota (Next.js) en Ubuntu VPS
# Ejecutar este script como superusuario (root)

set -e

echo "================================================="
echo "Iniciando despliegue de SGFlota en el servidor..."
echo "================================================="

# 1. Instalación de Software
echo "Actualizando sistema e instalando dependencias (Nginx, Git, PostgreSQL, curl)..."
export DEBIAN_FRONTEND=noninteractive
apt update
apt upgrade -y
apt install -y curl git nginx postgresql postgresql-contrib ufw

echo "Instalando Node.js (Version 20 LTS)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "Instalando PM2 globalmente..."
npm install -g pm2

# 2. Configuración de Base de Datos PostgreSQL
echo "Configurando PostgreSQL..."
# Comprobar si la base de datos ya existe para evitar errores
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'urban-rentals'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE \"urban-rentals\";"

# Comprobar si el usuario existe o crearlo y asignar permisos
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = 'jorge'" | grep -q 1 || sudo -u postgres psql -c "CREATE USER jorge WITH PASSWORD 'J*rg3.90';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE \"urban-rentals\" TO jorge;"
sudo -u postgres psql -d urban-rentals -c "GRANT ALL ON SCHEMA public TO jorge;"

# 3. Descarga de Código
APP_DIR="/var/www/SGflota"
if [ -d "$APP_DIR" ]; then
    echo "El directorio ya existe. Navegando al directorio y haciendo pull..."
    cd $APP_DIR
    git pull origin main
else
    echo "Clonando repositorio..."
    mkdir -p /var/www
    cd /var/www
    git clone https://github.com/jgarciar9007/SGflota SGflota
    cd $APP_DIR
fi

# 4. Entorno (.env)
echo "Configurando archivo .env..."
cat > .env <<EOF
DATABASE_URL="postgresql://jorge:J*rg3.90@localhost:5432/urban-rentals?schema=public"
NEXTAUTH_URL="http://ruta-rentals.com"
NEXTAUTH_SECRET="$(openssl rand -hex 32)"
EOF

# 5. Instalación de Dependencias y Build
echo "Instalando dependencias npm..."
npm install

echo "Ejecutando migraciones de Prisma y generando el cliente..."
npx prisma generate
# Aplicar esquema a la base de datos
npx prisma db push --accept-data-loss || true

echo "Iniciando build de producción..."
npm run build

# 6. Despliegue del Backend (PM2)
echo "Configurando PM2..."
# Detener instancia existente si la hay
pm2 stop sgflota || true
pm2 delete sgflota || true

# Next.js con 'output: standalone' requiere mover la carpeta public y .next/static
if [ -d ".next/standalone" ]; then
    echo "Configurando Next.js standalone..."
    cp -r public .next/standalone/ || true
    cp -r .next/static .next/standalone/.next/ || true
    PORT=3000 pm2 start .next/standalone/server.js --name "sgflota"
else
    echo "Configuración regular de Next.js..."
    pm2 start npm --name "sgflota" -- start
fi

pm2 save
# Generar script de inicio automáticamente
pm2 startup systemd -u root --hp /root || true
pm2 save

# 7. Configuración de Nginx
echo "Configurando Nginx para el dominio ruta-rentals.com..."
cat > /etc/nginx/sites-available/ruta-rentals.com <<EOF
server {
    listen 80;
    server_name ruta-rentals.com www.ruta-rentals.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Habilitar el sitio y deshabilitar el default
ln -sf /etc/nginx/sites-available/ruta-rentals.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/SGflota || true

# Verificar configuración y reiniciar Nginx
nginx -t
systemctl restart nginx

# 8. Seguridad: Firewall (UFW)
echo "Configurando UFW..."
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

echo "================================================="
echo "¡Despliegue finalizado exitosamente!"
echo "Tu sistema debería estar escuchando en: http://ruta-rentals.com"
echo "================================================="

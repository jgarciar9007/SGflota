# Guía de Instalación para Ubuntu Server

Esta guía detalla los pasos para desplegar la aplicación SGFlota en un servidor Ubuntu.

## Requisitos Previos

- Servidor Ubuntu (20.04 o superior recomendado)
- Acceso SSH al servidor
- Node.js v18.17.0 o superior instalado

## Pasos de Instalación

### 1. Instalar Node.js (si no está instalado)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Instalar PM2 (Gestor de Procesos)

PM2 se utiliza para mantener la aplicación ejecutándose en segundo plano.

```bash
sudo npm install -g pm2
```

### 3. Desplegar la Aplicación

1.  Suba el archivo comprimido `sgflota-deploy.tar.gz` a su servidor (por ejemplo, usando `scp` o FileZilla).
2.  Descomprima el archivo:

    ```bash
    tar -xzvf sgflota-deploy.tar.gz
    ```

3.  Entre en el directorio descomprimido:

    ```bash
    cd sgflota-deploy
    ```

### 4. Configurar Variables de Entorno

Cree un archivo `.env` o `.env.local` si su aplicación requiere variables de entorno específicas (como conexión a base de datos, claves de API, etc.).

### 5. Iniciar la Aplicación

Utilice PM2 para iniciar la aplicación:

```bash
pm2 start server.js --name sgflota
```

### 6. Configurar Inicio Automático

Para asegurar que la aplicación se reinicie si el servidor se reinicia:

```bash
pm2 save
pm2 startup
```

Siga las instrucciones que `pm2 startup` muestre en pantalla.

## Verificación

La aplicación debería estar corriendo en el puerto 3000 por defecto. Puede verificarlo con:

```bash
curl http://localhost:3000
```

Si necesita exponerla en el puerto 80, se recomienda configurar Nginx como proxy inverso.

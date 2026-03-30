import paramiko
import tarfile
import os
import sys

HOST = "187.77.163.74"
USER = "root"
PASSWORD = "Herve.2026GE"
REMOTE_DIR = "/var/www/SGflota"
ARCHIVE = "deploy_package.tar.gz"

EXCLUDES = {
    'node_modules', '.next', '.git', '.vscode', '.idea',
    ARCHIVE, '.env', 'jorge-aws.pem', 'scripts/deploy.py',
    'scripts/deploy_ssh.py', 'scripts/check_server.py'
}


def filter_tar(tarinfo):
    name = tarinfo.name.replace("\\", "/")
    if "public/uploads" in name:
        return None
    return tarinfo


def create_archive():
    print("Creando archivo de deploy...")
    with tarfile.open(ARCHIVE, "w:gz") as tar:
        for item in os.listdir('.'):
            if item in EXCLUDES:
                continue
            tar.add(item, filter=filter_tar)
    size_mb = os.path.getsize(ARCHIVE) / 1024 / 1024
    print(f"Archivo creado: {size_mb:.1f} MB")


def run_cmd(client, command, description=""):
    if description:
        print(f"  -> {description}", flush=True)
    _, stdout, stderr = client.exec_command(command, timeout=300, get_pty=False)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if out:
        for line in out.split('\n'):
            print(f"     {line}", flush=True)
    if err and exit_status != 0:
        for line in err.split('\n'):
            print(f"     ERR: {line}", flush=True)
    if exit_status != 0:
        raise Exception(f"Fallo (cod {exit_status}): {command}")
    return out


def deploy():
    create_archive()

    print(f"\nConectando a {HOST}...", flush=True)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    print("Conexion SSH establecida.\n", flush=True)

    try:
        # Upload via SFTP
        print(f"Subiendo {ARCHIVE}...", flush=True)
        sftp = client.open_sftp()
        sftp.put(ARCHIVE, f"/root/{ARCHIVE}")
        sftp.close()
        print("Archivo subido.\n", flush=True)

        # Remote deploy
        steps = [
            (f"tar -xzf /root/{ARCHIVE} -C {REMOTE_DIR}", "Extrayendo archivos"),
            (f"rm /root/{ARCHIVE}", "Limpiando archivo temporal"),
            (f"cd {REMOTE_DIR} && npm install --production=false 2>&1 | tail -3", "Instalando dependencias"),
            (f"cd {REMOTE_DIR} && npx prisma generate 2>&1 | tail -3", "Generando cliente Prisma"),
            (f"cd {REMOTE_DIR} && npm run build 2>&1 | tail -5", "Compilando aplicacion"),
        ]

        for cmd, desc in steps:
            run_cmd(client, cmd, desc)

        # Copy static files for standalone mode
        run_cmd(client,
            f"cp -r {REMOTE_DIR}/.next/static {REMOTE_DIR}/.next/standalone/.next/static && cp -r {REMOTE_DIR}/public {REMOTE_DIR}/.next/standalone/public 2>/dev/null || true",
            "Copiando estaticos al directorio standalone"
        )

        # SQL Migration
        print("  -> Aplicando migracion SQL en produccion", flush=True)
        _, out, err = client.exec_command(
            f"cd {REMOTE_DIR} && export $(cat .env | grep DATABASE_URL | xargs) && DB_CLEAN=$(echo $DATABASE_URL | cut -d'?' -f1) && psql $DB_CLEAN -f scripts/update-production-db.sql 2>&1",
            timeout=60
        )
        out.channel.recv_exit_status()
        sql_out = out.read().decode('utf-8', errors='replace').strip()
        for line in sql_out.split('\n'):
            print(f"     {line}", flush=True)

        # Restart PM2
        run_cmd(client, "pm2 reload sgflota && pm2 save", "Reiniciando PM2")

        print("\n[OK] Deploy completado exitosamente!", flush=True)

    except Exception as e:
        print(f"\n[ERROR] {e}", flush=True)
        sys.exit(1)
    finally:
        client.close()
        if os.path.exists(ARCHIVE):
            os.remove(ARCHIVE)


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    deploy()

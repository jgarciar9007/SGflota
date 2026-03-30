import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.77.163.74', username='root', password='Herve.2026GE', timeout=10)

cmds = [
    'pm2 list --no-color 2>&1 | cat',
    'ls /root/',
    'ls /var/www/ 2>/dev/null || echo "no /var/www"',
    'find /root /var/www -name "package.json" -maxdepth 3 2>/dev/null | head -10',
]

for cmd in cmds:
    print(f'=== {cmd} ===', flush=True)
    _, out, _ = client.exec_command(cmd)
    result = out.read().decode('utf-8', errors='replace').strip()
    print(result, flush=True)
    print()

client.close()

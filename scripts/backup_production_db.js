const { NodeSSH } = require('node-ssh');
const path = require('path');
const fs = require('fs');

const ssh = new NodeSSH();

async function backup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const remoteBackupPath = `/root/backup-urban-rentals-${timestamp}.sql`;
    const localBackupDir = path.join(__dirname, '../backups');
    const localBackupPath = path.join(localBackupDir, `backup-urban-rentals-${timestamp}.sql`);

    if (!fs.existsSync(localBackupDir)) {
        fs.mkdirSync(localBackupDir, { recursive: true });
    }

    try {
        console.log("Connecting to VPS for backup...");
        await ssh.connect({
            host: '187.77.163.74',
            username: 'root',
            password: 'Herve.2026GE',
            readyTimeout: 20000,
        });

        console.log("Creating database dump on server...");
        // Use pg_dump as postgres user
        const dumpResult = await ssh.execCommand(`sudo -u postgres pg_dump "urban-rentals" > ${remoteBackupPath}`);

        if (dumpResult.code !== 0) {
            throw new Error(`Dump failed: ${dumpResult.stderr}`);
        }

        console.log("Downloading backup to local machine...");
        await ssh.getFile(localBackupPath, remoteBackupPath);

        console.log(`Backup saved to: ${localBackupPath}`);

        // Optional: remove remote backup file to save space
        await ssh.execCommand(`rm ${remoteBackupPath}`);
        console.log("Remote temporary backup file removed.");

    } catch (error) {
        console.error("Backup failed!", error);
        process.exit(1);
    } finally {
        ssh.dispose();
    }
}

backup();

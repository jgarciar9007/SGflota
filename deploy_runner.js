const fs = require('fs');
const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

async function run() {
    try {
        console.log("Connecting to VPS...");
        await ssh.connect({
            host: '187.77.163.74',
            username: 'root',
            password: 'Herve.2026GE',
            readyTimeout: 20000,
        });

        console.log("Connected! Uploading script...");
        await ssh.putFile('d:/Proyectos de Programacion/SGFlota/deploy_sgflota.sh', '/root/deploy_sgflota.sh');

        console.log("Executing script...");
        const result = await ssh.execCommand('bash /root/deploy_sgflota.sh', {
            cwd: '/root',
            onStdout(chunk) {
                process.stdout.write(chunk.toString('utf8'));
            },
            onStderr(chunk) {
                process.stderr.write(chunk.toString('utf8'));
            }
        });

        console.log("\n--- Execution Finished ---");
        console.log("Exit Code: " + result.code);

        // Testing database and users
        console.log("\nChecking database...");
        const dbResult = await ssh.execCommand('sudo -u postgres psql -d urban-rentals -c "SELECT email, role FROM \\"User\\";" || sudo -u postgres psql -d urban-rentals -c "SELECT * FROM users;"', { cwd: '/root' });
        console.log("Users in DB:\n" + dbResult.stdout);
        if (dbResult.stderr) {
            console.log("DB Check error:\n" + dbResult.stderr);
        }
    } catch (e) {
        console.error(e);
    } finally {
        ssh.dispose();
    }
}

run();

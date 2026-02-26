const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
async function run() {
    try {
        console.log("Connecting to VPS to check logs...");
        await ssh.connect({
            host: '187.77.163.74', username: 'root', password: 'Herve.2026GE'
        });

        console.log("Fetching PM2 logs...");
        const result = await ssh.execCommand('pm2 logs sgflota --lines 100 --nostream', {
            cwd: '/root',
            onStdout(chunk) { process.stdout.write(chunk.toString('utf8')); },
            onStderr(chunk) { process.stderr.write(chunk.toString('utf8')); }
        });

        console.log("Exit code: " + result.code);
    } catch (e) {
        console.error(e);
    } finally {
        ssh.dispose();
    }
}
run();

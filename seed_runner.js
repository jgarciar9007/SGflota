const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
async function run() {
    try {
        console.log("Connecting to VPS to seed DB...");
        await ssh.connect({
            host: '187.77.163.74', username: 'root', password: 'Herve.2026GE'
        });

        console.log("Seeding database...");
        const seedResult = await ssh.execCommand('npx tsx prisma/seed.ts || npm run seed || npx prisma db seed', {
            cwd: '/var/www/SGflota',
            onStdout(chunk) { process.stdout.write(chunk.toString('utf8')); },
            onStderr(chunk) { process.stderr.write(chunk.toString('utf8')); }
        });

        console.log("Checking database users again...");
        const dbResult = await ssh.execCommand('sudo -u postgres psql -d urban-rentals -c "SELECT email, role FROM \\"User\\";"', { cwd: '/root' });
        console.log("Users in DB:\n" + dbResult.stdout);
    } catch (e) {
        console.error(e);
    } finally {
        ssh.dispose();
    }
}
run();

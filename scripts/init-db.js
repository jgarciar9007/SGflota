
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🔄 Checking database initialization...');

        // Check if ANY admin exists
        const adminCount = await prisma.user.count({
            where: { role: 'Admin' }
        });

        if (adminCount === 0) {
            console.log('⚠️ No admin found. Creating default admin...');

            await prisma.user.create({
                data: {
                    name: 'Jorge Admin',
                    email: 'admin@sgflota.com',
                    role: 'Admin',
                    status: 'Active',
                    password: 'J*rg3.90',
                }
            });

            console.log('✅ Admin created: admin@sgflota.com / J*rg3.90');
        } else {
            console.log('✅ Admin user already exists. Database initialized.');
        }
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        // We don't exit with error to avoid crashing the deployment if DB isn't ready immediately
        // allowing Next.js to start and potentially retry connection later or show error page
    } finally {
        await prisma.$disconnect();
    }
}

main();

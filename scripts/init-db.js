
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🔄 Checking database initialization...');

        // 1. Run migrations
        try {
            console.log('📦 Running database migrations...');
            // In Docker/Prod, this ensures DB structure exists
            // execSync('npx prisma migrate deploy', { stdio: 'inherit' });
            console.log('✅ Migrations check skipped (managed manually).');
        } catch (error) {
            console.error('❌ Error running migrations:', error.message);
        }

        // 2. Check and Create Admin
        try {
            const adminCount = await prisma.user.count({
                where: { role: 'Admin' }
            });

            if (adminCount === 0) {
                console.log('⚠️ No admin found. Running seed...');
                // Uses the seed command from package.json
                execSync('npx prisma db seed', { stdio: 'inherit' });
                console.log('✅ Database seeded (Admin: admin@sgflota.com / J*rg3.90)');
            } else {
                console.log('✅ Admin user already exists. Database initialized.');
            }
        } catch (error) {
            console.error('❌ Error checking/creating admin:', error);
        }

    } catch (error) {
        console.error('❌ Critical error initializing database:', error);
        // Don't exit 1 to allow retry, but log clearly
    } finally {
        await prisma.$disconnect();
    }
}

main();

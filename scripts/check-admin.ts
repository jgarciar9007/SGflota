
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
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
            console.log('✅ Admin user already exists. Skipping creation.');
        }
    } catch (error) {
        console.error('Error checking admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

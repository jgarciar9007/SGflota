const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Reading Settings ---');
        const s1 = await prisma.companySettings.findUnique({ where: { id: 1 } });
        console.log('Current:', s1);

        if (!s1) {
            console.log('No settings found, creating default...');
            await prisma.companySettings.create({
                data: {
                    id: 1,
                    name: "Test Update",
                    address: "Test Address",
                    phone: "123",
                    email: "test@test.com",
                    taxId: "TES123",
                    website: "test.com",
                    logo: ""
                }
            });
            console.log('Created.');
        } else {
            console.log('Settings exist.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

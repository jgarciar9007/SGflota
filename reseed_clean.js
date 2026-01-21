const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("--- Cleaning and Reseeding ---");

    // Clean up dependencies first
    await prisma.payment.deleteMany();
    await prisma.refund.deleteMany();
    await prisma.expense.deleteMany();
    // Then main tables
    await prisma.invoice.deleteMany();
    await prisma.accountPayable.deleteMany();
    await prisma.rental.deleteMany();

    // Find vehicle and client
    const vehicle = await prisma.vehicle.findFirst({ where: { name: { contains: 'BMW' } } });
    const client = await prisma.client.findFirst();

    if (!vehicle || !client) {
        console.error("Missing vehicle or client");
        return;
    }

    console.log(`Using Vehicle: ${vehicle.name}, Client: ${client.name}`);

    // Create a Rental
    const rental = await prisma.rental.create({
        data: {
            vehicleId: vehicle.id,
            clientId: client.id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000 * 3),
            dailyRate: 100000,
            status: "Activo",
            totalAmount: 300000,
        }
    });
    console.log("Rental Created:", rental.id);

    // Create Account Payable MANUALLY to simulate the issue or verify fix
    const ap = await prisma.accountPayable.create({
        data: {
            rentalId: rental.id,
            type: "Propietario",
            beneficiaryName: "Inversiones Clean",
            amount: 240000,
            date: new Date(),
            status: "Pendiente"
        }
    });
    console.log("AP Created:", ap.id);
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

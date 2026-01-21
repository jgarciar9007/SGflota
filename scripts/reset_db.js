
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database reset...');

    // 1. Delete dependent transactional data
    console.log('Deleting Payments...');
    await prisma.payment.deleteMany({});

    console.log('Deleting Refunds...');
    await prisma.refund.deleteMany({});

    console.log('Deleting Driver Payments...');
    await prisma.driverPayment.deleteMany({});

    console.log('Deleting Accounts Payable...');
    await prisma.accountPayable.deleteMany({});

    console.log('Deleting Maintenances...');
    await prisma.maintenance.deleteMany({});

    console.log('Deleting Expenses...');
    await prisma.expense.deleteMany({});

    // 2. Delete Invoices (mid-level dependency)
    console.log('Deleting Invoices...');
    await prisma.invoice.deleteMany({});

    // 3. Delete Rentals (depends on Vehicles, Clients)
    console.log('Deleting Rentals...');
    await prisma.rental.deleteMany({});

    console.log('Deleting Payrolls...');
    await prisma.payroll.deleteMany({});

    // 4. Delete Core Entities (Nomenclators)
    console.log('Deleting Vehicles...');
    await prisma.vehicle.deleteMany({});

    console.log('Deleting Clients...');
    await prisma.client.deleteMany({});

    console.log('Deleting Owners...');
    await prisma.owner.deleteMany({});

    console.log('Deleting Commercial Agents...');
    await prisma.commercialAgent.deleteMany({});

    console.log('Deleting Personnel...');
    await prisma.personnel.deleteMany({});

    console.log('Deleting Expense Categories...');
    await prisma.expenseCategory.deleteMany({});

    console.log('Database reset complete. Users and Company Settings preserved.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

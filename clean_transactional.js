
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🧹 Starting deep cleanup (Preserving Nomenclatures)...')

    // 1. Delete Transactions (Order matters for foreign keys)
    console.log('   - Deleting Payments...')
    await prisma.payment.deleteMany()

    console.log('   - Deleting Refunds...')
    await prisma.refund.deleteMany()

    console.log('   - Deleting Expenses...')
    await prisma.expense.deleteMany()

    console.log('   - Deleting Accounts Payable...')
    await prisma.accountPayable.deleteMany()

    console.log('   - Deleting Invoices...')
    await prisma.invoice.deleteMany()

    console.log('   - Deleting Rentals...')
    await prisma.rental.deleteMany()

    console.log('   - Deleting Maintenance Records...')
    await prisma.maintenance.deleteMany()

    // 2. Delete Operational Data (Fleet)
    console.log('   - Deleting Vehicles (Fleet)...')
    await prisma.vehicle.deleteMany()

    console.log('✅ Cleanup complete!')
    console.log('   PRESERVED: Users, CompanySettings, Clients, Owners, Agents, ExpenseCategories.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

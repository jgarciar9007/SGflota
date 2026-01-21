const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🧹 Starting FULL cleanup (Preserving ONLY Users & Settings)...')

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

    // 2. Delete Fleet & Inventory
    console.log('   - Deleting Vehicles...')
    await prisma.vehicle.deleteMany()

    // 3. Delete Nomenclatures (Clients, Owners, Agents)
    console.log('   - Deleting Clients...')
    await prisma.client.deleteMany()

    console.log('   - Deleting Owners...')
    await prisma.owner.deleteMany()

    console.log('   - Deleting Commercial Agents...')
    await prisma.commercialAgent.deleteMany()

    console.log('   - Deleting Expense Categories...')
    await prisma.expenseCategory.deleteMany()

    console.log('✅ FULL Cleanup complete!')
    console.log('   PRESERVED: Users, CompanySettings.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

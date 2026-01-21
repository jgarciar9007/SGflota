
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Cleaning database...')

    // Delete transactions first (integrity)
    await prisma.payment.deleteMany()
    await prisma.refund.deleteMany()
    await prisma.expense.deleteMany()
    await prisma.accountPayable.deleteMany()

    // Delete main records
    await prisma.invoice.deleteMany()
    await prisma.rental.deleteMany()
    await prisma.maintenance.deleteMany()

    // Delete nomenclatures
    // Note: If you want NEW nomenclatures, we delete old ones.
    await prisma.vehicle.deleteMany()
    await prisma.client.deleteMany()
    await prisma.commercialAgent.deleteMany()
    await prisma.owner.deleteMany()
    await prisma.expenseCategory.deleteMany()

    console.log('Database cleaned (Users and CompanySettings preserved).')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

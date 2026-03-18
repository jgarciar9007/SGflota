import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const actives = await prisma.rental.findMany({
    where: { status: 'Activo' }
  })
  console.log(`There are ${actives.length} active rentals.`)
  actives.forEach(r => {
    console.log(`Rental ID: ${r.id}, Vehicle: ${r.vehicleId}, Start: ${r.startDate}`)
  })
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); })

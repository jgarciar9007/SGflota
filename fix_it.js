const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const plate = 'LT-904-AL'
  const vehicle = await prisma.vehicle.findFirst({ where: { plate } })
  if (vehicle) {
    console.log(`Updating ${vehicle.name} to Disponible`)
    await prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: 'Disponible' } })
  }
  const actives = await prisma.rental.findMany({ where: { status: 'Activo' } })
  console.log(`Active rentals count: ${actives.length}`)
}
main().catch(console.error).finally(() => prisma.$disconnect())

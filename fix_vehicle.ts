import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const plate = 'LT-904-AL'
  const vehicle = await prisma.vehicle.findFirst({
    where: { plate }
  })

  if (vehicle) {
    console.log(`Updating vehicle ${vehicle.name} (${plate}) from ${vehicle.status} to Disponible`)
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { status: 'Disponible' }
    })
    console.log('Done.')
  } else {
    console.log(`Vehicle ${plate} not found.`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

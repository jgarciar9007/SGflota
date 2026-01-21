
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const agents = await prisma.commercialAgent.findMany()
        const seen = new Set()
        let deletedCount = 0

        for (const agent of agents) {
            if (seen.has(agent.dni)) {
                console.log(`Deleting duplicate agent with DNI ${agent.dni} (ID: ${agent.id})`)
                await prisma.commercialAgent.delete({
                    where: { id: agent.id }
                })
                deletedCount++
            } else {
                seen.add(agent.dni)
            }
        }

        console.log(`Finished. Deleted ${deletedCount} duplicate records.`)

    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()

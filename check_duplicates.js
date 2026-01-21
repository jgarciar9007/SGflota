
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const agents = await prisma.commercialAgent.findMany()
        console.log('All Commercial Agents:', JSON.stringify(agents, null, 2))

        // Check for duplicates
        const dnis = agents.map(a => a.dni)
        const duplicates = dnis.filter((item, index) => dnis.indexOf(item) !== index)
        if (duplicates.length > 0) {
            console.log('Duplicate DNIs found:', duplicates)
        } else {
            console.log('No duplicate DNIs found in the current data accessible via Prisma Client.')
        }
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()

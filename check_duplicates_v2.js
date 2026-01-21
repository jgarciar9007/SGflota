
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const agents = await prisma.commercialAgent.findMany()
        const dniCounts = {}
        agents.forEach(a => {
            dniCounts[a.dni] = (dniCounts[a.dni] || 0) + 1
        })

        let found = false
        Object.keys(dniCounts).forEach(dni => {
            if (dniCounts[dni] > 1) {
                console.log(`Duplicate DNI: '${dni}' (Count: ${dniCounts[dni]})`)
                found = true
            }
        })

        if (!found) {
            // If no duplicates in the table, maybe there's a conflict with the *migration* trying to insert seed data?
            console.log("No duplicates found in existing data.")
        }

    } catch (e) {
        console.error(e)
    }
}

main()

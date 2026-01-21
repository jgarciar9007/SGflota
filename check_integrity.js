const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("--- Checking Integrity ---");

    const aps = await prisma.accountPayable.findMany();
    console.log(`Total APs: ${aps.length}`);

    for (const ap of aps) {
        const rental = await prisma.rental.findUnique({
            where: { id: ap.rentalId }
        });
        if (!rental) {
            console.error(`[ORPHAN] AP ${ap.id} has invalid rentalId: ${ap.rentalId}`);

            // Try to fix or delete?
            // For debugging, just listing.
        } else {
            // console.log(`[OK] AP ${ap.id} -> Rental ${rental.id}`);
        }
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

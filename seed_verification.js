
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Seeding Verification Data...");

    // 1. Create a Vehicle
    console.log("   - Creating Vehicle...");
    const vehicle = await prisma.vehicle.create({
        data: {
            name: "Toyota Hilux",
            type: "Pickup",
            range: "Premium",
            price: 25000000,
            image: "https://example.com/hilux.jpg",
            status: "Rentado",
            plate: "AA-123-BB",
            year: 2024,
            ownership: "Propia",
        }
    });

    // 2. Create a Client
    console.log("   - Creating Client...");
    const client = await prisma.client.create({
        data: {
            name: "Empresa Constructora S.A.",
            email: "contacto@constructora.test",
            phone: "+240 222 333 444",
            address: "Malabo II",
            dni: "B-12345678",
        }
    });

    // 3. Create a Rental (Active)
    console.log("   - Creating Active Rental...");
    const rental = await prisma.rental.create({
        data: {
            vehicleId: vehicle.id,
            clientId: client.id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000 * 5), // 5 days
            dailyRate: 100000,
            status: "Activo",
            totalAmount: 500000,
        }
    });

    // 4. Create an Invoice (Pending)
    console.log("   - Creating Pending Invoice...");
    const invoice = await prisma.invoice.create({
        data: {
            invoiceNumber: "INV-2026-001",
            rentalId: rental.id,
            clientId: client.id,
            amount: 500000,
            paidAmount: 0,
            date: new Date(),
            status: "Pendiente",
            rentalDetails: JSON.stringify({
                vehicle: vehicle.name,
                plate: vehicle.plate,
                days: 5,
                startDate: new Date(),
                endDate: new Date(Date.now() + 86400000 * 5)
            })
        }
    });

    // 5. Create an Account Payable (Pending) for Testing Modal
    console.log("   - Creating Account Payable...");
    await prisma.accountPayable.create({
        data: {
            rentalId: rental.id,
            type: "Propia", // Using "Propia" or "Comercial" or "Propietario"
            beneficiaryName: "Taller Mecánico Test",
            amount: 50000,
            date: new Date(),
            status: "Pendiente"
        }
    });

    // 6. Create a Refundable Invoice (Paid) & Refund (Pending) for Testing Refund Modal
    console.log("   - Creating Refundable Scenario...");
    // Refund needs an invoice. Let's create a PAID invoice first.
    const paidInvoice = await prisma.invoice.create({
        data: {
            invoiceNumber: "INV-2026-002",
            clientId: client.id,
            amount: 100000,
            paidAmount: 100000,
            date: new Date(),
            status: "Pagado",
            rentalDetails: JSON.stringify({ note: "Servicio Extra" })
        }
    });

    await prisma.refund.create({
        data: {
            invoiceId: paidInvoice.id,
            clientId: client.id,
            amount: 25000,
            date: new Date(),
            reason: "Devolución de depósito",
            status: "Pendiente"
        }
    });

    console.log("✅ Seed Complete! Ready for Verification.");
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

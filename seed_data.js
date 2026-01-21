
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🔄 Cleaning database...')

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
    await prisma.vehicle.deleteMany()
    await prisma.client.deleteMany()
    await prisma.commercialAgent.deleteMany()
    await prisma.owner.deleteMany()
    await prisma.expenseCategory.deleteMany()

    console.log('✅ Database cleaned (Users and CompanySettings preserved).')
    console.log('🌱 Seeding data...')

    // 1. Expense Categories
    const categories = [
        { name: 'Combustible', description: 'Gasto de combustible' },
        { name: 'Mantenimiento', description: 'Reparaciones y mantenimiento' },
        { name: 'Seguro', description: 'Pago de pólizas' },
        { name: 'Limpieza', description: 'Lavado y limpieza' },
        { name: 'Impuestos', description: 'Tasas e impuestos vehiculares' }
    ]

    for (const cat of categories) {
        await prisma.expenseCategory.create({ data: cat })
    }
    console.log(`   - Created ${categories.length} expense categories`)

    // 2. Owners
    const owners = [
        { name: 'Inversiones García', dni: 'B12345678', phone: '600111222', email: 'contacto@garcia.com', status: 'Activo' },
        { name: 'Flota Privada SL', dni: 'B87654321', phone: '600333444', email: 'admin@flotaprivada.com', status: 'Activo' }
    ]

    for (const owner of owners) {
        await prisma.owner.create({ data: owner })
    }
    console.log(`   - Created ${owners.length} owners`)

    // 3. Commercial Agents
    const agents = [
        { name: 'Carlos Ventas', dni: '12345678A', phone: '600555666', email: 'carlos@agente.com', status: 'Activo' },
        { name: 'Ana Marketing', dni: '87654321B', phone: '600777888', email: 'ana@agente.com', status: 'Activo' }
    ]

    for (const agent of agents) {
        await prisma.commercialAgent.create({ data: agent })
    }
    console.log(`   - Created ${agents.length} commercial agents`)

    // 4. Clients
    const clients = [
        { name: 'Juan Pérez', email: 'juan@cliente.com', phone: '600999000', address: 'Calle Mayor 1', dni: '11111111H' },
        { name: 'Empresa Logística SA', email: 'info@logistica.com', phone: '910000000', address: 'Polígono Industrial Sur, Nave 3', dni: 'A22222222' },
        { name: 'María Gómez', email: 'maria@cliente.com', phone: '600123123', address: 'Av. Libertad 45', dni: '33333333L' }
    ]

    for (const client of clients) {
        await prisma.client.create({ data: client })
    }
    console.log(`   - Created ${clients.length} clients`)

    // 5. Vehicles
    const vehicles = [
        {
            name: 'Toyota Corolla',
            type: 'Sedan',
            range: 'Economy',
            price: 50,
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80',
            status: 'Disponible',
            plate: '1234-ABC',
            year: 2023,
            ownership: 'Propia'
        },
        {
            name: 'BMW X5',
            type: 'SUV',
            range: 'Luxury',
            price: 150,
            image: 'https://images.unsplash.com/photo-1556189250-72ba954e96d5?auto=format&fit=crop&q=80',
            status: 'Disponible',
            plate: '5678-DEF',
            year: 2024,
            ownership: 'Tercero',
            ownerName: 'Inversiones García',
            ownerDni: 'B12345678'
        },
        {
            name: 'Ford Transit',
            type: 'Furgoneta',
            range: 'Standard',
            price: 80,
            image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80',
            status: 'Mantenimiento',
            plate: '9012-GHI',
            year: 2022,
            ownership: 'Propia'
        }
    ]

    for (const vehicle of vehicles) {
        await prisma.vehicle.create({ data: vehicle })
    }
    console.log(`   - Created ${vehicles.length} vehicles`)

    console.log('✨ Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
